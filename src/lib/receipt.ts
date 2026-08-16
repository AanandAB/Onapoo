import type { OrderRow } from "@/db/schema";
import { formatPrice } from "@/lib/site";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDelivDate(s: string | null): string {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
}

// Full itemized receipt, pre-filled into a WhatsApp message. The admin opens it
// and taps Send from their own device (no automation, no ban risk).
export function buildReceiptMessage(o: OrderRow): string {
  const lines: string[] = [];
  lines.push("🧾 *Onapookkal — Order Receipt*");
  lines.push("");
  lines.push(`Order: ${o.orderNumber}`);
  lines.push(`Name: ${o.customerName}`);
  lines.push(`Date: ${fmtDate(o.createdAt)}`);
  lines.push("");
  lines.push("*Items*");
  for (const it of o.items) {
    const name = it.nameMl && it.nameMl !== it.name ? `${it.name} (${it.nameMl})` : it.name;
    lines.push(`• ${name} × ${it.qty} — ${formatPrice(it.price * it.qty)}`);
  }
  lines.push("");
  lines.push(`Subtotal: ${formatPrice(o.subtotal)}`);
  if (o.discount > 0) lines.push(`Discount: −${formatPrice(o.discount)}`);
  if (o.deliveryCharge > 0) lines.push(`Delivery: ${formatPrice(o.deliveryCharge)}`);
  lines.push(`*Total: ${formatPrice(o.total)}*`);
  lines.push("");
  if (o.deliveryMethod === "pickup") {
    lines.push("Method: Store pickup");
  } else {
    lines.push("Method: Home delivery");
    if (o.deliveryDate) lines.push(`Delivery day: ${fmtDelivDate(o.deliveryDate)}`);
    if (o.address) lines.push(`Address: ${o.address}, ${o.pincode}`);
  }
  lines.push(`Payment: ${o.paymentMethod.toUpperCase()} (${o.paymentStatus})`);
  lines.push("");
  lines.push(`Track: https://onapookkal.store/track?order=${encodeURIComponent(o.orderNumber)}`);
  lines.push("");
  lines.push("Thank you for shopping with Onapookkal! 🌼");
  return lines.join("\n");
}

export function receiptWaLink(o: OrderRow): string {
  const p = o.phone.replace(/[^0-9]/g, "");
  const intl = p.length === 10 ? "91" + p : p;
  return `https://wa.me/${intl}?text=${encodeURIComponent(buildReceiptMessage(o))}`;
}
