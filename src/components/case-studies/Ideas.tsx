"use client";

import { useMemo, useState } from "react";
import { TAU, clamp, lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { Bench, Choice, cap, num, revOf, signed } from "@/components/investing/shared";
import { ALERT, Slider } from "@/components/labs/kit";
import { seeded } from "@/components/labs/workshop/rng";

/**
 * CASE-STUDY EXPLAINERS, the three that are a picture of an idea on sliders:
 * a margin under an estimate, the market before and after costs, and four
 * economic environments.
 *
 * Each shows an IDEA, never a performance. Every figure is invented or is
 * arithmetic on the visitor's own settings, with the formula printed beneath.
 * Nothing here is anyone's portfolio, a real price, a real fund or a forecast.
 */

/* ---------------------------------------------------------------------------
 * 1. A MARGIN OF SAFETY — an invented business estimated at 100 and an
 *    invented price from a fixed seed. The band between the estimate and the
 *    line is the margin; the days at or under the line are the only days on
 *    which the method does anything. A second slider supposes the estimate
 *    was too high, to show what the margin is for.
 * ------------------------------------------------------------------------- */

const DAYS = 240;
const ESTIMATE = 100;
const PRICES: readonly number[] = (() => {
  const r = seeded(224);
  const out: number[] = [];
  let p = 112;
  for (let i = 0; i < DAYS; i++) {
    p += (ESTIMATE - p) * 0.006 + (r() - 0.5) * 11;
    p = clamp(p, 45, 150);
    out.push(p);
  }
  return out;
})();

export function MarginMachine() {
  const [margin, setMargin] = useState(30);
  const [error, setError] = useState(20);

  const line = ESTIMATE * (1 - margin / 100);
  const worth = ESTIMATE * (1 - error / 100);
  const under = PRICES.filter((p) => p <= line).length;
  const first = PRICES.findIndex((p) => p <= line);
  const absorbed = margin >= error;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const padX = 10;
        const top = 18;
        const bot = 12;
        const lo = 40;
        const hi = 150;
        const yOf = (v: number) => top + ((hi - v) / (hi - lo)) * (h - top - bot);
        const xOf = (i: number) => padX + (i / (DAYS - 1)) * (w - padX * 2);

        // the margin: the band between the estimate and the line
        ctx.fillStyle = rgba(pal.accent, 0.1 * enter);
        ctx.fillRect(padX, yOf(ESTIMATE), w - padX * 2, yOf(line) - yOf(ESTIMATE));

        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        ctx.beginPath();
        ctx.moveTo(padX, yOf(ESTIMATE));
        ctx.lineTo(w - padX, yOf(ESTIMATE));
        ctx.stroke();
        ctx.setLineDash([]);
        cap(ctx, pal, "ESTIMATE 100", w - padX, yOf(ESTIMATE) - 8, { align: "right", colour: pal.gold });

        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padX, yOf(line));
        ctx.lineTo(w - padX, yOf(line));
        ctx.stroke();
        if (margin > 0) cap(ctx, pal, `THE LINE ${num(line)}`, padX, yOf(line) + 9, { colour: pal.accent });

        if (error > 0) {
          const c = absorbed ? pal.teal : ALERT;
          ctx.strokeStyle = rgba(c, 0.95);
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.moveTo(padX, yOf(worth));
          ctx.lineTo(w - padX, yOf(worth));
          ctx.stroke();
          ctx.setLineDash([]);
          cap(ctx, pal, `IF THE ESTIMATE WAS WRONG ${num(worth)}`, w / 2, yOf(worth) - 8, { align: "center", colour: c });
        }

        // the price, drawn up to a head that travels across and rests at the end
        const head = still ? DAYS - 1 : Math.floor(clamp((t % 10) / 7) * (DAYS - 1));
        ctx.strokeStyle = rgba(pal.ink2, 0.9);
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (let i = 0; i <= head; i++) {
          const x = xOf(i);
          const y = yOf(PRICES[i] ?? ESTIMATE);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // the days at or under the line
        ctx.fillStyle = rgba(pal.accent, 1);
        for (let i = 0; i <= head; i++) {
          const p = PRICES[i] ?? ESTIMATE;
          if (p <= line) {
            ctx.beginPath();
            ctx.arc(xOf(i), yOf(p), 2, 0, TAU);
            ctx.fill();
          }
        }
        if (first >= 0 && first <= head) {
          ctx.strokeStyle = rgba(pal.accent, 0.9);
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.arc(xOf(first), yOf(PRICES[first] ?? ESTIMATE), 6 + (still ? 0 : Math.sin(t * 3) * 1.2), 0, TAU);
          ctx.stroke();
        }
        if (!still && head < DAYS - 1) {
          ctx.fillStyle = rgba(pal.ink, 1);
          ctx.beginPath();
          ctx.arc(xOf(head), yOf(PRICES[head] ?? ESTIMATE), 2.5, 0, TAU);
          ctx.fill();
        }
        cap(ctx, pal, "AN INVENTED PRICE · 240 DAYS", padX, 8);
      },
    [margin, error, line, worth, first, absorbed],
  );

  const wait =
    under === 0
      ? `In this invented series the price never reaches the line: all ${DAYS} days are spent waiting.`
      : `In this invented series the price is at or under the line on ${under} of ${DAYS} days, the first of them day ${first + 1}; on the other ${DAYS - under} there is nothing to do but wait.`;
  const wrong =
    error === 0
      ? "If the estimate was exactly right, any price under the line was under the value."
      : absorbed
        ? `If the estimate was ${error}% too high, the business was really worth ${num(worth)}: the margin is at least as wide as the error, so a purchase at the line was still at or under the value.`
        : `If the estimate was ${error}% too high, the business was really worth ${num(worth)}: the margin is thinner than the error, so a purchase at the line was still above the value.`;

  return (
    <Bench
      draw={draw}
      rev={revOf(margin, error)}
      sentence={`${margin === 0 ? "With no margin, the line is the estimate itself, 100." : `With a margin of ${margin}% under an estimated value of 100, the line is at ${num(line)}.`} ${wait} ${wrong}`}
      rows={[
        ["Estimated value", "100"],
        ["The line", num(line)],
        ["Days at or under it", `${under} of ${DAYS}`],
        ["Value if the estimate was wrong", num(worth)],
      ]}
      formula={[
        `Line = estimate × (1 − margin) = 100 × (1 − ${num(margin / 100, 2)}) = ${num(line)}`,
        `Value if the estimate was too high = 100 × (1 − ${num(error / 100, 2)}) = ${num(worth)}`,
        `The error is covered when margin ≥ error: ${margin}% ${absorbed ? "≥" : "<"} ${error}%`,
      ]}
      note="An invented estimate and an invented price series from a fixed seed. It shows what a margin is and how much waiting it implies. It is not a valuation of anything, and a price under an estimate says nothing certain about what follows."
    >
      <Slider label="Margin under the estimate" value={margin} min={0} max={50} step={5} onChange={setMargin} text={`${margin}%`} />
      <Slider label="Suppose the estimate was too high by" value={error} min={0} max={50} step={5} onChange={setError} text={`${error}%`} />
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 2. BEFORE COSTS AND AFTER — sixty invented funds that together hold a whole
 *    invented market. Their returns before costs are made in pairs, one above
 *    the market and one the same distance below, so that they average the
 *    market exactly: that is the arithmetic, not a finding. Costs then move
 *    every fund down by the same amount. The gold line is an index fund.
 *    One year only, measured in points against the market: no return is
 *    assumed anywhere.
 * ------------------------------------------------------------------------- */

const FUNDS = 60;
const FUND: readonly { z: number; x: number }[] = (() => {
  const r = seeded(1976);
  const out: { z: number; x: number }[] = [];
  for (let i = 0; i < FUNDS / 2; i++) {
    const z = clamp(((r() + r() + r()) / 3 - 0.5) / 0.1667, -2.2, 2.2);
    out.push({ z, x: r() }, { z: -z, x: r() });
  }
  return out;
})();

export function CostMachine() {
  const [active, setActive] = useState(1.5);
  const [index, setIndex] = useState(0.1);
  const [spread, setSpread] = useState(3);

  const hurdle = active - index;
  const ahead = FUND.filter((f) => f.z * spread > hurdle).length;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const pad = 10;
        const top = 22;
        const bot = 10;
        const hi = 12;
        const lo = -15;
        const yOf = (v: number) => top + ((hi - v) / (hi - lo)) * (h - top - bot);
        const mid = w / 2;
        const gap = 14;
        const colW = mid - gap - pad;
        const leftX = (f: number) => pad + 6 + f * (colW - 12);
        const rightX = (f: number) => mid + gap + 6 + f * (colW - 12);

        cap(ctx, pal, "BEFORE COSTS", pad, 9);
        cap(ctx, pal, "AFTER COSTS", mid + gap, 9);

        // the market: the average of everyone, before costs
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, yOf(0));
        ctx.lineTo(w - pad, yOf(0));
        ctx.stroke();
        cap(ctx, pal, "THE MARKET", w - pad, yOf(0) - 8, { align: "right" });

        // the index fund, on the after side
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mid + gap, yOf(-index));
        ctx.lineTo(w - pad, yOf(-index));
        ctx.stroke();
        cap(ctx, pal, "INDEX FUND", w - pad, yOf(-index) + 9, { align: "right", colour: pal.gold });

        // the costs come off: every fund falls by the same amount
        const fall = still ? 1 : smooth(clamp(((t % 7) - 0.6) / 2.2));
        for (const f of FUND) {
          const before = f.z * spread;
          const after = before - active;
          ctx.fillStyle = rgba(pal.ink2, 0.55 * enter);
          ctx.beginPath();
          ctx.arc(leftX(f.x), yOf(before), 2.5, 0, TAU);
          ctx.fill();
          const isAhead = before > hurdle;
          ctx.fillStyle = isAhead ? rgba(pal.accent, enter) : rgba(pal.ink3, 0.75 * enter);
          ctx.beginPath();
          ctx.arc(rightX(f.x), yOf(lerp(before, after, fall)), isAhead ? 3 : 2.5, 0, TAU);
          ctx.fill();
        }

        // the two averages
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad, yOf(0));
        ctx.lineTo(pad + 18, yOf(0));
        ctx.moveTo(mid + gap, yOf(-active * fall));
        ctx.lineTo(mid + gap + 18, yOf(-active * fall));
        ctx.stroke();
        if (active >= 0.8) cap(ctx, pal, "AVERAGE", mid + gap + 24, yOf(-active * fall), { colour: pal.ink2 });
      },
    [active, index, spread, hurdle],
  );

  return (
    <Bench
      draw={draw}
      rev={revOf(active, index, spread)}
      sentence={`Before costs the ${FUNDS} invented funds average the market exactly, because between them they hold all of it. After a yearly cost of ${num(active, 1)}% they average ${num(active, 1)} points behind it. The index fund, at a cost of ${num(index, 2)}%, is ${num(index, 2)} points behind. In this one year ${ahead} of the ${FUNDS} funds finish ahead of the index fund and ${FUNDS - ahead} behind: to be ahead, a fund has to beat the market before costs by more than ${num(Math.max(hurdle, 0), 2)} points.`}
      rows={[
        ["Average before costs", "0.0 points"],
        ["Average after costs", `${signed(-active, 1)} points`],
        ["The index fund", `${signed(-index, 2)} points`],
        ["Funds ahead of it", `${ahead} of ${FUNDS}`],
      ]}
      formula={[
        "All holders together, before costs = the market (they hold all of it)",
        `Average after costs = market − cost = 0 − ${num(active, 1)} = ${signed(-active, 1)} points`,
        `Ahead of the index fund when: return before costs > ${num(active, 1)} − ${num(index, 2)} = ${num(hurdle, 2)} points`,
      ]}
      note="Sixty invented funds over one invented year, placed evenly above and below the market by a fixed seed. Real funds are not spread like this, and being ahead in one year says nothing about the next. This shows the arithmetic of costs. It describes no real fund and recommends none."
    >
      <Slider label="Yearly cost of the funds" value={active} min={0} max={3} step={0.1} onChange={setActive} text={`${num(active, 1)}%`} />
      <Slider label="Yearly cost of the index fund" value={index} min={0} max={1} step={0.05} onChange={setIndex} text={`${num(index, 2)}%`} />
      <Slider label="How far apart the funds are before costs" value={spread} min={1} max={5} step={0.5} onChange={setSpread} text={`about ±${num(spread, 1)} points`} />
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 3. FOUR ENVIRONMENTS — growth higher or lower than expected, inflation
 *    higher or lower than expected, and four invented holdings that each lean
 *    one way for growth and one way for inflation, as the published framework
 *    describes. A lean is +1 or −1 for each surprise: a direction on an
 *    invented scale, not a return. In equal parts the four cancel in every
 *    environment; the slider puts more of the portfolio into shares.
 * ------------------------------------------------------------------------- */

type Dir = "up" | "down";
const HOLDINGS = [
  { key: "S", name: "shares", g: 1, i: -1 },
  { key: "N", name: "ordinary bonds", g: -1, i: -1 },
  { key: "I", name: "inflation-linked bonds", g: -1, i: 1 },
  { key: "C", name: "commodities", g: 1, i: 1 },
] as const;
const ENVS: readonly { g: Dir; i: Dir }[] = [
  { g: "up", i: "down" },
  { g: "up", i: "up" },
  { g: "down", i: "down" },
  { g: "down", i: "up" },
];
const sign = (d: Dir) => (d === "up" ? 1 : -1);
const leanOf = (h: (typeof HOLDINGS)[number], g: Dir, i: Dir) => h.g * sign(g) + h.i * sign(i);
const envName = (g: Dir, i: Dir) => `growth ${g === "up" ? "higher" : "lower"} than expected and inflation ${i === "up" ? "higher" : "lower"}`;

export function QuadrantMachine() {
  const [g, setG] = useState<Dir>("down");
  const [i, setI] = useState<Dir>("up");
  const [shares, setShares] = useState(70);

  const rest = (100 - shares) / 3;
  const weight = (k: string) => (k === "S" ? shares : rest) / 100;
  const portfolio = (eg: Dir, ei: Dir) => HOLDINGS.reduce((sum, h) => sum + weight(h.key) * leanOf(h, eg, ei), 0);
  const here = portfolio(g, i);
  const all = ENVS.map((e) => portfolio(e.g, e.i));
  const worst = Math.min(...all);
  const best = Math.max(...all);
  const up = HOLDINGS.filter((h) => leanOf(h, g, i) > 0).map((h) => h.name);
  const down = HOLDINGS.filter((h) => leanOf(h, g, i) < 0).map((h) => h.name);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const pad = 6;
        const cw = (w - pad * 3) / 2;
        const ch = (h - pad * 3) / 2;
        const colours = [pal.accent, pal.teal, pal.gold, pal.emerald];
        ENVS.forEach((e, n) => {
          const x = pad + (n % 2) * (cw + pad);
          const y = pad + Math.floor(n / 2) * (ch + pad);
          const chosen = e.g === g && e.i === i;
          if (chosen) {
            ctx.fillStyle = rgba(pal.accent, still ? 0.09 : 0.07 + 0.03 * Math.sin(t * 2.2));
            ctx.fillRect(x, y, cw, ch);
          }
          ctx.strokeStyle = chosen ? rgba(pal.accent, 1) : rgba(pal.ink3, 0.45);
          ctx.lineWidth = chosen ? 2 : 1;
          ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
          cap(ctx, pal, `GROWTH ${e.g === "up" ? "↑" : "↓"}  INFLATION ${e.i === "up" ? "↑" : "↓"}`, x + 7, y + 11, { colour: chosen ? pal.ink : pal.ink3 });

          const midY = y + 20 + (ch - 34) / 2;
          const unit = ((ch - 34) / 2 / 2) * enter;
          const slot = (cw - 14) / 6;
          const bw = Math.max(5, Math.min(18, slot * 0.6));
          ctx.strokeStyle = rgba(pal.ink3, 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 6, midY + 0.5);
          ctx.lineTo(x + cw - 6, midY + 0.5);
          ctx.stroke();

          let total = 0;
          HOLDINGS.forEach((hd, k) => {
            const lean = leanOf(hd, e.g, e.i);
            total += ((hd.key === "S" ? shares : rest) / 100) * lean;
            const cx = x + 7 + slot * (k + 0.5);
            const colour = colours[k] ?? pal.ink2;
            if (lean === 0) {
              ctx.fillStyle = rgba(colour, 0.7);
              ctx.fillRect(cx - bw / 2, midY - 1, bw, 3);
            } else {
              ctx.fillStyle = rgba(colour, chosen ? 1 : 0.6);
              const bh = unit * Math.abs(lean);
              ctx.fillRect(cx - bw / 2, lean > 0 ? midY - bh : midY + 1, bw, bh);
            }
            cap(ctx, pal, hd.key, cx, y + ch - 8, { align: "center", colour: chosen ? pal.ink2 : pal.ink3 });
          });

          // the whole portfolio in this environment
          const px = x + 7 + slot * 5.1;
          const pw = Math.max(8, bw * 1.5);
          if (Math.abs(total) < 0.005) {
            ctx.fillStyle = rgba(pal.ink, 0.9);
            ctx.fillRect(px - pw / 2, midY - 1, pw, 3);
          } else {
            ctx.fillStyle = total > 0 ? rgba(pal.ink, chosen ? 0.95 : 0.6) : rgba(ALERT, chosen ? 1 : 0.65);
            const bh = unit * Math.abs(total);
            ctx.fillRect(px - pw / 2, total > 0 ? midY - bh : midY + 1, pw, bh);
          }
          cap(ctx, pal, "ALL", px, y + ch - 8, { align: "center", colour: chosen ? pal.ink : pal.ink3 });
        });
      },
    [g, i, shares, rest],
  );

  const list = (xs: readonly string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : (xs[0] ?? "nothing"));

  return (
    <Bench
      draw={draw}
      ratio={1.4}
      rev={revOf(g, i, shares)}
      sentence={`With ${envName(g, i)}, the sketch has ${list(up)} leaning up, ${list(down)} leaning down and the other two pulled both ways. With ${shares}% of the portfolio in shares and ${num(rest, 1)}% in each of the other three, the whole leans ${signed(here, 2)} in this environment, and across the four environments it ranges from ${signed(worst, 2)} to ${signed(best, 2)}. ${shares === 25 ? "In equal parts the four leans cancel in every environment." : "The more of it is one holding, the more the whole depends on that holding’s environment."}`}
      rows={[
        ["Growth ↑ inflation ↓", signed(all[0] ?? 0, 2)],
        ["Growth ↑ inflation ↑", signed(all[1] ?? 0, 2)],
        ["Growth ↓ inflation ↓", signed(all[2] ?? 0, 2)],
        ["Growth ↓ inflation ↑", signed(all[3] ?? 0, 2)],
      ]}
      formula={[
        "Lean of a holding = its growth sign × the growth surprise + its inflation sign × the inflation surprise (each +1 or −1)",
        "S shares: growth +, inflation −.  N ordinary bonds: −, −.  I inflation-linked bonds: −, +.  C commodities: +, +.",
        `Portfolio lean = Σ weight × lean. Here: (${num(shares / 100, 2)} − ${num(rest / 100, 3)}) × the lean of shares = ${signed(here, 2)}`,
      ]}
      note="A lean is a direction on an invented scale of −2 to +2. It is not a return and not a size, and the tendencies it stands for are drawn from past data, not from a rule. The published approach balances holdings by risk and uses borrowing to do it, which this sketch does not attempt. Bars: S, N, I and C are the four holdings; ALL is the portfolio."
    >
      <Choice
        label="Growth, against what was expected"
        value={g}
        options={[
          ["up", "Higher"],
          ["down", "Lower"],
        ]}
        onChange={setG}
      />
      <Choice
        label="Inflation, against what was expected"
        value={i}
        options={[
          ["up", "Higher"],
          ["down", "Lower"],
        ]}
        onChange={setI}
      />
      <Slider label="Share of the portfolio in shares" value={shares} min={25} max={100} step={5} onChange={setShares} text={`${shares}%`} />
    </Bench>
  );
}
