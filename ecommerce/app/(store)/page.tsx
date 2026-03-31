import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import MarqueeStrip from "@/components/store/MarqueeStrip";

export const revalidate = 3600;

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, name: true, slug: true, images: true, price: true, compareAtPrice: true },
  });
}

async function getCategories() {
  const rows = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    take: 4,
  });
  return rows.map((r) => r.category);
}

const CATEGORY_IMAGES: Record<string, string> = {
  "Body Oils": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
  "Skincare":  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
  "Home":      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&q=80",
  "Gift Sets": "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80",
};

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-end bg-obsidian overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[8s]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85')" }}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/75 via-obsidian/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 pb-16 md:pb-24 w-full">
          <p className="text-ivory/50 text-[10px] md:text-xs tracking-[5px] uppercase mb-5 animate-fade-in">
            New Collection — 2026
          </p>
          <h1 className="text-ivory font-serif text-5xl md:text-7xl lg:text-8xl xl:text-[96px] font-light leading-[1.05] mb-8 animate-slide-up max-w-3xl">
            Scent as
            <br />
            <em>Second Skin</em>
          </h1>
          <p className="text-ivory/60 text-sm md:text-base leading-relaxed mb-10 max-w-md animate-slide-up hidden md:block">
            Inspired by the world's most iconic fragrances — translated into pure, long-wearing body oils.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/products" className="btn-primary animate-slide-up">
              Shop the Collection
            </Link>
            <Link
              href="/products?category=Gift+Sets"
              className="text-ivory/70 hover:text-ivory text-xs tracking-[2px] uppercase underline underline-offset-4 transition-colors animate-slide-up hidden md:inline"
            >
              Gift Sets
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-ivory/30">
          <span className="text-[9px] tracking-[3px] uppercase rotate-90 mb-2">Scroll</span>
          <div className="w-px h-12 bg-ivory/20 relative overflow-hidden">
            <div className="absolute top-0 w-full h-1/2 bg-ivory/60 animate-[scroll-line_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ── Marquee strip ────────────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── Editorial split — top seller ─────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden bg-obsidian/5 order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=900&q=85"
              alt="Baccarat Rouge 540 Body Oil"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 md:order-2 md:pl-8">
            <p className="text-[10px] tracking-[4px] uppercase text-obsidian/40 mb-4">Bestseller</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6">
              Baccarat Rouge
              <br />
              <em>540</em>
            </h2>
            <p className="text-obsidian/60 leading-relaxed mb-8 max-w-md text-sm md:text-base">
              The most coveted fragrance of modern perfumery — saffron, jasmine, and magnetic ambery cedar — captured in a silky, skin-loving body oil.
            </p>
            <div className="flex items-center gap-6 mb-8">
              <span className="text-2xl font-light">$24.99</span>
              <span className="text-obsidian/40 line-through">$30.00</span>
            </div>
            <Link href="/products/baccarat-rouge-540-body-oil" className="btn-primary inline-block">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-8 py-12 md:py-20">
          <h2 className="text-[10px] tracking-[4px] uppercase text-obsidian/40 mb-10 md:mb-14 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {categories.map((category) => {
              const img = CATEGORY_IMAGES[category];
              return (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-obsidian/5"
                >
                  {img && (
                    <Image
                      src={img}
                      alt={category}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-obsidian/30 group-hover:bg-obsidian/45 transition-colors duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                    <span className="text-white text-[11px] tracking-[3px] uppercase font-medium">
                      {category}
                    </span>
                    <span className="text-white/50 text-[10px] tracking-[1px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Featured products ────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-8 py-12 md:py-20">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="text-[10px] tracking-[4px] uppercase text-obsidian/40 mb-2">
              The Collection
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light">
              Featured Oils
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[11px] tracking-[2px] uppercase border-b border-obsidian/30 hover:border-obsidian pb-0.5 transition-colors hidden md:inline-block"
          >
            View All
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-obsidian/40 text-sm text-center py-20">
            Products loading. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7 xl:gap-10">
            {featured.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10 md:hidden">
          <Link href="/products" className="btn-secondary inline-block">
            View All Products
          </Link>
        </div>
      </section>

      {/* ── Brand values ─────────────────────────────────────────────────────── */}
      <section className="bg-obsidian text-ivory mt-16">
        <div className="max-w-[1400px] mx-auto px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x divide-white/10">
          {[
            { title: "Inspired by Icons", desc: "Every oil crafted to capture the DNA of the world's most beloved fragrances." },
            { title: "Free Shipping", desc: "Complimentary delivery on all orders over $150, worldwide." },
            { title: "Easy Returns", desc: "30-day no-questions returns. Your satisfaction is guaranteed." },
          ].map((item) => (
            <div key={item.title} className="md:px-12 text-center md:text-left">
              <h3 className="text-[11px] tracking-[3px] uppercase font-light mb-3 text-white/70">{item.title}</h3>
              <p className="text-ivory/40 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Secondary editorial ──────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-8 py-20 md:py-28 hidden md:block">
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              title: "Jazz Club",
              sub: "Tobacco · Vetiver · Musk",
              img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
              href: "/products/jazz-club-body-oil",
            },
            {
              title: "Lost Cherry",
              sub: "Cherry · Rose · Sandalwood",
              img: "https://images.unsplash.com/photo-1616334434524-40d88a8a10a2?w=600&q=80",
              href: "/products/lost-cherry-body-oil",
            },
            {
              title: "Oud for Greatness",
              sub: "Oud · Saffron · Patchouli",
              img: "https://images.unsplash.com/photo-1547887537-69a8c2fffac8?w=600&q=80",
              href: "/products/oud-for-greatness-body-oil",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-serif text-xl font-light mb-1">{item.title}</p>
                <p className="text-white/50 text-[11px] tracking-[1px]">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
