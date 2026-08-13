"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addManualOrder,
  type ManualOrderInput,
} from "@/app/admin/actions";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/db/schema";
import { formatPrice } from "@/lib/site";

type Product = { id: string; name: string; nameMl: string; price: number };
type Item = { productId: string; name: string; qty: number; price: number };

const input =
  "w-full rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const label = "mb-1 block text-sm font-semibold";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function ManualOrderForm({
  deliveryCharge,
  products,
}: {
  deliveryCharge: number;
  products: Product[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    pincode: "670643",
    landmark: "",
    deliveryDate: "",
    notes: "",
    paymentMethod: "cod" as ManualOrderInput["paymentMethod"],
    paymentStatus: "pending" as ManualOrderInput["paymentStatus"],
    orderStatus: "new" as ManualOrderInput["orderStatus"],
    deliveryMethod: "delivery" as ManualOrderInput["deliveryMethod"],
  });

  const [items, setItems] = useState<Item[]>([
    { productId: "", name: "", qty: 1, price: 0 },
  ]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const updateItem = (i: number, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const pickProduct = (i: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    setItems((arr) =>
      arr.map((it, idx) =>
        idx === i
          ? p
            ? { ...it, productId: p.id, name: p.name, price: p.price }
            : { ...it, productId: "", name: it.name, price: it.price }
          : it,
      ),
    );
  };

  const addRow = () => setItems((a) => [...a, { productId: "", name: "", qty: 1, price: 0 }]);
  const removeRow = (i: number) => setItems((a) => (a.length > 1 ? a.filter((_, idx) => idx !== i) : a));

  const subtotal = items.reduce((n, it) => n + (it.price || 0) * (it.qty || 0), 0);
  const total = subtotal + deliveryCharge;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await addManualOrder({
      ...form,
      items: items
        .filter((it) => it.name.trim())
        .map((it) => ({ name: it.name, qty: it.qty, price: it.price })),
    });
    if (res?.error) {
      setError(res.error);
      setBusy(false);
    }
    // on success addManualOrder redirects; if it resolves without redirect, refresh
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">New order (manual)</h1>
          <p className="text-sm text-muted">Enter a walk-in or phone order</p>
        </div>
        <a href="/admin/orders" className="text-sm text-muted hover:text-ink">
          Cancel
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: customer + items */}
        <div className="space-y-6">
          <section className="rounded-2xl bg-paper p-5 shadow-soft">
            <h2 className="mb-4 font-display text-base font-semibold">Customer</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Name</label>
                <input required value={form.customerName} onChange={set("customerName")} className={input} />
              </div>
              <div>
                <label className={label}>Phone</label>
                <input required type="tel" value={form.phone} onChange={set("phone")} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Address</label>
                <input value={form.address} onChange={set("address")} className={input} placeholder="Walk-in / phone order" />
              </div>
              <div>
                <label className={label}>Pincode</label>
                <input value={form.pincode} onChange={set("pincode")} className={input} />
              </div>
              <div>
                <label className={label}>Landmark</label>
                <input value={form.landmark} onChange={set("landmark")} className={input} />
              </div>
              <div>
                <label className={label}>Delivery day</label>
                <input type="date" value={form.deliveryDate} onChange={set("deliveryDate")} className={input} />
              </div>
              <div>
                <label className={label}>Notes</label>
                <input value={form.notes} onChange={set("notes")} className={input} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-paper p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Items</h2>
              <button type="button" onClick={addRow} className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-cream">
                + Add item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <select
                    value={it.productId}
                    onChange={(e) => pickProduct(i, e.target.value)}
                    className="col-span-4 rounded-lg border border-ink/15 bg-cream px-2 py-2 text-sm"
                  >
                    <option value="">— Custom —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · ₹{p.price}
                      </option>
                    ))}
                  </select>
                  <input
                    value={it.name}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    placeholder="Item name"
                    className="col-span-3 rounded-lg border border-ink/15 bg-cream px-2 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    value={it.qty}
                    onChange={(e) => updateItem(i, { qty: parseInt(e.target.value, 10) || 0 })}
                    className="col-span-2 rounded-lg border border-ink/15 bg-cream px-2 py-2 text-sm"
                    title="Qty"
                  />
                  <input
                    type="number"
                    min={0}
                    value={it.price}
                    onChange={(e) => updateItem(i, { price: parseInt(e.target.value, 10) || 0 })}
                    className="col-span-2 rounded-lg border border-ink/15 bg-cream px-2 py-2 text-sm"
                    title="Price"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="col-span-1 rounded-lg py-2 text-center text-chethi hover:bg-chethi/5"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: payment + totals */}
        <aside className="h-fit space-y-6">
          <section className="rounded-2xl bg-paper p-5 shadow-soft">
            <h2 className="mb-4 font-display text-base font-semibold">Status &amp; payment</h2>
            <div className="space-y-4">
              <div>
                <label className={label}>Order status</label>
                <select value={form.orderStatus} onChange={set("orderStatus")} className={input}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Delivery method</label>
                <select value={form.deliveryMethod} onChange={set("deliveryMethod")} className={input}>
                  <option value="delivery">Home delivery</option>
                  <option value="pickup">Store pickup</option>
                </select>
              </div>
              <div>
                <label className={label}>Payment method</label>
                <select value={form.paymentMethod} onChange={set("paymentMethod")} className={input}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Payment status</label>
                <select value={form.paymentStatus} onChange={set("paymentStatus")} className={input}>
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-paper p-5 shadow-soft">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2 font-display text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && <p className="mt-3 rounded-lg bg-chethi/10 px-3 py-2 text-sm text-chethi">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-full bg-leaf py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save order"}
            </button>
          </section>
        </aside>
      </div>
    </form>
  );
}
