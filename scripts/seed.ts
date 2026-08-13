import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import type { ProductUnit } from "../src/db/schema";

type CategorySeed = {
  slug: string;
  nameEn: string;
  nameMl: string;
  color: string;
  sortOrder: number;
};

type ProductSeed = {
  slug: string;
  nameEn: string;
  nameMl: string;
  category: string; // category slug
  colorEn: string;
  colorMl: string;
  descriptionEn: string;
  descriptionMl: string;
  unit: ProductUnit;
  price: number;
  compareAtPrice?: number;
  isFeatured: boolean;
  sortOrder: number;
};

const CATEGORIES: CategorySeed[] = [
  { slug: "traditional", nameEn: "Traditional Flowers", nameMl: "പരമ്പരാഗത പൂക്കൾ", color: "#C0392B", sortOrder: 0 },
  { slug: "popular", nameEn: "Popular Flowers", nameMl: "ജനപ്രിയ പൂക്കൾ", color: "#D4A017", sortOrder: 1 },
  { slug: "petals", nameEn: "Petal Packs", nameMl: "ഇതൾ പാക്കുകൾ", color: "#E67E22", sortOrder: 2 },
  { slug: "kits", nameEn: "Pookalam Kits", nameMl: "പൂക്കളം കിറ്റുകൾ", color: "#8E44AD", sortOrder: 3 },
  { slug: "bulk", nameEn: "Bulk / Wholesale", nameMl: "ബൾക്ക് / മൊത്തം", color: "#27AE60", sortOrder: 4 },
];

