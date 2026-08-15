import { validateCoupon } from "@/lib/coupons";

export const dynamic = "force-dynamic";

// GET /api/coupon?code=ABC&phone=98765&subtotal=500
// Validates a coupon for a phone + subtotal WITHOUT marking it used (preview only).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  const phone = url.searchParams.get("phone") ?? "";
  const subtotal = parseInt(url.searchParams.get("subtotal") ?? "0", 10) || 0;

  if (!code.trim() || !phone.trim()) {
    return Response.json({ ok: false, error: "Enter a coupon code and phone number." });
  }

  const v = await validateCoupon(code, phone, subtotal);
  if (!v.ok) return Response.json({ ok: false, error: v.error });

  return Response.json({
    ok: true,
    type: v.coupon?.type,
    value: v.coupon?.value,
    discount: v.discount ?? 0,
    freeDelivery: v.freeDelivery ?? false,
  });
}
