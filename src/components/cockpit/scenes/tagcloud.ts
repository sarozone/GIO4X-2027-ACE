/**
 * TAGCLOUD — labels on strings, and the posts each is tied to.
 *
 * Three rails hang one behind another, and from them, on strings of different
 * lengths, hang luggage labels: a clipped corner, an eyelet, a line or two.
 * A label is as large as its tag is heavy with posts. They sway a little, and
 * turn on their strings. From the foot of each a thread drops away to one of
 * the small stacks of sheets standing on the deck behind: the posts filed
 * under it. A light passes from label to label along the rails.
 *
 * On a tag's own page one label hangs in front of the rest, in champagne, with
 * the tag written under it.
 *
 * The lines on a label are strokes, and its size is drawn from the page's own
 * noise: no label here counts anything.
 *
 * The pointer goes through them as a hand does: the labels part to either side
 * of it, and the nearest is lifted on its string, with its thread lit.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { arc, deck, pool, trace } from "../kit";

const FLOOR = -1.05;
/** the height of the rails, and how deep each hangs: the nearest first */
const RY = 1;
const RAILS = [-0.35, 0.1, 0.55];
/** where the stacks stand */
const SZ = 0.95;

type Tag = { x: number; rail: number; len: number; w: number; phase: number; stack: number; own: boolean };
type State = { tags: Tag[]; stacks: number; name: string; widths: number[] };

const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** the tag as it is written: its address made into words, and kept short */
function written(tag: string): string {
  let s = tag;
  try {
    s = decodeURIComponent(tag);
  } catch {
    // an address that cannot be decoded is shown as it came
  }
  return s.replace(/[-_+]+/g, " ").trim().toUpperCase().slice(0, 20);
}

