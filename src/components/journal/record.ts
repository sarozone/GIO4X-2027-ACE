/**
 * TRADING JOURNAL: what a trade may be, and the journal as a CSV file.
 *
 * A pure module (one type-only import, no clock, no storage): the checks the
 * form makes, the checks made on whatever is read back from the browser's
 * storage, and the reading and writing of the CSV backup. All three use the
 * same limits, so a trade that the form would refuse cannot arrive by a file
 * or by an edited storage entry either.
 *
 * The rule it keeps: nothing is repaired by guessing. A file with anything
 * malformed in it is refused whole, with the row and the reason; a stored
 * trade that is not exactly the expected shape is left out.
 */
import type { Mood, Side, Trade } from "./stats";

/** kept in step with MOODS in ./stats (this module imports only types, so that node can run it as it is) */
const MOOD_LIST: readonly Mood[] = ["calm", "rushed", "bored", "fearful", "confident"];

export const LIMITS = {
  /** the most trades the journal holds */
  trades: 500,
  instrument: 24,
  /** the plan, and what happened: characters each */
  text: 500,
  /** the largest size, price or result, either side of zero */
  number: 1_000_000_000,
  /** the largest file read on import, in characters */
  csv: 1_000_000,
  firstYear: 1970,
  lastYear: 2100,
} as const;

export type Body = Omit<Trade, "id">;

/** A trade as typed: every field still text. The form and a CSV row are both this. */
export type Draft = { date: string; instrument: string; side: string; size: string; entry: string; exit: string; stop: string; result: string; plan: string; happened: string; mood: string; followed: string };
export type Field = keyof Draft;

export const EMPTY_DRAFT: Draft = { date: "", instrument: "", side: "long", size: "", entry: "", exit: "", stop: "", result: "", plan: "", happened: "", mood: "", followed: "" };

/* ==========================================================================
   Checks
   ========================================================================== */

/** A real calendar day, written YYYY-MM-DD, within the years the journal accepts. */
export function isDay(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < LIMITS.firstYear || y > LIMITS.lastYear) return false;
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

/** Control characters are taken out; a line break survives only where lines are allowed. */
function tidyText(s: string, lines: boolean): string {
  let out = "";
  for (const ch of s.replace(/\r\n?/g, "\n")) {
    const c = ch.codePointAt(0) ?? 0;
    if (ch === "\n") out += lines ? "\n" : " ";
    else if (ch === "\t") out += " ";
    else if (c < 32 || c === 127) continue;
    else out += ch;
  }
  return lines ? out.trim() : out.replace(/\s+/g, " ").trim();
}

const PLAIN = /^\d{1,10}(\.\d{1,8})?$/;
const MONEY = /^[+-]?\d{1,10}(\.\d{1,2})?$/;

const positive = (n: number) => Number.isFinite(n) && n > 0 && n <= LIMITS.number;

/** The same limits, on a trade whose fields already have their types. */
export function bodyOk(b: Body): boolean {
  return (
    isDay(b.date) &&
    b.instrument.length >= 1 &&
    b.instrument.length <= LIMITS.instrument &&
    tidyText(b.instrument, false) === b.instrument &&
    (b.side === "long" || b.side === "short") &&
    positive(b.size) &&
    positive(b.entry) &&
    positive(b.exit) &&
    (b.stop === null || positive(b.stop)) &&
    Number.isFinite(b.result) &&
    Math.abs(b.result) <= LIMITS.number &&
    Math.round(b.result * 100) / 100 === b.result &&
    b.plan.length <= LIMITS.text &&
    tidyText(b.plan, true) === b.plan &&
    b.happened.length <= LIMITS.text &&
    tidyText(b.happened, true) === b.happened &&
    MOOD_LIST.includes(b.mood) &&
    typeof b.followed === "boolean"
  );
}

export type Checked = { ok: true; body: Body } | { ok: false; errors: Partial<Record<Field, string>> };

