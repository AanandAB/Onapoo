"use client";

import { useEffect, useState } from "react";
import { ONAM_THIRUVONAM } from "@/lib/site";
import { useLang } from "@/lib/i18n";

type Parts = { days: number; hours: number; mins: number; secs: number; done: boolean };

function diff(): Parts {
  const now = Date.now();
  const target = ONAM_THIRUVONAM.getTime();
  const ms = target - now;
  if (ms <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, done: true };
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    mins: Math.floor((ms / 60000) % 60),
    secs: Math.floor((ms / 1000) % 60),
    done: false,
  };
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-paper font-display text-2xl font-semibold text-gold-deep shadow-soft sm:h-16 sm:w-16 sm:text-3xl">
        {value}
      </span>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}

export function Countdown() {
  const { lang, t } = useLang();
  // Start with a stable "not yet measured" state so the server and client render
  // identical HTML. Calling Date.now() during render would make the seconds value
  // differ between SSR and hydration, throwing a hydration mismatch.
  const [p, setP] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setP(diff());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const labels =
    lang === "ml"
      ? { d: "ദിവസം", h: "മണിക്കൂർ", m: "മിനിറ്റ്", s: "സെക്കൻഡ്" }
      : { d: "Days", h: "Hours", m: "Min", s: "Sec" };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mt-8">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-chethi">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-chethi" />
        {t("hero_countdown_label")}
      </p>
      {p === null ? (
        // SSR / first-paint placeholder (identical on server and client).
        <div className="flex items-start gap-3 sm:gap-4">
          <Cell value="00" label={labels.d} />
          <span className="mt-4 text-2xl text-gold/40">:</span>
          <Cell value="00" label={labels.h} />
          <span className="mt-4 text-2xl text-gold/40">:</span>
          <Cell value="00" label={labels.m} />
          <span className="mt-4 text-2xl text-gold/40">:</span>
          <Cell value="00" label={labels.s} />
        </div>
      ) : p.done ? (
        <p className="font-display text-2xl font-semibold text-gold-deep">
          {lang === "ml" ? "ഓണാശംസകൾ! 🌼" : "Happy Onam! 🌼"}
        </p>
      ) : (
        <div className="flex items-start gap-3 sm:gap-4">
          <Cell value={pad(p.days)} label={labels.d} />
          <span className="mt-4 text-2xl text-gold/40">:</span>
          <Cell value={pad(p.hours)} label={labels.h} />
          <span className="mt-4 text-2xl text-gold/40">:</span>
          <Cell value={pad(p.mins)} label={labels.m} />
          <span className="mt-4 text-2xl text-gold/40">:</span>
          <Cell value={pad(p.secs)} label={labels.s} />
        </div>
      )}
    </div>
  );
}
