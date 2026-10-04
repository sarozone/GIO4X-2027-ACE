/**
 * OSCILLATOR — the two places an indicator is drawn.
 *
 * Above: a price, as a ribbon with some depth to it, running inside a band.
 * The band is an average with a rail above and a rail below, tied by slats;
 * the rails move apart when the price is restless and close in when it is
 * quiet, so the band is seen to breathe as it passes. Below, in a window of
 * its own: an oscillator, the same movement brought back to a fixed scale. It
 * swings between two bounds, and the stretches where it runs beyond one of
 * them are marked in champagne. At the right, where the newest reading is, a
 * bead on each scale shows where the price and the oscillator stand now.
 *
 * The pointer: a reading line follows it across both windows at once. Where
 * it stands, a caliper measures the band's width and a light marks the price
 * and the oscillator at that same moment.
 *
 * The curves are a few slow waves, not a market: no scale carries a figure.
 */
import { TAU, clamp, lerp, rgba, type Scene, type V3 } from "../engine";
import { lamp } from "../kit";

/** the windows run from XA to XB; the two scales stand at XR */
const [XA, XB, XR] = [-1.6, 1.3, 1.5];
/** the price window's middle; the oscillator window's middle and half height; half the ribbon's depth */
const [TY, OY, OH, D] = [0.5, -0.68, 0.3, 0.16];
/** the oscillator's full swing, and the bound on either side, in world units */
const [SWING, BOUND] = [0.26, 0.7 * 0.26];
/** how fast the record passes, in windows a second */
const PACE = 0.028;
const MAXN = 73;

const mid = (s: number) => 0.2 * Math.sin(2.3 * s) + 0.08 * Math.sin(5.1 * s + 1);
const wid = (s: number) => 0.09 + 0.08 * (1 + Math.sin(4.3 * s + 2));
const osc = (s: number) => Math.sin(17 * s + 1.5 * Math.sin(3 * s)) * (0.72 + 0.3 * Math.sin(3.3 * s));
/** where the price sits: about the average, carried toward a rail as the oscillator swings */
const price = (s: number) => mid(s) + wid(s) * osc(s) * 0.9;

type Row = { x: Float32Array; y: Float32Array };
type State = { up: Row; lo: Row; av: Row; pf: Row; pb: Row; os: Row; bu: Row; bl: Row; o: Float32Array; off: number };