const PRODUCTS: ProductSeed[] = [
  // --- Traditional ---
  {
    slug: "chethi-ixora", nameEn: "Chethi (Ixora)", nameMl: "ചെത്തി",
    category: "traditional", colorEn: "Red / Orange / Yellow", colorMl: "ചുവപ്പ് / ഓറഞ്ച് / മഞ്ഞ",
    descriptionEn: "The iconic Onam flower — the classic red star of every pookalam.",
    descriptionMl: "ഓണത്തിന്റെ ഐതിഹാസിക പൂവ് — എല്ലാ പൂക്കളത്തിന്റെയും ചുവന്ന താരം.",
    unit: "bunch", price: 50, compareAtPrice: 60, isFeatured: true, sortOrder: 0,
  },
  {
    slug: "thumba", nameEn: "Thumba (Ceylon Slitwort)", nameMl: "തുമ്പ",
    category: "traditional", colorEn: "White", colorMl: "വെള്ള",
    descriptionEn: "The most traditional white flower — rare and precious for pookalam.",
    descriptionMl: "ഏറ്റവും പരമ്പരാഗതമായ വെളുത്ത പൂവ് — പൂക്കളത്തിന് അപൂർവ്വവും വിലപ്പെട്ടതും.",
    unit: "bunch", price: 120, isFeatured: true, sortOrder: 1,
  },
  {
    slug: "kakka-poovu", nameEn: "Kakka Poovu", nameMl: "കാക്കപ്പൂവ്",
    category: "traditional", colorEn: "White", colorMl: "വെള്ള",
    descriptionEn: "Tiny traditional white flowers used to fill the pookalam's inner rings.",
    descriptionMl: "പൂക്കളത്തിന്റെ ഉൾവളയങ്ങൾ നിറയ്ക്കാൻ ഉപയോഗിക്കുന്ന ചെറിയ വെളുത്ത പൂക്കൾ.",
    unit: "bunch", price: 45, isFeatured: false, sortOrder: 2,
  },
  {
    slug: "kanakambaram-crossandra", nameEn: "Kanakambaram (Crossandra)", nameMl: "കനകാംബരം",
    category: "traditional", colorEn: "Orange / Yellow", colorMl: "ഓറഞ്ച് / മഞ്ഞ",
    descriptionEn: "The classic Kerala market flower, glowing orange for your carpet.",
    descriptionMl: "കേരള മാർക്കറ്റുകളിലെ പ്രിയപ്പെട്ട ഓറഞ്ച് പൂവ്.",
    unit: "bunch", price: 40, isFeatured: true, sortOrder: 3,
  },
  {
    slug: "chemparathi-hibiscus", nameEn: "Chemparathi (Hibiscus)", nameMl: "ചെമ്പരത്തി",
    category: "traditional", colorEn: "Red", colorMl: "ചുവപ്പ്",
    descriptionEn: "Bold deep-red hibiscus blooms, a traditional pookalam favourite.",
    descriptionMl: "കടും ചുവപ്പ് ചെമ്പരത്തി പൂക്കൾ — പരമ്പരാഗത പൂക്കളത്തിന്റെ പ്രിയപ്പെട്ടത്.",
    unit: "piece", price: 15, isFeatured: false, sortOrder: 4,
  },
  {
    slug: "vadamalli-globe-amaranth", nameEn: "Vadamalli (Globe Amaranth)", nameMl: "വാടാമല്ലി",
    category: "traditional", colorEn: "Purple / Pink", colorMl: "പർപ്പിൾ / പിങ്ക്",
    descriptionEn: "The purple accent that makes a pookalam pop with colour.",
    descriptionMl: "പൂക്കളത്തിന് നിറം നൽകുന്ന പർപ്പിൾ പൂക്കൾ.",
    unit: "bunch", price: 50, isFeatured: false, sortOrder: 5,
  },
  {
    slug: "shankhupushpam-butterfly-pea", nameEn: "Shankhupushpam (Butterfly Pea)", nameMl: "ശംഖുപുഷ്പം",
    category: "traditional", colorEn: "Blue", colorMl: "നീല",
    descriptionEn: "Rare blue flowers — the treasured blue ring of a traditional pookalam.",
    descriptionMl: "അപൂർവ്വ നീല പൂക്കൾ — പരമ്പരാഗത പൂക്കളത്തിന്റെ നീല വളയം.",
    unit: "bunch", price: 45, isFeatured: false, sortOrder: 6,
  },
  {
    slug: "mulla-jasmine", nameEn: "Mulla (Jasmine)", nameMl: "മുല്ല",
    category: "traditional", colorEn: "White", colorMl: "വെള്ള",
    descriptionEn: "Fragrant white jasmine for a sweet-scented pookalam.",
    descriptionMl: "സുഗന്ധമുള്ള വെളുത്ത മുല്ലപ്പൂക്കൾ.",
    unit: "bunch", price: 60, isFeatured: false, sortOrder: 7,
  },
  {
    slug: "arali-oleander", nameEn: "Arali (Oleander)", nameMl: "അരളി",
    category: "traditional", colorEn: "Pink / White", colorMl: "പിങ്ക് / വെള്ള",
    descriptionEn: "Traditional pink-white blooms. Handle with care (not edible).",
    descriptionMl: "പരമ്പരാഗത പിങ്ക്-വെള്ള പൂക്കൾ. ശ്രദ്ധയോടെ കൈകാര്യം ചെയ്യുക.",
    unit: "bunch", price: 40, isFeatured: false, sortOrder: 8,
  },
  {
    slug: "nandiarvattam-crape-jasmine", nameEn: "Nandiarvattam (Crape Jasmine)", nameMl: "നന്ത്യാർവട്ടം",
    category: "traditional", colorEn: "White", colorMl: "വെള്ള",
    descriptionEn: "Pinwheel white flowers, a clean and classic traditional choice.",
    descriptionMl: "വൃത്തിയുള്ള ക്ലാസിക് വെളുത്ത പൂക്കൾ.",
    unit: "bunch", price: 35, isFeatured: false, sortOrder: 9,
  },
  {
    slug: "kongini-lantana", nameEn: "Kongini (Lantana)", nameMl: "കോങ്ങിണി",
    category: "traditional", colorEn: "Multicolour", colorMl: "പല നിറങ്ങൾ",
    descriptionEn: "Tiny multicolour clusters that add joyful variety.",
    descriptionMl: "നിറങ്ങളുടെ വൈവിധ്യം നൽകുന്ന ചെറിയ പൂക്കൾ.",
    unit: "bunch", price: 30, isFeatured: false, sortOrder: 10,
  },
  {
    slug: "mukkutti", nameEn: "Mukkutti", nameMl: "മുക്കുറ്റി",
    category: "traditional", colorEn: "Yellow", colorMl: "മഞ്ഞ",
    descriptionEn: "Delicate little yellow flowers, a cherished traditional touch.",
    descriptionMl: "അതിലോലമായ മഞ്ഞ പൂക്കൾ.",
    unit: "bunch", price: 55, isFeatured: false, sortOrder: 11,
  },

  // --- Popular ---
  {
    slug: "rose-petals", nameEn: "Rose Petals", nameMl: "റോസ് ഇതളുകൾ",
    category: "popular", colorEn: "Mixed / Red / Pink", colorMl: "മിക്സഡ് / ചുവപ്പ് / പിങ്ക്",
    descriptionEn: "Loose rose petals, the top seller for fast, lush pookalams.",
    descriptionMl: "വേഗത്തിലും മനോഹരമായും പൂക്കളമൊരുക്കാൻ ഏറ്റവും കൂടുതൽ വിൽക്കുന്ന ഇതളുകൾ.",
    unit: "kg", price: 150, compareAtPrice: 180, isFeatured: true, sortOrder: 0,
  },
  {
    slug: "jamanthi-marigold", nameEn: "Jamanthi (Marigold)", nameMl: "ചെണ്ടുമല്ലി",
    category: "popular", colorEn: "Yellow / Orange", colorMl: "മഞ്ഞ / ഓറഞ്ച്",
    descriptionEn: "Cheerful golden marigolds, the bulk-friendly festival favourite.",
    descriptionMl: "സന്തോഷം നിറയ്ക്കുന്ന സ്വർണ്ണ ജമന്തിപ്പൂക്കൾ.",
    unit: "kg", price: 60, isFeatured: true, sortOrder: 1,
  },
  {
    slug: "chrysanthemum", nameEn: "Chrysanthemum", nameMl: "ജമന്തി",
    category: "popular", colorEn: "White / Yellow", colorMl: "വെള്ള / മഞ്ഞ",
    descriptionEn: "Soft white and yellow blooms for gentle colour transitions.",
    descriptionMl: "മൃദുവായ വെള്ളയും മഞ്ഞയും പൂക്കൾ.",
    unit: "bunch", price: 40, isFeatured: false, sortOrder: 2,
  },
  {
    slug: "thamara-lotus", nameEn: "Thamara (Lotus)", nameMl: "താമര",
    category: "popular", colorEn: "Pink / White", colorMl: "പിങ്ക് / വെള്ള",
    descriptionEn: "A single lotus as the elegant centrepiece of your pookalam.",
    descriptionMl: "പൂക്കളത്തിന്റെ മനോഹരമായ മധ്യഭാഗത്തിന് ഒരു താമര.",
    unit: "piece", price: 40, isFeatured: false, sortOrder: 3,
  },

  // --- Petal Packs ---
  {
    slug: "mixed-petal-pack", nameEn: "Mixed Petal Pack", nameMl: "മിക്സഡ് ഇതൾ പാക്ക്",
    category: "petals", colorEn: "Mixed", colorMl: "മിക്സഡ്",
    descriptionEn: "Pre-plucked mixed-colour petals — ready to scatter, zero effort.",
    descriptionMl: "മുൻകൂട്ടി പറിച്ചെടുത്ത പല നിറ ഇതളുകൾ — ഒരു പരിശ്രമവുമില്ലാതെ വിതറാൻ തയ്യാർ.",
    unit: "packet", price: 150, compareAtPrice: 180, isFeatured: true, sortOrder: 0,
  },
  {
    slug: "red-petal-pack", nameEn: "Red Petal Pack", nameMl: "ചുവപ്പ് ഇതൾ പാക്ക്",
    category: "petals", colorEn: "Red", colorMl: "ചുവപ്പ്",
    descriptionEn: "Single-colour red petals for bold, even rings.",
    descriptionMl: "ധീരവും തുല്യവുമായ വളയങ്ങൾക്ക് ഒറ്റ നിറത്തിലുള്ള ചുവപ്പ് ഇതളുകൾ.",
    unit: "packet", price: 120, isFeatured: false, sortOrder: 1,
  },
  {
    slug: "yellow-petal-pack", nameEn: "Yellow Petal Pack", nameMl: "മഞ്ഞ ഇതൾ പാക്ക്",
    category: "petals", colorEn: "Yellow", colorMl: "മഞ്ഞ",
    descriptionEn: "Sunny yellow petals for a warm, festive glow.",
    descriptionMl: "ഉത്സവ പ്രഭ നൽകുന്ന മഞ്ഞ ഇതളുകൾ.",
    unit: "packet", price: 120, isFeatured: false, sortOrder: 2,
  },

  // --- Kits ---
  {
    slug: "pookalam-kit-small", nameEn: "Daily Pookalam Kit — Small", nameMl: "ചെറിയ പൂക്കളം കിറ്റ്",
    category: "kits", colorEn: "Curated mix", colorMl: "തിരഞ്ഞെടുത്ത മിശ്രണം",
    descriptionEn: "A curated mix for a small daily pookalam — everything included.",
    descriptionMl: "ചെറിയ ദിവസേനയുള്ള പൂക്കളത്തിന് ആവശ്യമായതെല്ലാം ഉൾപ്പെട്ട കിറ്റ്.",
    unit: "kit", price: 300, isFeatured: true, sortOrder: 0,
  },
  {
    slug: "pookalam-kit-large", nameEn: "Daily Pookalam Kit — Large", nameMl: "വലിയ പൂക്കളം കിറ്റ്",
    category: "kits", colorEn: "Curated mix", colorMl: "തിരഞ്ഞെടുത്ത മിശ്രണം",
    descriptionEn: "A generous curated mix for a big, show-stopping pookalam.",
    descriptionMl: "വലിയ പൂക്കളത്തിന് ധാരാളം പൂക്കൾ അടങ്ങിയ കിറ്റ്.",
    unit: "kit", price: 550, isFeatured: false, sortOrder: 1,
  },
  {
    slug: "thiruvonam-special-kit", nameEn: "Thiruvonam Special Kit", nameMl: "തിരുവോണം സ്പെഷ്യൽ കിറ്റ്",
    category: "kits", colorEn: "Premium mix", colorMl: "പ്രീമിയം മിശ്രണം",
    descriptionEn: "The grand Thiruvonam centrepiece kit with premium flowers.",
    descriptionMl: "പ്രീമിയം പൂക്കളോടെയുള്ള തിരുവോണം ദിന പ്രത്യേക കിറ്റ്.",
    unit: "kit", price: 800, compareAtPrice: 950, isFeatured: true, sortOrder: 2,
  },

  // --- Bulk ---
  {
    slug: "marigold-bulk", nameEn: "Marigold — Bulk", nameMl: "ജമന്തി ബൾക്ക്",
    category: "bulk", colorEn: "Yellow / Orange", colorMl: "മഞ്ഞ / ഓറഞ്ച്",
    descriptionEn: "Bulk marigold by the kilo for large pookalams and venues.",
    descriptionMl: "വലിയ പൂക്കളങ്ങൾക്കും വേദികൾക്കുമായി കിലോ കണക്കിൽ ജമന്തി.",
    unit: "kg", price: 50, isFeatured: false, sortOrder: 0,
  },
  {
    slug: "rose-petals-bulk", nameEn: "Rose Petals — Bulk", nameMl: "റോസ് ഇതൾ ബൾക്ക്",
    category: "bulk", colorEn: "Mixed", colorMl: "മിക്സഡ്",
    descriptionEn: "Bulk rose petals for filling large areas fast and beautifully.",
    descriptionMl: "വലിയ ഭാഗങ്ങൾ വേഗത്തിൽ നിറയ്ക്കാൻ ബൾക്ക് റോസ് ഇതളുകൾ.",
    unit: "kg", price: 120, isFeatured: false, sortOrder: 1,
  },
  {
    slug: "tulasi-karuka", nameEn: "Tulasi & Karuka (Green)", nameMl: "തുളസി & കറുക",
    category: "bulk", colorEn: "Green", colorMl: "പച്ച",
    descriptionEn: "Fresh green leaves and grass for the pookalam's outer green ring.",
    descriptionMl: "പൂക്കളത്തിന്റെ പുറം പച്ച വളയത്തിന് പച്ച ഇലകളും പുല്ലും.",
    unit: "bunch", price: 25, isFeatured: false, sortOrder: 2,
  },
];

