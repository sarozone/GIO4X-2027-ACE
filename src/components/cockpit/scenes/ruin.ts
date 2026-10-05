/**
 * RUIN — a level, and the paths that come down to it.
 *
 * One point at the left is where an account starts. From it a sheaf of fine
 * paths opens out, to the right and into the depth: the same trades in a
 * different order each time, a win a little up and a loss a little down. Under
 * them lies a sheet of glass, in champagne: the level the page asks about. A
 * path that comes down to the glass stops on it, and a mark is left where it
 * touched; what it would have gone on to do is only a ghost under the sheet.
 * The paths that never reach it run on to the right-hand side.
 *
 * At the right stands a column of pips, one for every path. As many of them
 * are filled, from the foot up, as there are paths that ended. Raise the glass
 * and the column fills; lower it and it empties. A bracket at the left spans
 * the distance from the start down to the level.
 *
 * The orders are drawn from the page's own noise. No path is an account, the
 * column is a count of drawn lines and not a chance, and there is no axis and
 * no figure: the page below works the chance out from the visitor's own
 * numbers, and says how rough that is.
 *
 * The pointer: the glass follows it up and down.
 */
import { TAU, clamp, lerp, rgba, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, trace } from "../kit";

/** trades in a path */
const K = 30;
const W = K + 1;
/** where every path starts and where the last trade ends */
const [X0, Y0, XE] = [-1.5, 0.3, 1.25];
/** the size of one step, how far the best paths can climb and how low the worst are drawn */
const [STEP, CEIL, DEEP] = [0.11, 0.72, -1];
/** the glass: its lowest and highest place, and half its depth */
const [LOW, HIGH, ZP] = [-0.85, 0, 0.55];
/** how far the sheaf opens into the depth */
const FAN = 0.9;
/** the column of pips: where it stands, its foot and its head */
const [TX, T0, T1] = [1.5, -0.72, 0.66];
/** seconds for a point of light to run a path */
const RUN = 9;

type State = {
  n: number;
  /** the height of every path after every trade, and how deep each lies */
  y: Float32Array;
  z: Float32Array;
  /** projected points, refreshed every frame */
  sx: Float32Array;
  sy: Float32Array;
  /** the trade at which each path touches the glass; K when it never does */
  hit: Float32Array;
  /** where the glass is, and how many pips are filled */
  floor: number;
  ended: number;
  phase: number;
};

