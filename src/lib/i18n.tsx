"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ml";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

const STRINGS: Record<string, { en: string; ml: string }> = {
  nav_home: { en: "Home", ml: "ഹോം" },
  nav_shop: { en: "Shop Flowers", ml: "പൂക്കൾ വാങ്ങൂ" },
  nav_how: { en: "How it works", ml: "എങ്ങനെ പ്രവർത്തിക്കുന്നു" },
  nav_faq: { en: "FAQ", ml: "പതിവ് ചോദ്യങ്ങൾ" },
  nav_contact: { en: "Contact", ml: "ബന്ധപ്പെടുക" },

  hero_kicker: { en: "Fresh Onam flowers · Kannur", ml: "പുതിയ ഓണപ്പൂക്കൾ · കണ്ണൂർ" },
  hero_title_a: { en: "Grow your", ml: "നിങ്ങളുടെ" },
  hero_title_b: { en: "pookalam", ml: "പൂക്കളം" },
  hero_title_c: { en: "petal by petal", ml: "ഇതളോരോന്നായി വിരിയിക്കൂ" },
  hero_sub: {
    en: "The flowers of Onam, delivered fresh to your door — from the sacred Thumba to the vibrant Chethi. Order your daily pookalam before Thiruvonam.",
    ml: "ഓണത്തിന്റെ പൂക്കൾ, നിങ്ങളുടെ വീട്ടുപടിക്കൽ പുതുമയോടെ — പവിത്രമായ തുമ്പ മുതൽ തിളങ്ങുന്ന ചെത്തി വരെ. തിരുവോണത്തിന് മുമ്പേ നിങ്ങളുടെ ദിവസേനയുള്ള പൂക്കളം ഓർഡർ ചെയ്യൂ.",
  },
  hero_cta: { en: "Order Flowers", ml: "പൂക്കൾ ഓർഡർ ചെയ്യൂ" },
  hero_countdown_label: { en: "Days to Thiruvonam", ml: "തിരുവോണത്തിന് ബാക്കി" },

  sec_featured: { en: "Today's picks", ml: "ഇന്നത്തെ തിരഞ്ഞെടുപ്പ്" },
  sec_categories: { en: "Shop by category", ml: "വിഭാഗം അനുസരിച്ച് വാങ്ങൂ" },
  sec_all: { en: "All flowers", ml: "എല്ലാ പൂക്കളും" },
  sec_how: { en: "How it works", ml: "എങ്ങനെ പ്രവർത്തിക്കുന്നു" },

  how_1_t: { en: "Choose your flowers", ml: "നിങ്ങളുടെ പൂക്കൾ തിരഞ്ഞെടുക്കൂ" },
  how_1_d: { en: "Traditional blooms, petal packs or a ready pookalam kit.", ml: "പരമ്പരാഗത പൂക്കൾ, ഇതൾ പാക്കുകൾ അല്ലെങ്കിൽ റെഡി പൂക്കളം കിറ്റ്." },
  how_2_t: { en: "Pick a delivery day", ml: "ഡെലിവറി ദിവസം തിരഞ്ഞെടുക്കൂ" },
  how_2_d: { en: "Fresh each morning, delivered across Kannur.", ml: "എല്ലാ ദിവസവും പുതുമയോടെ, കണ്ണൂരിലുടനീളം ഡെലിവറി." },
  how_3_t: { en: "Confirm on WhatsApp", ml: "വാട്ട്സ്ആപ്പിൽ സ്ഥിരീകരിക്കൂ" },
  how_3_d: { en: "Your order reaches us instantly on WhatsApp.", ml: "നിങ്ങളുടെ ഓർഡർ തൽക്ഷണം വാട്ട്സ്ആപ്പിൽ ഞങ്ങൾക്ക് എത്തും." },

  add_to_cart: { en: "Add to Cart", ml: "കാർട്ടിൽ ചേർക്കൂ" },
  added: { en: "Added", ml: "ചേർത്തു" },
  in_basket: { en: "in basket", ml: "കൊട്ടയിൽ" },
  out_of_stock: { en: "Sold out", ml: "തീർന്നു" },
  per_unit: { en: "per", ml: "ഒരു" },
  qty: { en: "Qty", ml: "എണ്ണം" },

  cart_title: { en: "Your basket", ml: "നിങ്ങളുടെ കൊട്ട" },
  cart_empty: { en: "Your basket is empty.", ml: "നിങ്ങളുടെ കൊട്ട ശൂന്യമാണ്." },
  cart_subtotal: { en: "Subtotal", ml: "ആകെ" },
  cart_checkout: { en: "Checkout", ml: "ചെക്ക്ഔട്ട്" },
  cart_note: { en: "Delivery charge added at checkout", ml: "ചെക്ക്ഔട്ടിൽ ഡെലിവറി ചാർജ് ചേർക്കും" },
  cart_remove: { en: "Remove", ml: "നീക്കം" },
  cart_continue: { en: "Continue shopping", ml: "തുടർന്ന് വാങ്ങൂ" },

  unit_bunch: { en: "bunch", ml: "കെട്ട്" },
  unit_kg: { en: "kg", ml: "കിലോ" },
  unit_packet: { en: "packet", ml: "പാക്കറ്റ്" },
  unit_kit: { en: "kit", ml: "കിറ്റ്" },
  unit_piece: { en: "piece", ml: "എണ്ണം" },

  footer_tag: {
    en: "Fresh Onam flowers, hand-picked each morning in Kannur.",
    ml: "എല്ലാ ദിവസവും രാവിലെ കണ്ണൂരിൽ കൈകൊണ്ട് പറിച്ചെടുക്കുന്ന പുതിയ ഓണപ്പൂക്കൾ.",
  },
  footer_contact: { en: "Order on WhatsApp", ml: "വാട്ട്സ്ആപ്പിൽ ഓർഡർ ചെയ്യൂ" },
  footer_rights: { en: "All rights reserved.", ml: "എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം." },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("onam_lang") : null;
    if (saved === "en" || saved === "ml") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("onam_lang", l);
  };

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLang(lang === "ml" ? "en" : "ml");

  const value = useMemo<Ctx>(() => {
    const t = (key: string) => STRINGS[key]?.[lang] ?? key;
    return { lang, setLang, toggle, t };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export function unitLabel(unit: string, t: (k: string) => string) {
  const map: Record<string, string> = {
    bunch: t("unit_bunch"),
    kg: t("unit_kg"),
    packet: t("unit_packet"),
    kit: t("unit_kit"),
    piece: t("unit_piece"),
  };
  return map[unit] ?? unit;
}
