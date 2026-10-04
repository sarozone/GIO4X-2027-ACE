/**
 * PRACTICE — the practice desk.
 *
 * A small desk with three things on it. A chart pane, on which a price walks:
 * a line that arrives at the right and passes away to the left, with one level
 * ruled across it in champagne, the entry. A ticket, with its two keys, BUY
 * and SELL. And a balance gauge, a half dial whose needle leans to one side or
 * the other as the price stands above or below the entry.
 *
 * The walk is invented, as it is on the page below: a fixed sum of slow waves,
 * the same for every visitor, on a pane with no symbol, no scale figures and
 * no reading. The gauge has graduations and no amounts.
 *
 * The pointer sets the entry: held over the chart it carries the champagne
 * level up and down, and the needle answers at once. A key under it is pressed.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { lamp, panel, ring, slab, trace } from "../kit";

/** the desk top, and the desk's half width and half depth */
const [TOP, DW, DD] = [-0.9, 1.62, 0.42];
/** the chart pane: centre, width, height, turn */
const CHART: V3 = [-0.55, 0.12, 0.1];
const [PW, PH, PYAW] = [2.05, 1.45, -0.1];
/** the ticket, and the gauge beneath it */
const TICKET: V3 = [1.17, 0.47, -0.05];
const [TW, TH, TYAW] = [0.92, 0.74, 0.24];
const GAUGE: V3 = [1.17, -0.62, -0.05];
const GR = 0.4;
/** where on the pane the line ends, and the band of its height the price moves in */
const [HEAD, LOW, SPAN] = [0.78, 0.14, 0.68];
/** how far content stands off the glass */
const L = 0.02;

