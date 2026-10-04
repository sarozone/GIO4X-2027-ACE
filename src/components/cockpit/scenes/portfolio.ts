/**
 * PORTFOLIO — seven kinds of holding, on one tray.
 *
 * A round tray of smoked glass with a low rim turns slowly, as a display stand
 * does. On it stand seven machined blocks, no two the same shape, one for each
 * instrument the section explains: a tower for stocks, a drum for bonds, a
 * stack of plates for ETFs, a pyramid for mutual funds, a six-sided column for
 * index funds, a three-sided one for options and a tapered one for futures.
 * The shapes are only a way of telling them apart; nothing about a shape is a
 * claim about the instrument. The ones that have come round to the front carry
 * their names.
 *
 * The pointer: the block it is near rises off the tray, takes a champagne edge
 * and shows its name. On an instrument's own page its block is the champagne one.
 */
import { TAU, clamp, rgba, type Frame, type Scene } from "../engine";
import { lamp, pool, ring } from "../kit";

const FLOOR = -0.2;
/** the tray's radius, the circle the blocks stand on, the height of the rim */
const [TRAY, RING, RIM] = [1.5, 0.98, 0.13];
/** seconds for the tray to turn once */
const TURN = 220;

type Kind = { slug: string; name: string; sides: number; r: number; top: number; h: number; round: boolean; plates: number };
const KINDS: readonly Kind[] = [
  { slug: "stocks", name: "STOCKS", sides: 4, r: 0.2, top: 1, h: 0.74, round: false, plates: 1 },
  { slug: "bonds", name: "BONDS", sides: 20, r: 0.25, top: 1, h: 0.3, round: true, plates: 1 },
  { slug: "etfs", name: "ETFS", sides: 4, r: 0.27, top: 1, h: 0.46, round: false, plates: 3 },
  { slug: "mutual-funds", name: "FUNDS", sides: 4, r: 0.31, top: 0, h: 0.56, round: false, plates: 1 },
  { slug: "index-investing", name: "INDEX", sides: 6, r: 0.23, top: 1, h: 0.44, round: false, plates: 1 },
  { slug: "options", name: "OPTIONS", sides: 3, r: 0.28, top: 1, h: 0.5, round: false, plates: 1 },
  { slug: "futures", name: "FUTURES", sides: 20, r: 0.24, top: 0.42, h: 0.62, round: true, plates: 1 },
];
const COUNT = KINDS.length;

type State = { order: number[]; depth: Float32Array; x: Float32Array; z: Float32Array; own: number; phase: number };

// scratch for one prism's projected corners: no allocation while drawing
const MAXS = 24;
const bx = new Float32Array(MAXS);
const by = new Float32Array(MAXS);
const tx = new Float32Array(MAXS);
const ty = new Float32Array(MAXS);
const vis = new Uint8Array(MAXS);

/**
 * An upright solid on an n-sided base (r0 at the foot, r1 at the top: equal for a column, zero for a
 * pyramid). Only the faces turned to the camera are drawn, each shaded by where it faces; a round one
 * has no arrises, only its outline.
 */
