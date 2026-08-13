import { requireAdmin, listOrdersAdmin } from "@/lib/admin";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, type OrderRow } from "@/db/schema";
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

function waUrl(phone: string, text: string) {
  const p = phone.replace(/[^0-9]/g, "");
  const intl = p.length === 10 ? "91" + p : p;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

function customerMsg(o: OrderRow) {
  const items = o.items.map((i) => `• ${i.name} × ${i.qty}`).join("\n");
  return (
    `Hi ${o.customerName}, your Onapookkal order ${o.orderNumber} is ${STATUS_LABEL[o.orderStatus] ?? o.orderStatus}.\n\n` +
    `${items}\nTotal: ₹${o.total}\n\nThank you! 🌼`
  );
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const orders = await listOrdersAdmin(status ?? "all");

  const tabs = [
    { value: "all", label: "All" },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
  ];
  const active = status && ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]) ? status : "all";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted">{orders.length} {active === "all" ? "orders" : `${STATUS_LABEL[active].toLowerCase()} orders`}</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/export-orders"
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-cream"
          >
            Export CSV
          </a>
          <a
            href="/admin/orders/new"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            + New order
          </a>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <a
            key={t.value}
            href={t.value === "all" ? "/admin/orders" : `/admin/orders?status=${t.value}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active === t.value ? "bg-leaf text-cream" : "bg-paper text-ink/70 hover:bg-cream"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-paper p-10 text-center text-muted shadow-soft">
          No orders here yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-paper shadow-soft">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.map((o) => (
                <tr key={o.id} className="align-top hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <a href={`/admin/orders/${o.id}`} className="font-semibold text-leaf-deep hover:underline">
                      {o.orderNumber}
                    </a>
                    <p className="text-xs text-muted">{fmtDate(o.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.customerName}</p>
                    <p className="text-xs text-muted">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{o.paymentMethod.toUpperCase()}</p>
                    <p className={`text-xs ${o.paymentStatus === "paid" ? "text-leaf" : o.paymentStatus === "failed" ? "text-chethi" : "text-muted"}`}>
                      {o.paymentStatus}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateOrderStatus} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.orderStatus}
                        className="rounded-lg border border-ink/15 bg-cream px-2 py-1.5 text-xs"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-lg bg-leaf px-2.5 py-1.5 text-xs font-semibold text-cream">
                        ✓
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a
                        href={waUrl(o.phone, customerMsg(o))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`/admin/orders/${o.id}`}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
