import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyMarkup } from "@/lib/pricing";

// GET /api/admin/seed?secret=YOUR_ADMIN_SECRET
// One-time route to seed demo products — safe to call multiple times (upsert).

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = [
    {
      supplierProductId: "bo-001",
      name: "Black Oud & Vanilla Body Oil",
      slug: "black-oud-vanilla-body-oil",
      description: "A rich, enveloping body oil inspired by the iconic dark oriental fragrance. Deep black coffee and anise open over a heart of jasmine, warming into a base of rich oud, white musk, and cedarwood. Long-lasting and deeply moisturising.",
      images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80", "https://images.unsplash.com/photo-1547887538-047f814d1803?w=800&q=80"],
      supplierPrice: 4.80, price: applyMarkup(4.80), compareAtPrice: 24.00,
      category: "Body Oils", tags: ["oud", "vanilla", "oriental", "body oil"], inStock: true, inventoryCount: 120,
      variants: [
        { supplierVariantId: "bo-001-10ml", name: "Size", value: "10ml", supplierPrice: 4.80, price: applyMarkup(4.80), inventoryCount: 60 },
        { supplierVariantId: "bo-001-30ml", name: "Size", value: "30ml", supplierPrice: 8.50, price: applyMarkup(8.50), inventoryCount: 60 },
      ],
    },
    {
      supplierProductId: "bo-002",
      name: "Flower Bomb Nectar Body Oil",
      slug: "flower-bomb-nectar-body-oil",
      description: "A luxuriously sweet and intoxicating body oil. An explosion of jasmine sambac, rose, and orange blossom over a warm musk base. Leaves skin silky, scented, and glowing.",
      images: ["https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80", "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80"],
      supplierPrice: 4.20, price: applyMarkup(4.20), compareAtPrice: 22.00,
      category: "Body Oils", tags: ["floral", "jasmine", "rose", "body oil"], inStock: true, inventoryCount: 95,
      variants: [
        { supplierVariantId: "bo-002-10ml", name: "Size", value: "10ml", supplierPrice: 4.20, price: applyMarkup(4.20), inventoryCount: 50 },
        { supplierVariantId: "bo-002-30ml", name: "Size", value: "30ml", supplierPrice: 7.80, price: applyMarkup(7.80), inventoryCount: 45 },
      ],
    },
    {
      supplierProductId: "bo-003",
      name: "Baccarat Rouge 540 Body Oil",
      slug: "baccarat-rouge-540-body-oil",
      description: "The most coveted fragrance of modern perfumery translated into a silky body oil. Saffron and jasmine shimmer above a magnetic ambery cedar and ambergris accord. Ambiguous, luminous, unforgettable.",
      images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80", "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80"],
      supplierPrice: 6.50, price: applyMarkup(6.50), compareAtPrice: 30.00,
      category: "Body Oils", tags: ["saffron", "amber", "cedar", "niche", "unisex", "body oil"], inStock: true, inventoryCount: 80,
      variants: [
        { supplierVariantId: "bo-003-10ml", name: "Size", value: "10ml", supplierPrice: 6.50, price: applyMarkup(6.50), inventoryCount: 40 },
        { supplierVariantId: "bo-003-30ml", name: "Size", value: "30ml", supplierPrice: 11.00, price: applyMarkup(11.00), inventoryCount: 40 },
      ],
    },
    {
      supplierProductId: "bo-004",
      name: "Good Girl Body Oil",
      slug: "good-girl-body-oil",
      description: "Bold and seductive — almond blossom and jasmine from above, dark roasted tonka bean and cocoa from below. Worn close to the skin for an intimate, all-day scent trail.",
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80", "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80"],
      supplierPrice: 4.50, price: applyMarkup(4.50), compareAtPrice: null,
      category: "Body Oils", tags: ["tonka", "jasmine", "almond", "gourmand", "body oil"], inStock: true, inventoryCount: 75,
      variants: [
        { supplierVariantId: "bo-004-10ml", name: "Size", value: "10ml", supplierPrice: 4.50, price: applyMarkup(4.50), inventoryCount: 38 },
        { supplierVariantId: "bo-004-30ml", name: "Size", value: "30ml", supplierPrice: 8.00, price: applyMarkup(8.00), inventoryCount: 37 },
      ],
    },
    {
      supplierProductId: "bo-005",
      name: "Lost Cherry Body Oil",
      slug: "lost-cherry-body-oil",
      description: "Opulent and decadent — dark cherry liqueur, blooming Turkish rose, and bitter almond. A plush, velvety dry-down of sandalwood, musk, and precious woods.",
      images: ["https://images.unsplash.com/photo-1616334434524-40d88a8a10a2?w=800&q=80", "https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=800&q=80"],
      supplierPrice: 6.20, price: applyMarkup(6.20), compareAtPrice: 28.00,
      category: "Body Oils", tags: ["cherry", "rose", "sandalwood", "niche", "body oil"], inStock: true, inventoryCount: 60,
      variants: [
        { supplierVariantId: "bo-005-10ml", name: "Size", value: "10ml", supplierPrice: 6.20, price: applyMarkup(6.20), inventoryCount: 30 },
        { supplierVariantId: "bo-005-30ml", name: "Size", value: "30ml", supplierPrice: 10.80, price: applyMarkup(10.80), inventoryCount: 30 },
      ],
    },
    {
      supplierProductId: "bo-006",
      name: "Oud for Greatness Body Oil",
      slug: "oud-for-greatness-body-oil",
      description: "Expansive and commanding — a powerful oud-forward body oil with cypriol, saffron, and patchouli. Warm animalic musk grounds the composition.",
      images: ["https://images.unsplash.com/photo-1547887537-69a8c2fffac8?w=800&q=80"],
      supplierPrice: 7.00, price: applyMarkup(7.00), compareAtPrice: null,
      category: "Body Oils", tags: ["oud", "saffron", "patchouli", "unisex", "body oil"], inStock: true, inventoryCount: 50,
      variants: [
        { supplierVariantId: "bo-006-10ml", name: "Size", value: "10ml", supplierPrice: 7.00, price: applyMarkup(7.00), inventoryCount: 25 },
        { supplierVariantId: "bo-006-30ml", name: "Size", value: "30ml", supplierPrice: 12.50, price: applyMarkup(12.50), inventoryCount: 25 },
      ],
    },
    {
      supplierProductId: "bo-007",
      name: "Tobacco Vanille Body Oil",
      slug: "tobacco-vanille-body-oil",
      description: "Warm, rich, and indulgent — tobacco leaf, vanilla, and spice. Tonka bean and woody notes anchor the sweetness for a sophisticated, long-lasting finish.",
      images: ["https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80"],
      supplierPrice: 5.20, price: applyMarkup(5.20), compareAtPrice: null,
      category: "Body Oils", tags: ["tobacco", "vanilla", "tonka", "oriental", "unisex", "body oil"], inStock: true, inventoryCount: 90,
      variants: [
        { supplierVariantId: "bo-007-10ml", name: "Size", value: "10ml", supplierPrice: 5.20, price: applyMarkup(5.20), inventoryCount: 45 },
        { supplierVariantId: "bo-007-30ml", name: "Size", value: "30ml", supplierPrice: 9.20, price: applyMarkup(9.20), inventoryCount: 45 },
      ],
    },
    {
      supplierProductId: "bo-008",
      name: "Soleil Blanc Body Oil",
      slug: "soleil-blanc-body-oil",
      description: "Sunlit and effortless — cardamom, ylang-ylang, and coconut milk into a warm, skin-like drydown of white musk and sandalwood. A vacation in a bottle.",
      images: ["https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80"],
      supplierPrice: 4.90, price: applyMarkup(4.90), compareAtPrice: 22.00,
      category: "Body Oils", tags: ["coconut", "ylang-ylang", "musk", "summer", "unisex", "body oil"], inStock: true, inventoryCount: 70,
      variants: [
        { supplierVariantId: "bo-008-10ml", name: "Size", value: "10ml", supplierPrice: 4.90, price: applyMarkup(4.90), inventoryCount: 35 },
        { supplierVariantId: "bo-008-30ml", name: "Size", value: "30ml", supplierPrice: 8.80, price: applyMarkup(8.80), inventoryCount: 35 },
      ],
    },
    {
      supplierProductId: "bo-009",
      name: "Jazz Club Body Oil",
      slug: "jazz-club-body-oil",
      description: "Dim lights, leather stools, and a late-night glass of rum — captured in a body oil. Opens with pink pepper and neroli, settling into a dark heart of tobacco leaf, vetiver, and lush oakmoss. A slow, lingering dry-down of musk and vanilla.",
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80", "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80"],
      supplierPrice: 5.80, price: applyMarkup(5.80), compareAtPrice: 26.00,
      category: "Body Oils", tags: ["tobacco", "vetiver", "oakmoss", "musk", "unisex", "body oil", "woody"], inStock: true, inventoryCount: 85,
      variants: [
        { supplierVariantId: "bo-009-10ml", name: "Size", value: "10ml", supplierPrice: 5.80, price: applyMarkup(5.80), inventoryCount: 45 },
        { supplierVariantId: "bo-009-30ml", name: "Size", value: "30ml", supplierPrice: 10.20, price: applyMarkup(10.20), inventoryCount: 40 },
      ],
    },
    {
      supplierProductId: "sk-001",
      name: "24K Gold Radiance Facial Oil",
      slug: "24k-gold-radiance-facial-oil",
      description: "A luxurious facial oil enriched with 24K gold particles, rosehip, and argan oil. Brightens the complexion, visibly firms skin, and delivers deep nourishment.",
      images: ["https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80"],
      supplierPrice: 9.50, price: applyMarkup(9.50), compareAtPrice: 42.00,
      category: "Skincare", tags: ["gold", "facial oil", "radiance", "anti-ageing", "skincare"], inStock: true, inventoryCount: 45,
      variants: [{ supplierVariantId: "sk-001-30ml", name: "Size", value: "30ml", supplierPrice: 9.50, price: applyMarkup(9.50), inventoryCount: 45 }],
    },
    {
      supplierProductId: "sk-002",
      name: "Rose & Hyaluronic Glow Serum",
      slug: "rose-hyaluronic-glow-serum",
      description: "A featherlight serum layering hydration with Bulgarian rose water and triple-weight hyaluronic acid. Smooths fine lines, plumps the skin, and imparts lasting luminosity.",
      images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80"],
      supplierPrice: 7.00, price: applyMarkup(7.00), compareAtPrice: null,
      category: "Skincare", tags: ["rose", "hyaluronic acid", "serum", "hydration", "skincare"], inStock: true, inventoryCount: 55,
      variants: [{ supplierVariantId: "sk-002-30ml", name: "Size", value: "30ml", supplierPrice: 7.00, price: applyMarkup(7.00), inventoryCount: 55 }],
    },
    {
      supplierProductId: "cn-001",
      name: "Mahogany & Amber Soy Candle",
      slug: "mahogany-amber-soy-candle",
      description: "Hand-poured 100% soy wax candle. Opens with warm mahogany and spiced amber, settling into sandalwood and vanilla. 45-hour burn time. Reusable glass vessel.",
      images: ["https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&q=80"],
      supplierPrice: 8.00, price: applyMarkup(8.00), compareAtPrice: 36.00,
      category: "Home", tags: ["candle", "soy", "amber", "mahogany", "home fragrance"], inStock: true, inventoryCount: 38,
      variants: [{ supplierVariantId: "cn-001-200g", name: "Size", value: "200g", supplierPrice: 8.00, price: applyMarkup(8.00), inventoryCount: 38 }],
    },
    {
      supplierProductId: "cn-002",
      name: "Oud & Sandalwood Reed Diffuser",
      slug: "oud-sandalwood-reed-diffuser",
      description: "A sophisticated reed diffuser with layers of rare oud, warm sandalwood, and earthy vetiver. Includes 8 rattan reeds, lasts up to 3 months.",
      images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80"],
      supplierPrice: 10.00, price: applyMarkup(10.00), compareAtPrice: null,
      category: "Home", tags: ["reed diffuser", "oud", "sandalwood", "home fragrance"], inStock: true, inventoryCount: 28,
      variants: [],
    },
    {
      supplierProductId: "gs-001",
      name: "Signature Body Oil Discovery Set",
      slug: "signature-body-oil-discovery-set",
      description: "Our most beloved body oils in a gift-ready box. Includes five 10ml oils: Black Oud & Vanilla, Baccarat Rouge 540, Lost Cherry, Tobacco Vanille, and Soleil Blanc.",
      images: ["https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80"],
      supplierPrice: 18.00, price: applyMarkup(18.00), compareAtPrice: 75.00,
      category: "Gift Sets", tags: ["gift set", "discovery", "body oil", "gift", "bestseller"], inStock: true, inventoryCount: 30,
      variants: [],
    },
    {
      supplierProductId: "gs-002",
      name: "Oud Rituals Gift Set",
      slug: "oud-rituals-gift-set",
      description: "A curated collection for the oud lover. Includes 30ml Black Oud & Vanilla, 30ml Oud for Greatness, and an Oud & Sandalwood reed diffuser in a luxe matte black box.",
      images: ["https://images.unsplash.com/photo-1547887538-047f814d1803?w=800&q=80"],
      supplierPrice: 22.00, price: applyMarkup(22.00), compareAtPrice: 98.00,
      category: "Gift Sets", tags: ["gift set", "oud", "luxury", "gift"], inStock: true, inventoryCount: 20,
      variants: [],
    },
  ];

  let seeded = 0;
  for (const { variants, ...product } of products) {
    await prisma.product.upsert({
      where: { supplierProductId: product.supplierProductId },
      update: { ...product, priceUpdatedAt: new Date(), variants: { deleteMany: {}, create: variants } },
      create: { ...product, variants: { create: variants } },
    });
    seeded++;
  }

  return NextResponse.json({
    success: true,
    seeded,
    message: `${seeded} products seeded successfully.`,
  });
}
