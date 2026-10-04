"use client";

import { useMemo, useState } from "react";
import { rgba, TAU, type FigureDraw } from "@/components/figures/Figure";
import { clock, DAY, DAY_NAMES, fxWeek, listOf, SEASONS } from "@/components/guides/hours";
import { Stage } from "@/components/labs/kit";
import { zoneId } from "@/components/markets/time";
import { DataNote } from "@/components/ui/Page";
import { useNow } from "@/hooks/useNow";
import { fxOverview, SCHEDULE_NOTE } from "@/lib/sessions";
import { bandLength, modWeek, nowOfWeek, pieces, WEEK, weekModel, type Band } from "./week";

/**
 * THE WEEK STRIP
 *
 * The trading week drawn as one strip, Monday to Sunday: the FX week as a band
 * with a notch where each day turns, the four session windows beneath it, the
 * weekend close shaded, and the present moment marked from the visitor's own
 * clock. Every hour comes from lib/sessions; this file holds none.
 *
 * The server renders a neutral state (the strip in UTC, no marker, no claim
 * about the present); the visitor's clock is read after mount. The canvas is
 * decoration: the sentence beneath it says in words what it shows. It is a
 * timetable of regular weekday hours, not a data feed, and it knows nothing of
 * holidays. Nothing is stored.
 */

const SHORT_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const TONES = ["teal", "gold", "emerald", "accent"] as const;
const TONE_VARS = ["var(--teal)", "var(--prestige)", "var(--emerald)", "var(--accent)"];

/** the parts of `a` that lie inside any of `inside` */
function within(a: [number, number], inside: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const [s, e] of inside) {
    const lo = Math.max(a[0], s);
    const hi = Math.min(a[1], e);
    if (hi > lo) out.push([lo, hi]);
  }
  return out;
}

