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
  const max = Math.max(1, ...daily.map((d) => Math.max(d.revenue, d.netProfit)));

  // Cumulative (overall) series.
  let cumRevenue = 0;
  let cumProfit = 0;
  const cumulative = daily.map((d) => {
    cumRevenue += d.revenue;
    cumProfit += d.netProfit;
    return { revenue: cumRevenue, netProfit: cumProfit };
  });
  const maxCum = Math.max(1, ...cumulative.map((c) => Math.max(c.revenue, c.netProfit)));
  const minCum = Math.min(0, ...cumulative.map((c) => c.netProfit));
  const rangeCum = Math.max(1, maxCum - minCum);
  const W = 600;
  const H = 200;
  const px = (i: number) => (cumulative.length <= 1 ? W / 2 : (i / (cumulative.length - 1)) * W);
  const py = (v: number) => H - ((v - minCum) / rangeCum) * H;
  const revPoints = cumulative.map((c, i) => `${px(i)},${py(c.revenue)}`).join(" ");
  const profitPoints = cumulative.map((c, i) => `${px(i)},${py(c.netProfit)}`).join(" ");

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Revenue" value={report.revenue} accent="text-gold-deep" />
        <StatCard
          label="Discounts given"
          value={report.totalDiscounts}
          accent="text-muted"
          negative={report.totalDiscounts > 0}
        />
        <StatCard label="Cost of goods" value={report.cogs} accent="text-chethi" />
        <StatCard
          label="Gross profit"
          value={report.grossProfit}
          accent={report.grossProfit >= 0 ? "text-leaf-deep" : "text-chethi"}
          negative={report.grossProfit < 0}
        />
        <StatCard label="Expenses" value={report.totalExpenses} accent="text-muted" />
        <StatCard label="Stock purchases" value={report.totalPurchases} accent="text-chethi" />
        <StatCard
          label="Net profit"
          value={report.netProfit}
          accent={report.netProfit >= 0 ? "text-leaf-deep" : "text-chethi"}
          negative={report.netProfit < 0}
        />
      </div>

      <p className="mt-2 text-xs text-muted">
        {report.ordersCount} order{report.ordersCount === 1 ? "" : "s"} counted · cancelled excluded · delivery fees not counted as profit
        · stock purchases shown separately (already covered by cost of goods, not subtracted twice)
      </p>

      {/* Bar chart — last 14 days */}
      <div className="mt-6 rounded-xl border border-ink/10 bg-paper p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Revenue vs net profit — last 14 days</h2>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gold-deep" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-leaf-deep" /> Net profit
            </span>
          </div>
        </div>

        <div className="flex h-48 items-end gap-1 sm:h-56">
          {daily.map((d) => {
            const revH = Math.max(0, (d.revenue / max) * 100);
            const profH = Math.max(0, (d.netProfit / max) * 100);
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
                    title={`${label} · Net profit ${formatINR(d.netProfit)}`}
                    className={`w-1/2 max-w-[14px] rounded-t-sm transition-all duration-700 ease-out ${
                      d.netProfit >= 0 ? "bg-leaf-deep/80 group-hover:bg-leaf-deep" : "bg-chethi/80"
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

      {/* Cumulative (overall) chart */}
      <div className="mt-6 rounded-xl border border-ink/10 bg-paper p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Overall — cumulative totals</h2>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gold-deep" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-leaf-deep" /> Net profit
            </span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: "13rem" }}
        >
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(0,0,0,0.06)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" x2={W} y1={py(0)} y2={py(0)} stroke="rgba(0,0,0,0.18)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <polygon
            points={`0,${H} ${profitPoints} ${W},${H}`}
            fill="rgba(22,101,52,0.08)"
            className={grown ? "opacity-100 transition-opacity duration-700" : "opacity-0"}
          />
          <polyline
            points={revPoints}
            fill="none"
            stroke="#b8860b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={grown ? "opacity-100 transition-opacity duration-700" : "opacity-0"}
          />
          <polyline
            points={profitPoints}
            fill="none"
            stroke="#166534"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={grown ? "opacity-100 transition-opacity duration-700" : "opacity-0"}
          />
        </svg>

        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>{daily[0]?.date.slice(5)}</span>
          <span>{daily[7]?.date.slice(5)}</span>
          <span>{daily[13]?.date.slice(5)}</span>
        </div>
      </div>
    </div>
  );
}
