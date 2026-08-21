"use client";

import Link from "next/link";
import { useLang, unitLabel } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";
import { formatPrice, formatQty, lineTotal } from "@/lib/site";

export function CartDrawer() {
  const { lang, t } = useLang();
  const { items, open, setOpen, setQty, remove, subtotal, count } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop — light, no blur, so the customer can still see the shop */}
      <button
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink/20"
      />

      {/* Panel — right slide-in, keeps part of the page visible on mobile */}
      <div className="absolute right-0 top-0 flex h-full w-[88%] max-w-md flex-col bg-paper shadow-lift">
        <div className="flex items-center justify-between border-b border-gold/25 px-5 py-4">
          <p className="font-display text-lg font-semibold">
            {t("cart_title")} <span className="text-muted">({count})</span>
          </p>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/70 hover:bg-cream"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-16 text-center text-muted">{t("cart_empty")}</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold-deep">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 3c3 3 6 4.5 6 8a6 6 0 1 1-12 0c0-3.5 3-5 6-8z" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {lang === "ml" ? item.nameMl : item.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatPrice(item.price)} / {unitLabel(item.unit, t)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.id, item.unit === "kg" ? Math.max(0.05, item.qty - 0.25) : item.qty - 1)}
                        className="grid h-6 w-6 place-items-center rounded-full border border-ink/15 text-ink/70"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="min-w-[3.5rem] text-center text-sm font-semibold">{formatQty(item.qty, item.unit)}</span>
                      <button
                        onClick={() =>
                          setQty(
                            item.id,
                            Math.min(item.stock ?? Number.POSITIVE_INFINITY, item.qty + (item.unit === "kg" ? 0.25 : 1)),
                          )
                        }
                        disabled={item.qty >= (item.stock ?? Number.POSITIVE_INFINITY)}
                        className="grid h-6 w-6 place-items-center rounded-full border border-ink/15 text-ink/70 disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Increase"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="ml-auto text-xs text-chethi hover:underline"
                      >
                        {t("cart_remove")}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(lineTotal(item.price, item.qty))}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gold/25 px-5 py-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted">{t("cart_subtotal")}</span>
              <span className="font-display text-xl font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="mb-3 text-xs text-muted">{t("cart_note")}</p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block w-full rounded-full bg-gold py-3 text-center text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5"
            >
              {t("cart_checkout")}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 block w-full rounded-full border border-ink/15 py-3 text-center text-sm font-semibold text-ink hover:bg-cream"
            >
              {t("cart_continue")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
