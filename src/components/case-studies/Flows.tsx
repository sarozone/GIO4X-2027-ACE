"use client";

import { useMemo, useState } from "react";
import { TAU, clamp, rgba, type FigureDraw } from "@/components/figures/Figure";
import { Bench, Choice, cap, num, revOf, signed } from "@/components/investing/shared";
import { ALERT, AMBER, Slider } from "@/components/labs/kit";

/**
 * CASE-STUDY EXPLAINERS, the two that are a process run step by step: a loop
 * between price and belief, and a large order cut into slices.
 *
 * Each shows an IDEA, never a performance. The rules that drive them are
 * invented, simple and printed beneath; no real price, market, order book or
 * firm is in either, and neither is a forecast or a model anyone trades on.
 */

/* ---------------------------------------------------------------------------
 * 1. A LOOP BETWEEN PRICE AND BELIEF — a fundamental that starts at 100, a
 *    belief that starts with a small nudge, and a price that is the two added
 *    together. At each step belief chases the last change in the price, and
 *    the fundamental is itself moved by it. Each change is therefore (k + r)
 *    times the one before. When the gap between price and fundamental reaches
 *    an invented limit, belief fails and the same loop runs the other way.
 * ------------------------------------------------------------------------- */

const STEPS = 60;
const START = 100;
const NUDGE = 2;
const LIMIT = 25;
const DECAY = 0.6;

function runLoop(k: number, r: number, dir: 1 | -1) {
  const price = [START];
  const fund = [START];
  let f = START;
  let b = 0;
  let p = START;
  let prev = START;
  let breakAt = -1;
  for (let n = 1; n <= STEPS; n++) {
    const dp = p - prev;
    prev = p;
    if (n === 1) b = dir * NUDGE;
    else if (breakAt < 0) {
      b += k * dp;
      f += r * dp;
      if (Math.abs(b) >= LIMIT) breakAt = n;
    } else {
      b *= DECAY;
      f += r * dp;
    }
    p = f + b;
    price.push(p);
    fund.push(f);
  }
  return { price, fund, breakAt };
}

