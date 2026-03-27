import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";

export const revalidate = 3600; // revalidate every hour

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      compareAtPrice: true,
    },
  });
}

async function getCategories() {
  const products = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    take: 4,
  });
  return products.map((p) => p.category);
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-end bg-obsidian overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/20 to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80')",
          }}
        />
        <div className="relative z-20 max-w-7xl mx-auto px-6 pb-20 w-full">
          <p className="text-ivory/60 text-xs tracking-[4px] uppercase mb-4 animate-fade-in">
            New Collection
          </p>
          <h1 className="text-ivory font-serif text-5xl md:text-7xl font-light leading-tight mb-8 animate-slide-up">
            Refined
            <br />
            <em>Essentials</em>
          </h1>
          <Link href="/products" className="btn-primary inline-block animate-slide-up">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-xs tracking-[3px] uppercase text-obsidian/50 mb-10 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="group relative aspect-square overflow-hidden bg-obsidian/5"
              >
                <div className="absolute inset-0 bg-obsidian/20 group-hover:bg-obsidian/30 transition-colors z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="text-white text-xs tracking-[3px] uppercase font-medium">
                    {category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xs tracking-[3px] uppercase text-obsidian/50">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-xs tracking-[2px] uppercase underline underline-offset-4 text-obsidian/60 hover:text-obsidian transition-colors"
          >
            View All
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-obsidian/40 text-sm">
              Products are being loaded. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Values */}
      <section className="bg-obsidian text-ivory py-20 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { title: "Curated Quality", desc: "Every piece selected for its craftsmanship and design." },
            { title: "Free Shipping", desc: "Complimentary shipping on all orders over $150." },
            { title: "Easy Returns", desc: "30-day hassle-free returns on all items." },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-sm tracking-[3px] uppercase font-light mb-3">{item.title}</h3>
              <p className="text-ivory/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
