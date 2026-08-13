"use client";

import { useLang } from "@/lib/i18n";
import { WHATSAPP_DISPLAY, whatsappLink, STORE_MAPS_LINK } from "@/lib/site";

type Block = { t: string; tm: string; body: string; bodyMl: string };
type Qa = { q: string; qMl: string; a: string; aMl: string };

const FAQS: Qa[] = [
  {
    q: "Where do you deliver?",
    qMl: "എവിടെയാണ് ഡെലിവറി?",
    a: "Across Kannur (pincode 670643) and nearby areas. Enter your pincode at checkout to confirm.",
    aMl: "കണ്ണൂർ (പിൻകോഡ് 670643) ഉം സമീപ പ്രദേശങ്ങളും. ചെക്ക്ഔട്ടിൽ പിൻകോഡ് നൽകി സ്ഥിരീകരിക്കുക.",
  },
  {
    q: "When will my flowers arrive?",
    qMl: "പൂക്കൾ എപ്പോൾ എത്തും?",
    a: "Choose your delivery day at checkout. Order before the Onam cutoff to guarantee Thiruvonam-day delivery.",
    aMl: "ചെക്ക്ഔട്ടിൽ ഡെലിവറി ദിവസം തിരഞ്ഞെടുക്കുക. തിരുവോണ ദിനത്തിൽ ലഭിക്കാൻ നേരത്തെ ഓർഡർ ചെയ്യുക.",
  },
  {
    q: "Are the flowers fresh?",
    qMl: "പൂക്കൾ പുതുമയുള്ളതാണോ?",
    a: "Yes — plucked and packed fresh, same day, so your pookalam looks its best.",
    aMl: "അതെ — അന്നേദിവസം പറിച്ച് പുതുതായി പാക്ക് ചെയ്യുന്നു.",
  },
  {
    q: "What if flowers arrive wilted?",
    qMl: "പൂക്കൾ വാടിപ്പോയാൽ?",
    a: "Send us a photo on WhatsApp and we'll replace or refund — no questions asked.",
    aMl: "വാട്സ്ആപ്പിൽ ഒരു ഫോട്ടോ അയയ്ക്കൂ — ഞങ്ങൾ മാറ്റിത്തരും അല്ലെങ്കിൽ റീഫണ്ട് നൽകും.",
  },
  {
    q: "How do I pay?",
    qMl: "എങ്ങനെ പണമടയ്ക്കാം?",
    a: "Pay on WhatsApp, cash on delivery, or online via UPI/card.",
    aMl: "വാട്ട്സ്ആപ്പിൽ, ഡെലിവറിയിൽ പണം (COD), അല്ലെങ്കിൽ ഓൺലൈനിൽ UPI/കാർഡ്.",
  },
  {
    q: "Can I pick up from your store?",
    qMl: "കടയിൽ നിന്ന് എടുക്കാമോ?",
    a: "Yes — free store pickup. Choose 'Store pickup' at checkout and we'll share the location.",
    aMl: "അതെ — സൗജന്യമായി കടയിൽ നിന്ന് എടുക്കാം. ചെക്ക്ഔട്ടിൽ 'കടയിൽ നിന്ന് എടുക്കാം' തിരഞ്ഞെടുക്കുക.",
  },
];

const DELIVERY_BLOCKS: Block[] = [
  {
    t: "Delivery area",
    tm: "ഡെലിവറി പ്രദേശം",
    body: "We deliver across Kannur — pincode 670643 — and nearby areas.",
    bodyMl: "കണ്ണൂർ — പിൻകോഡ് 670643 — ഉം സമീപ പ്രദേശങ്ങളും.",
  },
  {
    t: "Delivery charge",
    tm: "ഡെലിവറി ചാർജ്",
    body: "₹30 for home delivery. Store pickup is always free.",
    bodyMl: "ഹോം ഡെലിവറിക്ക് ₹30. കടയിൽ നിന്ന് എടുക്കുന്നത് എപ്പോഴും സൗജന്യം.",
  },
  {
    t: "Delivery timing",
    tm: "ഡെലിവറി സമയം",
    body: "Pick your day at checkout. For Thiruvonam (the main day), order early — slots fill up fast.",
    bodyMl: "ചെക്ക്ഔട്ടിൽ ദിവസം തിരഞ്ഞെടുക്കുക. തിരുവോണ ദിനത്തിന് നേരത്തെ ഓർഡർ ചെയ്യുക — സ്ലോട്ടുകൾ വേഗം നിറയും.",
  },
  {
    t: "Freshness promise",
    tm: "പുതുമ വാഗ്ദാനം",
    body: "Flowers are plucked and packed fresh, same day. If they arrive wilted, send a photo and we'll replace or refund.",
    bodyMl: "പൂക്കൾ അന്നേദിവസം പറിച്ച് പുതുതായി പാക്ക് ചെയ്യുന്നു. വാടിപ്പോയാൽ ഫോട്ടോ അയയ്ക്കൂ — മാറ്റിത്തരും.",
  },
];

