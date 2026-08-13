"use server";

import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, products, type OrderItem } from "@/db/schema";
import { getStoreSettings } from "@/lib/queries";
import { WHATSAPP_NUMBER } from "@/lib/site";

export type PlaceOrderInput = {
  items: { productId: string; qty: number }[];
  customerName: string;
  phone: string;
  address: string;
  pincode: string;
  landmark?: string;
  deliveryDate?: string;
  notes?: string;
  paymentMethod: "cod" | "whatsapp" | "razorpay";
  lang: "en" | "ml";
};

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      subtotal: number;
      deliveryCharge: number;
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
  paymentMethod: string,
  items: OrderItem[],
  subtotal: number,
  deliveryCharge: number,
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
    items: ml ? "ഇനങ്ങൾ" : "Items",
    subtotal: ml ? "ഉപതുക" : "Subtotal",
    deliveryCharge: ml ? "ഡെലിവറി ചാർജ്" : "Delivery charge",
    total: ml ? "ആകെ" : "Total",
    payment: ml ? "പേയ്മെന്റ്" : "Payment",
    footer: ml ? "ഓണപ്പൂക്കൾ വെബ്സൈറ്റിലൂടെ" : "via Onapookkal website",
  };
  const lines: string[] = [];
  lines.push(`*${L.order}: ${orderNumber}*`);
  lines.push(`${L.name}: ${customerName}`);
  lines.push(`${L.phone}: ${phone}`);
  lines.push(`${L.address}: ${address}, ${pincode}`);
  if (deliveryDate) lines.push(`${L.delivery}: ${deliveryDate}`);
  lines.push("");
  lines.push(`${L.items}:`);
  for (const it of items) {
    lines.push(`• ${it.name}${it.nameMl ? ` (${it.nameMl})` : ""} × ${it.qty} — ₹${it.price * it.qty}`);
  }
  lines.push("");
  lines.push(`${L.subtotal}: ₹${subtotal}`);
  if (deliveryCharge > 0) lines.push(`${L.deliveryCharge}: ₹${deliveryCharge}`);
  lines.push(`*${L.total}: ₹${total}*`);
  lines.push(`${L.payment}: ${paymentMethod.toUpperCase()}`);
  lines.push("");
  lines.push(`_${L.footer}_`);
  return lines.join("\n");
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    const db = getDb();

    if (!input.items?.length) return { ok: false, error: "Cart is empty" };
    const cleanItems = input.items
      .filter((i) => i.productId && i.qty > 0)
      .map((i) => ({ productId: i.productId, qty: Math.floor(i.qty) }));
    if (!cleanItems.length) return { ok: false, error: "Cart is empty" };

    if (!input.customerName?.trim() || !input.phone?.trim() || !input.address?.trim() || !input.pincode?.trim()) {
      return { ok: false, error: "Please fill name, phone, address and pincode" };
    }

    // Re-price from DB (never trust client prices)
    const ids = cleanItems.map((i) => i.productId);
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(rows.map((p) => [p.id, p]));
    const items: OrderItem[] = cleanItems.map((i) => {
      const p = byId.get(i.productId);
      if (!p) throw new Error("Product not found");
      return {
        productId: p.id,
        name: p.nameEn,
        nameMl: p.nameMl,
        unit: p.unit,
        qty: i.qty,
        price: p.price,
      };
    });

    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
    const settings = await getStoreSettings();
    const deliveryCharge = settings.deliveryCharge;
    const total = subtotal + deliveryCharge;

    const orderNumber = `ONM-${Date.now().toString(36).toUpperCase()}`;
    const orderId = crypto.randomUUID();

    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: null,
      address: input.address.trim(),
      pincode: input.pincode.trim(),
      landmark: input.landmark?.trim() || null,
      deliveryDate: input.deliveryDate || null,
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "new",
      notes: input.notes?.trim() || null,
    });

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      buildWhatsAppMessage(
        orderNumber,
        input.customerName.trim(),
        input.phone.trim(),
        input.address.trim(),
        input.pincode.trim(),
        input.deliveryDate || "",
        input.paymentMethod,
        items,
        subtotal,
        deliveryCharge,
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
