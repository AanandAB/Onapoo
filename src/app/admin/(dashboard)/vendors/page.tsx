import { requireAdmin, listVendors, getVendorById } from "@/lib/admin";
import { saveVendor, deleteVendor } from "@/app/admin/actions";
import type { VendorRow } from "@/db/schema";

const input =
  "w-full rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const label = "mb-1 block text-sm font-semibold";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;
  const vendors = await listVendors();
  const item = edit && edit !== "new" ? await getVendorById(edit) : null;
  const showForm = !!edit;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Vendors</h1>
          <p className="text-sm text-muted">
            {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"} · suppliers you buy flowers from
          </p>
        </div>
        {!showForm && (
          <a
            href="?edit=new"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            + New vendor
          </a>
        )}
      </div>

      {showForm && <VendorForm item={item} onCancel="/admin/vendors" />}

      {!showForm && (
        <>
          {vendors.length === 0 ? (
            <div className="rounded-2xl bg-paper p-10 text-center shadow-soft">
              <p className="text-muted">No vendors yet.</p>
              <p className="mt-1 text-sm text-muted">
                Add a supplier only if you have one — vendors are optional.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-paper shadow-soft">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Supplies</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-cream/60">
                      <td className="px-4 py-3 font-semibold">{v.name}</td>
                      <td className="px-4 py-3">
                        {v.phone ? (
                          <a href={`tel:${v.phone}`} className="text-muted hover:text-ink">
                            {v.phone}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">{v.location || "—"}</td>
                      <td className="px-4 py-3 max-w-[220px] text-muted">{v.supplies || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            v.active ? "bg-leaf/10 text-leaf" : "bg-ink/5 text-muted"
                          }`}
                        >
                          {v.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`?edit=${v.id}`}
                            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream"
                          >
                            Edit
                          </a>
                          <form action={deleteVendor}>
                            <input type="hidden" name="id" value={v.id} />
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

function VendorForm({ item, onCancel }: { item: VendorRow | null; onCancel: string }) {
  const isEditing = !!item;
  return (
    <form action={saveVendor} className="mb-8 rounded-2xl bg-paper p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{isEditing ? "Edit vendor" : "New vendor"}</h2>
        <a href={onCancel} className="text-sm text-muted hover:text-ink">
          Cancel
        </a>
      </div>

      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input name="name" defaultValue={item?.name} required className={input} placeholder="e.g. Gundlupet APMC" />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input name="phone" defaultValue={item?.phone ?? ""} className={input} placeholder="+91 …" />
        </div>
        <div>
          <label className={label}>Location</label>
          <input name="location" defaultValue={item?.location ?? ""} className={input} placeholder="Town / address" />
        </div>
        <div>
          <label className={label}>What they supply</label>
          <input name="supplies" defaultValue={item?.supplies ?? ""} className={input} placeholder="Marigold, Chethi, Thumba…" />
        </div>
      </div>

      <div className="mt-4 flex items-end">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked={item ? item.active : true} className="h-4 w-4 accent-gold-deep" />
          Active
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          {isEditing ? "Save changes" : "Create vendor"}
        </button>
        <a href={onCancel} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold">
          Cancel
        </a>
      </div>
    </form>
  );
}
