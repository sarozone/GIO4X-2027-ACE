/**
 * RISK HUB — four measures on one line, and the one hand that sets them.
 *
 * A single lit line runs across the stage, and four things stand on it in the
 * order one leads to the next. First a block: what one trade may lose. A
 * governor stands over it, a handwheel on a threaded stem with a jaw at its
 * foot, and the block can be no taller than the jaw allows. Then a bar: the
 * day. Blocks arrive in it one after another and it fills by as much as each
 * is large, up to the mark at its end where the day stops. Then the line
 * itself sinks into a trough, the drawdown, which runs as deep as the blocks
 * that fed it were large. Under the trough lies the floor, and a rule at the
 * right measures what room is left above it.
 *
 * Tighten the governor and the block is small, the bar barely fills and the
 * trough is shallow, far above the floor. Open it and everything downstream
 * grows together until the trough is nearly on the floor.
 *
 * It is a drawing of how the four depend on each other: no scale, no figure,
 * and no setting here is a recommended one.
 *
 * The pointer is the hand on the governor: left tightens it, right opens it.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { box, deck, lamp, pool, ring, ringPoint, slab, trace } from "../kit";

const DECK = -1.2;
/** the line everything stands on, and the floor under the trough */
const [Y0, FY] = [0.25, -0.82];
/** the governor: its handwheel, and the block under its jaw */
const WHEEL: V3 = [-1.3, 0.92, 0];
const WR = 0.17;
const [SMALL, LARGE] = [0.13, 0.36];
/** the day's bar: where it begins and ends, its height and half its depth */
const [B0, B1, BH, BZ] = [-0.9, -0.1, 0.18, 0.07];
/** the trough: where the line sinks and where it is level again */
const [T0, T1] = [0.1, 1.05];
/** the rule that measures the room left, and half the depth of the floor */
const [RX, FZ] = [1.3, 0.45];
/** seconds for one day: three blocks arrive, the bar is read, it is cleared */
const CYCLE = 14;

