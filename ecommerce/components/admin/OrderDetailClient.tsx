"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = [
  "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];
const FULFILLMENT_STATUSES = [
  "UNFULFILLED", "SUBMITTED_TO_SUPPLIER", "CONFIRMED_BY_SUPPLIER", "SHIPPED", "DELIVERED", "FAILED",
];

interface OrderItem {
  id: string;
  name: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentStatus: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  priceOverride?: number | null;
  notes?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  supplierOrderId?: string | null;
  supplierOrderRef?: string | null;
  stripePaymentIntentId?: string | null;
  shippingAddress: Record<string, string>;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string; phone?: string | null };
  items: OrderItem[];
}

export default function OrderDetailClient({ order: initial }: { order: Order }) {
  const router = useRouter();
  const [order, setOrder] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    trackingNumber: order.trackingNumber ?? "",
    trackingUrl: order.trackingUrl ?? "",
    priceOverride: order.priceOverride != null ? String(order.priceOverride) : "",
    notes: order.notes ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "",
        },
        body: JSON.stringify({
          status: form.status,
          fulfillmentStatus: form.fulfillmentStatus,
          trackingNumber: form.trackingNumber || null,
          trackingUrl: form.trackingUrl || null,
          priceOverride: form.priceOverride ? parseFloat(form.priceOverride) : null,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update order");
      const data = await res.json();
      setOrder((prev) => ({ ...prev, ...data.order }));
      toast.success("Order updated");
      router.refresh();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const addr = order.shippingAddress;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-light">Order #{order.orderNumber}</h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-white text-obsidian text-sm rounded hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <section className="border border-white/10 rounded p-5">
            <h2 className="text-xs tracking-wider text-white/40 mb-4">Items</h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="text-white/80">{item.name}</span>
                    {item.variantName && (
                      <span className="text-white/40"> · {item.variantName}</span>
                    )}
                    <span className="text-white/40"> × {item.quantity}</span>
                  </div>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 mt-4 pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-white">
                <span>Total</span>
                <span>${(order.priceOverride ?? order.total).toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Fulfillment */}
          <section className="border border-white/10 rounded p-5">
            <h2 className="text-xs tracking-wider text-white/40 mb-4">Fulfillment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Order Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Fulfillment Status</label>
                <select
                  value={form.fulfillmentStatus}
                  onChange={(e) => setForm((f) => ({ ...f, fulfillmentStatus: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded"
                >
                  {FULFILLMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Tracking Number</label>
                <input
                  value={form.trackingNumber}
                  onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded"
                  placeholder="e.g. 1Z999AA10123456784"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Tracking URL</label>
                <input
                  value={form.trackingUrl}
                  onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded"
                  placeholder="https://..."
                />
              </div>
            </div>

            {order.supplierOrderId && (
              <div className="mt-4 p-3 bg-white/5 rounded text-xs text-white/40">
                <p>Internal Order Ref: <span className="font-mono text-white/60">{order.supplierOrderRef}</span></p>
              </div>
            )}
          </section>

          {/* Price override + notes */}
          <section className="border border-white/10 rounded p-5">
            <h2 className="text-xs tracking-wider text-white/40 mb-4">Admin Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Price Override ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.priceOverride}
                  onChange={(e) => setForm((f) => ({ ...f, priceOverride: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded"
                  placeholder={`Default: ${order.total.toFixed(2)}`}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-white/40 block mb-1">Internal Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 text-sm rounded resize-none"
                placeholder="Internal notes (not visible to customer)"
              />
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer */}
          <section className="border border-white/10 rounded p-5">
            <h2 className="text-xs tracking-wider text-white/40 mb-3">Customer</h2>
            <p className="text-sm text-white/80">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-sm text-white/50">{order.customer.email}</p>
            {order.customer.phone && (
              <p className="text-sm text-white/50">{order.customer.phone}</p>
            )}
          </section>

          {/* Shipping address */}
          <section className="border border-white/10 rounded p-5">
            <h2 className="text-xs tracking-wider text-white/40 mb-3">Shipping Address</h2>
            <address className="text-sm text-white/60 not-italic leading-relaxed">
              {addr.name}<br />
              {addr.address}<br />
              {addr.city}, {addr.state} {addr.zip}<br />
              {addr.country}
            </address>
          </section>

          {/* Payment */}
          {order.stripePaymentIntentId && (
            <section className="border border-white/10 rounded p-5">
              <h2 className="text-xs tracking-wider text-white/40 mb-3">Payment</h2>
              <p className="text-xs font-mono text-white/40 break-all">
                {order.stripePaymentIntentId}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
