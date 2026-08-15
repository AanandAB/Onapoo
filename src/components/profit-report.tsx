"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfitReport } from "@/lib/admin";

function formatINR(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
}

// Ease-out count-up animation.
function useAnimatedNumber(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function StatCard({
  label,
  value,
  accent,
  negative,
}: {
  label: string;
  value: number;
  accent: string; // tailwind text color class
  negative?: boolean;
}) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="rounded-xl border border-ink/10 bg-paper p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${accent}`}>
        {formatINR(negative ? -Math.abs(animated) : animated)}
      </p>
    </div>
  );
}

export function ProfitReportView({ report }: { report: ProfitReport }) {
  // Trigger bar-growth animation after first paint.
  const [grown, setGrown] = useState(false);
  const frame = useRef(0);
  useEffect(() => {
    frame.current = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const { daily } = report;
  const max = Math.max(1, ...daily.map((d) => Math.max(d.revenue, d.profit)));

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Revenue" value={report.revenue} accent="text-gold-deep" />
        <StatCard label="Cost of goods" value={report.cogs} accent="text-chethi" />
        <StatCard
          label="Gross profit"
          value={report.grossProfit}
          accent={report.grossProfit >= 0 ? "text-leaf-deep" : "text-chethi"}
          negative={report.grossProfit < 0}
        />
        <StatCard label="Expenses" value={report.totalExpenses} accent="text-muted" />
        <StatCard
          label="Net profit"
          value={report.netProfit}
          accent={report.netProfit >= 0 ? "text-leaf-deep" : "text-chethi"}
          negative={report.netProfit < 0}
        />
      </div>

      <p className="mt-2 text-xs text-muted">
        {report.ordersCount} order{report.ordersCount === 1 ? "" : "s"} counted · cancelled excluded · delivery fees not counted as profit
      </p>

      {/* Bar chart — last 14 days */}
      <div className="mt-6 rounded-xl border border-ink/10 bg-paper p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Revenue vs profit — last 14 days</h2>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gold-deep" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-leaf-deep" /> Profit
            </span>
          </div>
        </div>

        <div className="flex h-48 items-end gap-1 sm:h-56">
          {daily.map((d) => {
            const revH = Math.max(0, (d.revenue / max) * 100);
            const profH = Math.max(0, (d.profit / max) * 100);
            const label = new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            });
            return (
              <div key={d.date} className="group flex h-full flex-1 flex-col justify-end">
                <div className="flex h-full flex-1 items-end justify-center gap-[2px]">
                  <div
                    title={`${label} · Revenue ${formatINR(d.revenue)}`}
                    className="w-1/2 max-w-[14px] rounded-t-sm bg-gold-deep/80 transition-all duration-700 ease-out group-hover:bg-gold-deep"
                    style={{ height: grown ? `${revH}%` : "0%" }}
                  />
                  <div
                    title={`${label} · Profit ${formatINR(d.profit)}`}
                    className={`w-1/2 max-w-[14px] rounded-t-sm transition-all duration-700 ease-out ${
                      d.profit >= 0 ? "bg-leaf-deep/80 group-hover:bg-leaf-deep" : "bg-chethi/80"
                    }`}
                    style={{ height: grown ? `${profH}%` : "0%" }}
                  />
                </div>
                <div className="mt-1 hidden truncate text-center text-[9px] text-muted sm:block">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1 text-center text-[10px] text-muted sm:hidden">
          last 14 days
        </div>
      </div>
    </div>
  );
}
