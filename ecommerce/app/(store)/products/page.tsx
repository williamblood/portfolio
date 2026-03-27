import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop All" };
export const revalidate = 3600;

interface Props {
  searchParams: { category?: string; q?: string; page?: string };
}

const PAGE_SIZE = 20;

export default async function ProductsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    inStock: true,
    ...(searchParams.category && { category: searchParams.category }),
    ...(searchParams.q && {
      OR: [
        { name: { contains: searchParams.q, mode: "insensitive" as const } },
        { description: { contains: searchParams.q, mode: "insensitive" as const } },
        { tags: { has: searchParams.q } },
      ],
    }),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        compareAtPrice: true,
        category: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const uniqueCategories = categories.map((c) => c.category);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-light mb-2">
          {searchParams.category ?? "All Products"}
        </h1>
        <p className="text-obsidian/50 text-sm">{total} items</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar filters */}
        <aside className="w-full md:w-48 shrink-0">
          <h3 className="text-xs tracking-[2px] uppercase mb-4">Categories</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/products"
                className={`text-sm ${!searchParams.category ? "font-medium" : "text-obsidian/60 hover:text-obsidian"}`}
              >
                All
              </a>
            </li>
            {uniqueCategories.map((cat) => (
              <li key={cat}>
                <a
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  className={`text-sm ${searchParams.category === cat ? "font-medium" : "text-obsidian/60 hover:text-obsidian"}`}
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-obsidian/40 text-sm">No products found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {products.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/products?${new URLSearchParams({
                        ...(searchParams.category && { category: searchParams.category }),
                        ...(searchParams.q && { q: searchParams.q }),
                        page: String(p),
                      })}`}
                      className={`w-10 h-10 flex items-center justify-center text-sm border transition-colors ${
                        p === page
                          ? "bg-obsidian text-ivory border-obsidian"
                          : "border-obsidian/20 hover:border-obsidian"
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
