"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang, unitLabel } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";
import { useTilt } from "@/components/motion";
import { formatPrice } from "@/lib/site";
import { LOW_STOCK_THRESHOLD } from "@/db/schema";
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
  const { add, setQty, items } = useCart();
  const [imgErr, setImgErr] = useState(false);
  const { ref, onMouseMove, onMouseLeave } = useTilt(7);

  const name = lang === "ml" ? product.nameMl : product.nameEn;
  const color = lang === "ml" ? product.colorMl : product.colorEn;
  const out = product.stock <= 0;
  const low = !out && product.stock <= LOW_STOCK_THRESHOLD;

  const qty = items.find((i) => i.id === product.id)?.qty ?? 0;

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  const isKg = product.unit === "kg";

  const onAdd = () => {
    if (out) return;
    add(
      {
        id: product.id,
        name: product.nameEn,
        nameMl: product.nameMl,
        unit: product.unit,
        price: product.price,
      },
      isKg ? 0.5 : 1,
    );
  };

  return (
    <article
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="kasavu-frame group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-soft transition-shadow duration-300 will-change-transform hover:shadow-lift"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-cream-dark">
        {product.image && !imgErr ? (
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            decoding="async"
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
        {low && (
          <span className="absolute bottom-3 left-3 rounded-full bg-marigold px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            Only {product.stock} left
          </span>
        )}
        {out && (
          <div className="absolute inset-0 grid place-items-center bg-ink/40">
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
              {t("out_of_stock")}
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-ml text-base font-semibold leading-snug transition-colors hover:text-gold-deep" lang={lang}>
            {name}
          </h3>
        </Link>
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

        {out ? (
          <button
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-full bg-ink/10 py-2.5 text-sm font-semibold text-ink/40"
          >
            {t("out_of_stock")}
          </button>
        ) : qty === 0 ? (
          <button
            onClick={onAdd}
            className="mt-4 w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-cream transition-all hover:-translate-y-0.5 hover:bg-gold-deep"
          >
            {t("add_to_cart")}
          </button>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-1 rounded-full border border-gold/50 bg-gold/10 px-1 py-1">
            <button
              onClick={() => setQty(product.id, isKg ? Math.max(0.05, qty - 0.25) : qty - 1)}
              aria-label="Decrease"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper text-lg font-semibold text-ink shadow-sm hover:bg-cream-dark"
            >
              −
            </button>
            <span className="min-w-0 truncate px-2 text-center text-xs font-semibold sm:text-sm">
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={isKg ? Math.round(qty * 1000) : qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isNaN(v)) return;
                  setQty(
                    product.id,
                    isKg ? Math.max(0.05, Math.min(product.stock, v / 1000)) : Math.max(1, Math.min(product.stock, v)),
                  );
                }}
                aria-label="Quantity"
                className="w-12 rounded-md bg-paper text-center text-sm font-semibold focus:outline-none"
              />
              <span className="ml-1 text-muted">{isKg ? "g" : t("in_basket")}</span>
            </span>
            <button
              onClick={() => setQty(product.id, Math.min(product.stock, qty + (isKg ? 0.25 : 1)))}
              aria-label="Increase"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-lg font-semibold text-cream shadow-sm hover:bg-gold-deep"
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