export function WeekStrip() {
  const now = useNow(30_000);
  const [zone, setZone] = useState<"local" | "UTC">("local");
  const viewTz = now && zone === "local" ? zoneId("local") : "UTC";
  // until the clock is read the strip is drawn for a fixed day, so that nothing depends on when the site was built
  const at = now ?? SEASONS[0].at;
  const hourKey = Math.floor(at.getTime() / 3_600_000);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the offsets only change with the hour
  const model = useMemo(() => weekModel(viewTz, at), [viewTz, hourKey]);
  const here = now ? nowOfWeek(viewTz, now) : null;
  const zoneWords = zone === "local" && now ? "your time" : "UTC";

  let sentence = "The strip is drawn in UTC until your clock has been read.";
  if (now && here) {
    const fx = fxOverview(now);
    const wk = fxWeek(viewTz, now);
    const day = DAY_NAMES[here.weekday];
    const names = fx.open.map((s) => s.name);
    sentence = fx.weekOpen
      ? `On ${zone === "local" ? "your clock" : "the UTC clock"} it is ${day}. The FX week is open, ${
          names.length >= 2 ? `with ${listOf(names)} inside their conventional windows` : names.length === 1 ? `inside the ${names[0]} window` : "between session windows"
        }; on the regular timetable it closes on ${DAY_NAMES[wk.closes.day]} at ${clock(wk.closes.minutes)} ${zoneWords}.`
      : `On ${zone === "local" ? "your clock" : "the UTC clock"} it is ${day}. The FX week is closed; on the regular timetable it opens on ${DAY_NAMES[wk.opens.day]} at ${clock(wk.opens.minutes)} ${zoneWords}.`;
  }

  const draw: FigureDraw = (f) => {
    const { ctx, w, h, pal } = f;
    if (w < 100 || h < 60) return;
    const small = w < 480;
    const [L, R, T, B] = [small ? 36 : 78, 8, 24, 20];
    const pw = w - L - R;
    const ph = h - T - B;
    const X = (m: number) => L + (m / WEEK) * pw;
    const rows = 1 + model.sessions.length;
    const rh = ph / rows;
    const font = `600 10px ${pal.font}`;
    const weekPieces = pieces(model.week);
    const closed: Band = { start: model.week.end, end: model.week.start };
    const overDay = f.hover > 0.02 && f.mx >= L && f.mx <= L + pw ? Math.min(6, Math.floor(((f.mx - L) / pw) * 7)) : -1;

    ctx.font = font;
    ctx.textBaseline = "middle";

    // the close: the darker stretch between one week and the next
    let widest: [number, number] | null = null;
    for (const p of pieces(closed)) {
      ctx.fillStyle = rgba(pal.ink, 0.085);
      ctx.fillRect(X(p[0]), T, X(p[1]) - X(p[0]), ph);
      if (!widest || p[1] - p[0] > widest[1] - widest[0]) widest = p;
    }

    // seven days; the one under the pointer lights
    for (let d = 0; d < 7; d++) {
      const x = X(d * DAY);
      if (d === overDay) {
        ctx.fillStyle = rgba(pal.accent, 0.11 * f.hover);
        ctx.fillRect(x, T, pw / 7, ph);
      }
      ctx.fillStyle = rgba(pal.line, 1);
      ctx.fillRect(Math.round(x), T, 1, ph);
      ctx.textAlign = "center";
      ctx.fillStyle = rgba(d === overDay ? pal.ink : pal.ink3, 1);
      ctx.fillText(SHORT_DAYS[d], x + pw / 14, T - 11);
      // midday, as a small tick on the foot of the strip
      ctx.fillStyle = rgba(pal.ink3, 0.6);
      ctx.fillRect(Math.round(x + pw / 14), T + ph, 1, 4);
    }
    ctx.fillStyle = rgba(pal.line, 1);
    ctx.fillRect(Math.round(X(WEEK)), T, 1, ph);
    ctx.fillRect(L, T + ph, pw, 1);

    // the names of the rows
    ctx.textAlign = "left";
    ctx.fillStyle = rgba(pal.ink3, 1);
    ctx.fillText(small ? "WEEK" : "FX WEEK", 0, T + rh / 2);
    model.sessions.forEach((s, i) => {
      // on a narrow strip: SYD, TOK, LON, and NY for the one name of two words
      const words = s.name.split(" ");
      const name = (small ? (words.length > 1 ? words.map((p) => p[0]).join("") : s.name.slice(0, 3)) : s.name).toUpperCase();
      ctx.fillText(name, 0, T + rh * (i + 1.5));
    });
    ctx.fillText(zone === "local" && now ? (small ? "YOURS" : "YOUR TIME") : "UTC", 0, T + ph + 11);

    // the bands arrive from the left as the figure comes into view
    ctx.save();
    ctx.beginPath();
    ctx.rect(L, T, pw * f.enter, ph);
    ctx.clip();

    // the FX week, with a notch where each day turns
    const y0 = T + rh * 0.2;
    const bh = rh * 0.6;
    for (const p of weekPieces) {
      ctx.fillStyle = rgba(pal.accent, 0.3);
      ctx.fillRect(X(p[0]), y0, X(p[1]) - X(p[0]), bh);
      ctx.fillStyle = rgba(pal.accent, 0.9);
      ctx.fillRect(X(p[0]), y0, X(p[1]) - X(p[0]), 1.5);
    }
    for (const m of model.turns) {
      const x = Math.round(X(m));
      ctx.clearRect(x - 2, y0 - 1, 4, bh * 0.55);
      ctx.fillStyle = rgba(pal.ink2, 0.9);
      ctx.fillRect(x, y0 + bh * 0.55, 1, bh * 0.45);
    }

    // the four session windows, kept inside the week
    model.sessions.forEach((s, i) => {
      const y = T + rh * (i + 1) + rh * 0.3;
      const tone = pal[TONES[i % TONES.length]];
      for (const b of s.bands) {
        for (const p of pieces(b)) {
          for (const q of within(p, weekPieces)) {
            ctx.fillStyle = rgba(tone, 0.6);
            ctx.fillRect(X(q[0]), y, Math.max(1, X(q[1]) - X(q[0])), rh * 0.4);
          }
        }
      }
    });

    // a light that travels the length of the open week
    if (!f.still) {
      const m = modWeek(model.week.start + ((f.t / 12) % 1) * bandLength(model.week));
      const x = X(m);
      const g = ctx.createLinearGradient(x - 26, 0, x + 26, 0);
      g.addColorStop(0, rgba(pal.accent, 0));
      g.addColorStop(0.5, rgba(pal.accent, 0.55));
      g.addColorStop(1, rgba(pal.accent, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - 26, y0, 52, bh);
    }
    ctx.restore();

    if (widest) {
      const span = X(widest[1]) - X(widest[0]);
      const words = span > 118 ? "WEEKEND CLOSE" : span > 56 ? "CLOSED" : "";
      if (words) {
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.fillText(words, (X(widest[0]) + X(widest[1])) / 2, T + rh * 3);
      }
    }

    // the present moment, from the visitor's clock
    if (here) {
      const x = X(here.minute);
      ctx.fillStyle = rgba(pal.ink, 0.9);
      ctx.fillRect(Math.round(x), T - 3, 1.5, ph + 3);
      ctx.beginPath();
      ctx.arc(x + 0.75, T - 3, 3.5, 0, TAU);
      ctx.fill();
      const beat = f.still ? 0.5 : 0.5 + 0.5 * Math.sin(f.t * 1.4);
      ctx.beginPath();
      ctx.arc(x + 0.75, T - 3, 6 + 3 * beat, 0, TAU);
      ctx.strokeStyle = rgba(pal.ink, 0.4 * (1 - beat * 0.7));
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = rgba(pal.ink, 1);
      ctx.fillText("NOW", Math.min(Math.max(x, L + 14), w - R - 14), T + ph + 11);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-21 gap-y-13">
        <div>
          <p className="label">{!now ? "Reading your clock…" : zone === "local" ? `Your time · ${viewTz.replace(/_/g, " ")}` : "UTC"}</p>
          <p className="num mt-5 font-display text-3xl font-light leading-none tracking-[-0.02em]">
            {here ? (
              <>
                {here.label}
                <span className="ml-8 font-sans text-sm font-normal tracking-normal text-ink-3">{DAY_NAMES[here.weekday]}</span>
              </>
            ) : (
              <span aria-hidden>--:--</span>
            )}
          </p>
        </div>
        <fieldset>
          <legend className="label mb-8">Draw the week in</legend>
          <div className="seg inline-flex">
            {(
              [
                ["local", "Your time"],
                ["UTC", "UTC"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" aria-pressed={zone === k} onClick={() => setZone(k)} className="!h-[2.75rem] whitespace-nowrap">
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-13">
        <Stage draw={draw} ratio={2.4} rev={(zone === "UTC" ? 100_000 : 0) + (here ? here.minute : -1)} />
      </div>

      <p className="mt-13 text-[0.9375rem] text-ink" aria-live="polite">
        {sentence}
      </p>

      <ul className="mt-13 flex flex-wrap gap-x-21 gap-y-5 text-xs text-ink-3">
        <li className="inline-flex items-center gap-5">
          <span aria-hidden className="h-8 w-21 border-t-2 border-accent bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]" />
          The FX week; each notch is where a day turns
        </li>
        {model.sessions.map((s, i) => (
          <li key={s.key} className="inline-flex items-center gap-5">
            <span aria-hidden className="h-5 w-21 opacity-60" style={{ background: TONE_VARS[i % TONE_VARS.length] }} />
            {s.name}
          </li>
        ))}
        <li className="inline-flex items-center gap-5">
          <span aria-hidden className="h-8 w-21 bg-[color-mix(in_srgb,var(--ink)_9%,transparent)]" />
          Weekend close
        </li>
      </ul>
      <DataNote className="mt-13" status="schedule">
        {SCHEDULE_NOTE} The week is drawn with today’s clock offsets.
      </DataNote>
    </div>
  );
}
