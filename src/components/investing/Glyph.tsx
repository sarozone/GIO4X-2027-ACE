import type { Instrument } from "@/data/investing";

/**
 * A small still drawing of each instrument's mechanism, for the index cards.
 * Drawn on the server as SVG, in the page's own colours. It is a diagram of
 * an idea: no axis, no number, nothing that could be read as data.
 */
const ACCENT = "var(--accent)";
const INK = "var(--ink-3)";
const GOLD = "var(--prestige)";

export function Glyph({ slug }: { slug: Instrument["slug"] }) {
  return (
    <svg viewBox="0 0 120 64" className="block h-auto w-full max-w-[11rem]" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {slug === "stocks" && (
        // a company in equal parts, a few of them held
        <g>
          {Array.from({ length: 40 }, (_, i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const held = row === 3 && col < 3;
            return <rect key={i} x={6 + col * 11} y={8 + row * 13} width="8.5" height="10" rx="1" fill={held ? ACCENT : INK} opacity={held ? 1 : 0.28} />;
          })}
        </g>
      )}
      {slug === "bonds" && (
        // a see-saw: rates on one end, price on the other
        <g>
          <path d="M60 46 L52 58 H68 Z" fill={INK} opacity="0.5" />
          <path d="M14 26 L106 44" stroke={INK} />
          <circle cx="18" cy="20" r="7" fill={GOLD} />
          <circle cx="102" cy="36" r="7" fill={ACCENT} />
          <path d="M18 8 V2 M15 5 L18 2 L21 5" stroke={GOLD} />
          <path d="M102 50 V58 M99 55 L102 58 L105 55" stroke={ACCENT} />
        </g>
      )}
      {slug === "etfs" && (
        // a basket, the fund, and the units that come out of it
        <g>
          <rect x="8" y="10" width="18" height="12" fill={INK} opacity="0.55" />
          <rect x="8" y="24" width="18" height="10" fill={INK} opacity="0.4" />
          <rect x="8" y="36" width="18" height="8" fill={INK} opacity="0.3" />
          <rect x="8" y="46" width="18" height="6" fill={INK} opacity="0.2" />
          <path d="M32 31 H44 M40 27 L44 31 L40 35" stroke={INK} />
          <rect x="50" y="14" width="26" height="34" rx="3" stroke={ACCENT} />
          <path d="M82 31 H94 M90 27 L94 31 L90 35" stroke={INK} />
          {[14, 26, 38].map((y) => (
            <circle key={y} cx="106" cy={y + 5} r="4.5" fill={ACCENT} />
          ))}
        </g>
      )}
      {slug === "mutual-funds" && (
        // a day's wandering value, and the one price struck at its end
        <g>
          <path d="M8 40 L20 34 L30 42 L42 30 L54 36 L66 24 L78 28 L88 20" stroke={INK} />
          <path d="M88 8 V56" stroke={GOLD} strokeDasharray="2 4" />
          <path d="M88 20 H114" stroke={ACCENT} strokeWidth="2.5" />
          <circle cx="88" cy="20" r="4" fill={ACCENT} />
          {[22, 46, 70].map((x) => (
            <rect key={x} x={x} y="50" width="6" height="6" fill={INK} opacity="0.5" />
          ))}
        </g>
      )}
      {slug === "index-investing" && (
        // the list by weight, and two lines that part: with and without the fee
        <g>
          {[
            [8, 30],
            [39, 22],
            [62, 17],
            [80, 13],
            [94, 10],
            [105, 7],
          ].map(([x, w], i) => (
            <rect key={x} x={x} y="8" width={w} height="7" fill={ACCENT} opacity={1 - i * 0.14} />
          ))}
          <path d="M8 56 C44 52 80 42 112 22" stroke={INK} />
          <path d="M8 56 C44 54 80 48 112 36" stroke={ACCENT} strokeWidth="2" />
        </g>
      )}
      {slug === "options" && (
        // the payoff line with its bend at the strike
        <g>
          <path d="M6 36 H114" stroke={INK} opacity="0.6" />
          <path d="M62 8 V58" stroke={INK} opacity="0.6" strokeDasharray="2 4" />
          <path d="M6 46 H62 L110 10" stroke={ACCENT} strokeWidth="2.2" />
          <circle cx="75.5" cy="36" r="3.5" fill={GOLD} />
        </g>
      )}
      {slug === "futures" && (
        // contracts that end one after another, and the hop from the first to the second
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="8" y={10 + i * 12} width={30 + i * 24} height="7" fill={i === 1 ? ACCENT : INK} opacity={i === 1 ? 1 : i === 0 ? 0.5 : 0.25} />
              <rect x={37 + i * 24} y={8 + i * 12} width="2" height="11" fill={INK} />
            </g>
          ))}
          <path d="M46 13 C54 13 54 25 47 25 M50 22 L47 25 L50 28" stroke={GOLD} />
        </g>
      )}
    </svg>
  );
}
