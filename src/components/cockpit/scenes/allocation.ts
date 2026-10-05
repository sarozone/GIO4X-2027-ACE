/**
 * ALLOCATION — one wallet, shared out between two platforms.
 *
 * At the top stands a tank of glass: the WALLET. A pipe leaves its floor,
 * divides at a tee and runs out to two valves, and under each valve stands a
 * vessel: MT5 on the left, RAPTOR on the right. A lever on each valve shows
 * how far it is open, and one champagne rider on the rule under the tee is
 * linked to both: slide it one way and that side's valve opens as the other
 * closes. What flows down is divided as the rider says. Not all of it goes:
 * a champagne mark on the tank is the part that is kept, and the wallet never
 * falls below it. After a while the vessels are run back up into the tank and
 * the sharing is done again.
 *
 * The pointer sets it. Left and right move the rider, and so the share each
 * vessel takes; up and down move the mark of what stays in the wallet.
 *
 * The rule has graduations and no figures, and no level here is an amount.
 */
import { TAU, clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { box, deck, lamp, pool, ring } from "../kit";

const FLOOR = -1.15;
/** the wallet: half its width and depth, its floor and its lid */
const [TW, TD, T0, T1] = [0.62, 0.2, 0.5, 1.05];
/** the vessels: how far out they stand, their radius, their rim */
const [VX, VR, V1] = [0.95, 0.38, -0.32];
/** the pipe: the height it runs at, where the valves sit on it, where a branch stops over its vessel */
const [PIPE, VALVE, SPOUT] = [0.2, 0.5, -0.2];
/** the rule under the tee, and half its length */
const [RULE, RL] = [-0.02, 0.36];
/** seconds for one sharing-out: it runs down, stands, and is run back */
const CYCLE = 18;

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
const bell = (t: number) => (t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t));

/** a level circle of radius `r` round a vertical axis */
function disc(x: number, y: number, r: number, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i < n; i++) out.push([x + Math.cos((i / n) * TAU) * r, y, Math.sin((i / n) * TAU) * r]);
  return out;
}

/** the point a share `s` (0 to 1) of the way along a run of pipe */
function along(pts: readonly V3[], s: number): V3 {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
  let left = clamp(s) * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (left <= d || i === pts.length - 1) {
      const k = d > 0 ? clamp(left / d) : 0;
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    }
    left -= d;
  }
  return pts[0];
}

/** a standing vessel of glass with what it holds */
function vessel(f: Frame, x: number, level: number, colour: string, on: number, lit: number): void {
  if (on <= 0.003) return;
  const { pal } = f;
  const n = Math.max(14, Math.round(30 * f.q));
  const y = lerp(FLOOR + 0.03, V1 - 0.06, clamp(level));
  // the liquid: its body, the floor it stands on, its surface
  f.fill([[x - VR, FLOOR, 0], [x + VR, FLOOR, 0], [x + VR, y, 0], [x - VR, y, 0]], colour, (0.13 + 0.07 * lit) * on);
  f.fill(disc(x, FLOOR, VR, n), colour, 0.12 * on);
  const top = disc(x, y, VR, n);
  f.fill(top, colour, (0.26 + 0.14 * lit) * on);
  f.path(top, colour, 0.8 * on, 1.25, true);
  // the glass
  f.path(disc(x, FLOOR, VR, n), pal.ink, 0.3 * on, 1, true);
  f.path(disc(x, V1, VR, n), pal.ink, (0.4 + 0.3 * lit) * on, 1.25, true);
  f.line([x - VR, FLOOR, 0], [x - VR, V1, 0], pal.ink, 0.34 * on, 1);
  f.line([x + VR, FLOOR, 0], [x + VR, V1, 0], pal.ink, 0.34 * on, 1);
  f.line([x - VR * 0.72, FLOOR + 0.06, -VR * 0.66], [x - VR * 0.72, V1 - 0.06, -VR * 0.66], pal.ink, 0.12 * on, 2);
}

type State = { share: number; keep: number; phase: number };

