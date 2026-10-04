/**
 * The trading week on one clock, in minutes from Monday 00:00.
 *
 * This file holds no opening hour of its own. The FX week, the four session
 * windows and the hour the FX day turns are all read from lib/sessions through
 * components/guides/hours, and are moved here onto a seven-day axis in a chosen
 * time zone. The clock offsets of one moment are used for the whole week, so a
 * week in which a city changes its clocks is drawn with the offsets of the day
 * it is viewed. Regular weekday hours only: no holiday or early close.
 */
import { DAY, fxWeek, offsetOf } from "@/components/guides/hours";
import { fxSessions, localTime, type FxSession } from "@/lib/sessions";

export const WEEK = 7 * DAY;
export const modWeek = (m: number) => ((m % WEEK) + WEEK) % WEEK;

/** minute of the week on a Monday-first axis, from a weekday (0 is Sunday) and minutes after midnight */
export const minuteOfWeek = (weekday: number, minutes: number) => ((weekday + 6) % 7) * DAY + minutes;

/** a stretch of the week; when `end` is not after `start` it runs past Sunday midnight */
export type Band = { start: number; end: number };

/** a band as one or two pieces that lie inside the axis */
export function pieces(b: Band): [number, number][] {
  if (b.end > b.start) return [[b.start, b.end]];
  const out: [number, number][] = [[b.start, WEEK]];
  if (b.end > 0) out.push([0, b.end]);
  return out;
}

export const bandLength = (b: Band) => modWeek(b.end - b.start) || WEEK;

/** The FX week: from its opening to its close, as lib/sessions defines them. */
export function weekBand(viewTz: string, at: Date): Band {
  const w = fxWeek(viewTz, at);
  return { start: minuteOfWeek(w.opens.day, w.opens.minutes), end: minuteOfWeek(w.closes.day, w.closes.minutes) };
}

/** One session's window on each of its five weekdays. */
export function sessionBands(s: FxSession, viewTz: string, at: Date): Band[] {
  const shift = offsetOf(viewTz, at) - offsetOf(s.tz, at);
  return [1, 2, 3, 4, 5].map((d) => ({ start: modWeek(minuteOfWeek(d, s.open) + shift), end: modWeek(minuteOfWeek(d, s.close) + shift) }));
}

/** Where each FX day turns: the close of the New York window, Monday to Friday. */
export function dayTurns(viewTz: string, at: Date): number[] {
  const ny = fxSessions.find((s) => s.key === "new-york") ?? fxSessions[fxSessions.length - 1];
  return sessionBands(ny, viewTz, at).map((b) => b.end);
}

export function nowOfWeek(viewTz: string, at: Date): { minute: number; weekday: number; label: string } {
  const t = localTime(at, viewTz);
  return { minute: minuteOfWeek(t.weekday, t.minutes), weekday: t.weekday, label: t.label };
}

export type WeekModel = {
  week: Band;
  sessions: { key: string; name: string; bands: Band[] }[];
  turns: number[];
};

export function weekModel(viewTz: string, at: Date): WeekModel {
  return {
    week: weekBand(viewTz, at),
    sessions: fxSessions.map((s) => ({ key: s.key, name: s.name, bands: sessionBands(s, viewTz, at) })),
    turns: dayTurns(viewTz, at),
  };
}
