/**
 * FAULTCODES — what the terminal said, in plain words.
 *
 * Along the top runs a terminal's status rail: a bar with a row of small lamps,
 * one for each kind of answer a trade request can come back with. One lamp at
 * a time is read. Its message lifts out of the rail as a small coded chip, a
 * pattern of blocks that means nothing to the eye, rides the bus under the
 * rail and drops into the reading head, where a graduated ring turns over it.
 * From there a trace carries it to the plate below, and on the plate it is
 * set out plainly: the chip itself, then a title, a few lines of explanation
 * and, at the foot, the line that says what to do next.
 *
 * The pointer picks the lamp that is read: the one above or below it.
 *
 * The chip is blocks and the plate is strokes. No code number is drawn and no
 * lamp reports anything: the real codes and their meanings are on the page.
 */
import { clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { deck, lamp, panel, pool, ring, slab, trace } from "../kit";

const FLOOR = -1.2;
/** the rail: its two ends, its underside and its top, half its depth */
const [RX, R0, R1, RD] = [1.55, 0.76, 0.9, 0.05];
/** the bus under the rail, and how far in front of the rail a chip rides it */
const [BUS, OUT] = [0.44, -0.24];
/** the reading head: where it stands, its height, the radius of its ring */
const [HX, HY, HR] = [-1.08, -0.4, 0.34];
/** the plate: its centre, its width and its height */
const PLATE: V3 = [0.52, -0.46, 0];
const [PW, PH] = [1.86, 1.02];
/** a chip: half its width and height, and its cells */
const [CW, CH, COLS, ROWS] = [0.15, 0.09, 4, 2];
/** seconds one message takes, from the lamp to the last line */
const CYCLE = 10;

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** which cells of lamp `i`'s chip are filled: its pattern, and nothing more */
const cell = (f: Frame, i: number, k: number) => f.rnd(i * 17 + k + 300) > 0.42 || k === (i * 3) % (COLS * ROWS);

/** a chip standing square to the viewer at `c`: a small plate and its blocks, `shown` of them lit */
function chip(f: Frame, c: V3, i: number, k: number, colour: string, alpha: number, shown = 1): void {
  if (alpha <= 0.003) return;
  const { pal } = f;
  const [x, y, z] = c;
  const w = CW * k;
  const h = CH * k;
  const quad: V3[] = [[x - w, y - h, z], [x + w, y - h, z], [x + w, y + h, z], [x - w, y + h, z]];
  f.fill(quad, pal.bg, 0.9 * alpha);
  f.fill(quad, colour, 0.08 * alpha);
  f.path(quad, colour, 0.75 * alpha, 1, true);
  const cw = (w * 2 * 0.86) / COLS;
  const ch = (h * 2 * 0.8) / ROWS;
  for (let n = 0; n < COLS * ROWS; n++) {
    if (!cell(f, i, n)) continue;
    const x0 = x - w * 0.86 + (n % COLS) * cw;
    const y0 = y + h * 0.8 - (Math.floor(n / COLS) + 1) * ch;
    // the reading head lights the blocks one after another
    const read = clamp(shown * COLS * ROWS - n);
    f.fill([[x0 + cw * 0.14, y0 + ch * 0.16, z], [x0 + cw * 0.86, y0 + ch * 0.16, z], [x0 + cw * 0.86, y0 + ch * 0.84, z], [x0 + cw * 0.14, y0 + ch * 0.84, z]], colour, (0.3 + 0.6 * read) * alpha);
  }
}

type State = { sel: number; t0: number; spin: number };

const scene: Scene<State> = {
  pose: 9,
  setup(f) {
    return { sel: f.mobile ? 2 : 3, t0: 0, spin: 0.3 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    // a single composed frame (reduced motion, or the engine measuring the drawing): the message stands fully read
    const composed = f.still || f.dt === 0;
    f.aim(-0.17 + (f.still ? 0 : Math.sin(f.t * 0.07) * 0.035), -0.1, 6.3, m ? 0.92 : 0.96);

    const count = m ? 6 : 9;
    const lampX = (i: number) => lerp(-RX + 0.22, RX - 0.22, i / (count - 1));
    const tones = [pal.teal, pal.indigo, pal.crimson];

    // ── which lamp is read: the one in line with the pointer, or the next in turn
    if (!composed) {
      if (f.t < s.t0) s.t0 = f.t;
      let pick = -1;
      if (f.hover > 0.4) {
        let best = Infinity;
        for (let i = 0; i < count; i++) {
          const p = f.P(lampX(i), R0, 0);
          const d = p ? Math.abs(p.x - f.mx) : Infinity;
          if (d < best) {
            best = d;
            pick = i;
          }
        }
      }
      if (pick >= 0 && pick !== s.sel) {
        s.sel = pick;
        s.t0 = f.t;
      } else if (pick >= 0) {
        // held under the pointer: the clock stops just short of the end, so the message leaves gently afterwards
        s.t0 = Math.max(s.t0, f.t - CYCLE * 0.9);
      } else if (f.t - s.t0 > CYCLE) {
        // (five places on is a different neighbourhood each time, and reaches every lamp)
        s.sel = (s.sel + 5) % count;
        s.t0 = f.t;
      }
    }
    const sel = s.sel % count;
    // under the pointer a message that has been read stays on the plate
    const u = composed ? 0.9 : clamp((f.t - s.t0) / CYCLE);
    const fresh = composed ? 1 : ease((f.t - s.t0) / 0.6);
    const leaving = composed ? 0 : ease((u - 0.94) / 0.06);
    const lift = ease(u / 0.12);
    const ride = ease((u - 0.12) / 0.22);
    const decode = ease((u - 0.34) / 0.16);
    const written = clamp((u - 0.5) / 0.34);
    const tone = tones[sel % 3];
    const x0 = lampX(sel);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [PLATE[0], FLOOR, 0], 2.2, pal.key, 0.2 * f.boot);

    // ── the rail: a machined bar, a lamp and an engraved legend for each kind of answer
    const railOn = f.on(0, 0.4);
    slab(f, [-RX, R0, -RD], [RX, R1, RD], pal.ink, 0.1, railOn);
    const mid = (R0 + R1) / 2;
    const pitch = (2 * RX - 0.44) / (count - 1);
    for (let i = 0; i < count; i++) {
      const x = lampX(i);
      const on = f.on(0.1 + (i / count) * 0.4, 0.3);
      const is = i === sel ? fresh * (1 - leaving) : 0;
      const at: V3 = [x - pitch * 0.3, mid, -RD];
      const touch = f.near(at, 46);
      if (is > 0.02) lamp(f, at, pal.gold, is * on, 0.02);
      else lamp(f, at, tones[i % 3], (0.32 + 0.5 * touch) * on, 0.014);
      f.line([x - pitch * 0.14, mid, -RD], [x - pitch * 0.14 + pitch * (0.24 + 0.24 * f.rnd(i + 80)), mid, -RD], is > 0.5 ? pal.ink : pal.ink2, (0.4 + 0.5 * Math.max(is, touch)) * on, 1.2);
      // its tap on the bus
      f.line([x, R0, 0], [x, BUS, 0], pal.ink, (0.14 + 0.3 * is) * on, 1);
      f.dot([x, BUS, 0], 0.012, i === sel ? pal.gold : pal.ink, (0.4 + 0.5 * is) * on);
    }
    f.line([-RX, BUS, 0], [RX, BUS, 0], pal.ink, 0.3 * railOn, 1);
    f.line([HX, BUS, 0], [HX, HY + HR, 0], pal.ink, 0.3 * railOn, 1);

    // ── the reading head: a cradle for the chip on a post, and a graduated ring that turns as it reads
    const headOn = f.on(0.3, 0.4);
    const reading = decode * (1 - decode) * 4;
    if (!composed) s.spin += f.dt * (0.06 + 1.1 * reading);
    const head: V3 = [HX, HY, 0];
    pool(f, [HX, FLOOR, 0], 0.7, tone, (0.12 + 0.2 * reading) * headOn);
    f.line([HX, FLOOR, 0], [HX, HY - HR, 0], pal.ink, 0.3 * headOn, 1.5);
    ring(f, [HX, FLOOR, 0], 0.2, { axis: "y", colour: pal.ink, alpha: 0.28 * headOn, seg: 28 });
    ring(f, head, HR, { axis: "z", colour: pal.ink, alpha: 0.34 * headOn, ticks: m ? 24 : 36, major: 6, tickLen: 0.045, rot: s.spin });
    ring(f, head, HR * 0.8, { axis: "z", colour: tone, alpha: (0.4 + 0.5 * reading) * headOn, from: 0.05, to: 0.4, width: 1.5, rot: -s.spin * 1.6 });
    ring(f, head, HR * 0.8, { axis: "z", colour: pal.key, alpha: 0.4 * headOn, from: 0.55, to: 0.9, width: 1.5, rot: -s.spin * 1.6 });
    // the cradle: four corner marks the chip sits between
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      const cx = HX + sx * CW * 1.25;
      const cy = HY + sy * CH * 1.4;
      f.path([[cx - sx * 0.05, cy, 0], [cx, cy, 0], [cx, cy - sy * 0.04, 0]], pal.ink, 0.5 * headOn, 1);
    }

    // ── the plate the message is set out on
    const plateOn = f.on(0.4, 0.45);
    const pa = panel(f, PLATE, PW, PH, { tilt: 0.12, colour: pal.key, alpha: 0.5, on: plateOn, header: true });
    const link: V3[] = [[HX + HR, HY, 0], [lerp(HX + HR, PLATE[0] - PW / 2, 0.5), HY, 0], pa.at(0, 0.5)];
    const sending = u > 0.34 && u < 0.86 && !composed;
    trace(f, link, tone, (0.35 + 0.4 * decode * (1 - leaving)) * plateOn, 1.1, sending ? f.t / 2.4 : -1);
    f.dot(pa.at(0, 0.5), 0.014, tone, 0.8 * plateOn);

    // ── the chip: out of the rail, along the bus, down into the head
    const from: V3 = [x0 - pitch * 0.3, mid, -RD - 0.01];
    const out: V3 = [x0, BUS, OUT];
    const over: V3 = [HX, BUS, OUT];
    const seat: V3 = [HX, HY, -0.02];
    const half = ride * 2;
    const at: V3 =
      lift < 1
        ? [lerp(from[0], out[0], lift), lerp(from[1], out[1], lift), lerp(from[2], out[2], lift)]
        : half < 1
          ? [lerp(out[0], over[0], ease(half)), BUS, OUT]
          : [HX, lerp(over[1], seat[1], ease(half - 1)), lerp(over[2], seat[2], ease(half - 1))];
    const chipOn = fresh * (1 - leaving) * f.on(0.5, 0.4);
    if (ride < 1 && !composed) f.glow(at, 0.2, tone, 0.35 * chipOn);
    chip(f, at, sel, lerp(0.45, 1, lift), tone, chipOn, decode);

    // ── the same message in plain words: the chip, what it is called, what it means, what to do
    const ink = fresh * (1 - leaving) * pa.on;
    if (ink > 0.01) {
      const steps = 6;
      const p = written * steps;
      let pen: V3 | null = null;
      /** one stroke, set left to right in its turn */
      const bar = (u0: number, v: number, len: number, order: number, colour: string, alpha: number, width: number) => {
        const d = clamp(p - order);
        if (d <= 0) return;
        f.line(pa.at(u0, v, 0.01), pa.at(u0 + len * d, v, 0.01), colour, alpha * ink, width);
        if (d < 1) pen = pa.at(u0 + len * d, v, 0.012);
      };
      // the chip, carried over as it was
      const copy = pa.at(0.14, 0.62, 0.012);
      chip(f, copy, sel, 0.92, tone, ink * clamp(p * 2));
      // "means": a chevron between the code and the words
      const say = clamp(p * 2 - 0.6) * ink;
      f.path([pa.at(0.27, 0.67, 0.01), pa.at(0.295, 0.62, 0.01), pa.at(0.27, 0.57, 0.01)], pal.ink, 0.7 * say, 1.25);
      bar(0.34, 0.7, 0.36, 0.6, pal.gold, 0.95, 2.6);
      bar(0.34, 0.6, 0.6, 1.3, pal.ink, 0.2, 1);
      const rows = m ? 2 : 3;
      for (let r = 0; r < rows; r++) bar(0.34, 0.49 - r * 0.1, 0.6 * (0.6 + 0.4 * f.rnd(sel * 9 + r + 120)), 2 + r * 0.7, pal.ink2, 0.75, 1.4);
      // what to do next: a mark, and one line in the key light
      const todo = clamp(p - 4.4) * ink;
      f.dot(pa.at(0.08, 0.14, 0.01), 0.022, pal.key, 0.9 * todo);
      f.path([pa.at(0.12, 0.18, 0.01), pa.at(0.14, 0.14, 0.01), pa.at(0.12, 0.1, 0.01)], pal.key, 0.9 * todo, 1.25);
      bar(0.18, 0.14, 0.5 + 0.2 * f.rnd(sel + 200), 4.6, pal.key, 0.9, 1.8);
      f.line(pa.at(0.05, 0.26, 0.01), pa.at(0.95, 0.26, 0.01), pal.ink, 0.14 * clamp(p - 4) * ink, 1);
      if (pen && !composed) {
        f.glow(pen, 0.15, pal.key, 0.7 * ink);
        f.dot(pen, 0.011, pal.ink, 0.95 * ink);
      }
    }
  },
};

export default scene;
