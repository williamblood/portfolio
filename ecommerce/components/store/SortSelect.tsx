"use client";

import { useRouter } from "next/navigation";

interface Props {
  currentSort?: string;
  baseHref: string; // base path + existing params except sort/page
}

export default function SortSelect({ currentSort, baseHref }: Props) {
  const router = useRouter();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(baseHref.split("?")[1] ?? "");
    params.delete("sort");
    params.delete("page");
    if (value) params.set("sort", value);
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-[10px] tracking-[2px] uppercase text-obsidian/40 shrink-0">Sort</label>
      <div className="relative">
        <select
          className="appearance-none border border-obsidian/20 px-4 py-2 text-xs tracking-wide bg-transparent pr-8 focus:outline-none focus:border-obsidian cursor-pointer"
          value={currentSort ?? ""}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/40 text-[10px]">▾</span>
      </div>
    </div>
  );
}
