import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons, type CouponRow } from "@/db/schema";
import { normalizePhone } from "@/lib/site";

export type CouponType = "percent" | "free_delivery";

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

// Ambiguous characters removed (no 0/O/1/I/L) — matches the Python generator.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCouponCode(length = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

export async function getCoupon(code: string): Promise<CouponRow | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, normalizeCode(code)))
    .limit(1);
  return rows[0] ?? null;
}

export interface CouponValidation {
  ok: boolean;
  coupon?: CouponRow;
  discount?: number; // rupee discount on the subtotal (percent type)
  freeDelivery?: boolean;
  error?: string;
}

// Validate a coupon against the given phone + subtotal. Does NOT mark it used.
export async function validateCoupon(
  code: string,
  phone: string,
  subtotal: number,
): Promise<CouponValidation> {
  const coupon = await getCoupon(code);
  if (!coupon) return { ok: false, error: "Invalid coupon code." };
  if (normalizePhone(coupon.phone) !== normalizePhone(phone)) {
    return { ok: false, error: "This coupon is not valid for this phone number." };
  }
  if (coupon.used) return { ok: false, error: "This coupon has already been used." };
  const freeDelivery = coupon.type === "free_delivery";
  const discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : 0;
  return { ok: true, coupon, discount, freeDelivery };
}

export async function markCouponUsed(code: string): Promise<void> {
  const db = getDb();
  await db.update(coupons).set({ used: true }).where(eq(coupons.code, normalizeCode(code)));
}