const SETTINGS: [string, string][] = [
  ["store_name", "Onapookkal"],
  ["store_name_ml", "ഓണപ്പൂക്കൾ"],
  ["whatsapp", "917034026295"],
  ["delivery_charge", "30"],
  ["delivery_pincode", "670643"],
  ["announcement_en", "Fresh Onam flowers delivered across Kannur — order early for Thiruvonam!"],
  ["announcement_ml", "കണ്ണൂരിലുടനീളം പുതിയ ഓണപ്പൂക്കൾ — തിരുവോണത്തിന് നേരത്തെ ഓർഡർ ചെയ്യൂ!"],
];

// Map product slug -> image file in public/images/flowers/.
// `null` = no image yet (storefront shows a branded glyph; admin uploads later).
// Shared entries point redundant variants at an existing downloaded photo.
const IMAGE_MAP: Record<string, string | null> = {
  "mixed-petal-pack": "fallback_multi",
  "yellow-petal-pack": "jamanthi-marigold",
  "pookalam-kit-large": "pookalam-kit-small",
  "marigold-bulk": "jamanthi-marigold",
  "rose-petals-bulk": "rose-petals",
  "tulasi-karuka": null,
};

function imageFor(slug: string): string | null {
  const mapped = IMAGE_MAP[slug];
  if (mapped === null) return null;
  return `/images/flowers/${mapped ?? slug}.jpg`;
}

