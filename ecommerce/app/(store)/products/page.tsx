import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import SortSelect from "@/components/store/SortSelect";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop All" };
export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ category?: string; q?: string; page?: string; sort?: string }>;
}

const PAGE_SIZE = 20;

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q, page: pageParam, sort } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const orderBy =
    sort === "price-asc"  ? { price: "asc" as const } :
    sort === "price-desc" ? { price: "desc" as const } :
                            { createdAt: "desc" as const };

  const where = {
    inStock: true,
    ...(category && { category }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { tags: { has: q } },
      ],
    }),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: PAGE_SIZE,
      skip,
      select: { id: true, name: true, slug: true, images: true, price: true, compareAtPrice: true, category: true },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({ select: { category: true }, distinct: ["category"] }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const uniqueCategories = categories.map((c) => c.category);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { category, q, sort, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v && !(k === "page" && v === "1")) params.set(k, v);
    }
    const str = params.toString();
    return `/products${str ? `?${str}` : ""}`;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-10 md:pt-14 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 gap-4">
        <div>
          <p className="text-[10px] tracking-[4px] uppercase text-obsidian/40 mb-1">
            {q ? `Search: "${q}"` : "Collection"}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-light">
            {category ?? "All Products"}
          </h1>
          <p className="text-obsidian/40 text-sm mt-1">{total} item{total !== 1 ? "s" : ""}</p>
        </div>

        <SortSelect currentSort={sort} baseHref={buildUrl({})} />
      </div>

      <div className="flex gap-10 xl:gap-16">
        {/* ── Sidebar ── */}
        <aside className="hidden md:block w-44 xl:w-52 shrink-0">
          <div className="sticky top-28">
            <h3 className="text-[10px] tracking-[3px] uppercase text-obsidian/40 mb-5">Categories</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/products"
                  className={`text-sm block transition-colors ${
                    !category
                      ? "font-medium text-obsidian"
                      : "text-obsidian/50 hover:text-obsidian"
                  }`}
                >
                  All
                </a>
              </li>
              {uniqueCategories.map((cat) => (
                <li key={cat}>
                  <a
                    href={buildUrl({ category: cat, page: "1" })}
                    className={`text-sm block transition-colors ${
                      category === cat
                        ? "font-medium text-obsidian"
                        : "text-obsidian/50 hover:text-obsidian"
                    }`}
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 pt-8 border-t border-obsidian/10">
              <h3 className="text-[10px] tracking-[3px] uppercase text-obsidian/40 mb-5">Size</h3>
              <ul className="space-y-3">
                {["10ml", "30ml"].map((size) => (
                  <li key={size}>
                    <a
                      href={buildUrl({ q: size, page: "1" })}
                      className={`text-sm block transition-colors ${
                        q === size
                          ? "font-medium text-obsidian"
                          : "text-obsidian/50 hover:text-obsidian"
                      }`}
                    >
                      {size}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 md:hidden scrollbar-none mb-6">
            <a href="/products" className={`shrink-0 px-4 py-2 border text-xs tracking-wide transition-colors ${!category ? "bg-obsidian text-ivory border-obsidian" : "border-obsidian/20 text-obsidian/60"}`}>
              All
            </a>
            {uniqueCategories.map((cat) => (
              <a
                key={cat}
                href={buildUrl({ category: cat, page: "1" })}
                className={`shrink-0 px-4 py-2 border text-xs tracking-wide transition-colors ${category === cat ? "bg-obsidian text-ivory border-obsidian" : "border-obsidian/20 text-obsidian/60"}`}
              >
                {cat}
              </a>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-obsidian/30 text-sm mb-4">No products found.</p>
              <a href="/products" className="text-xs tracking-[2px] uppercase underline underline-offset-4 text-obsidian/50 hover:text-obsidian transition-colors">
                Clear filters
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 xl:gap-8">
                {products.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-14">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center text-sm border transition-colors ${
                        p === page
                          ? "bg-obsidian text-ivory border-obsidian"
                          : "border-obsidian/20 hover:border-obsidian text-obsidian/60"
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
