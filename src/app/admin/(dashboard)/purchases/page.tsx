import { requireAdmin, listPurchases, listVendors } from "@/lib/admin";
import { savePurchase, deletePurchase } from "@/app/admin/actions";
import { formatPrice } from "@/lib/site";
import type { PurchaseWithVendor } from "@/lib/admin";
import type { VendorRow } from "@/db/schema";

const input =
  "w-full rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const label = "mb-1 block text-sm font-semibold";

function fmtDate(d: Date) {
  return (
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; vendor?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const { edit, vendor } = params;
  const [all, vendors] = await Promise.all([listPurchases(), listVendors()]);

  const filtered = vendor && vendor !== "all" ? all.filter((p) => p.vendorId === vendor) : all;
  const totalSpent = filtered.reduce((s, p) => s + p.cost, 0);

  const item = edit && edit !== "new" ? all.find((p) => p.id === edit) ?? null : null;
  const showForm = !!edit;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Purchases</h1>
          <p className="text-sm text-muted">
            {filtered.length} {filtered.length === 1 ? "purchase" : "purchases"} · total {formatPrice(totalSpent)}
          </p>
        </div>
        {!showForm && (
          <a
            href="?edit=new"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            + Record purchase
          </a>
        )}
      </div>

      {showForm && <PurchaseForm item={item} vendors={vendors} onCancel="/admin/purchases" />}

      {!showForm && (
        <>
          {/* Vendor filter */}
          <form method="get" action="/admin/purchases" className="mb-4 flex items-center gap-2">
            <select name="vendor" defaultValue={vendor ?? "all"} className="rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm">
              <option value="all">All vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-cream hover:bg-leaf-deep">
              Apply
            </button>
            {vendor && vendor !== "all" && (
              <a href="/admin/purchases" className="rounded-full px-3 py-2 text-sm font-semibold text-muted hover:text-ink">
                Clear
              </a>
            )}
          </form>

          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-paper p-10 text-center shadow-soft">
              <p className="text-muted">No purchases recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-paper shadow-soft">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/60">
                      <td className="px-4 py-3 text-xs text-muted">{fmtDate(p.createdAt)}</td>
                      <td className="px-4 py-3 font-semibold">{p.item}</td>
                      <td className="px-4 py-3 text-muted">{p.vendorName ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{p.quantity || "—"}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(p.cost)}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate text-xs text-muted">{p.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`?edit=${p.id}`}
                            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream"
                          >
                            Edit
                          </a>
                          <form action={deletePurchase}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className="rounded-full border border-chethi/30 px-3 py-1.5 text-xs font-semibold text-chethi hover:bg-chethi/5">
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PurchaseForm({
  item,
  vendors,
  onCancel,
}: {
  item: PurchaseWithVendor | null;
  vendors: VendorRow[];
  onCancel: string;
}) {
  const isEditing = !!item;
  return (
    <form action={savePurchase} className="mb-8 rounded-2xl bg-paper p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{isEditing ? "Edit purchase" : "Record a purchase"}</h2>
        <a href={onCancel} className="text-sm text-muted hover:text-ink">
          Cancel
        </a>
      </div>

      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Item (what you bought)</label>
          <input name="item" defaultValue={item?.item} required className={input} placeholder="e.g. Marigold" />
        </div>
        <div>
          <label className={label}>Vendor (optional)</label>
          <select name="vendorId" defaultValue={item?.vendorId ?? ""} className={input}>
            <option value="">— No vendor —</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Quantity (optional)</label>
          <input name="quantity" defaultValue={item?.quantity ?? ""} className={input} placeholder="e.g. 10 kg / 5 bunches" />
        </div>
        <div>
          <label className={label}>Cost (₹)</label>
          <input name="cost" type="number" min={0} defaultValue={item?.cost ?? ""} required className={input} />
        </div>
      </div>

      <div className="mt-4">
        <label className={label}>Notes (optional)</label>
        <input name="notes" defaultValue={item?.notes ?? ""} className={input} placeholder="Rate, payment terms…" />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          {isEditing ? "Save changes" : "Record purchase"}
        </button>
        <a href={onCancel} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold">
          Cancel
        </a>
      </div>
    </form>
  );
}
