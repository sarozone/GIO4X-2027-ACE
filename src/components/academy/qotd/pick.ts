/**
 * QUESTION OF THE DAY: which question a day shows, and the run of days.
 *
 * A pure module (no imports, no clock, no storage), so node can run it as it
 * is. The page passes in the time; this file only does the arithmetic.
 *
 * The day is the calendar day in UTC, so the question changes at the same
 * moment for everyone and a visitor who travels does not get two questions or
 * none. The choice is a function of the date and the size of the pool alone:
 * nothing about the visitor goes into it.
 */

const DAY_MS = 86_400_000;

/** Days since 1 January 1970, in UTC. */
export const dayNumber = (ms: number): number => Math.floor(ms / DAY_MS);

/** A day number as YYYY-MM-DD. */
export const dayText = (day: number): string => new Date(day * DAY_MS).toISOString().slice(0, 10);

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * The step from one day's question to the next. The pool is in lesson order,
 * three questions to a lesson, so a step of one would ask about the same
 * lesson three days running. The step chosen is the first, counting up from
 * 0.618 of the pool, that shares no factor with its size (so every question
 * is visited once before any comes round again) and is at least three places
 * from where it started in either direction (so tomorrow's question is from
 * another lesson). A pool too small to allow that takes any step that visits
 * every question.
 */
export function stride(count: number): number {
  if (count <= 2) return 1;
  const start = Math.max(1, Math.round(count * 0.618));
  let fallback = 1;
  for (let n = 0; n < count; n++) {
    const s = 1 + ((start - 1 + n) % (count - 1));
    if (gcd(s, count) !== 1) continue;
    if (Math.min(s, count - s) >= 3) return s;
    if (fallback === 1) fallback = s;
  }
  return fallback;
}

/** The place in the pool of the question for a day. The same for everyone, and for every reload. */
export function questionIndex(day: number, count: number): number {
  if (!(count > 0)) return 0;
  // day and stride are reduced first, so the product stays an exact integer
  return ((day % count) * (stride(count) % count)) % count;
}

/* ==========================================================================
   The run of days
   ========================================================================== */

export type Run = {
  /** the last day a question was answered, YYYY-MM-DD (UTC) */
  last: string;
  /** days in a row, ending on `last` */
  streak: number;
  /** the longest run so far */
  best: number;
  /** which option was chosen on `last`, so the page can show the result again on that day */
  pick: number;
  /** whether it was the right one */
  right: boolean;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RUN = 9999;
const MAX_OPTIONS = 8;

const dayBefore = (day: string): string => new Date(Date.parse(`${day}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);

/** Whatever storage held, checked against the shape above; null if it is not that. */
export function cleanRun(v: unknown): Run | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.last !== "string" || !DAY.test(o.last) || Number.isNaN(Date.parse(`${o.last}T00:00:00Z`))) return null;
  if (!Number.isInteger(o.streak) || !Number.isInteger(o.best) || !Number.isInteger(o.pick) || typeof o.right !== "boolean") return null;
  const streak = Math.min(MAX_RUN, Math.max(1, o.streak as number));
  return { last: o.last, streak, best: Math.min(MAX_RUN, Math.max(streak, o.best as number)), pick: Math.min(MAX_OPTIONS - 1, Math.max(0, o.pick as number)), right: o.right };
}

/**
 * The record after today's question is answered. A day counts when the
 * question is answered, right or wrong: the run is of days spent on a
 * question, not of correct answers. Answering twice on one day changes nothing.
 */
export function answer(prev: Run | null, day: string, pick: number, right: boolean): Run {
  if (prev && prev.last === day) return prev;
  const streak = prev && prev.last === dayBefore(day) ? Math.min(MAX_RUN, prev.streak + 1) : 1;
  return { last: day, streak, best: Math.max(streak, prev?.best ?? 0), pick, right };
}

/** The run that still stands on a day: it lapses when a whole day is missed. */
export function standing(run: Run | null, day: string): number {
  if (!run) return 0;
  return run.last === day || run.last === dayBefore(day) ? run.streak : 0;
}

/** True when the day's question has been answered. */
export const answeredOn = (run: Run | null, day: string): boolean => run !== null && run.last === day;
