/**
 * DAYNIGHT — one day, as a strip of film.
 *
 * Twenty-four frames, one for each hour, on a strip of film that bends through
 * the stage. Each frame holds a small sky: the hours of the day are light, the
 * hours of the night dark. Above the strip the sun and the moon cross on one
 * arc, each opposite the other, so that one of them is always up. The frame of
 * the visitor's present hour is the champagne one, and the few hours just
 * played are still lit behind it, as film that has passed the gate.
 *
 * Everything is the visitor's own clock: the hour, and the plain convention
 * that the sun is up from six to six. No market, no price, no session status.
 *
 * The pointer scrubs the film: the frame under it lifts out of the strip and
 * the sun and the moon go to that frame's hour; taken away, they return to now.
 */
import { TAU, clamp, lerp, rgba, type Frame, type Scene, type V3 } from "../engine";
import { trace } from "../kit";

const N = 24;
/** the strip: half its length, the height of its middle line, half its height, how far it bends in depth */
const [HALF, SY, SH, BEND] = [1.62, -0.62, 0.17, 0.36];
/** the sky's arc: the horizon it stands on, and its two radii */
const [BASE, RX, RY] = [-0.18, 1.34, 1.02];

/** a point of the strip: s along it (0 to 1), v across it (-1 bottom, 1 top), raised by `up` */
const strip = (s: number, v: number, drift: number, up = 0): V3 => [
  lerp(-HALF, HALF, s),
  SY + 0.07 * Math.cos(s * TAU + drift) + v * SH + up,
  -BEND * Math.sin(s * TAU + drift),
];
/** how high the sun stands at a moment of the day (0 to 1): above zero from six to six */
const sunAt = (day: number) => Math.sin((day - 0.25) * TAU);
/** where a body on the arc stands at angle a (0 rising on the left, a quarter turn overhead) */
const sky = (a: number): V3 => [-Math.cos(a) * RX, BASE + Math.sin(a) * RY, 0.25];

