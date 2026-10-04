/**
 * RISKROOM — the same start, many ways it can go.
 *
 * One point at the left is where every account begins. From it a fan of paths
 * opens to the right: the same number of trades each, a win a step up and a
 * loss a step down, in a different order every time. Most of them wander. Some
 * come down to the floor line, and a path that reaches the floor stops there:
 * it has nothing left to go on with.
 *
 * In front of the fan a row of beads on a wire spells out one path, trade by
 * trade: a win is a filled bead riding above the wire, a loss an open one
 * hanging under it. The path being read is the champagne one, and the reading
 * moves from path to path in turn.
 *
 * The pointer: the path nearest to it becomes the one that is read, and its
 * beads are laid out at once.
 *
 * The orders are drawn from the page's own noise. No path is an account, and
 * nothing here is a probability or a figure.
 */
import { TAU, clamp, lerp, rgba, type Frame, type Scene } from "../engine";
import { lamp } from "../kit";

/** trades in a path, and the run of net losses that reaches the floor */
const [K, RUIN] = [14, 6];
/** where every path starts, the width of one trade, the height of one step */
const [X0, Y0, DX, STEP] = [-1.3, 0.22, 2.8 / K, 0.14];
/** where the last trade ends */
const XE = X0 + K * DX;
/** how far the best paths can climb: the climb is eased so that none leaves the frame */
const CEIL = 0.82;
const FLOOR = Y0 - RUIN * STEP;
/** the wire the beads sit on */
const WIRE = -1.02;
/** seconds one path is read for */
const READ = 6;

type State = {
  /** paths, and for each: net steps after every trade, whether each trade won, how many trades it lasted */
  n: number;
  net: Int8Array;
  win: Uint8Array;
  len: Uint8Array;
  /** projected points, refreshed every frame */
  sx: Float32Array;
  sy: Float32Array;
  /** how much each path is lit, and what each bead shows (1 a win, -1 a loss, 0 nothing yet) */
  lit: Float32Array;
  bead: Float32Array;
  /** the path shown in the still frame: one that reached the floor */
  pick: number;
  phase: number;
};

const height = (net: number) => Y0 + (net >= 0 ? CEIL * (1 - Math.exp((-net * STEP) / CEIL)) : net * STEP);

