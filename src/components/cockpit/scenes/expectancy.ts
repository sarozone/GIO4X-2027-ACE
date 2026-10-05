/**
 * EXPECTANCY — many small results, and what they come to.
 *
 * Tokens fall from a hopper, one after another: the trades. A wedge under it
 * sends each to one side, and it bounces down a short run of pegs into one of
 * two pans. A win is a filled token and goes to the left; a loss is an open
 * one and goes to the right. The pans hang from one beam, so the two heaps are
 * weighed against each other all the time, and the beam does not answer any
 * single token: it leans slowly toward the side that has more in it and comes
 * to rest there. The needle over the pivot, in champagne, shows that lean. It
 * is the average of all of them, which is the page's subject.
 *
 * A win is drawn larger than a loss, because here the average win is the
 * larger of the two. That is why the beam can lean to the wins while there are
 * fewer of them, and it is the whole of the formula: how often, times how much,
 * on each side.
 *
 * No token has a value, the split is nobody's win rate and the needle's scale
 * has tick marks only. An average of results says nothing about the next one.
 *
 * The pointer: across the frame it moves the share of wins. Toward the wins'
 * pan more tokens are sent there, toward the losses' pan fewer, and the beam
 * finds its new rest.
 */
import { TAU, clamp, lerp, rgba, type Frame, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, slab, trace } from "../kit";

const FLOOR = -1.15;
/** the balance: the height of its pivot, half its beam, how far the pans hang under it, their radius */
const [PIVOT, ARM, HANG, PAN] = [-0.05, 1, 0.5, 0.32];
/** the hopper's rim and its mouth, the wedge's point and its foot */
const [RIM, MOUTH, APEX, FOOT] = [1.2, 1.04, 0.78, 0.7];
/** where the run of pegs lets a token go, on either side */
const [QX, QY] = [0.72, 0.36];
/** a token: its radius as a win and as a loss, and how much each weighs on the beam */
const [RW, RL, WIN, LOSS] = [0.052, 0.04, 1.7, 1];
/** the share of wins: its least and its most */
const [LEAST, MOST] = [0.15, 0.85];
/** seconds one token is on its way, and how far the beam and the needle can lean */
const [TRIP, LEAN] = [8, 0.2];
/** a heap: its rows, from the pan up */
const ROWS = [4, 3, 2, 1] as const;
const HEAP = 10;
/** tokens in front of the balance, clear of the beam */
const ZT = -0.07;

type State = {
  count: number;
  /** which side each token was sent to when it left the hopper, and where it was on the last frame */
  win: Uint8Array;
  last: Float32Array;
  /** the share of wins, and the lean of the beam */
  p: number;
  tilt: number;
  phase: number;
};

const smooth = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};
const fract = (v: number) => v - Math.floor(v);
/** where the beam comes to rest for a share of wins */
const rest = (p: number) => clamp((p * WIN - (1 - p) * LOSS) * 0.26, -LEAN, LEAN);
/** the share at which token j changes sides: spread evenly, so the split on screen is the share itself */
const threshold = (j: number, count: number) => (((j * 5 + 2) % count) + 0.5) / count;

/** a token: filled for a win, open for a loss */
function token(f: Frame, p3: V3, win: boolean, alpha: number): void {
  if (alpha <= 0.01) return;
  if (win) {
    f.dot(p3, RW, f.pal.key, 0.9 * alpha);
    f.dot(p3, RW * 0.4, f.pal.ink, 0.5 * alpha);
    return;
  }
  const p = f.P(p3[0], p3[1], p3[2]);
  if (!p) return;
  const { ctx } = f;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(1.5, RL * p.s * f.u), 0, TAU);
  ctx.fillStyle = rgba(f.pal.bg, 0.85 * alpha);
  ctx.fill();
  ctx.strokeStyle = rgba(f.pal.crimson, 0.95 * alpha);
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

