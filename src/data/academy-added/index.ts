import type { Lesson, ModuleLink } from "../academy";
import { getComparison } from "../comparisons";
import { getTerm } from "../glossary";
import { getStrategy, STRATEGIES } from "../strategies";
import { automationLessons } from "./automation";
import { cryptoLessons } from "./crypto";
import { testingLessons } from "./testing";
import type { AddedLesson } from "./types";

/**
 * Lessons written by hand, and what they change in the curriculum.
 *
 * src/data/generated/academy.json is written by scripts/import-content.mjs and
 * is never edited by hand, so anything added to the Academy since the import
 * lives here and is joined to the carried data when src/data/academy.ts loads:
 *
 *  - `addedLessons`: the new lessons, in the order they are numbered;
 *  - `moduleAdditions`: by module key, the lessons a module gains and the
 *    pages elsewhere on this site that already cover its outline;
 *  - `pathAdditions`: by path key and step title, the lessons a step gains.
 *
 * The rule this folder keeps: a link is made only to a page that exists. A
 * strategy, a glossary term or a comparison is looked up in its own data and
 * takes its name from there; one that has gone is left out, not left dangling.
 */
const BYLINE = "GIO4X Academy";
const WORDS_A_MINUTE = 200;

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** The fields a carried lesson has in the file, worked out here from the lesson itself. */
function complete(l: AddedLesson, order: number): Lesson {
  const toc = [...l.body.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => ({ id: m[1], text: text(m[2]) }));
  const words = text(l.body).split(" ").length;
  return { ...l, order, byline: BYLINE, toc, readMinutes: Math.max(1, Math.round(words / WORDS_A_MINUTE)) };
}

const written: AddedLesson[] = [...cryptoLessons, ...testingLessons, ...automationLessons];

/** The added lessons, numbered on from `from` (one past the last carried lesson). */
export const addedLessons = (from: number): Lesson[] => written.map((l, i) => complete(l, from + i));

/* ── pages that already cover a module's outline ────────────────────────── */

const strategy = (slug: string): ModuleLink[] => {
  const s = getStrategy(slug);
  return s ? [{ href: `/strategies/${s.slug}`, label: s.name, note: `Strategy page. Held: ${s.held.charAt(0).toLowerCase()}${s.held.slice(1)}.` }] : [];
};
const term = (slug: string): ModuleLink[] => {
  const t = getTerm(slug);
  return t ? [{ href: `/glossary/${t.slug}`, label: t.term, note: "Glossary term." }] : [];
};
const comparison = (slug: string, note: string): ModuleLink[] => {
  const c = getComparison(slug);
  return c ? [{ href: `/side-by-side/${c.slug}`, label: `${c.name}, side by side`, note }] : [];
};

export const moduleAdditions: Record<string, { lessons: string[]; elsewhere: ModuleLink[] }> = {
  // Scalping, day trading, swing and position trading, hedging, trend following: each has its own page already
  styles: {
    lessons: testingLessons.map((l) => l.slug),
    elsewhere: [
      ...comparison("trading-styles", "Scalping, day trading, swing trading and position trading in one table."),
      { href: "/strategies", label: "Strategy library", note: `${STRATEGIES.length} approaches, one page each: the rule, what it needs, what it costs and when it fails.` },
      ...strategy("scalping"),
      ...strategy("swing-trading"),
      ...strategy("position-trading"),
      ...strategy("moving-average-trend-following"),
      ...strategy("breakout-trading"),
      ...term("day-trading"),
      ...term("hedging"),
      { href: "/labs/rule-bench", label: "Rule bench", note: "Build a rule from parts and test it on invented prices." },
      { href: "/labs/risk-room", label: "The Risk Room", note: "What position size does to one run of trades." },
      { href: "/journal", label: "Trading journal", note: "A private record of trades, kept in the browser." },
    ],
  },
  automation: {
    lessons: automationLessons.map((l) => l.slug),
    elsewhere: [
      { href: "/labs/rule-bench", label: "Rule bench", note: "A backtest on invented prices, and the same rule on many other markets." },
      ...term("expert-advisor"),
      ...term("vps"),
      ...term("metatrader"),
    ],
  },
  crypto: {
    lessons: cryptoLessons.map((l) => l.slug),
    elsewhere: [
      { href: "/markets/crypto", label: "Crypto markets", note: "The asset class and its instruments." },
      ...comparison("instrument-types", "What is held with a CFD, a future, an option, an ETF and a share."),
      ...term("cfd"),
    ],
  },
};

/** By path key, then by the step's title as the carried data spells it. */
export const pathAdditions: Record<string, Record<string, string[]>> = {
  analysis: { "Testing a set of rules": testingLessons.map((l) => l.slug) },
};
