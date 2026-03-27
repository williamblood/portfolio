import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCJProductDetail, normalizeCJProduct } from "@/lib/supplier";
import { applyMarkup } from "@/lib/pricing";

// Vercel Cron: runs every 6 hours
// vercel.json: { "crons": [{ "path": "/api/cron/price-sync", "schedule": "0 */6 * * *" }] }

export async function GET(req: NextRequest) {
  // Allow Vercel Cron (no auth header) or manual trigger with secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, Vercel Cron hits this endpoint internally without auth
  // Manual triggers must supply the secret
  if (authHeader && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get products that haven't been updated in the last 6 hours
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const staleProducts = await prisma.product.findMany({
      where: { priceUpdatedAt: { lt: cutoff } },
      take: 100,
      orderBy: { priceUpdatedAt: "asc" },
      select: { id: true, supplierProductId: true },
    });

    if (staleProducts.length === 0) {
      return NextResponse.json({ message: "All prices up to date", updated: 0 });
    }

    let updated = 0;
    let errors = 0;

    for (const product of staleProducts) {
      try {
        const cjProduct = await fetchCJProductDetail(product.supplierProductId);
        const normalized = normalizeCJProduct(cjProduct);

        await prisma.product.update({
          where: { id: product.id },
          data: {
            supplierPrice: normalized.supplierPrice,
            price: normalized.price,
            inventoryCount: normalized.inventoryCount,
            inStock: normalized.inventoryCount > 0,
            priceUpdatedAt: new Date(),
            variants: {
              deleteMany: {},
              create: normalized.variants,
            },
          },
        });

        updated++;
      } catch (err) {
        console.error(`Price sync failed for ${product.supplierProductId}:`, err);
        errors++;
      }

      // Rate limiting: small delay between API calls
      await new Promise((r) => setTimeout(r, 300));
    }

    await prisma.syncLog.create({
      data: {
        type: "price_sync",
        status: errors === 0 ? "success" : "error",
        message: `Updated ${updated} products. Errors: ${errors}`,
        itemCount: updated,
      },
    });

    return NextResponse.json({ updated, errors, total: staleProducts.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Price sync failed";
    console.error("[price-sync]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
