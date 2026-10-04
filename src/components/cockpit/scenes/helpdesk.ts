/**
 * HELPDESK — requests in a queue, each one answered.
 *
 * A desk with a rail along its front edge. Request tickets stand on the rail
 * and move along it, one after another, toward the desk lamp. Under the lamp
 * each ticket is read: it is stamped in champagne as it passes, and from then
 * on it carries its reply above it, a speech bubble with a few ruled lines.
 * Tickets still to be read wait plainly in line on the left.
 *
 * It is the shape of the service, not a report of it: the tickets carry no
 * numbers, there is no count of the queue and no waiting time.
 *
 * The pointer picks a ticket up: the one under it lifts off the rail and
 * lights, and if it has been answered its reply opens larger. Over the lamp,
 * the light on the desk grows.
 */
import { clamp, type Frame, type Scene, type V3 } from "../engine";
import { lamp, pool, ring, slab, trace } from "../kit";
import { smooth } from "./_stage";

/** the desk: its top, half its width, its front and back edges */
const [TOP, DW, Z0, Z1] = [-0.5, 1.66, -0.18, 0.56];
/** the tickets: how many, their width and height, the space from one to the next, and their pace */
const [N, CW, CH, SP, PACE] = [6, 0.4, 0.28, 0.62, 0.1];
/** where on the rail the lamp reads a ticket */
const LX = 0.3;
/** the lamp: its foot, its elbow, its head, and the mouth of its shade */
const FOOT: V3 = [-0.24, TOP, 0.38];
const ELBOW: V3 = [-0.5, 0.36, 0.38];
const HEAD: V3 = [0.2, 0.9, 0.16];
const MOUTH: V3 = [LX, 0.66, 0.02];
const MR = 0.17;

