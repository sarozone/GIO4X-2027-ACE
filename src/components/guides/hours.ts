import { centres, fxSessions, localTime, windowInUtc } from "@/lib/sessions";

/**
 * The timetable as it reads on one clock.
 *
 * Everything here is worked out from lib/sessions (the four conventional FX
 * windows and the regular hours of the nine exchanges): this file holds no
 * opening hour of its own. It moves each window from its anchor city to the
 * clock of a chosen time zone, at a chosen moment, and finds where two FX
 * windows are open together.
 *
 * It runs in two places. On the server it is given two fixed dates (the middle
 * of January and the middle of July), so the words in the HTML never depend on
 * the day the site was built. In the browser it is given the visitor's clock.
 * Regular weekday hours only: no public holiday or early close is modelled.
 */

export const DAY = 1440;
const mod = (m: number) => ((m % DAY) + DAY) % DAY;

/** minutes of one clock's day; when `end` is not after `start` the window runs past midnight */
export type Span = { start: number; end: number };

export type Row = {
  key: string;
  kind: "fx" | "exchange";
  /** the session's name, or the exchange's city */
  name: string;
  /** the exchange, for an exchange row */
  venue?: string;
  span: Span;
  /** the midday break, where the exchange has one */
  lunch?: Span;
};

export type Overlap = { key: string; names: string[]; span: Span };

/** Two fixed days, one in each half of the year, so that both states of the clocks are shown. */
export const SEASONS = [
  { key: "jan", label: "Mid-January", inWords: "mid-January", at: new Date(Date.UTC(2027, 0, 15, 12)) },
  { key: "jul", label: "Mid-July", inWords: "mid-July", at: new Date(Date.UTC(2027, 6, 15, 12)) },
] as const;

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** A zone's distance from UTC in minutes at that moment, with its sign (UTC+14 is 840, not −600). */
export function offsetOf(tz: string, at: Date): number {
  const t = localTime(at, tz);
  const utc = at.getUTCHours() * 60 + at.getUTCMinutes();
  let days = (t.weekday - at.getUTCDay() + 7) % 7;
  if (days > 3) days -= 7;
  return days * DAY + t.minutes - utc;
}

/** A window kept in one zone's local time, as it reads on another zone's clock at that moment. */
export function spanIn(viewTz: string, srcTz: string, open: number, close: number, at: Date): Span {
  const utc = windowInUtc(srcTz, open, close, at);
  const off = offsetOf(viewTz, at);
  return { start: mod(utc.start + off), end: mod(utc.end + off) };
}

export const wraps = (s: Span) => s.end <= s.start;
export const spanLength = (s: Span) => mod(s.end - s.start) || DAY;
export const inSpan = (s: Span, m: number) => (wraps(s) ? m >= s.start || m < s.end : m >= s.start && m < s.end);

export const clock = (m: number) => `${String(Math.floor(mod(m) / 60)).padStart(2, "0")}:${String(mod(m) % 60).padStart(2, "0")}`;
/** "22:00 to 07:00 the next day" */
export const spanText = (s: Span) => `${clock(s.start)} to ${clock(s.end)}${wraps(s) ? " the next day" : ""}`;
/** "22:00–07:00 +1", for a table cell */
export const spanCell = (s: Span) => `${clock(s.start)}–${clock(s.end)}${wraps(s) ? " +1" : ""}`;

export function fxRows(viewTz: string, at: Date): Row[] {
  return fxSessions.map((s) => ({ key: s.key, kind: "fx", name: s.name, span: spanIn(viewTz, s.tz, s.open, s.close, at) }));
}

export function exchangeRows(viewTz: string, at: Date): Row[] {
  return centres.map((c) => ({
    key: c.key,
    kind: "exchange",
    name: c.city,
    venue: c.venue,
    span: spanIn(viewTz, c.tz, c.open, c.close, at),
    lunch: c.lunch ? spanIn(viewTz, c.tz, c.lunch[0], c.lunch[1], at) : undefined,
  }));
}

/** Where two or more of the rows are open at once, in the order of the clock's day. */
export function overlaps(rows: Row[]): Overlap[] {
  const STEP = 5;
  const n = DAY / STEP;
  const runs: { key: string; names: string[]; from: number; to: number }[] = [];
  for (let i = 0; i < n; i++) {
    const open = rows.filter((r) => inSpan(r.span, i * STEP));
    const key = open.map((r) => r.key).join("+");
    const last = runs[runs.length - 1];
    if (last && last.key === key) last.to = i + 1;
    else runs.push({ key, names: open.map((r) => r.name), from: i, to: i + 1 });
  }
  // a run that is cut by midnight is one run
  if (runs.length > 1 && runs[0].key === runs[runs.length - 1].key) {
    runs[0].from = runs[runs.length - 1].from;
    runs.pop();
  }
  return runs
    .filter((r) => r.names.length >= 2)
    .map((r) => ({ key: r.key, names: r.names, span: { start: mod(r.from * STEP), end: mod(r.to * STEP) } }))
    .sort((a, b) => a.span.start - b.span.start);
}

/**
 * The FX week on one clock. lib/sessions has the week begin on Sunday and end
 * on Friday at the hour New York's window closes, so that hour is read from
 * the New York window rather than written here.
 */
export function fxWeek(viewTz: string, at: Date): { opens: { day: number; minutes: number }; closes: { day: number; minutes: number } } {
  const ny = fxSessions.find((s) => s.key === "new-york") ?? fxSessions[fxSessions.length - 1];
  const total = ny.close - offsetOf(ny.tz, at) + offsetOf(viewTz, at);
  const shift = Math.floor(total / DAY);
  const minutes = mod(total);
  return { opens: { day: (0 + shift + 7) % 7, minutes }, closes: { day: (5 + shift + 7) % 7, minutes } };
}

/** "Sydney and Tokyo", "Sydney, Tokyo and London" */
export function listOf(names: string[]): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
