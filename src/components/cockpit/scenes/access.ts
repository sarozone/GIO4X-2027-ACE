/**
 * ACCESS — one page, read in more than one way.
 *
 * A page stands on the left: a heading, lines of text, a button and a small
 * moving picture. Beside it are the three things a reader may change. A dial
 * of contrast, whose mark is the half-filled disc: as it turns, the text goes
 * from faint to full. A slider of text size between a small A and a large one:
 * as it travels, the lines grow heavier and fewer fit the page. A switch for
 * motion: when it is off the picture stops where it is, the dust in the air
 * hangs still, and a pause mark stands in the picture's corner.
 *
 * A fine dotted line joins everything that can be reached from the keyboard,
 * in the order it is reached, and a focus ring in champagne steps along it
 * from one to the next.
 *
 * The pointer: the focus ring goes to whatever is nearest to it.
 *
 * The controls here are drawings. None reports the visitor's own settings,
 * which are kept on the Preferences page.
 */
import { TAU, clamp, lerp, rgba, type Scene, type V3 } from "../engine";
import { deck, lamp, panel, pool, ring, ringPoint } from "../kit";

const FLOOR = -1.22;
/** the page: its centre, its width and its height */
const PAGE: V3 = [-0.54, 0, 0.05];
const [PW, PH] = [1.8, 2.1];
/** the controls stand in a column beside it */
const CX = 1.14;
const DIAL: V3 = [CX, 0.7, 0];
const SLIDER: V3 = [CX, -0.02, 0];
const SWITCH: V3 = [CX, -0.62, 0];
const [DR, TRACK, PILL, CAP] = [0.24, 0.36, 0.12, 0.085];
/** seconds the focus rests on one stop before it moves on */
const REST = 3.4;

type Stop = { p: V3; hw: number; hh: number };
type State = { at: [number, number, number, number, number]; spin: number; widths: number[] };

