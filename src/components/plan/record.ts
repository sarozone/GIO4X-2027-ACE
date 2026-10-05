/**
 * TRADING PLAN BUILDER: what a plan may hold, and the plan as a JSON file.
 *
 * A pure module (no imports, no clock, no storage), so node can run it as it
 * is: the questions the page asks, the limits on an answer, the checks made on
 * whatever is read back from the browser's storage, and the reading and
 * writing of the exported file. All of them use the same limits, so an answer
 * the form would refuse cannot arrive by a file or by an edited storage entry.
 *
 * The rules it keeps: the builder asks questions and records answers. There
 * is no suggested answer, no example figure and no default in any field.
 * Nothing is repaired by guessing: a file with anything unexpected in it is
 * refused whole, with the reason.
 */

export const LIMITS = {
  /** a one-line answer: characters */
  line: 120,
  /** an answer in the visitor's own words: characters */
  text: 1500,
  /** the largest file read on import, in characters */
  file: 100_000,
} as const;

export type PlanField = {
  key: string;
  /** the question, which is also the field's label */
  label: string;
  /** what kind of thing the answer is, never what the answer should be */
  hint: string;
  /** one line, or several */
  lines: boolean;
};

export type PlanSection = { key: string; title: string; fields: readonly PlanField[] };

/** The plan, section by section. A question says what to write about; none says what to write. */
export const PLAN_SECTIONS = [
  {
    key: "about",
    title: "This plan",
    fields: [
      { key: "title", label: "What do you call this plan?", hint: "A name for the top of the page. Optional.", lines: false },
      { key: "written", label: "When was it written, or last revised?", hint: "A date, in your own words.", lines: false },
    ],
  },
  {
    key: "markets",
    title: "Markets and times",
    fields: [
      { key: "markets", label: "Which markets or instruments will you trade?", hint: "The ones this plan covers, and no others.", lines: true },
      { key: "times", label: "On which days, and during which hours, will you trade?", hint: "Say which time zone you mean.", lines: true },
      { key: "notTrading", label: "When will you not trade?", hint: "Times, events or states of mind in which you stay out.", lines: true },
    ],
  },
  {
    key: "risk",
    title: "Risk",
    fields: [
      { key: "riskPerTrade", label: "How much of the account will you risk on one trade?", hint: "A share of the balance or an amount of money: your own figure.", lines: true },
      { key: "dailyStop", label: "At what loss do you stop for the day?", hint: "A figure, and what you do when it is reached.", lines: true },
      { key: "exposure", label: "What is the most you will have open at one time?", hint: "In positions, in lots or in risk: however you count it.", lines: true },
    ],
  },
  {
    key: "entry",
    title: "Entry rules",
    fields: [
      { key: "entry", label: "What must be true before you open a trade?", hint: "Your conditions, in your own words, so that you could check them one by one.", lines: true },
      { key: "size", label: "How do you decide the size of a trade?", hint: "The steps you follow, from the risk above to a number of lots.", lines: true },
    ],
  },
  {
    key: "exit",
    title: "Exit rules",
    fields: [
      { key: "exitLoss", label: "Where does the stop go, and what would make you close at a loss before it?", hint: "How the level is chosen, and whether it is ever moved.", lines: true },
      { key: "exitProfit", label: "When do you take profit, or close a trade that is gaining?", hint: "A target, a rule or a time: whichever you use.", lines: true },
    ],
  },
  {
    key: "routine",
    title: "Routine",
    fields: [
      { key: "before", label: "What do you do before a session?", hint: "What you check, read or write down first.", lines: true },
      { key: "after", label: "What do you do after one?", hint: "What you record, and where.", lines: true },
    ],
  },
  {
    key: "review",
    title: "Review",
    fields: [
      { key: "review", label: "When do you review your trades, and what do you look at?", hint: "How often, and which records or figures.", lines: true },
      { key: "change", label: "What would have to happen for you to change this plan?", hint: "The evidence you would want before you rewrite a rule.", lines: true },
    ],
  },
] as const satisfies readonly PlanSection[];

export type PlanKey = (typeof PLAN_SECTIONS)[number]["fields"][number]["key"];
export type Plan = Record<PlanKey, string>;

const FIELDS: readonly PlanField[] = (PLAN_SECTIONS as readonly PlanSection[]).flatMap((s) => s.fields);
export const PLAN_KEYS = FIELDS.map((f) => f.key) as PlanKey[];
const byKey = new Map(FIELDS.map((f) => [f.key, f]));

