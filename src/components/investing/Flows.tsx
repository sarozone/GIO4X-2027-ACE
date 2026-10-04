"use client";

import { useMemo, useState } from "react";
import { TAU, clamp, lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, Slider } from "@/components/labs/kit";
import { seeded } from "@/components/labs/workshop/rng";
import { Bench, cap, num, revOf, signed } from "./shared";

/**
 * INVESTING EXPLAINERS, the three that are a flow in time: an ETF's units
 * being created and redeemed, a mutual fund's dealing day, and a calendar of
 * futures contracts with the roll from one to the next.
 *
 * Each is an invented example in plain numbers. The motion shows an order of
 * events; under reduced motion one still frame shows the finished state, and
 * the sentence beneath says the same thing in words either way.
 */

/* ---------------------------------------------------------------------------
 * 1. ETFS — the holdings on the left, the fund in the middle, the exchange on
 *    the right. When units trade above the basket's value a dealer carries
 *    holdings into the fund and new units out to the exchange; below it, the
 *    other way. Each block let through narrows the gap by an invented step.
 * ------------------------------------------------------------------------- */

const BASKET = 100;
const BLOCK = 50_000;
const BLOCKS_AT_START = 20;
const STEP = 0.4;
const HOLDINGS = [30, 25, 20, 15, 10] as const;