export function LoopMachine() {
  const [k, setK] = useState(0.7);
  const [r, setR] = useState(0.4);
  const [dir, setDir] = useState<"up" | "down">("up");

  const sim = useMemo(() => runLoop(k, r, dir === "up" ? 1 : -1), [k, r, dir]);
  const g = k + r;
  const end = sim.price[STEPS] ?? START;
  const endFund = sim.fund[STEPS] ?? START;
  const turn = sim.breakAt;
  const extreme = dir === "up" ? Math.max(...sim.price) : Math.min(...sim.price);
  const fundExtreme = dir === "up" ? Math.max(...sim.fund) : Math.min(...sim.fund);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const padX = 10;
        const top = 30;
        const bot = 12;
        const lo = Math.min(...sim.price, ...sim.fund) - 4;
        const hi = Math.max(...sim.price, ...sim.fund) + 4;
        const yOf = (v: number) => top + ((hi - v) / (hi - lo)) * (h - top - bot);
        const xOf = (n: number) => padX + (n / STEPS) * (w - padX * 2);
        const head = still ? STEPS : Math.floor(clamp((t % 9) / 6) * STEPS);
        const reversed = turn >= 0 && head >= turn;

        // the loop, named; a mark travels round it, and back the other way after the turn
        const label = "BELIEF → PRICE → FUNDAMENTAL → BELIEF";
        cap(ctx, pal, label, padX, 9);
        ctx.font = `600 10px ${pal.font}`;
        const track = Math.min(w - padX * 2, ctx.measureText(label).width);
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, 19.5);
        ctx.lineTo(padX + track, 19.5);
        ctx.stroke();
        const lap = still ? 0.5 : (t * (0.25 + Math.min(g, 1.5) * 0.35)) % 1;
        ctx.fillStyle = rgba(reversed ? ALERT : pal.accent, 1);
        ctx.beginPath();
        ctx.arc(padX + track * (reversed ? 1 - lap : lap), 19.5, 3, 0, TAU);
        ctx.fill();

        // where both began
        ctx.strokeStyle = rgba(pal.ink3, 0.45);
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padX, yOf(START));
        ctx.lineTo(w - padX, yOf(START));
        ctx.stroke();
        ctx.setLineDash([]);

        // the gap between price and fundamental: the belief
        ctx.fillStyle = rgba(pal.accent, 0.13 * enter);
        ctx.beginPath();
        for (let n = 0; n <= head; n++) ctx.lineTo(xOf(n), yOf(sim.price[n] ?? START));
        for (let n = head; n >= 0; n--) ctx.lineTo(xOf(n), yOf(sim.fund[n] ?? START));
        ctx.closePath();
        ctx.fill();

        const line = (xs: readonly number[], colour: string, width: number) => {
          ctx.strokeStyle = colour;
          ctx.lineWidth = width;
          ctx.beginPath();
          for (let n = 0; n <= head; n++) {
            if (n === 0) ctx.moveTo(xOf(n), yOf(xs[n] ?? START));
            else ctx.lineTo(xOf(n), yOf(xs[n] ?? START));
          }
          ctx.stroke();
        };
        line(sim.fund, rgba(pal.gold, 1), 1.5);
        line(sim.price, rgba(pal.accent, 1), 2);

        if (turn >= 0 && head >= turn) {
          ctx.strokeStyle = rgba(ALERT, 0.9);
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(xOf(turn), top);
          ctx.lineTo(xOf(turn), h - bot);
          ctx.stroke();
          ctx.setLineDash([]);
          const right = xOf(turn) > w * 0.6;
          cap(ctx, pal, "BELIEF FAILS", xOf(turn) + (right ? -6 : 6), h - bot - 6, { align: right ? "right" : "left", colour: ALERT });
        }
        const py = yOf(sim.price[head] ?? START);
        const fy = yOf(sim.fund[head] ?? START);
        const away = Math.abs(py - fy) < 12 ? (py <= fy ? -7 : 7) : 0;
        const side = xOf(head) > w * 0.7;
        cap(ctx, pal, "PRICE", xOf(head) + (side ? -6 : 6), py + away, { align: side ? "right" : "left", colour: pal.accent });
        cap(ctx, pal, "FUNDAMENTAL", xOf(head) + (side ? -6 : 6), fy - away, { align: side ? "right" : "left", colour: pal.gold });
      },
    [sim, turn, g],
  );

  const way = dir === "up" ? "upward" : "downward";
  const sentence =
    turn < 0
      ? `A small ${way} nudge to belief. Each change in the price is ${num(g, 2)} times the one before, so the move fades: after ${STEPS} steps the price rests near ${num(end, 1)} and the fundamental near ${num(endFund, 1)}, both having begun at 100. ${r > 0 ? "Even a move that fades has shifted the fundamental a little." : "With no pull on the fundamental, it has not moved at all."}`
      : `A small ${way} nudge to belief. Each change in the price is ${num(g, 2)} times the one before, so the move ${g > 1 ? "feeds on itself" : "keeps building"}: at step ${turn} the gap between price and fundamental reaches ${LIMIT}, the invented point at which belief fails, and the same loop runs the other way. The price reached ${num(extreme, 1)}, and on the way it carried the fundamental to ${num(fundExtreme, 1)}; both end near ${num(end, 1)}.`;

  return (
    <Bench
      draw={draw}
      rev={revOf(k, r, dir)}
      sentence={sentence}
      rows={[
        ["Each change, times the last", `× ${num(g, 2)}`],
        ["Belief fails at step", turn < 0 ? "never" : String(turn)],
        ["Furthest price", num(extreme, 1)],
        ["Fundamental at its furthest", num(fundExtreme, 1)],
      ]}
      formula={[
        "Price = fundamental + belief. Both start at 100; belief starts with a nudge of 2.",
        `Each step: belief changes by ${num(k, 2)} × the last price change; the fundamental changes by ${num(r, 2)} × the last price change`,
        `So each price change = (${num(k, 2)} + ${num(r, 2)}) × the one before = ${num(g, 2)} ×. Above 1 it grows; below 1 it fades.`,
        `When belief reaches ${LIMIT} it fails: from then on it shrinks to ${num(DECAY, 1)} of itself each step.`,
      ]}
      note="An invented rule in plain numbers, made to show a loop that can strengthen itself and then reverse. The limit of 25 and every other figure are chosen for the drawing. It is not a model of any market, it cannot say when a real trend will turn, and it is not a forecast."
    >
      <Choice
        label="The first nudge to belief"
        value={dir}
        options={[
          ["up", "Upward"],
          ["down", "Downward"],
        ]}
        onChange={setDir}
      />
      <Slider label="How strongly belief chases the price" value={k} min={0} max={1} step={0.05} onChange={setK} text={num(k, 2)} />
      <Slider label="How far the price moves the fundamental" value={r} min={0} max={0.5} step={0.05} onChange={setR} text={num(r, 2)} />
    </Bench>
  );
}