const scene: Scene = {
  pose: 9,
  draw(f: Frame) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(f.still ? 0 : Math.sin(t * 0.06) * 0.05, 0.1, 6.2, 1);
    const drift = f.still ? 0.3 : 0.3 + Math.sin(t * 0.11) * 0.35;

    // ── the hour: the visitor's clock; under the pointer, the hour of the frame it is on
    const d = f.now;
    const today = (d.getHours() * 60 + d.getMinutes()) / 1440;
    const nowAt = Math.min(N - 1, Math.floor(today * N));
    const first = f.P(...strip(0, 0, drift));
    const last = f.P(...strip(1, 0, drift));
    const held = first && last && last.x - first.x > 1 ? clamp((f.mx - first.x) / (last.x - first.x)) : today;
    const day = lerp(today, held, f.hover);

    // ── the sky: a horizon, the arc, and the two bodies opposite each other on it
    const skyOn = f.on(0.1, 0.4);
    f.line([-RX - 0.16, BASE, 0.25], [RX + 0.16, BASE, 0.25], pal.ink, 0.22 * skyOn, 1);
    const seg = Math.round(40 * f.q);
    const dome: V3[] = [];
    for (let i = 0; i <= seg; i++) dome.push(sky((i / seg) * Math.PI));
    f.path(dome, pal.ink, 0.2 * skyOn, 1);
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI;
      const k = i % 3 === 0 ? 0.07 : 0.035;
      f.line(sky(a), [-Math.cos(a) * (RX - k), BASE + Math.sin(a) * (RY - k), 0.25], pal.ink, (i % 3 === 0 ? 0.5 : 0.28) * skyOn, 1);
    }
    const a = (day - 0.25) * TAU;
    const up = Math.sin(a);
    const sunUp = clamp((up + 0.08) / 0.22) * skyOn;
    const moonUp = clamp((-up + 0.08) / 0.22) * skyOn;
    // the night's few stars, only while the moon is up
    const stars = Math.round((m ? 7 : 13) * f.q);
    for (let i = 0; i < stars; i++) {
      const sa = (0.12 + 0.76 * f.rnd(i * 3)) * Math.PI;
      const sr = 0.25 + 0.6 * f.rnd(i * 3 + 1);
      const tw = f.still ? 0.8 : 0.65 + 0.35 * Math.sin(t * 0.6 + i * 1.7);
      f.dot([-Math.cos(sa) * RX * sr, BASE + Math.sin(sa) * RY * sr, 0.25], 0.008, pal.ink, 0.6 * tw * clamp(-up * 3) * skyOn);
    }
    if (sunUp > 0.003) {
      const c = sky(a);
      f.glow(c, 0.42, pal.gold, 0.4 * sunUp);
      f.dot(c, 0.105, pal.bg, 0.9 * sunUp);
      f.dot(c, 0.105, pal.gold, 0.85 * sunUp);
      const turn = f.still ? 0 : t * 0.05;
      for (let i = 0; i < 8; i++) {
        const r = turn + (i / 8) * TAU;
        f.line([c[0] + Math.cos(r) * 0.15, c[1] + Math.sin(r) * 0.15, c[2]], [c[0] + Math.cos(r) * 0.21, c[1] + Math.sin(r) * 0.21, c[2]], pal.gold, 0.7 * sunUp, 1.25);
      }
    }
    if (moonUp > 0.003) {
      const c = sky(a + Math.PI);
      const p = f.P(c[0], c[1], c[2]);
      if (p) {
        const r = 0.1 * p.s * f.u;
        f.glow(c, 0.34, pal.indigo, 0.3 * moonUp);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, -Math.PI / 2, Math.PI / 2, false);
        ctx.ellipse(p.x, p.y, r * 0.42, r, 0, Math.PI / 2, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = rgba(pal.ink, 0.88 * moonUp);
        ctx.fill();
      }
    }

    // ── the film: the base, then each frame's small sky, then the perforations
    const filmOn = f.on(0, 0.4);
    const edge = 1.32;
    const top: V3[] = [];
    const bottom: V3[] = [];
    for (let i = 0; i <= N; i++) {
      top.push(strip(i / N, edge, drift));
      bottom.push(strip(i / N, -edge, drift));
    }
    for (let i = 0; i < N; i++) {
      const q: V3[] = [bottom[i], bottom[i + 1], top[i + 1], top[i]];
      f.fill(q, pal.bg, 0.9 * filmOn);
      f.fill(q, pal.ink, 0.045 * filmOn);
    }
    f.path(bottom, pal.ink, 0.34 * filmOn, 1);
    trace(f, top, pal.key, 0.5 * filmOn, 1.1, f.still ? -1 : t / 14);

    const holes = m || f.q < 0.75 ? 1 : 2;
    for (let i = 0; i < N; i++) {
      for (let h = 0; h < holes; h++) {
        const s0 = (i + (h + 0.3) / holes) / N;
        const s1 = s0 + 0.36 / holes / N;
        for (const v of [1.12, -1.24]) {
          f.fill([strip(s0, v, drift), strip(s1, v, drift), strip(s1, v + 0.12, drift), strip(s0, v + 0.12, drift)], pal.ink, 0.3 * filmOn);
        }
      }
    }

    for (let i = 0; i < N; i++) {
      const on = f.on(0.15 + (i / N) * 0.6, 0.25);
      if (on <= 0.003) continue;
      const s0 = (i + 0.09) / N;
      const s1 = (i + 0.91) / N;
      const mid = (i + 0.5) / N;
      const isNow = i === nowAt;
      // the frames just played are still lit; the film ahead has not been through the gate
      const since = (nowAt - i + N) % N;
      const played = since < 6 ? 1 - since / 6 : 0;
      const touch = f.near(strip(mid, 0, drift), 46);
      const lift = touch * 0.09;
      const quad: V3[] = [strip(s0, -1, drift, lift), strip(s1, -1, drift, lift), strip(s1, 1, drift, lift), strip(s0, 1, drift, lift)];
      const light = Math.max(0, sunAt(mid));
      const level = (0.42 + 0.58 * Math.max(played, touch)) * on;
      if (lift > 0.004) f.fill(quad, pal.bg, 0.92 * on);
      f.fill(quad, light > 0 ? pal.key : pal.indigo, (light > 0 ? 0.1 + 0.34 * light : 0.16) * level);
      // each small sky: the sun at its height for that hour, or the moon
      const body = strip(mid, light > 0 ? -0.55 + 1.1 * light : 0.35, drift, lift);
      f.dot(body, 0.017, light > 0 ? pal.ink : pal.indigo, (light > 0 ? 0.9 : 0.75) * level);
      f.line(strip(s0, -0.62, drift, lift), strip(s1, -0.62, drift, lift), pal.ink, 0.3 * level, 1);
      f.path(quad, isNow ? pal.gold : touch > 0.05 ? pal.key : pal.ink, isNow ? 0.95 * on : (0.22 + 0.6 * touch) * on, isNow ? 1.75 : 1, true);
      if (isNow) {
        f.fill(quad, pal.gold, 0.2 * on);
        f.glow(strip(mid, 0, drift, lift), 0.3, pal.gold, 0.32 * on * (f.still ? 1 : 0.8 + 0.2 * Math.sin(t * 1.1)));
      }
    }

    // ── the lettering: the quarters of the day under the strip, and the present hour
    const named = f.on(0.8, 0.2);
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1px";
    for (const h of [0, 6, 12, 18]) {
      f.label(h < 10 ? `0${h}` : `${h}`, strip((h + 0.5) / N, -edge, drift), { align: "center", size, colour: pal.ink2, alpha: 0.75 * named, dy: 13 });
    }
    f.label("NOW", strip((nowAt + 0.5) / N, edge, drift), { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: -11 });
    ctx.restore();
  },
};

export default scene;
