"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/pricing";
import type { ShippingAddress } from "@/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#0A0A0A",
      fontFamily: "Inter, system-ui, sans-serif",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#dc2626" },
  },
};

function CheckoutInner() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const total = subtotal();
  const shipping = total >= 150 ? 0 : 9.99;
  const grandTotal = total + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // 1. Create payment intent
      const intentRes = await fetch("/api/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: form,
          shipping,
        }),
      });

      if (!intentRes.ok) {
        const err = await intentRes.json();
        throw new Error(err.error ?? "Failed to create payment intent");
      }

      const { clientSecret, orderId } = await intentRes.json();

      // 2. Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            phone: form.phone,
            address: {
              line1: form.address,
              city: form.city,
              state: form.state,
              postal_code: form.zip,
              country: form.country,
            },
          },
        },
      });

      if (error) throw new Error(error.message);
      if (paymentIntent?.status !== "succeeded") throw new Error("Payment not completed");

      // 3. Clear cart and redirect
      clearCart();
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left: shipping + payment */}
        <div className="md:col-span-2 space-y-8">
          {/* Contact */}
          <section>
            <h2 className="text-xs tracking-[2px] uppercase mb-4">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                className="input-luxury"
              />
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
                className="input-luxury"
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="input-luxury sm:col-span-2"
              />
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="input-luxury sm:col-span-2"
              />
            </div>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="text-xs tracking-[2px] uppercase mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address"
                required
                className="input-luxury sm:col-span-2"
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="input-luxury"
              />
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State / Province"
                required
                className="input-luxury"
              />
              <input
                name="zip"
                value={form.zip}
                onChange={handleChange}
                placeholder="ZIP / Postal code"
                required
                className="input-luxury"
              />
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                className="input-luxury"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="text-xs tracking-[2px] uppercase mb-4">Payment</h2>
            <div className="border border-obsidian/20 px-4 py-4">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            <p className="text-xs text-obsidian/40 mt-2 flex items-center gap-1">
              <span>🔒</span> Secured by Stripe. We never store card details.
            </p>
          </section>
        </div>

        {/* Right: order summary */}
        <div className="bg-white border border-obsidian/10 p-6 h-fit">
          <h2 className="text-xs tracking-[2px] uppercase mb-6">Order Summary</h2>

          <ul className="space-y-3 mb-6">
            {items.map((item) => (
              <li
                key={item.variantId ?? item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-obsidian/70 line-clamp-1 flex-1 mr-2">
                  {item.name}
                  {item.variantName && (
                    <span className="text-obsidian/40"> · {item.variantName}</span>
                  )}
                  <span className="text-obsidian/40"> × {item.quantity}</span>
                </span>
                <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-obsidian/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-obsidian/60">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-obsidian/60">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>

          <div className="border-t border-obsidian/10 mt-3 pt-3 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>

          <button
            type="submit"
            disabled={loading || !stripe || items.length === 0}
            className="btn-primary w-full mt-6"
          >
            {loading ? "Processing..." : `Pay ${formatPrice(grandTotal)}`}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function CheckoutForm() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  );
}
