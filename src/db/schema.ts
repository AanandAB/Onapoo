import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const pk = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
};

// ---- Enum vocabularies (TypeScript narrowing; validation at app layer) ----

export const PRODUCT_UNITS = [
  "bunch", // കെട്ട് / bunch on stem
  "kg", // കിലോ / per kilogram
  "packet", // പാക്കറ്റ് / pre-plucked petal pack
  "kit", // കിറ്റ് / curated daily pookalam kit
  "piece", // എണ്ണം / per piece (lotus, etc.)
] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const STOCK_STATUSES = [
  "in_stock",
  "low_stock",
  "out_of_stock",
] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

// Show a "low stock" warning when the remaining quantity is at or below this.
export const LOW_STOCK_THRESHOLD = 5;

export const OFFER_TYPES = ["percent", "flat"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export const PAYMENT_METHODS = ["cod", "whatsapp", "razorpay"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_METHODS = ["delivery", "pickup"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

// ---- JSON shapes ----

export type OrderItem = {
  productId: string;
  name: string;
  nameMl: string;
  unit: string;
  qty: number;
  price: number; // rupees per unit
  costPrice?: number; // rupees per unit — buying cost snapshotted at order time
};

// ---- Tables ----

export const categories = sqliteTable(
  "categories",
  {
    id: pk(),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameMl: text("name_ml").notNull(),
    color: text("color"), // hex accent for UI swatch
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const products = sqliteTable(
  "products",
  {
    id: pk(),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameMl: text("name_ml").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    colorEn: text("color_en"),
    colorMl: text("color_ml"),
    descriptionEn: text("description_en"),
    descriptionMl: text("description_ml"),
    unit: text("unit", { enum: PRODUCT_UNITS }).notNull().default("bunch"),
    price: integer("price").notNull(), // rupees (integer) — selling price
    costPrice: integer("cost_price").notNull().default(0), // rupees — what the shop pays per unit (for profit tracking)
    compareAtPrice: integer("compare_at_price"), // strike-through "was" price
    stockStatus: text("stock_status", { enum: STOCK_STATUSES })
      .notNull()
      .default("in_stock"),
    stock: integer("stock").notNull().default(0), // available quantity (0 = out of stock)
    isFeatured: integer("is_featured", { mode: "boolean" })
      .notNull()
      .default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    image: text("image"), // primary image (URL or data URL)
    images: text("images", { mode: "json" }).$type<string[]>(), // full gallery (includes primary)
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_featured_idx").on(t.isFeatured),
  ],
);

export const offers = sqliteTable(
  "offers",
  {
    id: pk(),
    titleEn: text("title_en").notNull(),
    titleMl: text("title_ml").notNull(),
    type: text("type", { enum: OFFER_TYPES }).notNull().default("percent"),
    value: integer("value").notNull(), // percent (0-100) or flat rupees
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    startAt: integer("start_at", { mode: "timestamp" }),
    endAt: integer("end_at", { mode: "timestamp" }),
    bannerTextEn: text("banner_text_en"),
    bannerTextMl: text("banner_text_ml"),
    productIds: text("product_ids", { mode: "json" }).$type<string[]>(), // null = sitewide
    ...timestamps,
  },
  (t) => [index("offers_active_idx").on(t.active)],
);

export const orders = sqliteTable(
  "orders",
  {
    id: pk(),
    orderNumber: text("order_number").notNull(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address").notNull(),
    pincode: text("pincode").notNull(),
    district: text("district"),
    area: text("area"),
    landmark: text("landmark"),
    deliveryDate: text("delivery_date"), // ISO date string
    deliveryMethod: text("delivery_method", { enum: DELIVERY_METHODS })
      .notNull()
      .default("delivery"),
    location: text("location"), // "lat,lng" when customer shares location (delivery)
    items: text("items", { mode: "json" }).$type<OrderItem[]>().notNull(),
    subtotal: integer("subtotal").notNull(),
    deliveryCharge: integer("delivery_charge").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    couponCode: text("coupon_code"),
    total: integer("total").notNull(),
    paymentMethod: text("payment_method", { enum: PAYMENT_METHODS })
      .notNull()
      .default("cod"),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUSES })
      .notNull()
      .default("pending"),
    orderStatus: text("order_status", { enum: ORDER_STATUSES })
      .notNull()
      .default("new"),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.orderNumber),
    index("orders_status_idx").on(t.orderStatus),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const admins = sqliteTable(
  "admins",
  {
    id: pk(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("admins_username_idx").on(t.username)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const coupons = sqliteTable("coupons", {
  code: text("code").primaryKey(),
  type: text("type", { enum: ["percent", "flat", "free_delivery"] }).notNull(),
  value: integer("value").notNull().default(0), // percent (1-100) / flat rupees / 0 for free_delivery
  phone: text("phone").notNull(), // normalized phone, no country code
  used: integer("used", { mode: "boolean" }).notNull().default(false),
});

export const expenses = sqliteTable("expenses", {
  id: pk(),
  label: text("label").notNull(),
  amount: integer("amount").notNull(), // rupees (integer)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const vendors = sqliteTable("vendors", {
  id: pk(),
  name: text("name").notNull(),
  phone: text("phone"),
  location: text("location"),
  supplies: text("supplies"), // what they supply / notes
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const purchases = sqliteTable(
  "purchases",
  {
    id: pk(),
    vendorId: text("vendor_id"), // optional — "only if I have a vendor"
    item: text("item").notNull(), // what was bought, e.g. "Marigold"
    quantity: text("quantity"), // free text, e.g. "10 kg" / "5 bunches"
    cost: integer("cost").notNull(), // rupees (integer) — total paid
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [index("purchases_vendor_idx").on(t.vendorId)],
);

// ---- Inferred row types ----

export type CategoryRow = typeof categories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type OfferRow = typeof offers.$inferSelect;
export type CouponRow = typeof coupons.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;
export type VendorRow = typeof vendors.$inferSelect;
export type PurchaseRow = typeof purchases.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type AdminRow = typeof admins.$inferSelect;