const scene: Scene<State> = {
  // the composed still: shared out, and standing
  pose: CYCLE * 0.55,
  setup(f) {
    return { share: 0.5, keep: 0.32, phase: f.rnd(2) * 6 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    const composed = f.still || f.dt === 0;
    f.aim(0.2 + (f.still ? 0 : Math.sin(f.t * 0.07 + s.phase) * 0.04), -0.12, 6.3, m ? 0.9 : 0.94);

    // ── the rider and the mark: they wander when left alone, and follow the pointer when it is here
    const b = f.box;
    const idleShare = 0.5 + 0.3 * Math.sin(f.t * 0.11 + 0.6);
    const idleKeep = 0.32 + 0.08 * Math.sin(f.t * 0.07);
    const wantShare = lerp(idleShare, lerp(0.86, 0.14, clamp((f.mx - b.x) / Math.max(1, b.w))), f.hover);
    const wantKeep = lerp(idleKeep, lerp(0.62, 0.14, clamp((f.my - b.y) / Math.max(1, b.h))), f.hover);
    const rate = clamp(f.dt * 3);
    s.share = composed ? idleShare : s.share + (wantShare - s.share) * rate;
    s.keep = composed ? idleKeep : s.keep + (wantKeep - s.keep) * rate;
    /** the share that goes left, and what stays in the wallet */
    const share = s.share;
    const keep = s.keep;

    // ── one sharing-out: down, a stand, and back
    const u = (f.t / CYCLE) % 1;
    const down = ease(u / 0.4) * (1 - ease((u - 0.68) / 0.28));
    const back = u > 0.68;
    // what is moving in the pipes at this moment (the pointer's hand on the rider keeps a little running)
    const flow = f.still ? 0 : Math.max(bell(u / 0.4), bell((u - 0.68) / 0.28), 0.4 * f.hover);
    const wallet = 1 - down * (1 - keep);
    const held = [down * (1 - keep) * share, down * (1 - keep) * (1 - share)];
    const tones = [pal.key, pal.teal];
    const ownTag = f.tag.toLowerCase();

    deck(f, { y: FLOOR, alpha: 0.11 });
    pool(f, [0, FLOOR, 0], 2.4, pal.key, 0.2 * f.boot);

    // ── the two vessels
    for (let i = 0; i < 2; i++) {
      const x = i ? VX : -VX;
      const on = f.on(0.35 + i * 0.12, 0.4);
      const lit = f.near([x, (FLOOR + V1) / 2, 0], f.box.w * 0.22);
      pool(f, [x, FLOOR, 0], 0.75, tones[i], (0.12 + 0.2 * held[i]) * on);
      vessel(f, x, held[i] / 0.78, tones[i], on, lit);
      const name = i ? "RAPTOR" : "MT5";
      const own = ownTag !== "" && ownTag.includes(name.toLowerCase());
      f.label(name, [x, FLOOR, -VR], { align: "center", dy: 13, size: m ? 8 : 10, colour: own ? pal.gold : lit > 0.3 ? pal.ink : pal.ink2, alpha: (0.7 + 0.3 * lit) * on });
    }

    // ── the wallet: a tank, what it holds, and the champagne mark of what is kept
    const tankOn = f.on(0, 0.4);
    const at = (v: number) => lerp(T0 + 0.02, T1 - 0.05, clamp(v));
    const yKeep = at(keep);
    const yNow = at(wallet);
    const face = (y0: number, y1: number): V3[] => [[-TW, y0, -TD], [TW, y0, -TD], [TW, y1, -TD], [-TW, y1, -TD]];
    f.fill(face(T0, yNow), pal.key, 0.15 * tankOn);
    f.fill(face(T0, yKeep), pal.gold, 0.13 * tankOn);
    const surface: V3[] = [[-TW, yNow, -TD], [TW, yNow, -TD], [TW, yNow, TD], [-TW, yNow, TD]];
    f.fill(surface, pal.key, 0.24 * tankOn);
    f.path(surface, pal.key, 0.75 * tankOn, 1.25, true);
    box(f, [-TW, T0, -TD], [TW, T1, TD], pal.ink, 0.42 * tankOn);
    // the mark: a line across the glass and a bracket down to the tank's floor
    f.line([-TW - 0.1, yKeep, -TD], [TW, yKeep, -TD], pal.gold, 0.9 * tankOn, 1.25);
    f.path([[-TW - 0.05, yKeep, -TD], [-TW - 0.1, yKeep, -TD], [-TW - 0.1, T0, -TD], [-TW - 0.05, T0, -TD]], pal.gold, 0.8 * tankOn, 1.25);
    lamp(f, [-TW - 0.1, yKeep, -TD], pal.gold, tankOn * (0.7 + 0.3 * f.hover), 0.012);
    f.label("WALLET", [0, T1, 0], { align: "center", dy: m ? -10 : -13, size: m ? 8 : 10, colour: pal.ink2, alpha: 0.8 * tankOn });

    // ── the pipework: a trunk, a tee, a branch to each side with its valve
    const pipeOn = f.on(0.2, 0.4);
    const runs: V3[][] = [0, 1].map((i) => {
      const x = i ? VX : -VX;
      return [[0, T0, 0], [0, PIPE, 0], [x, PIPE, 0], [x, SPOUT, 0]];
    });
    for (let i = 0; i < 2; i++) {
      const open = i ? 1 - share : share;
      const sx = i ? 1 : -1;
      // glass, and the light in it: brighter the wider its valve stands and the more is moving
      f.path(runs[i], pal.ink, 0.2 * pipeOn, 5);
      f.path(runs[i], pal.bg, 0.7 * pipeOn, 3);
      f.path(runs[i], tones[i], (0.25 + 0.6 * open * Math.max(flow, 0.3)) * pipeOn, 1.25);
      // the valve: a collar round the pipe, and a quarter-turn lever that lies along the pipe when it is open
      const vx = sx * VALVE;
      ring(f, [vx, PIPE, 0], 0.085, { axis: "x", colour: pal.ink, alpha: 0.6 * pipeOn, seg: 24 });
      ring(f, [vx + sx * 0.05, PIPE, 0], 0.085, { axis: "x", colour: pal.ink, alpha: 0.35 * pipeOn, seg: 24 });
      const turn = (1 - clamp((open - 0.14) / 0.72)) * (Math.PI / 2);
      const tip: V3 = [vx + sx * Math.cos(turn) * 0.24, PIPE + 0.085 + Math.sin(turn) * 0.24, 0];
      f.line([vx, PIPE + 0.085, 0], tip, tones[i], 0.95 * pipeOn, 2);
      f.dot(tip, 0.02, tones[i], pipeOn);
      f.dot([vx, PIPE + 0.085, 0], 0.016, pal.ink, 0.8 * pipeOn);
      // what falls from the spout into the vessel (or is drawn up from it)
      const x = sx * VX;
      const fall = lerp(FLOOR + 0.03, V1 - 0.06, clamp(held[i] / 0.78));
      f.line([x, SPOUT, 0], [x, fall, 0], tones[i], 0.55 * open * flow * pipeOn, 1.5);
      if (flow > 0.02) {
        // one slow ring widening on the surface
        const wide = (f.t * 0.45 + i * 0.5) % 1;
        f.path(disc(x, fall, 0.05 + 0.2 * wide, 16), tones[i], 0.5 * (1 - wide) * open * flow * pipeOn, 1, true);
      }
    }
    f.dot([0, PIPE, 0], 0.028, pal.ink, 0.7 * pipeOn);

    // ── the rule and its rider: one hand on both valves
    const ruleOn = f.on(0.5, 0.4);
    const rider: V3 = [lerp(RL, -RL, clamp((share - 0.14) / 0.72)), RULE, 0];
    f.line([-RL, RULE, 0], [RL, RULE, 0], pal.ink, 0.5 * ruleOn, 1);
    const marks = m ? 8 : 12;
    for (let i = 0; i <= marks; i++) {
      const x = lerp(-RL, RL, i / marks);
      f.line([x, RULE, 0], [x, RULE - (i % (marks / 2) === 0 ? 0.07 : 0.035), 0], pal.ink, 0.4 * ruleOn, 1);
    }
    for (let i = 0; i < 2; i++) f.line(rider, [(i ? 1 : -1) * VALVE, PIPE - 0.085, 0], pal.gold, 0.3 * ruleOn, 1);
    f.line([rider[0], RULE + 0.06, 0], [rider[0], RULE - 0.1, 0], pal.gold, ruleOn, 2);
    lamp(f, [rider[0], RULE + 0.06, 0], pal.gold, ruleOn * (0.75 + 0.25 * f.hover), 0.015);

    // ── what is moving: beads of light in the pipes, more of them on the side that takes more
    if (flow > 0.02) {
      for (let i = 0; i < 2; i++) {
        const open = i ? 1 - share : share;
        const count = Math.round((m ? 2 : 3) + (m ? 4 : 8) * open * f.q);
        for (let k = 0; k < count; k++) {
          const run = (f.rnd(i * 40 + k) + f.t * 0.2) % 1;
          // the way back runs the other way
          const p = along(runs[i], back ? 1 - run : run);
          const a = Math.sin(Math.PI * run) * flow * pipeOn;
          f.glow(p, 0.07, tones[i], 0.5 * a);
          f.dot(p, 0.013, pal.ink, 0.9 * a);
        }
      }
    }
  },
};

export default scene;
