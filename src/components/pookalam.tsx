"use client";

const CX = 170;
const CY = 170;

// Concentric rings of petals, centre-out (traditional pookalam colour sequence).
const RINGS = [
  { petals: 6, r: 10, len: 22, color: "#c79a3b" }, // gold centre
  { petals: 10, r: 34, len: 30, color: "#b83a2b" }, // chethi red
  { petals: 14, r: 62, len: 34, color: "#e8822a" }, // marigold
  { petals: 18, r: 92, len: 38, color: "#7a3b69" }, // vadamalli purple
  { petals: 24, r: 124, len: 42, color: "#fffdf7" }, // thumba white
  { petals: 30, r: 158, len: 44, color: "#1f5c34" }, // leaf green
];

export function Pookalam({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 340" className={className} aria-hidden="true">
      {/* soft shadow disc behind */}
      <circle cx={CX} cy={CY} r={168} fill="#2a2114" opacity={0.06} />
      {RINGS.map((ring, ri) =>
        Array.from({ length: ring.petals }).map((_, pi) => {
          const angle = (360 / ring.petals) * pi;
          return (
            <g
              key={`${ri}-${pi}`}
              className="petal-node"
              transform={`rotate(${angle} ${CX} ${CY}) translate(${CX} ${CY - ring.r})`}
            >
              <ellipse
                cx="0"
                cy="0"
                rx={ring.len * 0.3}
                ry={ring.len * 0.52}
                fill={ring.color}
                opacity="0.93"
              />
            </g>
          );
        }),
      )}
      <circle cx={CX} cy={CY} r={5} fill="#a87e2a" />
    </svg>
  );
}
