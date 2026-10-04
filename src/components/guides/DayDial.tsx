"use client";

import { useId, useMemo, useState } from "react";
import { TAU, clamp, rgba, smooth, type Colour, type FigureDraw, type Palette } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";
import { useNow } from "@/hooks/useNow";
import { SCHEDULE_NOTE, allCentreStatus, centres, fxOverview, fxSessionOpen, fxSessions, localTime, stateLabel, type CentreState } from "@/lib/sessions";
import { DAY, DAY_NAMES, clock, exchangeRows, fxRows, listOf, overlaps, spanCell, spanLength, type Overlap, type Row } from "./hours";

/**
 * THE DAY ON A DIAL: one turn of the dial is one day on the chosen clock,
 * midnight at the top. The four outer rings are the four conventional FX
 * windows, the thin inner arcs are the nine exchanges, the dark rim marks the
 * hours when two windows are open together, and the hand is now.
 *
 * Every hour comes from lib/sessions through ./hours. Nothing is drawn as
 * "now" until the page has mounted and read the visitor's clock: the server
 * and the first paint show an empty dial and dashes. Regular weekday hours
 * only, and the note beneath says so. Nothing is stored.
 */

type Zone = { tz: string; city: string };

const RING: ((p: Palette) => Colour)[] = [(p) => p.teal, (p) => p.gold, (p) => p.accent, (p) => p.emerald];
const SWATCH = ["var(--teal)", "var(--prestige)", "var(--accent)", "var(--emerald)"];

const stateClass: Record<CentreState, string> = { open: "state-open", pre: "state-pre", lunch: "state-pre", closed: "state-off" };

type Scene = {
  fx: Row[];
  fxOpen: boolean[];
  ex: Row[];
  exOpen: boolean[];
  both: Overlap[];
  minutes: number;
  label: string;
  weekday: number;
  weekOpen: boolean;
};

const angle = (m: number) => -Math.PI / 2 + (m / DAY) * TAU;