/** A typed trade, checked field by field. Each message says what the field needs. */
export function checkDraft(d: Draft): Checked {
  const errors: Partial<Record<Field, string>> = {};

  const date = d.date.trim();
  if (!isDay(date)) errors.date = "Give the day of the trade as a real date, written year-month-day (2026-03-09).";

  const instrument = tidyText(d.instrument, false);
  if (!instrument) errors.instrument = "Say what was traded, in a few characters.";
  else if (instrument.length > LIMITS.instrument) errors.instrument = `Keep this to ${LIMITS.instrument} characters.`;

  const side = d.side.trim();
  if (side !== "long" && side !== "short") errors.side = "Long or short.";

  const plain = (k: "size" | "entry" | "exit" | "stop", what: string): number => {
    const s = d[k].trim();
    if (!PLAIN.test(s)) {
      errors[k] = `${what} is a number above zero, written with digits and a point (1.25), with no more than eight decimal places.`;
      return 0;
    }
    const n = Number(s);
    if (!positive(n)) errors[k] = n > 0 ? `${what} cannot be more than ${LIMITS.number.toLocaleString("en-GB")}.` : `${what} must be above zero.`;
    return n;
  };
  const size = plain("size", "The size");
  const entry = plain("entry", "The entry price");
  const exit = plain("exit", "The exit price");
  const stop = d.stop.trim() === "" ? null : plain("stop", "The stop");

  let result = 0;
  const r = d.result.trim();
  if (!MONEY.test(r)) errors.result = "The result is an amount with at most two decimal places: 42.50 for a gain, -42.50 for a loss, 0 for neither.";
  else {
    result = Number(r);
    if (Math.abs(result) > LIMITS.number) errors.result = `The result cannot be more than ${LIMITS.number.toLocaleString("en-GB")} either side of zero.`;
    if (result === 0) result = 0; // never minus zero
  }

  const plan = tidyText(d.plan, true);
  if (plan.length > LIMITS.text) errors.plan = `Keep this to ${LIMITS.text} characters.`;
  const happened = tidyText(d.happened, true);
  if (happened.length > LIMITS.text) errors.happened = `Keep this to ${LIMITS.text} characters.`;

  const mood = d.mood.trim();
  if (!MOOD_LIST.includes(mood as Mood)) errors.mood = `Choose one: ${MOOD_LIST.join(", ")}.`;

  const followed = d.followed.trim();
  if (followed !== "yes" && followed !== "no") errors.followed = "Yes or no.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, body: { date, instrument, side: side as Side, size, entry, exit, stop, result, plan, happened, mood: mood as Mood, followed: followed === "yes" } };
}

/** A number as plain digits, never in exponent form: what the form shows and the file holds. */
export const plainNumber = (n: number) => n.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");

export function toDraft(b: Body): Draft {
  return {
    date: b.date,
    instrument: b.instrument,
    side: b.side,
    size: plainNumber(b.size),
    entry: plainNumber(b.entry),
    exit: plainNumber(b.exit),
    stop: b.stop === null ? "" : plainNumber(b.stop),
    result: b.result.toFixed(2),
    plan: b.plan,
    happened: b.happened,
    mood: b.mood,
    followed: b.followed ? "yes" : "no",
  };
}

/** Two trades that say exactly the same thing. Used so that importing a backup twice adds nothing the second time. */
export function sameBody(a: Body, b: Body): boolean {
  return a.date === b.date && a.instrument === b.instrument && a.side === b.side && a.size === b.size && a.entry === b.entry && a.exit === b.exit && a.stop === b.stop && a.result === b.result && a.plan === b.plan && a.happened === b.happened && a.mood === b.mood && a.followed === b.followed;
}

/** By date, oldest first; trades of the same day stay in the order they were written. */
export function inOrder<T extends { date: string }>(trades: readonly T[]): T[] {
  return trades
    .map((t, i) => ({ t, i }))
    .sort((a, b) => (a.t.date < b.t.date ? -1 : a.t.date > b.t.date ? 1 : a.i - b.i))
    .map((x) => x.t);
}

/* ==========================================================================
   What is read back from storage
   ========================================================================== */

const ID = /^[a-z0-9]{6,24}$/;
export const idOk = (s: string) => ID.test(s);

const KEYS = ["id", "date", "instrument", "side", "size", "entry", "exit", "stop", "result", "plan", "happened", "mood", "followed"] as const;

/**
 * The stored value, as a list of trades. Only `{ v: 1, trades: [...] }` is
 * read. A trade is kept only if it has exactly the expected fields, each of
 * the expected type and within the limits, and an id no earlier trade has.
 * Everything else is discarded.
 */
export function revive(value: unknown): Trade[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const o = value as Record<string, unknown>;
  if (o.v !== 1 || !Array.isArray(o.trades)) return [];
  const out: Trade[] = [];
  const seen = new Set<string>();
  for (const item of o.trades) {
    if (out.length >= LIMITS.trades) break;
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const t = item as Record<string, unknown>;
    const keys = Object.keys(t);
    if (keys.length !== KEYS.length || !KEYS.every((k) => Object.prototype.hasOwnProperty.call(t, k))) continue;
    if (typeof t.id !== "string" || !ID.test(t.id) || seen.has(t.id)) continue;
    if (typeof t.date !== "string" || typeof t.instrument !== "string" || typeof t.side !== "string" || typeof t.plan !== "string" || typeof t.happened !== "string" || typeof t.mood !== "string") continue;
    if (typeof t.size !== "number" || typeof t.entry !== "number" || typeof t.exit !== "number" || typeof t.result !== "number" || typeof t.followed !== "boolean") continue;
    if (t.stop !== null && typeof t.stop !== "number") continue;
    const body: Body = { date: t.date, instrument: t.instrument, side: t.side as Side, size: t.size, entry: t.entry, exit: t.exit, stop: t.stop, result: t.result === 0 ? 0 : t.result, plan: t.plan, happened: t.happened, mood: t.mood as Mood, followed: t.followed };
    if (!bodyOk(body)) continue;
    seen.add(t.id);
    out.push({ id: t.id, ...body });
  }
  return inOrder(out);
}

/* ==========================================================================
   The CSV file
   ========================================================================== */