const scene: Scene = {
  pose: 9.6,
  draw(f: Frame) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(-0.1 + (f.still ? 0 : Math.sin(t * 0.07) * 0.04), 0.17, 6.2, 1);

    // ── the desk, its two front legs, and the rail the tickets run on
    const deskOn = f.on(0, 0.35);
    for (const x of [-DW + 0.16, DW - 0.16]) f.line([x, TOP - 0.08, Z0 + 0.04], [x, TOP - 0.46, Z0 + 0.04], pal.ink, 0.3 * deskOn, 2);
    slab(f, [-DW, TOP - 0.08, Z0], [DW, TOP, Z1], pal.ink, 0.07, deskOn);
    f.line([-DW + 0.06, TOP, 0.11], [DW - 0.06, TOP, 0.11], pal.ink, 0.3 * deskOn, 1);
    trace(f, [[-DW + 0.06, TOP, -0.11], [DW - 0.06, TOP, -0.11]], pal.key, 0.5 * deskOn, 1.1, f.still ? -1 : t / 12);
    const ties = m ? 12 : 22;
    for (let i = 0; i <= ties; i++) {
      const x = -DW + 0.1 + ((2 * DW - 0.2) * i) / ties;
      f.line([x, TOP, -0.11], [x, TOP, 0.11], pal.ink, 0.13 * deskOn, 1);
    }

    // ── the lamp: a foot on the desk, two arms, a shade, and its light on the rail
    const lampOn = f.on(0.2, 0.4);
    const over = f.near(MOUTH, 110);
    const light = (0.75 + 0.25 * over) * lampOn * (f.still ? 1 : 0.94 + 0.06 * Math.sin(t * 0.9));
    ring(f, FOOT, 0.17, { axis: "y", colour: pal.ink, alpha: 0.5 * lampOn });
    ring(f, FOOT, 0.11, { axis: "y", colour: pal.ink, alpha: 0.25 * lampOn });
    f.line(FOOT, ELBOW, pal.ink, 0.6 * lampOn, 2);
    f.line(ELBOW, HEAD, pal.ink, 0.6 * lampOn, 2);
    f.dot(ELBOW, 0.03, pal.ink, 0.8 * lampOn);
    f.dot(FOOT, 0.022, pal.ink, 0.6 * lampOn);
    pool(f, [LX, TOP, 0], 0.62, pal.key, 0.3 * light);
    const beam: V3[] = [[LX - MR, MOUTH[1], MOUTH[2]], [LX + MR, MOUTH[1], MOUTH[2]], [LX + 0.46, TOP, 0], [LX - 0.46, TOP, 0]];
    f.fill(beam, pal.key, 0.075 * light);
    f.line(beam[0], beam[3], pal.key, 0.2 * light, 1);
    f.line(beam[1], beam[2], pal.key, 0.2 * light, 1);

    // ── the tickets, from the back of the queue to the front
    const size = m ? 8.5 : 10;
    const span = N * SP;
    for (let i = 0; i < N; i++) {
      const x = ((((i * SP + t * PACE) % span) + span) % span) - span / 2;
      const show = clamp((1.62 - Math.abs(x)) / 0.3) * f.on(0.25 + (i / N) * 0.4, 0.3);
      if (show <= 0.003) continue;
      const touch = f.near([x, TOP + CH / 2, 0], m ? 40 : 58);
      const y0 = TOP + 0.012 + 0.08 * touch;
      const read = smooth((x - LX + 0.05) / 0.1);
      const lit = clamp(1 - Math.abs(x - LX) / 0.5);
      const colour = read > 0.5 ? pal.key : pal.ink;
      const at = (a: number, b: number): V3 => [x - CW / 2 + a * CW, y0 + b * CH, 0];
      const card: V3[] = [at(0, 0), at(1, 0), at(1, 1), at(0.16, 1), at(0, 0.8)];
      f.fill(card, pal.bg, 0.95 * show);
      f.fill(card, colour, (0.06 + 0.1 * lit + 0.12 * touch) * show);
      f.path(card, colour, (0.5 + 0.25 * lit + 0.25 * touch) * show, 1, true);
      // what the visitor wrote: a heading and two lines
      f.line(at(0.12, 0.7), at(0.5, 0.7), colour, 0.85 * show, 1.5);
      f.line(at(0.12, 0.47), at(0.62, 0.47), pal.ink, 0.36 * show, 1);
      f.line(at(0.12, 0.27), at(0.48, 0.27), pal.ink, 0.36 * show, 1);

      if (read > 0.003) {
        // the stamp: a ring and a tick, with one wave of light as it lands
        const c = at(0.78, 0.4);
        const r = 0.052;
        const seal: V3[] = [];
        for (let k = 0; k <= 14; k++) seal.push([c[0] + Math.cos((k / 14) * Math.PI * 2) * r, c[1] + Math.sin((k / 14) * Math.PI * 2) * r, -0.004]);
        f.path(seal, pal.gold, 0.95 * read * show, 1.5);
        f.path([[c[0] - 0.026, c[1], -0.004], [c[0] - 0.006, c[1] - 0.022, -0.004], [c[0] + 0.028, c[1] + 0.024, -0.004]], pal.gold, 0.95 * read * show, 1.5);
        const wave = clamp((x - LX) / 0.36);
        f.glow([c[0], c[1], -0.004], 0.12 + 0.2 * wave, pal.gold, 0.5 * read * (1 - wave) * show);

        // the reply: it rises from the ticket once the stamp is on it
        const b = smooth((x - LX - 0.08) / 0.3) * show;
        if (b > 0.003) {
          const k = (0.6 + 0.4 * b) * (1 + 0.22 * touch);
          const [bw, bh] = [0.23 * k, 0.12 * k];
          const cx = x + 0.05;
          const cy = y0 + CH + 0.1 + bh + 0.04 * b;
          const cut = 0.04 * k;
          const bubble: V3[] = [
            [cx - bw + cut, cy - bh, 0],
            [cx - bw * 0.62, cy - bh, 0],
            [cx - bw * 0.78, cy - bh - 0.075 * k, 0],
            [cx - bw * 0.28, cy - bh, 0],
            [cx + bw - cut, cy - bh, 0],
            [cx + bw, cy - bh + cut, 0],
            [cx + bw, cy + bh - cut, 0],
            [cx + bw - cut, cy + bh, 0],
            [cx - bw + cut, cy + bh, 0],
            [cx - bw, cy + bh - cut, 0],
            [cx - bw, cy - bh + cut, 0],
          ];
          f.fill(bubble, pal.bg, 0.94 * b);
          f.fill(bubble, pal.key, (0.14 + 0.14 * touch) * b);
          f.path(bubble, pal.key, (0.75 + 0.25 * touch) * b, 1.25, true);
          for (let l = 0; l < 3; l++) {
            const ly = cy + bh * (0.48 - l * 0.48);
            f.line([cx - bw * 0.7, ly, -0.004], [cx + bw * (l === 2 ? 0.1 : 0.7 - l * 0.2), ly, -0.004], pal.ink, (l === 0 ? 0.8 : 0.45) * b, l === 0 ? 1.5 : 1);
          }
        }
      }
    }

    // ── the shade and the bulb, over everything beneath them
    const rim: V3[] = [];
    for (let k = 0; k <= 20; k++) rim.push([MOUTH[0] + Math.cos((k / 20) * Math.PI * 2) * MR, MOUTH[1], MOUTH[2] + Math.sin((k / 20) * Math.PI * 2) * MR * 0.9]);
    const shade: V3[] = [[MOUTH[0] - MR, MOUTH[1], MOUTH[2]], HEAD, [MOUTH[0] + MR, MOUTH[1], MOUTH[2]]];
    f.fill([...shade, ...rim.slice(0, 11)], pal.bg, 0.95 * lampOn);
    f.fill(shade, pal.ink, 0.1 * lampOn);
    f.path(shade, pal.ink, 0.6 * lampOn, 1.25);
    f.path(rim, pal.key, 0.8 * light, 1.25);
    lamp(f, [MOUTH[0], MOUTH[1] - 0.01, MOUTH[2]], pal.key, light, 0.03);
    f.dot(HEAD, 0.026, pal.ink, 0.8 * lampOn);

    // ── the lettering: the two ends of the queue
    const named = f.on(0.8, 0.2);
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("REQUESTS", [-0.98, TOP - 0.08, Z0], { align: "center", size, colour: pal.ink2, alpha: 0.8 * named, dy: 13 });
    f.label("REPLIES", [1.02, TOP - 0.08, Z0], { align: "center", size, colour: pal.key, alpha: 0.9 * named, dy: 13 });
    ctx.restore();
  },
};

export default scene;
