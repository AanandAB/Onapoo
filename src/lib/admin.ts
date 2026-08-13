import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asc, count, desc, eq } from "drizzle-orm";
import { COOKIE_NAME, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { getDb } from "@/db";
import { categories, offers, orders, products, ORDER_STATUSES, type OrderStatus } from "@/db/schema";

export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

// ---- Queries ----

export async function listCategories() {
  const db = getDb();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function listProductsAdmin() {
  const db = getDb();
  return db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.nameEn));
}

export async function getProductById(id: string) {
  const db = getDb();
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return p ?? null;
}

export async function listOffersAdmin() {
  const db = getDb();
  return db.select().from(offers).orderBy(desc(offers.createdAt));
}

export async function getOfferById(id: string) {
  const db = getDb();
  const [o] = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return o ?? null;
}

export async function getAdminStats() {
  const db = getDb();
  const [[{ n: productCount }], [{ n: orderCount }], [{ n: newOrders }]] = await Promise.all([
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(orders),
    db.select({ n: count() }).from(orders).where(eq(orders.orderStatus, "new")),
  ]);
  return { productCount, orderCount, newOrders };
}

export async function listOrdersAdmin(status?: string) {
  const db = getDb();
  const base = db.select().from(orders);
  if (status && status !== "all" && ORDER_STATUSES.includes(status as OrderStatus)) {
    return base.where(eq(orders.orderStatus, status as OrderStatus)).orderBy(desc(orders.createdAt));
  }
  return base.orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: string) {
  const db = getDb();
  const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return o ?? null;
}

export async function listAllOrders() {
  const db = getDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