function circle(f: Frame, x: number, y: number, z: number, r: number, colour: string, alpha: number, fillAlpha: number): void {
  const p = f.P(x, y, z);
  if (!p) return;
  const { ctx } = f;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(1, r * p.s * f.u), 0, TAU);
  if (fillAlpha > 0.003) {
    ctx.fillStyle = rgba(colour, fillAlpha);
    ctx.fill();
  }
  if (alpha > 0.003) {
    ctx.strokeStyle = rgba(colour, alpha);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

const scene: Scene<State> = {
  pose: 12,
  setup(f) {
    const n = f.mobile ? 14 : 26;
    const net = new Int8Array(n * (K + 1));
    const win = new Uint8Array(n * K);
    const len = new Uint8Array(n);
    let pick = -1;
    for (let j = 0; j < n; j++) {
      // each path has its own small edge, for or against; one is given a poor one so the floor is always shown
      const p = j === 2 ? 0.2 : 0.4 + f.rnd(j * 7 + 3) * 0.22;
      let at = 0;
      let end = K;
      for (let k = 0; k < K; k++) {
        if (end === K) {
          const w = f.rnd(100 + j * 31 + k) < p;
          win[j * K + k] = w ? 1 : 0;
          at += w ? 1 : -1;
          if (at <= -RUIN) end = k + 1;
        }
        net[j * (K + 1) + k + 1] = at;
      }
      len[j] = end;
      if (pick < 0 && end < K) pick = j;
    }
    return {
      n,
      net,
      win,
      len,
      sx: new Float32Array(n * (K + 1)),
      sy: new Float32Array(n * (K + 1)),
      lit: new Float32Array(n),
      bead: new Float32Array(K),
      pick: Math.max(0, pick),
      phase: f.rnd(9) * 6.28,
    };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.15 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.04), -0.08, 6.4, 1);

    const n = Math.max(10, Math.min(s.n, Math.round(s.n * (0.4 + 0.6 * f.q))));
    // the fan opens from the starting point as the scene powers on
    const open = f.on(0.1, 0.8);
    const W = K + 1;

    // ── where every path is on screen
    for (let j = 0; j < n; j++) {
      const zj = (j / (s.n - 1) - 0.5) * 0.7;
      for (let k = 0; k <= s.len[j]; k++) {
        const p = f.P(X0 + k * DX * open, lerp(Y0, height(s.net[j * W + k]), open), (zj * k * open) / K);
        if (!p) continue;
        s.sx[j * W + k] = p.x;
        s.sy[j * W + k] = p.y;
      }
    }

    // ── which path is read: each in turn, or the one nearest the pointer
    let sel = Math.min(n - 1, f.still ? s.pick : (Math.floor(t / READ) + Math.floor(s.phase)) % n);
    if (f.hover > 0.05) {
      let best = Infinity;
      for (let j = 0; j < n; j++) {
        for (let k = 1; k <= s.len[j]; k++) {
          const d = (s.sx[j * W + k] - f.mx) ** 2 + (s.sy[j * W + k] - f.my) ** 2;
          if (d < best) {
            best = d;
            sel = j;
          }
        }
      }
    }
    const ease = f.still ? 1 : 1 - Math.exp(-f.dt * 7);
    for (let j = 0; j < n; j++) s.lit[j] += ((j === sel ? 1 : 0) - s.lit[j]) * ease;
    // how far along the path the reading has got
    const span = s.len[sel];
    const reach = f.still ? span : lerp(clamp(((t % READ) / READ) / 0.7) * span, span, f.hover);

    // ── the floor: a line, hatched beneath as ground is
    const fl = f.on(0, 0.4);
    f.line([X0 - 0.1, FLOOR, 0], [XE + 0.1, FLOOR, 0], pal.crimson, 0.14 * fl, 5);
    f.line([X0 - 0.1, FLOOR, 0], [XE + 0.1, FLOOR, 0], pal.crimson, 0.8 * fl, 1.25);
    for (let x = X0; x <= XE + 0.05; x += m ? 0.3 : 0.15) f.line([x, FLOOR, 0], [x - 0.05, FLOOR - 0.065, 0], pal.crimson, 0.3 * fl, 1);
    // the level every path started from
    f.line([X0, Y0, 0], [XE, Y0, 0], pal.ink, 0.07 * fl, 1);

    // ── the fan: the paths that are not being read
    const run = (j: number, to: number) => {
      const end = Math.min(s.len[j], Math.floor(to));
      ctx.beginPath();
      ctx.moveTo(s.sx[j * W], s.sy[j * W]);
      for (let k = 1; k <= end; k++) ctx.lineTo(s.sx[j * W + k], s.sy[j * W + k]);
      const k = to - end;
      if (k > 0.001 && end < s.len[j]) {
        ctx.lineTo(lerp(s.sx[j * W + end], s.sx[j * W + end + 1], k), lerp(s.sy[j * W + end], s.sy[j * W + end + 1], k));
      }
    };
    ctx.lineWidth = 1;
    for (let j = 0; j < n; j++) {
      const out = s.len[j] < K;
      const dim = 1 - 0.6 * s.lit[j];
      run(j, K);
      ctx.strokeStyle = rgba(out ? pal.crimson : pal.key, (out ? 0.5 : 0.3) * open * dim);
      ctx.stroke();
      const e = j * W + s.len[j];
      ctx.beginPath();
      ctx.arc(s.sx[e], s.sy[e], out ? 2.6 : 1.6, 0, TAU);
      ctx.fillStyle = rgba(out ? pal.crimson : pal.key, (out ? 0.95 : 0.6) * open);
      ctx.fill();
    }

    // ── the one being read, in champagne, as far as the reading has got
    for (let j = 0; j < n; j++) {
      const a = s.lit[j] * open;
      if (a <= 0.02) continue;
      run(j, j === sel ? reach : s.len[j]);
      ctx.strokeStyle = rgba(pal.gold, 0.16 * a);
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.gold, 0.95 * a);
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    // ── the beads: the path that is read, one trade at a time
    const wire = f.on(0.5, 0.4);
    f.line([X0 - 0.05, WIRE, 0], [XE + 0.05, WIRE, 0], pal.ink, 0.3 * wire, 1);
    for (const x of [X0 - 0.05, XE + 0.05]) f.line([x, WIRE - 0.07, 0], [x, WIRE + 0.07, 0], pal.ink, 0.45 * wire, 1.5);
    for (let k = 0; k < K; k++) {
      const want = k < span && k < reach - 0.001 ? (s.win[sel * K + k] ? 1 : -1) : 0;
      s.bead[k] += (want - s.bead[k]) * ease;
      const v = s.bead[k];
      const x = X0 + (k + 0.5) * DX;
      const y = WIRE + v * 0.06;
      // the empty seat, then the bead in it: a win filled and above the wire, a loss open and under it
      circle(f, x, WIRE, 0, 0.03, pal.ink, 0.26 * wire * (1 - Math.abs(v)), 0);
      if (v > 0.02) {
        circle(f, x, y, 0, 0.062, pal.emerald, 0.9 * v * wire, 0.85 * v * wire);
        f.dot([x - 0.018, y + 0.02, 0], 0.014, pal.ink, 0.5 * v * wire);
      } else if (v < -0.02) {
        circle(f, x, y, 0, 0.062, pal.bg, 0, 0.9 * -v * wire);
        circle(f, x, y, 0, 0.062, pal.crimson, 0.95 * -v * wire, 0.14 * -v * wire);
      }
    }

    // where the reading is: a light on the path, and a fine line down to its bead
    if (!f.still && reach < span - 0.001 && reach > 0.001) {
      const i = Math.floor(reach);
      const k = reach - i;
      const hx = lerp(s.sx[sel * W + i], s.sx[sel * W + i + 1], k);
      const hy = lerp(s.sy[sel * W + i], s.sy[sel * W + i + 1], k);
      const foot = f.P(X0 + reach * DX, WIRE, 0);
      if (foot) {
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx, foot.y);
        ctx.strokeStyle = rgba(pal.gold, 0.22 * open * (1 - f.hover));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(hx, hy, 2.4, 0, TAU);
      ctx.fillStyle = rgba(pal.ink, 0.95 * open);
      ctx.fill();
    }

    // the one starting point
    lamp(f, [X0, Y0, 0], pal.gold, f.on(0, 0.3), 0.02);

    const named = f.on(0.85, 0.15);
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("START", [X0, Y0, 0], { align: "right", size, colour: pal.gold, alpha: 0.95 * named, dx: -10 });
    f.label("FLOOR", [XE + 0.1, FLOOR, 0], { align: "right", size, colour: pal.crimson, alpha: 0.95 * named, dy: m ? 14 : 19 });
    ctx.restore();
  },
};

export default scene;
