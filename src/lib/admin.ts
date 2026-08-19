import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asc, count, desc, eq, like, or } from "drizzle-orm";
import { COOKIE_NAME, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { getDb } from "@/db";
import { parseLocation, geocodePincode } from "@/lib/geocode";
import {
  categories,
  coupons,
  expenses,
  offers,
  orders,
  products,
  purchases,
  vendors,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  DELIVERY_METHODS,
  type OrderStatus,
  type PurchaseRow,
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

export async function listCoupons() {
  const db = getDb();
  return db.select().from(coupons).orderBy(asc(coupons.used), asc(coupons.code));
}

export async function listExpenses() {
  const db = getDb();
  return db.select().from(expenses).orderBy(desc(expenses.createdAt));
}

export async function listVendors() {
  const db = getDb();
  return db.select().from(vendors).orderBy(asc(vendors.name));
}

export async function getVendorById(id: string) {
  const db = getDb();
  const [v] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
  return v ?? null;
}

export type PurchaseWithVendor = PurchaseRow & { vendorName: string | null };

export async function listPurchases(): Promise<PurchaseWithVendor[]> {
  const db = getDb();
  const [all, allVendors] = await Promise.all([
    db.select().from(purchases).orderBy(desc(purchases.createdAt)),
    db.select().from(vendors),
  ]);
  const nameById = new Map(allVendors.map((v) => [v.id, v.name]));
  return all.map((p) => ({ ...p, vendorName: nameById.get(p.vendorId ?? "") ?? null }));
}

export type ProfitReport = {
  revenue: number;
  totalDiscounts: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  totalPurchases: number;
  netProfit: number;
  ordersCount: number;
  daily: { date: string; revenue: number; cost: number; profit: number; netProfit: number }[];
};

// Revenue = subtotal − coupon discount (delivery fees are pass-through, not profit).
// COGS    = Σ (product costPrice × qty sold) using the CURRENT cost price.
// Net     = (revenue − COGS) − additional expenses.
export async function getProfitReport(): Promise<ProfitReport> {
  const db = getDb();
  const [allOrders, allProducts, allExpenses, allPurchases] = await Promise.all([
    db.select().from(orders).all(),
    db.select().from(products).all(),
    db.select().from(expenses).all(),
    db.select().from(purchases).all(),
  ]);

  const costById = new Map(allProducts.map((p) => [p.id, p.costPrice]));

  let revenue = 0;
  let cogs = 0;
  const dayMap = new Map<string, { revenue: number; cost: number; profit: number }>();

  for (const o of allOrders) {
    if (o.orderStatus === "cancelled") continue;
    const rev = o.subtotal - (o.discount ?? 0);
    let cost = 0;
    for (const it of o.items ?? []) {
      // Use the per-item cost snapshot when present (orders placed after the
      // snapshot feature), otherwise fall back to the current product cost.
      cost += (it.costPrice ?? costById.get(it.productId) ?? 0) * it.qty;
    }
    revenue += rev;
    cogs += cost;

    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    const d = dayMap.get(day) ?? { revenue: 0, cost: 0, profit: 0 };
    d.revenue += rev;
    d.cost += cost;
    d.profit += rev - cost;
    dayMap.set(day, d);
  }

  // Attribute expenses to the day they were recorded (for the per-day net-profit chart).
  const expenseByDay = new Map<string, number>();
  for (const e of allExpenses) {
    const key = new Date(e.createdAt).toISOString().slice(0, 10);
    expenseByDay.set(key, (expenseByDay.get(key) ?? 0) + e.amount);
  }

  // Last 14 days (fill gaps with zeroes).
  const daily: { date: string; revenue: number; cost: number; profit: number; netProfit: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    const d = dayMap.get(key);
    const gross = d?.profit ?? 0;
    daily.push({
      date: key,
      revenue: d?.revenue ?? 0,
      cost: d?.cost ?? 0,
      profit: gross,
      netProfit: gross - (expenseByDay.get(key) ?? 0),
    });
  }

  const totalExpenses = allExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPurchases = allPurchases.reduce((s, p) => s + p.cost, 0);

  return {
    revenue,
    totalDiscounts: allOrders
      .filter((o) => o.orderStatus !== "cancelled")
      .reduce((s, o) => s + (o.discount ?? 0), 0),
    cogs,
    grossProfit: revenue - cogs,
    totalExpenses,
    totalPurchases,
    netProfit: revenue - cogs - totalExpenses,
    ordersCount: allOrders.filter((o) => o.orderStatus !== "cancelled").length,
    daily,
  };
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

export type MapOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  pincode: string;
  area: string | null;
  district: string | null;
  orderStatus: OrderStatus;
  deliveryDate: string | null;
  phone: string;
  lat: number;
  lng: number;
  approximate: boolean;
};

// Delivery orders still needing delivery (excl. cancelled + delivered), with
// coordinates resolved from shared location (exact) or pincode geocode (approximate).
export async function getDeliveryMapOrders(): Promise<{
  plotted: MapOrder[];
  unplotted: {
    orderNumber: string;
    customerName: string;
    address: string;
    pincode: string;
    orderStatus: OrderStatus;
  }[];
}> {
  const db = getDb();
  const all = await db
    .select()
    .from(orders)
    .where(eq(orders.deliveryMethod, "delivery"))
    .all();

  const active = all.filter(
    (o) => o.orderStatus !== "cancelled" && o.orderStatus !== "delivered",
  );

  const plotted: MapOrder[] = [];
  const unplotted: {
    orderNumber: string;
    customerName: string;
    address: string;
    pincode: string;
    orderStatus: OrderStatus;
  }[] = [];

  for (const o of active) {
    let lat: number | null = null;
    let lng: number | null = null;
    let approximate = false;

    if (o.location) {
      const parsed = parseLocation(o.location);
      if (parsed) {
        lat = parsed.lat;
        lng = parsed.lng;
      }
    }
    if (lat === null && lng === null && o.pincode) {
      const geo = await geocodePincode(o.pincode);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
        approximate = true;
      }
    }

    if (lat === null || lng === null) {
      unplotted.push({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        address: o.address,
        pincode: o.pincode,
        orderStatus: o.orderStatus,
      });
      continue;
    }

    plotted.push({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      address: o.address,
      pincode: o.pincode,
      area: o.area,
      district: o.district,
      orderStatus: o.orderStatus,
      deliveryDate: o.deliveryDate,
      phone: o.phone,
      lat,
      lng,
      approximate,
    });
  }

  return { plotted, unplotted };
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
      count: rows.filter((o) => o.orderStatus !== "cancelled").length,
      revenue: rows.filter((o) => o.orderStatus !== "cancelled").reduce((s, o) => s + o.total, 0),
    });
  }

  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of active) {
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
    count: active.filter((o) => o.paymentMethod === m).length,
  })).filter((x) => x.count > 0);

  const byDelivery = DELIVERY_METHODS.map((m) => ({
    method: m,
    count: active.filter((o) => o.deliveryMethod === m).length,
  })).filter((x) => x.count > 0);

  return {
    totalOrders: active.length,
    totalRevenue,
    todayOrders: todayRows.filter((o) => o.orderStatus !== "cancelled").length,
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
