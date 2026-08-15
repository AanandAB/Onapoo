import { requireAdmin, getDeliveryMapOrders } from "@/lib/admin";
import { DeliveryMap } from "@/components/delivery-map";
import { STORE_LAT, STORE_LNG } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
};

const LEGEND: { label: string; color: string }[] = [
  { label: "New", color: "#d97706" },
  { label: "Confirmed", color: "#2563eb" },
  { label: "Packed", color: "#7c3aed" },
  { label: "Out for delivery", color: "#16a34a" },
];

export default async function DeliveryMapPage() {
  await requireAdmin();
  const { plotted, unplotted } = await getDeliveryMapOrders();

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold">Delivery map</h1>
      <p className="mt-1 text-sm text-muted">
        Pending delivery orders plotted on the map (cancelled &amp; delivered excluded). Exact pin =
        customer shared their location; faded/approx = pincode area.
      </p>

      <div className="mt-4">
        <DeliveryMap orders={plotted} center={[STORE_LAT, STORE_LNG]} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-white shadow" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
        <span className="text-muted">· {plotted.length} on map</span>
      </div>

      {unplotted.length > 0 && (
        <div className="mt-6 rounded-xl border border-ink/10 bg-paper p-5">
          <h2 className="font-display text-base font-semibold">
            Not on map ({unplotted.length}) — no coordinates
          </h2>
          <p className="mt-1 text-xs text-muted">
            These orders didn&apos;t share a location and their pincode couldn&apos;t be geocoded.
          </p>
          <ul className="mt-3 divide-y divide-ink/5 text-sm">
            {unplotted.map((o) => (
              <li key={o.orderNumber} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.customerName}</p>
                  <p className="truncate text-xs text-muted">
                    {o.address} · {o.pincode}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {STATUS_LABEL[o.orderStatus] ?? o.orderStatus}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
