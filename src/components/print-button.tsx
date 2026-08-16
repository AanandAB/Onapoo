"use client";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5 print:hidden"
    >
      🖨 {label}
    </button>
  );
}
