import { pictureOf, type PictureKind } from "./picture";

/** A small still picture of an approach's invented path and where its trades open, for the index. Drawn on the server, as SVG. */
export function StrategyThumb({ kind }: { kind: PictureKind }) {
  const { pts, trades } = pictureOf(kind);
  const W = 120;
  const H = 56;
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const x = (i: number) => 3 + (i / (pts.length - 1)) * (W - 6);
  const y = (v: number) => H - 4 - ((v - lo) / (hi - lo || 1)) * (H - 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[11rem] text-ink-2" aria-hidden>
      <polyline points={pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
      {trades.map((t) => (
        <circle key={`${t.a}-${t.b}`} cx={x(t.a)} cy={y(pts[t.a]!)} r={1.9} fill="var(--accent)" />
      ))}
    </svg>
  );
}
