import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products, settings } from "@/db/schema";

export type ProductRow = typeof products.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;

export async function getCategories(): Promise<CategoryRow[]> {
  const db = getDb();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getProducts(): Promise<ProductRow[]> {
  const db = getDb();
  return db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.nameEn));
}

export async function getProductBySlug(slug: string): Promise<ProductRow | undefined> {
  const db = getDb();
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0];
}

export async function getFeaturedProducts(): Promise<ProductRow[]> {
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(eq(products.isFeatured, true))
    .orderBy(asc(products.sortOrder));
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  const db = getDb();
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value ?? "";
  return map;
}

export async function getStoreSettings() {
  const s = await getSettingsMap();
  return {
    storeName: s.store_name ?? "Onapookkal",
    storeNameMl: s.store_name_ml ?? "ഓണപ്പൂക്കൾ",
    whatsapp: s.whatsapp ?? "917034026295",
    deliveryCharge: parseInt(s.delivery_charge ?? "0", 10) || 0,
    announcementEn: s.announcement_en ?? "",
    announcementMl: s.announcement_ml ?? "",
  };
}
