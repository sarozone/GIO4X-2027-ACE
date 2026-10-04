/**
 * The sections added on 4 October 2026 whose pages are generated from data:
 * one list of every such page, so the sitemap, the search index and the A to Z
 * index all read the same thing and a page cannot be left out of one of them.
 * A new entry in any of these data modules appears in all three by itself.
 */
import { CASE_STUDIES } from "@/data/case-studies";
import { CHART_PATTERNS } from "@/data/chart-patterns";
import { LESSONS as CHART_LESSONS } from "@/data/chart-school";
import { COMPARISONS } from "@/data/comparisons";
import { GUIDES } from "@/data/guides";
import { HISTORY } from "@/data/history";
import { INVESTING } from "@/data/investing";
import { MONEY } from "@/data/money";
import { SCAMS } from "@/data/scams";
import { STRATEGIES } from "@/data/strategies";

export type SectionPage = { href: string; label: string; description: string; kind: string; words: string[] };

type Entry = { slug: string; name: string; description: string };

const pages = (base: string, kind: string, words: string[], list: readonly Entry[]): SectionPage[] => list.map((e) => ({ href: `${base}/${e.slug}`, label: e.name, description: e.description, kind, words }));

export const SECTION_PAGES: readonly SectionPage[] = [
  ...pages("/investing", "Investing", ["investing", "invest", "long term"], INVESTING),
  ...pages("/investing/case-studies", "Case study", ["investor", "case study", "investing philosophy"], CASE_STUDIES),
  ...pages("/money", "Calculator", ["calculator", "personal finance", "money"], MONEY),
  ...pages("/chart-school", "Indicator", ["indicator", "technical analysis", "chart"], CHART_LESSONS),
  ...pages("/chart-school/patterns", "Chart pattern", ["chart pattern", "technical analysis", "pattern"], CHART_PATTERNS),
  ...pages("/strategies", "Strategy", ["strategy", "trading strategy", "approach"], STRATEGIES),
  ...pages("/side-by-side", "Comparison", ["compare", "comparison", "versus", "difference"], COMPARISONS),
  ...pages("/history", "History", ["history", "crash", "bubble", "crisis"], HISTORY),
  ...pages("/scam-school", "Scam", ["scam", "fraud", "warning signs"], SCAMS),
  ...pages("/guides", "Region guide", ["market hours", "trading hours", "time zone", "sessions"], GUIDES),
];
