/**
 * ALMANAC — today's leaf, and what lies under it.
 *
 * A perpetual date wheel stands on the deck. Its inner ring is the month's
 * days, a tick for each and no numeral; the ring round it is the year's twelve
 * months by their first letters. Both are turned so that today, by the
 * visitor's own clock, stands under the fixed index at the top. Round them
 * runs a band of beads, the year's days on which something is remembered, and
 * the bead under the index is today's, in champagne.
 *
 * In the middle hangs a tear-off block. Its top leaf carries the month and the
 * day of the week, which are simply true. Every so often the leaf lifts on its
 * binding and shows what is beneath: a bell, the mark of the one event the
 * page tells for this date.
 *
 * The bell is an emblem and the beads are a drawing: their sizes and places
 * measure nothing, and no leaf, tick or bead carries a year or a figure.
 *
 * The pointer turns the wheel, to the left or the right of where it stands,
 * and lifts the leaf.
 */
import { TAU, clamp, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, ringPoint } from "../kit";

const FLOOR = -1.3;
/** the day ring, the month ring and the band of beads: their radii and how far back each lies */
const [RD, RM, RB] = [0.78, 0.95, 1.1];
const [ZD, ZM, ZB] = [0, 0.1, 0.22];
/** the block: how far in front of the wheel it hangs, its half-width, its foot, its binding and its top */
const [PZ, PX, FOOT, BIND, TOP] = [-0.14, 0.37, -0.46, 0.36, 0.5];
/** a leaf is this tall, and is drawn in this many strips so that it can curl */
const LEAF = BIND - FOOT;
const STRIPS = 6;
/** seconds for the leaf to lie, lift, be held and settle */
const CYCLE = 16;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
/** the bell, in the leaf's own measure (across, up) */
const BELL: readonly (readonly [number, number])[] = [[0.26, 0.36], [0.33, 0.42], [0.36, 0.6], [0.42, 0.74], [0.5, 0.78], [0.58, 0.74], [0.64, 0.6], [0.67, 0.42], [0.74, 0.36]];

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const scene: Scene = {
  // the composed still: the leaf lifted, the bell showing
  pose: CYCLE * 0.6,
  draw(f) {
    const { pal } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(-0.14 + (f.still ? 0 : Math.sin(t * 0.06) * 0.03), -0.08, 6.4, m ? 0.86 : 0.9);
    const k = clamp(f.u / 110, 0.6, 1.3);

    // ── today, from the visitor's clock
    const month = f.now.getMonth();
    const day = f.now.getDate() - 1;
    const inMonth = new Date(f.now.getFullYear(), month + 1, 0).getDate();
    const ofYear = Math.floor((f.now.getTime() - new Date(f.now.getFullYear(), 0, 1).getTime()) / 864e5);
    const beads = m || f.q < 0.75 ? 36 : 60;
    const mine = Math.round((ofYear / 365) * beads) % beads;

    // ── how far the hand has turned the wheel: the days go round with it, the months and the year more slowly
    const hub = f.P(0, 0, 0);
    const pull = hub ? clamp((f.mx - hub.x) / (f.u * 1.3), -1, 1) * 1.3 * f.hover : 0;
    const off = pull + (f.still ? 0 : Math.sin(t * 0.21) * 0.025);
    const u = (t / CYCLE) % 1;
    const lift = Math.max(f.still ? 1 : ease((u - 0.22) / 0.2) * (1 - ease((u - 0.82) / 0.16)), ease(f.hover));

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0.2], 2.2, pal.key, 0.2 * f.boot);

    // ── the stand
    const wheelOn = f.on(0, 0.5);
    for (const side of [-1, 1]) {
      const from = ringPoint([0, 0, ZB], RB + 0.03, 0.75 + side * 0.07, "z");
      f.line(from, [side * 0.72, FLOOR, ZB + 0.1], pal.ink, 0.28 * wheelOn, 1.5);
      f.line([side * 0.72 - 0.12, FLOOR, ZB + 0.1], [side * 0.72 + 0.12, FLOOR, ZB + 0.1], pal.ink, 0.28 * wheelOn, 1.5);
    }

    // ── the band of beads: the year's remembered days, today's under the index
    const bandOn = f.on(0.3, 0.5);
    ring(f, [0, 0, ZB], RB, { axis: "z", colour: pal.ink, alpha: 0.14 * bandOn });
    let own: V3 = [0, RB, ZB];
    for (let j = 0; j < beads; j++) {
      const p = ringPoint([0, 0, ZB], RB, 0.25 - (j - mine) / beads, "z", -off * 0.6);
      if (j === mine) own = p;
      else f.dot(p, 0.008 + 0.016 * f.rnd(j + 70) ** 2, j % 5 ? pal.ink : pal.key, (0.3 + 0.35 * f.rnd(j + 170)) * bandOn);
    }

    // ── the months: twelve letters in their ring, this one in champagne
    const monthsOn = f.on(0.2, 0.5);
    const year = (month + (day + 0.5) / inMonth) / 12;
    ring(f, [0, 0, ZM], RM - 0.075, { axis: "z", colour: pal.ink, alpha: 0.2 * monthsOn });
    ring(f, [0, 0, ZM], RM + 0.075, { axis: "z", colour: pal.ink, alpha: 0.2 * monthsOn });
    for (let i = 0; i < 12; i++) {
      const edge = 0.25 - (i / 12 - year);
      f.line(ringPoint([0, 0, ZM], RM - 0.075, edge, "z", -off * 0.3), ringPoint([0, 0, ZM], RM + 0.075, edge, "z", -off * 0.3), pal.ink, 0.22 * monthsOn, 1);
      const is = i === month;
      f.label(MONTHS[i].charAt(0), ringPoint([0, 0, ZM], RM, 0.25 - ((i + 0.5) / 12 - year), "z", -off * 0.3), {
        align: "center",
        size: m ? (is ? 10 : 8) : is ? 13 : 10,
        colour: is ? pal.gold : pal.ink2,
        alpha: (is ? 1 : 0.6) * monthsOn,
      });
    }

    // ── the days: a tick each and no numeral; those gone by are lit, today's is the long one
    const daysOn = f.on(0.1, 0.5);
    ring(f, [0, 0, ZD], RD, { axis: "z", colour: pal.ink, alpha: 0.3 * daysOn });
    for (let d = 0; d < 31; d++) {
      const turn = 0.25 - (d - day) / 31;
      const is = d === day;
      const outer = ringPoint([0, 0, ZD], RD, turn, "z", -off);
      f.line(outer, ringPoint([0, 0, ZD], RD - (is ? 0.1 : 0.05), turn, "z", -off), is ? pal.gold : d < day ? pal.key : pal.ink, (is ? 1 : d < day ? 0.75 : d < inMonth ? 0.4 : 0.15) * daysOn, is ? 2 : 1);
      if (is) lamp(f, outer, pal.gold, daysOn * (f.still ? 1 : 0.85 + 0.15 * Math.sin(t * 0.9)), 0.017);
    }

    // ── the index: fixed at the top, and the line it reads down
    const indexOn = f.on(0.5, 0.4);
    f.fill([[0, RB + 0.05, ZD], [-0.045, RB + 0.14, ZD], [0.045, RB + 0.14, ZD]], pal.gold, 0.95 * indexOn);
    f.line([0, RB + 0.05, ZD], [0, RM + 0.085, ZD], pal.gold, 0.4 * indexOn, 1);
    // today's bead, and the thread from today's tick to the leaf that tells it
    f.line(ringPoint([0, 0, ZD], RD - 0.1, 0.25, "z", -off), [0, TOP, PZ], pal.gold, 0.35 * daysOn, 1);
    lamp(f, own, pal.gold, bandOn, 0.024);

    // ── the block: a backing, the leaves under the top one, the binding
    const padOn = f.on(0.35, 0.45);
    const back: V3[] = [[-PX - 0.03, FOOT - 0.04, PZ + 0.02], [PX + 0.03, FOOT - 0.04, PZ + 0.02], [PX + 0.03, TOP, PZ + 0.02], [-PX - 0.03, TOP, PZ + 0.02]];
    f.fill(back, pal.bg, 0.95 * padOn);
    f.fill(back, pal.ink, 0.04 * padOn);
    f.path(back, pal.ink, 0.3 * padOn, 1, true);
    for (let j = 1; j <= 3; j++) f.line([-PX, FOOT - j * 0.011, PZ + 0.02 - j * 0.004], [PX, FOOT - j * 0.011, PZ + 0.02 - j * 0.004], pal.ink, 0.28 * padOn, 1);
    /** a place on the leaf that lies flat: across and up, 0 to 1 */
    const flat = (lu: number, lv: number): V3 => [-PX + lu * PX * 2, FOOT + lv * LEAF, PZ];
    const under: V3[] = [flat(0, 0), flat(1, 0), flat(1, 1), flat(0, 1)];
    f.fill(under, pal.ink, 0.05 * padOn);
    f.path(under, pal.ink, 0.25 * padOn, 1, true);

    // what is under it: the bell, with its crown, its clapper and two lines of the telling
    const bell = padOn * (0.4 + 0.6 * lift);
    const shape = BELL.map(([bu, bv]) => flat(bu, bv));
    f.glow(flat(0.5, 0.56), 0.5, pal.gold, 0.16 * lift * padOn);
    f.fill(shape, pal.gold, 0.16 * bell);
    f.path(shape, pal.gold, 0.95 * bell, Math.max(1, 1.6 * k), true);
    f.line(flat(0.4, 0.5), flat(0.6, 0.5), pal.gold, 0.5 * bell, 1);
    f.dot(flat(0.5, 0.3), 0.03, pal.gold, 0.95 * bell);
    const crown: V3[] = [];
    for (let i = 0; i <= 12; i++) crown.push(flat(0.5 + (Math.cos((i / 12) * TAU) * 0.03) / (PX * 2), 0.82 + (Math.sin((i / 12) * TAU) * 0.03) / LEAF));
    f.path(crown, pal.gold, 0.9 * bell, Math.max(1, 1.4 * k));
    f.line(flat(0.26, 0.17), flat(0.74, 0.17), pal.ink, 0.5 * bell, Math.max(0.8, 1.6 * k));
    f.line(flat(0.34, 0.09), flat(0.66, 0.09), pal.ink2, 0.45 * bell, Math.max(0.6, 1.2 * k));

    // ── the top leaf: it hangs from the binding and curls up off the one beneath
    const rows: [number, number][] = [[BIND, PZ - 0.006]];
    for (let i = 1; i <= STRIPS; i++) {
      const a = lift * 2.4 * (0.55 + (0.45 * i) / STRIPS);
      rows.push([rows[i - 1][0] - (Math.cos(a) * LEAF) / STRIPS, rows[i - 1][1] - (Math.sin(a) * LEAF) / STRIPS]);
    }
    const leaf: V3[] = [];
    for (let i = 0; i <= STRIPS; i++) leaf.push([-PX, rows[i][0], rows[i][1]]);
    for (let i = STRIPS; i >= 0; i--) leaf.push([PX, rows[i][0], rows[i][1]]);
    f.fill(leaf, pal.bg, 0.96 * padOn);
    f.fill(leaf, pal.ink, (0.07 + 0.05 * lift) * padOn);
    f.path(leaf, pal.ink, 0.42 * padOn, 1, true);
    f.line([-PX, rows[STRIPS][0], rows[STRIPS][1]], [PX, rows[STRIPS][0], rows[STRIPS][1]], pal.key, 0.6 * lift * padOn, 1.25);
    // its face: the month and the day of the week (it is turned away as the leaf lifts)
    const faceOn = padOn * clamp(1 - lift * 2.5) * f.on(0.7, 0.3);
    const row = (i: number): V3 => [0, rows[i][0], rows[i][1] - 0.004];
    f.label(MONTHS[month], row(1), { align: "center", size: m ? 8 : 10, colour: pal.ink2, alpha: 0.9 * faceOn });
    f.label(DAYS[f.now.getDay()], row(3), { align: "center", size: m ? 22 : 34, colour: pal.ink, alpha: 0.95 * faceOn, display: true, dy: 2 });
    f.line([-PX * 0.45, rows[5][0], rows[5][1] - 0.004], [PX * 0.45, rows[5][0], rows[5][1] - 0.004], pal.gold, 0.8 * faceOn, Math.max(1, 1.8 * k));

    const bar: V3[] = [[-PX - 0.03, BIND - 0.02, PZ - 0.012], [PX + 0.03, BIND - 0.02, PZ - 0.012], [PX + 0.03, TOP, PZ - 0.012], [-PX - 0.03, TOP, PZ - 0.012]];
    f.fill(bar, pal.bg, 0.96 * padOn);
    f.fill(bar, pal.key, 0.16 * padOn);
    f.path(bar, pal.key, 0.6 * padOn, 1, true);
    for (const side of [-1, 1]) f.dot([side * PX * 0.55, lerp(BIND - 0.02, TOP, 0.5), PZ - 0.014], 0.02, pal.ink, 0.6 * padOn);
  },
};

export default scene;
