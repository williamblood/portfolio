#!/usr/bin/env tsx
/**
 * Product sync script — run manually or via CI.
 * Usage: npm run sync:products
 * Fetches all pages from CJ Dropshipping and upserts into DB.
 */

import { PrismaClient } from "@prisma/client";
import { fetchCJProducts, normalizeCJProduct } from "../lib/supplier";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting product sync...");

  let page = 1;
  const pageSize = 50;
  let totalSynced = 0;
  let totalErrors = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page}...`);

    const { list, total } = await fetchCJProducts(page, pageSize);

    if (list.length === 0) {
      hasMore = false;
      break;
    }

    for (const cjProduct of list) {
      try {
        const normalized = normalizeCJProduct(cjProduct);
        const { variants, ...productData } = normalized;

        await prisma.product.upsert({
          where: { supplierProductId: cjProduct.pid },
          update: {
            ...productData,
            priceUpdatedAt: new Date(),
            variants: {
              deleteMany: {},
              create: variants,
            },
          },
          create: {
            ...productData,
            variants: { create: variants },
          },
        });

        totalSynced++;
      } catch (err) {
        console.error(`Error syncing ${cjProduct.pid}:`, err);
        totalErrors++;
      }
    }

    console.log(
      `Page ${page} complete. Running total: ${totalSynced} synced, ${totalErrors} errors.`
    );

    const totalPages = Math.ceil(total / pageSize);
    hasMore = page < totalPages;
    page++;

    // Rate limit
    await new Promise((r) => setTimeout(r, 500));
  }

  await prisma.syncLog.create({
    data: {
      type: "product_sync",
      status: totalErrors === 0 ? "success" : "error",
      message: `Full sync complete. Synced: ${totalSynced}, Errors: ${totalErrors}`,
      itemCount: totalSynced,
    },
  });

  console.log(`\nSync complete! ${totalSynced} products synced, ${totalErrors} errors.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
