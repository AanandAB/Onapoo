"use client";

import { useLang } from "@/lib/i18n";
import { formatPrice } from "@/lib/site";
import type { OrderRow } from "@/db/schema";

const STEPS = [
  { key: "new", en: "Order placed", ml: "ഓർഡർ സ്വീകരിച്ചു" },
  { key: "confirmed", en: "Accepted", ml: "ഓർഡർ ഉറപ്പിച്ചു" },
  { key: "packed", en: "Packed / ready", ml: "പാക്ക് ചെയ്തു" },
  { key: "out_for_delivery", en: "Out for delivery", ml: "ഡെലിവറിക്കായി അയച്ചു" },
  { key: "delivered", en: "Delivered", ml: "ഡെലിവറി ചെയ്തു" },
];

const STATUS_INDEX: Record<string, number> = {
  new: 0,
  confirmed: 1,
  packed: 2,
  out_for_delivery: 3,
  delivered: 4,
};

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-base text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function TrackView({
  orderNumber,
  phone,
  result,
  searched,
}: {
  orderNumber?: string;
  phone?: string;
  result: OrderRow | null;
  searched: boolean;
}) {
  const { lang } = useLang();
  const ml = lang === "ml";

  const cancelled = result?.orderStatus === "cancelled";
  const current = result ? STATUS_INDEX[result.orderStatus] ?? 0 : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">
        {ml ? "ഓർഡർ ട്രാക്ക് ചെയ്യുക" : "Track your order"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {ml
          ? "നിങ്ങളുടെ ഓർഡർ നമ്പറും ഫോൺ നമ്പറും നൽകുക."
          : "Enter your order number and phone number to see its progress."}
      </p>

      <form method="get" action="/track" className="mt-6 space-y-3">
        <input
          name="order"
          required
          defaultValue={orderNumber ?? ""}
          placeholder={ml ? "ഓർഡർ നമ്പർ (ONM-…)" : "Order number (ONM-…)"}
          className={inputCls}
        />
        <input
          name="phone"
          required
          type="tel"
          inputMode="tel"
          defaultValue={phone ?? ""}
          placeholder={ml ? "ഫോൺ നമ്പർ" : "Phone number"}
          className={inputCls}
        />
        <button className="w-full rounded-full bg-gold py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5">
          {ml ? "ട്രാക്ക് ചെയ്യുക" : "Track order"}
        </button>
      </form>

      {searched && !result && (
        <p className="mt-6 rounded-xl bg-chethi/10 px-4 py-3 text-sm text-chethi">
          {ml
            ? "ഓർഡർ കണ്ടെത്തിയില്ല — നമ്പറും ഫോണും പരിശോധിക്കുക."
            : "Order not found — please check your order number and phone number."}
        </p>
      )}

      {result && (
        <div className="mt-8 rounded-2xl bg-paper p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{ml ? "ഓർഡർ" : "Order"}</p>
            <p className="font-display font-semibold">{result.orderNumber}</p>
          </div>

          {cancelled ? (
            <div className="mt-4 rounded-xl bg-chethi/10 px-4 py-3 text-sm font-semibold text-chethi">
              {ml ? "ഈ ഓർഡർ റദ്ദാക്കി." : "This order was cancelled."}
            </div>
          ) : (
            <>
              <p className="mt-4 text-sm font-semibold text-leaf-deep">
                {ml ? "നിലവിലെ സ്ഥിതി: " : "Current status: "}
                {ml ? STEPS[current].ml : STEPS[current].en}
              </p>
              <ol className="mt-4 space-y-3">
                {STEPS.map((s, i) => {
                  const done = i <= current;
                  return (
                    <li key={s.key} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          done ? "bg-leaf text-cream" : "bg-cream-dark text-muted"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <p className={`text-sm ${done ? "font-semibold text-ink" : "text-muted"}`}>
                        {ml ? s.ml : s.en}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          <div className="mt-6 border-t border-ink/10 pt-4 text-sm">
            <ul className="space-y-1">
              {result.items.map((it, i) => (
                <li key={i} className="flex justify-between text-muted">
                  <span>
                    {ml ? it.nameMl || it.name : it.name} × {it.qty}
                  </span>
                  <span>{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between font-display text-base font-semibold">
              <span>{ml ? "ആകെ" : "Total"}</span>
              <span>{formatPrice(result.total)}</span>
            </div>
            {result.deliveryDate && (
              <p className="mt-2 text-xs text-muted">
                {ml ? "ഡെലിവറി ദിവസം" : "Delivery day"}: {result.deliveryDate}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
