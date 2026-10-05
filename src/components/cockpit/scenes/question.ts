/**
 * QUESTION — one a day, and the run it adds to.
 *
 * A card stands in the middle: today's question, set on it a line at a time.
 * In front of it stand four plates, A to D, the options, and a light passes
 * along them while the question is weighed. Then the card turns over. Its
 * other side carries the answer's letter and a few lines of why, a thread
 * drops from it to that plate, and the plate rises in champagne.
 *
 * Behind hangs a chain, one link for a day. When the card has turned, a new
 * link comes down onto the end of it, in champagne: today's. The chain moves
 * along by one, its oldest link leaves at the other end, and the card turns
 * back, clean, for the next day.
 *
 * Lines of text are strokes and cannot be read. Which plate is the answer
 * changes from one turn to the next and means nothing, and the chain is a
 * drawing of a run of days: it is nobody's streak and it has no count.
 *
 * The pointer: the card tilts toward it, and the plate under it lights and
 * lifts, as an option does when it is being considered.
 */
import { TAU, clamp, lerp, type Scene, type V3 } from "../engine";
import { arc, deck, pool, trace } from "../kit";

const FLOOR = -1.05;
/** seconds for one day: the question is set and weighed, the card turns, the answer stands, the card turns back */
const LOOP = 14;
/** the card: its centre, width and height, and how it is turned to the visitor at rest */
const CARD: V3 = [0, 0.2, 0];
const [CW, CH, REST] = [1.5, 0.9, -0.1];
/** the plates: the height of their middle, their width and height, the step from one to the next */
const [PY, PW, PH, PSTEP] = [-0.72, 0.56, 0.28, 0.7];
const OPTS = ["A", "B", "C", "D"] as const;
/** the chain: its height in the middle, how far behind the card it hangs, half the height of a link */
const [HANG, ZC, LINK] = [0.9, 0.55, 0.085];

type State = { phase: number };

const ease = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};

/** a standing rectangle, turned and leaned: u, v in 0..1 from its bottom-left corner, `lift` toward its face */
function pane(c: V3, w: number, h: number, yaw: number, tilt: number): (u: number, v: number, lift?: number) => V3 {
  const [cy, sy, ct, st] = [Math.cos(yaw), Math.sin(yaw), Math.cos(tilt), Math.sin(tilt)];
  return (u, v, lift = 0) => {
    const lx = (u - 0.5) * w;
    const ly = (v - 0.5) * h;
    const y1 = ly * ct + lift * st;
    const z1 = ly * st - lift * ct;
    return [c[0] + lx * cy + z1 * sy, c[1] + y1, c[2] - lx * sy + z1 * cy];
  };
}

