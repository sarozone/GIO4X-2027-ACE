/**
 * CURRENCIES — sixteen coins round one exchange.
 *
 * The currency profiles are sixteen pages, one for each currency, so the
 * instrument is sixteen coins in a slow orbit, looked down upon, each struck
 * with nothing but its three-letter code. In their midst, raised above the
 * plane they move in, hangs the point every exchange passes through. Two at a
 * time a pair is joined: a line of light leaves one coin, climbs to the
 * exchange and comes down on the other, stands a moment and fades, and another
 * pair takes its turn.
 *
 * The pairs are taken in a fixed round, nobody favoured, and none of them says
 * anything about a rate, a direction or a volume: a coin is a name and a link
 * is the plain fact that one currency can be changed for another. On a
 * currency's own page its coin stands at the front in champagne, larger, with
 * all fifteen of its links drawn faintly and lit one after another.
 *
 * The pointer: the orbit turns a little with the hand, and the coin under it
 * rises and shows every link it has.
 */
import { TAU, clamp, rgba, type Frame, type Pt, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, trace } from "../kit";

const CODES = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "CNY", "HKD", "INR", "MXN", "NOK", "SEK", "SGD", "ZAR"];
const N = CODES.length;
/** the orbit: its half-axes across and into the frame, and a coin's radius */
const RX = 1.7;
const RZ = 1.3;
const CR = 0.16;
const FLOOR = -0.5;
/** the exchange, above the middle of the orbit */
const HUB: V3 = [0, 0.5, 0];
/** seconds between one pair and the next; each stands for two of them, so two are lit at a time */
const PERIOD = 5;

type State = { focus: number; lit: number[] };

const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** the pair that takes turn `k`: every coin in a fixed round, or, on a currency's page, that coin with each of the others */
function pairAt(k: number, focus: number): [number, number] {
  const j = ((k % 1680) + 1680) % 1680;
  if (focus >= 0) return [focus, (focus + 1 + ((j * 7) % (N - 1))) % N];
  const a = (j * 5) % N;
  return [a, (a + 3 + ((j * 7) % 11)) % N];
}

/** a link from one coin to another by way of the exchange: a curve that passes through it; `upTo` draws only its first part */
function link(a: V3, b: V3, n: number, upTo = 1): V3[] {
  const kx = 2 * HUB[0] - (a[0] + b[0]) / 2;
  const ky = 2 * HUB[1] - (a[1] + b[1]) / 2;
  const kz = 2 * HUB[2] - (a[2] + b[2]) / 2;
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * upTo;
    const q = 1 - t;
    out.push([q * q * a[0] + 2 * t * q * kx + t * t * b[0], q * q * a[1] + 2 * t * q * ky + t * t * b[1], q * q * a[2] + 2 * t * q * kz + t * t * b[2]]);
  }
  return out;
}

/** a ring in the plane of the orbit, `k` times its size */
function track(k: number, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    out.push([Math.cos(a) * RX * k, 0, Math.sin(a) * RZ * k]);
  }
  return out;
}

/**
 * A coin, face to the visitor: its thickness showing below the face, a milled
 * rim, a field that catches the lamp at the upper left, and its code.
 */
