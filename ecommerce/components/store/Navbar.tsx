"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "LUXE";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, itemCount } = useCartStore();
  const count = itemCount();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-obsidian/10">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/products">Shop</NavLink>
          <NavLink href="/products?category=new">New Arrivals</NavLink>
          <NavLink href="/products?category=sale">Sale</NavLink>
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-xl tracking-[8px] font-light font-serif"
        >
          {STORE_NAME}
        </Link>

        {/* Cart */}
        <button
          onClick={toggleCart}
          className="relative p-1 ml-auto md:ml-0"
          aria-label="Open cart"
        >
          <ShoppingBag size={20} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-obsidian text-ivory text-[10px] flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ivory border-t border-obsidian/10 py-4 px-6 flex flex-col gap-4 animate-fade-in">
          <NavLink href="/products" onClick={() => setMobileOpen(false)}>Shop</NavLink>
          <NavLink href="/products?category=new" onClick={() => setMobileOpen(false)}>New Arrivals</NavLink>
          <NavLink href="/products?category=sale" onClick={() => setMobileOpen(false)}>Sale</NavLink>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-xs tracking-[2px] uppercase text-obsidian/70 hover:text-obsidian transition-colors"
      )}
    >
      {children}
    </Link>
  );
}
