/**
 * CHART SCHOOL: the invented price every machine on /chart-school draws.
 *
 * A pure module: no imports, no clock, no storage, no Math.random(). A chart
 * number always produces the same bars.
 *
 * Nothing in here is a real price or a real instrument. The price is a seeded
 * random walk that starts at 100, with stretches that lean up, lean down or
 * lean nowhere, quieter and faster spells, and a small jump between two bars
 * now and then. Where it goes next cannot be known from where it has been:
 * an indicator drawn on it describes the walk so far and nothing else.
 *
 * The volume (makeVolumes) is invented in the same way and for the same
 * reason: it is nobody's trading, counted nowhere.
 */

export type Bar = { o: number; h: number; l: number; c: number };

export const CHART = {
  /** bars made for one chart: the first ones only warm the indicators up */
  bars: 200,
  /** bars drawn: the last ones */
  shown: 90,
  /** every chart starts here */
  start: 100,
  /** steps of the walk inside one bar */
  steps: 8,
} as const;

/** mulberry32: one 32-bit state in, a number in [0, 1) and the next state out */
function rand(a: number): [number, number] {
  const s = (a + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** The bars of one chart number. Prices are whole hundredths inside, so the walk never drifts by rounding. */
export function makeBars(seed: number, count: number = CHART.bars): Bar[] {
  let state = Math.imul(seed | 0, 2654435761) >>> 0;
  const u = () => {
    const [v, s] = rand(state);
    state = s;
    return v;
  };
  const floor = CHART.start * 20;
  let p = CHART.start * 100;
  let leanLeft = 0;
  let lean = 0;
  let fastLeft = 0;
  const out: Bar[] = [];
  for (let b = 0; b < count; b++) {
    // a stretch that leans one way, for a while
    if (leanLeft <= 0) {
      leanLeft = 14 + Math.floor(u() * 40);
      const r = u();
      lean = (r < 0.33 ? -1 : r < 0.66 ? 1 : 0) * (0.8 + u() * 2.2);
    }
    leanLeft -= 1;
    if (fastLeft > 0) fastLeft -= 1;
    else if (u() < 0.035) fastLeft = 5 + Math.floor(u() * 12);
    // a small jump between two bars: nothing traded in between
    if (b > 0 && u() < 0.06) p += Math.round((u() - 0.5) * 180);
    if (p < floor) p = floor + (floor - p);
    const o = p;
    let h = p;
    let l = p;
    for (let s = 0; s < CHART.steps; s++) {
      // the sum of four uniforms is close enough to a bell curve for an invented price (sd 0.5774 before scaling)
      const n = u() + u() + u() + u() - 2;
      p += Math.round((n / 0.5774) * (fastLeft > 0 ? 38 : 18) + lean);
      if (p < floor) p = floor + (floor - p);
      if (p > h) h = p;
      if (p < l) l = p;
    }
    out.push({ o: o / 100, h: h / 100, l: l / 100, c: p / 100 });
  }
  return out;
}

/** The invented volume: what a bar of no size at all would be given, and what each whole point of size adds, before chance. */
export const VOLUME = { base: 400, perPoint: 1000 } as const;

/**
 * The volume of each bar of one chart number: as invented as the prices, and
 * in no unit at all. It is drawn from a random stream of its own, begun from a
 * different state, so that makeBars() uses its stream exactly as it always
 * has and no price is changed by there being a volume.
 *
 * A bar's size is the distance it covered, the jump from the previous close
 * included; its volume is that size scaled, then spread by chance between 0.6
 * and 1.4 of it. Larger bars therefore tend to have larger volumes, and two
 * bars of the same size seldom have the same one. Always a whole number, and
 * never less than 1.
 */
export function makeVolumes(seed: number, bars: readonly Bar[] = makeBars(seed)): number[] {
  let state = Math.imul((seed | 0) ^ 0x9e3779b9, 2246822519) >>> 0;
  return bars.map((b, i) => {
    const [v, s] = rand(state);
    state = s;
    const prev = i > 0 ? bars[i - 1]!.c : b.o;
    const size = Math.max(b.h, prev) - Math.min(b.l, prev);
    return Math.max(1, Math.round((VOLUME.base + VOLUME.perPoint * size) * (0.6 + 0.8 * v)));
  });
}