function coin(f: Frame, p: Pt, r: number, code: string, colour: string, level: number, on: number, halo: number): void {
  if (on <= 0.003) return;
  const { ctx, pal } = f;
  const R = Math.max(2, r * p.s * f.u);
  const a = clamp(level) * on;
  const disc = (y: number) => {
    ctx.beginPath();
    ctx.arc(p.x, y, R, 0, TAU);
  };
  if (halo > 0.01) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, R * 1.2, 0, TAU);
    ctx.strokeStyle = rgba(colour, 0.55 * halo * on);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // the edge of the coin, seen from above
  disc(p.y + R * 0.17);
  ctx.fillStyle = rgba(pal.bg, 0.96 * on);
  ctx.fill();
  ctx.fillStyle = rgba(colour, 0.2 * a);
  ctx.fill();
  ctx.strokeStyle = rgba(colour, 0.45 * a);
  ctx.lineWidth = 1;
  ctx.stroke();
  // the face
  disc(p.y);
  ctx.fillStyle = rgba(pal.bg, 0.96 * on);
  ctx.fill();
  const g = ctx.createRadialGradient(p.x - R * 0.3, p.y - R * 0.35, R * 0.1, p.x, p.y, R);
  g.addColorStop(0, rgba(colour, 0.28 * a));
  g.addColorStop(1, rgba(colour, 0.07 * a));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = rgba(colour, 0.9 * a);
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p.x, p.y, R * 0.78, 0, TAU);
  ctx.strokeStyle = rgba(colour, 0.32 * a);
  ctx.lineWidth = 1;
  ctx.stroke();
  // milling, where the coin is large enough to show it
  if (R >= 15) {
    const n = Math.round(32 * f.q);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      ctx.moveTo(p.x + Math.cos(t) * R * 0.85, p.y + Math.sin(t) * R * 0.85);
      ctx.lineTo(p.x + Math.cos(t) * R * 0.95, p.y + Math.sin(t) * R * 0.95);
    }
    ctx.strokeStyle = rgba(colour, 0.3 * a);
    ctx.stroke();
  }
  // the catch-light on the rim
  ctx.beginPath();
  ctx.arc(p.x, p.y, R * 0.9, Math.PI * 1.08, Math.PI * 1.42);
  ctx.strokeStyle = rgba(pal.ink, 0.4 * a);
  ctx.stroke();
  ctx.font = `700 ${clamp(R * 0.56, 6, 15).toFixed(1)}px ${pal.font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(colour === pal.gold ? pal.gold : pal.ink, clamp(0.25 + 0.75 * level) * on);
  ctx.fillText(code, p.x, p.y + R * 0.03);
}

const scene: Scene<State> = {
  // two pairs on show: one still climbing to the exchange, one standing
  pose: PERIOD * 2.5,
  setup(f) {
    return { focus: CODES.indexOf(f.tag.toUpperCase()), lit: Array.from({ length: N }, () => 0) };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    const focus = s.focus;
    f.aim(Math.sin(f.t * 0.07) * 0.04, -0.75, 6.6, 0.92);

    // the orbit takes three minutes; on a currency's page it only sways, with that coin kept at the front
    const drift = f.still ? 0 : focus < 0 ? f.t * 0.035 : Math.sin(f.t * 0.11) * 0.1;
    const rot = -Math.PI / 2 - ((focus < 0 ? 0 : focus) * TAU) / N + drift + f.px * 0.25 * f.hover;

    deck(f, { y: FLOOR, half: 3.75, alpha: 0.09, drift: 0 });
    pool(f, [0, FLOOR, 0], 2.6, pal.key, 0.2 * f.boot);

    // ── the plane of the orbit: the track, a graduated ring outside it, a quiet one inside
    const planeOn = f.on(0, 0.45);
    const seg = Math.round((m ? 48 : 72) * f.q);
    f.path(track(1, seg), pal.ink, 0.22 * planeOn, 1);
    f.path(track(1.15, seg), pal.ink, 0.3 * planeOn, 1);
    f.path(track(0.5, seg), pal.ink, 0.12 * planeOn, 1);
    const ticks = m ? 32 : 64;
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * TAU - rot * 0.4;
      const k = i % 4 ? 1.125 : 1.095;
      f.line([Math.cos(a) * RX * 1.15, 0, Math.sin(a) * RZ * 1.15], [Math.cos(a) * RX * k, 0, Math.sin(a) * RZ * k], pal.ink, (i % 4 ? 0.2 : 0.36) * planeOn, 1);
    }

    // ── where every coin is, and which one the hand is on
    const world: V3[] = [];
    const touch: number[] = [];
    let hot = -1;
    for (let i = 0; i < N; i++) {
      const a = rot + (i * TAU) / N;
      const x = Math.cos(a) * RX;
      const z = Math.sin(a) * RZ;
      const t = f.near([x, 0, z], CR * f.u * 1.7);
      touch.push(t);
      if (t > 0.04 && (hot < 0 || t > touch[hot])) hot = i;
      // the coin under the hand rises; the page's own floats a little above the rest
      world.push([x, 0.13 * t + (i === focus ? 0.1 : 0), z]);
      // spokes: every coin is tied to the foot of the exchange
      f.line([x * 0.5, 0, z * 0.5], [x * 0.86, 0, z * 0.86], pal.ink, 0.1 * planeOn, 1);
    }

    // ── the links, drawn before the coins so that each one leaves from behind its coin
    const linkOn = f.on(0.6, 0.4);
    const n = Math.max(10, Math.round((m ? 20 : 30) * f.q));
    s.lit.fill(0);
    if (focus >= 0) {
      // every link the page's own currency has, faintly
      for (let i = 0; i < N; i++) if (i !== focus && !(m && i % 2)) f.path(link(world[focus], world[i], Math.round(n / 2)), pal.gold, 0.16 * linkOn, 1);
    }
    if (hot >= 0) {
      for (let i = 0; i < N; i++) if (i !== hot) f.path(link(world[hot], world[i], Math.round(n / 2)), hot === focus ? pal.gold : pal.key, 0.42 * touch[hot] * linkOn, 1);
    }
    const tones = [pal.key, pal.teal, pal.indigo];
    const turn = f.t / PERIOD;
    const k0 = Math.floor(turn);
    for (let d = 1; d >= 0; d--) {
      const k = k0 - d;
      const ph = (turn - k) / 2;
      const [ia, ib] = pairAt(k, focus);
      // the light climbs from the first coin, passes the exchange, comes down on the second, stands, and fades
      const grow = smooth(ph / 0.55);
      const env = clamp(ph / 0.08) * smooth((1 - ph) / 0.3) * linkOn;
      if (env <= 0.003 || grow <= 0.003) continue;
      const colour = focus >= 0 ? pal.gold : tones[((k % 3) + 3) % 3];
      const pts = link(world[ia], world[ib], n, grow);
      trace(f, pts, colour, 0.9 * env, 1.5);
      if (grow < 1) {
        const tip = pts[pts.length - 1];
        f.glow(tip, 0.16, colour, 0.8 * env);
        f.dot(tip, 0.013, pal.ink, 0.95 * env);
      }
      s.lit[ia] = Math.max(s.lit[ia], env);
      s.lit[ib] = Math.max(s.lit[ib], env * grow);
    }

    // ── the exchange: a small cut stone turning on its axis, in its own rings
    const hubOn = f.on(0.3, 0.45);
    const spin = f.still ? 0.4 : f.t * 0.2;
    const top: V3 = [HUB[0], HUB[1] + 0.2, HUB[2]];
    const foot: V3 = [HUB[0], HUB[1] - 0.2, HUB[2]];
    const girdle: V3[] = [];
    for (let i = 0; i < 4; i++) girdle.push([HUB[0] + Math.cos(spin + (i * TAU) / 4) * 0.14, HUB[1], HUB[2] + Math.sin(spin + (i * TAU) / 4) * 0.14]);
    f.line([0, 0, 0], foot, pal.ink, 0.25 * hubOn, 1);
    ring(f, [0, 0, 0], 0.2, { colour: pal.ink, alpha: 0.25 * hubOn, seg: 32 });
    f.glow(HUB, 0.5, pal.key, 0.4 * hubOn);
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      f.fill([top, girdle[i], girdle[j]], pal.key, 0.07 * hubOn);
      f.fill([foot, girdle[i], girdle[j]], pal.key, 0.04 * hubOn);
      f.line(top, girdle[i], pal.key, 0.75 * hubOn, 1);
      f.line(foot, girdle[i], pal.key, 0.5 * hubOn, 1);
    }
    f.path(girdle, pal.key, 0.8 * hubOn, 1, true);
    lamp(f, HUB, pal.key, hubOn * (f.still ? 1 : 0.85 + 0.15 * Math.sin(f.t * 0.8)), 0.018);
    ring(f, HUB, 0.26, { colour: pal.ink, alpha: 0.3 * hubOn, ticks: 16, major: 4, tickLen: 0.03, rot: -spin * 0.3, seg: 40 });
    ring(f, HUB, 0.32, { colour: pal.key, alpha: 0.5 * hubOn, from: 0.05, to: 0.4, width: 1.5, rot: spin * 0.2, seg: 40 });

    // ── the coins, from the farthest to the nearest
    const order: { i: number; p: Pt }[] = [];
    for (let i = 0; i < N; i++) {
      const p = f.P(world[i][0], world[i][1], world[i][2]);
      if (p) order.push({ i, p });
    }
    order.sort((a, b) => b.p.z - a.p.z);
    for (const { i, p } of order) {
      const mine = i === focus;
      // depth of field: the far side of the orbit is fainter
      const front = clamp(0.5 - world[i][2] / (2 * RZ));
      const base = focus < 0 ? 0.5 + 0.4 * front : mine ? 1 : 0.34 + 0.2 * front;
      const level = clamp(base + 0.45 * s.lit[i] + 0.5 * touch[i]);
      const on = f.on(0.15 + (((i - (focus < 0 ? 0 : focus) + N) % N) / N) * 0.6, 0.3);
      if (mine) f.glow(world[i], 0.5, pal.gold, 0.3 * on);
      coin(f, p, CR * (mine ? 1.3 : 1 + 0.2 * touch[i]), CODES[i], mine ? pal.gold : pal.ink, level, on, Math.max(s.lit[i], touch[i], mine ? 0.8 : 0));
    }
  },
};

export default scene;