function prism(f: Frame, x: number, y: number, z: number, r0: number, r1: number, h: number, n: number, rot: number, colour: string, tint: number, on: number, round: boolean, gold: number): void {
  if (on <= 0.003) return;
  const { ctx, pal } = f;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const p = f.P(x + c * r0, y, z + s * r0);
    const q = f.P(x + c * r1, y + h, z + s * r1);
    if (!p || !q) return;
    bx[i] = p.x;
    by[i] = p.y;
    tx[i] = q.x;
    ty[i] = q.y;
  }
  // the side faces that look at the camera: first their smoked body as one shape, so no seam shows between them
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    vis[i] = (bx[j] - bx[i]) * (ty[j] - by[j]) - (by[j] - by[i]) * (tx[j] - bx[j]) < 0 ? 1 : 0;
    if (!vis[i]) continue;
    ctx.moveTo(bx[i], by[i]);
    ctx.lineTo(bx[j], by[j]);
    ctx.lineTo(tx[j], ty[j]);
    ctx.lineTo(tx[i], ty[i]);
    ctx.closePath();
  }
  ctx.fillStyle = rgba(pal.bg, 0.95 * on);
  ctx.fill();
  ctx.strokeStyle = rgba(pal.bg, 0.95 * on);
  ctx.lineWidth = 1;
  ctx.stroke();
  // then each face's own light: it is lit from the front left
  for (let i = 0; i < n; i++) {
    if (!vis[i]) continue;
    const j = (i + 1) % n;
    const shade = 0.62 + 0.38 * Math.cos(rot + ((i + 0.5) * TAU) / n + Math.PI / 2 + 0.7);
    ctx.beginPath();
    ctx.moveTo(bx[i], by[i]);
    ctx.lineTo(bx[j], by[j]);
    ctx.lineTo(tx[j], ty[j]);
    ctx.lineTo(tx[i], ty[i]);
    ctx.closePath();
    ctx.fillStyle = rgba(colour, tint * shade * on);
    ctx.fill();
  }
  // the top face
  if (r1 > 0.001) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      if (i) ctx.lineTo(tx[i], ty[i]);
      else ctx.moveTo(tx[i], ty[i]);
    }
    ctx.closePath();
    ctx.fillStyle = rgba(pal.bg, 0.95 * on);
    ctx.fill();
    ctx.fillStyle = rgba(colour, tint * 1.5 * on);
    ctx.fill();
  }
  // arrises and outline: once in the block's own colour, once more in champagne when it is the chosen one
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const k = (i + n - 1) % n;
    if (vis[i]) {
      ctx.moveTo(bx[i], by[i]);
      ctx.lineTo(bx[j], by[j]);
    }
    if (round ? vis[i] !== vis[k] : vis[i] || vis[k]) {
      ctx.moveTo(bx[i], by[i]);
      ctx.lineTo(tx[i], ty[i]);
    }
    if (r1 > 0.001) {
      ctx.moveTo(tx[i], ty[i]);
      ctx.lineTo(tx[j], ty[j]);
    }
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(colour, 0.62 * on);
  ctx.stroke();
  if (gold > 0.01) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(pal.gold, 0.95 * gold * on);
    ctx.stroke();
  }
}

