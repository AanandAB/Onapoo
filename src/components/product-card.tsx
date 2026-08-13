"use client";

import { useState } from "react";
import { useLang, unitLabel } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/site";
import type { ProductRow } from "@/lib/queries";

function FlowerGlyph({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="currentColor">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx="16" cy="6.2" rx="3.2" ry="5.4" transform={`rotate(${i * 45} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="3.4" fill="currentColor" />
    </svg>
  );
}

export function ProductCard({ product }: { product: ProductRow }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const name = lang === "ml" ? product.nameMl : product.nameEn;
  const color = lang === "ml" ? product.colorMl : product.colorEn;
  const out = product.stockStatus === "out_of_stock";

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  const onAdd = () => {
    if (out) return;
    add({
      id: product.id,
      name: product.nameEn,
      nameMl: product.nameMl,
      unit: product.unit,
      price: product.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="kasavu-frame group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-soft transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
        {product.image && !imgErr ? (
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gold/40">
            <FlowerGlyph className="h-20 w-20" />
          </div>
        )}

        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-chethi px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            −{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-cream shadow-sm">
            ★
          </span>
        )}
        {out && (
          <div className="absolute inset-0 grid place-items-center bg-ink/40">
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
              {t("out_of_stock")}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-ml text-base font-semibold leading-snug" lang={lang}>
          {name}
        </h3>
        <p className="mt-0.5 text-xs text-muted">{color}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold text-leaf-deep">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span className="ml-auto text-xs text-muted">/ {unitLabel(product.unit, t)}</span>
        </div>

        <button
          onClick={onAdd}
          disabled={out}
          className={`mt-4 rounded-full py-2.5 text-sm font-semibold transition-all ${
            out
              ? "cursor-not-allowed bg-ink/10 text-ink/40"
              : added
                ? "bg-leaf text-cream"
                : "bg-gold text-cream hover:-translate-y-0.5 hover:bg-gold-deep"
          }`}
        >
          {out ? t("out_of_stock") : added ? t("added") : t("add_to_cart")}
        </button>
      </div>
    </article>
  );
}
