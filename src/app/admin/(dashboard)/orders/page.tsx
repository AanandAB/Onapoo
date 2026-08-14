import { requireAdmin, listOrdersAdmin, getDistinctPincodes, getDistinctDistricts, getDistinctAreas } from "@/lib/admin";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, DELIVERY_METHODS, type OrderRow } from "@/db/schema";
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

const METHOD_LABEL: Record<string, string> = {
  delivery: "Home delivery",
  pickup: "Pickup",
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
  return (
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}

function fmtDelivDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; method?: string; pincode?: string; district?: string; area?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const { status, q, method, pincode, district, area } = params;
  const orders = await listOrdersAdmin({ status: status ?? "all", q, method, pincode, district, area });
  const pincodes = await getDistinctPincodes();
  const districts = await getDistinctDistricts();
  const areas = await getDistinctAreas();

  const tabs = [
    { value: "all", label: "All" },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
  ];
  const active = status && ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]) ? status : "all";
  const hasFilter = Boolean(q || method || pincode || district || area);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted">
            {orders.length} {active === "all" ? "orders" : `${STATUS_LABEL[active].toLowerCase()} orders`}
            {hasFilter && " (filtered)"}
          </p>
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

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
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

      {/* Filters */}
      <form method="get" action="/admin/orders" className="mb-5 flex flex-wrap items-center gap-2">
        {active !== "all" && <input type="hidden" name="status" value={active} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, phone, address, area…"
          className="min-w-[200px] flex-1 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm focus:border-gold focus:outline-none"
        />
        <select
          name="method"
          defaultValue={method ?? ""}
          className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-sm"
        >
          <option value="">All fulfilment</option>
          {DELIVERY_METHODS.map((m) => (
            <option key={m} value={m}>
              {METHOD_LABEL[m] ?? m}
            </option>
          ))}
        </select>
        <select
          name="pincode"
          defaultValue={pincode ?? ""}
          className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-sm"
        >
          <option value="">All pincodes</option>
          {pincodes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          name="district"
          defaultValue={district ?? ""}
          className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-sm"
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          name="area"
          defaultValue={area ?? ""}
          className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-sm"
        >
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-cream hover:bg-leaf-deep"
        >
          Apply
        </button>
        {hasFilter && (
          <a href="/admin/orders" className="rounded-full px-3 py-2 text-sm font-semibold text-muted hover:text-ink">
            Clear
          </a>
        )}
      </form>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-paper p-10 text-center text-muted shadow-soft">
          No orders match.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-paper shadow-soft">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Items</th>
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
                    <p className="mt-1 max-w-[180px] text-xs text-muted">
                      {o.address}
                      {o.landmark ? ` · ${o.landmark}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{METHOD_LABEL[o.deliveryMethod] ?? o.deliveryMethod}</p>
                    <p className="text-xs text-muted">{o.pincode}</p>
                    {o.area && (
                      <p className="text-xs text-muted">
                        {o.area}
                        {o.district ? `, ${o.district}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-muted">{fmtDelivDate(o.deliveryDate)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.items.reduce((s, i) => s + i.qty, 0)}</p>
                    <p className="max-w-[180px] truncate text-xs text-muted">
                      {o.items.map((i) => i.name).join(", ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{o.paymentMethod.toUpperCase()}</p>
                    <p
                      className={`text-xs ${
                        o.paymentStatus === "paid"
                          ? "text-leaf"
                          : o.paymentStatus === "failed"
                            ? "text-chethi"
                            : "text-muted"
                      }`}
                    >
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
                      <button className="rounded-lg bg-leaf px-2.5 py-1.5 text-xs font-semibold text-cream">✓</button>
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