function dial(scene: Scene | null): FigureDraw {
  return ({ ctx, w, h, t, pal, enter, hover, mx, my, still }) => {
    if (w < 100 || h < 60) return;
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) / 2 - 24;
    const ringW = clamp(R * 0.085, 6, 15);
    const gap = ringW * 0.34;
    const lane = clamp(R * 0.036, 3, 6.5);
    const fxR = (i: number) => R - 7 - i * (ringW + gap) - ringW / 2;
    const exR = (i: number) => fxR(3) - ringW / 2 - 7 - i * lane - lane / 2;
    const hub = Math.max(6, exR(8) - lane);

    const arc = (r: number, from: number, len: number, width: number, colour: string) => {
      if (len <= 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle(from), angle(from) + (len / DAY) * TAU);
      ctx.lineWidth = width;
      ctx.strokeStyle = colour;
      ctx.stroke();
    };

    // the face: a tick for each hour, a longer one each quarter of the day, and four numbers
    ctx.lineCap = "butt";
    for (let hr = 0; hr < 24; hr++) {
      const a = angle(hr * 60);
      const long = hr % 6 === 0;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (R - (long ? 5 : 2.5)), cy + Math.sin(a) * (R - (long ? 5 : 2.5)));
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.lineWidth = long ? 1.4 : 1;
      ctx.strokeStyle = rgba(long ? pal.ink2 : pal.ink3, long ? 0.9 : 0.6);
      ctx.stroke();
    }
    ctx.font = `600 10px ${pal.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(pal.ink3, 1);
    for (const hr of [0, 6, 12, 18]) {
      const a = angle(hr * 60);
      ctx.fillText(String(hr).padStart(2, "0"), cx + Math.cos(a) * (R + 13), cy + Math.sin(a) * (R + 13));
    }

    // the empty tracks, drawn whether or not the clock has been read
    for (let i = 0; i < 4; i++) arc(fxR(i), 0, DAY, ringW, rgba(pal.line, 0.9));

    if (!scene) return;

    // each ring sweeps in from its opening time as the dial arrives
    scene.fx.forEach((row, i) => {
      const grow = still ? 1 : smooth(enter * 1.5 - i * 0.12);
      const open = scene.fxOpen[i];
      const breathe = open && !still ? 0.84 + 0.16 * Math.sin(t * 2.2) : 1;
      const alpha = !scene.weekOpen ? 0.3 : open ? breathe : 0.58;
      arc(fxR(i), row.span.start, spanLength(row.span) * grow, ringW, rgba(RING[i](pal), alpha));
    });

    // the rim darkens where two windows are open together
    for (const o of scene.both) arc(R + 3.5, o.span.start, spanLength(o.span) * (still ? 1 : smooth(enter * 1.3 - 0.3)), 3, rgba(pal.ink, scene.weekOpen ? 0.92 : 0.35));

    // the exchanges: a thin arc each, broken where one stops at midday
    scene.ex.forEach((row, i) => {
      const colour = rgba(scene.exOpen[i] ? pal.ink : pal.ink2, scene.exOpen[i] ? 0.95 : 0.42);
      const width = lane * 0.56;
      const grow = still ? 1 : smooth(enter * 1.6 - 0.25 - i * 0.04);
      if (row.lunch) {
        const first = (((row.lunch.start - row.span.start) % DAY) + DAY) % DAY;
        const second = (((row.span.end - row.lunch.end) % DAY) + DAY) % DAY;
        arc(exR(i), row.span.start, first * grow, width, colour);
        arc(exR(i), row.lunch.end, second * grow, width, colour);
      } else arc(exR(i), row.span.start, spanLength(row.span) * grow, width, colour);
    });

    // under the pointer: a faint second hand, and the time it points to
    if (hover > 0.05) {
      const pa = Math.atan2(my - cy, mx - cx);
      const pm = Math.round((((((pa + Math.PI / 2) / TAU) * DAY) % DAY) + DAY) % DAY / 5) * 5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(pa) * hub, cy + Math.sin(pa) * hub);
      ctx.lineTo(cx + Math.cos(pa) * R, cy + Math.sin(pa) * R);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(pal.ink3, hover * 0.9);
      ctx.stroke();
      ctx.setLineDash([]);
      if (hub >= 17) {
        ctx.fillStyle = rgba(pal.ink3, hover);
        ctx.fillText(clock(pm % DAY), cx, cy + 8);
      }
    }

    // the hand: now, on this clock
    const a = angle(scene.minutes);
    const reach = still ? 1 : smooth(enter * 1.2);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * hub, cy + Math.sin(a) * hub);
    ctx.lineTo(cx + Math.cos(a) * (hub + (R + 3 - hub) * reach), cy + Math.sin(a) * (hub + (R + 3 - hub) * reach));
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = rgba(pal.ink, 1);
    ctx.stroke();
    const tipX = cx + Math.cos(a) * (R + 3);
    const tipY = cy + Math.sin(a) * (R + 3);
    if (!still) {
      const pulse = (t * 0.6) % 1;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4 + pulse * 9, 0, TAU);
      ctx.strokeStyle = rgba(pal.accent, (1 - pulse) * 0.7 * reach);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4, 0, TAU);
    ctx.fillStyle = rgba(pal.accent, reach);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(pal.surface, 1);
    ctx.stroke();
    if (hub >= 17) {
      ctx.fillStyle = rgba(pal.ink, 1);
      ctx.fillText(scene.label, cx, cy - (hover > 0.05 ? 6 : 0));
    }
  };
}

export function DayDial({ zones, region }: { zones: Zone[]; region?: string }) {
  const id = useId();
  const now = useNow(30_000);
  const [pick, setPick] = useState(0);
  // the visitor's own zone is known only in the browser, once the clock has been read
  const mine = now ? Intl.DateTimeFormat().resolvedOptions().timeZone || null : null;
  const options: (Zone & { own?: boolean })[] = mine ? [...zones, { tz: mine, city: `Your clock (${mine.replace(/_/g, " ")})`, own: true }] : zones;
  const zone = options[Math.min(pick, options.length - 1)];

  const stamp = now ? Math.floor(now.getTime() / 60_000) : 0;
  const scene = useMemo<Scene | null>(() => {
    if (!stamp) return null;
    const at = new Date(stamp * 60_000);
    const local = localTime(at, zone.tz);
    const overview = fxOverview(at);
    const fx = fxRows(zone.tz, at);
    return {
      fx,
      fxOpen: fxSessions.map((s) => overview.weekOpen && fxSessionOpen(s, at)),
      ex: exchangeRows(zone.tz, at),
      exOpen: allCentreStatus(at).map((s) => s.state === "open"),
      both: overlaps(fx),
      minutes: local.minutes,
      label: local.label,
      weekday: local.weekday,
      weekOpen: overview.weekOpen,
    };
  }, [stamp, zone.tz]);
  const statuses = useMemo(() => (stamp ? allCentreStatus(new Date(stamp * 60_000)) : null), [stamp]);
  const draw = useMemo(() => dial(scene), [scene]);

  const where = zone.own ? "On your clock" : `On a ${zone.city} clock`;
  const openNames = scene ? scene.fx.filter((_, i) => scene.fxOpen[i]).map((r) => r.name) : [];
  const exCount = scene ? scene.exOpen.filter(Boolean).length : 0;
  const sentence = !scene
    ? "The dial fills in once this page has read your device’s clock."
    : !scene.weekOpen
      ? `${where} it is the weekend for the foreign-exchange market: the four windows are drawn faintly, as they will fall on a weekday, and none is open.`
      : `${where}, ${openNames.length === 0 ? "none of the four FX windows is open right now" : openNames.length === 1 ? `the ${openNames[0]} window is open right now` : `the ${listOf(openNames)} windows are open together right now, an overlap`}, and ${exCount === 0 ? "none" : exCount} of the ${scene.ex.length} exchanges ${exCount === 1 ? "is" : "are"} in regular hours.`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:gap-55">
      <div className="min-w-0">
        <Stage draw={draw} ratio={1} rev={stamp + pick * 7} />
        <div className="field mt-13">
          <label htmlFor={`${id}-zone`} className="label">
            Whose clock
          </label>
          <select id={`${id}-zone`} className="select min-h-[2.75rem] w-full" value={Math.min(pick, options.length - 1)} onChange={(e) => setPick(Number(e.target.value))}>
            {options.map((o, i) => (
              <option key={o.tz + i} value={i}>
                {o.city}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-13 flex flex-wrap items-baseline gap-x-13 gap-y-3 text-sm text-ink-3">
          <span className="label">Time on this clock</span>
          <span className="num text-lg text-ink">{scene ? scene.label : "--:--"}</span>
          <span>{scene ? DAY_NAMES[scene.weekday] : ""}</span>
        </p>
        <p className="mt-8 min-h-[4.5rem] text-ink-2" aria-live="polite">
          {sentence}
        </p>
        <Note>
          {SCHEDULE_NOTE} Midnight is at the top and the day runs clockwise. The dark rim marks hours when two FX windows are open together.{region ? ` The clocks offered are reference cities for ${region}, and your own.` : ""}
        </Note>
      </div>

      <div className="min-w-0">
        <h3 className="label">The four FX windows, today, on this clock</h3>
        <div className="mt-8 overflow-x-auto">
          <table className="table-gx min-w-[19rem]">
            <thead>
              <tr>
                <th scope="col">Window</th>
                <th scope="col">Hours here</th>
                <th scope="col">Now</th>
              </tr>
            </thead>
            <tbody>
              {fxSessions.map((s, i) => (
                <tr key={s.key}>
                  <th scope="row">
                    <span aria-hidden className="mr-8 inline-block h-[0.5rem] w-[0.8125rem] rounded-[1px] align-middle" style={{ background: SWATCH[i] }} />
                    {s.name}
                  </th>
                  <td className="num">{scene ? spanCell(scene.fx[i].span) : "--:--"}</td>
                  <td>
                    <span className={`state ${scene?.fxOpen[i] ? "state-open" : "state-off"}`}>{!scene ? "…" : scene.fxOpen[i] ? "Open" : "Closed"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-13 text-sm text-ink-2">
          <span className="label mr-8">Open together</span>
          {!scene ? "--:--" : scene.both.length === 0 ? "No two windows overlap on this timetable today." : scene.both.map((o) => `${o.names.join(" × ")} ${spanCell(o.span)}`).join(" · ")}
        </p>

        <h3 className="label mt-34">The exchanges, today, on this clock</h3>
        <div className="mt-8 overflow-x-auto">
          <table className="table-gx min-w-[24rem]">
            <thead>
              <tr>
                <th scope="col">Exchange</th>
                <th scope="col">Regular hours here</th>
                <th scope="col">Midday break</th>
                <th scope="col">Now</th>
              </tr>
            </thead>
            <tbody>
              {centres.map((c, i) => {
                const s = statuses?.[i];
                const r = scene?.ex[i];
                return (
                  <tr key={c.key}>
                    <th scope="row">
                      {c.city} <span className="text-ink-3">{c.venue}</span>
                    </th>
                    <td className="num">{r ? spanCell(r.span) : "--:--"}</td>
                    <td className="num">{r ? (r.lunch ? spanCell(r.lunch) : "none") : "--:--"}</td>
                    <td>
                      <span className={`state ${s ? stateClass[s.state] : "state-off"}`}>{s ? stateLabel[s.state] : "…"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-xs text-ink-3">“+1” means the window ends after midnight, on the next day of this clock. Times use the 24-hour clock.</p>
      </div>
    </div>
  );
}
