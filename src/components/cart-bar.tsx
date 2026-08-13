"use client";

import { useLang } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/site";

/** Floating "View cart" bar (mobile only) — shows once the cart has items. */
export function CartBar() {
  const { lang } = useLang();
  const { count, subtotal, setOpen } = useCart();

  if (count === 0) return null;

  return (
    <div
      className="fixed inset-x-3 z-30 md:hidden"
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-3.5 text-cream shadow-lift transition-transform active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6h15l-1.5 9h-12L6 6z" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
          </svg>
          {lang === "ml" ? "കൊട്ട കാണുക" : "View cart"} · {count} {lang === "ml" ? "ഇനങ്ങൾ" : count === 1 ? "item" : "items"}
        </span>
        <span className="font-display text-base font-semibold text-gold">{formatPrice(subtotal)}</span>
      </button>
    </div>
  );
}
