import { notFound } from "next/navigation";
import { requireAdmin, getOrderById } from "@/lib/admin";
import { formatPrice } from "@/lib/site";
import { PrintButton } from "@/components/print-button";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const o = await getOrderById(id);
  if (!o) notFound();

  const date = new Date(o.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <style>{`@media print {
        body * { visibility: hidden; }
        #receipt, #receipt * { visibility: visible; }
        #receipt { position: absolute; left: 0; top: 0; width: 100%; }
      }`}</style>

      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <a href={`/admin/orders/${o.id}`} className="text-sm text-muted hover:text-ink">
          ← Back to order
        </a>
        <PrintButton />
      </div>

      <div id="receipt" className="rounded-2xl bg-paper p-8 shadow-soft">
        {/* Store header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-semibold text-gold-deep">Onapookkal</p>
            <p className="text-xs text-muted">ഓണപ്പൂക്കൾ · Kannur, Kerala — 670643</p>
            <p className="text-xs text-muted">+91 70340 26295 · onapookkal.store</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted">Receipt</p>
            <p className="font-display font-semibold">{o.orderNumber}</p>
            <p className="text-xs text-muted">{date}</p>
          </div>
        </div>

        {/* Billed to + delivery */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-cream p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">Billed to</p>
            <p className="mt-0.5 font-semibold text-ink">{o.customerName}</p>
            <p className="text-xs text-muted">{o.phone}</p>
          </div>
          <div className="rounded-lg bg-cream p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">Delivery</p>
            <p className="mt-0.5 text-xs text-muted">
              {o.deliveryMethod === "pickup"
                ? "Store pickup"
                : `${o.address}${o.landmark ? `, ${o.landmark}` : ""} · ${o.pincode}`}
            </p>
            {o.deliveryDate && <p className="text-xs text-muted">{o.deliveryDate}</p>}
          </div>
        </div>

        {/* Items */}
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 text-center font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {o.items.map((it, i) => (
              <tr key={i}>
                <td className="py-2.5">
                  {it.name}
                  {it.nameMl && it.nameMl !== it.name ? (
                    <span className="text-muted"> · {it.nameMl}</span>
                  ) : null}
                </td>
                <td className="py-2.5 text-center text-muted">{it.qty}</td>
                <td className="py-2.5 text-right">{formatPrice(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 ml-auto w-full max-w-[280px] space-y-1.5 border-t border-ink/10 pt-3 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatPrice(o.subtotal)}</span>
          </div>
          {o.discount > 0 && (
            <div className="flex justify-between text-leaf-deep">
              <span>Discount{o.couponCode ? ` (${o.couponCode})` : ""}</span>
              <span>−{formatPrice(o.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>Delivery</span>
            <span>{o.deliveryCharge > 0 ? formatPrice(o.deliveryCharge) : "Free"}</span>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 font-display text-lg font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(o.total)}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          Payment: {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
        </p>

        <p className="mt-5 border-t border-ink/10 pt-4 text-center text-xs text-muted">
          Thank you for shopping with Onapookkal! 🌼
        </p>
      </div>
    </div>
  );
}
