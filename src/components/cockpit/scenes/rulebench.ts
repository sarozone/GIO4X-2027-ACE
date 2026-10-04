/**
 * RULEBENCH — a rule put together from parts, and tried.
 *
 * Four machined blocks slot into a rail at the foot of the bench: ENTRY, STOP,
 * TARGET, RISK. Together they are the rule. Above them it is tried on a price
 * that was made up for the purpose: a line with a quick average and a slow one
 * over it. Where the quick one crosses up through the slow one the rule goes
 * in (a champagne mark under the line), where it crosses back the rule comes
 * out (an open mark over it); each trade carries its stop beneath and its
 * target above. In the lower pane the account that followed the rule is drawn
 * as the test runs: flat while the rule is out, moving with the price while
 * it is in. Then the test is run again.
 *
 * The pointer: the block under it lifts out of the rail and lights, and so
 * does the part of the test that block is responsible for. ENTRY lights the
 * marks, STOP and TARGET their lines, RISK the distance from each entry down
 * to its stop and the account below.
 *
 * The price is invented (a few slow waves and the page's own noise). Nothing
 * here is a market, a result or a figure.
 */
import { clamp, type Frame, type Scene, type V3 } from "../engine";
import { eyeX, lamp, panel, slab, type Panel } from "../kit";
import { smooth } from "./_stage";

/** samples in the invented price */
const N = 96;
/** the two averages: the quick one and the slow one */
const [FAST, SLOW] = [5, 14];
/** seconds for one run of the test, and the share of it spent drawing */
const [LOOP, RUN] = [26, 0.7];
/** how far under an entry its stop stands and how far over it its target, as a share of the pane's height */
const [STOP, TARGET] = [0.13, 0.16];
const NAMES = ["ENTRY", "STOP", "TARGET", "RISK"];
/** the rail: its top, and the blocks that stand in it (left edge of the first, width, gap, height, half depth) */
const RAIL = -0.94;
const [BX, BW, GAP, BH, BD] = [-1.39, 0.62, 0.1, 0.25, 0.13];

type Trade = { a: number; b: number };
type State = { price: Float32Array; fast: Float32Array; slow: Float32Array; eq: Float32Array; trades: Trade[]; lift: Float32Array; phase: number };

