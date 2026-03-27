import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PAID: "bg-blue-500/20 text-blue-400",
  PROCESSING: "bg-purple-500/20 text-purple-400",
  SHIPPED: "bg-green-500/20 text-green-400",
  DELIVERED: "bg-green-700/20 text-green-300",
  CANCELLED: "bg-red-500/20 text-red-400",
  REFUNDED: "bg-gray-500/20 text-gray-400",
};

const FULFILLMENT_COLORS: Record<string, string> = {
  UNFULFILLED: "bg-yellow-500/20 text-yellow-400",
  SUBMITTED_TO_SUPPLIER: "bg-blue-500/20 text-blue-400",
  CONFIRMED_BY_SUPPLIER: "bg-purple-500/20 text-purple-400",
  SHIPPED: "bg-green-500/20 text-green-400",
  DELIVERED: "bg-green-700/20 text-green-300",
  FAILED: "bg-red-500/20 text-red-400",
};

interface Props {
  searchParams: { status?: string; page?: string };
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;
  const where = searchParams.status ? { status: searchParams.status as never } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: { customer: true },
    }),
    prisma.order.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-light tracking-wide">Orders</h1>
        <span className="text-white/40 text-sm">{total} total</span>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
          (s) => (
            <Link
              key={s}
              href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                searchParams.status === s || (!searchParams.status && !s)
                  ? "bg-white text-obsidian border-white"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {s || "All"}
            </Link>
          )
        )}
      </div>

      {/* Table */}
      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs">
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Fulfillment</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-mono text-white/80">#{order.orderNumber}</td>
                <td className="p-3 text-white/60">
                  <div>{order.customer.firstName} {order.customer.lastName}</div>
                  <div className="text-white/30 text-xs">{order.customer.email}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[order.status] ?? "bg-white/10"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      FULFILLMENT_COLORS[order.fulfillmentStatus] ?? "bg-white/10"
                    }`}
                  >
                    {order.fulfillmentStatus.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-3 text-right">
                  ${(order.priceOverride ?? order.total).toFixed(2)}
                </td>
                <td className="p-3 text-right text-white/40 text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-10 text-white/30 text-sm">No orders found.</div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?${new URLSearchParams({
                ...(searchParams.status && { status: searchParams.status }),
                page: String(p),
              })}`}
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
