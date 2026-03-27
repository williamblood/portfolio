"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";

interface Props {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  compareAtPrice?: number | null;
}

export default function ProductCard({ name, slug, images, price, compareAtPrice }: Props) {
  const image = images[0];
  const hoverImage = images[1];

  return (
    <Link href={`/products/${slug}`} className="group block">
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-obsidian/5 mb-4">
        {image ? (
          <>
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${name} alternate view`}
                fill
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-obsidian/10 flex items-center justify-center">
            <span className="text-obsidian/20 text-xs tracking-widest">NO IMAGE</span>
          </div>
        )}

        {compareAtPrice && compareAtPrice > price && (
          <span className="absolute top-3 left-3 bg-obsidian text-ivory text-[10px] tracking-[1px] px-2 py-1 uppercase">
            Sale
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:underline underline-offset-2">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm">{formatPrice(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-obsidian/40 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
