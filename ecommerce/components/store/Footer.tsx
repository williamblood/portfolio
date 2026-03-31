import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "LUXE";

export default function Footer() {
  return (
    <footer className="border-t border-obsidian/10 mt-24 bg-ivory">
      <div className="max-w-[1400px] mx-auto px-8 py-16 md:py-24 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-2xl tracking-[8px] font-light font-serif mb-4">{STORE_NAME}</h3>
          <p className="text-sm text-obsidian/50 leading-relaxed max-w-[200px]">
            Premium fragrance oils inspired by the world's most iconic scents.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-[10px] tracking-[3px] uppercase text-obsidian/40 mb-5">Shop</h4>
          <ul className="space-y-3">
            {[
              { label: "All Products", href: "/products" },
              { label: "Body Oils", href: "/products?category=Body+Oils" },
              { label: "Skincare", href: "/products?category=Skincare" },
              { label: "Home", href: "/products?category=Home" },
              { label: "Gift Sets", href: "/products?category=Gift+Sets" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-obsidian/55 hover:text-obsidian transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-[10px] tracking-[3px] uppercase text-obsidian/40 mb-5">Support</h4>
          <ul className="space-y-3">
            {[
              { label: "Shipping & Returns", href: "/shipping" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact Us", href: "/contact" },
              { label: "Track Order", href: "/track" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-obsidian/55 hover:text-obsidian transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-[10px] tracking-[3px] uppercase text-obsidian/40 mb-5">Stay in Touch</h4>
          <p className="text-sm text-obsidian/50 mb-4 leading-relaxed">
            New arrivals and exclusive offers delivered to your inbox.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-obsidian/10">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-obsidian/35 tracking-[1px]">
            &copy; {new Date().getFullYear()} {STORE_NAME}. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service"].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-[10px] text-obsidian/35 hover:text-obsidian/60 transition-colors tracking-[1px]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
