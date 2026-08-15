import { requireAdmin, getProfitReport, listExpenses } from "@/lib/admin";
import { addExpense, deleteExpense } from "@/app/admin/actions";
import { ProfitReportView } from "@/components/profit-report";

export const dynamic = "force-dynamic";

function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default async function ProfitPage() {
  await requireAdmin();
  const report = await getProfitReport();
  const expenses = await listExpenses();

  const inputCls =
    "w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-base text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold">Profit &amp; Loss</h1>
      <p className="mt-1 text-sm text-muted">
        Live report from your orders, cost prices and added expenses.
      </p>

      <div className="mt-6">
        <ProfitReportView report={report} />
      </div>

      {/* Expenses */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-paper p-5">
          <h2 className="font-display text-base font-semibold">Add expense</h2>
          <p className="mt-1 text-xs text-muted">
            Fuel, packing, labour, rent — anything extra you spend.
          </p>
          <form action={addExpense} className="mt-4 space-y-3">
            <input
              name="label"
              required
              placeholder="What was it? (e.g. Fuel, packing)"
              className={inputCls}
            />
            <input
              name="amount"
              type="number"
              min={1}
              required
              placeholder="Amount (₹)"
              className={inputCls}
            />
            <button className="w-full rounded-full bg-leaf py-3 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5">
              Add expense
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-ink/10 bg-paper p-5">
          <h2 className="font-display text-base font-semibold">Expenses ({expenses.length})</h2>
          {expenses.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No expenses added yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink/5">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.label}</p>
                    <p className="text-xs text-muted">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-chethi">{formatINR(e.amount)}</span>
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="rounded-lg border border-ink/15 px-2 py-1 text-xs font-semibold text-chethi hover:bg-chethi/5">
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