/* ---------------------------------------------------------------------------
 * 2. AN ORDER THROUGH A THIN BOOK — an invented order book with the same
 *    number of units at every price level, 0.05 apart, the best at 100.00.
 *    A buy order is cut into equal slices. Each slice eats upwards through
 *    the levels; the book then refills, but a quarter of the move stays, so
 *    the next slice starts higher. More slices pay less for walking the book
 *    and take longer, and the unfinished part is exposed to drift meanwhile.
 * ------------------------------------------------------------------------- */

const TICK = 0.05;
const ARRIVAL = 100;
const STAY = 0.25;
const SWING = 0.1;

function runOrder(size: number, slices: number, depth: number) {
  const q = size / slices;
  const levels = q / depth;
  const full = Math.floor(levels);
  const rem = q - full * depth;
  const bases: number[] = [];
  let moved = 0;
  let cost = 0;
  let stayed = 0;
  for (let j = 0; j < slices; j++) {
    const base = ARRIVAL + moved;
    bases.push(base);
    // full levels at base, base + tick, ...; then the part-filled level above them
    cost += depth * (full * base + (TICK * full * (full - 1)) / 2) + rem * (base + full * TICK);
    stayed += moved * q;
    moved += STAY * TICK * levels;
  }
  const avg = cost / size;
  const perm = stayed / size;
  return { q, levels, bases, avg, perm, temp: avg - ARRIVAL - perm, risk: SWING * Math.sqrt(slices - 1) };
}

