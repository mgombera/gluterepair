import type { PartId, Stage } from "./parts";

// Flat drawing for browsers without WebGL: the outside of the right hip, with
// the same parts and stages as the 3D model. Not to scale.
export function Glute2D({ stage, selected, onSelect }: { stage: Stage; selected: PartId | null; onSelect: (id: PartId) => void }) {
  const torn = stage === "before";
  const hit = (id: PartId) => ({
    onClick: () => onSelect(id),
    style: { cursor: "pointer" },
    strokeWidth: selected === id ? 3 : 1.5,
  });
  return (
    <svg viewBox="0 0 300 340" className="h-full w-full" role="img" aria-label={torn ? "Drawing of the tendons torn off the greater trochanter" : "Drawing of the tendons repaired to the greater trochanter with anchors"}>
      <rect width="300" height="340" fill="#1d2440" />
      {/* femur and trochanter */}
      <path d="M150 200 q-40 -10 -50 -45 q-5 -25 20 -30 q30 0 45 25 q15 25 10 50 l5 140 h-45 l0 -140z" fill="#e8e0cf" stroke="#9c927e" {...hit("greater-trochanter")} />
      {/* footprint */}
      {torn && <ellipse cx="128" cy="160" rx="22" ry="14" fill="#ff9b57" stroke="#c96a2a" {...hit("footprint")} />}
      {/* gluteus medius and minimus */}
      <path d={torn ? "M70 20 h140 l-35 105 h-60z" : "M70 20 h140 l-45 135 h-50z"} fill="#b8574f" stroke="#7d332d" {...hit("gluteus-medius")} />
      <path d={torn ? "M120 105 h50 l-8 20 h-36z" : "M118 125 h50 l-8 35 h-36z"} fill="#f1e6d2" stroke="#b8a888" {...hit("gluteus-medius")} />
      {torn && <path d="M124 125 h38" stroke="#ff4d4d" strokeWidth={5} />}
      <path d={torn ? "M165 55 h40 l-20 55 h-20z" : "M168 60 h40 l-22 80 h-20z"} fill="#9c4a43" stroke="#6b2c27" opacity={0.9} {...hit("gluteus-minimus")} />
      {/* bursa */}
      {torn && <ellipse cx="105" cy="185" rx="16" ry="10" fill="#f28db2" stroke="#b85a80" opacity={0.9} {...hit("bursa")} />}
      {/* anchors and sutures */}
      {!torn && (
        <g {...hit("anchors")}>
          <path d="M128 140 L148 172 M148 140 L128 172 M128 140 L128 172 M148 140 L148 172" stroke="#3aa7f0" strokeWidth={2} />
          {[
            [128, 140],
            [148, 140],
            [128, 172],
            [148, 172],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="#fff" stroke="#666" />
          ))}
        </g>
      )}
      {/* IT band */}
      <path d="M60 10 h40 v320 h-40z" fill="#dfe8f2" opacity={0.35} stroke="#dfe8f2" {...hit("it-band")} />
    </svg>
  );
}
