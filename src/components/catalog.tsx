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
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...products]
      .filter((p) => {
        if (active !== "all" && p.categoryId !== active) return false;
        if (!q) return true;
        return (
          p.nameEn.toLowerCase().includes(q) ||
          (p.nameMl ?? "").toLowerCase().includes(q) ||
          (p.colorEn ?? "").toLowerCase().includes(q) ||
          (p.colorMl ?? "").toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder,
      );
    return list;
  }, [products, active, query]);

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

        {/* Search */}
        <div className="relative mb-6">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ml" ? "പൂക്കൾ തിരയൂ…" : "Search flowers…"}
            className="w-full rounded-full border border-ink/15 bg-paper py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
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
