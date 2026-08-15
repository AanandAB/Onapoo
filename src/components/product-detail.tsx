"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useLang, unitLabel } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";
import { formatPrice, whatsappLink, STORE_MAPS_LINK, DELIVERY_FREE_RADIUS_KM, DELIVERY_FREE_OVER_AMOUNT } from "@/lib/site";
import { LOW_STOCK_THRESHOLD } from "@/db/schema";
import type { ProductRow } from "@/lib/queries";

function FlowerGlyph({ className = "h-40 w-40" }: { className?: string }) {
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

export function ProductDetail({
  product,
}: {
  product: ProductRow;
}) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [imgErr, setImgErr] = useState(false);

  const ml = lang === "ml";
  const name = ml ? product.nameMl : product.nameEn;
  const color = ml ? product.colorMl : product.colorEn;
  const desc = ml ? product.descriptionMl || product.descriptionEn : product.descriptionEn;
  const out = product.stock <= 0;
  const low = !out && product.stock <= LOW_STOCK_THRESHOLD;

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  const wa = whatsappLink(
    ml
      ? `ഹലോ, എനിക്ക് ${product.nameMl} × ${qty} ഓർഡർ ചെയ്യണം`
      : `Hi, I'd like to order ${product.nameEn} × ${qty}`,
  );

  const onAdd = () =>
    add(
      { id: product.id, name: product.nameEn, nameMl: product.nameMl, unit: product.unit, price: product.price },
      qty,
    );

  const L = ml
    ? {
        back: "പൂക്കൾ",
        addToCart: "കൊട്ടയിൽ ചേർക്കൂ",
        orderWa: "WhatsApp-ൽ ഓർഡർ ചെയ്യൂ",
        delivery: "ഡെലിവറി",
        deliveryNote: `${DELIVERY_FREE_RADIUS_KM} കി.മീയിൽ താഴെ സൗജന്യം · ₹${DELIVERY_FREE_OVER_AMOUNT}-ൽ കൂടുതൽ ഓർഡറിന് സൗജന്യം`,
        qty: "എണ്ണം",
        out: "തീർന്നു",
        pickUp: "കടയിൽ നിന്ന് എടുക്കാം",
      }
    : {
        back: "All flowers",
        addToCart: "Add to cart",
        orderWa: "Order on WhatsApp",
        delivery: "Delivery",
        deliveryNote: `Free within ${DELIVERY_FREE_RADIUS_KM} km · free over ₹${DELIVERY_FREE_OVER_AMOUNT} · free store pickup`,
        qty: "Qty",
        out: "Sold out",
        pickUp: "Store pickup",
      };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/#shop"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-gold-deep"
      >
        <ChevronLeft className="h-4 w-4" />
        {L.back}
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Image */}
        <div className="kasavu-frame relative aspect-square overflow-hidden rounded-2xl bg-cream-dark">
          {product.image && !imgErr ? (
            <img
              src={product.image}
              alt={name}
              onError={() => setImgErr(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-gold/40">
              <FlowerGlyph className="h-40 w-40" />
            </div>
          )}
          {discount && (
            <span className="absolute left-4 top-4 rounded-full bg-chethi px-3 py-1 text-xs font-bold text-white shadow-sm">
              −{discount}%
            </span>
          )}
          {out && (
            <div className="absolute inset-0 grid place-items-center bg-ink/40">
              <span className="rounded-full bg-ink/80 px-4 py-1.5 text-sm font-semibold text-white">{L.out}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl" lang={lang}>
            {name}
          </h1>
          {color && <p className="mt-1 text-sm text-muted">{color}</p>}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold text-leaf-deep">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            <span className="text-sm text-muted">/ {unitLabel(product.unit, t)}</span>
          </div>

          {low && (
            <p className="mt-3 inline-flex rounded-full bg-marigold/15 px-3 py-1 text-sm font-semibold text-marigold-deep">
              Only {product.stock} left — order soon
            </p>
          )}

          {desc && <p className="mt-4 leading-relaxed text-muted">{desc}</p>}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15 bg-paper">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
                className="grid h-11 w-11 place-items-center rounded-full text-ink/70 hover:text-ink"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase"
                className="grid h-11 w-11 place-items-center rounded-full text-ink/70 hover:text-ink"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={qty}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v)) setQty(Math.max(1, Math.min(product.stock, v)));
              }}
              aria-label={L.qty}
              className="h-11 w-20 rounded-full border border-ink/15 bg-paper text-center text-base font-semibold focus:border-gold focus:outline-none"
            />
            <span className="text-sm text-muted">{unitLabel(product.unit, t)}</span>
            <button
              onClick={onAdd}
              disabled={out}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {L.addToCart}
            </button>
          </div>

          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.9.1.1.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.5.3.1.1.1.6-.1 1.2z" />
            </svg>
            {L.orderWa}
          </a>

          <div className="mt-6 space-y-2 rounded-2xl bg-cream-dark/60 p-4 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-gold-deep">🚚</span> {L.deliveryNote}
            </p>
            <a href={STORE_MAPS_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-leaf underline">
              <span>📍</span> {L.pickUp} · Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
