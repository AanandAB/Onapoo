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

/** Thrikkakarappan — the conical clay figure central to Onam. */
export function Thrikkakarappan({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" className={className} fill="currentColor" aria-hidden="true">
      <path d="M60 16 L102 132 Q60 152 18 132 Z" />
      <path d="M60 4 Q68 12 60 20 Q52 12 60 4 Z" />
      <path d="M42 96 Q60 106 78 96" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.5" />
      <path d="M34 118 Q60 128 86 118" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.5" />
    </svg>
  );
}

/** Banana leaf (for the Onam sadya association). */
export function BananaLeaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" className={className} fill="currentColor" aria-hidden="true">
      <path d="M100 96 Q16 62 8 10 Q60 22 100 16 Q140 22 192 10 Q184 62 100 96 Z" />
      <path d="M100 96 L100 16" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M100 72 L58 46 M100 56 L62 30 M100 40 L72 20" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.35" />
      <path d="M100 72 L142 46 M100 56 L138 30 M100 40 L128 20" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.35" />
    </svg>
  );
}

/** Stylised Kathakali mask. */
export function Kathakali({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 170" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16 88 Q70 14 124 88 L108 94 Q70 46 32 94 Z" />
      <circle cx="70" cy="58" r="8" />
      <path d="M70 152 Q26 132 34 94 Q70 82 106 94 Q114 132 70 152 Z" />
      <path d="M56 150 Q70 162 84 150 Q70 158 56 150 Z" opacity="0.8" />
    </svg>
  );
}
