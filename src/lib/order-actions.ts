"use server";

import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, products, type DeliveryMethod, type OrderItem } from "@/db/schema";
import { WHATSAPP_NUMBER, STORE_MAPS_LINK, computeDeliveryCharge, lineTotal, formatQty, isOrderingOpen } from "@/lib/site";
import { validateCoupon, markCouponUsed } from "@/lib/coupons";

export type PlaceOrderInput = {
  items: { productId: string; qty: number }[];
  customerName: string;
  phone: string;
  address: string;
  pincode: string;
  district?: string;
  area?: string;
  landmark?: string;
  deliveryDate?: string;
  deliveryMethod?: DeliveryMethod; // "delivery" | "pickup"
  location?: string; // "lat,lng" when customer shares location
  notes?: string;
  paymentMethod: "cod" | "whatsapp" | "razorpay";
  couponCode?: string;
  lang: "en" | "ml";
};

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      subtotal: number;
      deliveryCharge: number;
      discount: number;
      total: number;
      whatsappUrl: string;
      razorpayOrderId?: string;
      razorpayKeyId?: string;
    }
  | { ok: false; error: string };

function buildWhatsAppMessage(
  orderNumber: string,
  customerName: string,
  phone: string,
  address: string,
  pincode: string,
  deliveryDate: string,
  deliveryMethod: DeliveryMethod,
  location: string,
  paymentMethod: string,
  items: OrderItem[],
  subtotal: number,
  deliveryCharge: number,
  discount: number,
  total: number,
  lang: "en" | "ml",
): string {
  const ml = lang === "ml";
  const L = {
    order: ml ? "ഓർഡർ" : "Order",
    name: ml ? "പേര്" : "Name",
    phone: ml ? "ഫോൺ" : "Phone",
    address: ml ? "വിലാസം" : "Address",
    delivery: ml ? "ഡെലിവറി" : "Delivery",
    method: ml ? "രീതി" : "Method",
    pickup: ml ? "കടയിൽ നിന്ന് എടുക്കാം" : "Store pickup",
    location: ml ? "ലൊക്കേഷൻ" : "Location",
    items: ml ? "ഇനങ്ങൾ" : "Items",
    subtotal: ml ? "ഉപതുക" : "Subtotal",
    deliveryCharge: ml ? "ഡെലിവറി ചാർജ്" : "Delivery charge",
    discount: ml ? "കിഴിവ്" : "Discount",
    total: ml ? "ആകെ" : "Total",
    payment: ml ? "പേയ്മെന്റ്" : "Payment",
    track: ml ? "ഓർഡർ ട്രാക്ക്" : "Track your order",
    footer: ml ? "ഓണപ്പൂക്കൾ വെബ്സൈറ്റിലൂടെ" : "via Onapookkal website",
  };
  const lines: string[] = [];
  lines.push(`*${L.order}: ${orderNumber}*`);
  lines.push(`${L.name}: ${customerName}`);
  lines.push(`${L.phone}: ${phone}`);
  if (deliveryMethod === "pickup") {
    lines.push(`${L.method}: ${L.pickup} — ${STORE_MAPS_LINK}`);
  } else {
    lines.push(`${L.address}: ${address}, ${pincode}`);
    if (location) lines.push(`${L.location}: https://maps.google.com/?q=${location}`);
  }
  if (deliveryDate) lines.push(`${L.delivery}: ${deliveryDate}`);
  lines.push("");
  lines.push(`${L.items}:`);
  for (const it of items) {
    lines.push(`• ${it.name}${it.nameMl ? ` (${it.nameMl})` : ""} ${formatQty(it.qty, it.unit)} — ₹${lineTotal(it.price, it.qty)}`);
  }
  lines.push("");
  lines.push(`${L.subtotal}: ₹${subtotal}`);
  if (discount > 0) lines.push(`${L.discount}: −₹${discount}`);
  if (deliveryCharge > 0) lines.push(`${L.deliveryCharge}: ₹${deliveryCharge}`);
  lines.push(`*${L.total}: ₹${total}*`);
  lines.push(`${L.payment}: ${paymentMethod.toUpperCase()}`);
  lines.push(`${L.track}: https://onapookkal.store/track?order=${encodeURIComponent(orderNumber)}`);
  lines.push("");
  lines.push(`_${L.footer}_`);
  return lines.join("\n");
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    const db = getDb();
    const deliveryMethod: DeliveryMethod = input.deliveryMethod ?? "delivery";

    if (!isOrderingOpen()) {
      return { ok: false, error: "Ordering opens on 21 August — please check back then!" };
    }

    if (!input.items?.length) return { ok: false, error: "Cart is empty" };
    const rawItems = input.items.filter((i) => i.productId && i.qty > 0);
    if (!rawItems.length) return { ok: false, error: "Cart is empty" };

    if (!input.customerName?.trim() || !input.phone?.trim()) {
      return { ok: false, error: "Please fill name and phone" };
    }
    if (deliveryMethod === "delivery" && (!input.address?.trim() || !input.pincode?.trim())) {
      return { ok: false, error: "Please fill address and pincode" };
    }

    // Re-price from DB (never trust client prices). Normalise qty per unit:
    // kg products keep fractional weight (rounded to grams), others are whole units.
    const ids = rawItems.map((i) => i.productId);
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(rows.map((p) => [p.id, p]));
    const items: OrderItem[] = [];
    for (const i of rawItems) {
      const p = byId.get(i.productId);
      if (!p) throw new Error("Product not found");
      const qty = p.unit === "kg" ? Math.round(i.qty * 1000) / 1000 : Math.floor(i.qty);
      if (qty <= 0) continue;
      items.push({
        productId: p.id,
        name: p.nameEn,
        nameMl: p.nameMl,
        unit: p.unit,
        qty,
        price: p.price,
        costPrice: p.costPrice,
      });
    }
    if (!items.length) return { ok: false, error: "Cart is empty" };

    // Stock check — block ordering if a product is sold out or short.
    for (const it of items) {
      const p = byId.get(it.productId)!;
      if (p.stock < it.qty) {
        if (p.stock <= 0) return { ok: false, error: `"${p.nameEn}" is sold out` };
        return { ok: false, error: `Only ${formatQty(p.stock, p.unit)} "${p.nameEn}" left in stock` };
      }
    }

    const subtotal = items.reduce((n, i) => n + lineTotal(i.price, i.qty), 0);

    // Coupon (optional): validate against the phone, apply discount / free delivery.
    let discount = 0;
    let freeDelivery = false;
    let appliedCoupon: string | null = null;
    if (input.couponCode?.trim()) {
      const v = await validateCoupon(input.couponCode, input.phone, subtotal);
      if (!v.ok) return { ok: false, error: v.error! };
      discount = v.discount ?? 0;
      freeDelivery = v.freeDelivery ?? false;
      appliedCoupon = v.coupon!.code;
    }

    let deliveryCharge =
      deliveryMethod === "pickup" ? 0 : computeDeliveryCharge(subtotal, input.location);
    if (freeDelivery && deliveryMethod === "delivery") deliveryCharge = 0;

    const total = subtotal - discount + deliveryCharge;

    const address = deliveryMethod === "pickup" ? "Store pickup" : input.address.trim();
    const pincode = deliveryMethod === "pickup" ? "670643" : input.pincode.trim();

    const orderNumber = `ONM-${Date.now().toString(36).toUpperCase()}`;
    const orderId = crypto.randomUUID();

    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: null,
      address,
      pincode,
      district: input.district?.trim() || null,
      area: input.area?.trim() || null,
      landmark: input.landmark?.trim() || null,
      deliveryDate: input.deliveryDate || null,
      deliveryMethod,
      location: input.location?.trim() || null,
      items,
      subtotal,
      deliveryCharge,
      discount,
      couponCode: appliedCoupon,
      total,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "new",
      notes: input.notes?.trim() || null,
    });

    // Reserve stock — decrement by the ordered quantity.
    for (const it of items) {
      const p = byId.get(it.productId)!;
      await db
        .update(products)
        .set({ stock: Math.max(0, p.stock - it.qty) })
        .where(eq(products.id, it.productId));
    }

    // Consume the coupon (single-use).
    if (appliedCoupon) await markCouponUsed(appliedCoupon);

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      buildWhatsAppMessage(
        orderNumber,
        input.customerName.trim(),
        input.phone.trim(),
        address,
        pincode,
        input.deliveryDate || "",
        deliveryMethod,
        input.location?.trim() || "",
        input.paymentMethod,
        items,
        subtotal,
        deliveryCharge,
        discount,
        total,
        input.lang,
      ),
    )}`;

    // Razorpay (only if configured + requested)
    let razorpayOrderId: string | undefined;
    let razorpayKeyId: string | undefined;
    if (input.paymentMethod === "razorpay") {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        return { ok: false, error: "Online payment is not configured yet. Please choose COD or WhatsApp." };
      }
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total * 100, // paise
          currency: "INR",
          receipt: orderNumber,
        }),
      });
      if (!res.ok) return { ok: false, error: "Payment init failed" };
      const rz = (await res.json()) as { id: string };
      razorpayOrderId = rz.id;
      razorpayKeyId = keyId;
      await db
        .update(orders)
        .set({ razorpayOrderId })
        .where(eq(orders.id, orderId));
    }

    return {
      ok: true,
      orderId,
      orderNumber,
      subtotal,
      deliveryCharge,
      discount,
      total,
      whatsappUrl,
      razorpayOrderId,
      razorpayKeyId,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Order failed" };
  }
}

/** Verify Razorpay payment signature and mark the order paid. */
export async function confirmRazorpayPayment(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<{ ok: boolean }> {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return { ok: false };

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const data = `${razorpayOrderId}|${razorpayPaymentId}`;
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    let hex = "";
    for (const b of new Uint8Array(sig)) hex += b.toString(16).padStart(2, "0");
    if (hex !== razorpaySignature) return { ok: false };

    const db = getDb();
    await db
      .update(orders)
      .set({ paymentStatus: "paid", razorpayPaymentId })
      .where(eq(orders.id, orderId));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
