/**
 * DAILY — today's edition comes together.
 *
 * One market, one story, every day. So the instrument is the edition itself.
 * On the left a small globe of market centres turns; from its nodes threads
 * run to a sheet standing in front of the visitor, and as each thread lights,
 * the part of the page it feeds is set: the masthead, the headline, a small
 * figure that draws itself, two columns of text. When the page is whole it
 * lifts, turns and settles behind as yesterday's, the older editions each
 * step one place further into the depth and fade, and a clean sheet stands in
 * for tomorrow. Over it all is the arc of the week, with today lit from the
 * visitor's own clock.
 *
 * The pointer is a reader's hand. The stack fans wider, the sheet under it
 * comes forward and its lines light, the node under it brightens with its
 * thread, and the week turns toward the hand.
 *
 * Lines of text are strokes and the figure on each sheet is an invented shape
 * with no scale, no symbol and no number. Nothing here can be read or dated,
 * except the day of the week, which is simply true. On a post's own page the
 * headline of today's sheet is the one set in champagne.
 */
import { clamp, hash, lerp, rgba, type Frame, type Scene, type V3 } from "../engine";
import { arc, deck, lamp, orb, pool, ring, ringPoint, trace } from "../kit";

const DEG = Math.PI / 180;
/** seconds one edition stands in front: it is set, read, then turned */
const CYCLE = 16;
/** the sheet, world units */
const SW = 1.3;
const SH = 1.7;
/** where today's sheet stands, and how far each older one steps to the right */
const X0 = 0.3;
const Y0 = -0.05;
const STEP = 0.3;
const TILT = -0.07;
/** lifts are remembered for this many editions (more than are ever on stage) */
const RING = 8;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
/** the globe and the market centres on it (latitude, longitude) */
const GLOBE: V3 = [-1.38, 0.12, 0.2];
const GR = 0.34;
const NODES: [number, number][] = [
  [38, -30],
  [-12, 55],
  [48, 130],
  [-28, 205],
  [14, 285],
];
/** where each thread meets the sheet's left edge, and the stroke it feeds */
const FEEDS: [v: number, order: number][] = [
  [0.91, 0],
  [0.77, 1],
  [0.5, 3.2],
  [0.27, 5],
  [0.12, 6.5],
];
/** the week's arc: its centre, radius and the turn of Monday and of each further day */
const WEEK: V3 = [X0, -0.3, 0.7];
const WR = 1.6;
const dayTurn = (i: number) => 0.385 - i * 0.045;

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
const mod = (i: number, n: number) => ((i % n) + n) % n;

type Pose = { c: [number, number, number]; yaw: number; a: number };
type Item = { ed: number; pose: Pose; written: number; now: number };
type State = { shapes: number[][]; widths: number[]; lift: number[] };

/** sheet-local to world: u, v in 0..1 from the bottom-left corner */
function sheet(c: V3, yaw: number): (u: number, v: number, lift?: number) => V3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const ct = Math.cos(TILT);
  const st = Math.sin(TILT);
  return (u, v, lift = 0) => {
    const lx = (u - 0.5) * SW;
    const ly = (v - 0.5) * SH;
    const y1 = ly * ct + lift * st;
    const z1 = ly * st - lift * ct;
    return [c[0] + lx * cy + z1 * sy, c[1] + y1, c[2] - lx * sy + z1 * cy];
  };
}

const corners = (at: (u: number, v: number) => V3): V3[] => [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];

/** is the pointer on this quad, as the camera sees it? */
function under(f: Frame, q: V3[]): boolean {
  let side = 0;
  for (let i = 0; i < 4; i++) {
    const a = f.P(...q[i]);
    const b = f.P(...q[(i + 1) % 4]);
    if (!a || !b) return false;
    const c = (b.x - a.x) * (f.my - a.y) - (b.y - a.y) * (f.mx - a.x);
    if (c === 0) continue;
    if (side && c > 0 !== side > 0) return false;
    side = c > 0 ? 1 : -1;
  }
  return side !== 0;
}