const scene: Scene<State> = {
  pose: 11,
  setup(f) {
    const count = f.mobile ? 9 : 14;
    const win = new Uint8Array(count);
    for (let j = 0; j < count; j++) win[j] = threshold(j, count) < 0.5 ? 1 : 0;
    return { count, win, last: new Float32Array(count), p: 0.5, tilt: rest(0.5), phase: f.rnd(6) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.1 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.035), -0.1, 6.4, 1);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.4, pal.key, 0.2 * f.boot);

    // ── the share of wins: it drifts slowly, and under the pointer it is set by hand
    const auto = 0.5 + 0.3 * Math.sin(t * 0.1 + s.phase);
    const held = lerp(MOST, LEAST, clamp((f.mx - f.box.x) / f.box.w));
    const want = clamp(lerp(auto, held, smooth(f.hover)), LEAST, MOST);
    s.p = f.still ? 0.5 : s.p + (want - s.p) * (1 - Math.exp(-f.dt * 3));
    // ── the beam goes to its rest slowly: it weighs all of them, not the last one
    s.tilt = f.still ? rest(s.p) : s.tilt + (rest(s.p) - s.tilt) * (1 - Math.exp(-f.dt * 1.1));
    const a = s.tilt + (f.still ? 0 : 0.004 * Math.sin(t * 0.8));
    const [ca, sa] = [Math.cos(a), Math.sin(a)];

    /** the end of the beam on a side (-1 the wins, 1 the losses), and the pan under it */
    const endX = (side: number) => side * ARM * ca;
    const endY = (side: number) => PIVOT + side * ARM * sa;
    const panY = (side: number) => endY(side) - HANG;
    /** how much lies in a heap, 0 to HEAP, and the top of it */
    const amount = (side: number) => HEAP * clamp((side < 0 ? s.p : 1 - s.p) / MOST);
    const heapTop = (side: number) => {
      const r = side < 0 ? RW : RL;
      const n = clamp(amount(side), 0, HEAP - 0.01);
      const row = n < 4 ? 0 : n < 7 ? 1 : n < 9 ? 2 : 3;
      return panY(side) + 0.012 + r * (2.2 + row * 1.8);
    };

    // ── the stand, and the scale the needle is read against
    const stand = f.on(0, 0.3);
    slab(f, [-0.24, FLOOR, -0.14], [0.24, FLOOR + 0.07, 0.14], pal.ink, 0.08, stand);
    f.line([0, FLOOR + 0.07, 0], [0, PIVOT - 0.18, 0], pal.ink, 0.5 * stand, 1.5);
    const prop: V3[] = [[-0.09, PIVOT - 0.18, 0], [0.09, PIVOT - 0.18, 0], [0, PIVOT, 0]];
    f.fill(prop, pal.bg, 0.9 * stand);
    f.fill(prop, pal.key, 0.14 * stand);
    f.path(prop, pal.key, 0.6 * stand, 1, true);
    const dial = f.on(0.3, 0.3);
    ring(f, [0, PIVOT, 0], 0.4, { axis: "z", from: 0.25 - 0.046, to: 0.25 + 0.046, colour: pal.ink, alpha: 0.3 * dial });
    for (let i = -4; i <= 4; i++) {
      const b = Math.PI / 2 + i * 0.07;
      const len = i === 0 ? 0.08 : i % 2 ? 0.03 : 0.05;
      f.line([Math.cos(b) * 0.4, PIVOT + Math.sin(b) * 0.4, 0], [Math.cos(b) * (0.4 + len), PIVOT + Math.sin(b) * (0.4 + len), 0], i ? pal.ink : pal.gold, (i ? 0.4 : 0.9) * dial, 1);
    }

    // ── the hopper, the wedge that splits the stream, and the rail under it: how much goes to each side
    const head = f.on(0.15, 0.3);
    for (const side of [-1, 1]) {
      f.path([[side * 0.22, RIM, 0], [side * 0.05, MOUTH + 0.04, 0], [side * 0.05, MOUTH - 0.03, 0]], pal.ink, 0.6 * head, 1.25);
    }
    f.line([-0.22, RIM, 0], [0.22, RIM, 0], pal.key, 0.7 * head, 1.25);
    const share = (s.p - LEAST) / (MOST - LEAST);
    const wedgeX = lerp(-0.03, 0.03, share);
    const wedge: V3[] = [[wedgeX - 0.08, FOOT, 0], [wedgeX + 0.08, FOOT, 0], [wedgeX, APEX, 0]];
    f.fill(wedge, pal.bg, 0.9 * head);
    f.fill(wedge, pal.ink, 0.1 * head);
    f.path(wedge, pal.ink, 0.6 * head, 1, true);
    const split = lerp(-0.45, 0.45, s.p);
    f.line([-0.45, FOOT, 0.08], [split, FOOT, 0.08], pal.key, 0.8 * head, 1.75);
    f.line([split, FOOT, 0.08], [0.45, FOOT, 0.08], pal.crimson, 0.7 * head, 1.75);
    f.line([split, FOOT - 0.04, 0.08], [split, FOOT + 0.04, 0.08], pal.gold, 0.95 * head, 1.5);

    // ── the pegs a token bounces down, and a fainter row under them
    const pegs = f.on(0.3, 0.4);
    for (const side of [-1, 1]) {
      for (let i = 1; i <= 3; i++) {
        const k = i / 3;
        f.dot([side * lerp(0.04, QX, k), lerp(APEX, QY, k) - 0.07, ZT], 0.014, pal.ink, 0.6 * pegs);
        if (f.q > 0.6 && i < 3) f.dot([side * lerp(0.04, QX, k + 1 / 6), lerp(APEX, QY, k + 1 / 6) - 0.21, ZT], 0.01, pal.ink, 0.25 * pegs);
      }
    }

    // ── the beam, its needle and the two pans
    const beam = f.on(0.2, 0.35);
    const ends: V3[] = [[endX(-1), endY(-1), 0], [endX(1), endY(1), 0]];
    f.line(ends[0], ends[1], pal.ink, 0.12 * beam, 6);
    f.line(ends[0], ends[1], pal.ink, 0.85 * beam, 1.8);
    // (the needle is geared, so that a small lean of the beam can be read)
    const lean = a * 1.4;
    const tip: V3 = [-Math.sin(lean) * 0.39, PIVOT + Math.cos(lean) * 0.39, 0];
    trace(f, [[0, PIVOT, 0], tip], pal.gold, 0.9 * beam, 1.5);
    lamp(f, tip, pal.gold, beam, 0.017);
    f.dot([0, PIVOT, 0], 0.03, pal.ink, 0.9 * beam);
    const seg = Math.max(12, Math.round(24 * f.q));
    for (const side of [-1, 1]) {
      const win = side < 0;
      const colour = win ? pal.key : pal.crimson;
      const [x, y] = [endX(side), panY(side)];
      const touch = f.near([x, y + 0.12, 0], m ? 50 : 80);
      f.dot(ends[win ? 0 : 1], 0.02, pal.ink, 0.8 * beam);
      for (const e of [-1, 1]) f.line(ends[win ? 0 : 1], [x + e * PAN * 0.86, y, 0], pal.ink, 0.35 * beam, 1);
      const dish: V3[] = [];
      for (let i = 0; i < seg; i++) dish.push([x + Math.cos((i / seg) * TAU) * PAN, y, Math.sin((i / seg) * TAU) * PAN * 0.8]);
      f.fill(dish, pal.bg, 0.75 * beam);
      f.fill(dish, colour, (0.1 + 0.12 * touch) * beam);
      f.path(dish, colour, (0.65 + 0.3 * touch) * beam, 1.25, true);

      // its heap: as many tokens as the share sends here
      const r = win ? RW : RL;
      const n = amount(side);
      let slot = 0;
      for (let row = 0; row < ROWS.length; row++) {
        for (let c = 0; c < ROWS[row]; c++, slot++) {
          token(f, [x + (c - (ROWS[row] - 1) / 2) * r * 2.1, y + 0.012 + r * (1 + row * 1.8), ZT], win, clamp(n - slot) * beam);
        }
      }
    }

    // ── the stream: each token falls to the wedge, is sent to a side, bounces down the pegs and drops into its pan
    const stream = f.on(0.5, 0.4);
    for (let j = 0; j < s.count; j++) {
      const life = fract(t / TRIP + j / s.count);
      // the side is chosen as the token leaves the hopper, and it keeps to it
      if (life < s.last[j]) s.win[j] = threshold(j, s.count) < s.p ? 1 : 0;
      s.last[j] = life;
      const win = s.win[j] === 1;
      const side = win ? -1 : 1;
      const landX = endX(side) + (f.rnd(j + 70) - 0.5) * 0.22;
      const landY = heapTop(side);
      let [x, y] = [landX, landY];
      if (life < 0.14) {
        const k = life / 0.14;
        [x, y] = [0, lerp(MOUTH, APEX + 0.02, k * k)];
      } else if (life < 0.58) {
        const k = (life - 0.14) / 0.44;
        [x, y] = [side * lerp(0.04, QX, k), lerp(APEX + 0.02, QY, k) + 0.05 * Math.abs(Math.sin(k * Math.PI * 3))];
      } else if (life < 0.84) {
        const k = (life - 0.58) / 0.26;
        [x, y] = [lerp(side * QX, landX, k), lerp(QY, landY, k * k)];
      }
      // it comes out of the hopper's shade, and once it has landed it is one of the heap
      token(f, [x, y, ZT], win, smooth(life / 0.05) * (1 - smooth((life - 0.86) / 0.14)) * stream);
    }

    // ── the names
    const named = f.on(0.85, 0.15);
    const size = m ? 8 : 10;
    ctx.save();
    ctx.letterSpacing = m ? "1px" : "1.5px";
    f.label("WINS", [endX(-1), panY(-1), 0], { align: "center", size, colour: pal.key, alpha: 0.95 * named, dy: 14 });
    f.label("LOSSES", [endX(1), panY(1), 0], { align: "center", size, colour: pal.crimson, alpha: 0.95 * named, dy: 14 });
    f.label("AVERAGE", [0, PIVOT + 0.48, 0], { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: -9 });
    ctx.restore();
  },
};

export default scene;