export const limitOf = (key: PlanKey): number => (byKey.get(key)?.lines ? LIMITS.text : LIMITS.line);

export const EMPTY_PLAN: Plan = Object.freeze(Object.fromEntries(PLAN_KEYS.map((k) => [k, ""]))) as Plan;

/** True when nothing has been written in any field. */
export const isEmpty = (plan: Plan): boolean => PLAN_KEYS.every((k) => plan[k].trim() === "");

/** How many of the questions have an answer. */
export const answered = (plan: Plan): number => PLAN_KEYS.filter((k) => plan[k].trim() !== "").length;

/** Control characters are taken out; a line break survives only where lines are allowed; the answer is cut at its limit. */
export function tidy(key: PlanKey, s: string): string {
  const lines = Boolean(byKey.get(key)?.lines);
  let out = "";
  for (const ch of s.replace(/\r\n?/g, "\n")) {
    const c = ch.codePointAt(0) ?? 0;
    if (ch === "\n") out += lines ? "\n" : " ";
    else if (ch === "\t") out += " ";
    else if (c >= 32 && c !== 127) out += ch;
  }
  return out.slice(0, limitOf(key));
}

/** An answer exactly as tidy() would leave it: what storage and a file must hold. */
const answerOk = (key: PlanKey, v: unknown): v is string => typeof v === "string" && tidy(key, v) === v;

/**
 * A plan from whatever storage held: `{ v: 1, plan: { … } }`. An answer that
 * is not a string within its limit is left out, and so is any key the plan
 * does not have. Anything else gives the empty plan.
 */
export function revive(stored: unknown): Plan {
  const out: Plan = { ...EMPTY_PLAN };
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return out;
  const o = stored as Record<string, unknown>;
  if (o.v !== 1 || !o.plan || typeof o.plan !== "object" || Array.isArray(o.plan)) return out;
  const p = o.plan as Record<string, unknown>;
  for (const k of PLAN_KEYS) if (answerOk(k, p[k])) out[k] = p[k];
  return out;
}

/** What storage holds: only the answered questions. */
export function toStored(plan: Plan): { v: 1; plan: Partial<Plan> } {
  const kept: Partial<Plan> = {};
  for (const k of PLAN_KEYS) if (plan[k] !== "") kept[k] = plan[k];
  return { v: 1, plan: kept };
}

/* ==========================================================================
   The exported file
   ========================================================================== */

/** The marker that says a JSON file is a plan from this page. */
export const FILE_APP = "gio4x-trading-plan";

/** The plan as the text of a file. `exported` is a date made by the caller (this module has no clock). */
export function toFile(plan: Plan, exported: string): string {
  return `${JSON.stringify({ app: FILE_APP, v: 1, exported, plan: toStored(plan).plan }, null, 2)}\n`;
}

export type FileRead = { ok: true; plan: Plan; answers: number } | { ok: false; reason: string };

/** Read a file back. Refused whole if it is not a plan from this page, or holds anything a plan cannot. */
export function fromFile(text: string): FileRead {
  if (text.length > LIMITS.file) return { ok: false, reason: "The file is larger than a plan file can be." };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, reason: "The file is not valid JSON." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, reason: "The file is not a trading plan exported from this page." };
  const o = data as Record<string, unknown>;
  if (o.app !== FILE_APP) return { ok: false, reason: "The file is not a trading plan exported from this page." };
  if (o.v !== 1) return { ok: false, reason: "The file is from a version of the plan builder that this page cannot read." };
  if (!o.plan || typeof o.plan !== "object" || Array.isArray(o.plan)) return { ok: false, reason: "The file holds no plan." };
  const p = o.plan as Record<string, unknown>;
  const known = new Set<string>(PLAN_KEYS);
  for (const k of Object.keys(p)) if (!known.has(k)) return { ok: false, reason: `The file holds an answer this page has no question for (“${k.slice(0, 24)}”).` };
  const plan: Plan = { ...EMPTY_PLAN };
  for (const k of PLAN_KEYS) {
    const v = p[k];
    if (v === undefined) continue;
    if (typeof v !== "string") return { ok: false, reason: `The answer to “${byKey.get(k)?.label ?? k}” is not text.` };
    if (v.replace(/\r\n?/g, "\n").length > limitOf(k)) return { ok: false, reason: `The answer to “${byKey.get(k)?.label ?? k}” is longer than ${limitOf(k)} characters.` };
    // line endings and stray control characters are normalised exactly as the form would on typing
    plan[k] = tidy(k, v);
  }
  return { ok: true, plan, answers: answered(plan) };
}