const row = (): Row => ({ x: new Float32Array(MAXN), y: new Float32Array(MAXN) });

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    return { up: row(), lo: row(), av: row(), pf: row(), pb: row(), os: row(), bu: row(), bl: row(), o: new Float32Array(MAXN), off: f.rnd(4) * 9 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(-0.16 + (f.still ? 0 : Math.sin(t * 0.07 + s.off) * 0.035), -0.14, 6.4, 1);

    const n = m ? 40 : Math.max(36, Math.round((MAXN - 1) * f.q));
    const at = s.off + t * PACE;
    const put = (r: Row, i: number, x: number, y: number, z: number) => {
      const p = f.P(x, y, z);
      if (!p) return;
      r.x[i] = p.x;
      r.y[i] = p.y;
    };
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = lerp(XA, XB, u);
      const a = mid(at + u);
      const w = wid(at + u);
      const o = osc(at + u);
      const p = TY + a + w * o * 0.9;
      s.o[i] = o;
      put(s.av, i, x, TY + a, 0);
      put(s.up, i, x, TY + a + w, 0);
      put(s.lo, i, x, TY + a - w, 0);
      put(s.pf, i, x, p, -D);
      put(s.pb, i, x, p, D);
      put(s.os, i, x, OY + o * SWING, 0);
      put(s.bu, i, x, OY + BOUND, 0);
      put(s.bl, i, x, OY - BOUND, 0);
    }
    const run = (r: Row, back?: Row) => {
      ctx.beginPath();
      ctx.moveTo(r.x[0], r.y[0]);
      for (let i = 1; i <= n; i++) ctx.lineTo(r.x[i], r.y[i]);
      if (!back) return;
      for (let i = n; i >= 0; i--) ctx.lineTo(back.x[i], back.y[i]);
      ctx.closePath();
    };
    const stroke = (colour: string, alpha: number, width: number) => {
      ctx.strokeStyle = rgba(colour, alpha);
      ctx.lineWidth = width;
      ctx.stroke();
    };

    // ── the band: two rails about an average, tied by slats, so its width can be read all along it
    const band = f.on(0, 0.4);
    run(s.up, s.lo);
    ctx.fillStyle = rgba(pal.indigo, 0.09 * band);
    ctx.fill();
    ctx.beginPath();
    for (let i = 0; i <= n; i += m ? 4 : 3) {
      ctx.moveTo(s.up.x[i], s.up.y[i]);
      ctx.lineTo(s.lo.x[i], s.lo.y[i]);
    }
    stroke(pal.indigo, 0.2 * band, 1);
    run(s.av);
    stroke(pal.ink, 0.24 * band, 1);
    for (const r of [s.up, s.lo]) {
      run(r);
      stroke(pal.indigo, 0.16 * band, 5);
      stroke(pal.indigo, 0.9 * band, 1.4);
    }

    // ── the price: a ribbon lying in the band, its near edge lit
    const rib = f.on(0.3, 0.4);
    run(s.pf, s.pb);
    ctx.fillStyle = rgba(pal.bg, 0.55 * rib);
    ctx.fill();
    ctx.fillStyle = rgba(pal.key, 0.26 * rib);
    ctx.fill();
    run(s.pb);
    stroke(pal.key, 0.4 * rib, 1);
    run(s.pf);
    stroke(pal.key, 0.18 * rib, 6);
    stroke(pal.ink, 0.95 * rib, 1.5);

    // ── the oscillator's window: two bounds, and the swing between them
    const win = f.on(0.5, 0.4);
    const pane: V3[] = [[XA, OY - OH, 0], [XB, OY - OH, 0], [XB, OY + OH, 0], [XA, OY + OH, 0]];
    f.fill(pane, pal.bg, 0.5 * win);
    f.fill(pane, pal.ink, 0.03 * win);
    f.path(pane, pal.ink, 0.18 * win, 1, true);
    f.line(pane[3], pane[2], pal.teal, 0.5 * win, 1.25);
    // beyond each bound, a zone
    f.fill([[XA, OY + BOUND, 0], [XB, OY + BOUND, 0], pane[2], pane[3]], pal.gold, 0.06 * win);
    f.fill([pane[0], pane[1], [XB, OY - BOUND, 0], [XA, OY - BOUND, 0]], pal.gold, 0.06 * win);
    f.line([XA, OY, 0], [XB, OY, 0], pal.ink, 0.1 * win, 1);
    for (const r of [s.bu, s.bl]) {
      run(r);
      stroke(pal.gold, 0.6 * win, 1);
    }
    // the stretches that run past a bound
    const lim = BOUND / SWING;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const [a, b] = [s.o[i], s.o[i + 1]];
      const r = a > lim && b > lim ? s.bu : a < -lim && b < -lim ? s.bl : null;
      if (!r) continue;
      ctx.moveTo(r.x[i], r.y[i]);
      ctx.lineTo(s.os.x[i], s.os.y[i]);
      ctx.lineTo(s.os.x[i + 1], s.os.y[i + 1]);
      ctx.lineTo(r.x[i + 1], r.y[i + 1]);
      ctx.closePath();
    }
    ctx.fillStyle = rgba(pal.gold, 0.42 * win);
    ctx.fill();
    run(s.os);
    stroke(pal.teal, 0.16 * win, 5);
    stroke(pal.teal, 0.95 * win, 1.5);

    // ── the two scales at the newest end, and a bead on each
    const now = at + 1;
    const beadP = TY + price(now);
    const beadO = OY + osc(now) * SWING;
    f.line([XR, TY - 0.56, 0], [XR, TY + 0.56, 0], pal.ink, 0.34 * band, 1);
    for (let i = -5; i <= 5; i++) f.line([XR, TY + i * 0.112, 0], [XR + (i % 5 === 0 ? 0.07 : 0.04), TY + i * 0.112, 0], pal.ink, 0.34 * band, 1);
    f.line([XB, beadP, 0], [XR, beadP, 0], pal.key, 0.3 * rib, 1);
    lamp(f, [XR, beadP, 0], pal.key, rib, 0.02);
    f.line([XR, OY - OH, 0], [XR, OY + OH, 0], pal.ink, 0.34 * win, 1);
    for (const b of [-BOUND, BOUND]) f.line([XR - 0.06, OY + b, 0], [XR + 0.06, OY + b, 0], pal.gold, 0.9 * win, 1.75);
    f.line([XB, beadO, 0], [XR, beadO, 0], pal.teal, 0.3 * win, 1);
    lamp(f, [XR, beadO, 0], Math.abs(osc(now)) > lim ? pal.gold : pal.teal, win, 0.02);

    // ── the reading line: one moment, read in both windows
    const ea = f.P(XA, TY, 0);
    const eb = f.P(XB, TY, 0);
    const heldU = ea && eb ? clamp((f.mx - ea.x) / Math.max(1, eb.x - ea.x)) : 0.72;
    const u = lerp(0.72, heldU, f.hover);
    const x = lerp(XA, XB, u);
    const a = TY + mid(at + u);
    const w = wid(at + u);
    const read = f.on(0.75, 0.25);
    const lit = 0.55 + 0.45 * f.hover;
    f.line([x, a + w + 0.07, 0], [x, OY - OH, 0], pal.gold, 0.34 * lit * read, 1);
    // the caliper across the band
    f.line([x, a - w, 0], [x, a + w, 0], pal.gold, 0.95 * lit * read, 2);
    for (const e of [a - w, a + w]) f.line([x - 0.05, e, 0], [x + 0.05, e, 0], pal.gold, 0.95 * lit * read, 2);
    lamp(f, [x, TY + price(at + u), -D], pal.ink, 0.9 * read, 0.014);
    lamp(f, [x, OY + osc(at + u) * SWING, 0], pal.gold, lit * read, 0.016);
    // the reading line's foot, on the oscillator window's sill
    const foot = f.P(x, OY - OH, 0);
    if (foot) {
      ctx.beginPath();
      ctx.arc(foot.x, foot.y, 2.2, 0, TAU);
      ctx.fillStyle = rgba(pal.gold, 0.9 * lit * read);
      ctx.fill();
    }

    const named = f.on(0.85, 0.15);
    const size = m ? 8 : 10;
    ctx.save();
    ctx.letterSpacing = m ? "1px" : "1.5px";
    f.label("BAND", [XA, TY + mid(at) + wid(at), 0], { size, colour: pal.indigo, alpha: 0.95 * named, dy: -12 });
    f.label("OSCILLATOR", [XA, OY - OH, 0], { size, colour: pal.teal, alpha: 0.95 * named, dy: 13 });
    ctx.restore();
  },
};

export default scene;
