import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCJProducts, normalizeCJProduct } from "@/lib/supplier";

// This endpoint is called by the cron job and can also be triggered manually.
// Protected by a shared secret.

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { pageNum = 1, pageSize = 50, categoryId } = body as {
      pageNum?: number;
      pageSize?: number;
      categoryId?: string;
    };

    const { list, total } = await fetchCJProducts(pageNum, pageSize, categoryId);

    let synced = 0;
    let errors = 0;

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

        synced++;
      } catch (err) {
        console.error(`Failed to sync product ${cjProduct.pid}:`, err);
        errors++;
      }
    }

    await prisma.syncLog.create({
      data: {
        type: "product_sync",
        status: errors === 0 ? "success" : "error",
        message: `Synced ${synced}/${list.length} products. Errors: ${errors}`,
        itemCount: synced,
      },
    });

    return NextResponse.json({ synced, errors, total, page: pageNum });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[sync-products]", err);

    await prisma.syncLog.create({
      data: { type: "product_sync", status: "error", message },
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
