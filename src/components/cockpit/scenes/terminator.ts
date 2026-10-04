/**
 * TERMINATOR — the globe, the line between day and night, and the four sessions.
 *
 * A globe of smoked glass seen side-on, its axis upright in a meridian ring.
 * Across it runs the terminator, the line where day meets night, in champagne:
 * it is placed from the visitor's clock (the hour gives the longitude the sun
 * stands over, the date its height north or south), and the night side of the
 * glass is darker. Four meridians are picked out, one through each of the
 * cities the foreign-exchange sessions are named for. A session inside its
 * conventional hours is lit along its whole arc, with a light travelling it;
 * the others rest. The globe turns once in a few minutes, so each comes round.
 *
 * It is the clock, the calendar and the published timetable, nothing else: no
 * prices, no currencies, no routes between the cities.
 *
 * The pointer turns the globe by hand, so any session can be brought to the
 * front, and the meridian it rests on brightens with its name.
 */
import { TAU, clamp, rgba, type Frame, type Palette, type Scene, type V3 } from "../engine";
import { callouts, lamp, orb, ring, trace, type Callout } from "../kit";
import { fxSessionOpen, fxSessions } from "../../../lib/sessions";

const DEG = Math.PI / 180;
const R = 1;
/** the meridian ring the globe is carried in */
const BEZEL = 1.16;

type Tone = keyof Pick<Palette, "teal" | "blue" | "emerald">;
/** each session's city: latitude, longitude, and its region's colour */
const CITY: Record<string, readonly [number, number, Tone]> = {
  sydney: [-33.9, 151.2, "teal"],
  tokyo: [35.7, 139.7, "teal"],
  london: [51.5, -0.1, "blue"],
  "new-york": [40.7, -74, "emerald"],
};

type State = { stamp: number; open: boolean[]; face: number };

/** a point of the globe for a latitude and longitude, with longitude `spin` facing the viewer */
const place = (lat: number, lon: number, spin: number, k = 1): V3 => {
  const a = lat * DEG;
  const b = (lon - spin) * DEG;
  return [Math.cos(a) * Math.sin(b) * R * k, Math.sin(a) * R * k, -Math.cos(a) * Math.cos(b) * R * k];
};

/** where the sun stands: its latitude (from the date) and its longitude (from the hour), in degrees */
function sun(now: Date): [number, number] {
  const day = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000);
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
  return [-23.44 * Math.cos((TAU * (day + 10)) / 365), 180 - hours * 15];
}

/** which sessions are inside their hours: read from the timetable once a minute */
function timetable(f: Frame, s: State): void {
  const stamp = Math.floor(f.now.getTime() / 60000);
  if (stamp === s.stamp) return;
  s.stamp = stamp;
  s.open = fxSessions.map((fx) => fxSessionOpen(fx, f.now));
}

/** a line on the glass: the near side drawn in full (lit, if asked), the far side as a suggestion */
function onGlobe(f: Frame, pts: readonly V3[], colour: string, alpha: number, width: number, lit: boolean, pulse = -1): void {
  let run: V3[] = [];
  let front = pts.length ? pts[0][2] < 0.12 : true;
  const flush = () => {
    if (run.length < 2) return;
    if (front && lit) trace(f, run, colour, alpha, width, pulse);
    else f.path(run, colour, alpha * (front ? 1 : 0.2), front ? width : 1);
  };
  for (const p of pts) {
    const isFront = p[2] < 0.12;
    if (isFront !== front) {
      run.push(p);
      flush();
      run = [p];
      front = isFront;
    } else run.push(p);
  }
  flush();
}

