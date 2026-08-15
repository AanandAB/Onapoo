import { requireAdmin, listCoupons } from "@/lib/admin";
import { deleteCoupon } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  await requireAdmin();
  const coupons = await listCoupons();
  const unused = coupons.filter((c) => !c.used).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Coupons</h1>
        <p className="mt-1 text-sm text-muted">
          {coupons.length} total · {unused} unused
        </p>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-xl border border-ink/10 bg-paper p-8 text-center">
          <p className="text-sm text-muted">No coupons yet.</p>
          <p className="mt-2 text-xs text-muted">
            Generate them with the desktop Coupon Generator (coupon_generator.py), or insert into
            the coupons table directly.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-paper">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.type === "percent" ? "Discount %" : "Free delivery"}
                  </td>
                  <td className="px-4 py-3">{c.type === "percent" ? `${c.value}%` : "—"}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">
                    {c.used ? (
                      <span className="rounded-full bg-chethi/10 px-2 py-0.5 text-xs font-semibold text-chethi">
                        Used
                      </span>
                    ) : (
                      <span className="rounded-full bg-leaf/10 px-2 py-0.5 text-xs font-semibold text-leaf">
                        Unused
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteCoupon}>
                      <input type="hidden" name="code" value={c.code} />
                      <button className="rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-semibold text-chethi hover:bg-chethi/5">
                        Delete
                      </button>
                    </form>
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
