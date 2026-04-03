import nodemailer from "nodemailer";
import type { Order, Customer, OrderItem } from "@prisma/client";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const STORE_NAME = process.env.STORE_NAME ?? "LUXE";
const STORE_EMAIL = process.env.STORE_EMAIL ?? "hello@luxestore.com";
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "https://luxestore.com";

type OrderWithItems = Order & {
  customer: Customer;
  items: (OrderItem & { product?: { name: string; images: string[] } })[];
};

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  const shippingAddress = order.shippingAddress as {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
          <strong>${item.name}</strong>${item.variantName ? ` — ${item.variantName}` : ""}
          <br><span style="color:#888;font-size:13px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:right;">
          $${item.totalPrice.toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#fafaf8;color:#0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #e8e8e8;">
    <tr>
      <td style="padding:40px;text-align:center;background:#0a0a0a;">
        <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:6px;font-weight:300;">${STORE_NAME}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <h2 style="font-weight:400;font-size:20px;margin:0 0 8px;">Order Confirmed</h2>
        <p style="color:#666;margin:0 0 32px;">Thank you for your order, ${order.customer.firstName}.</p>

        <table style="border:1px solid #e8e8e8;padding:16px 20px;margin-bottom:32px;width:100%;box-sizing:border-box;">
          <tr>
            <td><strong>Order</strong></td>
            <td style="text-align:right;color:#666;">#${order.orderNumber}</td>
          </tr>
        </table>

        <h3 style="font-weight:400;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHtml}
          <tr>
            <td style="padding:16px 0 4px;"><strong>Subtotal</strong></td>
            <td style="padding:16px 0 4px;text-align:right;">$${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#666;">Shipping</td>
            <td style="padding:4px 0;text-align:right;color:#666;">${order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;border-top:2px solid #0a0a0a;"><strong>Total</strong></td>
            <td style="padding:12px 0 0;text-align:right;border-top:2px solid #0a0a0a;"><strong>$${order.total.toFixed(2)}</strong></td>
          </tr>
        </table>

        <hr style="border:none;border-top:1px solid #f0f0f0;margin:32px 0;">

        <h3 style="font-weight:400;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Shipping To</h3>
        <p style="color:#444;line-height:1.7;margin:0;">
          ${shippingAddress.name}<br>
          ${shippingAddress.address}<br>
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br>
          ${shippingAddress.country}
        </p>

        <p style="color:#666;font-size:13px;margin:32px 0 0;line-height:1.7;">
          We'll send you a tracking notification once your order ships. If you have questions, reply to this email or contact us at <a href="mailto:${STORE_EMAIL}" style="color:#0a0a0a;">${STORE_EMAIL}</a>.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;text-align:center;background:#fafaf8;border-top:1px solid #e8e8e8;">
        <p style="margin:0;color:#999;font-size:12px;letter-spacing:1px;">&copy; ${new Date().getFullYear()} ${STORE_NAME}. ALL RIGHTS RESERVED.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${STORE_NAME}" <${STORE_EMAIL}>`,
    to: order.customer.email,
    subject: `Order Confirmed — #${order.orderNumber}`,
    html,
  });
}

export async function sendShippingNotificationEmail(
  order: OrderWithItems,
  trackingNumber: string,
  trackingUrl?: string
) {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#fafaf8;color:#0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #e8e8e8;">
    <tr>
      <td style="padding:40px;text-align:center;background:#0a0a0a;">
        <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:6px;font-weight:300;">${STORE_NAME}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <h2 style="font-weight:400;font-size:20px;margin:0 0 8px;">Your Order is On Its Way</h2>
        <p style="color:#666;margin:0 0 32px;">
          Hi ${order.customer.firstName}, your order #${order.orderNumber} has shipped.
        </p>
        <p style="margin:0 0 8px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
        ${
          trackingUrl
            ? `<a href="${trackingUrl}" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#0a0a0a;color:#fff;text-decoration:none;letter-spacing:2px;font-size:13px;">TRACK ORDER</a>`
            : ""
        }
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;text-align:center;background:#fafaf8;border-top:1px solid #e8e8e8;">
        <p style="margin:0;color:#999;font-size:12px;">&copy; ${new Date().getFullYear()} ${STORE_NAME}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${STORE_NAME}" <${STORE_EMAIL}>`,
    to: order.customer.email,
    subject: `Your Order Has Shipped — #${order.orderNumber}`,
    html,
  });
}
