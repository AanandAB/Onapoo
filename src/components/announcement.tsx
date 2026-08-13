"use client";

import { useLang } from "@/lib/i18n";

export function AnnouncementBar({ en, ml }: { en: string; ml: string }) {
  const { lang } = useLang();
  const text = lang === "ml" ? ml : en;
  if (!text) return null;
  return (
    <div className="bg-leaf-deep text-center text-cream">
      <p className="mx-auto max-w-7xl px-4 py-2 text-xs font-medium tracking-wide sm:text-sm">
        <span className="mr-2 text-marigold">✿</span>
        {text}
        <span className="ml-2 text-marigold">✿</span>
      </p>
    </div>
  );
}
