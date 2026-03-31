import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Confirmed" };

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true, items: true },
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      {/* Check icon */}
      <div className="w-16 h-16 rounded-full bg-obsidian flex items-center justify-center mx-auto mb-8">
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="font-serif text-3xl font-light mb-3">Order Confirmed</h1>

      {order ? (
        <>
          <p className="text-obsidian/60 mb-2">
            Thank you, {order.customer.firstName}.
          </p>
          <p className="text-obsidian/60 mb-8">
            A confirmation has been sent to{" "}
            <strong>{order.customer.email}</strong>.
          </p>

          <div className="border border-obsidian/10 p-6 text-left mb-8">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-obsidian/50">Order</span>
              <span className="font-medium">#{order.orderNumber}</span>
            </div>
            <ul className="space-y-2 mb-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-obsidian/70">
                    {item.name}{" "}
                    {item.variantName && (
                      <span className="text-obsidian/40">· {item.variantName}</span>
                    )}{" "}
                    × {item.quantity}
                  </span>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-obsidian/10 pt-3 flex justify-between font-medium text-sm">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-obsidian/60 mb-8">
          Your order has been placed. A confirmation email is on its way.
        </p>
      )}

      <Link href="/products" className="btn-primary inline-block">
        Continue Shopping
      </Link>
    </div>
  );
}
