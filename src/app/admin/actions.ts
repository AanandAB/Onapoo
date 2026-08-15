"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, createSessionToken, verifyPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { getStoreSettings } from "@/lib/queries";
import { normalizePhone } from "@/lib/site";
import { generateCouponCode } from "@/lib/coupons";
import { getDb } from "@/db";
import {
  admins,
  coupons,
  expenses,
  offers,
  orders,
  products,
  ORDER_STATUSES,
  type DeliveryMethod,
  type OfferType,
  type OrderItem,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
  type ProductUnit,
} from "@/db/schema";

// ---- FormData helpers ----

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v === null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function bool(fd: FormData, key: string): boolean {
  return fd.has(key);
}

// ---- Auth ----

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const username = str(formData, "username");
  const password = str(formData, "password");
  if (!username || !password) return { error: "Enter username and password" };

  const db = getDb();
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.username, username))
    .limit(1);

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { error: "Invalid username or password" };
  }

  const token = await createSessionToken({ sub: admin.id, username: admin.username });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/admin/login");
}

// ---- Products ----

export async function saveProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  const id = str(formData, "id");

  const imagesStr = str(formData, "images");
  let images: string[] = [];
  if (imagesStr) {
    try {
      images = (JSON.parse(imagesStr) as string[]).filter(Boolean);
    } catch {
      images = [];
    }
  }

  const data = {
    slug: str(formData, "slug") ?? `p-${Date.now()}`,
    nameEn: str(formData, "nameEn") ?? "Unnamed",
    nameMl: str(formData, "nameMl") ?? str(formData, "nameEn") ?? "പേരില്ല",
    categoryId: str(formData, "categoryId") ?? "",
    colorEn: str(formData, "colorEn"),
    colorMl: str(formData, "colorMl"),
    descriptionEn: str(formData, "descriptionEn"),
    descriptionMl: str(formData, "descriptionMl"),
    unit: (str(formData, "unit") ?? "bunch") as ProductUnit,
    price: num(formData, "price") ?? 0,
    costPrice: num(formData, "costPrice") ?? 0,
    compareAtPrice: num(formData, "compareAtPrice"),
    stock: num(formData, "stock") ?? 0,
    isFeatured: bool(formData, "isFeatured"),
    sortOrder: num(formData, "sortOrder") ?? 0,
    image: images[0] ?? null,
    images: images.length ? images : null,
  };

  if (id) {
    await db.update(products).set(data).where(eq(products.id, id));
  } else {
    await db.insert(products).values({ id: crypto.randomUUID(), ...data });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await getDb().delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

// ---- Offers ----

export async function saveOffer(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  const id = str(formData, "id");

  const data = {
    titleEn: str(formData, "titleEn") ?? "Offer",
    titleMl: str(formData, "titleMl") ?? "ഓഫർ",
    type: (str(formData, "type") ?? "percent") as OfferType,
    value: num(formData, "value") ?? 0,
    active: bool(formData, "active"),
    bannerTextEn: str(formData, "bannerTextEn"),
    bannerTextMl: str(formData, "bannerTextMl"),
  };

  if (id) {
    await db.update(offers).set(data).where(eq(offers.id, id));
  } else {
    await db.insert(offers).values({ id: crypto.randomUUID(), ...data });
  }

  revalidatePath("/admin/offers");
  revalidatePath("/");
  redirect("/admin/offers");
}

export async function deleteOffer(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await getDb().delete(offers).where(eq(offers.id, id));
  revalidatePath("/admin/offers");
  revalidatePath("/");
  redirect("/admin/offers");
}

export async function deleteCoupon(formData: FormData): Promise<void> {
  await requireAdmin();
  const code = str(formData, "code");
  if (code) await getDb().delete(coupons).where(eq(coupons.code, code));
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

// Generate a coupon from the admin (returns the code so the UI can show it).
export async function createCoupon(
  formData: FormData,
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  await requireAdmin();
  const db = getDb();
  const phone = normalizePhone(str(formData, "phone") ?? "");
  const type = (str(formData, "type") ?? "percent") as "percent" | "free_delivery";
  const value = num(formData, "value") ?? 0;

  if (phone.length < 8) return { ok: false, error: "Enter a valid phone number (8+ digits)." };
  if (type === "percent" && (value < 1 || value > 100)) {
    return { ok: false, error: "Discount must be between 1 and 100%." };
  }

  const code = generateCouponCode();
  await db.insert(coupons).values({
    code,
    type,
    value: type === "percent" ? value : 0,
    phone,
    used: false,
  });
  revalidatePath("/admin/coupons");
  return { ok: true, code };
}

// ---- Expenses / Profit ---- //

export async function addExpense(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  const label = str(formData, "label");
  const amount = num(formData, "amount");
  if (label && amount != null && amount > 0) {
    await db.insert(expenses).values({ id: crypto.randomUUID(), label, amount });
  }
  revalidatePath("/admin/profit");
  redirect("/admin/profit");
}

export async function deleteExpense(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  const id = str(formData, "id");
  if (id) await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/admin/profit");
  redirect("/admin/profit");
}

// ---- Orders / CRM ----

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (id && status && ORDER_STATUSES.includes(status as OrderStatus)) {
    await getDb().update(orders).set({ orderStatus: status as OrderStatus }).where(eq(orders.id, id));
  }
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export type ManualOrderItem = { name: string; nameMl?: string; qty: number; price: number };
export type ManualOrderInput = {
  customerName: string;
  phone: string;
  address?: string;
  pincode?: string;
  landmark?: string;
  deliveryDate?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryMethod?: DeliveryMethod;
  items: ManualOrderItem[];
};

export async function addManualOrder(
  input: ManualOrderInput,
): Promise<{ error?: string } | void> {
  await requireAdmin();

  const items: OrderItem[] = (input.items ?? [])
    .filter((i) => i.name?.trim() && i.qty > 0)
    .map((i) => ({
      productId: "",
      name: i.name.trim(),
      nameMl: i.nameMl?.trim() || i.name.trim(),
      unit: "",
      qty: Math.floor(i.qty),
      price: Math.max(0, Math.floor(i.price || 0)),
    }));

  if (!items.length) return { error: "Add at least one item" };
  if (!input.customerName?.trim() || !input.phone?.trim()) {
    return { error: "Customer name and phone are required" };
  }

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const settings = await getStoreSettings();
  const deliveryMethod: DeliveryMethod = input.deliveryMethod ?? "delivery";
  const deliveryCharge = deliveryMethod === "pickup" ? 0 : settings.deliveryCharge;
  const total = subtotal + deliveryCharge;
  const orderNumber = `ONM-${Date.now().toString(36).toUpperCase()}`;

  await getDb().insert(orders).values({
    id: crypto.randomUUID(),
    orderNumber,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    email: null,
    address: input.address?.trim() || "Walk-in / phone order",
    pincode: input.pincode?.trim() || "670643",
    landmark: input.landmark?.trim() || null,
    deliveryDate: input.deliveryDate || null,
    deliveryMethod,
    location: null,
    items,
    subtotal,
    deliveryCharge,
    total,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    orderStatus: input.orderStatus,
    notes: input.notes?.trim() || null,
  });

  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}
