const CX = 170;
const CY = 170;

// Deterministic pseudo-random in [0,1) — stable across renders, no hydration drift.
function hash(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Teardrop petal: base near the ring, tip pointing outward.
function petalPath(len: number, width: number): string {
  const w = width / 2;
  const tip = -len * 0.62;
  const base = len * 0.38;
  return `M 0 ${base} C ${-w * 0.95} ${base * 0.4} ${-w} ${tip * 0.45} 0 ${tip} C ${w} ${tip * 0.45} ${w * 0.95} ${base * 0.4} 0 ${base} Z`;
}

function veinPath(len: number): string {
  return `M 0 ${len * 0.3} L 0 ${-len * 0.5}`;
}

// Each ring: base (inner) colour → tip (outer) colour for depth.
const RINGS = [
  { petals: 8,  r: 14,  len: 18, width: 13, base: "#b8893a", tip: "#ecd27a" }, // gold
  { petals: 12, r: 32,  len: 26, width: 18, base: "#9c2a1f", tip: "#e05c41" }, // chethi red
  { petals: 16, r: 56,  len: 30, width: 22, base: "#c96a15", tip: "#f5a94a" }, // marigold
  { petals: 20, r: 84,  len: 32, width: 26, base: "#5e2d53", tip: "#9a5a86" }, // plum
  { petals: 24, r: 114, len: 34, width: 28, base: "#e7e0d0", tip: "#ffffff" }, // thumba white
  { petals: 30, r: 146, len: 28, width: 30, base: "#123f22", tip: "#337a4b" }, // leaf green
];

export function Pookalam({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 340" className={className} aria-hidden="true">
      <defs>
        {/* warm ambient glow behind the carpet */}
        <radialGradient id="pk-glow" cx="50%" cy="42%" r="62%">
          <stop offset="0" stopColor="#c79a3b" stopOpacity="0.22" />
          <stop offset="0.55" stopColor="#c79a3b" stopOpacity="0.06" />
          <stop offset="1" stopColor="#c79a3b" stopOpacity="0" />
        </radialGradient>
        {RINGS.map((ring, ri) => (
          <linearGradient key={ri} id={`pk-g${ri}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={ring.base} />
            <stop offset="0.55" stopColor={ring.base} />
            <stop offset="1" stopColor={ring.tip} />
          </linearGradient>
        ))}
      </defs>

      {/* glow + soft ground shadow */}
      <circle cx={CX} cy={CY} r={172} fill="url(#pk-glow)" />
      <circle cx={CX} cy={CY + 5} r={163} fill="#2a2114" opacity="0.1" />

      {RINGS.map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.petals }).map((_, pi) => {
            const angle = (360 / ring.petals) * pi;
            const jitter = (hash(pi, ri) - 0.5) * 5; // ±2.5° rotation
            const scale = 0.9 + hash(pi, ri + 40) * 0.2; // 0.9–1.1 length
            const lean = (hash(pi, ri + 80) - 0.5) * 6; // ±3° petal lean
            const swayDelay = (hash(pi, ri + 120) * 4.5).toFixed(2);
            return (
              <g
                key={pi}
                className="petal-node"
                transform={`rotate(${angle + jitter} ${CX} ${CY}) translate(${CX} ${CY - ring.r}) rotate(${lean})`}
              >
                <g className="petal-sway" style={{ animationDelay: `${swayDelay}s` }}>
                  <path d={petalPath(ring.len * scale, ring.width)} fill={`url(#pk-g${ri})`} />
                  <path
                    d={veinPath(ring.len * scale)}
                    stroke={ring.tip}
                    strokeOpacity="0.45"
                    strokeWidth="0.7"
                    fill="none"
                  />
                </g>
              </g>
            );
          })}
        </g>
      ))}

      {/* layered kolam centre */}
      <circle cx={CX} cy={CY} r={5.4} fill="#a87e2a" />
      <circle cx={CX} cy={CY} r={3.4} fill="#d8a83e" />
      <circle cx={CX - 0.9} cy={CY - 0.9} r={1} fill="#fff6dc" />
    </svg>
  );
}