const scene: Scene<State> = {
  pose: 6,
  setup(f) {
    const s: State = { stamp: -1, open: [], face: 0 };
    timetable(f, s);
    // the globe begins with the sessions that are open facing the visitor; with none open, with the day side
    let x = 0;
    let y = 0;
    fxSessions.forEach((fx, i) => {
      const city = CITY[fx.key];
      if (!city || !s.open[i]) return;
      x += Math.cos(city[1] * DEG);
      y += Math.sin(city[1] * DEG);
    });
    s.face = Math.hypot(x, y) > 0.05 ? Math.atan2(y, x) / DEG : sun(f.now)[1];
    return s;
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0, 0.1, 6.4, 1);
    timetable(f, s);

    const centre = f.P(0, 0, 0);
    if (!centre) return;
    const rpx = R * centre.s * f.u;
    const on = f.on(0, 0.45);
    // one turn in three minutes; under the pointer the glass follows the hand
    const drag = f.hover > 0 ? clamp((f.mx - centre.x) / Math.max(1, rpx), -1.4, 1.4) * 55 * f.hover : 0;
    const spin = s.face + (f.still ? 0 : t * 2) - drag;

    // ── the glass, the day on it, and the night
    orb(f, [0, 0, 0], R, pal.key, on);
    const [decl, noon] = sun(f.now);
    const sv = place(decl, noon, spin);
    const sp = f.P(sv[0], sv[1], sv[2]);
    let phi = 0;
    let side = 0;
    if (sp) {
      // the sun's direction across the screen, how far to one side of the globe it stands, and how much it faces the visitor
      phi = Math.atan2(sp.y - centre.y, sp.x - centre.x);
      side = clamp(Math.abs(sp.x - centre.x) / Math.max(1, rpx));
      const toward = clamp((centre.z - sp.z) / R, -1, 1);
      ctx.save();
      ctx.translate(centre.x, centre.y);
      ctx.rotate(phi);
      ctx.beginPath();
      ctx.arc(0, 0, rpx, 0, TAU);
      ctx.fillStyle = rgba(pal.key, 0.07 * on);
      ctx.fill();
      // night: the limb away from the sun, closed by the terminator, which is half an ellipse
      const minor = Math.max(0.5, rpx * Math.abs(toward));
      ctx.beginPath();
      ctx.arc(0, 0, rpx, Math.PI / 2, Math.PI * 1.5, false);
      ctx.ellipse(0, 0, minor, rpx, 0, Math.PI * 1.5, Math.PI / 2, toward > 0);
      ctx.closePath();
      ctx.fillStyle = rgba(pal.bg, 0.62 * on);
      ctx.fill();
      ctx.fillStyle = rgba(pal.indigo, 0.1 * on);
      ctx.fill();
      ctx.restore();
    }

    // ── the graticule, engraved in the glass
    const seg = Math.round((m ? 24 : 36) * f.q);
    const line: V3[] = [];
    for (let lon = 0; lon < 360; lon += 30) {
      line.length = 0;
      for (let i = 0; i <= seg; i++) line.push(place(-90 + (180 * i) / seg, lon, spin));
      onGlobe(f, line, pal.ink, 0.13 * on, 1, false);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      line.length = 0;
      for (let i = 0; i <= seg * 2; i++) line.push(place(lat, (360 * i) / (seg * 2), spin));
      onGlobe(f, line, pal.ink, (lat === 0 ? 0.26 : 0.12) * on, 1, false);
    }

    // ── the terminator itself
    if (sp) {
      const toward = clamp((centre.z - sp.z) / R, -1, 1);
      const minor = Math.max(0.5, rpx * Math.abs(toward));
      const lineOn = f.on(0.35, 0.4);
      ctx.save();
      ctx.translate(centre.x, centre.y);
      ctx.rotate(phi);
      ctx.beginPath();
      ctx.ellipse(0, 0, minor, rpx, 0, Math.PI * 1.5, Math.PI / 2, toward > 0);
      ctx.strokeStyle = rgba(pal.gold, 0.16 * lineOn);
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.gold, 0.95 * lineOn);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }

    // ── the four sessions: a meridian through each city, lit while the session is inside its hours
    const names: Callout[] = [];
    const breathe = f.still ? 1 : 0.85 + 0.15 * Math.sin(t * 1.1);
    fxSessions.forEach((fx, i) => {
      const city = CITY[fx.key];
      if (!city) return;
      const lit = f.on(0.3 + i * 0.12, 0.4);
      if (lit <= 0.003) return;
      const colour = pal[city[2]];
      const open = !!s.open[i];
      const home = place(city[0], city[1], spin, 1.012);
      const touch = f.near(home, m ? 50 : 76);
      const n = Math.max(6, Math.round(seg * lit));
      line.length = 0;
      for (let k = 0; k <= n; k++) line.push(place(-82 + (164 * k) / seg, city[1], spin, 1.012));
      onGlobe(f, line, colour, (open ? 0.95 : 0.4 + 0.4 * touch) * lit, (open ? 2.2 : 1.3) + touch, open, open && lit >= 1 && !f.still ? t / 9 + i * 0.27 : -1);
      const front = home[2] < 0.1;
      lamp(f, home, touch > 0.3 ? pal.gold : colour, (front ? 1 : 0.2) * (open ? breathe : 0.5 + 0.5 * touch) * lit, open ? 0.022 : 0.015);
      if (front && home[2] < -0.12) names.push({ text: fx.name.toUpperCase(), p: home, colour: touch > 0.3 ? pal.gold : open ? pal.ink : pal.ink2, alpha: f.on(0.8, 0.2) * (open ? 1 : 0.7 + 0.3 * touch) });
    });

    // ── the mount: a meridian ring graduated in hours, and the two ends of the axis
    ring(f, [0, 0, 0], R * BEZEL, { axis: "z", colour: pal.ink, alpha: 0.26 * on, ticks: 24, major: 6, tickLen: 0.05 });
    for (const sgn of [-1, 1]) {
      f.line([0, sgn * R, 0], [0, sgn * R * (BEZEL + 0.1), 0], pal.ink, 0.5 * on, 2);
      f.dot([0, sgn * R * BEZEL, 0], 0.022, pal.ink, 0.7 * on);
    }

    // ── the sun rides the ring on the day side; when it stands before or behind the globe it is not shown
    const out = clamp(side * 2.4 - 0.6) * f.on(0.6, 0.4);
    if (out > 0.003) {
      const ux = Math.cos(phi);
      const uy = Math.sin(phi);
      const bx = centre.x + ux * rpx * BEZEL;
      const by = centre.y + uy * rpx * BEZEL;
      const r = Math.max(3, 0.05 * f.u);
      const halo = ctx.createRadialGradient(bx, by, 0, bx, by, r * 4.5);
      halo.addColorStop(0, rgba(pal.gold, 0.4 * out));
      halo.addColorStop(1, rgba(pal.gold, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(bx - r * 4.5, by - r * 4.5, r * 9, r * 9);
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, TAU);
      ctx.fillStyle = rgba(pal.gold, 0.95 * out);
      ctx.fill();
      ctx.beginPath();
      const turn = f.still ? 0 : t * 0.05;
      for (let i = 0; i < 8; i++) {
        const a = turn + (i / 8) * TAU;
        ctx.moveTo(bx + Math.cos(a) * r * 1.6, by + Math.sin(a) * r * 1.6);
        ctx.lineTo(bx + Math.cos(a) * r * 2.3, by + Math.sin(a) * r * 2.3);
      }
      ctx.strokeStyle = rgba(pal.gold, 0.7 * out);
      ctx.lineWidth = 1.25;
      ctx.stroke();
      const size = m ? 9 : 10;
      const far = rpx * (BEZEL + 0.26);
      ctx.save();
      ctx.letterSpacing = "1.5px";
      f.label("DAY", [0, 0, 0], { align: "center", size, colour: pal.gold, alpha: 0.9 * out, dx: ux * far, dy: uy * far * 0.86 });
      f.label("NIGHT", [0, 0, 0], { align: "center", size, colour: pal.ink2, alpha: 0.8 * out, dx: -ux * far, dy: -uy * far * 0.86 });
      ctx.restore();
    }

    callouts(f, names, { size: m ? 9 : 11, reach: m ? 10 : 16 });
  },
};

export default scene;
