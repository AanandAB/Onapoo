"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";

export function CartToast() {
  const { toast } = useCart();
  const { lang, t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  if (!toast || !show) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 px-4">
      <div className="flex items-center gap-2 rounded-full bg-ink/90 px-4 py-2.5 text-sm font-semibold text-cream shadow-lift">
        <span className="text-leaf">✓</span>
        <span>
          {t("added")} — {lang === "ml" ? toast.nameMl : toast.nameEn}
          <span className="text-cream/70"> · {toast.count} {t("in_basket")}</span>
        </span>
      </div>
    </div>
  );
}
