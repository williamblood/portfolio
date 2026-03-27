"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const total = subtotal();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-light mb-10">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-obsidian/40">Your cart is empty.</p>
          <Link href="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Items */}
          <div className="md:col-span-2">
            <ul className="divide-y divide-obsidian/10">
              {items.map((item) => {
                const key = item.variantId ?? item.productId;
                return (
                  <li key={key} className="py-6 flex gap-6">
                    <Link href={`/products/${item.slug}`} className="shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={128}
                          className="w-24 h-32 object-cover bg-obsidian/5"
                        />
                      ) : (
                        <div className="w-24 h-32 bg-obsidian/10" />
                      )}
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-medium hover:underline"
                          >
                            {item.name}
                          </Link>
                          {item.variantName && (
                            <p className="text-sm text-obsidian/50 mt-1">{item.variantName}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-obsidian/30 hover:text-obsidian transition-colors shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variantId)
                            }
                            className="w-8 h-8 border border-obsidian/20 flex items-center justify-center hover:border-obsidian transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variantId)
                            }
                            className="w-8 h-8 border border-obsidian/20 flex items-center justify-center hover:border-obsidian transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Order summary */}
          <div className="bg-white border border-obsidian/10 p-6 h-fit">
            <h2 className="text-xs tracking-[2px] uppercase mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-obsidian/60">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian/60">Shipping</span>
                <span>{total >= 150 ? "Free" : formatPrice(9.99)}</span>
              </div>
              <div className="flex justify-between text-obsidian/40 text-xs">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-obsidian/10 mt-4 pt-4 flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(total >= 150 ? total : total + 9.99)}</span>
            </div>

            <Link href="/checkout" className="btn-primary w-full text-center block mt-6">
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block text-center text-xs text-obsidian/50 hover:text-obsidian mt-4 tracking-[1px]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