export function EtfMachine() {
  const [gap, setGap] = useState(1.2);
  const [blocks, setBlocks] = useState(BLOCKS_AT_START);
  const dir = Math.abs(gap) < 0.05 ? 0 : gap > 0 ? 1 : -1;
  const stuck = (dir > 0 && blocks >= 30) || (dir < 0 && blocks <= 10);

  const through = () => {
    if (!dir || stuck) return;
    setBlocks((b) => b + dir);
    setGap((v) => Math.round((Math.abs(v) <= STEP ? 0 : v - dir * STEP) * 10) / 10);
  };

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const cy = h * 0.5;
        const bh = h * 0.56;
        const y0 = cy - bh / 2;
        const bw = Math.min(54, w * 0.15);
        const fw = Math.min(120, w * 0.27);
        const x1 = 12 + bw / 2;
        const x2 = w * 0.47;
        const x3 = w - 58;

        // the holdings: a basket of five, by weight
        cap(ctx, pal, "HOLDINGS", x1, y0 - 11, { align: "center" });
        let yy = y0;
        HOLDINGS.forEach((wt, i) => {
          const hh = (bh * wt) / 100;
          ctx.fillStyle = rgba(pal.teal, 0.9 - i * 0.14);
          ctx.fillRect(x1 - bw / 2, yy, bw, Math.max(1, hh * enter - 1.5));
          if (hh > 13) cap(ctx, pal, "ABCDE"[i], x1, yy + hh / 2, { align: "center", colour: pal.surface });
          yy += hh;
        });

        // the fund: its units, in blocks
        cap(ctx, pal, `FUND · ${blocks} BLOCKS`, x2, y0 - 11, { align: "center" });
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(x2 - fw / 2) + 0.5, Math.round(y0) + 0.5, fw, bh);
        const per = 5;
        const cell = Math.min((fw - 12) / per, (bh - 12) / 6);
        const ox = x2 - (cell * per) / 2;
        for (let i = 0; i < blocks; i++) {
          const cx = ox + (i % per) * cell;
          const cyy = y0 + bh - 6 - (Math.floor(i / per) + 1) * cell;
          const last = i === blocks - 1 && blocks !== BLOCKS_AT_START;
          ctx.fillStyle = rgba(pal.accent, last && !still ? 0.6 + 0.4 * Math.sin(t * 4) : 0.85);
          ctx.fillRect(cx + 1, cyy + 1, cell - 2, cell - 2);
        }

        // the exchange: the unit's price against the basket's value
        cap(ctx, pal, "EXCHANGE", x3, y0 - 11, { align: "center" });
        const py = (v: number) => lerp(y0 + bh, y0, (clamp(v, -3, 3) + 3) / 6);
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        ctx.beginPath();
        ctx.moveTo(x3 + 0.5, y0);
        ctx.lineTo(x3 + 0.5, y0 + bh);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.ink2, 1);
        ctx.fillRect(x3 - 9, py(0) - 0.5, 18, 1);
        const uy = py(gap);
        ctx.fillStyle = rgba(pal.accent, 0.3);
        ctx.fillRect(x3 - 3, Math.min(uy, py(0)), 6, Math.abs(uy - py(0)));
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.beginPath();
        ctx.arc(x3, uy, 5, 0, TAU);
        ctx.fill();
        const close = Math.abs(uy - py(0)) < 12;
        cap(ctx, pal, "BASKET", x3 + 12, close ? py(0) + (gap > 0 ? 7 : -7) : py(0));
        cap(ctx, pal, "UNIT", x3 + 12, close ? py(0) + (gap > 0 ? -7 : 7) : uy, { colour: pal.accent });

        // the two lanes the dealer carries things along
        const lane = (a: number, b: number, round: boolean, colour: typeof pal.accent, words: string) => {
          ctx.strokeStyle = rgba(pal.ink3, 0.45);
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(a, cy + 0.5);
          ctx.lineTo(b, cy + 0.5);
          ctx.stroke();
          ctx.setLineDash([]);
          cap(ctx, pal, words, (a + b) / 2, y0 + bh + 13, { align: "center", colour: dir ? pal.ink2 : pal.ink3 });
          if (!dir) return;
          const speed = 0.1 + Math.abs(gap) * 0.16;
          for (let i = 0; i < 3; i++) {
            let u = (i / 3 + t * speed) % 1;
            if (dir < 0) u = 1 - u;
            const x = lerp(a, b, u);
            ctx.fillStyle = rgba(colour, 0.35 + 0.65 * Math.sin(Math.PI * u));
            ctx.beginPath();
            if (round) ctx.arc(x, cy, 4, 0, TAU);
            else ctx.rect(x - 3.5, cy - 3.5, 7, 7);
            ctx.fill();
          }
          // an arrowhead at the end the things arrive at
          const tip = dir > 0 ? b - 1 : a + 1;
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.beginPath();
          ctx.moveTo(tip, cy);
          ctx.lineTo(tip - dir * 7, cy - 4);
          ctx.lineTo(tip - dir * 7, cy + 4);
          ctx.closePath();
          ctx.fill();
        };
        lane(x1 + bw / 2 + 5, x2 - fw / 2 - 4, false, pal.teal, dir > 0 ? "HOLDINGS IN" : dir < 0 ? "HOLDINGS OUT" : "NO GAP");
        lane(x2 + fw / 2 + 5, x3 - 14, true, pal.accent, dir > 0 ? "NEW UNITS OUT" : dir < 0 ? "UNITS BACK" : "NO FLOW");
      },
    [gap, blocks, dir],
  );

  const units = `${num(blocks * BLOCK)} units are in issue.`;
  const sentence =
    dir === 0
      ? `Units trade at ${num(BASKET + gap, 2)}, the value of the basket behind each one. A dealer has nothing to gain, so no units are created or redeemed. ${units}`
      : dir > 0
        ? `Units trade at ${num(BASKET + gap, 2)}, which is ${num(gap, 2)} above the ${num(BASKET, 2)} of holdings behind each one. A dealer can buy the holdings, hand them to the fund for new units and sell those units on the exchange: more units are on offer, and the price is pushed down towards the basket’s value. ${units}`
        : `Units trade at ${num(BASKET + gap, 2)}, which is ${num(-gap, 2)} below the ${num(BASKET, 2)} of holdings behind each one. A dealer can buy units on the exchange, hand them back to the fund for the holdings and sell those: units are cancelled, and the price is pushed up towards the basket’s value. ${units}`;

  return (
    <Bench
      draw={draw}
      rev={revOf(gap, blocks)}
      sentence={sentence}
      rows={[
        ["Basket’s value per unit", num(BASKET, 2)],
        ["Unit’s price on the exchange", num(BASKET + gap, 2)],
        ["Gap", `${signed(gap, 2)} (${signed((gap / BASKET) * 100, 2)}%)`],
        ["Units in issue", num(blocks * BLOCK)],
      ]}
      formula={[
        `Gap = unit’s price − basket’s value per unit = ${num(BASKET + gap, 2)} − ${num(BASKET, 2)} = ${signed(gap, 2)}`,
        `What a dealer could keep on one block, before its own costs = gap × units in a block = ${num(Math.abs(gap), 2)} × ${num(BLOCK)} = ${num(Math.abs(gap) * BLOCK)}`,
        `Units in issue = blocks × units in a block = ${blocks} × ${num(BLOCK)} = ${num(blocks * BLOCK)}`,
      ]}
      note={`An invented fund in plain numbers. The step of ${num(STEP, 2)} by which each block narrows the gap is made up to show the direction. In a real market the gap closes only as far as a dealer’s own costs make worthwhile, and when the holdings are hard to trade it can stay open.`}
    >
      <Slider label="Unit’s price against the basket’s value" value={gap} min={-2} max={2} step={0.1} onChange={setGap} text={gap === 0 ? "the same" : `${num(Math.abs(gap), 2)} ${gap > 0 ? "above" : "below"}`} />
      <div className="mt-21 flex flex-wrap gap-8">
        <button type="button" className="btn btn-primary" disabled={!dir || stuck} onClick={through}>
          {dir < 0 ? "Redeem one block" : "Create one block"}
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            setGap(1.2);
            setBlocks(BLOCKS_AT_START);
          }}
        >
          Start again
        </button>
      </div>
      <p className="mt-13 text-sm text-ink-3">{stuck ? "This example stops at ten and thirty blocks. Start again to go on." : "Only large approved dealers can do this. Everyone else buys and sells existing units on the exchange."}</p>
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 2. MUTUAL FUNDS — one dealing day. The grey line is what the holdings are
 *    worth as the day goes on, which nobody deals at. Orders arrive and wait.
 *    At the valuation point one price is struck and every order deals at it.
 * ------------------------------------------------------------------------- */

