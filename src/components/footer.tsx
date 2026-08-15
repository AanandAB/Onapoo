"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { WHATSAPP_DISPLAY, whatsappLink, STORE_MAPS_LINK } from "@/lib/site";
import { Nilavilakku, Vallam, FlowerGlyph, KasavuDivider, Thrikkakarappan, Kathakali } from "@/components/onam-decor";

export function Footer({ storeName, storeNameMl }: { storeName: string; storeNameMl: string }) {
  const { lang, t } = useLang();
  const ml = lang === "ml";

  const linkCls = "transition-colors hover:text-gold";

  return (
    <footer id="contact" className="relative mt-24 overflow-hidden bg-leaf-deep text-cream">
      {/* Kasavu border + Onam motifs */}
      <KasavuDivider className="h-4 w-full text-gold/80" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Vallam className="absolute -bottom-3 right-0 h-28 w-auto text-cream/[0.07]" />
        <Nilavilakku className="absolute -right-3 top-10 h-44 w-auto text-gold/10" />
        <Nilavilakku className="absolute -left-5 bottom-6 h-32 w-auto text-gold/[0.08]" />
        <FlowerGlyph className="absolute left-[30%] top-12 h-16 w-16 text-gold/[0.07]" />
        <FlowerGlyph className="absolute right-[28%] bottom-24 h-12 w-12 text-cream/[0.06]" />
        <FlowerGlyph className="absolute left-[12%] bottom-16 h-10 w-10 text-gold/[0.06]" />
        <Thrikkakarappan className="absolute -left-2 top-1/3 h-44 w-auto text-gold/[0.07]" />
        <Kathakali className="absolute left-[38%] bottom-8 h-32 w-auto text-cream/[0.06]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-12 sm:px-6 md:pb-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl font-semibold text-gold">
              {ml ? storeNameMl : storeName}
            </p>
            <p className="mt-3 max-w-xs text-sm text-cream/75">{t("footer_tag")}</p>
          </div>

          {/* Shop */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold/80">
              {ml ? "വാങ്ങൂ" : "Shop"}
            </p>
            <ul className="space-y-2 text-sm text-cream/75">
              <li>
                <a href="#shop" className={linkCls}>{ml ? "എല്ലാ പൂക്കളും" : "All flowers"}</a>
              </li>
              <li>
                <a href="#how" className={linkCls}>{ml ? "എങ്ങനെ പ്രവർത്തിക്കുന്നു" : "How it works"}</a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold/80">
              {ml ? "വിവരം" : "Info"}
            </p>
            <ul className="space-y-2 text-sm text-cream/75">
              <li><Link href="/about" className={linkCls}>{ml ? "ഞങ്ങളെ കുറിച്ച്" : "About"}</Link></li>
              <li><Link href="/faq" className={linkCls}>FAQ</Link></li>
              <li><Link href="/delivery" className={linkCls}>{ml ? "ഡെലിവറി" : "Delivery"}</Link></li>
              <li><Link href="/track" className={linkCls}>{ml ? "ഓർഡർ ട്രാക്ക്" : "Track order"}</Link></li>
              <li><Link href="/contact" className={linkCls}>{ml ? "ബന്ധപ്പെടുക" : "Contact"}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold/80">
              {ml ? "ബന്ധപ്പെടുക" : "Contact"}
            </p>
            <a
              href={whatsappLink(ml ? "ഹലോ, ഓണപ്പൂക്കൾ ഓർഡർ ചെയ്യണം" : "Hi, I'd like to order Onam flowers")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.9.1.1.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.5.3.1.1.1.6-.1 1.2z" />
              </svg>
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a
              href={STORE_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-sm text-cream/75 hover:text-gold"
            >
              📍 {ml ? "കടയിൽ നിന്ന് എടുക്കാം" : "Store pickup"} · Maps
            </a>
            <p className="mt-2 text-sm text-cream/75">
              {ml ? "കണ്ണൂർ — 670643" : "Kannur — 670643"}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} {ml ? storeNameMl : storeName} · {t("footer_rights")}
        </div>
      </div>
    </footer>
  );
}
