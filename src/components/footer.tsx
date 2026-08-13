"use client";

import { useLang } from "@/lib/i18n";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";

export function Footer({ storeName, storeNameMl }: { storeName: string; storeNameMl: string }) {
  const { lang, t } = useLang();

  return (
    <footer id="contact" className="relative mt-24 border-t border-gold/25 bg-leaf-deep text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-semibold text-gold">
              {lang === "ml" ? storeNameMl : storeName}
            </p>
            <p className="mt-3 max-w-xs text-sm text-cream/75">{t("footer_tag")}</p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold/80">
              {lang === "ml" ? "ബന്ധപ്പെടുക" : "Contact"}
            </p>
            <a
              href={whatsappLink(lang === "ml" ? "ഹലോ, ഓണപ്പൂക്കൾ ഓർഡർ ചെയ്യണം" : "Hi, I'd like to order Onam flowers")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.9.1.1.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.5.3.1.1.1.6-.1 1.2z" />
              </svg>
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold/80">
              {lang === "ml" ? "ഡെലിവറി" : "Delivery"}
            </p>
            <p className="text-sm text-cream/75">
              {lang === "ml" ? "കണ്ണൂർ — 670643" : "Kannur — 670643"}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} {lang === "ml" ? storeNameMl : storeName} · {t("footer_rights")}
        </div>
      </div>
    </footer>
  );
}
