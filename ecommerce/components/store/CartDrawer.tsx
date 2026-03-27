"use client";

import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/pricing";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCartStore();

  const total = subtotal();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-obsidian/30 z-40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-ivory z-50 flex flex-col animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-obsidian/10">
          <h2 className="text-xs tracking-[3px] uppercase">
            Cart {items.length > 0 && `(${items.length})`}
          </h2>
          <button onClick={closeCart} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} strokeWidth={1} className="text-obsidian/30" />
              <p className="text-sm text-obsidian/50">Your cart is empty</p>
              <button onClick={closeCart} className="btn-secondary text-xs">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-obsidian/10">
              {items.map((item) => {
                const key = item.variantId ?? item.productId;
                return (
                  <li key={key} className="py-4 flex gap-4">
                    {/* Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="shrink-0"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover bg-obsidian/5"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-obsidian/10" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium line-clamp-2 hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-obsidian/50 mt-0.5">{item.variantName}</p>
                      )}
                      <p className="text-sm mt-1">{formatPrice(item.price)}</p>

                      {/* Quantity */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                          className="w-6 h-6 border border-obsidian/20 flex items-center justify-center hover:border-obsidian transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          className="w-6 h-6 border border-obsidian/20 flex items-center justify-center hover:border-obsidian transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-obsidian/30 hover:text-obsidian transition-colors self-start"
                      aria-label="Remove item"
                    >
                      <X size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-obsidian/10 px-6 py-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-obsidian/60">Subtotal</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-obsidian/40">
              Shipping and taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center block"
            >
              Checkout
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-xs tracking-[2px] uppercase text-obsidian/50 hover:text-obsidian transition-colors py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