export const CSV_COLUMNS = ["date", "instrument", "side", "size", "entry", "exit", "stop", "result", "plan", "happened", "mood", "followed_plan"] as const;
export const CSV_HEADER = CSV_COLUMNS.join(",");

/**
 * A spreadsheet treats a cell that begins with = + - or @ as a formula. Words
 * that begin that way are written with an apostrophe in front, which a
 * spreadsheet shows as text; the apostrophe is taken off again on import.
 */
const RISKY = /^[=+\-@\t\r']/;
const guard = (s: string) => (RISKY.test(s) ? `'${s}` : s);
const unguard = (s: string) => (s[0] === "'" && RISKY.test(s.slice(1)) ? s.slice(1) : s);

const cell = (s: string) => (/[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s);

export function toCsv(trades: readonly Body[]): string {
  const rows = trades.map((t) => {
    const d = toDraft(t);
    return [d.date, guard(d.instrument), d.side, d.size, d.entry, d.exit, d.stop, d.result, guard(d.plan), guard(d.happened), d.mood, d.followed].map(cell).join(",");
  });
  return [CSV_HEADER, ...rows].join("\r\n") + "\r\n";
}

type Rows = { ok: true; rows: string[][] } | { ok: false; error: string };

/** Comma-separated text into rows of cells, by the usual rules (RFC 4180) and no looser. */
function parseRows(text: string): Rows {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let quoted = false;
  /** the cell began with a quotation mark and that mark has been closed */
  let closed = false;
  let started = false;
  const n = text.length;
  const endCell = () => {
    row.push(cur);
    cur = "";
    closed = false;
    started = false;
  };
  for (let i = 0; i < n; i++) {
    const ch = text[i]!;
    const line = rows.length + 1;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cur += ch === "\r" ? (text[i + 1] === "\n" ? "" : "\n") : ch;
      continue;
    }
    if (ch === ",") endCell();
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r") {
        if (text[i + 1] !== "\n") return { ok: false, error: `Row ${line}: a line ends in a way this file should not (a carriage return on its own).` };
        i++;
      }
      endCell();
      rows.push(row);
      row = [];
    } else if (closed) return { ok: false, error: `Row ${line}: there is text straight after a closing quotation mark.` };
    else if (ch === '"') {
      if (started) return { ok: false, error: `Row ${line}: a quotation mark appears in the middle of a value that is not quoted.` };
      quoted = true;
      started = true;
    } else {
      cur += ch;
      started = true;
    }
  }
  if (quoted) return { ok: false, error: `Row ${rows.length + 1}: a quotation mark is opened and never closed.` };
  if (started || closed || row.length) {
    endCell();
    rows.push(row);
  }
  return { ok: true, rows };
}

export type Imported = { ok: true; bodies: Body[] } | { ok: false; error: string };

/**
 * The journal's own CSV, read back. The header must be the journal's header
 * exactly, every row must have its twelve values, and every value must pass
 * the same checks as the form. One fault refuses the whole file.
 */
export function fromCsv(input: string): Imported {
  if (input.length > LIMITS.csv) return { ok: false, error: "That file is too large to be a journal exported from this page." };
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  if (text.includes("\u0000") || text.includes("�")) return { ok: false, error: "That file is not plain text. Choose the .csv file this page exported." };
  if (!text.trim()) return { ok: false, error: "That file is empty." };
  const parsed = parseRows(text);
  if (!parsed.ok) return parsed;
  // empty lines after the last trade are not rows; an empty line anywhere else is a fault
  const lines = parsed.rows;
  while (lines.length && lines[lines.length - 1]!.length === 1 && lines[lines.length - 1]![0] === "") lines.pop();
  const [head, ...rows] = lines;
  if (!head || head.join(",") !== CSV_HEADER) return { ok: false, error: `Row 1 is not this journal’s heading row. It must be exactly: ${CSV_HEADER}` };
  if (!rows.length) return { ok: false, error: "That file has a heading row and no trades." };
  if (rows.length > LIMITS.trades) return { ok: false, error: `That file has ${rows.length} trades. The journal holds ${LIMITS.trades}.` };
  const bodies: Body[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const at = i + 2;
    if (r.length !== CSV_COLUMNS.length) return { ok: false, error: `Row ${at} has ${r.length} value${r.length === 1 ? "" : "s"}. Every row needs ${CSV_COLUMNS.length}.` };
    const draft: Draft = { date: r[0]!, instrument: unguard(r[1]!), side: r[2]!, size: r[3]!, entry: r[4]!, exit: r[5]!, stop: r[6]!, result: r[7]!, plan: unguard(r[8]!), happened: unguard(r[9]!), mood: r[10]!, followed: r[11]! };
    const checked = checkDraft(draft);
    if (!checked.ok) {
      const [field, message] = Object.entries(checked.errors)[0]!;
      const column = field === "followed" ? "followed_plan" : field;
      return { ok: false, error: `Row ${at}, ${column}: ${message}` };
    }
    bodies.push(checked.body);
  }
  return { ok: true, bodies: inOrder(bodies) };
}
