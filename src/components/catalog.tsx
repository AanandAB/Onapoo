"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/motion";
import type { ProductRow, CategoryRow } from "@/lib/queries";

export function Catalog({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: CategoryRow[];
}) {
  const { lang, t } = useLang();
  const [active, setActive] = useState<string>("all");

  const sorted = useMemo(() => {
    const list = [...products].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder,
    );
    return active === "all" ? list : list.filter((p) => p.categoryId === active);
  }, [products, active]);

  const catName = (c: CategoryRow) => (lang === "ml" ? c.nameMl : c.nameEn);

  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chethi">
              {t("sec_categories")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              {lang === "ml" ? "എല്ലാ പൂക്കളും" : "All flowers"}
            </h2>
          </div>
          <p className="text-sm text-muted">
            {sorted.length} {lang === "ml" ? "ഇനങ്ങൾ" : "items"}
          </p>
        </div>

        {/* Category filter pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive("all")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              active === "all"
                ? "border-gold bg-gold text-cream"
                : "border-gold/40 bg-paper text-ink/80 hover:bg-gold/10"
            }`}
          >
            {lang === "ml" ? "എല്ലാം" : "All"}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active === c.id
                  ? "border-transparent bg-ink text-cream"
                  : "border-gold/40 bg-paper text-ink/80 hover:bg-gold/10"
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: c.color ?? "#c79a3b" }}
              />
              {catName(c)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {sorted.length === 0 && (
          <p className="py-16 text-center text-muted">
            {lang === "ml" ? "ഇനങ്ങളൊന്നും കണ്ടെത്തിയില്ല." : "No items found."}
          </p>
        )}
      </Reveal>
    </section>
  );
}
