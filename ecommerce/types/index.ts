export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  image?: string;
  price: number;
  quantity: number;
  slug: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CheckoutFormData extends ShippingAddress {
  cardNumber?: string; // handled by Stripe Elements
}

export interface ProductWithVariants {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  compareAtPrice?: number | null;
  category: string;
  tags: string[];
  inStock: boolean;
  inventoryCount: number;
  variants: {
    id: string;
    name: string;
    value: string;
    price: number;
    inventoryCount: number;
  }[];
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentStatus: string;
  total: number;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  supplierOrderId?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}
