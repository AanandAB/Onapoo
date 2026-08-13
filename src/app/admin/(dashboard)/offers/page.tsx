import { requireAdmin, listOffersAdmin, getOfferById } from "@/lib/admin";
import { saveOffer, deleteOffer } from "@/app/admin/actions";
import { OFFER_TYPES, type OfferRow } from "@/db/schema";

const input =
  "w-full rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const label = "mb-1 block text-sm font-semibold";

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;
  const offers = await listOffersAdmin();
  const item = edit && edit !== "new" ? await getOfferById(edit) : null;
  const showForm = !!edit;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Offers</h1>
          <p className="text-sm text-muted">{offers.length} offers</p>
        </div>
        {!showForm && (
          <a
            href="?edit=new"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            + New offer
          </a>
        )}
      </div>

      {showForm && <OfferForm item={item} onCancel="/admin/offers" />}

      {!showForm && (
        <div className="overflow-x-auto rounded-2xl bg-paper shadow-soft">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Offer</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {offers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No offers yet — create your first one.
                  </td>
                </tr>
              )}
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.titleEn}</p>
                    <p className="text-xs text-muted">{o.titleMl}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {o.type === "percent" ? `${o.value}%` : `₹${o.value}`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        o.active ? "bg-leaf/10 text-leaf" : "bg-ink/10 text-muted"
                      }`}
                    >
                      {o.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`?edit=${o.id}`}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream"
                      >
                        Edit
                      </a>
                      <form action={deleteOffer}>
                        <input type="hidden" name="id" value={o.id} />
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
    </div>
  );
}

function OfferForm({ item, onCancel }: { item: OfferRow | null; onCancel: string }) {
  const isEditing = !!item;
  return (
    <form action={saveOffer} className="mb-8 max-w-2xl rounded-2xl bg-paper p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {isEditing ? "Edit offer" : "New offer"}
        </h2>
        <a href={onCancel} className="text-sm text-muted hover:text-ink">
          Cancel
        </a>
      </div>

      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Title (English)</label>
          <input name="titleEn" defaultValue={item?.titleEn} required className={input} />
        </div>
        <div>
          <label className={label}>Title (Malayalam)</label>
          <input name="titleMl" defaultValue={item?.titleMl} className={input} />
        </div>
        <div>
          <label className={label}>Type</label>
          <select name="type" defaultValue={item?.type ?? "percent"} className={input}>
            {OFFER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "percent" ? "Percentage (%)" : "Flat (₹)"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Value</label>
          <input name="value" type="number" min={0} defaultValue={item?.value ?? ""} required className={input} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Banner text (English)</label>
          <input name="bannerTextEn" defaultValue={item?.bannerTextEn ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Banner text (Malayalam)</label>
          <input name="bannerTextMl" defaultValue={item?.bannerTextMl ?? ""} className={input} />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={item ? item.active : true} className="h-4 w-4 accent-gold-deep" />
        Active
      </label>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          {isEditing ? "Save changes" : "Create offer"}
        </button>
        <a href={onCancel} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold">
          Cancel
        </a>
      </div>
    </form>
  );
}
