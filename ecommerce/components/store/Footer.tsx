import Link from "next/link";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "LUXE";

export default function Footer() {
  return (
    <footer className="border-t border-obsidian/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h3 className="text-xl tracking-[6px] font-light font-serif mb-4">{STORE_NAME}</h3>
          <p className="text-sm text-obsidian/60 leading-relaxed max-w-xs">
            Curated luxury goods from around the world, delivered with care.
          </p>
        </div>

        <div>
          <h4 className="text-xs tracking-[2px] uppercase mb-4">Shop</h4>
          <ul className="space-y-2">
            {["New Arrivals", "Best Sellers", "Sale"].map((item) => (
              <li key={item}>
                <Link
                  href={`/products?category=${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-obsidian/60 hover:text-obsidian transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[2px] uppercase mb-4">Support</h4>
          <ul className="space-y-2">
            {[
              { label: "Shipping & Returns", href: "/shipping" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
              { label: "Privacy Policy", href: "/privacy" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-obsidian/60 hover:text-obsidian transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-obsidian/10 py-6 px-6 text-center">
        <p className="text-xs text-obsidian/40 tracking-[1px]">
          &copy; {new Date().getFullYear()} {STORE_NAME}. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
