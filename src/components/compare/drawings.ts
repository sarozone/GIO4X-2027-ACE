import { TAU, clamp, lerp, rgba, type Colour, type FigureDraw, type FigureFrame, type Palette } from "@/components/figures/Figure";
import { ALERT, AMBER } from "@/components/labs/kit";
import { seeded } from "@/components/labs/workshop/rng";

/**
 * The drawings of the comparison pages: one for each comparison, keyed by its
 * slug, each taking the item the visitor has chosen and showing how that item
 * works where the others work differently.
 *
 * Every price here is invented: a fixed path or a fixed-seed walk, the same on
 * every visit. A drawing is complete as a single still frame (under reduced
 * motion the sweep is simply finished), carries no figure that could be read
 * as a real price or rate, and says nothing the sentence beneath it does not
 * also say in words.
 */

type Ctx = CanvasRenderingContext2D;

/** 0 to 1 across a loop of `period` seconds, resting at 1 for the last `hold`; 1 in a still frame */
const sweep = (f: FigureFrame, period = 9, hold = 2.5) => (f.still ? 1 : clamp((f.t % period) / (period - hold)));

function label(ctx: Ctx, pal: Palette, text: string, x: number, y: number, align: CanvasTextAlign = "left", colour: Colour = pal.ink3) {
  ctx.font = `600 10px ${pal.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(colour, 1);
  ctx.fillText(text, x, y);
}

function hline(ctx: Ctx, x0: number, x1: number, y: number, colour: string, dash: number[] = []) {
  ctx.beginPath();
  ctx.setLineDash(dash);
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.lineWidth = 1;
  ctx.strokeStyle = colour;
  ctx.stroke();
  ctx.setLineDash([]);
}

function vline(ctx: Ctx, x: number, y0: number, y1: number, colour: string, dash: number[] = [], width = 1) {
  ctx.beginPath();
  ctx.setLineDash(dash);
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1);
  ctx.lineWidth = width;
  ctx.strokeStyle = colour;
  ctx.stroke();
  ctx.setLineDash([]);
}

function dot(ctx: Ctx, x: number, y: number, r: number, fill: string, ring?: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  if (ring) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = ring;
    ctx.stroke();
  }
}

/** a fixed-seed walk of n values, scaled to run from 0 to 1 */
function walk(seed: number, n: number, lean = 0): number[] {
  const r = seeded(seed);
  const out: number[] = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += r() - 0.5 + lean;
    out.push(v);
  }
  const lo = Math.min(...out);
  const hi = Math.max(...out);
  return out.map((x) => (x - lo) / (hi - lo || 1));
}

/* ---------------------------------------------------------------------------
 * ORDER TYPES. One path: up to a peak, a drift down, a gap, a part recovery.
 * Five orders to sell, and where each would fill. The gap is the point: no
 * price trades inside it, so a stop is filled beyond its level and a
 * stop-limit is not filled at all.
 * ------------------------------------------------------------------------- */

type Pt = readonly [x: number, price: number];
const GAP = 0.62;
const BEFORE: readonly Pt[] = [[0, 50], [0.08, 53], [0.16, 51], [0.26, 60], [0.34, 66.5], [0.42, 70], [0.5, 66], [0.56, 63.5], [GAP, 62]];
const AFTER: readonly Pt[] = [[GAP, 48], [0.7, 45], [0.78, 44], [0.88, 49], [1, 52]];
const along = (pts: readonly Pt[], x: number) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    if (x <= b[0]) return lerp(a[1], b[1], clamp((x - a[0]) / (b[0] - a[0] || 1)));
  }
  return pts[pts.length - 1]![1];
};
const priceAt = (x: number) => (x < GAP ? along(BEFORE, x) : along(AFTER, x));

const STOP = 58;
const STOP_LIMIT = 56;
const LIMIT = 66;
const TRAIL = 6;
/** where on the path each order fills: the limit on the way up, the trailing stop 6 below the peak of 70 */
const LIMIT_X = 0.26 + (0.08 * (LIMIT - 60)) / 6.5;
const TRAIL_X = 0.5 + (0.06 * (66 - (70 - TRAIL))) / 2.5;

function orders(focus: number): FigureDraw {
  return (f) => {
    const { ctx, w, h, pal } = f;
    if (w < 100 || h < 60) return;
    const p = sweep(f);
    const X = (x: number) => lerp(12, w - 12, x);
    const Y = (v: number) => lerp(h - 16, 16, (v - 40) / 34);
    const faint = rgba(pal.ink3, 0.7);

    // the gap: a stretch of prices at which nothing traded
    vline(ctx, X(GAP), Y(62), Y(48), rgba(pal.ink3, 0.8), [3, 4]);
    label(ctx, pal, "GAP", X(GAP) - 7, Y(55), "right");

    // the levels of the chosen order
    if (focus === 1) {
      hline(ctx, X(0), X(1), Y(LIMIT), faint, [5, 5]);
      label(ctx, pal, "LIMIT", X(0) + 2, Y(LIMIT) - 8);
    }
    if (focus === 2 || focus === 3) {
      hline(ctx, X(0), X(1), Y(STOP), faint, [5, 5]);
      label(ctx, pal, "STOP", X(0) + 2, Y(STOP) - 8);
    }
    if (focus === 3) {
      hline(ctx, X(0), X(1), Y(STOP_LIMIT), rgba(AMBER, 0.8), [2, 4]);
      label(ctx, pal, "LIMIT", X(0) + 2, Y(STOP_LIMIT) + 9);
    }

    // the path, as far as the sweep has gone
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(pal.accent, 1);
    for (const [from, to, pts] of [[0, Math.min(p, GAP), BEFORE], [GAP, p, AFTER]] as const) {
      if (to <= from && from > 0) continue;
      ctx.beginPath();
      ctx.moveTo(X(from), Y(along(pts, from)));
      for (const q of pts) if (q[0] > from && q[0] < to) ctx.lineTo(X(q[0]), Y(q[1]));
      ctx.lineTo(X(to), Y(along(pts, to)));
      ctx.stroke();
    }

    // the trailing stop: 6 beneath the highest price so far, never moving down, until it is hit
    if (focus === 4) {
      ctx.beginPath();
      let top = 0;
      const end = Math.min(p, TRAIL_X);
      for (let x = 0; x <= end + 1e-6; x += 0.004) {
        top = Math.max(top, priceAt(x));
        if (x === 0) ctx.moveTo(X(x), Y(top - TRAIL));
        else ctx.lineTo(X(x), Y(top - TRAIL));
      }
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = rgba(pal.gold, 1);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, pal, "TRAILING STOP", X(0) + 2, Y(50 - TRAIL) + 10);
    }

    // where it fills
    const pulse = f.still ? 0 : (f.t % 1.6) / 1.6;
    const mark = (x: number, v: number, text: string, colour: Colour, side: 1 | -1 = 1, drop = 0) => {
      if (p < x) return;
      if (!f.still) dot(ctx, X(x), Y(v), 5 + pulse * 9, rgba(colour, 0.25 * (1 - pulse)));
      dot(ctx, X(x), Y(v), 5, rgba(colour, 1), rgba(pal.surface, 1));
      label(ctx, pal, text, X(x) + side * 10, Y(v) + 1 + drop, side > 0 ? "left" : "right", pal.ink);
    };
    if (focus === 0) mark(0, 50, "FILLED AT ONCE", pal.emerald, 1, 12);
    if (focus === 1) mark(LIMIT_X, LIMIT, "FILLED AT THE LIMIT", pal.emerald, 1, 13);
    if (focus === 2) {
      if (p >= GAP) vline(ctx, X(GAP), Y(STOP), Y(48), rgba(ALERT, 1), [], 2);
      mark(GAP, 48, "FILLED, BELOW THE STOP", ALERT, -1);
    }
    if (focus === 3 && p >= GAP) {
      ctx.beginPath();
      ctx.arc(X(GAP), Y(STOP_LIMIT), 5, 0, TAU);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rgba(AMBER, 1);
      ctx.stroke();
      label(ctx, pal, "TRIGGERED, NOT FILLED", X(GAP) + 10, Y(STOP_LIMIT + 1.5), "left", pal.ink);
    }
    if (focus === 4) mark(TRAIL_X, 70 - TRAIL, "FILLED", pal.emerald);

    if (p < 1) dot(ctx, X(p), Y(priceAt(p)), 3, rgba(pal.ink, 1));
  };
}

/* ---------------------------------------------------------------------------
 * CHART TYPES. Twenty-two invented periods, drawn four ways in four panels.
 * The Heikin-Ashi panel is calculated from the same prices by the usual
 * formula, which is why its candles sit away from the true ones.
 * ------------------------------------------------------------------------- */

type Bar = readonly [o: number, h: number, l: number, c: number];
const BARS: readonly Bar[] = (() => {
  const r = seeded(2027);
  const out: Bar[] = [];
  let last = 50;
  for (let i = 0; i < 22; i++) {
    // one gap, so that the charts which show gaps have one to show
    const o = last + (i === 9 ? 3.2 : (r() - 0.5) * 0.6);
    const c = o + (r() - 0.5) * 5 + (i < 13 ? 0.9 : -1.1);
    out.push([o, Math.max(o, c) + r() * 2, Math.min(o, c) - r() * 2, c]);
    last = c;
  }
  return out;
})();
const HEIKIN: readonly Bar[] = (() => {
  const out: Bar[] = [];
  BARS.forEach(([o, h, l, c], i) => {
    const prev = out[i - 1];
    const hc = (o + h + l + c) / 4;
    const ho = prev ? (prev[0] + prev[3]) / 2 : (o + c) / 2;
    out.push([ho, Math.max(h, ho, hc), Math.min(l, ho, hc), hc]);
  });
  return out;
})();
const BAR_LO = Math.min(...BARS.map((b) => b[2]));
const BAR_HI = Math.max(...BARS.map((b) => b[1]));
const PANELS = ["LINE", "BAR", "CANDLESTICK", "HEIKIN-ASHI"] as const;

function charts(focus: number): FigureDraw {
  return (f) => {
    const { ctx, w, h, pal } = f;
    if (w < 100 || h < 60) return;
    const shown = Math.max(1, Math.ceil(sweep(f, 8, 3) * BARS.length));
    const gap = 12;
    const pw = (w - gap) / 2;
    const ph = (h - gap) / 2;
    PANELS.forEach((name, k) => {
      const x0 = (k % 2) * (pw + gap);
      const y0 = Math.floor(k / 2) * (ph + gap);
      const on = k === focus;
      ctx.globalAlpha = on ? 1 : 0.38;
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(on ? pal.accent : pal.line, 1);
      ctx.strokeRect(x0 + 0.5, y0 + 0.5, pw - 1, ph - 1);
      label(ctx, pal, name, x0 + 8, y0 + 11, "left", on ? pal.ink : pal.ink3);
      const bw = (pw - 16) / BARS.length;
      const X = (i: number) => x0 + 8 + (i + 0.5) * bw;
      const Y = (v: number) => lerp(y0 + ph - 8, y0 + 22, (v - BAR_LO) / (BAR_HI - BAR_LO));
      const data = k === 3 ? HEIKIN : BARS;
      if (k === 0) {
        ctx.beginPath();
        for (let i = 0; i < shown; i++) {
          if (i === 0) ctx.moveTo(X(i), Y(data[i]![3]));
          else ctx.lineTo(X(i), Y(data[i]![3]));
        }
        ctx.lineWidth = 1.7;
        ctx.lineJoin = "round";
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();
        return;
      }
      for (let i = 0; i < shown; i++) {
        const [o, hi, lo, c] = data[i]!;
        const up = c >= o;
        const colour = rgba(up ? pal.emerald : ALERT, 1);
        if (k === 1) {
          const t = Math.max(2, bw * 0.38);
          ctx.beginPath();
          ctx.moveTo(X(i), Y(hi));
          ctx.lineTo(X(i), Y(lo));
          ctx.moveTo(X(i) - t, Y(o));
          ctx.lineTo(X(i), Y(o));
          ctx.moveTo(X(i), Y(c));
          ctx.lineTo(X(i) + t, Y(c));
          ctx.lineWidth = 1.3;
          ctx.strokeStyle = rgba(pal.ink, 1);
          ctx.stroke();
          continue;
        }
        vline(ctx, X(i), Y(hi), Y(lo), colour);
        const bodyW = Math.max(2, bw * 0.62);
        const top = Y(Math.max(o, c));
        const tall = Math.max(1, Y(Math.min(o, c)) - top);
        // a period that closed higher is hollow; one that closed lower is filled
        ctx.fillStyle = up ? rgba(pal.surface, 1) : colour;
        ctx.fillRect(X(i) - bodyW / 2, top, bodyW, tall);
        ctx.lineWidth = 1;
        ctx.strokeStyle = colour;
        ctx.strokeRect(X(i) - bodyW / 2 + 0.5, top + 0.5, bodyW - 1, Math.max(0, tall - 1));
      }
    });
    ctx.globalAlpha = 1;
  };
}

/* ---------------------------------------------------------------------------
 * INSTRUMENT TYPES. The result of a trade as a share of the money put down,
 * against the move in the price. Three shapes: bought outright (one for one),
 * on margin (an example of 10%, so ten for one, and through the floor), and a
 * bought call option (a floor at the premium, an example of 4%).
 * ------------------------------------------------------------------------- */

const SHAPES = [(x: number) => x, (x: number) => x * 10, (x: number) => (Math.max(0, x) - 0.04) / 0.04] as const;
/** which shape each instrument takes, in the order of the page: spot, CFD, future, option, ETF, share */
const SHAPE_OF = [1, 1, 1, 2, 0, 0] as const;

function instruments(focus: number): FigureDraw {
  return (f) => {
    const { ctx, w, h, pal } = f;
    if (w < 100 || h < 60) return;
    const left = 12;
    const right = w - 12;
    const top = 14;
    const bottom = h - 14;
    const X = (x: number) => lerp(left, right, (x + 0.2) / 0.4);
    const Y = (y: number) => lerp(bottom, top, (y + 1.5) / 3);
    const mine = SHAPE_OF[clamp(focus, 0, 5)] ?? 0;

    // beyond the floor: more than was put down
    ctx.fillStyle = rgba(ALERT, 0.07);
    ctx.fillRect(left, Y(-1), right - left, bottom - Y(-1));
    hline(ctx, left, right, Y(0), rgba(pal.line, 1));
    vline(ctx, X(0), top, bottom, rgba(pal.line, 1));
    hline(ctx, left, right, Y(-1), rgba(ALERT, 0.8), [4, 4]);
    label(ctx, pal, "GAIN", left + 2, top + 5);
    label(ctx, pal, "PRICE FALLS", left + 2, Y(0) - 8);
    label(ctx, pal, "PRICE RISES", right - 2, Y(0) + 9, "right");
    label(ctx, pal, "ALL OF THE MONEY PUT DOWN", right - 2, Y(-1) - 8, "right");
    label(ctx, pal, "MORE THAN WAS PUT DOWN", right - 2, Y(-1.28), "right");

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();
    const trace = (fn: (x: number) => number, from = -0.2, to = 0.2) => {
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const x = lerp(from, to, i / 80);
        if (i === 0) ctx.moveTo(X(x), Y(fn(x)));
        else ctx.lineTo(X(x), Y(fn(x)));
      }
      ctx.stroke();
    };
    ctx.lineJoin = "round";
    SHAPES.forEach((fn, k) => {
      if (k === mine) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(pal.ink3, 0.45);
      trace(fn);
    });
    const fn = SHAPES[mine]!;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = rgba(pal.accent, 1);
    trace(fn);
    if (mine === 1) {
      ctx.strokeStyle = rgba(ALERT, 1);
      trace(fn, -0.2, -0.1);
    }
    ctx.restore();

    // a price that moves, and what the trade is worth as it does
    const x = f.still ? -0.1 : 0.16 * Math.sin(f.t * 0.7);
    const y = clamp(fn(x), -1.5, 1.5);
    vline(ctx, X(x), Y(0), Y(y), rgba(pal.ink3, 0.8), [2, 3]);
    dot(ctx, X(x), Y(y), 4.5, rgba(y < -1 ? ALERT : pal.ink, 1), rgba(pal.surface, 1));
  };
}

/* ---------------------------------------------------------------------------
 * TRADING STYLES. Three invented months, and how much of them one trade of
 * each style spans. A scalp would be too thin to see, so it is drawn wider
 * than it is, and the drawing says so.
 * ------------------------------------------------------------------------- */

const MONTHS = walk(77, 260, 0.02);
/** the share of the path one trade covers: minutes, one day of about 65, a week and a half, most of it */
const SPAN = [0.004, 1 / 65, 0.12, 0.72] as const;
const STYLE = ["A SCALP", "A DAY TRADE", "A SWING TRADE", "A POSITION TRADE"] as const;

function styles(focus: number): FigureDraw {
  return (f) => {
    const { ctx, w, h, pal } = f;
    if (w < 100 || h < 60) return;
    const k = clamp(focus, 0, 3);
    const left = 12;
    const right = w - 12;
    const top = 30;
    const bottom = h - 30;
    const X = (u: number) => lerp(left, right, u);
    const Y = (v: number) => lerp(bottom, top, v);
    const n = MONTHS.length;
    const path = (from: number, to: number) => {
      ctx.beginPath();
      const a = Math.max(0, Math.floor(from * (n - 1)));
      const b = Math.min(n - 1, Math.ceil(to * (n - 1)));
      for (let i = a; i <= b; i++) {
        if (i === a) ctx.moveTo(X(i / (n - 1)), Y(MONTHS[i]!));
        else ctx.lineTo(X(i / (n - 1)), Y(MONTHS[i]!));
      }
      ctx.stroke();
    };

    // thirteen weeks along the foot
    hline(ctx, left, right, bottom + 8, rgba(pal.line, 1));
    for (let i = 0; i <= 13; i++) vline(ctx, X(i / 13), bottom + 5, bottom + 11, rgba(pal.ink3, 0.6));
    label(ctx, pal, "THREE INVENTED MONTHS, IN WEEKS", left, h - 8);

    ctx.lineJoin = "round";
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = rgba(pal.ink3, 0.6);
    path(0, 1);

    const span = SPAN[k]!;
    const wide = Math.max(2, span * (right - left));
    const share = wide / (right - left);
    const centre = k === 3 || f.still ? 0.5 : 0.5 + (0.5 - share / 2 - 0.02) * Math.sin(f.t * 0.45);
    const a = centre - share / 2;
    const b = centre + share / 2;
    ctx.fillStyle = rgba(pal.accent, 0.13);
    ctx.fillRect(X(a), top - 6, wide, bottom - top + 12);
    vline(ctx, X(a), top - 6, bottom + 6, rgba(pal.accent, 1));
    vline(ctx, X(b), top - 6, bottom + 6, rgba(pal.accent, 1));
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = rgba(pal.accent, 1);
    path(a, b);
    if (k === 3 && !f.still) {
      // the long hold: time passing inside it
      const u = lerp(a, b, (f.t * 0.12) % 1);
      const i = Math.round(u * (n - 1));
      dot(ctx, X(i / (n - 1)), Y(MONTHS[i]!), 3.5, rgba(pal.ink, 1));
    }
    const text = k === 0 ? "A SCALP, DRAWN WIDER THAN IT IS" : STYLE[k]!;
    ctx.font = `600 10px ${pal.font}`;
    const half = ctx.measureText(text).width / 2;
    label(ctx, pal, text, clamp(X(centre), left + half, right - half), 12, "center", pal.ink);
  };
}

/* ---------------------------------------------------------------------------
 * WAYS TO PAY. One invented trade, opened, held for three nights and closed.
 * Above: the two prices, far apart or close together. Below: the cost so far,
 * which steps up when each charge arrives. The three totals are drawn equal
 * on purpose: the drawing is about when, not about how much.
 * ------------------------------------------------------------------------- */

const OPEN = 0.12;
const CLOSE = 0.9;
const NIGHTS = [0.32, 0.52, 0.72] as const;
type Step = { x: number; d: number; text: string };
const CHARGES: readonly (readonly Step[])[] = [
  [{ x: OPEN, d: 0.6, text: "SPREAD" }],
  [
    { x: OPEN, d: 0.2, text: "SPREAD" },
    { x: OPEN, d: 0.2, text: "COMMISSION" },
    { x: CLOSE, d: 0.2, text: "COMMISSION" },
  ],
  NIGHTS.map((x) => ({ x, d: 0.2, text: "SWAP" })),
];

function costs(focus: number): FigureDraw {
  return (f) => {
    const { ctx, w, h, pal } = f;
    if (w < 100 || h < 60) return;
    const k = clamp(focus, 0, 2);
    const p = sweep(f);
    const left = 12;
    const right = w - 12;
    const X = (u: number) => lerp(left, right, u);
    const pTop = 26;
    const pBot = h * 0.5;
    const cTop = h * 0.62;
    const cBot = h - 12;
    const mid = (u: number) => 0.5 + 0.2 * Math.sin(u * 7) + 0.07 * Math.sin(u * 17 + 1);
    const half = k === 0 ? 0.2 : k === 1 ? 0.06 : 0.12;
    const Yp = (v: number) => lerp(pBot, pTop, v);
    const Yc = (v: number) => lerp(cBot, cTop + 22, v / 0.6);
    /** an upright rule that leaves the band of the two captions clear */
    const rule = (u: number, colour: string, dash: number[] = []) => {
      vline(ctx, X(u), pTop - 6, pBot, colour, dash);
      vline(ctx, X(u), cTop + 14, cBot, colour, dash);
    };

    // the nights, and the trade's own two moments
    NIGHTS.forEach((u) => {
      rule(u, rgba(pal.ink3, k === 2 ? 0.9 : 0.35), [3, 4]);
      label(ctx, pal, "NIGHT", X(u), 9, "center", k === 2 ? pal.ink : pal.ink3);
    });
    label(ctx, pal, "OPEN", X(OPEN), 9, "center", pal.ink);
    label(ctx, pal, "CLOSE", X(CLOSE), 9, "center", pal.ink);
    rule(OPEN, rgba(pal.ink2, 0.7));
    rule(CLOSE, rgba(pal.ink2, 0.7));

    // the two prices, and the gap between them
    const edge = (sign: number) => {
      for (let i = 0; i <= 90; i++) {
        const u = sign > 0 ? i / 90 : 1 - i / 90;
        const y = Yp(clamp(mid(u) * 0.6 + 0.2 + sign * half));
        if (i === 0 && sign > 0) ctx.moveTo(X(u), y);
        else ctx.lineTo(X(u), y);
      }
    };
    ctx.beginPath();
    edge(1);
    edge(-1);
    ctx.closePath();
    ctx.fillStyle = rgba(pal.accent, k === 2 ? 0.07 : 0.16);
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = rgba(pal.accent, k === 2 ? 0.5 : 1);
    ctx.stroke();
    label(ctx, pal, "PRICE TO BUY AT, AND TO SELL AT", left, pBot + 9);

    // the cost so far
    label(ctx, pal, "COST SO FAR", left, cTop + 4, "left", pal.ink);
    hline(ctx, left, right, Yc(0), rgba(pal.line, 1));
    let sum = 0;
    ctx.beginPath();
    ctx.moveTo(X(0), Yc(0));
    for (const s of CHARGES[k]!) {
      if (s.x > p) break;
      ctx.lineTo(X(s.x), Yc(sum));
      ctx.lineTo(X(s.x), Yc(sum + s.d));
      sum += s.d;
    }
    ctx.lineTo(X(p), Yc(sum));
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "miter";
    ctx.strokeStyle = rgba(AMBER, 1);
    ctx.stroke();
    let at = 0;
    for (const s of CHARGES[k]!) {
      if (s.x > p) break;
      const late = s.x > 0.75;
      label(ctx, pal, s.text, X(s.x) + (late ? -6 : 6), Yc(at + s.d / 2), late ? "right" : "left", pal.ink);
      at += s.d;
    }
    if (p < 1) rule(p, rgba(pal.ink, 0.5));
  };
}

/* ---------------------------------------------------------------------------
 * ANALYSIS. One invented path, and what each method lays beside it: the
 * price's own average and a level (technical), an estimate of value that
 * moves only on new data (fundamental), a gauge of the crowd (sentiment).
 * ------------------------------------------------------------------------- */

const PRICES = walk(404, 120, 0.015);
const AVERAGE = PRICES.map((_, i) => {
  const from = Math.max(0, i - 11);
  let s = 0;
  for (let j = from; j <= i; j++) s += PRICES[j]!;
  return s / (i - from + 1);
});
/** a level the path turned at: its lowest point in the middle half */
const LEVEL = Math.min(...PRICES.slice(30, 90));
/** the invented estimate: the average of each quarter of the path, nudged, and changed only at the quarter's start */
const VALUE = [0, 30, 60, 90].map((from, q) => {
  const part = PRICES.slice(from, from + 30);
  return clamp(part.reduce((s, v) => s + v, 0) / part.length + [0.12, 0.08, -0.06, 0.1][q]!, 0.04, 0.96);
});
const CROWD = (() => {
  const r = seeded(909);
  return Array.from({ length: 30 }, (_, i) => clamp(0.5 + 0.3 * Math.sin(i * 0.45 + 0.6) + (r() - 0.5) * 0.16, 0.08, 0.92));
})();

function analysis(focus: number): FigureDraw {
  return (f) => {
    const { ctx, w, h, pal } = f;
    if (w < 100 || h < 60) return;
    const p = sweep(f);
    const n = PRICES.length;
    const upto = Math.max(1, Math.round(p * (n - 1)));
    const left = 12;
    const right = w - 12;
    const top = 20;
    const bottom = focus === 2 ? h * 0.6 : h - 16;
    const X = (i: number) => lerp(left, right, i / (n - 1));
    const Y = (v: number) => lerp(bottom, top, v);
    const line = (series: readonly number[], colour: string, width: number, from = 0) => {
      ctx.beginPath();
      for (let i = from; i <= upto; i++) {
        if (i === from) ctx.moveTo(X(i), Y(series[i]!));
        else ctx.lineTo(X(i), Y(series[i]!));
      }
      ctx.lineWidth = width;
      ctx.lineJoin = "round";
      ctx.strokeStyle = colour;
      ctx.stroke();
    };

    if (focus === 0) {
      hline(ctx, left, right, Y(LEVEL), rgba(pal.ink3, 0.8), [5, 5]);
      label(ctx, pal, "A LEVEL IT TURNED AT", right, Y(LEVEL) + 9, "right");
    }
    if (focus === 1) {
      ctx.beginPath();
      VALUE.forEach((v, q) => {
        const from = q * 30;
        if (from > upto) return;
        const to = Math.min(upto, q === 3 ? n - 1 : from + 30);
        if (q === 0) ctx.moveTo(X(from), Y(v));
        else ctx.lineTo(X(from), Y(v));
        ctx.lineTo(X(to), Y(v));
      });
      ctx.lineWidth = 2;
      ctx.lineJoin = "miter";
      ctx.strokeStyle = rgba(pal.gold, 1);
      ctx.stroke();
      [30, 60, 90].forEach((i) => {
        if (i > upto) return;
        vline(ctx, X(i), top - 4, bottom, rgba(pal.ink3, 0.6), [2, 4]);
        label(ctx, pal, "DATA", X(i), 9, "center");
      });
      label(ctx, pal, "ESTIMATE OF VALUE", left, Y(VALUE[0]!) - 9, "left", pal.ink);
    }

    line(PRICES, rgba(pal.accent, 1), 1.8);
    if (focus === 0) {
      line(AVERAGE, rgba(pal.gold, 1), 1.6, 11);
      label(ctx, pal, "PRICE, AND ITS OWN AVERAGE", left, 9, "left", pal.ink);
    }

    if (focus === 2) {
      const sTop = h * 0.7;
      const sBot = h - 12;
      const half = (sTop + sBot) / 2;
      label(ctx, pal, "PRICE", left, 9, "left", pal.ink);
      label(ctx, pal, "SHARE OF THE CROWD POSITIONED FOR A RISE", left, sTop - 9, "left", pal.ink);
      hline(ctx, left, right, half, rgba(pal.ink3, 0.8), [3, 3]);
      label(ctx, pal, "HALF", right, half - 8, "right");
      const bw = (right - left) / CROWD.length;
      CROWD.forEach((v, i) => {
        if ((i + 1) * 4 > upto + 4) return;
        const y = lerp(sBot, sTop, v);
        ctx.fillStyle = rgba(v >= 0.5 ? pal.teal : pal.ink3, 0.85);
        ctx.fillRect(left + i * bw + 1, Math.min(y, half), Math.max(1, bw - 2), Math.abs(half - y));
      });
    }
    if (p < 1) dot(ctx, X(upto), Y(PRICES[upto]!), 3, rgba(pal.ink, 1));
  };
}

const DRAWINGS: Record<string, (focus: number) => FigureDraw> = {
  "order-types": orders,
  "instrument-types": instruments,
  "trading-styles": styles,
  "chart-types": charts,
  "ways-to-pay-for-trading": costs,
  "analysis-types": analysis,
};

/** the drawing for a comparison, with one of its items chosen; undefined when a comparison has none */
export const drawingFor = (slug: string, focus: number): FigureDraw | undefined => DRAWINGS[slug]?.(focus);
export const hasDrawing = (slug: string) => slug in DRAWINGS;
