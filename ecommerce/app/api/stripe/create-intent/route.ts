import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem, ShippingAddress } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress, shipping = 0 } = body as {
      items: CartItem[];
      shippingAddress: ShippingAddress;
      shipping: number;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate items against DB prices (prevent client-side price tampering)
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const validatedItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      // Use DB price, not client price
      let unitPrice = product.price;
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) unitPrice = variant.price;
      }

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        productId: item.productId,
        variantId: item.variantId,
        name: product.name,
        variantName: item.variantName,
        image: product.images[0],
        price: unitPrice,
        quantity: item.quantity,
        total: lineTotal,
      };
    });

    const shippingCost = subtotal >= 150 ? 0 : shipping;
    const grandTotal = subtotal + shippingCost;
    const amountCents = dollarsToCents(grandTotal);

    // Upsert customer
    const customer = await prisma.customer.upsert({
      where: { email: shippingAddress.email },
      update: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
      },
      create: {
        email: shippingAddress.email,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
      },
    });

    const orderNumber = generateOrderNumber();

    // Create order in PENDING state
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        subtotal,
        shippingCost,
        tax: 0,
        total: grandTotal,
        shippingAddress: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            variantName: item.variantName,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.total,
          })),
        },
      },
    });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: {
        orderId: order.id,
        orderNumber,
        customerId: customer.id,
      },
      description: `Order ${orderNumber}`,
      receipt_email: shippingAddress.email,
    });

    // Store payment intent ID on order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (err: unknown) {
    console.error("[create-intent]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
