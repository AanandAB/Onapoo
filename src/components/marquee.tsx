"use client";

import { useLang } from "@/lib/i18n";

const FLOWERS_EN = ["Chethi", "Marigold", "Thumba", "Vadamalli", "Hibiscus", "Jasmine", "Lotus", "Kanakambaram"];
const FLOWERS_ML = ["ചെത്തി", "ജമന്തി", "തുമ്പ", "വാടാമല്ലി", "ചെമ്പരത്തി", "മുല്ല", "താമര", "കനകാംബരം"];

/** Seamless scrolling flower-name strip (CSS animation, zero deps). */
export function Marquee() {
  const { lang } = useLang();
  const flowers = lang === "ml" ? FLOWERS_ML : FLOWERS_EN;
  const items = [...flowers, ...flowers];

  return (
    <div className="overflow-hidden border-y border-gold/20 bg-cream-dark py-3.5">
      <div className="marquee-track flex w-max">
        {items.map((f, i) => (
          <span key={i} className="flex items-center gap-6 px-6 font-display text-lg text-ink/70">
            {f}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
