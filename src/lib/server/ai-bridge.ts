/**
 * GIO4X AI: the bridge from a question in another language to the English
 * passages it is answered from (src/lib/ai.ts: makeBridge, bridgedQuestion).
 *
 * The site's passages are English, and retrieval is arithmetic on words. What
 * the site has in other languages is used as a word list, and as nothing more:
 *   the translated glossary   src/i18n/glossary/<code>.ts: a term's name in that
 *                             language stands for the English term
 *   the section names         src/i18n/shell.ts and the dictionaries
 *                             (src/i18n/<code>.ts): "Cuentas", "खाता खोलें",
 *                             "Plattformen" stand for the English section
 * No translated sentence is ever sent to the model as a source: the sources
 * stay the English pages.
 *
 * Built once per server instance, on the first question that is not in
 * English, and kept in memory. A glossary file that is not there (they are
 * being written language by language) or that cannot be read is skipped;
 * with none at all, the bridge is the section names alone. Nothing here is
 * personal and nothing is a secret.
 */
import "server-only";
import { glossary } from "@/data/glossary";
import { getDictionary } from "@/i18n";
import { LOCALES } from "@/i18n/config";
import { en } from "@/i18n/en";
import { shellLabels } from "@/i18n/shell";
import { makeBridge, type Bridge } from "@/lib/ai";

/** The header's words that name a part of the site, and what to search for in English. */
const SHELL: Record<string, string> = {
  Markets: "markets",
  Trading: "trading",
  Platforms: "platforms",
  Company: "company about",
  "Open account": "open account account types",
};

/** The names a dictionary gives to parts of the site, read from any language's dictionary: [the name, the English to search for]. */
function sectionNames(d: typeof en): [string, string][] {
  const rows = d.home.accounts.rows;
  const sections = d.guide.sections;
  return [
    [d.home.accounts.eyebrow, "accounts account types"],
    [d.home.accounts.link, "account types"],
    [rows.minDeposit, "minimum deposit"],
    [rows.spreadFrom, "spread"],
    [rows.commission, "commission"],
    [rows.leverage, "leverage"],
    [rows.minTrade, "minimum trade size"],
    [rows.stopOut, "stop out level"],
    [d.home.platforms.eyebrow, "platforms"],
    [d.home.tools.eyebrow, "tools calculator"],
    [d.home.learning.glossary.name, "glossary"],
    [d.home.contact.eyebrow, "contact"],
    [sections.markets.name, "markets"],
    [sections.trading.name, "trading"],
    [sections.platforms.name, "platforms"],
    [sections.company.name, "company about"],
    [d.guide.also.help.name, "help faq support"],
    [d.guide.also.legal.name, "legal documents terms"],
  ];
}

type Words = Record<string, { term?: unknown } | undefined>;

/** One language's glossary, or null when its file is not there or is not what it should be. */
async function glossaryWords(code: string): Promise<Words | null> {
  try {
    const loaded = (await import(`@/i18n/glossary/${code}`)) as Record<string, unknown>;
    const words = loaded[code] ?? loaded.default;
    return typeof words === "object" && words !== null ? (words as Words) : null;
  } catch {
    return null;
  }
}

async function build(): Promise<Bridge> {
  const pairs: [string, string][] = [];
  const english = new Map(glossary.map((g) => [g.slug, `${g.term} ${g.slug.replace(/-/g, " ")}`]));

  for (const { code } of LOCALES) {
    try {
      const label = shellLabels(`/${code}`);
      for (const [name, to] of Object.entries(SHELL)) pairs.push([label(name), to]);
      pairs.push(...sectionNames(getDictionary(code)));
    } catch {
      /* a dictionary that lacks a name: the others still count */
    }
  }

  const loaded = await Promise.all(LOCALES.map(({ code }) => glossaryWords(code)));
  for (const words of loaded) {
    if (!words) continue;
    for (const [slug, entry] of Object.entries(words)) {
      const to = english.get(slug);
      if (to && typeof entry?.term === "string") pairs.push([entry.term, to]);
    }
  }
  return makeBridge(pairs);
}

let bridge: Promise<Bridge> | null = null;

/** The bridge, built on first use. It never throws: at worst it is empty, and a question is then matched on its own words as before. */
export function aiBridge(): Promise<Bridge> {
  bridge ??= build().catch(() => []);
  return bridge;
}