export function InfoPage({ kind }: { kind: "faq" | "delivery" | "about" | "contact" }) {
  const { lang } = useLang();
  const ml = lang === "ml";

  const title =
    kind === "faq"
      ? ml
        ? "പതിവ് ചോദ്യങ്ങൾ"
        : "Frequently asked questions"
      : kind === "delivery"
        ? ml
          ? "ഡെലിവറി & ഷിപ്പിംഗ്"
          : "Delivery & shipping"
        : kind === "about"
          ? ml
            ? "ഞങ്ങളെ കുറിച്ച്"
            : "About us"
          : ml
            ? "ബന്ധപ്പെടുക"
            : "Contact";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>

      {kind === "faq" && (
        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="group rounded-2xl bg-paper p-4 shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                {ml ? f.qMl : f.q}
                <span className="text-gold-deep transition-transform group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{ml ? f.aMl : f.a}</p>
            </details>
          ))}
        </div>
      )}

      {kind === "delivery" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {DELIVERY_BLOCKS.map((b, i) => (
            <div key={i} className="rounded-2xl bg-paper p-5 shadow-soft">
              <p className="font-display text-base font-semibold text-gold-deep">{ml ? b.tm : b.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{ml ? b.bodyMl : b.body}</p>
            </div>
          ))}
        </div>
      )}

      {kind === "about" && (
        <div className="mt-8 space-y-4 leading-relaxed text-muted">
          <p>
            {ml
              ? "ഓണപ്പൂക്കൾ കണ്ണൂരിലെ ഒരു പ്രാദേശിക പൂക്കടയാണ്, ഓണത്തിന് പുതിയ പൂക്കളും പൂക്കളം കിറ്റുകളും എത്തിക്കുന്നു."
              : "Onapookkal is a local flower shop in Kannur, delivering fresh flowers and pookalam kits for Onam."}
          </p>
          <p>
            {ml
              ? "പരമ്പരാഗത പൂക്കളം നിർമ്മാണത്തിലെ വൈദഗ്ധ്യത്തോടെ, ചെത്തി മുതൽ തുമ്പ വരെയുള്ള ഓരോ പൂവും പുതുതായി പറിച്ച് നിങ്ങളുടെ പൂക്കളം മനോഹരമാക്കാൻ ഞങ്ങൾ എത്തിക്കുന്നു."
              : "With deep expertise in traditional pookalam making, we source every flower — from chethi to thumba — fresh, so your carpet looks its finest."}
          </p>
          <p>
            {ml
              ? "അത്തം മുതൽ തിരുവോണം വരെ, നിങ്ങളുടെ ഓണം കൂടുതൽ മനോഹരമാക്കാൻ ഞങ്ങൾ ഇവിടെയുണ്ട്."
              : "From Atham to Thiruvonam, we're here to make your Onam beautiful."}
          </p>
        </div>
      )}

      {kind === "contact" && (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl bg-paper p-5 shadow-soft">
            <p className="font-display text-base font-semibold text-gold-deep">
              {ml ? "വാട്ട്സ്ആപ്പ്" : "WhatsApp"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {ml ? "ഓർഡർ ചെയ്യാനുള്ള ഏറ്റവും വേഗത്തിലുള്ള മാർഗം." : "The fastest way to order."}
            </p>
            <a
              href={whatsappLink(ml ? "ഹലോ, ഓണപ്പൂക്കൾ ഓർഡർ ചെയ്യണം" : "Hi, I'd like to order Onam flowers")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </div>

          <div className="rounded-2xl bg-paper p-5 shadow-soft">
            <p className="font-display text-base font-semibold text-gold-deep">
              {ml ? "കടയിൽ നിന്ന് എടുക്കാം" : "Store pickup"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {ml ? "ഞങ്ങളുടെ കടയിൽ നിന്ന് സൗജന്യമായി എടുക്കാം." : "Collect free from our store."}
            </p>
            <a
              href={STORE_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              {ml ? "ഗൂഗിൾ മാപ്പിൽ തുറക്കുക" : "Open in Google Maps"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
