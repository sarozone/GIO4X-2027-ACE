"use client";

import { useMemo, useState } from "react";
import { TAU, clamp, lerp, rgba, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, AMBER, Slider } from "@/components/labs/kit";
import { Bench, Choice, cap, num, revOf, signed } from "./shared";

/**
 * INVESTING EXPLAINERS, the four that are arithmetic on sliders: a company in
 * shares, a bond against the market rate, an index held by weight with a
 * yearly fee, and an option's payoff at expiry.
 *
 * Every figure is worked out from the visitor's own settings on an invented
 * example in plain numbers, and the formula is printed under it. There is no
 * real company, bond, index or option here, and nothing is a forecast.
 */

/* ---------------------------------------------------------------------------
 * 1. STOCKS — an invented company of 1,000 shares. The grid is the company;
 *    the rectangle beneath is one year's profit, divided across by who owns
 *    it and down by what is paid out and what is kept.
 * ------------------------------------------------------------------------- */

const SHARES = 1000;
const MAX_PROFIT = 200_000;

export function SharesMachine() {
  const [held, setHeld] = useState(50);
  const [profit, setProfit] = useState(60_000);
  const [payout, setPayout] = useState(40);

  const frac = held / SHARES;
  const perShare = profit / SHARES;
  const mine = profit * frac;
  const divPerShare = (perShare * payout) / 100;
  const myDiv = divPerShare * held;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const pad = 10;
        const cols = 50;
        const rows = SHARES / cols;
        const cell = Math.max(2, Math.min((w - pad * 2) / cols, (h * 0.56 - 20) / rows));
        const gx = (w - cell * cols) / 2;
        const gy = 20;
        const gap = cell >= 4 ? 1 : 0.5;
        cap(ctx, pal, "THE COMPANY: 1,000 EQUAL SHARES", gx, 9);
        for (let i = 0; i < SHARES; i++) {
          const col = Math.floor(i / rows);
          const row = rows - 1 - (i % rows);
          if (i < held) {
            const a = still ? 1 : 0.7 + 0.3 * Math.sin(t * 2.4 - col * 0.4);
            ctx.fillStyle = rgba(pal.accent, a * enter);
          } else ctx.fillStyle = rgba(pal.ink3, 0.2);
          ctx.fillRect(gx + col * cell, gy + row * cell, cell - gap, cell - gap);
        }

        // the year's profit as a rectangle: across, who owns it; down, paid out or kept
        const top = gy + rows * cell + 26;
        const ah = h - top - 10;
        if (ah < 24) return;
        const room = 62;
        const maxW = w - pad * 2 - room;
        cap(ctx, pal, "ONE YEAR’S PROFIT · YOUR PART IN COLOUR", pad, top - 11);
        if (profit <= 0) {
          ctx.strokeStyle = rgba(pal.ink3, 0.5);
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(pad + 0.5, top + 0.5, maxW * 0.25, ah);
          ctx.setLineDash([]);
          cap(ctx, pal, "NO PROFIT: NOTHING TO SHARE", pad + maxW * 0.25 + 8, top + ah / 2);
          return;
        }
        const bw = maxW * (0.25 + (0.75 * profit) / MAX_PROFIT) * lerp(0.6, 1, enter);
        const xm = held > 0 ? Math.max(pad + 1.5, pad + bw * frac) : pad;
        const ym = top + (ah * payout) / 100;
        ctx.fillStyle = rgba(pal.gold, 0.4);
        ctx.fillRect(xm, top, pad + bw - xm, ym - top);
        ctx.fillStyle = rgba(pal.ink3, 0.16);
        ctx.fillRect(xm, ym, pad + bw - xm, top + ah - ym);
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.fillRect(pad, top, xm - pad, ym - top);
        ctx.fillStyle = rgba(pal.accent, 0.4);
        ctx.fillRect(pad, ym, xm - pad, top + ah - ym);
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        ctx.lineWidth = 1;
        ctx.strokeRect(pad + 0.5, top + 0.5, bw, ah);
        if (ym - top >= 11) cap(ctx, pal, "PAID OUT", pad + bw + 8, (top + ym) / 2, { colour: pal.ink2 });
        if (top + ah - ym >= 11) cap(ctx, pal, "KEPT", pad + bw + 8, (ym + top + ah) / 2);
      },
    [held, profit, payout, frac],
  );

  const sentence =
    held === 0
      ? `With no shares you own none of the company: none of its profit of ${num(profit)} is yours and no dividend reaches you.`
      : profit === 0
        ? `You hold ${num(held)} of ${num(SHARES)} shares, which is ${num(frac * 100, 1)}% of the company. It made no profit this year, so there is nothing to share and no dividend.`
        : `You hold ${num(held)} of ${num(SHARES)} shares, which is ${num(frac * 100, 1)}% of the company. Of a profit of ${num(profit)}, ${num(mine)} belongs to your shares. The company pays out ${payout}% of it as a dividend of ${num(divPerShare, 2)} a share, so ${num(myDiv)} reaches you and ${num(mine - myDiv)} stays in the business.`;

  return (
    <Bench
      draw={draw}
      rev={revOf(held, profit, payout)}
      sentence={sentence}
      rows={[
        ["Your part of the company", `${num(frac * 100, 1)}%`],
        ["Profit per share", num(perShare, 2)],
        ["Dividend per share", num(divPerShare, 2)],
        ["Dividend to you", num(myDiv)],
      ]}
      formula={[
        `Your part = shares held ÷ shares in issue = ${num(held)} ÷ ${num(SHARES)} = ${num(frac * 100, 1)}%`,
        `Profit per share = profit ÷ shares in issue = ${num(profit)} ÷ ${num(SHARES)} = ${num(perShare, 2)}`,
        `Dividend per share = profit per share × share paid out = ${num(perShare, 2)} × ${payout}% = ${num(divPerShare, 2)}`,
        `Dividend to you = dividend per share × shares held = ${num(divPerShare, 2)} × ${num(held)} = ${num(myDiv)}`,
      ]}
      note="An invented company and plain numbers, not a currency. How much of a profit is paid out is decided by a company’s directors each time; nothing obliges them to pay a dividend at all. Taxes and dealing costs are left out."
    >
      <Slider label="Shares you hold" value={held} min={0} max={SHARES} step={5} onChange={setHeld} text={`${num(held)} of ${num(SHARES)}`} />
      <Slider label="The year’s profit (an example)" value={profit} min={0} max={MAX_PROFIT} step={5000} onChange={setProfit} text={num(profit)} />
      <Slider label="Share of the profit paid out" value={payout} min={0} max={100} step={5} onChange={setPayout} text={`${payout}%`} />
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 2. BONDS — an invented bond, face value 100, sold at 100 when the market
 *    rate equalled its coupon. The market rate then changes. Each bar is what
 *    1 paid in that year is worth today: the outline before the change, the
 *    fill after it. The gauge on the right is the resulting price.
 * ------------------------------------------------------------------------- */

const FACE = 100;
const MAX_YEARS = 30;

/** the price of a bond paying `coupon` a year for `years` years, at a market rate of `rate` (both as fractions) */
function bondPrice(years: number, coupon: number, rate: number) {
  let p = 0;
  for (let k = 1; k <= years; k++) p += (FACE * coupon + (k === years ? FACE : 0)) / (1 + rate) ** k;
  return p;
}

export function BondMachine() {
  const [years, setYears] = useState(10);
  const [couponPct, setCouponPct] = useState(4);
  const [delta, setDelta] = useState(1);

  const coupon = couponPct / 100;
  const rate = (couponPct + delta) / 100;
  const price = bondPrice(years, coupon, rate);
  const change = price - FACE; // it started at 100, so this is also the change in per cent
  const short = bondPrice(2, coupon, rate) - FACE;
  const long = bondPrice(MAX_YEARS, coupon, rate) - FACE;
  const flows = useMemo(
    () =>
      Array.from({ length: years }, (_, i) => {
        const k = i + 1;
        const pay = FACE * coupon + (k === years ? FACE : 0);
        const div = (1 + rate) ** k;
        return { k, pay, div, pv: pay / div };
      }),
    [years, coupon, rate],
  );

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const left = 10;
        const gw = 62;
        const base = h - 22;
        const top = 26;
        const H = base - top;
        const plotW = w - left - gw - 12;
        const sw = plotW / MAX_YEARS;
        const bw = Math.max(2, sw - 2);
        cap(ctx, pal, "TODAY’S WORTH OF 1 PAID IN EACH YEAR", left, 9);
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, base + 0.5);
        ctx.lineTo(left + plotW, base + 0.5);
        ctx.stroke();
        const lit = still ? years : 1 + (Math.floor(t * 2.2) % years);
        for (let k = 1; k <= MAX_YEARS; k++) {
          const x = left + (k - 1) * sw + (sw - bw) / 2;
          if (k > years) {
            ctx.fillStyle = rgba(pal.ink3, 0.25);
            ctx.fillRect(x, base - 2, bw, 2);
            continue;
          }
          const before = H / (1 + coupon) ** k;
          const now = (H / (1 + rate) ** k) * enter;
          ctx.fillStyle = rgba(k === years ? pal.gold : pal.accent, k === lit ? 1 : 0.55);
          ctx.fillRect(x, base - now, bw, now);
          ctx.strokeStyle = rgba(pal.ink2, 0.7);
          ctx.strokeRect(x + 0.5, base - before + 0.5, bw - 1, before - 1);
          if (k === lit) cap(ctx, pal, `YEAR ${k}: ÷ ${((1 + rate) ** k).toFixed(2)}`, clamp(x + bw / 2, left + 48, left + plotW - 48), top - 6, { align: "center", colour: pal.ink });
        }
        for (const k of [1, 10, 20, 30]) cap(ctx, pal, String(k), left + (k - 0.5) * sw, base + 11, { align: "center" });

        // the price, on its own scale
        const xg = w - gw + 14;
        const lo = 40;
        const hi = 170;
        const y = (v: number) => lerp(base, top, (clamp(v, lo, hi) - lo) / (hi - lo));
        cap(ctx, pal, "PRICE", xg - 4, 9);
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        ctx.beginPath();
        ctx.moveTo(xg + 0.5, top);
        ctx.lineTo(xg + 0.5, base);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.accent, 0.35);
        ctx.fillRect(xg - 3, Math.min(y(FACE), y(price)), 7, Math.abs(y(FACE) - y(price)));
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.fillRect(xg - 6, y(FACE) - 0.5, 13, 1);
        const near = Math.abs(y(price) - y(FACE)) < 12;
        if (!near) cap(ctx, pal, "100", xg + 11, y(FACE));
        const r = still ? 4.5 : 4.5 + Math.sin(t * 3) * 0.8;
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.beginPath();
        ctx.arc(xg + 0.5, y(price), r, 0, TAU);
        ctx.fill();
        cap(ctx, pal, price.toFixed(2), xg + 11, y(price), { colour: pal.ink });
      },
    [years, coupon, rate, price],
  );

  const way = change > 0.005 ? "a rise" : change < -0.005 ? "a fall" : "no change";
  const sentence =
    delta === 0
      ? `With the market rate still at ${num(couponPct, 2)}%, the same as the coupon, the bond’s payments are worth exactly ${num(FACE, 2)} today. Move the market rate to see the price change.`
      : `A ${years}-year bond paying ${num(couponPct, 2)}% was worth ${num(FACE, 2)} while the market rate was ${num(couponPct, 2)}%. At a market rate of ${num(couponPct + delta, 2)}% its payments are worth ${num(price, 2)} today: ${way} of ${num(Math.abs(change), 2)}%. The same change moves a 2-year bond by ${signed(short, 2)}% and a 30-year bond by ${signed(long, 2)}%.`;

  return (
    <Bench
      draw={draw}
      rev={revOf(years, couponPct, delta)}
      sentence={sentence}
      rows={[
        ["Market rate now", `${num(couponPct + delta, 2)}%`],
        ["Price now", num(price, 2)],
        ["Change in price", `${signed(change, 2)}%`],
        ["2 years / 30 years", `${signed(short, 1)}% / ${signed(long, 1)}%`],
      ]}
      formula={[
        "Price = the sum, over every year, of: payment ÷ (1 + market rate) to the power of the year",
        `Each year’s payment = ${num(FACE * coupon, 2)} (the coupon); the last year’s = ${num(FACE * coupon, 2)} + ${num(FACE)} (the face value)`,
        `Final payment today = ${num(FACE * coupon + FACE, 2)} ÷ ${(1 + rate).toFixed(4)}^${years} = ${num((FACE * coupon + FACE) / (1 + rate) ** years, 2)}`,
      ]}
      after={
        <details className="mt-21">
          <summary className="link min-h-[2.75rem] cursor-pointer py-8 text-sm">Every payment, worked out</summary>
          <div className="mt-8 overflow-x-auto">
            <table className="table-gx w-full min-w-[26rem] text-sm">
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col" className="num-right">
                    Payment
                  </th>
                  <th scope="col" className="num-right">
                    Divided by
                  </th>
                  <th scope="col" className="num-right">
                    Worth today
                  </th>
                </tr>
              </thead>
              <tbody>
                {flows.map((f) => (
                  <tr key={f.k}>
                    <td className="num">{f.k}</td>
                    <td className="num num-right">{num(f.pay, 2)}</td>
                    <td className="num num-right">{f.div.toFixed(4)}</td>
                    <td className="num num-right">{num(f.pv, 2)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" colSpan={3}>
                    Price: the sum
                  </th>
                  <td className="num num-right font-medium text-ink">{num(price, 2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      }
      note="An invented bond with a face value of 100, one payment a year, and no chance of the borrower failing to pay. Real bonds often pay twice a year and are quoted by slightly different conventions; the direction and the reason are the same. Not a real yield or price."
    >
      <Slider label="Years to maturity" value={years} min={1} max={MAX_YEARS} onChange={setYears} text={`${years} ${years === 1 ? "year" : "years"}`} />
      <Slider label="Coupon" value={couponPct} min={2} max={8} step={0.5} onChange={setCouponPct} text={`${num(couponPct, 2)}% a year`} />
      <Slider label="Change in the market rate" value={delta} min={-2} max={3} step={0.25} onChange={setDelta} text={`${signed(delta, 2)} percentage points`} />
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 3. INDEX INVESTING — an invented index of eight companies and a fund that
 *    holds them in the same weights; then one amount grown at a rate the
 *    visitor assumes, with no fee and with a yearly fee. The shaded gap is
 *    what the fee took. The growth rate is an assumption, never a forecast.
 * ------------------------------------------------------------------------- */

const WEIGHTS = [26, 19, 15, 12, 10, 8, 6, 4] as const;
const START = 10_000;

export function IndexMachine() {
  const [years, setYears] = useState(30);
  const [growth, setGrowth] = useState(5);
  const [fee, setFee] = useState(1);

  const g = growth / 100;
  const f = fee / 100;
  const free = START * (1 + g) ** years;
  const kept = START * ((1 + g) * (1 - f)) ** years;
  const gone = free - kept;
  const share = free > 0 ? (gone / free) * 100 : 0;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const left = 10;
        const right = w - 10;
        // the index and the fund: the same list in the same proportions
        const strip = (y: number, title: string, mine: boolean) => {
          cap(ctx, pal, title, left, y - 8);
          let x = left;
          WEIGHTS.forEach((wt, i) => {
            const full = ((right - left) * wt) / 100;
            const sw = mine ? full * enter : full;
            ctx.fillStyle = mine ? rgba(pal.accent, 1 - i * 0.09) : rgba(pal.ink3, 0.75 - i * 0.07);
            ctx.fillRect(x, y, Math.max(0, sw - 1), 12);
            if (full > 16) cap(ctx, pal, "ABCDEFGH"[i], x + full / 2, y + 6.5, { align: "center", colour: pal.surface });
            x += full;
          });
        };
        strip(20, "THE INDEX: EIGHT COMPANIES BY WEIGHT", false);
        strip(54, "THE FUND: THE SAME LIST, THE SAME WEIGHTS", true);

        const top = 86;
        const base = h - 18;
        if (base - top < 40) return;
        const room = 50;
        const x = (yr: number) => lerp(left, right - room, yr / years);
        const max = Math.max(free, START) * 1.06;
        const y = (v: number) => lerp(base, top, v / max);
        const a = (yr: number) => START * (1 + g) ** yr;
        const b = (yr: number) => START * ((1 + g) * (1 - f)) ** yr;
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, base + 0.5);
        ctx.lineTo(right - room, base + 0.5);
        ctx.stroke();
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(left, y(START));
        ctx.lineTo(right - room, y(START));
        ctx.stroke();
        ctx.setLineDash([]);
        const steps = 60;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) ctx.lineTo(x((years * i) / steps), y(a((years * i) / steps)));
        for (let i = steps; i >= 0; i--) ctx.lineTo(x((years * i) / steps), y(b((years * i) / steps)));
        ctx.closePath();
        ctx.fillStyle = rgba(AMBER, 0.22);
        ctx.fill();
        const line = (fn: (yr: number) => number, colour: string, width: number) => {
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) ctx.lineTo(x((years * i) / steps), y(fn((years * i) / steps)));
          ctx.strokeStyle = colour;
          ctx.lineWidth = width;
          ctx.lineJoin = "round";
          ctx.stroke();
        };
        line(a, rgba(pal.ink2, 1), 1.5);
        line(b, rgba(pal.accent, 1), 2);
        const u = still ? 1 : (t * 0.16) % 1;
        for (const [fn, colour] of [
          [a, pal.ink2],
          [b, pal.accent],
        ] as const) {
          ctx.fillStyle = rgba(colour, 1);
          ctx.beginPath();
          ctx.arc(x(years * u), y(fn(years * u)), 3.5, 0, TAU);
          ctx.fill();
        }
        let ya = y(free);
        let yb = y(kept);
        if (yb - ya < 12) {
          const mid = (ya + yb) / 2;
          ya = mid - 6;
          yb = mid + 6;
        }
        cap(ctx, pal, "NO FEE", right - room + 6, ya, { colour: pal.ink2 });
        cap(ctx, pal, "WITH FEE", right - room + 6, yb, { colour: pal.accent });
        cap(ctx, pal, "START", left, base + 10);
        cap(ctx, pal, `YEAR ${years}`, right - room, base + 10, { align: "right" });
      },
    [years, g, f, free, kept],
  );

  const sentence = `At the ${num(growth, 1)}% a year you have assumed, ${num(START)} held for ${years} ${years === 1 ? "year" : "years"} becomes ${num(free)} with no fee and ${num(kept)} with a fee of ${num(fee, 2)}% a year: ${num(gone)} less, which is ${num(share, 1)}% of the final sum. The growth rate is your assumption, not a forecast; a real market does not grow by the same amount each year, and can fall.`;

  return (
    <Bench
      draw={draw}
      rev={revOf(years, growth, fee)}
      sentence={sentence}
      rows={[
        ["End value, no fee", num(free)],
        ["End value, with the fee", num(kept)],
        ["Taken by the fee", num(gone)],
        ["As a share of the end value", `${num(share, 1)}%`],
      ]}
      formula={[
        `No fee: start × (1 + growth)^years = ${num(START)} × ${(1 + g).toFixed(3)}^${years} = ${num(free)}`,
        `With the fee: start × ((1 + growth) × (1 − fee))^years = ${num(START)} × (${(1 + g).toFixed(3)} × ${(1 - f).toFixed(4)})^${years} = ${num(kept)}`,
        `Difference = ${num(free)} − ${num(kept)} = ${num(gone)}`,
      ]}
      note="An invented index and plain numbers. The growth rate is whatever you set: an assumption for the arithmetic, the same every year, which no real market provides. It is not a forecast, an expected return or a promise. Inflation, taxes and dealing costs are left out."
    >
      <Slider label="Years held" value={years} min={1} max={50} onChange={setYears} text={`${years} ${years === 1 ? "year" : "years"}`} />
      <Slider label="Yearly growth (your assumption)" value={growth} min={0} max={10} step={0.5} onChange={setGrowth} text={`${num(growth, 1)}% a year, assumed`} />
      <Slider label="Yearly fee" value={fee} min={0} max={2.5} step={0.05} onChange={setFee} text={`${num(fee, 2)}% a year`} />
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 4. OPTIONS — the payoff of one option at expiry, per one unit of the
 *    underlying: the line with its bend at the strike, where it crosses zero,
 *    and which end of it has no limit.
 * ------------------------------------------------------------------------- */

type Kind = "call" | "put";
type Side = "bought" | "sold";
const S_MAX = 200;

export function OptionMachine() {
  const [kind, setKind] = useState<Kind>("call");
  const [side, setSide] = useState<Side>("bought");
  const [strike, setStrike] = useState(100);
  const [premium, setPremium] = useState(8);
  const [spot, setSpot] = useState(112);

  const sign = side === "bought" ? 1 : -1;
  const result = useMemo(() => (s: number) => sign * (Math.max(kind === "call" ? s - strike : strike - s, 0) - premium), [kind, sign, strike, premium]);
  const even = kind === "call" ? strike + premium : strike - premium;
  const now = result(spot);
  /** the most a put can be worth: the underlying at nothing */
  const putMost = strike - premium;
  const maxLoss = side === "bought" ? num(premium) : kind === "call" ? "No limit" : num(putMost);
  const maxGain = side === "sold" ? num(premium) : kind === "call" ? "No limit" : num(putMost);
  const open = kind === "call"; // a call's line runs on without limit as the price rises

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const left = 10;
        const right = w - 10;
        const top = 14;
        const base = h - 22;
        const R = 80;
        const zero = (top + base) / 2;
        const x = (s: number) => lerp(left, right, s / S_MAX);
        const y = (v: number) => lerp(zero, top, clamp(v, -R, R) / R);
        const pts: [number, number][] = [
          [x(0), y(result(0))],
          [x(strike), y(result(strike))],
          [x(S_MAX), y(result(S_MAX))],
        ];
        const fill = (above: boolean) => {
          ctx.save();
          ctx.beginPath();
          ctx.rect(left, above ? top : zero, right - left, zero - top);
          ctx.clip();
          ctx.beginPath();
          ctx.moveTo(left, zero);
          for (const [px, py] of pts) ctx.lineTo(px, py);
          ctx.lineTo(right, zero);
          ctx.closePath();
          ctx.fillStyle = rgba(above ? pal.emerald : ALERT, 0.16);
          ctx.fill();
          ctx.restore();
        };
        fill(true);
        fill(false);

        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        ctx.beginPath();
        ctx.moveTo(left, zero + 0.5);
        ctx.lineTo(right, zero + 0.5);
        ctx.stroke();
        for (const s of [0, 50, 100, 150, 200]) cap(ctx, pal, String(s), clamp(x(s), left + 6, right - 10), base + 11, { align: "center" });
        cap(ctx, pal, "GAIN", left, top + 4, { colour: pal.emerald });
        cap(ctx, pal, "LOSS", left, base - 4, { colour: ALERT });

        // the strike
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        ctx.beginPath();
        ctx.moveTo(x(strike) + 0.5, top);
        ctx.lineTo(x(strike) + 0.5, base);
        ctx.stroke();
        ctx.setLineDash([]);
        cap(ctx, pal, "STRIKE", x(strike), top + 4, { align: "center" });

        // the line
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 2.2;
        ctx.lineJoin = "round";
        ctx.stroke();

        // the end without a limit
        if (open) {
          const [ex, ey] = pts[2];
          const [kx, ky] = pts[1];
          const ang = Math.atan2(ey - ky, ex - kx);
          const push = still ? 0 : (Math.sin(t * 3) + 1) * 1.5;
          const ax = ex - 6 + Math.cos(ang) * push;
          const ay = ey + (ey < zero ? 6 : -6) + Math.sin(ang) * push;
          ctx.fillStyle = rgba(sign > 0 ? pal.emerald : ALERT, 1);
          ctx.beginPath();
          ctx.moveTo(ax + Math.cos(ang) * 7, ay + Math.sin(ang) * 7);
          ctx.lineTo(ax + Math.cos(ang + 2.5) * 6, ay + Math.sin(ang + 2.5) * 6);
          ctx.lineTo(ax + Math.cos(ang - 2.5) * 6, ay + Math.sin(ang - 2.5) * 6);
          ctx.closePath();
          ctx.fill();
          cap(ctx, pal, "NO LIMIT", right - 4, sign > 0 ? top + 4 : base - 4, { align: "right", colour: sign > 0 ? pal.emerald : ALERT });
        }

        // the break-even
        if (even >= 0 && even <= S_MAX) {
          ctx.fillStyle = rgba(pal.gold, 1);
          ctx.beginPath();
          ctx.arc(x(even), zero, 4, 0, TAU);
          ctx.fill();
          cap(ctx, pal, `BREAK-EVEN ${num(even)}`, clamp(x(even), left + 50, right - 50), zero + (now >= 0 ? 12 : -12), { align: "center", colour: pal.ink2 });
        }

        // the price at expiry the visitor chose
        const dx = x(spot);
        const dy = y(now);
        ctx.strokeStyle = rgba(pal.ink, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dx + 0.5, zero);
        ctx.lineTo(dx + 0.5, dy);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.beginPath();
        ctx.arc(dx, dy, 4, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.ink, 0.45);
        ctx.beginPath();
        ctx.arc(dx, dy, still ? 8 : 7 + Math.sin(t * 3) * 2, 0, TAU);
        ctx.stroke();
        cap(ctx, pal, signed(now), clamp(dx, left + 16, right - 16), clamp(dy + (now >= 0 ? -15 : 15), top + 6, base - 6), { align: "center", colour: pal.ink });
      },
    [result, strike, even, now, spot, sign, open],
  );

  const name = `A ${side} ${kind}`;
  const lossWords = side === "bought" ? `The most it can lose is the premium of ${num(premium)}` : kind === "call" ? "Its loss has no limit, because the price has no ceiling" : `The most it can lose is ${num(putMost)}, if the underlying falls to nothing`;
  const gainWords = side === "sold" ? `the most it can gain is the premium of ${num(premium)}` : kind === "call" ? "its gain has no limit" : `the most it can gain is ${num(putMost)}, if the underlying falls to nothing`;
  const sentence = `${name} with a strike of ${num(strike)} and a premium of ${num(premium)} breaks even at ${num(even)}. With the price at ${num(spot)} at expiry the result is ${signed(now)}. ${lossWords}; ${gainWords}.`;
  const worth = Math.max(kind === "call" ? spot - strike : strike - spot, 0);

  return (
    <Bench
      draw={draw}
      rev={revOf(kind, side, strike, premium, spot)}
      sentence={sentence}
      rows={[
        ["Break-even", num(even)],
        [`Result at ${num(spot)}`, signed(now)],
        ["Most it can lose", maxLoss],
        ["Most it can gain", maxGain],
      ]}
      formula={[
        kind === "call" ? `A call at expiry is worth: price − strike, or nothing if that is negative = ${num(worth)}` : `A put at expiry is worth: strike − price, or nothing if that is negative = ${num(worth)}`,
        side === "bought" ? `Buyer’s result = worth − premium = ${num(worth)} − ${num(premium)} = ${signed(now)}` : `Seller’s result = premium − worth = ${num(premium)} − ${num(worth)} = ${signed(now)}`,
        kind === "call" ? `Break-even = strike + premium = ${num(strike)} + ${num(premium)} = ${num(even)}` : `Break-even = strike − premium = ${num(strike)} − ${num(premium)} = ${num(even)}`,
      ]}
      note="Plain numbers for one unit of an invented underlying, at expiry only, before dealing costs and margin. A real contract covers a fixed quantity, so every figure is multiplied by it. Before expiry an option’s price also contains time value, which this diagram does not show."
    >
      <Choice
        label="The option"
        value={kind}
        onChange={setKind}
        options={[
          ["call", "Call"],
          ["put", "Put"],
        ]}
      />
      <Choice
        label="Your side"
        value={side}
        onChange={setSide}
        options={[
          ["bought", "Bought"],
          ["sold", "Sold"],
        ]}
      />
      <Slider label="Strike" value={strike} min={60} max={140} onChange={setStrike} text={num(strike)} />
      <Slider label="Premium" value={premium} min={1} max={25} onChange={setPremium} text={num(premium)} />
      <Slider label="Price at expiry" value={spot} min={0} max={S_MAX} onChange={setSpot} text={num(spot)} />
    </Bench>
  );
}
