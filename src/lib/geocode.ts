// Server-side geocoding via OpenStreetMap Nominatim (free, no API key).
// Results are cached per Worker instance to respect Nominatim's rate limits.

const cache = new Map<string, { lat: number; lng: number } | null>();

// Resolve an Indian pincode to an approximate area centroid.
export async function geocodePincode(
  pincode: string,
): Promise<{ lat: number; lng: number } | null> {
  const key = `pc:${pincode}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      pincode,
    )}+Kerala+India&format=jsonv2&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Onapookkal-admin/1.0 (onapookkal.store)",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const first = data[0];
    if (!first?.lat || !first?.lon) {
      cache.set(key, null);
      return null;
    }
    const result = { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}

// Parse a "lat,lng" string (the order.location field) into coordinates.
export function parseLocation(location: string): { lat: number; lng: number } | null {
  const parts = location.split(",");
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}