/** a series drawn across a pane from its left edge as far as `head` (a sample index, fractional) */
function plot(f: Frame, p: Panel, ys: Float32Array, head: number, stride: number, colour: string, alpha: number, width: number, base = -1): void {
  if (alpha <= 0.003 || head <= 0) return;
  const { ctx } = f;
  const last = Math.min(N - 1, Math.floor(head));
  const k = Math.min(1, head - last);
  const end = last < N - 1 ? ys[last] + (ys[last + 1] - ys[last]) * k : ys[last];
  const go = (u: number, v: number, pen: boolean): boolean => {
    const w = p.at(u, v);
    const q = f.P(w[0], w[1], w[2]);
    if (!q) return pen;
    if (pen) ctx.lineTo(q.x, q.y);
    else ctx.moveTo(q.x, q.y);
    return true;
  };
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= last; i += stride) pen = go(i / (N - 1), ys[i], pen);
  pen = go(Math.min(1, head / (N - 1)), end, pen);
  if (base >= 0) {
    // the area between the series and the foot of the pane
    pen = go(Math.min(1, head / (N - 1)), base, pen);
    go(0, base, pen);
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  ctx.strokeStyle = colour;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

const scene: Scene<State> = {
  pose: 21,
  setup(f) {
    // the invented price: three slow waves, a drift and the page's own noise
    const raw = new Float32Array(N);
    const [p0, p1, p2] = [f.rnd(1) * 6.28, f.rnd(2) * 6.28, f.rnd(3) * 6.28];
    let walk = 0;
    for (let i = 0; i < N; i++) {
      walk += (f.rnd(40 + i) - 0.5) * 0.11;
      raw[i] = 0.5 * Math.sin(i * 0.16 + p0) + 0.2 * Math.sin(i * 0.41 + p1) + 0.08 * Math.sin(i * 0.97 + p2) + walk + i * 0.004;
    }
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < N; i++) {
      lo = Math.min(lo, raw[i]);
      hi = Math.max(hi, raw[i]);
    }
    const span = hi - lo || 1;
    const price = new Float32Array(N);
    for (let i = 0; i < N; i++) price[i] = 0.2 + (0.6 * (raw[i] - lo)) / span;
    const mean = (n: number): Float32Array => {
      const out = new Float32Array(N);
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += price[i];
        if (i >= n) sum -= price[i - n];
        out[i] = sum / Math.min(i + 1, n);
      }
      return out;
    };
    const fast = mean(FAST);
    const slow = mean(SLOW);
    // the rule: in when the quick average crosses up through the slow one, out when it crosses back
    const trades: Trade[] = [];
    const eqRaw = new Float32Array(N);
    let open = -1;
    for (let i = 1; i < N; i++) {
      eqRaw[i] = eqRaw[i - 1] + (open >= 0 ? price[i] - price[i - 1] : 0);
      if (i < SLOW) continue;
      const up = fast[i] > slow[i];
      const was = fast[i - 1] > slow[i - 1];
      if (up && !was && open < 0) open = i;
      else if (!up && was && open >= 0) {
        trades.push({ a: open, b: i });
        open = -1;
      }
    }
    if (open >= 0 && open < N - 2) trades.push({ a: open, b: N - 1 });
    let elo = Infinity;
    let ehi = -Infinity;
    for (let i = 0; i < N; i++) {
      elo = Math.min(elo, eqRaw[i]);
      ehi = Math.max(ehi, eqRaw[i]);
    }
    const espan = ehi - elo || 1;
    const eq = new Float32Array(N);
    for (let i = 0; i < N; i++) eq[i] = 0.2 + (0.6 * (eqRaw[i] - elo)) / espan;
    return { price, fast, slow, eq, trades, lift: new Float32Array(4), phase: f.rnd(5) * 6.28 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.12 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.04), -0.1, 6.4, 1);

    // ── the run: the test is drawn from the left, held, and begun again
    const ph = f.still ? 0.8 : (t % LOOP) / LOOP;
    const head = clamp(ph / RUN) * (N - 1);
    const ink = f.still ? 1 : 1 - smooth((ph - 0.94) / 0.06);
    const running = !f.still && head < N - 1;
    const stride = m || f.q < 0.75 ? 2 : 1;

    // ── which block the pointer is on
    const xOf = (i: number) => BX + i * (BW + GAP);
    for (let i = 0; i < 4; i++) s.lift[i] = f.near([xOf(i) + BW / 2, RAIL + BH / 2, -BD], m ? 46 : 78);
    const [kEntry, kStop, kTarget, kRisk] = [s.lift[0], s.lift[1], s.lift[2], s.lift[3]];

    // ── the two panes: the price above, the account beneath
    const top = panel(f, [0, 0.53, 0.14], 3.1, 1.0, { on: f.on(0, 0.4), colour: pal.key, alpha: 0.45 });
    const low = panel(f, [0, -0.33, 0.14], 3.1, 0.42, { on: f.on(0.15, 0.4), colour: pal.gold, alpha: 0.4 });
    const a = top.on * ink;
    const b = low.on * ink;
    for (const v of [0.25, 0.5, 0.75]) f.line(top.at(0.015, v), top.at(0.985, v), pal.ink, 0.055 * top.on, 1);
    f.line(low.at(0.015, 0.2), low.at(0.985, 0.2), pal.ink, 0.1 * low.on, 1);

    // the account, under the price it followed
    plot(f, low, s.eq, head, stride, pal.gold, (0.1 + 0.16 * kRisk) * b, 1, 0.06);
    plot(f, low, s.eq, head, stride, pal.gold, 0.22 * b, 5);
    plot(f, low, s.eq, head, stride, pal.gold, 0.95 * b, 1.5 + kRisk);

    // each trade's stop and target, then the price and its two averages over them
    for (const tr of s.trades) {
      if (tr.a > head) continue;
      const u0 = tr.a / (N - 1);
      const u1 = Math.min(tr.b, head) / (N - 1);
      const v = s.price[tr.a];
      const vs = Math.max(0.04, v - STOP);
      const vt = Math.min(0.96, v + TARGET);
      f.line(top.at(u0, vs), top.at(u1, vs), pal.crimson, (0.4 + 0.6 * kStop) * a, 1 + kStop);
      f.line(top.at(u0, vt), top.at(u1, vt), pal.emerald, (0.4 + 0.6 * kTarget) * a, 1 + kTarget);
      f.fill([top.at(u0, vs), top.at(u1, vs), top.at(u1, vt), top.at(u0, vt)], pal.ink, 0.03 * a);
      // the risk: from the entry down to its stop
      if (kRisk > 0.01) f.line(top.at(u0, v), top.at(u0, vs), pal.gold, 0.95 * kRisk * a, 2.5);
    }
    plot(f, top, s.slow, head, stride, pal.indigo, 0.8 * a, 1.25);
    plot(f, top, s.fast, head, stride, pal.key, 0.85 * a, 1.25);
    plot(f, top, s.price, head, stride, pal.ink, 0.16 * a, 4.5);
    plot(f, top, s.price, head, stride, pal.ink, 0.92 * a, 1.4);

    // the marks: in (filled, under the line) and out (open, over it)
    const g = 1 + 0.5 * kEntry;
    for (const tr of s.trades) {
      if (tr.a > head) continue;
      const u0 = tr.a / (N - 1);
      const v0 = s.price[tr.a];
      const inMark: V3[] = [top.at(u0, v0 - 0.035), top.at(u0 - 0.011 * g, v0 - 0.035 - 0.055 * g), top.at(u0 + 0.011 * g, v0 - 0.035 - 0.055 * g)];
      f.fill(inMark, pal.gold, (0.8 + 0.2 * kEntry) * a);
      if (kEntry > 0.01) f.glow(top.at(u0, v0 - 0.06), 0.16, pal.gold, 0.5 * kEntry * a);
      if (tr.b > head) continue;
      const u1 = tr.b / (N - 1);
      const v1 = s.price[tr.b];
      const outMark: V3[] = [top.at(u1, v1 + 0.035), top.at(u1 - 0.011 * g, v1 + 0.035 + 0.055 * g), top.at(u1 + 0.011 * g, v1 + 0.035 + 0.055 * g)];
      f.fill(outMark, pal.bg, 0.9 * a);
      f.path(outMark, kEntry > 0.5 ? pal.gold : pal.ink, (0.75 + 0.25 * kEntry) * a, 1.25, true);
    }

    // the test's own cursor: where it has got to, in both panes
    if (running) {
      const u = head / (N - 1);
      const i = Math.floor(head);
      const v = s.price[i] + (s.price[Math.min(N - 1, i + 1)] - s.price[i]) * (head - i);
      f.line(top.at(u, 0.03), top.at(u, 0.97), pal.gold, 0.32 * a, 1);
      f.line(low.at(u, 0.06), low.at(u, 0.94), pal.gold, 0.32 * b, 1);
      lamp(f, top.at(u, v), pal.ink, 0.8 * a, 0.012);
    }

    const size = m ? 8 : 10;
    ctx.save();
    ctx.letterSpacing = m ? "0.5px" : "1.5px";
    if (!m) {
      f.label("PRICE", top.at(0.018, 0.93), { size: 9, colour: pal.ink2, alpha: 0.6 * top.on });
      f.label("ACCOUNT", low.at(0.018, 0.82), { size: 9, colour: pal.gold, alpha: 0.75 * low.on });
    }

    // ── the rail, its four seats, and the blocks standing in them (the one farthest from the eye first)
    const railOn = f.on(0.3, 0.35);
    slab(f, [-1.52, RAIL - 0.1, -0.19], [1.52, RAIL, 0.19], pal.ink, 0.07, railOn);
    for (let i = 0; i < 4; i++) {
      const x = xOf(i);
      f.fill([[x, RAIL, -BD], [x + BW, RAIL, -BD], [x + BW, RAIL, BD], [x, RAIL, BD]], pal.gold, (0.1 + 0.2 * s.lift[i]) * railOn);
    }
    const eye = eyeX(f);
    const first = eye > 0 ? 0 : 3;
    for (let n = 0; n < 4; n++) {
      const i = first === 0 ? n : 3 - n;
      const on = f.on(0.45 + i * 0.1, 0.3);
      if (on <= 0.003) continue;
      const k = s.lift[i];
      const x = xOf(i);
      // powering on, a block comes down into its seat; under the pointer it is lifted out of it
      const y = RAIL + (1 - on) * 0.3 + k * 0.11;
      slab(f, [x, y, -BD], [x + BW, y + BH, BD], pal.key, 0.15 + 0.05 * k, on);
      const face: V3[] = [[x, y, -BD], [x + BW, y, -BD], [x + BW, y + BH, -BD], [x, y + BH, -BD]];
      f.fill(face, pal.gold, 0.16 * k * on);
      f.path(face, pal.gold, 0.95 * k * on, 1.5, true);
      f.line([x + 0.05, y + BH, -BD], [x + BW - 0.05, y + BH, -BD], pal.ink, 0.3 * on, 1);
      f.label(NAMES[i], [x + BW / 2, y + BH / 2, -BD], { align: "center", size, colour: k > 0.5 ? pal.gold : pal.ink, alpha: (0.82 + 0.18 * k) * on });
    }
    ctx.restore();
  },
};

export default scene;
