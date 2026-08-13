import { notFound } from "next/navigation";
import { requireAdmin, getOrderById } from "@/lib/admin";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/db/schema";
import { formatPrice } from "@/lib/site";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-marigold/15 text-marigold-deep",
  confirmed: "bg-leaf/10 text-leaf",
  out_for_delivery: "bg-gold/15 text-gold-deep",
  delivered: "bg-leaf/15 text-leaf-deep",
  cancelled: "bg-chethi/10 text-chethi",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const o = await getOrderById(id);
  if (!o) notFound();

  const phone = o.phone.replace(/[^0-9]/g, "");
  const wa = `https://wa.me/${phone.length === 10 ? "91" + phone : phone}?text=${encodeURIComponent(
    `Hi ${o.customerName}, your Onapookkal order ${o.orderNumber} is ${STATUS_LABEL[o.orderStatus]}. Total ₹${o.total}. Thank you! 🌼`,
  )}`;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <a href="/admin/orders" className="text-sm text-muted hover:text-ink">
            ← Back to orders
          </a>
          <h1 className="mt-1 font-display text-2xl font-semibold">{o.orderNumber}</h1>
          <p className="text-sm text-muted">
            {o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}{" "}
            · {o.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLOR[o.orderStatus] ?? ""}`}>
          {STATUS_LABEL[o.orderStatus] ?? o.orderStatus}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-paper p-5 shadow-soft">
          <h2 className="mb-3 font-display text-base font-semibold">Customer</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Name</dt><dd className="font-medium">{o.customerName}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Phone</dt><dd className="font-medium">{o.phone}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Address</dt><dd className="text-right font-medium">{o.address}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Pincode</dt><dd className="font-medium">{o.pincode}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Method</dt><dd className="font-medium">{o.deliveryMethod === "pickup" ? "Store pickup" : "Home delivery"}</dd></div>
            {o.location && <div className="flex justify-between"><dt className="text-muted">Location</dt><dd className="font-medium"><a href={`https://maps.google.com/?q=${o.location}`} target="_blank" rel="noopener noreferrer" className="text-leaf underline">View on map</a></dd></div>}
            {o.landmark && <div className="flex justify-between"><dt className="text-muted">Landmark</dt><dd className="font-medium">{o.landmark}</dd></div>}
            {o.deliveryDate && <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="font-medium">{o.deliveryDate}</dd></div>}
          </dl>
        </section>

        <section className="rounded-2xl bg-paper p-5 shadow-soft">
          <h2 className="mb-3 font-display text-base font-semibold">Payment</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Method</dt><dd className="font-medium">{o.paymentMethod.toUpperCase()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Payment status</dt><dd className={`font-medium ${o.paymentStatus === "paid" ? "text-leaf" : o.paymentStatus === "failed" ? "text-chethi" : ""}`}>{o.paymentStatus}</dd></div>
            {o.notes && <div className="flex justify-between"><dt className="text-muted">Notes</dt><dd className="text-right font-medium">{o.notes}</dd></div>}
          </dl>

          <div className="mt-4 flex gap-2">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">
              WhatsApp customer
            </a>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-paper p-5 shadow-soft">
        <h2 className="mb-3 font-display text-base font-semibold">Items</h2>
        <ul className="divide-y divide-ink/5">
          {o.items.map((it, i) => (
            <li key={i} className="flex items-center justify-between py-2.5 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {it.name} <span className="text-muted">{it.nameMl && it.nameMl !== it.name ? `· ${it.nameMl}` : ""}</span>
              </span>
              <span className="text-muted">× {it.qty}</span>
              <span className="ml-4 font-medium">{formatPrice(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(o.subtotal)}</span></div>
          <div className="flex justify-between text-muted"><span>Delivery</span><span>{formatPrice(o.deliveryCharge)}</span></div>
          <div className="flex justify-between font-display text-lg font-semibold"><span>Total</span><span>{formatPrice(o.total)}</span></div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-paper p-5 shadow-soft">
        <h2 className="mb-3 font-display text-base font-semibold">Update status</h2>
        <form action={updateOrderStatus} className="flex max-w-sm items-center gap-2">
          <input type="hidden" name="id" value={o.id} />
          <select name="status" defaultValue={o.orderStatus} className="flex-1 rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button className="rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-cream">Update</button>
        </form>
      </section>
    </div>
  );
}