/** a flat round plate on the tray's plane */
function disc(f: Frame, y: number, r: number, colour: string, alpha: number, seg: number): void {
  if (alpha <= 0.003) return;
  const { ctx } = f;
  ctx.beginPath();
  for (let i = 0; i < seg; i++) {
    const a = (i * TAU) / seg;
    const p = f.P(Math.cos(a) * r, y, Math.sin(a) * r);
    if (!p) return;
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = rgba(colour, alpha);
  ctx.fill();
}

/** half of the tray's rim: a low wall between two angles, flaring a little outward at its lip */
function wall(f: Frame, from: number, to: number, seg: number, body: number, edge: number, colour: string): void {
  const { ctx, pal } = f;
  ctx.beginPath();
  for (let i = 0; i <= seg; i++) {
    const a = from + ((to - from) * i) / seg;
    const p = f.P(Math.cos(a) * TRAY, FLOOR, Math.sin(a) * TRAY);
    if (!p) return;
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  for (let i = seg; i >= 0; i--) {
    const a = from + ((to - from) * i) / seg;
    const p = f.P(Math.cos(a) * (TRAY + 0.05), FLOOR + RIM, Math.sin(a) * (TRAY + 0.05));
    if (!p) return;
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = rgba(pal.bg, body);
  ctx.fill();
  ctx.fillStyle = rgba(pal.ink, 0.05 * body);
  ctx.fill();
  // the lip, lit
  ctx.beginPath();
  for (let i = 0; i <= seg; i++) {
    const a = from + ((to - from) * i) / seg;
    const p = f.P(Math.cos(a) * (TRAY + 0.05), FLOOR + RIM, Math.sin(a) * (TRAY + 0.05));
    if (!p) return;
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  ctx.strokeStyle = rgba(colour, edge);
  ctx.lineWidth = 1.25;
  ctx.stroke();
}

const scene: Scene<State> = {
  pose: 14,
  setup(f) {
    const own = KINDS.findIndex((k) => k.slug === f.tag.trim().toLowerCase());
    return {
      order: KINDS.map((_, i) => i),
      depth: new Float32Array(COUNT),
      x: new Float32Array(COUNT),
      z: new Float32Array(COUNT),
      own,
      // the page's own instrument starts at the front; otherwise the page seed chooses who does
      phase: -Math.PI / 2 - ((own >= 0 ? own : Math.floor(f.rnd(2) * COUNT)) * TAU) / COUNT - 0.4,
    };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    f.aim(0.1 + (f.still ? 0 : Math.sin(f.t * 0.06) * 0.03), -0.38, 6.2, 1.05);
    const turn = s.phase + (f.t * TAU) / TURN;
    const seg = Math.max(24, Math.round(56 * f.q));
    const trayOn = f.on(0, 0.4);

    // ── the tray: its light on the deck, its floor, the far half of its rim
    pool(f, [0, FLOOR - 0.02, 0], TRAY * 1.12, pal.key, 0.22 * f.boot);
    disc(f, FLOOR, TRAY, pal.bg, 0.72 * trayOn, seg);
    disc(f, FLOOR, TRAY, pal.key, 0.05 * trayOn, seg);
    ring(f, [0, FLOOR, 0], TRAY, { colour: pal.ink, alpha: 0.3 * trayOn, seg: 72 });
    // graduations turn with the tray, so the turning can be seen
    ring(f, [0, FLOOR, 0], TRAY - 0.1, { colour: pal.ink, alpha: 0.2 * trayOn, ticks: m ? 28 : 56, tickLen: 0.05, major: 4, rot: turn, seg: 64 });
    ring(f, [0, FLOOR, 0], RING, { colour: pal.ink, alpha: 0.08 * trayOn, seg: 56 });
    const front = f.cam.yaw - Math.PI / 2;
    wall(f, front + Math.PI / 2, front + Math.PI * 1.5, seg >> 1, 0.5 * trayOn, 0.35 * trayOn, pal.ink);
    // the spindle it turns on
    prism(f, 0, FLOOR, 0, 0.1, 0.07, 0.06, 20, 0, pal.ink, 0.12, trayOn, true, 0);
    lamp(f, [0, FLOOR + 0.07, 0], pal.gold, 0.8 * trayOn, 0.014);

    // ── where each block has come round to, and which of them stands behind which
    for (let i = 0; i < COUNT; i++) {
      const a = turn + (i * TAU) / COUNT;
      s.x[i] = Math.cos(a) * RING;
      s.z[i] = Math.sin(a) * RING;
      const p = f.P(s.x[i], FLOOR, s.z[i]);
      s.depth[i] = p ? p.z : 0;
    }
    s.order.sort((p, q) => s.depth[q] - s.depth[p]);

    const tones = [pal.blue, pal.teal, pal.emerald, pal.indigo, pal.crimson, pal.accent, pal.ink2];
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    for (const i of s.order) {
      const k = KINDS[i];
      const on = f.on(0.25 + 0.5 * (i / (COUNT - 1)), 0.3);
      if (on <= 0.003) continue;
      const mine = i === s.own;
      const x = s.x[i];
      const z = s.z[i];
      const near = f.near([x, FLOOR + k.h * 0.6, z], m ? 44 : 74);
      // powering on, a block is set down on the tray; under the pointer it rises off it
      const y = FLOOR + (1 - on) * 0.25 + near * 0.2;
      const colour = mine ? pal.gold : tones[i];
      const tint = (mine ? 0.26 : 0.17) + 0.08 * near;
      const gold = Math.max(near, mine ? 0.7 : 0);
      // its shadow on the tray, wider and fainter as it rises
      pool(f, [x, FLOOR + 0.004, z], k.r * (1.5 + near * 0.7), pal.bg, (0.75 - 0.3 * near) * on);
      if (near > 0.01 || mine) pool(f, [x, FLOOR + 0.004, z], k.r * 2.4, pal.gold, 0.3 * gold * on);
      // each block keeps its own face to the middle of the tray
      const rot = turn + (i * TAU) / COUNT + (k.sides === 4 ? Math.PI / 4 : 0);
      if (k.plates > 1) {
        const th = k.h / (k.plates * 1.5 - 0.5);
        for (let n = 0; n < k.plates; n++) prism(f, x, y + n * th * 1.5, z, k.r, k.r, th, k.sides, rot, colour, tint, on, false, gold);
      } else {
        prism(f, x, y, z, k.r, k.r * k.top, k.h, k.sides, rot, colour, tint, on, k.round, gold);
      }
      // a name for the ones at the front, and for the one under the pointer
      const facing = clamp((-z / RING - (m ? 0.82 : 0.45)) / 0.2);
      const named = Math.max(near, mine ? 1 : 0, facing * 0.8) * on * f.on(0.85, 0.15);
      if (named > 0.01) {
        f.label(k.name, [x, y + k.h, z], { align: "center", size, colour: near > 0.5 || mine ? pal.gold : pal.ink, alpha: named, dy: -13 });
      }
    }
    ctx.restore();

    // ── the near half of the rim, in front of everything standing on the tray
    wall(f, front - Math.PI / 2, front + Math.PI / 2, seg >> 1, 0.8 * trayOn, 0.75 * trayOn, pal.key);
  },
};

export default scene;
