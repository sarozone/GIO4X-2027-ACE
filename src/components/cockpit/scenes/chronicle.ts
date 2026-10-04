/**
 * CHRONICLE — market history, as a line that runs back into the distance.
 *
 * A rail lies across the floor from the far right, where the record begins,
 * to the near left, where it ends. Eleven markers stand on it, one for each
 * episode the page tells, and each is the same figure at a different size: a
 * slow climb, a peak, a fall much faster than the climb. A light walks the
 * rail from the oldest to the newest and each marker is lit as it is reached,
 * with its year over the peak.
 *
 * The years are the page's own. The humps are one drawing repeated: their
 * sizes are not measurements of anything, and none carries a figure.
 *
 * The pointer: the marker under it is lit and named, whatever the light is
 * doing.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { lamp, pool, trace } from "../kit";

const YEARS = [1637, 1720, 1929, 1987, 1992, 1997, 2000, 2008, 2010, 2015, 2020];
/** how tall each marker stands: a different size each, and no more than that */
const TALL = [0.55, 0.75, 1.15, 0.7, 0.5, 0.62, 0.95, 1.1, 0.45, 0.58, 0.9];
const N = YEARS.length;
const FLOOR = -0.75;
/** the two ends of the rail on the floor, as [x, z]: the far one is the oldest */
const FAR = [2.3, 4.4];
const NEAR = [-1.1, -1.0];
/** seconds the light gives to one marker */
const HOLD = 2.4;
/** where along its width a marker peaks */
const PEAK = 0.72;

const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
/** the one figure: a climb that gathers pace, then a fall in a quarter of the time */
const shape = (u: number) => (u < PEAK ? Math.pow(u / PEAK, 2.2) : 1 - smooth((u - PEAK) / (1 - PEAK)));
const along = (k: number): V3 => [lerp(FAR[0], NEAR[0], k), FLOOR, lerp(FAR[1], NEAR[1], k)];

type Mark = { year: string; pts: V3[]; peak: V3; mid: V3; base: V3; k: number };
type State = { marks: Mark[]; lead: number; phase: number };

const scene: Scene<State> = {
  pose: 8.4,
  setup(f) {
    const seg = f.mobile ? 12 : 18;
    const marks = YEARS.map((year, i) => {
      const k = i / (N - 1);
      const base = along(k);
      const w = 0.46 + 0.16 * f.rnd(i);
      const h = TALL[i] * (0.93 + 0.14 * f.rnd(i + 20));
      const pts: V3[] = [];
      for (let j = 0; j <= seg; j++) pts.push([base[0] + (j / seg - 0.5) * w, FLOOR + h * shape(j / seg), base[2]]);
      const px = base[0] + (PEAK - 0.5) * w;
      return { year: String(year), pts, peak: [px, FLOOR + h, base[2]] as V3, mid: [px, FLOOR + h * 0.5, base[2]] as V3, base, k };
    });
    return { marks, lead: Math.floor(f.rnd(40) * N), phase: f.rnd(41) * 6 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    f.aim(0.05 + (f.still ? 0 : Math.sin(f.t * 0.07 + s.phase) * 0.03), -0.2, 6.3, 0.92);

    // ── the light on the rail: `cur` runs 0 to 11, and marker i has it from i to i + 1
    const cur = (((f.t / HOLD + s.lead) % N) + N) % N;
    const arrive = f.on(1, 0.3);
    const walk = clamp(cur * 2) * clamp((N - cur) * 2) * arrive;

    // ── the rail, drawn in from the far end, with a sleeper under every marker
    const rail = f.on(0, 0.6);
    const [r0, r1] = [along(-0.07), along(lerp(-0.07, 1.07, rail))];
    f.line(r0, r1, pal.ink, 0.12 * f.boot, 4);
    trace(f, [r0, r1], pal.key, 0.5 * f.boot, 1.1);

    // ── the markers, the oldest and farthest first
    for (let i = 0; i < N; i++) {
      const mk = s.marks[i];
      const on = f.on(0.15 + 0.7 * mk.k, 0.3);
      if (on <= 0.003) continue;
      const d = ((((cur - i - 0.5) % N) + N * 1.5) % N) - N / 2;
      const hold = f.near(mk.mid, f.u * 0.34);
      const lit = Math.max(smooth(1.25 - Math.abs(d) * 1.5) * arrive * (1 - 0.8 * f.hover), hold);
      // distance takes a little of the light, as it does
      const a = lerp(0.6, 1, mk.k) * on;
      const [bx, bz] = [mk.base[0], mk.base[2]];

      f.line([bx - 0.3, FLOOR, bz], [bx + 0.3, FLOOR, bz], pal.ink, 0.3 * a, 1);
      if (lit > 0.02) pool(f, mk.base, 0.6, pal.gold, 0.3 * lit * a);
      f.fill(mk.pts, pal.bg, 0.74 * a);
      f.fill(mk.pts, pal.key, 0.07 * (1 - lit) * a);
      f.fill(mk.pts, pal.gold, 0.2 * lit * a);
      f.path(mk.pts, pal.key, 0.62 * (1 - lit) * a, 1.2);
      if (lit > 0.01) {
        trace(f, mk.pts, pal.gold, lit * a, 1.6, f.still ? -1 : f.t / 3.2);
        // the turn: a drop line from the peak to the rail, and a lamp on the peak
        f.line(mk.peak, [mk.peak[0], FLOOR, bz], pal.gold, 0.3 * lit * a, 1);
        lamp(f, mk.peak, pal.gold, lit * a, 0.016);
        f.label(mk.year, mk.peak, { align: "center", dy: -14, size: m ? 10 : 11, colour: pal.gold, alpha: 0.98 * lit * on });
      }
    }

    // the walker, and the two ends of the record named under the rail
    if (walk > 0.003) lamp(f, along(clamp((cur - 0.5) / (N - 1))), pal.ink, 0.8 * walk, 0.014);
    const named = f.on(0.9, 0.1);
    f.label(s.marks[0].year, along(-0.07), { align: "center", dy: 13, size: 9, colour: pal.ink2, alpha: 0.7 * named });
    f.label(s.marks[N - 1].year, along(1.07), { align: "center", dy: 14, size: m ? 9 : 10, colour: pal.ink2, alpha: 0.8 * named });
  },
};

export default scene;
