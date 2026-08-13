// Onam decorative SVG motifs — kasavu-gold, static, server-compatible.
// Use them as low-opacity background elements (they inherit `currentColor`).

/** Kerala oil lamp (nilavilakku). */
export function Nilavilakku({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 220" className={className} fill="currentColor" aria-hidden="true">
      {/* flame */}
      <path d="M50 14c6.5 14 6.5 26 0 36-6.5-10-6.5-22 0-36z" />
      {/* bowl */}
      <path d="M32 62q18-13 36 0l-4 7q-14-9-28 0z" />
      {/* stem */}
      <rect x="47" y="70" width="6" height="92" rx="2" />
      {/* tiered base */}
      <ellipse cx="50" cy="164" rx="14" ry="4.5" />
      <ellipse cx="50" cy="182" rx="22" ry="5.5" />
      <ellipse cx="50" cy="204" rx="32" ry="7" />
    </svg>
  );
}

/** Snake boat (chundan vallam) from the Vallam Kali race. */
export function Vallam({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 110" className={className} fill="currentColor" aria-hidden="true">
      {/* hull */}
      <path d="M14 66q156-30 312 0l-6 12q-150-22-300 0z" />
      {/* curled prow */}
      <path d="M14 66q-20-15-3-38 12 17 7 34z" />
      {/* stern */}
      <path d="M326 66q16-9 8-26-7 15-10 28z" />
      {/* oars */}
      <g stroke="currentColor" strokeWidth="2.4" fill="none">
        <path d="M50 42l5 18" />
        <path d="M95 38l5 20" />
        <path d="M140 36l5 22" />
        <path d="M185 36l5 22" />
        <path d="M230 38l5 20" />
        <path d="M275 42l5 18" />
      </g>
    </svg>
  );
}

/** Eight-petal flower (chethi-style), used as a scattered accent. */
export function FlowerGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <g>
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx="16" cy="6.2" rx="3.2" ry="5.4" transform={`rotate(${i * 45} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="3.4" />
    </svg>
  );
}

/** Kasavu-saree style repeating diamond border. */
export function KasavuDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 20" className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="kasavu-diamond" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0l7 10-7 10-7-10z" fill="currentColor" />
          <circle cx="20" cy="10" r="1.8" fill="currentColor" opacity="0.45" />
          <circle cx="0" cy="10" r="1.4" fill="currentColor" opacity="0.4" />
          <circle cx="40" cy="10" r="1.4" fill="currentColor" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="1200" height="20" fill="url(#kasavu-diamond)" />
    </svg>
  );
}
