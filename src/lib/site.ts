// Site-wide constants + helpers (server and client safe).

export const WHATSAPP_NUMBER = "917034026295"; // country code + number, no '+'
export const WHATSAPP_DISPLAY = "+91 70340 26295";
export const DELIVERY_PINCODE = "670643";

// Store location (for the pickup option + delivery distance origin)
export const STORE_LAT = 11.8314722; // 11°49'53.3"N
export const STORE_LNG = 75.5517778; // 75°33'06.4"E
export const STORE_MAPS_LINK = `https://www.google.com/maps?q=${STORE_LAT},${STORE_LNG}`;

// Delivery charge rules (distance-based)
export const DELIVERY_FREE_RADIUS_KM = 7; // free within this radius of the store
export const DELIVERY_BASE_FEE = 20; // ₹ added once beyond the free radius
export const DELIVERY_RATE_PER_KM = 5; // ₹ per extra km beyond the free radius
export const DELIVERY_FREE_OVER_AMOUNT = 2000; // free delivery if order subtotal ≥ this
export const DELIVERY_FLAT_FALLBACK = 30; // flat charge when no location is shared

// Onam 2026 (verified): Atham (day 1) -> Thiruvonam (main day)
export const ONAM_ATHAM = new Date("2026-08-17T00:00:00+05:30");
export const ONAM_THIRUVONAM = new Date("2026-08-26T00:00:00+05:30");

// Ordering opens from this date (configurable in the admin Settings page).
export const DEFAULT_ORDERING_START = "2026-08-21"; // ISO date, Asia/Kolkata

export function isOrderingOpenFor(startIso: string | null | undefined, now: Date = new Date()): boolean {
  const iso = startIso && startIso.trim() ? startIso.trim() : DEFAULT_ORDERING_START;
  const start = new Date(iso + "T00:00:00+05:30");
  return now.getTime() >= start.getTime();
}

// "21 August" — human label for the ordering-open date (for notices).
// Parses the ISO string directly (no timezone conversion) so it never shifts a
// day on UTC servers.
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatOrderingDate(iso: string | null | undefined): string {
  const s = iso && iso.trim() ? iso.trim() : DEFAULT_ORDERING_START;
  const [, m, d] = s.split("-").map((n) => parseInt(n, 10));
  if (!m || !d || m < 1 || m > 12) return s; // malformed -> show raw value
  return `${d} ${MONTHS[m - 1]}`;
}

export function formatPrice(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

// Line total rounded to the nearest whole rupee (prices are whole rupees, but
// fractional-kg quantities can otherwise produce paise).
export function lineTotal(price: number, qty: number): number {
  return Math.round(price * qty);
}

export function isKgUnit(unit: string): boolean {
  return unit === "kg";
}

// Format a kg weight for display: < 1 kg as grams, >= 1 kg as kg.
export function formatKgQty(qty: number): string {
  if (qty < 1) return `${Math.round(qty * 1000)} g`;
  return `${parseFloat(qty.toFixed(3))} kg`;
}

// Human quantity for any unit (kg -> weight, others -> whole count).
export function formatQty(qty: number, unit: string): string {
  return unit === "kg" ? formatKgQty(qty) : String(Math.round(qty));
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

// ---- Distance-based delivery charge ----

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Straight-line distance in km between two coordinates.
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function parseLocation(location?: string | null): { lat: number; lng: number } | null {
  if (!location) return null;
  const [lat, lng] = location.split(",").map((s) => parseFloat(s.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

// Distance from the store in km, or null if no valid location.
export function deliveryDistanceKm(location?: string | null): number | null {
  const c = parseLocation(location);
  if (!c) return null;
  return haversineKm(STORE_LAT, STORE_LNG, c.lat, c.lng);
}

// Compute the delivery charge for a home-delivery order.
// Free if subtotal ≥ threshold, or within the free radius; otherwise ₹20 base + ₹5/km beyond radius.
export function computeDeliveryCharge(subtotal: number, location?: string | null): number {
  if (subtotal >= DELIVERY_FREE_OVER_AMOUNT) return 0;
  const km = deliveryDistanceKm(location);
  if (km === null) return DELIVERY_FLAT_FALLBACK;
  if (km <= DELIVERY_FREE_RADIUS_KM) return 0;
  return DELIVERY_BASE_FEE + Math.ceil(km - DELIVERY_FREE_RADIUS_KM) * DELIVERY_RATE_PER_KM;
}

// Normalize a phone number for matching: digits only, strip a leading 91 country code.
export function normalizePhone(p: string): string {
  const d = p.replace(/\D/g, "");
  return d.length === 12 && d.startsWith("91") ? d.slice(2) : d;
}
