import type { ChartPattern } from "@/data/chart-patterns";

/** A small still picture of an entry's invented price line and its outline, for the index. Drawn on the server, as SVG. */
export function PatternThumb({ pattern }: { pattern: Pick<ChartPattern, "path" | "lines"> }) {
  const { path, lines } = pattern;
  const ys = [...path, ...lines.flatMap((l) => l.pts.map((p) => p[1]))];
  const lo = Math.min(...ys) - 4;
  const hi = Math.max(...ys) + 4;
  const W = 120;
  const H = 64;
  const x = (v: number) => 2 + (v / 100) * (W - 4);
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const f = (n: number) => n.toFixed(1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[11rem]" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline className="text-ink-2" stroke="currentColor" strokeWidth={1.5} points={path.map((v, i) => `${f(x((i * 100) / (path.length - 1)))},${f(y(v))}`).join(" ")} />
      {lines
        .filter((l) => l.kind !== "measure")
        .map((l, i) => (
          <polyline
            key={i}
            className={l.kind === "pole" ? "text-prestige-ink" : "text-accent"}
            stroke="currentColor"
            strokeWidth={l.kind === "pole" ? 2 : 1.1}
            strokeDasharray={l.kind === "curve" ? "1.5 3" : undefined}
            points={l.pts.map((p) => `${f(x(p[0]))},${f(y(p[1]))}`).join(" ")}
          />
        ))}
    </svg>
  );
}