export function SliceMachine() {
  const [size, setSize] = useState(1000);
  const [slices, setSlices] = useState(5);
  const [depth, setDepth] = useState(60);

  const o = useMemo(() => runOrder(size, slices, depth), [size, slices, depth]);
  const shortfall = o.avg - ARRIVAL;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        const padX = 10;
        const top = 22;
        const bot = 12;
        const last = o.bases[slices - 1] ?? ARRIVAL;
        const hi = Math.max(ARRIVAL + 0.6, last + o.levels * TICK + 0.15);
        const lo = ARRIVAL - Math.max(0.3, o.risk + 0.12);
        const yOf = (v: number) => top + ((hi - v) / (hi - lo)) * (h - top - bot);
        const colW = (w - padX * 2) / slices;
        const active = still ? -1 : Math.floor((t * 1.6) % (slices + 3));

        cap(ctx, pal, "PRICE LEVELS EATEN BY EACH SLICE", padX, 9);

        // the room for drift while the order is being worked: wider with every interval
        ctx.fillStyle = rgba(AMBER, 0.14);
        for (let j = 1; j < slices; j++) {
          const band = SWING * Math.sqrt(j);
          ctx.fillRect(padX + j * colW, yOf(ARRIVAL + band), colW, yOf(ARRIVAL - band) - yOf(ARRIVAL + band));
        }

        for (let j = 0; j < slices; j++) {
          const base = o.bases[j] ?? ARRIVAL;
          const x = padX + j * colW + Math.min(3, colW * 0.12);
          const bw = colW - Math.min(6, colW * 0.24);
          const y1 = yOf(base);
          const y0 = yOf(base + o.levels * TICK);
          const lit = j === active;
          ctx.fillStyle = rgba(pal.accent, (lit ? 0.95 : 0.6) * enter);
          ctx.fillRect(x, Math.min(y0, y1 - 2), bw, Math.max(2, y1 - y0));
          // one line for each level, when there is room to tell them apart
          const per = (y1 - y0) / Math.max(o.levels, 1);
          if (o.levels > 1 && per >= 4) {
            ctx.strokeStyle = rgba(pal.surface, 0.9);
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let l = 1; l < o.levels; l++) {
              const y = Math.round(y1 - l * per) + 0.5;
              ctx.moveTo(x, y);
              ctx.lineTo(x + bw, y);
            }
            ctx.stroke();
          }
          // where this slice began: the best price by then
          ctx.strokeStyle = rgba(pal.gold, 1);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(padX + j * colW, y1 + 0.5);
          ctx.lineTo(padX + (j + 1) * colW, y1 + 0.5);
          ctx.stroke();
        }

        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padX, yOf(ARRIVAL) + 0.5);
        ctx.lineTo(w - padX, yOf(ARRIVAL) + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        cap(ctx, pal, "ARRIVAL 100.00", padX, yOf(ARRIVAL) + 9);

        ctx.strokeStyle = rgba(pal.ink, 0.95);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padX, yOf(o.avg) + 0.5);
        ctx.lineTo(w - padX, yOf(o.avg) + 0.5);
        ctx.stroke();
        cap(ctx, pal, `AVERAGE PAID ${num(o.avg, 2)}`, w - padX, yOf(o.avg) - 8, { align: "right", colour: pal.ink });
        if (slices > 1) cap(ctx, pal, "ROOM FOR DRIFT", w - padX, yOf(ARRIVAL - o.risk) + 9 > h - 4 ? h - 6 : yOf(ARRIVAL - o.risk) + 9, { align: "right", colour: AMBER });
      },
    [o, slices],
  );

  const eaten = o.levels <= 1 ? "stays within the first price level" : `eats through ${num(Math.ceil(o.levels))} price levels`;
  const sentence = `A buy order for ${num(size)} units, sent ${slices === 1 ? "all at once" : `as ${slices} slices of ${slices * Math.round(o.q) === size ? num(o.q) : `about ${num(o.q)}`}`}, into a book with ${depth} units at each price level. ${slices === 1 ? "It" : "Each slice"} ${eaten}. The average price paid is ${num(o.avg, 2)}, which is ${num(shortfall, 3)} above the arrival price of 100.00: ${num(o.temp, 3)} from walking up the book and ${num(o.perm, 3)} from the price having moved away as the order became known. ${slices === 1 ? "Dealing at once leaves no time for the price to drift." : `Working it over ${slices} intervals leaves the unfinished part exposed: by the last slice the price could have drifted about ${num(o.risk, 2)} either way by chance.`}`;

  return (
    <Bench
      draw={draw}
      rev={revOf(size, slices, depth)}
      sentence={sentence}
      rows={[
        ["Average price paid", num(o.avg, 2)],
        ["Shortfall per unit", signed(shortfall, 3)],
        ["Shortfall on the order", num(shortfall * size, 1)],
        ["Room for drift by the end", slices === 1 ? "none" : `± ${num(o.risk, 2)}`],
      ]}
      formula={[
        `Slice = order ÷ slices = ${num(size)} ÷ ${slices} = ${num(o.q, 1)} units; levels eaten = slice ÷ depth = ${num(o.levels, 2)}`,
        `Each level is ${num(TICK, 2)} above the last. After a slice the book refills, but the best price stays ${num(STAY, 2)} of the way up.`,
        `Shortfall per unit = average paid − arrival = ${num(o.avg, 3)} − 100.000 = ${num(shortfall, 3)}`,
        `Room for drift = ${num(SWING, 2)} × √(intervals waited) = ${num(SWING, 2)} × √${slices - 1} = ${num(o.risk, 2)}`,
      ]}
      note="An invented order book: equal depth at every level, a full refill between slices and a fixed share of each move that stays. Real books are uneven, refill unpredictably and are watched by others who may notice a pattern of slices. This shows the trade-off between dealing quickly and dealing slowly. It is not a cost estimate for any market or any provider."
    >
      <Slider label="Size of the order" value={size} min={200} max={2000} step={100} onChange={setSize} text={`${num(size)} units`} />
      <Slider label="Units at each price level" value={depth} min={20} max={200} step={10} onChange={setDepth} text={`${depth} units`} />
      <Slider label="Slices" value={slices} min={1} max={20} step={1} onChange={setSlices} text={slices === 1 ? "1: all at once" : `${slices}`} />
    </Bench>
  );
}