async function main() {
  const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>();
  const db = drizzle(env.DB, { schema });

  // Idempotent: clear in dependency order
  await db.delete(schema.orders);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.offers);
  await db.delete(schema.admins);
  await db.delete(schema.settings);

  // Categories + slug->id map
  const catIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const id = crypto.randomUUID();
    catIdBySlug.set(c.slug, id);
    await db.insert(schema.categories).values({
      id,
      slug: c.slug,
      nameEn: c.nameEn,
      nameMl: c.nameMl,
      color: c.color,
      sortOrder: c.sortOrder,
    });
  }

  // Products
  for (const p of PRODUCTS) {
    const categoryId = catIdBySlug.get(p.category);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.category}`);
    await db.insert(schema.products).values({
      id: crypto.randomUUID(),
      slug: p.slug,
      nameEn: p.nameEn,
      nameMl: p.nameMl,
      categoryId,
      colorEn: p.colorEn,
      colorMl: p.colorMl,
      descriptionEn: p.descriptionEn,
      descriptionMl: p.descriptionMl,
      unit: p.unit,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      stockStatus: "in_stock",
      isFeatured: p.isFeatured,
      sortOrder: p.sortOrder,
      image: imageFor(p.slug),
    });
  }

  // Admin user
  const passwordHash = await hashPassword("onam2026");
  await db.insert(schema.admins).values({
    id: crypto.randomUUID(),
    username: "admin",
    passwordHash,
  });

  // Settings
  for (const [key, value] of SETTINGS) {
    await db.insert(schema.settings).values({ key, value });
  }

  await dispose();

  console.log(`Seeded: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, 1 admin (admin / onam2026), ${SETTINGS.length} settings.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
