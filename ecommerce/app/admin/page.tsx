import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalOrders,
    paidOrders,
    pendingFulfillment,
    totalProducts,
    recentOrders,
    syncLogs,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { fulfillmentStatus: "SUBMITTED_TO_SUPPLIER" } }),
    prisma.product.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
    prisma.syncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  // Revenue calculation
  const revenueResult = await prisma.order.aggregate({
    where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    _sum: { total: true },
  });
  const revenue = revenueResult._sum.total ?? 0;

  const stats = [
    { label: "Total Revenue", value: `$${revenue.toFixed(2)}` },
    { label: "Total Orders", value: totalOrders },
    { label: "Paid (Awaiting Ship)", value: paidOrders },
    { label: "Fulfillment Pending", value: pendingFulfillment },
    { label: "Products", value: totalProducts },
  ];

  return (
    <div>
      <h1 className="text-xl font-light tracking-wide mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-white/10 p-4 rounded"
          >
            <p className="text-white/40 text-xs tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-light">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mb-10">
        <h2 className="text-sm tracking-wider text-white/60 mb-4">Recent Orders</h2>
        <div className="border border-white/10 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs">
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <a
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline text-white/80"
                    >
                      #{order.orderNumber}
                    </a>
                  </td>
                  <td className="p-3 text-white/60">
                    {order.customer.firstName} {order.customer.lastName}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-right">${order.total.toFixed(2)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-white/30 text-sm">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync logs */}
      <div>
        <h2 className="text-sm tracking-wider text-white/60 mb-4">Recent Syncs</h2>
        <div className="space-y-2">
          {syncLogs.map((log) => (
            <div
              key={log.id}
              className="border border-white/10 rounded p-3 flex items-center gap-3 text-sm"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  log.status === "success" ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className="text-white/40 text-xs">
                {log.type.replace("_", " ")}
              </span>
              <span className="text-white/70 flex-1">{log.message}</span>
              <span className="text-white/30 text-xs">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {syncLogs.length === 0 && (
            <p className="text-white/30 text-sm">No sync logs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PAID: "bg-blue-500/20 text-blue-400",
    PROCESSING: "bg-purple-500/20 text-purple-400",
    SHIPPED: "bg-green-500/20 text-green-400",
    DELIVERED: "bg-green-700/20 text-green-300",
    CANCELLED: "bg-red-500/20 text-red-400",
    REFUNDED: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        colors[status] ?? "bg-white/10 text-white/60"
      }`}
    >
      {status}
    </span>
  );
}
