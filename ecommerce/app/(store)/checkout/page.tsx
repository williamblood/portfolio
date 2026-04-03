import CheckoutForm from "@/components/store/CheckoutForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-light mb-10">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
