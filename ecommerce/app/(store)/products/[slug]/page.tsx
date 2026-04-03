import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/store/ProductDetail";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true },
  });
  if (!product) return { title: "Not Found" };
  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });

  if (!product) notFound();

  // Fetch related products
  const related = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
      inStock: true,
    },
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      compareAtPrice: true,
    },
  });

  return <ProductDetail product={product} related={related} />;
}