const scene: Scene<State> = {
  // the composed still: contrast full, the text large, motion on, the focus on the dial
  pose: 8,
  setup(f) {
    return { at: [DIAL[0], DIAL[1], DIAL[2], 0.3, 0.3], spin: 2, widths: Array.from({ length: 10 }, (_, i) => 0.62 + 0.38 * f.rnd(i + 30)) };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    const composed = f.still || f.dt === 0;
    f.aim(-0.08 + (f.still ? 0 : Math.sin(t * 0.07) * 0.03), -0.06, 6.4, m ? 0.9 : 0.95);
    // stroke weights follow the size of the frame
    const k = clamp(f.u / 110, 0.6, 1.3);

    // ── what the three controls are set to: each drifts through its range on its own time
    const contrast = 0.5 + 0.5 * Math.sin(t * 0.17);
    const size = 0.5 + 0.5 * Math.sin(t * 0.13 + 1);
    // (the switch is thrown, rests, and is thrown back)
    const lever = clamp(0.5 + Math.sin((t * TAU) / 26) * 3);
    const motion = lever * lever * (3 - 2 * lever);
    if (!composed) s.spin += f.dt * motion;

    deck(f, { y: FLOOR, alpha: 0.09, drift: 0 });
    pool(f, [0.1, FLOOR, 0], 2.4, pal.key, 0.18 * f.boot);

    // ── dust in the air: it drifts while motion is on, and hangs where it is when it is off
    const motes = Math.round((m ? 8 : 18) * f.q);
    for (let i = 0; i < motes; i++) {
      const life = (f.rnd(i * 3 + 1) + s.spin * (0.012 + 0.012 * f.rnd(i * 3 + 2))) % 1;
      f.dot([(f.rnd(i * 3) - 0.5) * 3.6, -1.1 + life * 2.2, 0.5 + f.rnd(i * 3 + 4) * 0.8], 0.008, i % 3 ? pal.ink : pal.key, Math.sin(Math.PI * life) * 0.4 * f.boot);
    }

    // ── the page
    const pg = panel(f, PAGE, PW, PH, { yaw: 0.12, colour: pal.key, on: f.on(0, 0.5) });
    const on = pg.on * f.on(0.2, 0.4);
    const text = lerp(0.24, 0.9, contrast) * on;
    const head = 0.34 + 0.16 * size;
    f.line(pg.at(0.08, 0.9, 0.01), pg.at(0.08 + head, 0.9, 0.01), pal.ink, lerp(0.5, 1, contrast) * on, Math.max(1, (2.6 + 2.6 * size) * k));
    // the lines of text: heavier and further apart as the size grows, so fewer of them fit
    const pitch = lerp(0.052, 0.098, size);
    for (let r = 0, v = 0.79; v > 0.55; r++, v -= pitch) {
      const len = 0.84 * (v - pitch <= 0.55 ? 0.5 : s.widths[r % s.widths.length]);
      f.line(pg.at(0.08, v, 0.01), pg.at(0.08 + len, v, 0.01), pal.ink, text * clamp((v - 0.55) / 0.03), Math.max(0.6, lerp(1, 2.7, size) * k));
    }
    // a button
    const button: V3[] = [pg.at(0.08, 0.43, 0.01), pg.at(0.34, 0.43, 0.01), pg.at(0.34, 0.51, 0.01), pg.at(0.08, 0.51, 0.01)];
    f.fill(button, pal.key, lerp(0.08, 0.22, contrast) * on);
    f.path(button, pal.key, lerp(0.45, 0.95, contrast) * on, 1, true);
    f.line(pg.at(0.14, 0.47, 0.012), pg.at(0.28, 0.47, 0.012), pal.ink, text, Math.max(0.8, 1.8 * k));
    // the moving picture: a wave that travels and a point that goes round
    const picture: V3[] = [pg.at(0.08, 0.07, 0.01), pg.at(0.92, 0.07, 0.01), pg.at(0.92, 0.36, 0.01), pg.at(0.08, 0.36, 0.01)];
    f.fill(picture, pal.ink, 0.03 * on);
    f.path(picture, pal.ink, 0.25 * on, 1, true);
    const wave: V3[] = [];
    const seg = Math.max(12, Math.round(26 * f.q));
    for (let i = 0; i <= seg; i++) wave.push(pg.at(0.12 + (0.5 * i) / seg, 0.215 + 0.07 * Math.sin((i / seg) * TAU * 1.5 - s.spin * 1.3), 0.012));
    f.path(wave, pal.teal, 0.16 * on, 4 * k);
    f.path(wave, pal.teal, 0.9 * on, Math.max(0.8, 1.4 * k));
    const orbit = (turn: number, r: number): V3 => pg.at(0.78 + (Math.cos(turn * TAU) * r) / PW, 0.215 + (Math.sin(turn * TAU) * r) / PH, 0.012);
    const round: V3[] = [];
    for (let i = 0; i <= 20; i++) round.push(orbit(i / 20, 0.11));
    f.path(round, pal.ink, 0.3 * on, 1);
    lamp(f, orbit(s.spin * 0.12, 0.11), pal.indigo, 0.9 * on, 0.014);
    // its corner says which it is: running, or held
    f.fill([pg.at(0.865, 0.305, 0.012), pg.at(0.865, 0.345, 0.012), pg.at(0.89, 0.325, 0.012)], pal.ink2, 0.8 * motion * on);
    for (const du of [0, 0.018]) f.line(pg.at(0.867 + du, 0.307, 0.012), pg.at(0.867 + du, 0.343, 0.012), pal.gold, 0.95 * (1 - motion) * on, Math.max(1, 1.8 * k));

    // ── everything the keyboard reaches, in order
    const stops: Stop[] = [
      { p: pg.at(0.08 + head / 2, 0.9, 0.01), hw: (head * PW) / 2 + 0.07, hh: 0.09 },
      { p: pg.at(0.21, 0.47, 0.01), hw: 0.3, hh: 0.14 },
      { p: DIAL, hw: DR + 0.06, hh: DR + 0.06 },
      { p: SLIDER, hw: TRACK + 0.1, hh: 0.12 },
      { p: SWITCH, hw: PILL + CAP + 0.07, hh: CAP + 0.07 },
    ];
    let target = Math.floor(t / REST) % stops.length;
    if (f.hover > 0.02) {
      // the hand takes it: the stop nearest the pointer
      let best = 1e9;
      stops.forEach((st, i) => {
        const p = f.P(...st.p);
        if (!p) return;
        const d = (p.x - f.mx) ** 2 + (p.y - f.my) ** 2;
        if (d < best) {
          best = d;
          target = i;
        }
      });
    }
    const want = stops[target];
    const goal = [want.p[0], want.p[1], want.p[2], want.hw, want.hh];
    const rate = composed ? (f.still ? 1 : 0) : 1 - Math.exp(-f.dt * 6);
    for (let i = 0; i < 5; i++) s.at[i] += (goal[i] - s.at[i]) * rate;
    /** how much the focus is on stop i */
    const held = (i: number) => clamp(1 - Math.hypot(s.at[0] - stops[i].p[0], s.at[1] - stops[i].p[1]) / 0.3);

    const pathOn = f.on(0.6, 0.3);
    ctx.setLineDash([2, 5]);
    f.path(stops.map((st) => st.p), pal.ink, 0.3 * pathOn, 1);
    ctx.setLineDash([]);
    stops.forEach((st, i) => f.dot([st.p[0] - st.hw, st.p[1] + st.hh, st.p[2]], 0.013, i <= target ? pal.key : pal.ink, (i <= target ? 0.9 : 0.4) * pathOn));

    // ── contrast: a dial, its index, and the half-filled disc that turns with it
    const dialOn = f.on(0.35, 0.4);
    const mark = lerp(0.625, -0.125, contrast);
    ring(f, DIAL, DR, { axis: "z", from: -0.125, to: 0.625, colour: pal.ink, alpha: 0.32 * dialOn, ticks: m ? 12 : 24, major: 6, tickLen: 0.03, seg: 48 });
    ring(f, DIAL, DR, { axis: "z", from: mark, to: 0.625, colour: pal.key, alpha: (0.6 + 0.4 * held(2)) * dialOn, width: 1.6, seg: 40 });
    const disc: V3[] = [];
    const half: V3[] = [];
    for (let i = 0; i <= 24; i++) {
      disc.push(ringPoint(DIAL, 0.12, i / 24, "z"));
      if (i <= 12) half.push(ringPoint(DIAL, 0.12, mark - 0.25 + i / 24, "z"));
    }
    f.fill(disc, pal.bg, 0.9 * dialOn);
    f.fill(half, pal.ink, lerp(0.3, 0.9, contrast) * dialOn);
    f.path(disc, pal.ink, 0.6 * dialOn, 1, true);
    f.line(ringPoint(DIAL, 0.14, mark, "z"), ringPoint(DIAL, DR - 0.03, mark, "z"), pal.key, dialOn, Math.max(1, 1.8 * k));
    f.dot(ringPoint(DIAL, DR, mark, "z"), 0.018, pal.key, dialOn);

    // ── text size: a slider between a small A and a large one
    const slideOn = f.on(0.45, 0.4);
    const [sy, sx] = [SLIDER[1], SLIDER[0] + lerp(-TRACK, TRACK, size)];
    f.line([CX - TRACK, sy, 0], [CX + TRACK, sy, 0], pal.ink, 0.3 * slideOn, 1.5);
    f.line([CX - TRACK, sy, 0], [sx, sy, 0], pal.key, (0.6 + 0.4 * held(3)) * slideOn, 1.6);
    for (let i = 0; i <= 4; i++) f.line([CX - TRACK + (i * TRACK) / 2, sy - 0.035, 0], [CX - TRACK + (i * TRACK) / 2, sy - 0.06, 0], pal.ink, 0.35 * slideOn, 1);
    const cap: V3[] = [[sx - 0.035, sy - 0.07, -0.01], [sx + 0.035, sy - 0.07, -0.01], [sx + 0.035, sy + 0.07, -0.01], [sx - 0.035, sy + 0.07, -0.01]];
    f.fill(cap, pal.bg, 0.95 * slideOn);
    f.fill(cap, pal.key, 0.3 * slideOn);
    f.path(cap, pal.key, slideOn, 1.25, true);
    f.label("A", [CX - TRACK, sy + 0.17, 0], { align: "center", size: m ? 7 : 9, colour: pal.ink2, alpha: lerp(1, 0.5, size) * slideOn });
    f.label("A", [CX + TRACK, sy + 0.19, 0], { align: "center", size: m ? 12 : 16, colour: pal.ink, alpha: lerp(0.5, 1, size) * slideOn, display: true });

    // ── motion: a switch
    const switchOn = f.on(0.55, 0.4);
    const pill: V3[] = [];
    for (let i = 0; i <= 10; i++) pill.push([CX + PILL + Math.sin((i / 10) * Math.PI) * CAP, SWITCH[1] + Math.cos((i / 10) * Math.PI) * CAP, 0]);
    for (let i = 0; i <= 10; i++) pill.push([CX - PILL - Math.sin((i / 10) * Math.PI) * CAP, SWITCH[1] - Math.cos((i / 10) * Math.PI) * CAP, 0]);
    f.fill(pill, pal.bg, 0.9 * switchOn);
    f.fill(pill, pal.key, 0.22 * motion * switchOn);
    f.path(pill, motion > 0.5 ? pal.key : pal.ink, (0.45 + 0.4 * motion + 0.15 * held(4)) * switchOn, 1.25, true);
    const knob: V3 = [CX + lerp(-PILL, PILL, motion), SWITCH[1], -0.01];
    f.dot(knob, CAP * 0.72, pal.ink, (0.55 + 0.4 * motion) * switchOn);
    f.dot(knob, CAP * 0.3, pal.bg, 0.5 * switchOn);

    const named = f.on(0.85, 0.15);
    const small = m ? 7 : 9;
    ctx.save();
    ctx.letterSpacing = m ? "1px" : "1.5px";
    f.label("CONTRAST", [CX, DIAL[1] - DR * 0.72, 0], { align: "center", dy: 11, size: small, colour: pal.ink2, alpha: 0.85 * named });
    f.label("TEXT", [CX, sy - 0.07, 0], { align: "center", dy: 11, size: small, colour: pal.ink2, alpha: 0.85 * named });
    f.label("MOTION", [CX, SWITCH[1] - CAP, 0], { align: "center", dy: 11, size: small, colour: pal.ink2, alpha: 0.85 * named });
    ctx.restore();

    // ── the focus ring: champagne, round the stop it is on
    const c = f.P(s.at[0], s.at[1], s.at[2]);
    if (c && pathOn > 0.01) {
      const hw = Math.max(4, s.at[3] * c.s * f.u);
      const hh = Math.max(4, s.at[4] * c.s * f.u);
      const r = Math.min(7, hw, hh);
      const [x0, y0, x1, y1] = [c.x - hw, c.y - hh, c.x + hw, c.y + hh];
      for (const [grow, width, alpha] of [[3, 5, 0.16], [0, 2, 0.95]] as const) {
        ctx.beginPath();
        ctx.moveTo(x0 - grow + r, y0 - grow);
        ctx.arcTo(x1 + grow, y0 - grow, x1 + grow, y1 + grow, r);
        ctx.arcTo(x1 + grow, y1 + grow, x0 - grow, y1 + grow, r);
        ctx.arcTo(x0 - grow, y1 + grow, x0 - grow, y0 - grow, r);
        ctx.arcTo(x0 - grow, y0 - grow, x1 + grow, y0 - grow, r);
        ctx.closePath();
        ctx.strokeStyle = rgba(pal.gold, alpha * pathOn);
        ctx.lineWidth = width;
        ctx.stroke();
      }
    }
  },
};

export default scene;
