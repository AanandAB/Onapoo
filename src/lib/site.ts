// Site-wide constants + helpers (server and client safe).

export const WHATSAPP_NUMBER = "917034026295"; // country code + number, no '+'
export const WHATSAPP_DISPLAY = "+91 70340 26295";
export const DELIVERY_PINCODE = "670643";

// Onam 2026 (verified): Atham (day 1) -> Thiruvonam (main day)
export const ONAM_ATHAM = new Date("2026-08-17T00:00:00+05:30");
export const ONAM_THIRUVONAM = new Date("2026-08-26T00:00:00+05:30");

export function formatPrice(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function daysUntilThiruvonam(now: Date = new Date()): number {
  const diff = ONAM_THIRUVONAM.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Build a wa.me link with a pre-filled message.
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function whatsappPlain(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
