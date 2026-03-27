"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
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
  const { addItem } = useCartStore();

  const displayPrice = selectedVariant?.price ?? product.price;

  // Group variants by name
  const variantGroups = product.variants.reduce<Record<string, Variant[]>>(
    (acc, v) => {
      if (!acc[v.name]) acc[v.name] = [];
      acc[v.name].push(v);
      return acc;
    },
    {}
  );

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant
        ? `${selectedVariant.name}: ${selectedVariant.value}`
        : undefined,
      image: product.images[0],
      price: displayPrice,
      quantity: 1,
      slug: product.slug,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-obsidian/5">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-obsidian/10" />
            )}

            {/* Prev/Next */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                  disabled={activeImage === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setActiveImage((i) =>
                      Math.min(product.images.length - 1, i + 1)
                    )
                  }
                  disabled={activeImage === product.images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 relative border-2 transition-colors ${
                    i === activeImage ? "border-obsidian" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`View ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="py-4">
          <p className="text-xs tracking-[2px] uppercase text-obsidian/40 mb-3">
            {product.category}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-light leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xl">{formatPrice(displayPrice)}</span>
            {product.compareAtPrice && product.compareAtPrice > displayPrice && (
              <span className="text-obsidian/40 line-through text-lg">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Variants */}
          {Object.entries(variantGroups).map(([groupName, variants]) => (
            <div key={groupName} className="mb-6">
              <p className="text-xs tracking-[2px] uppercase mb-3">
                {groupName}:{" "}
                <span className="font-medium text-obsidian">
                  {selectedVariant?.name === groupName
                    ? selectedVariant.value
                    : ""}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.inventoryCount === 0}
                    className={`px-4 py-2 text-sm border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      selectedVariant?.id === v.id
                        ? "bg-obsidian text-ivory border-obsidian"
                        : "border-obsidian/30 hover:border-obsidian"
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="btn-primary w-full flex items-center justify-center gap-3 mb-4"
          >
            <ShoppingBag size={16} />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          <hr className="border-obsidian/10 my-8" />

          {/* Description */}
          <div className="prose prose-sm text-obsidian/70 leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs border border-obsidian/20 px-3 py-1 text-obsidian/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xs tracking-[3px] uppercase text-obsidian/50 mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
