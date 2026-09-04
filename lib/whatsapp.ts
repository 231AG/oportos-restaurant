import { site } from "@/config/site";
import type { CartLine } from "@/lib/cart-types";

const BASE = "https://wa.me/";

/** Builds a click-to-chat URL with a properly encoded prefilled message. */
export function whatsappUrl(message: string): string {
  return `${BASE}${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Generic "I'd like to order" opener used by the nav and hero CTAs. */
export function generalOrderMessage(): string {
  return `Hello ${titleCase(site.name)}! I would like to place an order.`;
}

/** Message for a single dish, e.g. from a dish detail panel. */
export function dishOrderMessage(dishName: string): string {
  return [
    `Hello ${titleCase(site.name)}! 👋`,
    "",
    "I would like to order:",
    `• ${dishName}`,
    "",
    "Please provide more information about availability and delivery.",
  ].join("\n");
}

/** Message for the client-side cart. Totals are informational only — no checkout. */
export function cartOrderMessage(lines: CartLine[], total: number): string {
  if (lines.length === 0) return generalOrderMessage();

  const items = lines.map(
    (line) =>
      `• ${line.quantity} × ${line.name} — ${formatMoney(line.price * line.quantity)}`,
  );

  return [
    `Hello ${titleCase(site.name)}! 👋`,
    "",
    "I would like to order:",
    ...items,
    "",
    `Total: ${formatMoney(total)}`,
    "",
    "Please confirm availability and delivery time.",
  ].join("\n");
}

/** Booking / large-group enquiry from the contact page. */
export function reservationMessage(): string {
  return [
    `Hello ${titleCase(site.name)}! 👋`,
    "",
    "I would like to book a table.",
    "",
    "Date:",
    "Time:",
    "Number of guests:",
  ].join("\n");
}

export function formatMoney(value: number): string {
  return `${site.currency}${value.toFixed(2)}`;
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
