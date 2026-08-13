"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang, unitLabel } from "@/lib/i18n";
import { useCart } from "@/components/cart-context";
import { formatPrice, ONAM_THIRUVONAM, STORE_MAPS_LINK } from "@/lib/site";
import { placeOrder, confirmRazorpayPayment, type PlaceOrderResult } from "@/lib/order-actions";

type Status = "idle" | "submitting" | "success";
type Method = "delivery" | "pickup";

export function CheckoutForm({
  deliveryCharge,
  razorpayEnabled,
  storeName,
  storeNameMl,
}: {
  deliveryCharge: number;
  razorpayEnabled: boolean;
  storeName: string;
  storeNameMl: string;
}) {
  const { lang, t } = useLang();
  const { items, subtotal, clear } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "670643",
    landmark: "",
    deliveryDate: "",
    notes: "",
  });
  const [method, setMethod] = useState<Method>("delivery");
  const [location, setLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [payment, setPayment] = useState<"cod" | "whatsapp" | "razorpay">("whatsapp");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PlaceOrderResult | null>(null);

  const effectiveDelivery = method === "pickup" ? 0 : deliveryCharge;
  const total = subtotal + effectiveDelivery;
  const today = new Date().toISOString().slice(0, 10);
  const maxDate = ONAM_THIRUVONAM.toISOString().slice(0, 10);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const labels = useMemo(
    () =>
      lang === "ml"
        ? {
            title: "ചെക്ക്ഔട്ട്",
            method: "പൂക്കൾ എങ്ങനെ വേണം?",
            delivery: "ഹോം ഡെലിവറി",
            deliverySub: "നിങ്ങളുടെ വിലാസത്തിലേക്ക് ഡെലിവറി",
            pickup: "കടയിൽ നിന്ന് എടുക്കാം",
            pickupSub: "ഞങ്ങളുടെ കടയിൽ നിന്ന് സ്വയം എടുക്കാം",
            name: "പേര്",
            phone: "ഫോൺ നമ്പർ",
            address: "വിലാസം",
            pincode: "പിൻകോഡ്",
            landmark: "ലാൻഡ്മാർക്ക് (ഓപ്ഷണൽ)",
            date: "ഡെലിവറി ദിവസം",
            notes: "കുറിപ്പുകൾ (ഓപ്ഷണൽ)",
            shareLoc: "എന്റെ ലൊക്കേഷൻ അയയ്ക്കുക",
            locating: "ലൊക്കേഷൻ കണ്ടെത്തുന്നു…",
            locShared: "ലൊക്കേഷൻ ലഭിച്ചു ✓",
            locError: "ലൊക്കേഷൻ ലഭിച്ചില്ല — വിലാസം നൽകുക",
            pickupNote: "കടയിൽ നിന്ന് എടുക്കുക (ഡെലിവറി ചാർജ് ഇല്ല)",
            openMap: "ഗൂഗിൾ മാപ്പിൽ തുറക്കുക",
            pay: "പേയ്മെന്റ് രീതി",
            cod: "ഡെലിവറിയിൽ പണം (COD)",
            wa: "വാട്ട്സ്ആപ്പിൽ പണം",
            online: "ഓൺലൈൻ പേ (UPI/കാർഡ്)",
            submit: "ഓർഡർ സ്ഥിരീകരിക്കൂ",
            order: "ഓർഡർ",
            empty: "നിങ്ങളുടെ കൊട്ട ശൂന്യമാണ്.",
            backShop: "പൂക്കൾ തിരഞ്ഞെടുക്കാൻ മടങ്ങൂ",
            successTitle: "ഓർഡർ സ്വീകരിച്ചു! 🌼",
            successSub: "നിങ്ങളുടെ ഓർഡർ ഞങ്ങൾക്ക് ലഭിച്ചു. സ്ഥിരീകരിക്കാൻ WhatsApp തുറക്കുക.",
            openWa: "WhatsApp തുറക്കുക",
            total: "ആകെ",
            deliveryL: "ഡെലിവറി",
            subtotal: "ഉപതുക",
            free: "സൗജന്യം",
          }
        : {
            title: "Checkout",
            method: "How do you want your flowers?",
            delivery: "Home delivery",
            deliverySub: "Delivered to your address",
            pickup: "Store pickup",
            pickupSub: "Collect it from our store",
            name: "Name",
            phone: "Phone number",
            address: "Address",
            pincode: "Pincode",
            landmark: "Landmark (optional)",
            date: "Delivery day",
            notes: "Notes (optional)",
            shareLoc: "Share my location",
            locating: "Getting location…",
            locShared: "Location shared ✓",
            locError: "Couldn't get location — please type your address",
            pickupNote: "Pick up from our store (no delivery charge)",
            openMap: "Open in Google Maps",
            pay: "Payment method",
            cod: "Cash on delivery",
            wa: "Pay on WhatsApp",
            online: "Pay online (UPI/Card)",
            submit: "Place order",
            order: "Order",
            empty: "Your basket is empty.",
            backShop: "Back to shop",
            successTitle: "Order received! 🌼",
            successSub: "Your order is with us. Open WhatsApp to confirm.",
            openWa: "Open WhatsApp",
            total: "Total",
            deliveryL: "Delivery",
            subtotal: "Subtotal",
            free: "Free",
          },
    [lang],
  );

  const shareLocation = () => {
    setLocError("");
    if (!("geolocation" in navigator)) {
      setLocError(labels.locError);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocError(labels.locError);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  if (status === "success" && result?.ok) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-leaf text-cream">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-semibold">{labels.successTitle}</h1>
        <p className="mt-2 text-muted">{labels.successSub}</p>
        <p className="mt-4 font-display text-lg text-gold-deep">
          {labels.order} #{result.orderNumber}
        </p>
        <a
          href={result.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.9.1.1.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.5.3.1.1.1.6-.1 1.2z" />
          </svg>
          {labels.openWa}
        </a>
        <div className="mt-6">
          <Link href="/" className="text-sm text-muted underline">
            {labels.backShop}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted">{labels.empty}</p>
        <Link href="/#shop" className="mt-4 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-cream">
          {labels.backShop}
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");
    const res = await placeOrder({
      items: items.map((i) => ({ productId: i.id, qty: i.qty })),
      customerName: form.name,
      phone: form.phone,
      address: form.address,
      pincode: form.pincode,
      landmark: form.landmark,
      deliveryDate: form.deliveryDate,
      deliveryMethod: method,
      location: method === "delivery" && location ? location : undefined,
      notes: form.notes,
      paymentMethod: payment,
      lang,
    });
    if (!res.ok) {
      setError(res.error);
      setStatus("idle");
      return;
    }

    if (payment === "razorpay" && res.razorpayOrderId && res.razorpayKeyId) {
      openRazorpay(res, () => {
        clear();
        setResult(res);
        setStatus("success");
        window.open(res.whatsappUrl, "_blank");
      });
      return;
    }

    clear();
    setResult(res);
    setStatus("success");
    window.open(res.whatsappUrl, "_blank");
  };

  const inputCls =
    "w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{labels.title}</h1>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: details */}
        <div className="space-y-4">
          {/* Delivery method */}
          <div>
            <label className="mb-2 block text-sm font-semibold">{labels.method}</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { v: "delivery" as const, title: labels.delivery, sub: labels.deliverySub, icon: "🏠" },
                  { v: "pickup" as const, title: labels.pickup, sub: labels.pickupSub, icon: "🛍️" },
                ]
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setMethod(opt.v)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    method === opt.v ? "border-gold bg-gold/10" : "border-ink/15 bg-paper hover:bg-cream"
                  }`}
                >
                  <span className="text-xl leading-none">{opt.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{opt.title}</span>
                    <span className="block text-xs text-muted">{opt.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{labels.name}</label>
              <input required value={form.name} onChange={set("name")} className={inputCls} placeholder="Asha Kumar" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{labels.phone}</label>
              <input
                required
                type="tel"
                inputMode="numeric"
                pattern="[0-9+ ]{10,15}"
                value={form.phone}
                onChange={set("phone")}
                className={inputCls}
                placeholder="98765 43210"
              />
            </div>
          </div>

          {method === "delivery" ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{labels.address}</label>
                <textarea required rows={2} value={form.address} onChange={set("address")} className={inputCls} placeholder="House name, street" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">{labels.pincode}</label>
                  <input required inputMode="numeric" value={form.pincode} onChange={set("pincode")} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">{labels.landmark}</label>
                  <input value={form.landmark} onChange={set("landmark")} className={inputCls} />
                </div>
              </div>

              {/* Share location */}
              <div className="rounded-xl border border-dashed border-gold/40 bg-gold/5 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={shareLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-paper px-4 py-2 text-sm font-semibold text-gold-deep transition-colors hover:bg-gold/10 disabled:opacity-60"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" strokeLinejoin="round" />
                      <circle cx="12" cy="10" r="2.6" />
                    </svg>
                    {locating ? labels.locating : location ? labels.locShared : labels.shareLoc}
                  </button>
                  {location && (
                    <a
                      href={`https://maps.google.com/?q=${location}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-leaf underline"
                    >
                      {labels.openMap}
                    </a>
                  )}
                </div>
                {locError && <p className="mt-2 text-xs text-chethi">{locError}</p>}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-leaf/30 bg-leaf/5 p-4">
              <p className="text-sm font-semibold text-leaf">{labels.pickupNote}</p>
              <a
                href={STORE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
                {labels.openMap}
              </a>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{labels.date}</label>
              <input type="date" min={today} max={maxDate} value={form.deliveryDate} onChange={set("deliveryDate")} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{labels.notes}</label>
              <input value={form.notes} onChange={set("notes")} className={inputCls} />
            </div>
          </div>

          {/* Payment */}
          <div>
            <label className="mb-2 block text-sm font-semibold">{labels.pay}</label>
            <div className="space-y-2">
              {[
                { v: "whatsapp" as const, label: labels.wa },
                { v: "cod" as const, label: labels.cod },
                ...(razorpayEnabled ? [{ v: "razorpay" as const, label: labels.online }] : []),
              ].map((opt) => (
                <label
                  key={opt.v}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                    payment === opt.v ? "border-gold bg-gold/10" : "border-ink/15 bg-paper hover:bg-cream"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.v}
                    checked={payment === opt.v}
                    onChange={() => setPayment(opt.v)}
                    className="h-4 w-4 accent-gold-deep"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="rounded-lg bg-chethi/10 px-4 py-3 text-sm text-chethi">{error}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-leaf py-4 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {status === "submitting"
              ? (lang === "ml" ? "സമർപ്പിക്കുന്നു…" : "Placing order…")
              : labels.submit}
          </button>
        </div>

        {/* Right: summary */}
        <aside className="h-fit rounded-2xl bg-paper p-5 shadow-soft">
          <p className="mb-4 font-display text-lg font-semibold">
            {lang === "ml" ? storeNameMl : storeName}
          </p>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {lang === "ml" ? i.nameMl : i.name} <span className="text-muted">× {i.qty}</span>
                </span>
                <span className="font-medium">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>{labels.subtotal}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{method === "pickup" ? labels.pickup : labels.deliveryL}</span>
              <span>{effectiveDelivery > 0 ? formatPrice(effectiveDelivery) : labels.free}</span>
            </div>
            <div className="flex justify-between pt-2 font-display text-lg font-semibold">
              <span>{labels.total}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

// Load Razorpay checkout lazily and open it.
function openRazorpay(
  res: Extract<PlaceOrderResult, { ok: true }>,
  onSuccess: () => void,
) {
  const load = () => {
    const rz = new (window as unknown as { Razorpay: any }).Razorpay({
      key: res.razorpayKeyId,
      amount: res.total * 100,
      currency: "INR",
      name: "Onapookkal",
      description: `Order ${res.orderNumber}`,
      order_id: res.razorpayOrderId,
      handler: async (resp: any) => {
        await confirmRazorpayPayment(
          res.orderId,
          resp.razorpay_order_id,
          resp.razorpay_payment_id,
          resp.razorpay_signature,
        );
        onSuccess();
      },
      prefill: {},
      theme: { color: "#1f5c34" },
      modal: { ondismiss: () => onSuccess() },
    });
    rz.open();
  };

  const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existing) return load();
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = load;
  document.body.appendChild(s);
}