type State = { v: number; held: number; a: number; b: number; c: number };

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    return { v: 0.5, held: 0, a: f.rnd(1) * 6, b: f.rnd(2) * 6, c: f.rnd(3) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.07 + (f.still ? 0 : Math.sin(t * 0.07) * 0.04), 0.14, 6.3, 1);

    /** the invented price at a moment: 0 to 1, never still and never leaving the pane */
    const walk = (x: number) => 0.5 + 0.2 * Math.sin(x * 0.9 + s.a) + 0.11 * Math.sin(x * 2.3 + s.b) + 0.06 * Math.sin(x * 5.3 + s.c);
    const clock = t * 0.22;
    const price = walk(clock);

    // ── the desk, and the post that carries the ticket over the gauge
    const deskOn = f.on(0, 0.35);
    slab(f, [-DW, TOP - 0.1, -DD], [DW, TOP, DD], pal.ink, 0.07, deskOn);
    f.line([TICKET[0], TOP, 0.06], [TICKET[0], TICKET[1] - TH / 2, 0.06], pal.ink, 0.3 * deskOn, 2);

    // ── the chart pane
    const chartOn = f.on(0.1, 0.4);
    const pane = panel(f, CHART, PW, PH, { yaw: PYAW, tilt: 0.04, colour: pal.key, on: chartOn, header: true });
    for (const u of [0.14, 0.86]) {
      const foot = pane.at(u, 0);
      f.line(foot, [foot[0], TOP, foot[2]], pal.ink, 0.3 * chartOn, 1.5);
    }
    for (let i = 1; i <= 4; i++) f.line(pane.at(0.04, 0.88 * (i / 5), L), pane.at(0.96, 0.88 * (i / 5), L), pal.ink, 0.07 * chartOn, 1);
    for (let i = 0; i <= 16; i++) f.line(pane.at(0.04 + i * 0.0575, 0.04, L), pane.at(0.04 + i * 0.0575, i % 4 === 0 ? 0.075 : 0.058, L), pal.ink, 0.3 * chartOn, 1);

    // the entry: it rests on the middle of the pane; over the chart the pointer carries it
    const pt = f.P(...pane.at(0.5, LOW + SPAN, L));
    const pb = f.P(...pane.at(0.5, LOW, L));
    const pl = f.P(...pane.at(0, 0.5, L));
    const pr = f.P(...pane.at(1, 0.5, L));
    let want = 0.5;
    let over = 0;
    if (pt && pb && pl && pr && Math.abs(pb.y - pt.y) > 1 && f.hover > 0) {
      const v = (pb.y - f.my) / (pb.y - pt.y);
      if (v > -0.15 && v < 1.2 && f.mx > pl.x && f.mx < pr.x) {
        want = clamp(v, 0.04, 0.96);
        over = f.hover;
      }
    }
    const ease = f.still ? 1 : 1 - Math.exp(-f.dt * 7);
    s.v += (lerp(0.5, want, over) - s.v) * ease;
    s.held += (over - s.held) * ease;
    const entry = LOW + SPAN * s.v;
    const level = LOW + SPAN * price;

    // the walk: the line passes away to the left as new price arrives at the right
    const n = Math.round((m ? 30 : 52) * f.q);
    const shown = Math.max(2, Math.round(n * f.on(0.25, 0.5)));
    const line: V3[] = [];
    for (let i = n - shown; i <= n; i++) line.push(pane.at(lerp(0.05, HEAD, i / n), LOW + SPAN * walk(clock - (n - i) * (3.5 / n)), L));
    const gain = price >= s.v;
    const side = gain ? pal.emerald : pal.crimson;
    const lineOn = f.on(0.3, 0.4);
    // the ground between the price and the entry, where the line now stands
    f.fill([pane.at(HEAD, entry, L), pane.at(0.96, entry, L), pane.at(0.96, level, L), pane.at(HEAD, level, L)], side, 0.2 * lineOn);
    trace(f, line, pal.key, 0.9 * lineOn, 1.5);
    f.line(pane.at(HEAD, level, L), pane.at(0.96, level, L), pal.ink, 0.5 * lineOn, 1);
    lamp(f, pane.at(HEAD, level, L), pal.key, lineOn * (f.still ? 1 : 0.85 + 0.15 * Math.sin(t * 1.2)), 0.02);

    const entryOn = f.on(0.5, 0.3);
    f.line(pane.at(0.04, entry, L), pane.at(0.96, entry, L), pal.gold, (0.75 + 0.25 * s.held) * entryOn, 1.25 + 0.75 * s.held);
    f.line(pane.at(0.04, entry, L), pane.at(0.96, entry, L), pal.gold, 0.14 * entryOn, 6);
    f.dot(pane.at(0.96, entry, L), 0.018, pal.gold, entryOn);

    // ── the gauge: a half dial, graduated, with the two sides it can lean to
    const gaugeOn = f.on(0.4, 0.4);
    const face: V3[] = [];
    for (let i = 0; i <= 24; i++) face.push([GAUGE[0] + Math.cos((i / 24) * Math.PI) * GR, GAUGE[1] + Math.sin((i / 24) * Math.PI) * GR, GAUGE[2]]);
    f.fill(face, pal.bg, 0.85 * gaugeOn);
    f.fill(face, pal.ink, 0.04 * gaugeOn);
    f.line([GAUGE[0], TOP, GAUGE[2]], [GAUGE[0], GAUGE[1], GAUGE[2]], pal.ink, 0.3 * gaugeOn, 2);
    f.line(face[0], face[24], pal.ink, 0.4 * gaugeOn, 1);
    ring(f, GAUGE, GR, { axis: "z", from: 0, to: 0.5, colour: pal.ink, alpha: 0.5 * gaugeOn, ticks: 20, major: 5, tickLen: 0.045 });
    ring(f, GAUGE, GR * 0.72, { axis: "z", from: 0.03, to: 0.23, colour: pal.emerald, alpha: (gain ? 0.9 : 0.35) * gaugeOn, width: 2 });
    ring(f, GAUGE, GR * 0.72, { axis: "z", from: 0.27, to: 0.47, colour: pal.crimson, alpha: (gain ? 0.35 : 0.9) * gaugeOn, width: 2 });
    const lean = clamp(0.5 + (price - s.v) * 0.85, 0.05, 0.95);
    const na = Math.PI * (1 - lerp(0.5, lean, f.on(0.6, 0.4)));
    const tip: V3 = [GAUGE[0] + Math.cos(na) * GR * 0.86, GAUGE[1] + Math.sin(na) * GR * 0.86, GAUGE[2] - 0.02];
    f.line([GAUGE[0], GAUGE[1], GAUGE[2] - 0.02], tip, pal.gold, 0.2 * gaugeOn, 5);
    f.line([GAUGE[0], GAUGE[1], GAUGE[2] - 0.02], tip, pal.gold, 0.95 * gaugeOn, 1.75);
    f.dot([GAUGE[0], GAUGE[1], GAUGE[2] - 0.02], 0.035, pal.gold, gaugeOn);
    f.dot([GAUGE[0], GAUGE[1], GAUGE[2] - 0.02], 0.013, pal.bg, gaugeOn);

    // ── the ticket and its two keys
    const ticketOn = f.on(0.3, 0.4);
    const ticket = panel(f, TICKET, TW, TH, { yaw: TYAW, tilt: 0.04, colour: pal.key, on: ticketOn, header: true });
    f.line(ticket.at(0.08, 0.74, L), ticket.at(0.6, 0.74, L), pal.ink, 0.3 * ticketOn, 1);
    f.line(ticket.at(0.08, 0.66, L), ticket.at(0.42, 0.66, L), pal.ink, 0.2 * ticketOn, 1);
    const turn = f.still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.4);
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    (["BUY", "SELL"] as const).forEach((text, i) => {
      const [u0, u1] = i === 0 ? [0.08, 0.47] : [0.53, 0.92];
      const colour = i === 0 ? pal.emerald : pal.crimson;
      const press = f.near(ticket.at((u0 + u1) / 2, 0.34), m ? 34 : 48);
      // a key stands proud of the glass; pressed, it goes in and lights
      const lift = L + 0.05 * (1 - 0.85 * press);
      const key: V3[] = [ticket.at(u0, 0.14, lift), ticket.at(u1, 0.14, lift), ticket.at(u1, 0.54, lift), ticket.at(u0, 0.54, lift)];
      const glow = Math.max(press, (0.25 + 0.3 * (i === 0 ? turn : 1 - turn)) * (1 - f.hover));
      f.fill(key, pal.bg, 0.9 * ticketOn);
      f.fill(key, colour, (0.16 + 0.4 * glow) * ticketOn);
      f.path(key, colour, (0.6 + 0.4 * glow) * ticketOn, 1.25, true);
      f.label(text, ticket.at((u0 + u1) / 2, 0.34, lift), { align: "center", size, colour: pal.ink, alpha: (0.8 + 0.2 * glow) * f.on(0.7, 0.3) });
    });

    // ── the lettering: names of parts only
    const named = f.on(0.8, 0.2);
    f.label("PRACTICE", pane.at(0.04, 0.94, L), { size, colour: pal.ink2, alpha: 0.8 * named });
    f.label("ENTRY", pane.at(0.05, entry, L), { size, colour: pal.gold, alpha: 0.95 * named, dy: entry > 0.7 ? 10 : -9 });
    f.label("BALANCE", GAUGE, { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: 13 });
    ctx.restore();
  },
};

export default scene;