type State = { v: number; phase: number };

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const scene: Scene<State> = {
  // the composed still: the governor half open, the day's three blocks in
  pose: CYCLE * 0.8,
  setup(f) {
    return { v: 0.5, phase: f.rnd(4) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.16 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.035), -0.14, 6.4, m ? 0.9 : 0.95);
    const k = clamp(f.u / 110, 0.6, 1.3);

    // ── the governor: it opens and closes slowly by itself, and under the pointer it is where the hand puts it
    let want = f.still ? 0.5 : 0.5 + 0.4 * Math.sin(t * 0.16 + s.phase);
    want = lerp(want, clamp((f.mx - f.box.x) / Math.max(1, f.box.w)), f.hover);
    s.v = f.still ? want : s.v + (want - s.v) * (1 - Math.exp(-f.dt * 5));
    const v = s.v;
    const side = lerp(SMALL, LARGE, v);

    // the day: three blocks come in, one after another, and then the bar is cleared
    const u = (t / CYCLE) % 1;
    const steps = [0.08, 0.32, 0.56];
    let stair = 0;
    for (const at of steps) stair += ease((u - at) / 0.1) / steps.length;
    stair *= f.still ? 1 : 1 - ease((u - 0.93) / 0.07);
    const share = stair * lerp(0.28, 1, v);
    // how deep the trough runs, as a share of the way down to the floor
    const depth = (Y0 - FY - 0.07) * lerp(0.18, 0.96, v) * (0.7 + 0.3 * stair);
    const danger = clamp((v - 0.6) / 0.4);
    const low = Y0 - depth;

    deck(f, { y: DECK, alpha: 0.09 });
    pool(f, [0, DECK, 0], 2.5, pal.key, 0.18 * f.boot);

    // ── the floor: a sheet under the trough, and it warms as the trough comes down to it
    const floorOn = f.on(0.55, 0.4);
    const sheet: V3[] = [[T0 - 0.15, FY, -FZ], [RX + 0.2, FY, -FZ], [RX + 0.2, FY, FZ], [T0 - 0.15, FY, FZ]];
    f.fill(sheet, pal.crimson, (0.06 + 0.1 * danger) * floorOn);
    for (let x = T0 + 0.1; x < RX + 0.15; x += m ? 0.5 : 0.25) f.line([x, FY, -FZ], [x, FY, FZ], pal.crimson, 0.14 * floorOn, 1);
    f.path(sheet, pal.crimson, 0.35 * floorOn, 1, true);
    trace(f, [[T0 - 0.15, FY, -FZ], [RX + 0.2, FY, -FZ]], pal.crimson, (0.6 + 0.4 * danger) * floorOn, 1.5);

    // ── the line itself: level, through the trough, and down the rule to the floor
    const seg = Math.max(14, Math.round(30 * f.q));
    const dip: V3[] = [];
    for (let i = 0; i <= seg; i++) {
      // (it falls faster than it climbs back)
      const x = i / seg;
      dip.push([lerp(T0, T1, x), Y0 - depth * Math.sin(Math.PI * Math.pow(x, 0.75)) ** 2, 0]);
    }
    const lineOn = f.on(0, 0.5);
    const spine: V3[] = [[-1.68, Y0, 0], [WHEEL[0], Y0, 0], [B0, Y0, 0], [B1, Y0, 0], ...dip, [RX, Y0, 0]];
    f.fill([[T0, Y0, 0], ...dip], pal.key, 0.07 * lineOn * (1 - danger));
    f.fill([[T0, Y0, 0], ...dip], pal.crimson, 0.09 * lineOn * danger);
    f.line([T0, Y0, 0], [T1, Y0, 0], pal.ink, 0.16 * lineOn, 1);
    trace(f, spine, pal.key, 0.75 * lineOn, 1.4, f.still ? -1 : t / 11);
    f.path(dip, pal.crimson, 0.85 * danger * lineOn, 1.6);
    // a point of light rests in the trough, a little to and fro
    const rest = 0.42 + (f.still ? 0 : 0.07 * Math.sin(t * 0.5));
    const at = Math.min(seg - 1, Math.floor(rest * seg));
    const fr = rest * seg - at;
    const bead: V3 = [lerp(dip[at][0], dip[at + 1][0], fr), lerp(dip[at][1], dip[at + 1][1], fr) + 0.03, 0];
    lamp(f, bead, pal.key, lineOn * (1 - danger), 0.018);
    lamp(f, bead, pal.crimson, lineOn * danger, 0.018);

    // ── the rule at the right: no numbers, a rider at the trough's foot, and in champagne the room left above the floor
    const ruleOn = f.on(0.65, 0.3);
    f.line([RX, Y0, 0], [RX, FY, 0], pal.ink, 0.35 * ruleOn, 1);
    for (let i = 0; i <= 10; i++) {
      const y = lerp(Y0, FY, i / 10);
      f.line([RX, y, 0], [RX + (i % 5 ? 0.035 : 0.07), y, 0], pal.ink, 0.4 * ruleOn, 1);
    }
    f.line([T0 + (T1 - T0) * 0.4, low, 0], [RX, low, 0], pal.ink, 0.2 * ruleOn, 1);
    f.line([RX - 0.07, low, 0], [RX - 0.07, FY, 0], pal.gold, 0.9 * ruleOn, Math.max(1, 1.8 * k));
    for (const y of [low, FY]) f.line([RX - 0.12, y, 0], [RX - 0.02, y, 0], pal.gold, 0.9 * ruleOn, 1.4);

    // ── the day's bar: it fills by what each block is worth, up to the mark where the day stops
    const barOn = f.on(0.35, 0.4);
    const full = lerp(B0, B1, clamp(share));
    if (share > 0.01) box(f, [B0, Y0, -BZ], [full, Y0 + BH, BZ], pal.key, 0.5 * barOn, 0.3 * barOn);
    box(f, [B0, Y0, -BZ], [B1, Y0 + BH, BZ], pal.ink, 0.45 * barOn);
    for (let i = 1; i < 4; i++) f.line([lerp(B0, B1, i / 4), Y0, -BZ], [lerp(B0, B1, i / 4), Y0 - 0.04, -BZ], pal.ink, 0.4 * barOn, 1);
    const stopped = clamp((share - 0.9) / 0.1);
    f.line([B1, Y0 - 0.06, -BZ], [B1, Y0 + BH + 0.1, -BZ], pal.gold, (0.6 + 0.4 * stopped) * barOn, Math.max(1, 2 * k));
    f.fill([[B1, Y0 + BH + 0.11, -BZ], [B1 - 0.04, Y0 + BH + 0.18, -BZ], [B1 + 0.04, Y0 + BH + 0.18, -BZ]], pal.gold, (0.6 + 0.4 * stopped) * barOn);
    // the blocks on their way to it: each is as large as the jaw allows
    if (!f.still) {
      for (const from of steps) {
        const go = clamp((u - from + 0.07) / 0.1);
        if (go <= 0 || go >= 1) continue;
        const x = lerp(WHEEL[0] + side / 2, B0, ease(go));
        const h = side * 0.4;
        const q: V3[] = [[x - h / 2, Y0 + 0.01, 0], [x + h / 2, Y0 + 0.01, 0], [x + h / 2, Y0 + 0.01 + h, 0], [x - h / 2, Y0 + 0.01 + h, 0]];
        f.fill(q, pal.key, 0.5 * Math.sin(Math.PI * go) * barOn);
        f.path(q, pal.key, Math.sin(Math.PI * go) * barOn, 1, true);
      }
    }

    // ── the block, the jaw on it, the threaded stem and the handwheel
    const govOn = f.on(0.15, 0.4);
    const gx = WHEEL[0];
    const touch = f.near(WHEEL, 90);
    for (const e of [-0.27, 0.27]) f.line([gx + e, Y0, 0], [gx + e, Y0 + LARGE + 0.1, 0], pal.ink, 0.25 * govOn, 1);
    slab(f, [gx - side / 2, Y0, -side / 2], [gx + side / 2, Y0 + side, side / 2], pal.key, 0.2, govOn);
    const jaw = Y0 + side + 0.012;
    f.line([gx - 0.27, jaw, 0], [gx + 0.27, jaw, 0], pal.gold, govOn, Math.max(1.2, 2.4 * k));
    f.line([gx, jaw, 0], [gx, WHEEL[1] - WR, 0], pal.gold, 0.7 * govOn, 1.5);
    for (let y = jaw + 0.03; y < WHEEL[1] - WR - 0.01; y += 0.035) f.line([gx - 0.022, y, 0], [gx + 0.022, y + 0.012, 0], pal.gold, 0.55 * govOn, 1);
    // (the wheel turns as it is opened)
    const turned = v * 0.8;
    ring(f, WHEEL, WR, { axis: "z", colour: pal.gold, alpha: (0.8 + 0.2 * touch) * govOn, width: 1.6, seg: 40 });
    ring(f, WHEEL, WR * 0.3, { axis: "z", colour: pal.gold, alpha: 0.8 * govOn, seg: 20 });
    for (let i = 0; i < 6; i++) f.line(ringPoint(WHEEL, WR * 0.3, i / 6 - turned, "z"), ringPoint(WHEEL, WR, i / 6 - turned, "z"), pal.gold, 0.6 * govOn, 1);
    lamp(f, ringPoint(WHEEL, WR, 0.25 - turned, "z"), pal.gold, (0.7 + 0.3 * touch) * govOn, 0.017);
    // the arc it can be turned through, lit as far as it has been
    ring(f, WHEEL, WR + 0.07, { axis: "z", from: 0.25 - 0.8, to: 0.25, colour: pal.ink, alpha: 0.22 * govOn, ticks: 8, tickLen: -0.03, seg: 40 });
    ring(f, WHEEL, WR + 0.07, { axis: "z", from: 0.25 - turned, to: 0.25, colour: pal.key, alpha: 0.75 * govOn * (1 - danger), width: 1.5, seg: 40 });
    ring(f, WHEEL, WR + 0.07, { axis: "z", from: 0.25 - turned, to: 0.25, colour: pal.crimson, alpha: 0.75 * govOn * danger, width: 1.5, seg: 40 });

    // ── the names
    const named = f.on(0.85, 0.15);
    const size = m ? 7 : 9;
    ctx.save();
    ctx.letterSpacing = m ? "1px" : "1.5px";
    f.label("TRADE", [gx, Y0, 0], { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: 13 });
    f.label("DAY", [(B0 + B1) / 2, Y0, -BZ], { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: 13 });
    f.label("DRAWDOWN", [(T0 + T1) / 2, Y0, 0], { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: -11 });
    f.label("FLOOR", [T0 - 0.15, FY, -FZ], { size, colour: pal.crimson, alpha: 0.9 * named, dy: 12 });
    ctx.restore();
  },
};

export default scene;
