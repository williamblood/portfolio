"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/pricing";
import ProductCard from "./ProductCard";
import type { Product, Variant } from "@prisma/client";

interface Props {
  product: Product & { variants: Variant[] };
  related: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    compareAtPrice?: number | null;
  }[];
}

export default function ProductDetail({ product, related }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] ?? null
  );
  const [activeImage, setActiveImage] = useState(0);
  const [descOpen, setDescOpen] = useState(true);
  const { addItem } = useCartStore();

  const displayPrice = selectedVariant?.price ?? product.price;

  const variantGroups = product.variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined,
      image: product.images[0],
      price: displayPrice,
      quantity: 1,
      slug: product.slug,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-8 md:pt-12 pb-20">
      {/* Breadcrumb */}
      <nav className="text-[11px] tracking-wide text-obsidian/40 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-obsidian transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-obsidian transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-obsidian/70 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_60px_1fr] gap-8 md:gap-10 xl:gap-0">

        {/* ── Image gallery (desktop: thumbnail rail + main; mobile: single + dots) ── */}
        <div className="flex gap-4">
          {/* Thumbnail rail — desktop only */}
          {product.images.length > 1 && (
            <div className="hidden md:flex flex-col gap-2 w-16 xl:w-[72px] shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square w-full border-2 overflow-hidden transition-colors shrink-0 ${
                    i === activeImage ? "border-obsidian" : "border-transparent hover:border-obsidian/30"
                  }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="72px" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1">
            <div
              className="relative overflow-hidden bg-obsidian/5 cursor-zoom-in"
              style={{ aspectRatio: "4/5" }}
            >
              {product.images[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 600px"
                />
              ) : (
                <div className="w-full h-full bg-obsidian/10" />
              )}
            </div>

            {/* Mobile dot navigation */}
            {product.images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === activeImage ? "bg-obsidian" : "bg-obsidian/20"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Spacer on xl ── */}
        <div className="hidden xl:block" />

        {/* ── Product info (sticky on desktop) ── */}
        <div>
          <div className="md:sticky md:top-28">
            <p className="text-[10px] tracking-[4px] uppercase text-obsidian/40 mb-3">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl xl:text-5xl font-light leading-tight mb-5">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-2xl font-light">{formatPrice(displayPrice)}</span>
              {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                <span className="text-obsidian/35 line-through text-lg">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                <span className="text-[10px] tracking-wide bg-obsidian text-ivory px-2 py-0.5">
                  SALE
                </span>
              )}
            </div>

            {/* Variants */}
            {Object.entries(variantGroups).map(([groupName, variants]) => (
              <div key={groupName} className="mb-6">
                <p className="text-[11px] tracking-[2px] uppercase mb-3 text-obsidian/60">
                  {groupName}:&nbsp;
                  <span className="text-obsidian font-medium">
                    {variants.find((v) => v.id === selectedVariant?.id)?.value ?? ""}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.inventoryCount === 0}
                      className={`px-5 py-2.5 text-sm border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        selectedVariant?.id === v.id
                          ? "bg-obsidian text-ivory border-obsidian"
                          : "border-obsidian/25 hover:border-obsidian text-obsidian"
                      }`}
                    >
                      {v.value}
                      {v.inventoryCount === 0 && (
                        <span className="ml-1 text-[10px] opacity-60">sold out</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="btn-primary w-full flex items-center justify-center gap-3 mb-4 mt-2"
            >
              <ShoppingBag size={15} />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <p className="text-center text-[10px] tracking-wide text-obsidian/35 mb-8">
              Free shipping on orders over $150
            </p>

            <hr className="border-obsidian/10" />

            {/* Description accordion */}
            <div className="border-b border-obsidian/10">
              <button
                onClick={() => setDescOpen((v) => !v)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="text-[11px] tracking-[2px] uppercase">Description</span>
                <ChevronDown
                  size={14}
                  className={`text-obsidian/40 transition-transform duration-200 ${descOpen ? "rotate-180" : ""}`}
                />
              </button>
              {descOpen && (
                <p className="text-obsidian/65 text-sm leading-relaxed pb-5">
                  {product.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="pt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-[11px] border border-obsidian/15 px-3 py-1 text-obsidian/40 tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="mt-24 md:mt-32 border-t border-obsidian/10 pt-14">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-[4px] uppercase text-obsidian/40 mb-1">More Like This</p>
              <h2 className="font-serif text-2xl md:text-3xl font-light">You May Also Like</h2>
            </div>
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-[11px] tracking-[2px] uppercase border-b border-obsidian/30 hover:border-obsidian pb-0.5 transition-colors hidden md:inline-block"
            >
              View Category
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7 xl:gap-10">
            {related.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