const POOL = 1_000_000;
const UNITS = 10_000;
const OPEN_H = 8;
const CLOSE_H = 16;
const END_H = 18;
const OTHERS = [9.4, 10.3, 12.5, 13.2, 14.7, 15.5] as const;
const hhmm = (v: number) => `${String(Math.floor(v)).padStart(2, "0")}:${v % 1 ? "30" : "00"}`;

export function FundDayMachine() {
  const [amount, setAmount] = useState(10_000);
  const [hour, setHour] = useState(11);
  const [change, setChange] = useState(2);

  const assets = POOL * (1 + change / 100);
  const nav = assets / UNITS;
  const bought = amount / nav;

  /** the holdings' value through the day, in per cent from yesterday: invented wobble, pinned to end at `change` */
  const path = useMemo(() => {
    const r = seeded(4177);
    const n = 64;
    const walk = [0];
    for (let i = 1; i <= n; i++) walk.push(walk[i - 1] + (r() - 0.5));
    return walk.map((v, i) => (v - (i / n) * walk[n]) * 0.55 + (change * i) / n);
  }, [change]);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const left = 10;
        const right = w - 10;
        const top = 24;
        const mid = h * 0.6;
        const laneY = h * 0.8;
        const base = h - 16;
        const x = (hr: number) => lerp(left, right, (hr - OPEN_H) / (END_H - OPEN_H));
        const y = (pct: number) => lerp(mid, top, (clamp(pct, -7, 7) + 7) / 14);
        const cycle = 10;
        const p = still ? 1 : (t % cycle) / cycle;
        const day = clamp(p / 0.6);
        const settle = smooth((p - 0.62) / 0.16);
        const nowH = lerp(OPEN_H, CLOSE_H, day);

        cap(ctx, pal, "THE HOLDINGS’ VALUE THROUGH THE DAY", left, 9);
        // yesterday's price
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(left, y(0) + 0.5);
        ctx.lineTo(right, y(0) + 0.5);
        ctx.stroke();
        // the valuation point
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.beginPath();
        ctx.moveTo(x(CLOSE_H) + 0.5, top);
        ctx.lineTo(x(CLOSE_H) + 0.5, base - 10);
        ctx.stroke();
        ctx.setLineDash([]);
        cap(ctx, pal, "PRICED HERE", x(CLOSE_H) - 5, mid + 10, { align: "right", colour: pal.gold });
        for (const hr of [8, 12, 16]) cap(ctx, pal, `${String(hr).padStart(2, "0")}:00`, clamp(x(hr), left + 14, right - 14), base + 6, { align: "center" });

        // the value so far: seen, but not dealt at
        ctx.beginPath();
        const n = path.length - 1;
        for (let i = 0; i <= n; i++) {
          const hr = lerp(OPEN_H, CLOSE_H, i / n);
          if (hr > nowH) break;
          ctx.lineTo(x(hr), y(path[i]));
        }
        ctx.strokeStyle = rgba(pal.ink3, 1);
        ctx.lineWidth = 1.4;
        ctx.lineJoin = "round";
        ctx.stroke();
        if (day < 1) {
          ctx.strokeStyle = rgba(pal.ink, 0.35);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x(nowH) + 0.5, top);
          ctx.lineTo(x(nowH) + 0.5, base - 10);
          ctx.stroke();
        }

        // the one price
        if (day >= 1) {
          ctx.strokeStyle = rgba(pal.accent, 1);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x(CLOSE_H), y(change));
          ctx.lineTo(lerp(x(CLOSE_H), right, still ? 1 : clamp((p - 0.6) / 0.1)), y(change));
          ctx.stroke();
          cap(ctx, pal, `ONE PRICE ${nav.toFixed(2)}`, right, y(change) + (change >= 0 ? -10 : 10), { align: "right", colour: pal.ink });
        }

        // the orders: they wait in the lane, then all deal at the one price
        cap(ctx, pal, settle > 0.5 ? "EVERY ORDER DEALT AT IT" : "ORDERS WAITING", left, laneY - 14);
        const all = [...OTHERS.map((hr) => ({ hr, mine: false })), { hr: hour, mine: true }].sort((a, b) => a.hr - b.hr);
        const slot = Math.min(13, (right - x(CLOSE_H) - 8) / all.length);
        all.forEach((o, i) => {
          if (o.hr > nowH) return;
          const s = o.mine ? 9 : 6;
          const ox = lerp(x(o.hr), x(CLOSE_H) + 8 + i * slot, settle);
          const oy = lerp(laneY, y(change), settle);
          ctx.fillStyle = rgba(o.mine ? pal.accent : pal.ink3, 1);
          ctx.fillRect(ox - s / 2, oy - s / 2, s, s);
          if (o.mine && settle < 0.5) cap(ctx, pal, "YOURS", clamp(ox, left + 18, right - 18), laneY + 13, { align: "center", colour: pal.accent });
        });
      },
    [path, change, hour, nav],
  );

  const moved = change > 0 ? `have risen ${num(change, 2)}%` : change < 0 ? `have fallen ${num(-change, 2)}%` : "are unchanged";
  const sentence = `An order for ${num(amount)} placed at ${hhmm(hour)} does not deal at once: it waits until ${hhmm(CLOSE_H)}. By then the holdings ${moved}, so the fund is worth ${num(assets)} across ${num(UNITS)} units and the price struck is ${num(nav, 2)}. The order buys ${num(bought, 2)} units. Every other order that day, whatever hour it was placed, deals at the same ${num(nav, 2)}.`;

  return (
    <Bench
      draw={draw}
      rev={revOf(amount, hour, change)}
      sentence={sentence}
      rows={[
        ["Yesterday’s price", num(POOL / UNITS, 2)],
        ["Fund’s value at the close", num(assets)],
        ["Price struck", num(nav, 2)],
        ["Units your order buys", num(bought, 2)],
      ]}
      formula={[
        `Price = fund’s value ÷ units in issue = ${num(assets)} ÷ ${num(UNITS)} = ${num(nav, 2)}`,
        `Units bought = amount ÷ price = ${num(amount)} ÷ ${num(nav, 2)} = ${num(bought, 2)}`,
        `Afterwards = (${num(assets)} + ${num(amount)}) ÷ (${num(UNITS)} + ${num(bought, 2)}) = ${num((assets + amount) / (UNITS + bought), 2)}: new money enlarges the pool without changing the price`,
      ]}
      note={`An invented fund and an invented day, in plain numbers, with no charges taken. The closing time of ${hhmm(CLOSE_H)} is an example: each fund sets its own valuation point and its own cut-off for orders, and an order after the cut-off deals at the next day’s price.`}
    >
      <Slider label="Your order" value={amount} min={1000} max={50_000} step={1000} onChange={setAmount} text={num(amount)} />
      <Slider label="Hour you place it" value={hour} min={8.5} max={15.5} step={0.5} onChange={setHour} text={hhmm(hour)} />
      <Slider label="The holdings’ change over the day (an example)" value={change} min={-5} max={5} step={0.25} onChange={setChange} text={`${signed(change, 2)}%`} />
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 3. FUTURES — six monthly contracts. Each bar ends at its expiry. Today moves
 *    towards the first expiry; the position is rolled into the second; and if
 *    the spot price stays put, the second contract's price closes the gap to
 *    it by its own expiry. That closing is the cost or gain of the roll.
 * ------------------------------------------------------------------------- */

const NEAR = 100;
const SIZE = 10;
const MONTHS = 6;

export function FuturesMachine() {
  const [gap, setGap] = useState(3);
  const [held, setHeld] = useState(2);
  const next = NEAR + gap;
  const result = -gap * SIZE * held;
  const shape = gap > 0 ? "contango" : gap < 0 ? "backwardation" : "flat";

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const left = 10;
        const right = w - 10;
        const x = (m: number) => lerp(left, right - 4, m / MONTHS);
        const cycle = 9;
        const p = still ? 0.62 : (t % cycle) / cycle;
        // before the roll, the roll, after it
        const today = p < 0.5 ? lerp(0.3, 0.92, p / 0.5) : p < 0.64 ? 0.92 : lerp(0.92, 1.9, (p - 0.64) / 0.36);
        const rolled = still ? 1 : smooth((p - 0.5) / 0.12);
        const after = still ? 1 : clamp((p - 0.64) / 0.36);

        // the calendar
        const top = 22;
        const calH = h * 0.4;
        const rh = Math.min(13, (calH - 4) / MONTHS);
        cap(ctx, pal, "SIX CONTRACTS · EACH BAR ENDS AT ITS EXPIRY", left, 9);
        for (let i = 1; i <= MONTHS; i++) {
          const yy = top + (i - 1) * rh;
          const live = i === 1 ? 1 - rolled : i === 2 ? rolled : 0;
          const gone = i === 1 && today > 1;
          ctx.fillStyle = rgba(pal.ink3, gone ? 0.12 : 0.28);
          ctx.fillRect(left, yy, (x(i) - left) * enter, rh - 3);
          if (live > 0) {
            ctx.fillStyle = rgba(pal.accent, live);
            ctx.fillRect(left, yy, (x(i) - left) * enter, rh - 3);
          }
          ctx.fillStyle = rgba(i <= 2 ? pal.ink : pal.ink3, 1);
          ctx.fillRect(x(i) - 1, yy - 1, 2, rh - 1);
        }
        const calBase = top + MONTHS * rh;
        // today
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x(today), top - 4);
        ctx.lineTo(x(today), calBase + 2);
        ctx.stroke();
        cap(ctx, pal, "TODAY", clamp(x(today), left + 18, right - 18), calBase + 10, { align: "center", colour: pal.gold });
        if (rolled > 0 && (still || after < 0.35)) {
          const ax = x(0.92) + 9;
          const ay0 = top + rh * 0.4;
          const ay1 = lerp(ay0, top + rh * 1.4, rolled);
          ctx.strokeStyle = rgba(pal.ink, 1);
          ctx.beginPath();
          ctx.moveTo(ax, ay0);
          ctx.lineTo(ax, ay1);
          ctx.stroke();
          ctx.fillStyle = rgba(pal.ink, 1);
          ctx.beginPath();
          ctx.moveTo(ax, ay1 + 4);
          ctx.lineTo(ax - 4, ay1 - 2);
          ctx.lineTo(ax + 4, ay1 - 2);
          ctx.closePath();
          ctx.fill();
          cap(ctx, pal, "ROLL", ax + 8, (ay0 + ay1) / 2 + 2, { colour: pal.ink });
        }

        // the prices of the six, at their expiries
        const pTop = calBase + 30;
        const pBase = h - 20;
        if (pBase - pTop < 30) return;
        const y = (v: number) => lerp(pBase, pTop, (clamp(v, NEAR - 45, NEAR + 45) - (NEAR - 45)) / 90);
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(left, y(NEAR) + 0.5);
        ctx.lineTo(right, y(NEAR) + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        cap(ctx, pal, "SPOT 100", left, y(NEAR) + (gap >= 0 ? 9 : -9));
        cap(ctx, pal, shape.toUpperCase(), right, pTop - 12, { align: "right", colour: pal.ink2 });
        ctx.beginPath();
        for (let i = 1; i <= MONTHS; i++) ctx.lineTo(x(i), y(NEAR + gap * (i - 1)));
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.lineWidth = 1.4;
        ctx.stroke();
        for (let i = 1; i <= MONTHS; i++) {
          ctx.fillStyle = rgba(i === 1 ? pal.ink : i === 2 ? pal.accent : pal.ink3, 1);
          ctx.beginPath();
          ctx.arc(x(i), y(NEAR + gap * (i - 1)), i <= 2 ? 4 : 3, 0, TAU);
          ctx.fill();
          cap(ctx, pal, `M${i}`, x(i), pBase + 11, { align: "center" });
        }
        // the second contract's price closing the gap to spot by its own expiry
        if (gap !== 0) {
          const colour = gap > 0 ? ALERT : pal.emerald;
          const from = y(next);
          const to = y(NEAR);
          const at = lerp(from, to, after);
          ctx.strokeStyle = rgba(colour, 1);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x(2) + 9, from);
          ctx.lineTo(x(2) + 9, at);
          ctx.stroke();
          const d = to > from ? 1 : -1;
          ctx.fillStyle = rgba(colour, 1);
          ctx.beginPath();
          ctx.moveTo(x(2) + 9, at + d * 4);
          ctx.lineTo(x(2) + 5, at - d * 2);
          ctx.lineTo(x(2) + 13, at - d * 2);
          ctx.closePath();
          ctx.fill();
          cap(ctx, pal, signed(-gap, 2), x(2) + 18, (from + to) / 2, { colour });
        }
      },
    [gap, next, shape],
  );

  const many = `${held} bought ${held === 1 ? "contract" : "contracts"} of ${SIZE} units`;
  const sentence =
    gap === 0
      ? `The next contract is priced the same as the expiring one, at ${num(NEAR, 2)}. Rolling ${many} means selling at ${num(NEAR, 2)} and buying at ${num(NEAR, 2)}: the roll neither costs nor gains anything, apart from dealing charges.`
      : `The next contract is priced ${num(Math.abs(gap), 2)} ${gap > 0 ? "above" : "below"} the expiring one, which is called ${shape}. Rolling ${many} means selling at ${num(NEAR, 2)} and buying at ${num(next, 2)}. If the spot price is still ${num(NEAR, 2)} when that contract expires, its price will have ${gap > 0 ? "fallen" : "risen"} to meet it, and the roll will have ${gap > 0 ? "cost" : "gained"} ${num(Math.abs(result), 2)}. A sold position would have ${gap > 0 ? "gained" : "lost"} the same.`;

  return (
    <Bench
      draw={draw}
      rev={revOf(gap, held)}
      sentence={sentence}
      rows={[
        ["Expiring contract", num(NEAR, 2)],
        ["Next contract", num(next, 2)],
        ["Shape of the prices", shape[0].toUpperCase() + shape.slice(1)],
        ["Roll, if spot stays put", signed(result, 2)],
      ]}
      formula={[
        `Gap = next contract − expiring contract = ${num(next, 2)} − ${num(NEAR, 2)} = ${signed(gap, 2)}`,
        `Roll result for a bought position, if the spot price stays at ${num(NEAR, 2)} = (spot − price paid) × units in a contract × contracts = (${num(NEAR, 2)} − ${num(next, 2)}) × ${SIZE} × ${held} = ${signed(result, 2)}`,
        `Value of the position after the roll = price × units × contracts = ${num(next, 2)} × ${SIZE} × ${held} = ${num(next * SIZE * held, 2)}`,
      ]}
      note="Six invented contracts in plain numbers, with each later one priced a further equal step away, which real markets do not do so neatly. The roll result assumes the spot price does not move at all; in practice it does, and that movement is added to or taken from the figure here. Dealing charges at each roll are left out."
    >
      <Slider label="Next contract against the expiring one" value={gap} min={-8} max={8} step={0.5} onChange={setGap} text={gap === 0 ? "the same price" : `${num(Math.abs(gap), 2)} ${gap > 0 ? "higher" : "lower"}`} />
      <Slider label="Contracts held (bought)" value={held} min={1} max={10} onChange={setHeld} text={`${held} × ${SIZE} units`} />
    </Bench>
  );
}
