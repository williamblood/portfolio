/**
 * Pricing utilities — all markup logic lives here.
 * MARKUP_RATE can be overridden via env for easy adjustment.
 */

export const MARKUP_RATE = parseFloat(process.env.MARKUP_RATE ?? "1.3");

/** Apply markup and round to 2 decimal places */
export function applyMarkup(supplierPrice: number): number {
  return Math.round(supplierPrice * MARKUP_RATE * 100) / 100;
}

/** Calculate compare-at price (original "crossed out" price) */
export function compareAtPrice(markedUpPrice: number): number {
  return Math.round(markedUpPrice * 1.2 * 100) / 100;
}

/** Format price for display */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents);
}

/** Convert Stripe amount (cents) to dollars */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Convert dollars to Stripe amount (cents) */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
