"use client";

import { useMemo, useState } from "react";
import { clamp, lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, AMBER, Note, Slider, Stage } from "@/components/labs/kit";
import { cap, dot, flow, fmt, line, node, type Pt } from "./draw";
import { PONZI, PUMP, SIGNAL_START, ponzi, pumpPath, pumpPhase, pyramid, seededRng, signalLeft } from "./engine";

/**
 * SCAM SCHOOL — four explainers about where the money comes from: the Ponzi
 * scheme, the pyramid scheme, the pump and dump, and the "never wrong" signal
 * seller.
 *
 * Each is a small model of a type of fraud, in invented units, computed in
 * the browser from one control. None of it describes a real scheme, a real
 * share or a real person, and nothing is stored or sent. The sentence under
 * each canvas says what the canvas shows.
 */

const Say = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
    {children}
  </p>
);

/* ---------------------------------------------------------------------------
 * 1. PONZI — new money in, "returns" out, nothing in between.
 * ------------------------------------------------------------------------- */

export function PonziExplainer() {
  const [g, setG] = useState(5);
  const sim = useMemo(() => ponzi(g / 100), [g]);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const rows = sim.rows;
        const n = rows.length;
        const u = still ? 1 : clamp((t % 10) / 6.5);
        const upto = Math.max(1, Math.round(u * n));
        const row = rows[upto - 1];
        const dead = sim.collapse !== null && upto === n;
        const maxOwed = rows[n - 1].owed;
        const maxPot = Math.max(...rows.map((r) => r.pot), 1);
        const small = w < 360;

        // the flow: new money -> the pot -> paid out as "returns"
        const fy = h * 0.2;
        const a: Pt = [w * 0.13, fy];
        const b: Pt = [w * 0.5, fy];
        const c: Pt = [w * 0.87, fy];
        const rp = 7 + 13 * Math.sqrt(row.pot / maxPot);
        flow(ctx, [a[0] + 9, fy], [b[0] - rp - 3, fy], t, pal.teal, 5, 0.3);
        if (!dead) flow(ctx, [b[0] + rp + 3, fy], [c[0] - 9, fy], t, pal.gold, 5, 0.3);
        else line(ctx, [b[0] + rp + 3, fy], [c[0] - 9, fy], rgba(ALERT, 0.6), 1, [3, 4]);
        dot(ctx, a[0], fy, 5, rgba(pal.teal, 1));
        dot(ctx, c[0], fy, 5, rgba(dead ? ALERT : pal.gold, 1));
        node(ctx, pal, b, rp, dead ? ALERT : pal.accent, dead ? "Pot empty" : "The pot", false, small ? 9 : 10);
        cap(ctx, pal, "New money", a[0], fy + 16, pal.ink2, "center", small ? 9 : 10);
        cap(ctx, pal, "“Returns”", c[0], fy + 16, pal.ink2, "center", small ? 9 : 10);

        // the chart: what investors are told they have, and the cash that is there
        const top = h * 0.44;
        const bot = h - 20;
        const X = (m: number) => lerp(12, w - 12, m / (PONZI.months - 1));
        const Y = (v: number) => lerp(bot, top, v / maxOwed);
        line(ctx, [12, bot], [w - 12, bot], rgba(pal.ink3, 0.5));
        ctx.beginPath();
        ctx.moveTo(X(0), bot);
        for (let m = 0; m < upto; m++) ctx.lineTo(X(m), Y(rows[m].pot));
        ctx.lineTo(X(upto - 1), bot);
        ctx.fillStyle = rgba(pal.accent, 0.22);
        ctx.fill();
        const curve = (key: "owed" | "pot", stroke: string, dash: number[]) => {
          ctx.setLineDash(dash);
          ctx.beginPath();
          for (let m = 0; m < upto; m++) {
            if (m === 0) ctx.moveTo(X(m), Y(rows[m][key]));
            else ctx.lineTo(X(m), Y(rows[m][key]));
          }
          ctx.lineWidth = 1.7;
          ctx.lineJoin = "round";
          ctx.strokeStyle = stroke;
          ctx.stroke();
          ctx.setLineDash([]);
        };
        curve("owed", rgba(pal.ink2, 1), [5, 4]);
        curve("pot", rgba(pal.accent, 1), []);
        cap(ctx, pal, "Told they have", 14, top - 2, pal.ink2, "left", small ? 9 : 10);
        cap(ctx, pal, "Cash in the pot", 14, top + 11, pal.accent, "left", small ? 9 : 10);
        if (dead) {
          const x = X(n - 1);
          const pulse = still ? 1 : 0.6 + 0.4 * Math.sin(t * 4);
          line(ctx, [x, top], [x, bot], rgba(ALERT, pulse), 1.5);
          dot(ctx, x, bot, 4, rgba(ALERT, 1));
        }
        cap(ctx, pal, "Month 1", 12, h - 8, pal.ink3, "left", 9);
        cap(ctx, pal, `Month ${PONZI.months}`, w - 12, h - 8, pal.ink3, "right", 9);
      },
    [sim],
  );
  const last = sim.rows[sim.rows.length - 1];
  const pace = g > 0 ? `new money growing ${g}% every month` : g < 0 ? `new money shrinking ${-g}% every month` : "the same amount of new money every month";
  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={g} />
      <Slider label="How fast new money arrives" value={g} min={-10} max={20} onChange={setG} text={g > 0 ? `${g}% more each month` : g < 0 ? `${-g}% less each month` : "the same each month"} />
      <Say>
        {sim.collapse !== null
          ? `With ${pace}, the scheme pays its 10% a month for ${sim.collapse} months. In month ${sim.collapse + 1} the pot cannot cover the “returns”: investors have been told they hold ${fmt(last.owed)} units, and there is no cash behind it.`
          : `With ${pace}, the scheme is still paying after ${PONZI.months} months, but only because month ${PONZI.months} brought in ${fmt(sim.needed)} times as much as month 1. Investors are told they hold ${fmt(last.owed)} units; the pot holds ${fmt(last.pot)}. When the growth slows, it fails.`}
      </Say>
      <Note>
        The model, in invented units: month 1 brings in {PONZI.first}; the operator keeps {PONZI.cut * 100}% of what arrives; every unit ever paid in is paid a {PONZI.promised * 100}% “return” each month, in cash, from the same pot. Nothing is invested and nothing is earned. A picture of the type, not of any real scheme.
      </Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 2. PYRAMID — every level must be several times the size of the one above.
 * ------------------------------------------------------------------------- */

