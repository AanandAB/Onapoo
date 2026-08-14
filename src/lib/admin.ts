import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asc, count, desc, eq, like, or } from "drizzle-orm";
import { COOKIE_NAME, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { getDb } from "@/db";
import {
  categories,
  offers,
  orders,
  products,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  DELIVERY_METHODS,
  type OrderStatus,
} from "@/db/schema";

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

export interface OrderFilters {
  status?: string;
  q?: string;
  method?: string;
  pincode?: string;
  district?: string;
  area?: string;
}

export async function listOrdersAdmin(filters: OrderFilters = {}) {
  const db = getDb();
  let query = db.select().from(orders).$dynamic();
  if (filters.status && filters.status !== "all" && ORDER_STATUSES.includes(filters.status as OrderStatus)) {
    query = query.where(eq(orders.orderStatus, filters.status as OrderStatus));
  }
  if (filters.method && filters.method !== "all") {
    query = query.where(eq(orders.deliveryMethod, filters.method as (typeof DELIVERY_METHODS)[number]));
  }
  if (filters.pincode && filters.pincode !== "all") {
    query = query.where(eq(orders.pincode, filters.pincode));
  }
  if (filters.district && filters.district !== "all") {
    query = query.where(eq(orders.district, filters.district));
  }
  if (filters.area && filters.area !== "all") {
    query = query.where(eq(orders.area, filters.area));
  }
  if (filters.q && filters.q.trim()) {
    const q = `%${filters.q.trim()}%`;
    query = query.where(
      or(
        like(orders.customerName, q),
        like(orders.phone, q),
        like(orders.address, q),
        like(orders.orderNumber, q),
        like(orders.pincode, q),
      ),
    );
  }
  return query.orderBy(desc(orders.createdAt));
}

export async function getDistinctPincodes(): Promise<string[]> {
  const db = getDb();
  const rows = await db.selectDistinct({ pincode: orders.pincode }).from(orders);
  return rows.map((r) => r.pincode).filter(Boolean).sort();
}

export async function getDistinctDistricts(): Promise<string[]> {
  const db = getDb();
  const rows = await db.selectDistinct({ district: orders.district }).from(orders);
  return rows.map((r) => r.district).filter((x): x is string => Boolean(x)).sort();
}

export async function getDistinctAreas(): Promise<string[]> {
  const db = getDb();
  const rows = await db.selectDistinct({ area: orders.area }).from(orders);
  return rows.map((r) => r.area).filter((x): x is string => Boolean(x)).sort();
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

// ---- Reports ----

export async function getReports() {
  const all = await listAllOrders();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const active = all.filter((o) => o.orderStatus !== "cancelled");
  const totalRevenue = active.reduce((s, o) => s + o.total, 0);
  const todayRows = all.filter((o) => new Date(o.createdAt).getTime() >= startOfToday);
  const todayRevenue = todayRows.filter((o) => o.orderStatus !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pending = all.filter((o) => o.orderStatus === "new" || o.orderStatus === "confirmed").length;
  const avgOrder = active.length ? Math.round(totalRevenue / active.length) : 0;

  const byStatus = ORDER_STATUSES.map((s) => {
    const rows = all.filter((o) => o.orderStatus === s);
    return { status: s, count: rows.length, revenue: rows.reduce((s, o) => s + o.total, 0) };
  });

  const byDay: { date: string; count: number; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dEnd = dStart + 86400000;
    const rows = all.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= dStart && t < dEnd;
    });
    byDay.push({
      date: d.toISOString().slice(0, 10),
      count: rows.length,
      revenue: rows.filter((o) => o.orderStatus !== "cancelled").reduce((s, o) => s + o.total, 0),
    });
  }

  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of all) {
    for (const it of o.items) {
      const cur = productMap.get(it.name) ?? { name: it.name, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.qty * it.price;
      productMap.set(it.name, cur);
    }
  }
  const topProducts = [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);

  const byPayment = PAYMENT_METHODS.map((m) => ({
    method: m,
    count: all.filter((o) => o.paymentMethod === m).length,
  })).filter((x) => x.count > 0);

  const byDelivery = DELIVERY_METHODS.map((m) => ({
    method: m,
    count: all.filter((o) => o.deliveryMethod === m).length,
  })).filter((x) => x.count > 0);

  return {
    totalOrders: all.length,
    totalRevenue,
    todayOrders: todayRows.length,
    todayRevenue,
    pending,
    avgOrder,
    byStatus,
    byDay,
    topProducts,
    byPayment,
    byDelivery,
  };
}
