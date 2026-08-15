// Site-wide constants + helpers (server and client safe).

export const WHATSAPP_NUMBER = "917034026295"; // country code + number, no '+'
export const WHATSAPP_DISPLAY = "+91 70340 26295";
export const DELIVERY_PINCODE = "670643";

// Store location (for the pickup option)
export const STORE_LAT = 11.831404379922596;
export const STORE_LNG = 75.55180389653135;
export const STORE_MAPS_LINK = `https://www.google.com/maps?q=${STORE_LAT},${STORE_LNG}`;

// Delivery charge rules (distance-based)
export const DELIVERY_FREE_RADIUS_KM = 7; // free within this radius of the store
export const DELIVERY_RATE_PER_KM = 8; // ₹ per km beyond the free radius
export const DELIVERY_FREE_OVER_AMOUNT = 2000; // free delivery if order subtotal ≥ this
export const DELIVERY_FLAT_FALLBACK = 30; // flat charge when no location is shared

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
// Free if subtotal ≥ threshold, or within the free radius; otherwise ₹/km beyond radius.
export function computeDeliveryCharge(subtotal: number, location?: string | null): number {
  if (subtotal >= DELIVERY_FREE_OVER_AMOUNT) return 0;
  const km = deliveryDistanceKm(location);
  if (km === null) return DELIVERY_FLAT_FALLBACK;
  if (km <= DELIVERY_FREE_RADIUS_KM) return 0;
  return Math.ceil(km - DELIVERY_FREE_RADIUS_KM) * DELIVERY_RATE_PER_KM;
}
