"use client";

import { useLang } from "@/lib/i18n";
import { formatPrice, formatQty, lineTotal } from "@/lib/site";
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

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on delivery",
  whatsapp: "Pay on WhatsApp",
  razorpay: "Online (UPI/card)",
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
        <>
          <style>{`@media print {
            body * { visibility: hidden; }
            #receipt, #receipt * { visibility: visible; }
            #receipt { position: absolute; left: 0; top: 0; width: 100%; }
          }`}</style>

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

            {/* Receipt */}
            <div id="receipt" className="mt-6 border-t border-ink/10 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-gold-deep">Onapookkal</p>
                  <p className="text-xs text-muted">Kannur — 670643 · +91 70340 26295</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">{ml ? "രസീത്" : "Receipt"}</p>
                  <p className="font-display font-semibold">{result.orderNumber}</p>
                  <p className="text-xs text-muted">
                    {new Date(result.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-cream p-3 text-xs text-muted">
                <p className="font-semibold text-ink">
                  {result.customerName} · {result.phone}
                </p>
                {result.deliveryMethod === "delivery" ? (
                  <p>
                    {result.address}
                    {result.landmark ? `, ${result.landmark}` : ""} · {result.pincode}
                  </p>
                ) : (
                  <p>{ml ? "കടയിൽ നിന്ന് എടുക്കാം" : "Store pickup"}</p>
                )}
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {result.items.map((it, i) => (
                  <li key={i} className="flex justify-between text-muted">
                    <span>
                      {ml ? it.nameMl || it.name : it.name} {formatQty(it.qty, it.unit)}
                    </span>
                    <span>{formatPrice(lineTotal(it.price, it.qty))}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>{ml ? "ഉപതുക" : "Subtotal"}</span>
                  <span>{formatPrice(result.subtotal)}</span>
                </div>
                {result.discount > 0 && (
                  <div className="flex justify-between text-leaf-deep">
                    <span>{ml ? "കിഴിവ്" : "Discount"}</span>
                    <span>−{formatPrice(result.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>{ml ? "ഡെലിവറി" : "Delivery"}</span>
                  <span>
                    {result.deliveryCharge > 0 ? formatPrice(result.deliveryCharge) : ml ? "സൗജന്യം" : "Free"}
                  </span>
                </div>
                <div className="flex justify-between font-display text-base font-semibold text-ink">
                  <span>{ml ? "ആകെ" : "Total"}</span>
                  <span>{formatPrice(result.total)}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span>
                  {ml ? "പേയ്മെന്റ്" : "Payment"}:{" "}
                  {PAYMENT_LABEL[result.paymentMethod] ?? result.paymentMethod.toUpperCase()}
                </span>
                {result.deliveryDate && (
                  <span>
                    {ml ? "ഡെലിവറി ദിവസം" : "Delivery day"}: {result.deliveryDate}
                  </span>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-muted">
                {ml ? "ഓണപ്പൂക്കൾക്ക് നന്ദി!" : "Thank you for shopping with Onapookkal!"} 🌼
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-5 w-full rounded-full border border-gold/40 py-3 text-sm font-semibold text-gold-deep transition-transform hover:-translate-y-0.5 print:hidden"
            >
              🖨 {ml ? "രസീത് പ്രിന്റ് / സേവ് ചെയ്യുക" : "Print / Save receipt"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
