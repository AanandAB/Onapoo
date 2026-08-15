"use client";

import { useEffect, useState } from "react";
import { Flower2, Sparkles, ShoppingCart, PackageSearch } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";
import { whatsappLink } from "@/lib/site";

function WhatsAppGlyph({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.9.1.1.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.5.3.1.1.1.6-.1 1.2z" />
    </svg>
  );
}

/** Persistent mobile bottom navigation (hidden on md+). */
export function BottomNav() {
  const { lang } = useLang();
  const { count, setOpen } = useCart();
  const [section, setSection] = useState<"shop" | "how">("shop");

  useEffect(() => {
    const onScroll = () => {
      const how = document.getElementById("how");
      setSection(how && how.getBoundingClientRect().top < window.innerHeight * 0.5 ? "how" : "shop");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = whatsappLink(
    lang === "ml" ? "ഹലോ, ഓണപ്പൂക്കൾ ഓർഡർ ചെയ്യണം" : "Hi, I'd like to order Onam flowers",
  );

  const itemCls =
    "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-transform active:scale-95";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="grid h-16 grid-cols-5">
        <a href="#shop" className={itemCls}>
          <Flower2 className={`h-6 w-6 ${section === "shop" ? "text-gold-deep" : "text-ink/55"}`} />
          <span className={section === "shop" ? "font-semibold text-gold-deep" : "text-ink/60"}>
            {lang === "ml" ? "പൂക്കൾ" : "Shop"}
          </span>
        </a>
        <a href="#how" className={itemCls}>
          <Sparkles className={`h-6 w-6 ${section === "how" ? "text-gold-deep" : "text-ink/55"}`} />
          <span className={section === "how" ? "font-semibold text-gold-deep" : "text-ink/60"}>
            {lang === "ml" ? "എങ്ങനെ" : "How"}
          </span>
        </a>
        <a href="/track" className={itemCls}>
          <PackageSearch className="h-6 w-6 text-ink/55" />
          <span className="text-ink/60">{lang === "ml" ? "ട്രാക്ക്" : "Track"}</span>
        </a>
        <button onClick={() => setOpen(true)} className={itemCls} aria-label="Open cart">
          <span className="relative">
            <ShoppingCart className="h-6 w-6 text-ink/55" />
            {count > 0 && (
              <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-chethi px-1 text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </span>
          <span className="text-ink/60">{lang === "ml" ? "കൊട്ട" : "Cart"}</span>
        </button>
        <a href={wa} target="_blank" rel="noopener noreferrer" className={itemCls}>
          <WhatsAppGlyph className="h-6 w-6 text-[#25D366]" />
          <span className="text-ink/60">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
