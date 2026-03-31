import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupplierOrderStatus } from "@/lib/supplier";
import { sendShippingNotificationEmail } from "@/lib/email";

function isAdminAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_SECRET;
}

// GET /api/admin/orders/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Optionally fetch live tracking from supplier
  let supplierStatus = null;
  if (order.supplierOrderId) {
    try {
      supplierStatus = await getSupplierOrderStatus(order.supplierOrderId);
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json({ order, supplierStatus });
}

// PATCH /api/admin/orders/[id] — update status, tracking, price override
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, fulfillmentStatus, trackingNumber, trackingUrl, priceOverride, notes } =
    body as {
      status?: string;
      fulfillmentStatus?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      priceOverride?: number;
      notes?: string;
    };

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status: status as never }),
      ...(fulfillmentStatus && { fulfillmentStatus: fulfillmentStatus as never }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(trackingUrl !== undefined && { trackingUrl }),
      ...(priceOverride !== undefined && { priceOverride }),
      ...(notes !== undefined && { notes }),
    },
    include: {
      customer: true,
      items: true,
    },
  });

  // Send shipping notification if tracking added
  if (trackingNumber && order.fulfillmentStatus === "SHIPPED") {
    sendShippingNotificationEmail(
      order as Parameters<typeof sendShippingNotificationEmail>[0],
      trackingNumber,
      trackingUrl ?? undefined
    ).catch((err) => console.error("[admin] shipping email error:", err));
  }

  return NextResponse.json({ order });
}