/** the key light crossing the paper: one soft band, slowly, from corner to corner */
function sweep(f: Frame, q: V3[], level: number): void {
  const p0 = f.P(...q[3]);
  const p1 = f.P(...q[1]);
  if (!p0 || !p1 || level <= 0.003) return;
  const { ctx } = f;
  const band = clamp(0.5 + (f.still ? -0.12 : Math.sin(f.t * 0.23) * 0.3) + f.px * 0.12, 0.2, 0.8);
  const g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
  g.addColorStop(band - 0.2, rgba(f.pal.key, 0));
  g.addColorStop(band, rgba(f.pal.key, 0.1 * level));
  g.addColorStop(band + 0.14, rgba(f.pal.key, 0));
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const p = f.P(...q[i]);
    if (!p) {
      ctx.restore();
      return;
    }
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, f.w, f.h);
  ctx.restore();
}

const scene: Scene<State> = {
  // the composed still: today's sheet whole, before it turns
  pose: CYCLE * 0.68,
  setup(f) {
    // one small invented figure for each edition, and the lengths of its lines of text
    const shapes = Array.from({ length: 10 }, (_, n) => {
      let v = 0.3 + 0.4 * f.rnd(n * 31 + 7);
      return Array.from({ length: 12 }, (_, i) => (v = clamp(v + (f.rnd(n * 31 + i + 8) - 0.46) * 0.34, 0.06, 0.94)));
    });
    return { shapes, widths: Array.from({ length: 23 }, (_, i) => 0.68 + 0.32 * f.rnd(i + 400)), lift: Array.from({ length: RING }, () => 0) };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    f.aim(-0.16 + Math.sin(f.t * 0.09) * 0.04, 0.12, 6.4, m ? 0.84 : 0.9);

    const tones = [pal.teal, pal.blue, pal.emerald, pal.indigo];
    /** editions standing behind today's, and lines of text in each column */
    const back = m ? 3 : 4;
    const rows = m ? 3 : 5;
    const steps = 5.5 + rows;
    const tagged = f.tag ? 1 : 0;
    const pick = f.tag ? hash(f.tag) % s.shapes.length : 0;

    const turn = f.t / CYCLE;
    const n = Math.floor(turn);
    const u = turn - n;
    const written = clamp(u / 0.56);
    // the last fifth of its time: today's sheet is turned and becomes yesterday's
    const v = f.still ? 0 : ease((u - 0.78) / 0.22);
    const up = Math.sin(Math.PI * v);
    // under the pointer the stack fans wider
    const fan = 1 + 0.25 * f.hover;

    const floor = -1.2;
    deck(f, { y: floor, alpha: 0.11 });
    pool(f, [X0 + 0.2, floor, 0.4], 2.3, pal.key, 0.2 * f.boot);

    // ── the week: an arc behind the stack, the days so far lit, today in champagne
    const weekOn = f.on(0.1, 0.5);
    const today = (f.now.getDay() + 6) % 7;
    // (it turns a little toward the reader's hand)
    const rot = -f.px * 0.16 * f.hover;
    ring(f, WEEK, WR, { axis: "z", from: 0.1, to: 0.4, rot, colour: pal.ink, alpha: 0.24 * weekOn, ticks: m ? 20 : 40, major: 5, tickLen: 0.035 });
    ring(f, WEEK, WR + 0.09, { axis: "z", from: 0.13, to: 0.37, rot, colour: pal.ink, alpha: 0.1 * weekOn });
    ring(f, WEEK, WR, { axis: "z", from: dayTurn(today), to: dayTurn(0), rot, colour: pal.key, alpha: 0.55 * weekOn, width: 1.5 });
    const noon = ringPoint(WEEK, WR, dayTurn(today), "z", rot);
    DAYS.forEach((d, i) => {
      const p = ringPoint(WEEK, WR, dayTurn(i), "z", rot);
      const on = f.on(0.15 + i * 0.07, 0.3);
      const is = i === today;
      if (is) lamp(f, p, pal.gold, on * (f.still ? 1 : 0.85 + 0.15 * Math.sin(f.t * 0.9)), 0.02);
      else f.dot(p, 0.011, i < today ? pal.key : pal.ink, (i < today ? 0.8 : 0.4) * on);
      f.label(d, p, { align: "center", dy: m ? -10 : -14, size: m ? 8 : is ? 11 : 10, colour: is ? pal.gold : pal.ink2, alpha: (is ? 1 : i < today ? 0.65 : 0.4) * on });
    });

    // ── the globe the story is gathered from
    const globeOn = f.on(0.2, 0.5);
    const spin = (f.still ? 0.4 : f.t * 0.05) + f.px * 0.3;
    pool(f, [GLOBE[0], floor, GLOBE[2]], 0.8, pal.key, 0.14 * globeOn);
    f.line([GLOBE[0], floor, GLOBE[2]], [GLOBE[0], GLOBE[1] - GR * 1.12, GLOBE[2]], pal.ink, 0.2 * globeOn, 1);
    orb(f, GLOBE, GR, pal.key, globeOn);
    const seg = Math.round(22 * f.q);
    for (let k = 0; k < 3; k++) {
      const a = spin + (k * Math.PI) / 3;
      const pts: V3[] = [];
      for (let i = 0; i <= seg; i++) {
        const b = (i / seg) * Math.PI * 2;
        pts.push([GLOBE[0] + Math.cos(b) * Math.cos(a) * GR, GLOBE[1] + Math.sin(b) * GR, GLOBE[2] + Math.cos(b) * Math.sin(a) * GR]);
      }
      f.path(pts, pal.ink, 0.13 * globeOn, 1);
    }
    ring(f, GLOBE, GR, { axis: "y", colour: pal.ink, alpha: 0.2 * globeOn, seg: 36 });
    ring(f, GLOBE, GR * 1.27, { axis: "y", colour: pal.ink, alpha: 0.24 * globeOn, ticks: 24, major: 6, tickLen: 0.03, rot: -spin * 0.4, seg: 48 });

    // ── the stack: who stands where, from the oldest to today's, then tomorrow's clean sheet
    const poseAt = (slot: number): Pose => ({
      c: [X0 + slot * STEP * fan, Y0 + slot * 0.07, slot * 0.5],
      yaw: -0.05 - slot * 0.085 * fan,
      // depth of field: each step back is fainter, and the last one leaves
      a: lerp(1, 0.3, clamp(slot / back)) * clamp(back + 1 - slot),
    });
    const items: Item[] = [];
    for (let k = back; k >= 0; k--) {
      const p = poseAt(k + v);
      if (k === 0) {
        // today's sheet lifts off and turns as it goes
        p.c[1] += up * 0.14;
        p.yaw -= up * 0.3;
      }
      items.push({ ed: n - k, pose: p, written: k === 0 ? written : 1, now: k === 0 ? 1 - v : 0 });
    }
    if (v > 0) {
      const p = poseAt(0);
      p.a = v;
      items.push({ ed: n + 1, pose: p, written: 0, now: 1 });
    }
    const lifted = (p: Pose, l: number): V3 => [p.c[0], p.c[1] + 0.04 * l, p.c[2] - 0.2 * l];

    // which sheet is the hand on? tested from the front, so the nearest wins; lifts ease in and out
    let hot = -1;
    if (f.hover > 0) {
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (it.pose.a > 0.15 && under(f, corners(sheet(it.pose.c, it.pose.yaw)))) {
          hot = mod(it.ed, RING);
          break;
        }
      }
    }
    const rate = clamp(f.dt * 7);
    for (let i = 0; i < RING; i++) s.lift[i] = f.still ? 0 : s.lift[i] + ((i === hot ? f.hover : 0) - s.lift[i]) * rate;

    // the pen: the place being set at this moment, found while the sheet is drawn
    let pen: V3 | null = null;

    const page = (it: Item) => {
      const l = s.lift[mod(it.ed, RING)];
      const depth = it.pose.c[2] / 0.5;
      const a = clamp(it.pose.a * (1 + 0.7 * l)) * f.on(0.12 + Math.min(4, depth) * 0.1, 0.45);
      if (a <= 0.01) return;
      const c = lifted(it.pose, l);
      const pc = f.P(c[0], c[1], c[2]);
      if (!pc) return;
      // stroke weights follow the sheet's size on screen
      const k = clamp((pc.s * f.u) / 120, 0.5, 1.5);
      const at = sheet(c, it.pose.yaw);
      const quad = corners(at);
      const tone = tones[mod(it.ed, tones.length)];
      const lit = 1 + 0.45 * l;
      // champagne belongs to the page's own story: today's sheet on a post's page
      const own = tagged * it.now;

      // the sheet: smoked glass, the key light crossing it, a hairline, its top edge lit
      f.fill(quad, pal.bg, 0.94 * a);
      f.fill(quad, pal.ink, (0.035 + 0.05 * l) * a);
      sweep(f, quad, a * Math.max(it.now, l));
      f.path(quad, pal.ink, (0.18 + 0.3 * l) * a, 1, true);
      f.line(at(0, 1), at(1, 1), tone, 0.75 * a * (1 - own), 1.25);
      f.line(at(0, 1), at(1, 1), pal.gold, 0.9 * a * own, 1.5);

      const p = it.written * steps;
      /** one stroke, set left to right in its turn */
      const bar = (u0: number, y: number, len: number, order: number, colour: string, alpha: number, width: number) => {
        const d = clamp(p - order);
        if (d <= 0 || alpha <= 0) return;
        f.line(at(u0, y), at(u0 + len * d, y), colour, clamp(alpha * lit) * a, Math.max(0.6, width * k));
        if (d < 1 && it.now === 1) pen = at(u0 + len * d, y, 0.012);
      };

      // masthead and its rule
      bar(0.08, 0.91, 0.24, 0, tone, 0.9, 2.2);
      f.dot(at(0.9, 0.91), 0.012, tone, 0.8 * a * clamp(p));
      bar(0.08, 0.855, 0.84, 0.3, pal.ink, 0.22, 1);
      // the headline, two lines; on a post's page it is the story, in champagne with a mark in the margin
      bar(0.08, 0.77, 0.84, 1, pal.ink, 0.92 * (1 - own), 3.2);
      bar(0.08, 0.69, 0.55, 2, pal.ink, 0.92 * (1 - own), 3.2);
      bar(0.08, 0.77, 0.84, 1, pal.gold, 0.95 * own, 3.2);
      bar(0.08, 0.69, 0.55, 2, pal.gold, 0.95 * own, 3.2);
      if (own > 0) f.line(at(0.035, 0.8), at(0.035, 0.8 - 0.14 * clamp(p - 1)), pal.gold, 0.9 * a * own * clamp(p - 1), Math.max(0.6, 1.5 * k));

      // the figure: a line that draws itself over a rule. A drawing of a chart, no more.
      bar(0.08, 0.37, 0.84, 3, pal.ink, 0.16, 1);
      const shape = s.shapes[mod(it.ed + pick, s.shapes.length)];
      const last = shape.length - 1;
      const d = clamp((p - 3.2) / 1.8);
      if (d > 0) {
        const x = d * last;
        const whole = Math.floor(x);
        const pts: V3[] = [];
        for (let i = 0; i <= whole; i++) pts.push(at(0.1 + (0.8 * i) / last, 0.41 + 0.19 * shape[i], 0.01));
        if (whole < last) pts.push(at(0.1 + (0.8 * x) / last, 0.41 + 0.19 * lerp(shape[whole], shape[whole + 1], x - whole), 0.01));
        const tip = pts[pts.length - 1];
        f.path(pts, tone, 0.16 * a * it.now, 4.5 * k);
        f.path(pts, tone, clamp(0.9 * lit) * a, Math.max(0.75, 1.5 * k));
        f.dot(tip, 0.013, tone, a);
        if (d < 1 && it.now === 1) pen = tip;
      }

      // two columns of text; the far sheets of a small or slow frame go without
      if (depth > 2.5 && (m || f.q < 0.75)) return;
      for (let col = 0; col < 2; col++) {
        for (let r = 0; r < rows; r++) {
          const w = 0.37 * (r === rows - 1 ? 0.5 + 0.2 * col : s.widths[mod(it.ed * 5 + col * rows + r, s.widths.length)]);
          bar(0.08 + col * 0.47, 0.29 - (r * 0.2) / (rows - 1), w, 5 + (col * rows + r) * 0.5, pal.ink2, 0.62, 1.3);
        }
      }
    };

    items.forEach(page);

    // ── where the threads arrive: the sheet standing in front (today's, or the clean one taking its place)
    const frontLift = lerp(s.lift[mod(n, RING)], s.lift[mod(n + 1, RING)], v);
    const front = poseAt(0);
    const feed = sheet(lifted(front, frontLift), front.yaw);

    // today's day hangs its sheet: one fine line from the lamp on the arc to the top of the page
    f.line(noon, feed(0.5, 1), pal.gold, 0.22 * weekOn * (1 - up * 0.7), 1);

    // ── the threads: each market centre feeds one part of the page, and lights while that part is set
    const count = m ? 3 : NODES.length;
    const threadsOn = f.on(0.55, 0.4);
    for (let i = 0; i < count; i++) {
      const idx = m ? i + 1 : i;
      const lat = NODES[idx][0] * DEG;
      const lon = NODES[idx][1] * DEG + spin;
      const z = -Math.cos(lat) * Math.cos(lon);
      const node: V3 = [GLOBE[0] + Math.cos(lat) * Math.sin(lon) * GR, GLOBE[1] + Math.sin(lat) * GR, GLOBE[2] + z * GR];
      // a node on the far side of the glass is dimmer, and so is its thread
      const facing = 0.3 + 0.7 * clamp(0.5 - z * 2);
      const touch = f.near(node, 70);
      const [fv, order] = FEEDS[idx];
      const busy = written < 1 ? clamp(1 - Math.abs(written * steps - order - 0.8) / 1.6) : 0;
      const tone = tones[idx % tones.length];
      const level = clamp(0.32 + 0.5 * busy + 0.6 * touch) * facing * threadsOn * (1 - up * 0.55);
      const pts = arc(node, feed(0, fv), 0.1 + idx * 0.035, Math.max(8, Math.round(18 * f.q)));
      trace(f, pts, tone, 0.7 * level, 1, f.t / (6 + idx) + f.rnd(idx + 60));
      lamp(f, node, tone, clamp(0.5 + 0.5 * busy + touch) * facing * globeOn, 0.013);
      f.dot(feed(0, fv), 0.011, tone, level);
    }

    if (pen && !f.still) {
      f.glow(pen, 0.17, pal.key, 0.75 * f.boot);
      f.dot(pen, 0.012, pal.ink, 0.95 * f.boot);
    }

    // ── dust in the light: slow motes, larger and fainter the further they are from the page
    const motes = Math.round((m ? 12 : 30) * f.q);
    for (let i = 0; i < motes; i++) {
      const life = (f.rnd(i * 3 + 51) + (f.still ? 0 : f.t * (0.006 + 0.008 * f.rnd(i * 3 + 53)))) % 1;
      const z = (f.rnd(i * 3 + 52) - 0.4) * 2.8;
      const blur = clamp(Math.abs(z) / 1.7);
      const x = (f.rnd(i * 3 + 50) - 0.5) * 3.6 + (f.still ? 0 : Math.sin(f.t * 0.11 + i) * 0.07);
      // they rise through the frame and fade in and out at its ends, so none appears or goes at once
      const alpha = Math.sin(Math.PI * life) * (0.5 - 0.34 * blur) * f.boot;
      f.dot([x, -1.15 + life * 2.3, z], 0.007 + 0.013 * blur, i % 4 ? pal.ink : pal.key, alpha);
    }
  },
};

export default scene;
