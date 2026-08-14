import { requireAdmin, getReports } from "@/lib/admin";
import { formatPrice } from "@/lib/site";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const METHOD_LABEL: Record<string, string> = {
  delivery: "Home delivery",
  pickup: "Store pickup",
  cod: "Cash on delivery",
  upi: "UPI",
  razorpay: "Razorpay",
  whatsapp: "WhatsApp",
};

function fmtMoney(n: number) {
  return formatPrice(n);
}

export default async function ReportsPage() {
  await requireAdmin();
  const r = await getReports();

  const maxDayRevenue = Math.max(1, ...r.byDay.map((d) => d.revenue));
  const maxDayCount = Math.max(1, ...r.byDay.map((d) => d.count));

  const kpis = [
    { label: "Total revenue", value: fmtMoney(r.totalRevenue), sub: "excl. cancelled" },
    { label: "Total orders", value: String(r.totalOrders), sub: "all time" },
    { label: "Today's orders", value: String(r.todayOrders), sub: fmtMoney(r.todayRevenue) },
    { label: "Pending", value: String(r.pending), sub: "new + confirmed" },
    { label: "Avg order value", value: fmtMoney(r.avgOrder), sub: "excl. cancelled" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted">Sales, orders and product performance.</p>
        </div>
        <a
          href="/api/admin/export-orders"
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-cream"
        >
          Export CSV
        </a>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl bg-paper p-4 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted">{k.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{k.value}</p>
            <p className="text-xs text-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <div className="rounded-2xl bg-paper p-5 shadow-soft">
          <h2 className="mb-4 font-display text-lg font-semibold">Orders by status</h2>
          <div className="space-y-3">
            {r.byStatus.map((s) => (
              <div key={s.status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{STATUS_LABEL[s.status]}</span>
                  <span className="text-muted">
                    {s.count} · {fmtMoney(s.revenue)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-cream-dark">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${r.totalOrders ? (s.count / r.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by day */}
        <div className="rounded-2xl bg-paper p-5 shadow-soft">
          <h2 className="mb-4 font-display text-lg font-semibold">Revenue · last 14 days</h2>
          <div className="flex h-40 items-end gap-1">
            {r.byDay.map((d) => (
              <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-t bg-leaf/70 transition-colors group-hover:bg-leaf"
                  style={{ height: `${Math.max(4, (d.revenue / maxDayRevenue) * 100)}%` }}
                  title={`${d.date}: ${fmtMoney(d.revenue)} (${d.count} orders)`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{r.byDay[0]?.date.slice(5)}</span>
            <span>{r.byDay[7]?.date.slice(5)}</span>
            <span>{r.byDay[13]?.date.slice(5)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-2xl bg-paper p-5 shadow-soft">
          <h2 className="mb-4 font-display text-lg font-semibold">Top products</h2>
          {r.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {r.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-xs font-semibold text-gold-deep">
                      {i + 1}
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted">{p.qty} sold · </span>
                    <span className="font-semibold">{fmtMoney(p.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment + delivery breakdown */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-paper p-5 shadow-soft">
            <h2 className="mb-3 font-display text-lg font-semibold">Payment method</h2>
            <div className="space-y-2 text-sm">
              {r.byPayment.map((p) => (
                <div key={p.method} className="flex justify-between">
                  <span className="text-muted">{METHOD_LABEL[p.method] ?? p.method.toUpperCase()}</span>
                  <span className="font-semibold">{p.count}</span>
                </div>
              ))}
              {r.byPayment.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
            </div>
          </div>
          <div className="rounded-2xl bg-paper p-5 shadow-soft">
            <h2 className="mb-3 font-display text-lg font-semibold">Fulfilment</h2>
            <div className="space-y-2 text-sm">
              {r.byDelivery.map((d) => (
                <div key={d.method} className="flex justify-between">
                  <span className="text-muted">{METHOD_LABEL[d.method] ?? d.method}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
              ))}
              {r.byDelivery.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
