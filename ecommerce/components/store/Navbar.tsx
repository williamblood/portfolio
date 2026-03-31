"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "LUXE";

const NAV_LINKS = [
  { href: "/products", label: "Shop All" },
  { href: "/products?category=Body+Oils", label: "Body Oils" },
  { href: "/products?category=Skincare", label: "Skincare" },
  { href: "/products?category=Home", label: "Home" },
  { href: "/products?category=Gift+Sets", label: "Gift Sets" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toggleCart, itemCount } = useCartStore();
  const count = itemCount();

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/97 backdrop-blur-md border-b border-obsidian/8">
      {/* Top announcement bar */}
      <div className="hidden md:block bg-obsidian text-ivory text-center py-2">
        <p className="text-[10px] tracking-[3px] uppercase">
          Complimentary shipping on orders over $150 · Premium fragrance oils
        </p>
      </div>

      <nav className="max-w-[1400px] mx-auto px-8 h-16 md:h-[72px] flex items-center justify-between gap-6">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1 shrink-0"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop nav — left */}
        <div className="hidden md:flex items-center gap-7 shrink-0">
          {NAV_LINKS.slice(0, 3).map((link) => (
            <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
          ))}
        </div>

        {/* Logo — always centered */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-2xl tracking-[10px] font-light font-serif whitespace-nowrap"
        >
          {STORE_NAME}
        </Link>

        {/* Desktop nav — right */}
        <div className="hidden md:flex items-center gap-7 shrink-0 ml-auto">
          {NAV_LINKS.slice(3).map((link) => (
            <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
          ))}

          {/* Search */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search oils..."
                  className="w-44 border-b border-obsidian/40 bg-transparent text-xs py-1 focus:outline-none focus:border-obsidian placeholder:text-obsidian/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setQuery(""); }}
                  className="text-obsidian/40 hover:text-obsidian"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-obsidian/60 hover:text-obsidian transition-colors"
                aria-label="Search"
              >
                <Search size={17} />
              </button>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 group"
            aria-label="Open cart"
          >
            <ShoppingBag size={17} className="text-obsidian/70 group-hover:text-obsidian transition-colors" />
            {count > 0 ? (
              <span className="text-xs tracking-wide">({count})</span>
            ) : null}
          </button>
        </div>

        {/* Mobile cart icon */}
        <button
          onClick={toggleCart}
          className="md:hidden relative p-1 ml-auto shrink-0"
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
        <div className="md:hidden bg-ivory border-t border-obsidian/10 py-5 px-6 flex flex-col gap-4 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <form onSubmit={handleSearch} className="flex items-center gap-2 border-b border-obsidian/20 pb-1 mt-2">
            <Search size={14} className="text-obsidian/40 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-obsidian/30"
            />
          </form>
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
        "text-[11px] tracking-[2px] uppercase text-obsidian/60 hover:text-obsidian transition-colors"
      )}
    >
      {children}
    </Link>
  );
}
