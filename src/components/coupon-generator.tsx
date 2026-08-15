"use client";

import { useState } from "react";
import { createCoupon } from "@/app/admin/actions";

export function CouponGenerator() {
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"percent" | "free_delivery">("percent");
  const [value, setValue] = useState("10");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setCode("");
    const fd = new FormData();
    fd.set("phone", phone);
    fd.set("type", type);
    fd.set("value", value);
    const res = await createCoupon(fd);
    if ("error" in res) {
      setError(res.error);
    } else {
      setCode(res.code);
    }
    setBusy(false);
  }

  const inputCls =
    "w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-base text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <form onSubmit={submit} className="rounded-xl border border-ink/10 bg-paper p-5">
      <h2 className="font-display text-base font-semibold">Generate a coupon</h2>
      <p className="mt-1 text-xs text-muted">
        Tie a single-use coupon to a customer's phone number (country code optional).
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold">Customer phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            required
            placeholder="98765 43210"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">Offer type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "percent" | "free_delivery")}
            className={inputCls}
          >
            <option value="percent">Discount %</option>
            <option value="free_delivery">Free delivery</option>
          </select>
        </div>

        {type === "percent" ? (
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Discount %</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type="number"
              min={1}
              max={100}
              className={inputCls}
            />
          </div>
        ) : (
          <div className="flex items-end">
            <p className="text-sm text-muted">Value: free delivery</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-full bg-leaf py-3 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {busy ? "Generating…" : "Generate coupon"}
      </button>

      {error && <p className="mt-3 rounded-lg bg-chethi/10 px-3 py-2 text-sm text-chethi">{error}</p>}

      {code && (
        <div className="mt-3 rounded-lg border border-leaf/30 bg-leaf/5 p-3">
          <p className="text-xs text-muted">Coupon code (share with the customer):</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-paper px-2 py-1 font-mono text-lg font-bold tracking-wide text-leaf-deep">
              {code}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-semibold hover:bg-cream"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