const fract = (v: number) => v - Math.floor(v);

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    const n = f.mobile ? 22 : 40;
    const y = new Float32Array(n * W);
    const z = new Float32Array(n);
    for (let j = 0; j < n; j++) {
      // each path has its own small edge, for or against; one is given a poor one, so that the glass is never bare
      const p = j === 1 ? 0.22 : 0.4 + f.rnd(j * 7 + 3) * 0.2;
      let v = 0;
      y[j * W] = Y0;
      for (let k = 1; k <= K; k++) {
        const size = STEP * (0.6 + 0.8 * f.rnd(300 + j * 37 + k));
        v += f.rnd(100 + j * 31 + k) < p ? size : -size;
        // the climb is eased so that no path leaves the frame
        y[j * W + k] = v >= 0 ? Y0 + CEIL * (1 - Math.exp(-v / CEIL)) : Math.max(DEEP, Y0 + v);
      }
      z[j] = (f.rnd(j + 500) - 0.5) * FAN;
    }
    return { n, y, z, sx: new Float32Array(n * W), sy: new Float32Array(n * W), hit: new Float32Array(n), floor: -0.42, ended: n * 0.25, phase: f.rnd(9) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.2 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.04), -0.2, 6.4, 1);

    deck(f, { y: DEEP - 0.12, alpha: 0.09 });
    pool(f, [0, DEEP - 0.12, 0], 2.6, pal.key, 0.18 * f.boot);

    const n = Math.max(12, Math.min(s.n, Math.round(s.n * (0.4 + 0.6 * f.q))));
    // the sheaf opens from the starting point as the scene powers on
    const open = f.on(0.1, 0.8);

    // ── the glass: it rises and sinks slowly, and under the pointer it is held where the pointer is
    let want = f.still ? -0.42 : lerp(LOW, HIGH, 0.5 + 0.5 * Math.sin(t * 0.13 + s.phase));
    const lo = f.P(0, LOW, 0);
    const hi = f.P(0, HIGH, 0);
    if (lo && hi && Math.abs(hi.y - lo.y) > 1) want = lerp(want, lerp(LOW, HIGH, clamp((f.my - lo.y) / (hi.y - lo.y))), f.hover);
    s.floor = f.still ? want : s.floor + (want - s.floor) * (1 - Math.exp(-f.dt * 5));
    const floor = s.floor;

    // ── where every path is on screen, and where it touches the glass
    let ended = 0;
    for (let j = 0; j < n; j++) {
      const o = j * W;
      s.hit[j] = K;
      for (let k = 0; k <= K; k++) {
        const p = f.P(X0 + ((XE - X0) * k * open) / K, lerp(Y0, s.y[o + k], open), (s.z[j] * k * open) / K);
        if (p) {
          s.sx[o + k] = p.x;
          s.sy[o + k] = p.y;
        }
        if (k && s.hit[j] === K && s.y[o + k] <= floor) {
          const fall = s.y[o + k - 1] - s.y[o + k];
          s.hit[j] = k - 1 + (fall > 1e-6 ? clamp((s.y[o + k - 1] - floor) / fall) : 1);
          ended++;
        }
      }
    }
    s.ended = f.still ? ended : s.ended + (ended - s.ended) * (1 - Math.exp(-f.dt * 6));
    /** a place part of the way along path j, on screen */
    const along = (j: number, at: number): [number, number] => {
      const k = Math.min(K - 1, Math.floor(at));
      const o = j * W + k;
      return [lerp(s.sx[o], s.sx[o + 1], at - k), lerp(s.sy[o], s.sy[o + 1], at - k)];
    };

    // ── the level every path started from, and the sheet of glass under them
    const sheet = f.on(0, 0.4);
    f.line([X0, Y0, 0], [XE, Y0, 0], pal.ink, 0.08 * sheet, 1);
    const [g0, g1] = [X0 - 0.1, XE + 0.1];
    const glass: V3[] = [[g0, floor, -ZP], [g1, floor, -ZP], [g1, floor, ZP], [g0, floor, ZP]];
    f.fill(glass, pal.gold, (0.07 + 0.04 * f.hover) * sheet);
    for (let x = g0 + 0.3; x < g1 - 0.05; x += m ? 0.6 : 0.3) f.line([x, floor, -ZP], [x, floor, ZP], pal.gold, 0.1 * sheet, 1);
    f.path(glass, pal.gold, 0.35 * sheet, 1, true);
    trace(f, [[g0, floor, -ZP], [g1, floor, -ZP]], pal.gold, 0.9 * sheet, 1.5, f.still ? -1 : t / 9);
    // the distance from the start down to it
    f.line([g0, Y0, 0], [g0, floor, 0], pal.gold, 0.85 * sheet, 1.5);
    for (const y of [Y0, floor]) f.line([g0 - 0.05, y, 0], [g0 + 0.05, y, 0], pal.gold, 0.85 * sheet, 1.4);

    // ── the sheaf: a path runs as far as the glass and no further
    const rings = !m && f.q > 0.7;
    ctx.lineWidth = 1;
    for (let j = 0; j < n; j++) {
      const o = j * W;
      const out = s.hit[j] < K;
      // the paths at the front of the sheaf are a little stronger
      const depth = 0.75 + 0.5 * (0.5 - s.z[j] / FAN);
      const last = Math.floor(s.hit[j]);
      const [ex, ey] = out ? along(j, s.hit[j]) : [s.sx[o + K], s.sy[o + K]];
      ctx.beginPath();
      ctx.moveTo(s.sx[o], s.sy[o]);
      for (let k = 1; k <= Math.min(K, last); k++) ctx.lineTo(s.sx[o + k], s.sy[o + k]);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = rgba(out ? pal.crimson : pal.key, (out ? 0.45 : 0.3) * depth * open);
      ctx.stroke();
      if (out) {
        // what it would have gone on to do, under the sheet
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        for (let k = last + 1; k <= K; k++) ctx.lineTo(s.sx[o + k], s.sy[o + k]);
        ctx.strokeStyle = rgba(pal.ink, 0.07 * open);
        ctx.stroke();
        // and the mark where it touched
        const at = s.hit[j] / K;
        const mark: V3 = [X0 + (XE - X0) * at, floor, s.z[j] * at];
        if (rings) ring(f, mark, 0.045, { colour: pal.crimson, alpha: 0.4 * open, seg: 14 });
      }
      ctx.beginPath();
      ctx.arc(ex, ey, out ? 2.4 : 1.5, 0, TAU);
      ctx.fillStyle = rgba(out ? pal.crimson : pal.key, (out ? 0.95 : 0.6) * open);
      ctx.fill();
    }

    // ── points of light run a few of the paths: one that meets the glass goes out there
    if (!f.still) {
      for (let i = 0; i < (m ? 2 : 3); i++) {
        const turn = t / RUN + i / 3 + s.phase;
        const j = (i * 7 + Math.floor(turn) * 5) % n;
        const at = fract(turn) * K;
        const stop = Math.min(at, s.hit[j]);
        const a = Math.sin(Math.PI * fract(turn)) * clamp(1 - (at - stop) / 2) * open;
        if (a <= 0.02) continue;
        const [x, y] = along(j, Math.min(stop, K - 0.001));
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, TAU);
        ctx.fillStyle = rgba(pal.key, 0.22 * a);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, TAU);
        ctx.fillStyle = rgba(pal.ink, 0.95 * a);
        ctx.fill();
      }
    }
    lamp(f, [X0, Y0, 0], pal.ink, f.on(0, 0.3), 0.02);

    // ── the column: one pip for every path, filled for each that ended
    const column = f.on(0.6, 0.3);
    f.line([TX, T0 - 0.05, 0], [TX, T1 + 0.05, 0], pal.ink, 0.14 * column, 1);
    for (let i = 0; i < n; i++) {
      const p: V3 = [TX, lerp(T0, T1, i / (n - 1)), 0];
      const full = clamp(s.ended - i);
      f.dot(p, 0.011, pal.key, 0.4 * (1 - full) * column);
      f.dot(p, 0.014, pal.crimson, 0.95 * full * column);
    }
    const brim = lerp(T0, T1, clamp((s.ended - 0.5) / (n - 1)));
    f.line([TX - 0.07, brim, 0], [TX - 0.03, brim, 0], pal.crimson, 0.8 * column * clamp(s.ended), 1.4);

    // ── the names
    const named = f.on(0.85, 0.15);
    const size = m ? 8 : 10;
    ctx.save();
    ctx.letterSpacing = m ? "1px" : "1.5px";
    f.label("START", [X0 - 0.05, Y0, 0], { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: -13 });
    f.label("LEVEL", [X0, floor, -ZP], { size, colour: pal.gold, alpha: 0.95 * named, dy: -8 });
    f.label("ENDED", [TX, T0 - 0.05, 0], { align: "center", size, colour: pal.crimson, alpha: 0.9 * named, dy: 13 });
    ctx.restore();
  },
};

export default scene;