const scene: Scene<State> = {
  // the composed still: the card turned, the answer's plate lit, today's link on the chain
  pose: LOOP * 0.7,
  setup(f) {
    return { phase: f.rnd(2) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(-0.08 + (f.still ? 0 : Math.sin(t * 0.08 + s.phase) * 0.04), -0.08, 6.4, 1);

    const turn = t / LOOP;
    const day = Math.floor(turn);
    const u = turn - day;
    /** the question's lines as they are set; the card comes back clean, so there are none once it has turned */
    const written = u < 0.5 ? clamp(u / 0.2) : 0;
    /** half a turn to the answer, and the other half back to the next question */
    const flip = Math.PI * (ease((u - 0.34) / 0.14) + ease((u - 0.88) / 0.12));
    /** the answer standing: its plate, its thread */
    const told = ease((u - 0.48) / 0.08) * (1 - ease((u - 0.88) / 0.08));
    /** today's link arriving, and how long it stays champagne */
    const grown = u < 0.5 ? 0 : ease((u - 0.5) / 0.14);
    const todays = u < 0.5 ? 0 : 1 - ease((u - 0.9) / 0.1);
    /** what belongs to one day only fades out before the next begins */
    const days = ease(u / 0.06) * (1 - ease((u - 0.92) / 0.08));
    const answer = Math.floor(f.rnd((day % 97) + 11) * 4) % 4;

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.3, pal.key, 0.2 * f.boot);

    // ── the chain behind: one link for a day, the newest at the right
    const count = m ? 6 : 8;
    const pitch = m ? 0.42 : 0.34;
    const first = (-(count - 1) * pitch) / 2;
    const chainOn = f.on(0.1, 0.5);
    const seg = Math.max(10, Math.round(16 * f.q));
    const sag = (x: number) => HANG + 0.1 * (x / 1.45) ** 2;
    const oval: V3[] = [];
    for (let i = 0; i <= count; i++) {
      // its place along the chain: the whole chain moves one place to the left as the new link comes on
      const e = i - grown;
      const arriving = clamp(count - e);
      const alpha = clamp(e + 1) * arriving * lerp(0.45, 1, clamp(e / (count - 1))) * chainOn;
      if (alpha <= 0.01) continue;
      const x = first + e * pitch;
      const y = sag(x) + (1 - ease(arriving)) * 0.18;
      // links lie alternately flat to the visitor and edge on, as the links of a chain do
      const ry = (i + day) % 2 ? LINK * 0.24 : LINK;
      oval.length = 0;
      for (let k = 0; k < seg; k++) oval.push([x + Math.cos((k / seg) * TAU) * pitch * 0.66, y + Math.sin((k / seg) * TAU) * ry, ZC]);
      const gold = i === count ? todays : 0;
      f.path(oval, pal.key, 0.75 * alpha * (1 - gold), 1.6, true);
      if (gold > 0.01) {
        f.path(oval, pal.gold, 0.16 * alpha * gold, 6, true);
        f.path(oval, pal.gold, 0.95 * alpha * gold, 1.8, true);
      }
    }
    const end: V3 = [first + (count - 1) * pitch, sag(first + (count - 1) * pitch), ZC];

    // ── the card: it tilts toward the pointer, and turns over for the answer
    const cardOn = f.on(0.2, 0.4);
    const yaw = REST + flip + (clamp((f.mx - f.box.x) / f.box.w) - 0.5) * 0.9 * f.hover;
    const tilt = -0.04 + (clamp((f.my - f.box.y) / f.box.h) - 0.5) * 0.5 * f.hover;
    const at = pane(CARD, CW, CH, yaw, tilt);
    const front = Math.cos(yaw) > 0;
    // edge on, nothing on either face can be seen
    const face = ease(Math.abs(Math.cos(yaw)) * 2.5) * cardOn;
    /** a place on the side of the card that is turned to the visitor, read from its own left */
    const on = (x: number, y: number): V3 => at(front ? x : 1 - x, y, front ? 0.008 : -0.008);
    const pc = f.P(CARD[0], CARD[1], CARD[2]);
    // stroke weights follow the card's size on screen
    const k = pc ? clamp((pc.s * f.u) / 120, 0.5, 1.5) : 1;
    f.line([CARD[0], FLOOR, CARD[2]], at(0.5, 0), pal.ink, 0.2 * cardOn, 1);
    const quad: V3[] = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
    f.fill(quad, pal.bg, 0.94 * cardOn);
    f.fill(quad, pal.ink, 0.04 * cardOn);
    f.fill(quad, pal.gold, (front ? 0 : 0.05) * face);
    f.path(quad, pal.ink, 0.26 * cardOn, 1, true);
    f.line(at(0, 1), at(1, 1), front ? pal.key : pal.gold, 0.85 * cardOn, 1.5);
    /** one stroke, set from its left */
    const bar = (x: number, y: number, len: number, done: number, colour: string, alpha: number, width: number) => {
      if (done <= 0 || alpha <= 0.003) return;
      f.line(on(x, y), on(x + len * clamp(done), y), colour, alpha * face, Math.max(0.6, width * k));
    };
    if (front) {
      // the question: a mark, a rule and three lines, set one after another
      const p = written * 4.4;
      bar(0.08, 0.84, 0.2, p, pal.key, 0.9, 2.2);
      bar(0.08, 0.76, 0.84, p - 0.3, pal.ink, 0.2, 1);
      for (let i = 0; i < 3; i++) bar(0.08, 0.58 - i * 0.16, i === 2 ? 0.46 : 0.84 * (0.82 + 0.18 * f.rnd(day * 3 + i + 40)), p - 1 - i, pal.ink, 0.9, 3);
      if (!f.still && written > 0 && written < 1) {
        const line = clamp(Math.floor(p - 1), 0, 2);
        const pen = on(0.08 + 0.84 * clamp(p - 1 - line) * (line === 2 ? 0.55 : 0.9), 0.58 - line * 0.16);
        f.glow(pen, 0.15, pal.key, 0.6 * face * clamp(p - 1));
      }
    } else {
      // the answer: its letter, and a few lines of why
      bar(0.08, 0.84, 0.2, 1, pal.gold, 0.9 * told, 2.2);
      bar(0.08, 0.76, 0.84, 1, pal.ink, 0.2 * told, 1);
      f.label(OPTS[answer], on(0.17, 0.4), { align: "center", size: Math.max(12, Math.round(34 * k)), weight: 700, colour: pal.gold, alpha: 0.98 * face * told, display: true });
      for (let i = 0; i < 3; i++) bar(0.34, 0.56 - i * 0.15, 0.58 * (i === 2 ? 0.55 : 0.8 + 0.2 * f.rnd(day * 3 + i + 80)), 1, pal.ink2, 0.75 * told, 2);
    }

    // ── today's link is tied to the card by one fine line while it is new
    f.line(end, at(0.5, 1), pal.gold, 0.2 * grown * todays * chainOn, 1);

    // ── the four plates in front, on a shallow curve
    const platesOn = f.on(0.45, 0.4);
    // the light that passes along them while the question is weighed
    const weigh = (u / 0.36) * 4 - 0.5;
    const weighing = f.still ? 0 : ease(u / 0.05) * (1 - ease((u - 0.3) / 0.06));
    const size = m ? 9 : 11;
    ctx.save();
    ctx.letterSpacing = "1px";
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * PSTEP;
      const z = -0.32 + x * x * 0.1;
      const o = f.on(0.45 + i * 0.08, 0.3) * platesOn;
      if (o <= 0.003) continue;
      const touch = f.near([x, PY, z], m ? 44 : 78);
      const mine = i === answer ? told : 0;
      const lit = Math.max(touch, clamp(1 - Math.abs(weigh - i)) * weighing);
      const lift = 0.05 * touch + 0.09 * mine;
      const plate = pane([x, PY + lift, z], PW, PH, -x * 0.2, -0.1);
      const q: V3[] = [plate(0, 0), plate(1, 0), plate(1, 1), plate(0, 1)];
      f.line([x, FLOOR, z], plate(0.5, 0), pal.ink, 0.18 * o, 1);
      if (mine > 0.02) f.glow([x, PY + lift, z], 0.5, pal.gold, 0.22 * mine * o);
      f.fill(q, pal.bg, 0.93 * o);
      f.fill(q, pal.key, (0.03 + 0.13 * lit) * (1 - mine) * o);
      f.fill(q, pal.gold, 0.16 * mine * o);
      f.path(q, pal.ink, (0.2 + 0.25 * lit) * o, 1, true);
      f.line(plate(0, 1), plate(1, 1), pal.key, (0.45 + 0.5 * lit) * (1 - mine) * o, 1.25);
      f.line(plate(0, 1), plate(1, 1), pal.gold, 0.95 * mine * o, 1.6);
      // its letter, and the option itself as one stroke
      f.label(OPTS[i], plate(0.17, 0.5, 0.006), { align: "center", size, weight: 700, colour: pal.ink, alpha: (0.6 + 0.4 * lit) * (1 - mine) * o });
      f.label(OPTS[i], plate(0.17, 0.5, 0.006), { align: "center", size, weight: 700, colour: pal.gold, alpha: mine * o });
      const len = 0.56 * (0.55 + 0.45 * f.rnd(day * 4 + i + 120));
      f.line(plate(0.32, 0.5, 0.006), plate(0.32 + len, 0.5, 0.006), pal.ink2, (0.5 + 0.4 * Math.max(lit, mine)) * days * o, m ? 1.4 : 2);
      // the thread from the answer down to its plate
      if (mine > 0.02) trace(f, arc(at(0.5, 0), plate(0.5, 1), -0.06, Math.max(8, Math.round(14 * f.q))), pal.gold, 0.7 * mine * o, 1.1, f.still ? -1 : t / 4);
    }
    f.label("TODAY", end, { align: "center", size: m ? 8 : 10, colour: pal.gold, alpha: 0.95 * grown * todays * f.on(0.85, 0.15), dy: m ? -12 : -15 });
    ctx.restore();
  },
};

export default scene;
