"use client";

import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/motion";

export function HowItWorks() {
  const { lang, t } = useLang();

  const steps = [
    { n: "1", title: t("how_1_t"), desc: t("how_1_d"), icon: "M3 7h2l2.4 8.4A2 2 0 0 0 9.3 17h6.9a2 2 0 0 0 1.9-1.4L20 9H6.5" },
    { n: "2", title: t("how_2_t"), desc: t("how_2_d"), icon: "M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" },
    { n: "3", title: t("how_3_t"), desc: t("how_3_d"), icon: "M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2z" },
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chethi">{t("sec_how")}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {lang === "ml" ? "മൂന്ന് എളുപ്പ ഘട്ടങ്ങൾ" : "Three easy steps"}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="kasavu-frame relative rounded-2xl bg-paper p-6 text-center shadow-soft"
            >
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold-deep">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d={s.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="absolute left-5 top-5 font-display text-2xl font-semibold text-gold/30">
                {s.n}
              </span>
              <h3 className="font-ml text-lg font-semibold" lang={lang}>
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