const scene: Scene<State> = {
  pose: 7,
  setup(f) {
    const n = f.mobile ? 7 : 11;
    const stacks = f.mobile ? 3 : 4;
    const name = written(f.tag);
    const mid = Math.floor(n / 2);
    const tags: Tag[] = [];
    for (let i = 0; i < n; i++) {
      const own = name !== "" && i === mid;
      tags.push({
        x: lerp(-1.48, 1.48, (i + 0.5) / n) + (f.rnd(i + 11) - 0.5) * 0.08,
        // the page's own label hangs from the nearest rail
        rail: own ? 0 : [1, 2, 0][i % 3],
        len: own ? 0.34 : 0.22 + 0.5 * f.rnd(i * 5 + 1),
        w: own ? 1.5 : 0.72 + 0.6 * f.rnd(i * 5 + 2),
        phase: f.rnd(i * 5 + 3) * 6.28,
        stack: Math.floor(f.rnd(i * 5 + 4) * stacks) % stacks,
        own,
      });
    }
    return { tags, stacks, name, widths: Array.from({ length: 12 }, (_, i) => 0.5 + 0.5 * f.rnd(i + 90)) };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.1 + (f.still ? 0 : Math.sin(t * 0.07) * 0.03), -0.12, 6.4, m ? 0.9 : 0.95);
    const k = clamp(f.u / 110, 0.6, 1.3);
    const tones = [pal.teal, pal.blue, pal.indigo, pal.emerald];
    const n = s.tags.length;

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0.5], 2.5, pal.key, 0.18 * f.boot);

    // ── every label: where it hangs at this moment, and how much the hand is on it
    const walk = (t / 4.5) % n;
    const hung = s.tags.map((tg, i) => {
      const z = RAILS[tg.rail];
      const [tw, th] = [0.24 * tg.w, 0.4 * tg.w];
      const touch = f.near([tg.x, RY - tg.len - th / 2, z], 75);
      // the labels part to either side of the pointer
      const at = f.P(tg.x, RY - tg.len - th / 2, z);
      const dx = at ? (at.x - f.mx) / (f.u * 0.55) : 9;
      const part = f.hover * Math.sign(dx || 1) * Math.exp(-dx * dx) * 0.3 * (1 - touch);
      const swing = (f.still ? 0.04 * Math.sin(tg.phase) : 0.06 * Math.sin(t * 0.5 + tg.phase) + 0.025 * Math.sin(t * 0.31 + tg.phase * 2)) + part;
      const twist = 0.55 * Math.sin((f.still ? 0 : t * 0.23) + tg.phase) * (1 - touch) * (tg.own ? 0.3 : 1);
      const len = tg.len * (1 - 0.3 * touch);
      const [sa, ca, ctw, stw] = [Math.sin(swing), Math.cos(swing), Math.cos(twist), Math.sin(twist)];
      /** a place on the label: `r` across it from its middle, `d` down it from where the string meets it */
      const pt = (r: number, d: number): V3 => [tg.x + sa * (len + d) + ca * r * ctw, RY - ca * (len + d) + sa * r * ctw, z + r * stw];
      // the light that passes along the rails, from label to label
      const turn = Math.min(Math.abs(walk - i), n - Math.abs(walk - i));
      const lit = Math.max(touch, tg.own ? 1 : (s.name ? 0.4 : 0.8) * smooth(1 - turn));
      return { tg, z, tw, th, touch, lit, pt, tone: tones[i % tones.length] };
    });

    // ── the stacks of sheets on the deck behind: the posts
    const stackOn = f.on(0.5, 0.4);
    const tops: V3[] = [];
    for (let c = 0; c < s.stacks; c++) {
      const x = s.stacks > 1 ? lerp(-1.2, 1.2, c / (s.stacks - 1)) : 0;
      const sheets = 4 + Math.floor(f.rnd(c + 40) * 3);
      let warm = 0;
      for (const h of hung) if (h.tg.stack === c) warm = Math.max(warm, h.touch, h.tg.own ? 0.8 : 0);
      for (let j = 0; j < sheets; j++) {
        const y = FLOOR + 0.012 + j * 0.034;
        const a = (f.rnd(c * 7 + j + 50) - 0.5) * 0.4;
        const [ca, sa] = [Math.cos(a), Math.sin(a)];
        const q = ([[-0.25, -0.18], [0.25, -0.18], [0.25, 0.18], [-0.25, 0.18]] as const).map(([px, pz]): V3 => [x + px * ca - pz * sa, y, SZ + px * sa + pz * ca]);
        const last = j === sheets - 1;
        f.fill(q, pal.bg, 0.9 * stackOn);
        f.fill(q, last ? pal.gold : pal.ink, (last ? 0.12 * warm : 0) + 0.05 * stackOn);
        f.path(q, pal.ink, (0.22 + (last ? 0.2 : 0)) * stackOn, 1, true);
        if (last) {
          f.path(q, pal.gold, 0.8 * warm * stackOn, 1.25, true);
          for (let r = 0; r < 3; r++) f.line([lerp(q[3][0], q[0][0], 0.25 + r * 0.22), y, lerp(q[3][2], q[0][2], 0.25 + r * 0.22)], [lerp(q[2][0], q[1][0], 0.25 + r * 0.22), y, lerp(q[2][2], q[1][2], 0.25 + r * 0.22)], pal.ink2, 0.4 * stackOn, 1);
        }
      }
      tops.push([x, FLOOR + 0.012 + sheets * 0.034, SZ - 0.1]);
    }

    // ── the threads, from the foot of each label to its stack
    const seg = Math.max(8, Math.round(16 * f.q));
    const threadOn = f.on(0.65, 0.35);
    for (const h of hung) {
      const pts = arc(h.pt(0, h.th), tops[h.tg.stack], -0.22, seg);
      const strong = h.tg.own ? 1 : h.touch;
      f.path(pts, h.tone, 0.16 * (1 - strong) * threadOn, 1);
      if (strong > 0.02) trace(f, pts, h.tg.own ? pal.gold : h.tone, 0.75 * strong * threadOn, 1, f.still ? -1 : t / 5 + h.tg.phase);
    }

    // ── the rails, the farthest first, and what hangs from each
    for (let r = RAILS.length - 1; r >= 0; r--) {
      const z = RAILS[r];
      const railOn = f.on(0.1 * r, 0.4);
      const depth = lerp(1, 0.6, r / (RAILS.length - 1));
      const reach = 1.68;
      f.line([-reach, RY, z], [reach, RY, z], pal.ink, 0.5 * depth * railOn, 2);
      f.line([-reach, RY + 0.012, z], [reach, RY + 0.012, z], pal.key, 0.35 * depth * railOn, 1);
      for (const e of [-reach, reach]) {
        f.line([e, RY, z], [e, RY + 0.22, z], pal.ink, 0.3 * depth * railOn, 1.5);
        f.dot([e, RY, z], 0.018, pal.ink, 0.6 * depth * railOn);
      }
      for (const h of hung) {
        if (h.tg.rail !== r) continue;
        const { tg, tw, th, pt, lit } = h;
        const a = clamp(depth + 0.4 * lit) * f.on(0.25 + 0.5 * f.rnd(tg.phase * 10), 0.35);
        if (a <= 0.01) continue;
        const colour = tg.own ? pal.gold : h.tone;
        const cut = tw * 0.32;
        const hole = pt(0, cut * 0.75);
        f.line([tg.x, RY, h.z], hole, pal.ink, 0.5 * a, 1);
        f.dot([tg.x, RY, h.z], 0.012, pal.ink, 0.7 * a);
        const shape: V3[] = [pt(-tw / 2 + cut, 0), pt(tw / 2 - cut, 0), pt(tw / 2, cut), pt(tw / 2, th), pt(-tw / 2, th), pt(-tw / 2, cut)];
        f.fill(shape, pal.bg, 0.94 * a);
        f.fill(shape, colour, (0.08 + 0.14 * lit) * a);
        f.path(shape, colour, (0.5 + 0.5 * lit) * a, tg.own ? 1.5 : 1, true);
        f.dot(hole, 0.022 * tg.w, colour, 0.8 * a);
        f.dot(hole, 0.011 * tg.w, pal.bg, 0.95 * a);
        // what is written on it: a heavy stroke and a lighter one or two
        const inset = tw * 0.16;
        const run = tw - inset * 2;
        f.line(pt(-tw / 2 + inset, th * 0.48), pt(-tw / 2 + inset + run * (tg.own ? 1 : 0.6 + 0.4 * s.widths[tg.stack]), th * 0.48), tg.own ? pal.gold : pal.ink, (0.6 + 0.4 * lit) * a, Math.max(0.8, 2.6 * k * tg.w * 0.8));
        f.line(pt(-tw / 2 + inset, th * 0.66), pt(-tw / 2 + inset + run * s.widths[(tg.stack + 3) % s.widths.length], th * 0.66), pal.ink2, 0.6 * a, Math.max(0.6, 1.2 * k));
        if (tg.w > 1) f.line(pt(-tw / 2 + inset, th * 0.8), pt(-tw / 2 + inset + run * 0.5, th * 0.8), pal.ink2, 0.5 * a, Math.max(0.6, 1.2 * k));
        if (tg.own) {
          f.glow(pt(0, th * 0.5), 0.6, pal.gold, 0.14 * a);
          f.label(s.name, pt(0, th), { align: "center", dy: m ? 11 : 14, size: m ? 9 : 11, colour: pal.gold, alpha: a * f.on(0.8, 0.2) });
        }
      }
    }
  },
};

export default scene;
