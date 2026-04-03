import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { placeSupplierOrder } from "@/lib/supplier";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

// Stripe requires raw body for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[webhook] verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      }
      case "charge.refunded": {
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] error handling ${event.type}:`, err);
    // Return 200 so Stripe doesn't retry — log for manual handling
    return NextResponse.json({ received: true, error: "Handler failed" });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata.orderId;
  if (!orderId) {
    console.error("[webhook] no orderId in payment intent metadata");
    return;
  }

  // Mark order as PAID
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      stripeChargeId: typeof intent.latest_charge === "string"
        ? intent.latest_charge
        : undefined,
    },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
  });

  // Send confirmation email (fire-and-forget)
  sendOrderConfirmationEmail(order as Parameters<typeof sendOrderConfirmationEmail>[0]).catch(
    (err) => console.error("[webhook] email error:", err)
  );

  // Place order with supplier
  try {
    const shippingAddress = order.shippingAddress as {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };

    const supplierItems = order.items.map((item) => ({
      supplierProductId: item.product.supplierProductId,
      supplierVariantId: item.variantId
        ? undefined // would need to look up variant.supplierVariantId
        : undefined,
      quantity: item.quantity,
    }));

    const supplierOrder = await placeSupplierOrder({
      orderNumber: order.orderNumber,
      shippingAddress,
      items: supplierItems,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING",
        fulfillmentStatus: "SUBMITTED_TO_SUPPLIER",
        supplierOrderId: supplierOrder.orderId,
        supplierOrderRef: supplierOrder.orderNum,
      },
    });

    console.log(
      `[webhook] Supplier order placed: ${supplierOrder.orderId} for order ${order.orderNumber}`
    );
  } catch (err) {
    console.error("[webhook] supplier order failed:", err);
    // Don't throw — order is paid, supplier order can be retried manually via admin
    await prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: "FAILED" },
    });
  }
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata.orderId;
  if (!orderId) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  console.log(`[webhook] Payment failed for order ${orderId}`);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : null;

  if (!paymentIntentId) return;

  await prisma.order.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { status: "REFUNDED" },
  });
}
