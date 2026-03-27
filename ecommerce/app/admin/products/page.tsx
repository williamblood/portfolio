import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: { page?: string };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        supplierPrice: true,
        inStock: true,
        inventoryCount: true,
        images: true,
        priceUpdatedAt: true,
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count(),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-light tracking-wide">Products</h1>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm">{total} products</span>
          <form action="/api/supplier/sync-products" method="POST">
            <button
              type="button"
              onClick={async () => {
                const res = await fetch("/api/supplier/sync-products", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}`,
                  },
                  body: JSON.stringify({ pageNum: 1, pageSize: 50 }),
                });
                const data = await res.json();
                alert(`Synced ${data.synced} products`);
              }}
              className="px-4 py-1.5 text-xs border border-white/20 rounded hover:border-white/40 transition-colors"
            >
              Sync Products
            </button>
          </form>
        </div>
      </div>

      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs">
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Cost</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Margin</th>
              <th className="text-center p-3">Stock</th>
              <th className="text-right p-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((p) => {
              const margin = ((p.price - p.supplierPrice) / p.price * 100).toFixed(0);
              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          width={36}
                          height={36}
                          className="w-9 h-9 object-cover rounded bg-white/10"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-white/10 rounded" />
                      )}
                      <div>
                        <div className="text-white/80 line-clamp-1">{p.name}</div>
                        <div className="text-white/30 text-xs">{p._count.variants} variants</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-white/50">{p.category}</td>
                  <td className="p-3 text-right text-white/50">${p.supplierPrice.toFixed(2)}</td>
                  <td className="p-3 text-right">${p.price.toFixed(2)}</td>
                  <td className="p-3 text-right text-green-400">{margin}%</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        p.inStock
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {p.inStock ? `${p.inventoryCount}` : "Out"}
                    </span>
                  </td>
                  <td className="p-3 text-right text-white/30 text-xs">
                    {new Date(p.priceUpdatedAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-10 text-white/30 text-sm">
            No products yet. Use Sync to import from supplier.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}`}
              className={`w-9 h-9 flex items-center justify-center text-sm border rounded transition-colors ${
                p === page
                  ? "bg-white text-obsidian border-white"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