export function PyramidExplainer() {
  const [each, setEach] = useState(6);
  const sim = useMemo(() => pyramid(each), [each]);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const rows = sim.levels.length;
        const per = 0.45;
        const u = still ? rows : Math.min(rows, ((t % (rows * per + 3)) / per) | 0) + 1;
        const shown = Math.min(rows, u);
        const top = 30;
        const bot = h - 10;
        const rh = (bot - top) / rows;
        const maxLog = Math.log(sim.levels[rows - 1]);
        for (let i = 0; i < shown; i++) {
          const bw = Math.max(4, ((w - 24) * Math.log(sim.levels[i] + 1)) / maxLog);
          const tone = i >= sim.worldAt ? ALERT : i >= sim.cityAt ? AMBER : pal.accent;
          const newest = i === shown - 1 && !still;
          ctx.fillStyle = rgba(tone, newest ? 1 : 0.7);
          ctx.fillRect((w - Math.min(bw, w - 24)) / 2, top + i * rh + 1, Math.min(bw, w - 24), Math.max(1.5, rh - 2));
        }
        const at = shown - 1;
        cap(ctx, pal, `Level ${at}`, 12, 12, pal.ink2);
        cap(ctx, pal, `${fmt(sim.levels[at])} new`, w - 12, 12, at >= sim.worldAt ? ALERT : at >= sim.cityAt ? AMBER : pal.ink2, "right");
        // the two lines that matter: a city, and everyone
        const mark = (lvl: number, text: string) => {
          if (shown <= lvl) return;
          const y = top + lvl * rh;
          line(ctx, [8, y], [w - 8, y], rgba(pal.ink2, 0.8), 1, [4, 4]);
          cap(ctx, pal, text, 12, y - 7, pal.ink2, "left", 9);
        };
        mark(sim.cityAt, "Past one million");
        mark(sim.worldAt, "Past everyone alive");
      },
    [sim],
  );
  return (
    <div>
      <Stage draw={draw} ratio={1.3} rev={each} />
      <Slider label="New members each member must bring in" value={each} min={3} max={10} onChange={setEach} text={String(each)} />
      <Say>
        {`If every member must bring in ${each}, level ${sim.cityAt} takes the membership past a city of one million, and by level ${sim.worldAt} it would need more people than are alive: that level alone calls for ${fmt(sim.levels[sim.worldAt])}. Wherever it stops, about ${Math.round(sim.bottomShare * 100)}% of the members are in the newest level. They have paid in and recruited nobody.`}
      </Say>
      <Note>
        The arithmetic: level n needs {each}
        <sup>n</sup> people, so each level is {each} times the one above it. The bars are drawn on a compressed scale, or the lower ones would not fit on any screen. “Everyone alive” is taken as eight billion, the round figure the United Nations gives for the world’s population.
      </Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 3. PUMP AND DUMP — an invented price, pushed up and sold into.
 * ------------------------------------------------------------------------- */

const PATH = pumpPath();
const PHASE_WORDS = { quiet: "the quiet weeks, before anyone is talking about it", promotion: "the promotion, with the messages at their loudest", selling: "the days the promoters are selling", after: "the aftermath" } as const;

export function PumpExplainer() {
  const [day, setDay] = useState(56);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const u = still ? 1 : clamp((t % 11) / 7);
        const upto = Math.max(2, Math.round(u * PUMP.days));
        const top = 26;
        const bot = h - 34;
        const hi = Math.max(...PATH) * 1.05;
        const X = (d: number) => lerp(10, w - 10, d / (PUMP.days - 1));
        const Y = (v: number) => lerp(bot, top, v / hi);
        // the three boundaries
        const bands: [number, number, string, typeof pal.ink3][] = [
          [0, PUMP.buyEnd, small ? "Buying" : "Quiet buying", pal.teal],
          [PUMP.buyEnd, PUMP.pumpEnd, "Promotion", AMBER],
          [PUMP.pumpEnd, PUMP.sellEnd, small ? "Sell" : "Selling", ALERT],
          [PUMP.sellEnd, PUMP.days - 1, "After", pal.ink3],
        ];
        bands.forEach(([from, to, name, tone], i) => {
          ctx.fillStyle = rgba(tone, 0.08);
          ctx.fillRect(X(from), top - 14, X(to) - X(from), bot - top + 14);
          if (i) line(ctx, [X(from), top - 14], [X(from), bot], rgba(pal.ink3, 0.35));
          cap(ctx, pal, name, (X(from) + X(to)) / 2, top - 6, pal.ink2, "center", small ? 8 : 10);
        });
        line(ctx, [10, bot], [w - 10, bot], rgba(pal.ink3, 0.5));
        ctx.beginPath();
        for (let d = 0; d < upto; d++) {
          if (d === 0) ctx.moveTo(X(d), Y(PATH[d]));
          else ctx.lineTo(X(d), Y(PATH[d]));
        }
        ctx.lineWidth = 1.8;
        ctx.lineJoin = "round";
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();
        // what the promoters hold: filled while they buy, emptied while they sell
        const held = (d: number) => (d < PUMP.buyEnd ? d / PUMP.buyEnd : d < PUMP.pumpEnd ? 1 : d < PUMP.sellEnd ? 1 - (d - PUMP.pumpEnd) / (PUMP.sellEnd - PUMP.pumpEnd) : 0);
        const by = h - 16;
        ctx.beginPath();
        ctx.moveTo(X(0), by + 6);
        for (let d = 0; d < upto; d++) ctx.lineTo(X(d), by + 6 - held(d) * 12);
        ctx.lineTo(X(upto - 1), by + 6);
        ctx.fillStyle = rgba(pal.gold, 0.75);
        ctx.fill();
        cap(ctx, pal, "Promoters’ holding", w - 10, by - 10, pal.ink3, "right", 9);
        // the late buyer
        const d = day - 1;
        if (upto > d) {
          line(ctx, [X(d), Y(PATH[d])], [X(d), bot], rgba(pal.ink2, 0.8), 1, [3, 3]);
          dot(ctx, X(d), Y(PATH[d]), 5 + (still ? 0 : Math.sin(t * 4)), rgba(pal.ink, 1));
          dot(ctx, X(d), Y(PATH[d]), 2.5, rgba(pal.surface, 1));
        }
      },
    [day],
  );
  const paid = PATH[day - 1];
  const end = PATH[PUMP.days - 1];
  const change = Math.round((end / paid - 1) * 100);
  return (
    <div>
      <Stage draw={draw} ratio={1.6} rev={day} />
      <Slider label="The day a buyer joins" value={day} min={1} max={PUMP.days} onChange={setDay} text={`day ${day}`} />
      <Say>
        {`A buyer who joins on day ${day}, in ${PHASE_WORDS[pumpPhase(day - 1)]}, pays ${paid.toFixed(2)} a share. On day ${PUMP.days} the same share is ${end.toFixed(2)}: ${change === 0 ? "no change" : `${change < 0 ? "down" : "up"} ${Math.abs(change)}%`}. The promoters bought at about 10 and sold between days ${PUMP.pumpEnd + 1} and ${PUMP.sellEnd}, to the buyers their own messages brought in.`}
      </Say>
      <Note>An invented price for an invented share, drawn to show the shape. Not market data, and not a record of any real case.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 4. THE SIGNAL SELLER WHO IS NEVER WRONG — half are told up, half down.
 * ------------------------------------------------------------------------- */

const COLS = 32;
const ROWS = SIGNAL_START / COLS;
/** a fixed shuffle: where in the queue each person stands, so the survivors are scattered and not a tidy corner */
const RANK: number[] = (() => {
  const r = seededRng(2718);
  const order = Array.from({ length: SIGNAL_START }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = new Array<number>(SIGNAL_START);
  order.forEach((person, place) => (rank[person] = place));
  return rank;
})();

export function SignalExplainer() {
  const [rounds, setRounds] = useState(5);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const left = signalLeft(rounds);
        const before = rounds > 0 ? left * 2 : left;
        // the last round plays out: both halves coloured by what they were told, then the wrong half goes grey
        const q = still || rounds === 0 ? 1 : smooth(((t % 5) - 1.6) / 1.2);
        const cw = (w - 20) / COLS;
        const chh = (h - 34) / ROWS;
        const r = Math.max(1.2, Math.min(cw, chh) * 0.34);
        for (let i = 0; i < SIGNAL_START; i++) {
          const x = 10 + cw * ((i % COLS) + 0.5);
          const y = 10 + chh * (Math.floor(i / COLS) + 0.5);
          const place = RANK[i];
          if (place < left) dot(ctx, x, y, r * (still ? 1.15 : 1.1 + 0.15 * Math.sin(t * 3 + i)), rgba(pal.accent, 1));
          else if (place < before) {
            // told the wrong thing in this round
            dot(ctx, x, y, r, rgba(pal.gold, 1 - q));
            dot(ctx, x, y, r, rgba(pal.ink3, 0.28 * q));
          } else dot(ctx, x, y, r, rgba(pal.ink3, 0.28));
        }
        cap(ctx, pal, `Still receiving: ${left}`, 10, h - 11, pal.accent);
        cap(ctx, pal, `Dropped: ${SIGNAL_START - left}`, w - 10, h - 11, pal.ink3, "right");
      },
    [rounds],
  );
  const left = signalLeft(rounds);
  return (
    <div>
      <Stage draw={draw} ratio={1.7} rev={rounds} />
      <Slider label="Predictions sent" value={rounds} min={0} max={8} onChange={setRounds} text={rounds === 0 ? "none yet" : `${rounds}`} />
      <Say>
        {rounds === 0
          ? `${SIGNAL_START} people are on the list. Each is about to be sent a free prediction: half will be told the price will rise, and half that it will fall.`
          : `After ${rounds} ${rounds === 1 ? "prediction" : "predictions"}, ${left} of ${SIGNAL_START} people have seen ${rounds === 1 ? "one correct call" : `${rounds} correct calls in a row`} and not one miss. Nobody predicted anything: each time, half were told “up” and half were told “down”, and only the half told right heard from the seller again.`}
      </Say>
      <Note>
        The arithmetic: {SIGNAL_START} ÷ 2<sup>{rounds}</sup> = {left}. Each dot is one invented person. To the {left === 1 ? "one who is" : `${left} who are`} left, the record looks perfect, and that is when the paid “guaranteed” service is offered.
      </Note>
    </div>
  );
}
