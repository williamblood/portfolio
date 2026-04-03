/**
 * CJ Dropshipping API integration
 * Docs: https://developers.cjdropshipping.com/
 *
 * All supplier references are internal only — never exposed to the customer.
 */

import axios from "axios";
import { applyMarkup } from "./pricing";

const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

let _accessToken: string | null = null;
let _tokenExpiry: number = 0;

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function getCJAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  const res = await axios.post(`${CJ_BASE_URL}/authentication/getAccessToken`, {
    email: process.env.CJ_EMAIL,
    password: process.env.CJ_PASSWORD,
  });

  if (res.data.result !== true) {
    throw new Error(`CJ Auth failed: ${res.data.message}`);
  }

  _accessToken = res.data.data.accessToken as string;
  // tokens expire in 24h; refresh 30 min early
  _tokenExpiry = Date.now() + 23.5 * 60 * 60 * 1000;
  return _accessToken;
}

async function cjGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const token = await getCJAccessToken();
  const res = await axios.get(`${CJ_BASE_URL}${path}`, {
    params,
    headers: { "CJ-Access-Token": token },
  });
  if (!res.data.result) throw new Error(`CJ API error: ${res.data.message}`);
  return res.data.data as T;
}

async function cjPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getCJAccessToken();
  const res = await axios.post(`${CJ_BASE_URL}${path}`, body, {
    headers: { "CJ-Access-Token": token, "Content-Type": "application/json" },
  });
  if (!res.data.result) throw new Error(`CJ API error: ${res.data.message}`);
  return res.data.data as T;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CJProduct {
  pid: string;
  productNameEn: string;
  productImage: string;
  productWeight: number;
  sellPrice: number;
  categoryName: string;
  productSku: string;
  variants: CJVariant[];
  productImages?: string[];
  description?: string;
}

export interface CJVariant {
  vid: string;
  productSku: string;
  variantName: string;
  variantValue: string;
  variantSellPrice: number;
  variantStock: number;
  variantImage?: string;
}

export interface CJOrderResponse {
  orderId: string;
  orderNum: string;
  status: string;
}

// ─── Product Sync ───────────────────────────────────────────────────────────

export async function fetchCJProducts(
  pageNum = 1,
  pageSize = 50,
  categoryId?: string
): Promise<{ list: CJProduct[]; total: number }> {
  const data = await cjGet<{ list: CJProduct[]; total: number }>(
    "/product/list",
    {
      pageNum,
      pageSize,
      ...(categoryId && { categoryId }),
    }
  );
  return data;
}

export async function fetchCJProductDetail(pid: string): Promise<CJProduct> {
  const data = await cjGet<CJProduct>("/product/query", { pid });
  return data;
}

/** Normalize a CJ product into our internal format */
export function normalizeCJProduct(cj: CJProduct) {
  const slug = cj.productNameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);

  return {
    supplierProductId: cj.pid,
    name: sanitizeProductName(cj.productNameEn),
    slug: `${slug}-${cj.pid.slice(-6)}`,
    description: sanitizeDescription(cj.description ?? cj.productNameEn),
    images: [cj.productImage, ...(cj.productImages ?? [])].filter(Boolean),
    supplierPrice: cj.sellPrice,
    price: applyMarkup(cj.sellPrice),
    category: cj.categoryName,
    tags: [cj.categoryName],
    inStock: true,
    inventoryCount: cj.variants.reduce((sum, v) => sum + (v.variantStock ?? 0), 0),
    variants: cj.variants.map((v) => ({
      supplierVariantId: v.vid,
      name: v.variantName,
      value: v.variantValue,
      supplierPrice: v.variantSellPrice,
      price: applyMarkup(v.variantSellPrice),
      inventoryCount: v.variantStock,
      sku: v.productSku,
    })),
  };
}

// ─── Order Placement ─────────────────────────────────────────────────────────

export interface SupplierOrderPayload {
  orderNumber: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    supplierProductId: string;
    supplierVariantId?: string;
    quantity: number;
  }>;
}

export async function placeSupplierOrder(
  payload: SupplierOrderPayload
): Promise<CJOrderResponse> {
  const products = payload.items.map((item) => ({
    vid: item.supplierVariantId ?? item.supplierProductId,
    quantity: item.quantity,
  }));

  const body = {
    orderNumber: payload.orderNumber,
    shippingCountry: payload.shippingAddress.country,
    shippingZip: payload.shippingAddress.zip,
    shippingPhone: payload.shippingAddress.phone,
    shippingName: payload.shippingAddress.name,
    shippingAddress: payload.shippingAddress.address,
    shippingCity: payload.shippingAddress.city,
    shippingProvince: payload.shippingAddress.state,
    products,
    remark: "", // no supplier references in remarks
  };

  return cjPost<CJOrderResponse>("/shopping/order/createOrder", body);
}

export async function getSupplierOrderStatus(orderId: string) {
  return cjGet<{ status: string; trackingNumber?: string; trackingUrl?: string }>(
    "/shopping/order/getOrderDetail",
    { orderId }
  );
}

// ─── Sanitization ───────────────────────────────────────────────────────────

/** Remove supplier brand references from product names */
function sanitizeProductName(name: string): string {
  const suppressed = [/\bcj\b/gi, /\baliexpress\b/gi, /\balibaba\b/gi, /\bwholesale\b/gi];
  let clean = name;
  for (const pattern of suppressed) {
    clean = clean.replace(pattern, "");
  }
  return clean.trim().replace(/\s+/g, " ");
}

/** Remove supplier references from descriptions */
function sanitizeDescription(desc: string): string {
  const suppressed = [
    /\bcj dropshipping\b/gi,
    /\baliexpress\b/gi,
    /\balibaba\b/gi,
    /\bwholesale\b/gi,
    /\bsupplier\b/gi,
    /\bdropship\b/gi,
  ];
  let clean = desc;
  for (const pattern of suppressed) {
    clean = clean.replace(pattern, "");
  }
  return clean.trim();
}
