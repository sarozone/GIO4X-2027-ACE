import { addedLessons, moduleAdditions, pathAdditions } from "./academy-added";
import raw from "./generated/academy.json";

/**
 * GIO4X Academy: lessons, modules and learning paths.
 *
 * Carried over from the previous site after the editorial audit recorded in
 * docs/CONTENT-AUDIT.md (scripts/import-content.mjs), and joined here to the
 * lessons written by hand since (src/data/academy-added). `body` is sanitised
 * HTML restricted to an allow-list of tags. Modules are outlines: a module
 * lists only the lessons that actually exist, says so when it has none, and
 * may link to the pages elsewhere on this site that cover its subjects.
 *
 * Nothing here states a number of lessons, modules or hours: a page that shows
 * one counts it from these exports. The Academy offers a printable record
 * that its questions were answered (/academy/practice, /academy/exams). That
 * record is not a qualification, a licence or evidence of an ability to
 * trade, and nothing in the Academy promises that study leads to profit.
 */
export type AcademyLevel = "Beginner" | "Intermediate" | "Advanced" | "Professional concepts";

export type Lesson = {
  slug: string;
  title: string;
  /** meta description, human-written */
  description: string;
  level: AcademyLevel;
  /** key of the module the lesson belongs to */
  module: string;
  order: number;
  byline: string;
  published: string;
  updated?: string;
  readMinutes: number;
  tags: string[];
  /** related knowledge-graph node ids */
  related: string[];
  /** slugs of tools that let the reader work the idea */
  tools: string[];
  toc: { id: string; text: string }[];
  body: string;
};

/** A page elsewhere on this site that covers part of a module's outline. */
export type ModuleLink = { href: string; label: string; note?: string };

export type AcademyModule = {
  key: string;
  title: string;
  level: AcademyLevel;
  summary: string;
  topics: string[];
  /** slugs of the lessons that exist; may be empty (outline only) */
  lessons: string[];
  /** pages elsewhere on this site that already cover the module's subjects */
  elsewhere?: ModuleLink[];
};

export type LearningPath = {
  key: string;
  title: string;
  summary: string;
  steps: { title: string; skills: string; lessons: string[] }[];
};

type AcademyData = { lessons: Lesson[]; modules: AcademyModule[]; paths: LearningPath[] };
const data = raw as unknown as AcademyData;

export const academyLevels: { level: AcademyLevel; line: string }[] = [
  { level: "Beginner", line: "The vocabulary and the mechanics: what is traded, how it is quoted and how a leveraged position is funded." },
  { level: "Intermediate", line: "Reading a chart and reading the economy: price structure, moving averages, and the policy that sits behind a currency." },
  { level: "Advanced", line: "Indicators, scheduled news and automation, each with what it measures and where it misleads." },
  { level: "Professional concepts", line: "How risk is sized, measured and lived with: the part of the craft that outlasts any one strategy." },
];

/**
 * Corrections to carried lesson bodies, by slug: an exact passage is replaced
 * at load, because generated/academy.json is never edited by hand.
 * - introduction-to-forex-trading: quoted a daily turnover figure with no
 *   source or date, which the editorial standards do not allow.
 */
const corrections: Record<string, { find: string; replace: string }[]> = {
  "introduction-to-forex-trading": [
    {
      find: "The forex market is the largest and most liquid financial market in the world, with a daily trading volume exceeding $7 trillion.",
      replace: "The forex market is the largest financial market in the world by turnover, which the Bank for International Settlements measures in a survey every three years.",
    },
  ],
};
const corrected = (l: Lesson): Lesson => {
  const fixes = corrections[l.slug];
  return fixes ? { ...l, body: fixes.reduce((body, f) => body.split(f.find).join(f.replace), l.body) } : l;
};

const carried = data.lessons.map(corrected);
const carriedSlugs = new Set(carried.map((l) => l.slug));
// hand-written lessons are numbered on from the last carried one; a slug the import already has wins
const added = addedLessons(Math.max(-1, ...carried.map((l) => l.order)) + 1).filter((l) => !carriedSlugs.has(l.slug));

export const lessons: Lesson[] = [...carried, ...added].sort((a, b) => a.order - b.order);
export const modules: AcademyModule[] = data.modules.map((m) => {
  const more = moduleAdditions[m.key];
  if (!more) return m;
  return { ...m, lessons: [...m.lessons, ...more.lessons.filter((s) => !m.lessons.includes(s))], ...(more.elsewhere.length ? { elsewhere: more.elsewhere } : {}) };
});
export const paths: LearningPath[] = data.paths.map((p) => {
  const more = pathAdditions[p.key];
  if (!more) return p;
  return { ...p, steps: p.steps.map((s) => (more[s.title] ? { ...s, lessons: [...s.lessons, ...more[s.title].filter((x) => !s.lessons.includes(x))] } : s)) };
});

const bySlug = new Map(lessons.map((l) => [l.slug, l]));
export const getLesson = (slug: string) => bySlug.get(slug);
export const getModule = (key: string) => modules.find((m) => m.key === key);
export const modulesByLevel = (level: AcademyLevel) => modules.filter((m) => m.level === level);
export const lessonsOf = (m: AcademyModule): Lesson[] => m.lessons.map((s) => bySlug.get(s)).filter((l): l is Lesson => Boolean(l));
export const startHere = paths.find((p) => p.key === "start-here") ?? paths[0];

/** Previous and next lesson inside the same module. */
export function neighbours(l: Lesson): { prev?: Lesson; next?: Lesson } {
  const m = getModule(l.module);
  if (!m) return {};
  const list = lessonsOf(m);
  const i = list.findIndex((x) => x.slug === l.slug);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}

/** Lessons that teach a glossary term (the term is among the lesson's related concepts). */
export const lessonsForTerm = (termSlug: string, n = 2) => lessons.filter((l) => l.related.includes(`c:${termSlug}`)).slice(0, n);
