import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailClient from "@/components/admin/OrderDetailClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Detail" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: { include: { product: { select: { name: true, images: true } } } },
    },
  });

  if (!order) notFound();

  return <OrderDetailClient order={JSON.parse(JSON.stringify(order))} />;
}
