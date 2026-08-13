"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";

function FlowerMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="currentColor">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={i}
            cx="16"
            cy="6.2"
            rx="3.2"
            ry="5.4"
            transform={`rotate(${i * 45} 16 16)`}
          />
        ))}
      </g>
      <circle cx="16" cy="16" r="3.4" fill="#b83a2b" />
    </svg>
  );
}

export function Header({ storeName, storeNameMl }: { storeName: string; storeNameMl: string }) {
  const { lang, toggle, t } = useLang();
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { href: "#shop", label: t("nav_shop") },
    { href: "#how", label: t("nav_how") },
    { href: "#contact", label: t("nav_contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gold/25 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold-deep">
            <FlowerMark className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold tracking-tight">
              {lang === "ml" ? storeNameMl : storeName}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">
              {lang === "ml" ? "ഓണപ്പൂക്കൾ · കണ്ണൂർ" : "Onam flowers · Kannur"}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-gold-deep"
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold-deep transition-colors hover:bg-gold/10"
          >
            <span>{lang === "ml" ? "മ" : "EN"}</span>
            <span className="text-ink/40">/</span>
            <span className={lang === "ml" ? "text-ink/40" : ""}>{lang === "ml" ? "EN" : "മ"}</span>
          </button>

          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-gold px-3.5 py-1.5 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12L6 6z" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            <span className="hidden sm:inline">{t("cart_checkout")}</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-chethi px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-ink md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-gold/25 bg-cream px-4 py-3 md:hidden">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/85 hover:bg-gold/10"
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
