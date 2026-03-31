import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Products inspired by designer & niche fragrances — sold as premium body oils.
// Names describe the scent profile / clone inspiration, not the original brand.
const products = [
  // ─── Body Oils ──────────────────────────────────────────────────────────────
  {
    supplierProductId: "bo-001",
    name: "Black Oud & Vanilla Body Oil",
    slug: "black-oud-vanilla-body-oil",
    description:
      "A rich, enveloping body oil inspired by the iconic dark oriental fragrance. Deep black coffee and anise open over a heart of jasmine, warming into a base of rich oud, white musk, and cedarwood. Long-lasting and deeply moisturising.",
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      "https://images.unsplash.com/photo-1547887538-047f814d1803?w=800&q=80",
    ],
    supplierPrice: 4.80,
    price: 18.99,
    compareAtPrice: 24.00,
    category: "Body Oils",
    tags: ["oud", "vanilla", "oriental", "fragrance oil", "body oil"],
    inStock: true,
    inventoryCount: 120,
    variants: [
      { supplierVariantId: "bo-001-10ml", name: "Size", value: "10ml", supplierPrice: 4.80, price: 18.99, inventoryCount: 60 },
      { supplierVariantId: "bo-001-30ml", name: "Size", value: "30ml", supplierPrice: 8.50, price: 29.99, inventoryCount: 60 },
    ],
  },
  {
    supplierProductId: "bo-002",
    name: "Flower Bomb Nectar Body Oil",
    slug: "flower-bomb-nectar-body-oil",
    description:
      "A luxuriously sweet and intoxicating body oil inspired by the iconic floral explosive fragrance. An explosion of jasmine sambac, rose, and orange blossom over a warm musk base. Leaves skin silky, scented, and glowing.",
    images: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
    ],
    supplierPrice: 4.20,
    price: 16.99,
    compareAtPrice: 22.00,
    category: "Body Oils",
    tags: ["floral", "jasmine", "rose", "body oil", "feminine"],
    inStock: true,
    inventoryCount: 95,
    variants: [
      { supplierVariantId: "bo-002-10ml", name: "Size", value: "10ml", supplierPrice: 4.20, price: 16.99, inventoryCount: 50 },
      { supplierVariantId: "bo-002-30ml", name: "Size", value: "30ml", supplierPrice: 7.80, price: 27.99, inventoryCount: 45 },
    ],
  },
  {
    supplierProductId: "bo-003",
    name: "Baccarat Rouge 540 Body Oil",
    slug: "baccarat-rouge-540-body-oil",
    description:
      "The most coveted fragrance of modern perfumery translated into a silky body oil. Saffron and jasmine shimmer above a magnetic ambery cedar and ambergris accord. Ambiguous, luminous, unforgettable.",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80",
    ],
    supplierPrice: 6.50,
    price: 24.99,
    compareAtPrice: 30.00,
    category: "Body Oils",
    tags: ["saffron", "amber", "cedar", "niche", "unisex", "body oil"],
    inStock: true,
    inventoryCount: 80,
    variants: [
      { supplierVariantId: "bo-003-10ml", name: "Size", value: "10ml", supplierPrice: 6.50, price: 24.99, inventoryCount: 40 },
      { supplierVariantId: "bo-003-30ml", name: "Size", value: "30ml", supplierPrice: 11.00, price: 38.99, inventoryCount: 40 },
    ],
  },
  {
    supplierProductId: "bo-004",
    name: "Good Girl Body Oil",
    slug: "good-girl-body-oil",
    description:
      "Bold and seductive — a duality of light and dark in a single oil. Almond blossom and jasmine from above, dark roasted tonka bean and cocoa from below. Worn close to the skin for an intimate, all-day scent trail.",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80",
    ],
    supplierPrice: 4.50,
    price: 17.99,
    compareAtPrice: null,
    category: "Body Oils",
    tags: ["tonka", "jasmine", "almond", "gourmand", "feminine", "body oil"],
    inStock: true,
    inventoryCount: 75,
    variants: [
      { supplierVariantId: "bo-004-10ml", name: "Size", value: "10ml", supplierPrice: 4.50, price: 17.99, inventoryCount: 38 },
      { supplierVariantId: "bo-004-30ml", name: "Size", value: "30ml", supplierPrice: 8.00, price: 28.99, inventoryCount: 37 },
    ],
  },
  {
    supplierProductId: "bo-005",
    name: "Lost Cherry Body Oil",
    slug: "lost-cherry-body-oil",
    description:
      "Opulent and decadent — a body oil soaked in dark cherry liqueur, blooming Turkish rose, and bitter almond. A plush, velvety dry-down of sandalwood, musk, and precious woods makes this one impossible to forget.",
    images: [
      "https://images.unsplash.com/photo-1616334434524-40d88a8a10a2?w=800&q=80",
      "https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=800&q=80",
    ],
    supplierPrice: 6.20,
    price: 23.99,
    compareAtPrice: 28.00,
    category: "Body Oils",
    tags: ["cherry", "rose", "sandalwood", "gourmand", "niche", "body oil"],
    inStock: true,
    inventoryCount: 60,
    variants: [
      { supplierVariantId: "bo-005-10ml", name: "Size", value: "10ml", supplierPrice: 6.20, price: 23.99, inventoryCount: 30 },
      { supplierVariantId: "bo-005-30ml", name: "Size", value: "30ml", supplierPrice: 10.80, price: 36.99, inventoryCount: 30 },
    ],
  },
  {
    supplierProductId: "bo-006",
    name: "Oud for Greatness Body Oil",
    slug: "oud-for-greatness-body-oil",
    description:
      "Expansive and commanding — a powerful oud-forward body oil with notes of cypriol, saffron, and patchouli. Warm animalic musk grounds the composition. Inspired by niche Middle Eastern perfumery traditions.",
    images: [
      "https://images.unsplash.com/photo-1547887537-69a8c2fffac8?w=800&q=80",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
    ],
    supplierPrice: 7.00,
    price: 26.99,
    compareAtPrice: null,
    category: "Body Oils",
    tags: ["oud", "saffron", "patchouli", "unisex", "arabic", "body oil"],
    inStock: true,
    inventoryCount: 50,
    variants: [
      { supplierVariantId: "bo-006-10ml", name: "Size", value: "10ml", supplierPrice: 7.00, price: 26.99, inventoryCount: 25 },
      { supplierVariantId: "bo-006-30ml", name: "Size", value: "30ml", supplierPrice: 12.50, price: 42.99, inventoryCount: 25 },
    ],
  },
  {
    supplierProductId: "bo-007",
    name: "Tobacco Vanille Body Oil",
    slug: "tobacco-vanille-body-oil",
    description:
      "Warm, rich, and indulgent — this body oil captures the legendary oriental warmth of tobacco leaf, vanilla, and spice. Tonka bean and woody notes anchor the sweetness for a sophisticated, long-lasting finish.",
    images: [
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80",
      "https://images.unsplash.com/photo-1603031539602-9c267b8c3a65?w=800&q=80",
    ],
    supplierPrice: 5.20,
    price: 19.99,
    compareAtPrice: null,
    category: "Body Oils",
    tags: ["tobacco", "vanilla", "tonka", "oriental", "unisex", "body oil"],
    inStock: true,
    inventoryCount: 90,
    variants: [
      { supplierVariantId: "bo-007-10ml", name: "Size", value: "10ml", supplierPrice: 5.20, price: 19.99, inventoryCount: 45 },
      { supplierVariantId: "bo-007-30ml", name: "Size", value: "30ml", supplierPrice: 9.20, price: 31.99, inventoryCount: 45 },
    ],
  },
  {
    supplierProductId: "bo-008",
    name: "Soleil Blanc Body Oil",
    slug: "soleil-blanc-body-oil",
    description:
      "Sunlit and effortless — this radiant body oil blends cardamom, ylang-ylang, and coconut milk into a warm, skin-like drydown of white musk and sandalwood. A vacation in a bottle.",
    images: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    ],
    supplierPrice: 4.90,
    price: 18.99,
    compareAtPrice: 22.00,
    category: "Body Oils",
    tags: ["coconut", "ylang-ylang", "musk", "summer", "unisex", "body oil"],
    inStock: true,
    inventoryCount: 70,
    variants: [
      { supplierVariantId: "bo-008-10ml", name: "Size", value: "10ml", supplierPrice: 4.90, price: 18.99, inventoryCount: 35 },
      { supplierVariantId: "bo-008-30ml", name: "Size", value: "30ml", supplierPrice: 8.80, price: 29.99, inventoryCount: 35 },
    ],
  },

  // ─── Skincare ───────────────────────────────────────────────────────────────
  {
    supplierProductId: "sk-001",
    name: "24K Gold Radiance Facial Oil",
    slug: "24k-gold-radiance-facial-oil",
    description:
      "A luxurious facial oil enriched with 24K gold particles, rosehip, and argan oil. Brightens the complexion, visibly firms skin, and delivers deep nourishment. Apply 2–3 drops to clean skin morning or evening.",
    images: [
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80",
      "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=800&q=80",
    ],
    supplierPrice: 9.50,
    price: 34.99,
    compareAtPrice: 42.00,
    category: "Skincare",
    tags: ["gold", "facial oil", "radiance", "anti-ageing", "skincare"],
    inStock: true,
    inventoryCount: 45,
    variants: [
      { supplierVariantId: "sk-001-30ml", name: "Size", value: "30ml", supplierPrice: 9.50, price: 34.99, inventoryCount: 45 },
    ],
  },
  {
    supplierProductId: "sk-002",
    name: "Rose & Hyaluronic Glow Serum",
    slug: "rose-hyaluronic-glow-serum",
    description:
      "A featherlight serum that layers hydration with the skin-refining power of Bulgarian rose water and triple-weight hyaluronic acid. Smooths fine lines, plumps the skin, and imparts a lasting luminosity.",
    images: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
    ],
    supplierPrice: 7.00,
    price: 26.99,
    compareAtPrice: null,
    category: "Skincare",
    tags: ["rose", "hyaluronic acid", "serum", "hydration", "skincare"],
    inStock: true,
    inventoryCount: 55,
    variants: [
      { supplierVariantId: "sk-002-30ml", name: "Size", value: "30ml", supplierPrice: 7.00, price: 26.99, inventoryCount: 55 },
    ],
  },

  // ─── Home & Candles ─────────────────────────────────────────────────────────
  {
    supplierProductId: "cn-001",
    name: "Mahogany & Amber Soy Candle",
    slug: "mahogany-amber-soy-candle",
    description:
      "Hand-poured in small batches from 100% soy wax, this candle opens with warm mahogany and spiced amber before settling into a base of sandalwood and vanilla. 45-hour burn time. Reusable glass vessel.",
    images: [
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&q=80",
      "https://images.unsplash.com/photo-1603905830680-f06a2d99e4ae?w=800&q=80",
    ],
    supplierPrice: 8.00,
    price: 29.99,
    compareAtPrice: 36.00,
    category: "Home",
    tags: ["candle", "soy", "amber", "mahogany", "home fragrance"],
    inStock: true,
    inventoryCount: 38,
    variants: [
      { supplierVariantId: "cn-001-200g", name: "Size", value: "200g", supplierPrice: 8.00, price: 29.99, inventoryCount: 38 },
    ],
  },
  {
    supplierProductId: "cn-002",
    name: "Oud & Sandalwood Reed Diffuser",
    slug: "oud-sandalwood-reed-diffuser",
    description:
      "A sophisticated reed diffuser that gently perfumes any room with layers of rare oud, warm sandalwood, and earthy vetiver. Includes 8 rattan reeds and lasts up to 3 months. Minimal glass bottle design.",
    images: [
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80",
      "https://images.unsplash.com/photo-1547887537-69a8c2fffac8?w=800&q=80",
    ],
    supplierPrice: 10.00,
    price: 36.99,
    compareAtPrice: null,
    category: "Home",
    tags: ["reed diffuser", "oud", "sandalwood", "home fragrance"],
    inStock: true,
    inventoryCount: 28,
    variants: [],
  },

  // ─── Gift Sets ───────────────────────────────────────────────────────────────
  {
    supplierProductId: "gs-001",
    name: "Signature Body Oil Discovery Set",
    slug: "signature-body-oil-discovery-set",
    description:
      "Our most beloved body oils presented in a gift-ready box. Includes five 10ml oils: Black Oud & Vanilla, Baccarat Rouge 540, Lost Cherry, Tobacco Vanille, and Soleil Blanc. The perfect introduction to the collection.",
    images: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    supplierPrice: 18.00,
    price: 59.99,
    compareAtPrice: 75.00,
    category: "Gift Sets",
    tags: ["gift set", "discovery", "body oil", "gift", "bestseller"],
    inStock: true,
    inventoryCount: 30,
    variants: [],
  },
  {
    supplierProductId: "gs-002",
    name: "Oud Rituals Gift Set",
    slug: "oud-rituals-gift-set",
    description:
      "A curated collection for the oud lover. Includes a 30ml Black Oud & Vanilla body oil, 30ml Oud for Greatness body oil, and an Oud & Sandalwood reed diffuser — presented in a luxe matte black box.",
    images: [
      "https://images.unsplash.com/photo-1547887538-047f814d1803?w=800&q=80",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80",
    ],
    supplierPrice: 22.00,
    price: 79.99,
    compareAtPrice: 98.00,
    category: "Gift Sets",
    tags: ["gift set", "oud", "luxury", "gift", "arabic"],
    inStock: true,
    inventoryCount: 20,
    variants: [],
  },
  {
    supplierProductId: "bo-009",
    name: "Jazz Club Body Oil",
    slug: "jazz-club-body-oil",
    description:
      "Dim lights, leather stools, and a late-night glass of rum — captured in a body oil. This smooth, sophisticated blend opens with pink pepper and neroli before settling into a dark, woody heart of tobacco leaf, vetiver, and lush oakmoss. A slow, lingering dry-down of musk and vanilla makes this one of the most complex and wearable oils in the collection. Inspired by the legendary Replica Jazz Club fragrance.",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80",
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80",
    ],
    supplierPrice: 5.80,
    price: 21.99,
    compareAtPrice: 26.00,
    category: "Body Oils",
    tags: ["tobacco", "vetiver", "oakmoss", "musk", "unisex", "body oil", "woody"],
    inStock: true,
    inventoryCount: 85,
    variants: [
      { supplierVariantId: "bo-009-10ml", name: "Size", value: "10ml", supplierPrice: 5.80, price: 21.99, inventoryCount: 45 },
      { supplierVariantId: "bo-009-30ml", name: "Size", value: "30ml", supplierPrice: 10.20, price: 34.99, inventoryCount: 40 },
    ],
  },
];

async function main() {
  console.log("Seeding database with product catalog...\n");

  for (const { variants, ...product } of products) {
    await prisma.product.upsert({
      where: { supplierProductId: product.supplierProductId },
      update: {
        ...product,
        variants: { deleteMany: {}, create: variants },
      },
      create: {
        ...product,
        variants: { create: variants },
      },
    });
    console.log(`  ✓ ${product.name}`);
  }

  console.log(`\nDone — ${products.length} products seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
