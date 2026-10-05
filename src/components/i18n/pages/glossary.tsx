import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlossaryList, type GlossaryRow } from "@/components/i18n/GlossaryList";
import { TranslationNotice } from "@/components/i18n/Translated";
import { PageHero } from "@/components/ui/Page";
import { glossary, glossaryTopics } from "@/data/glossary";
import { getDictionary } from "@/i18n";
import { isLocale, languageAlternates, localeInfo, localePath } from "@/i18n/config";
import { getGlossaryWords } from "@/i18n/glossary";
import { glossaryPage } from "@/i18n/glossary-page";
import { pageMeta } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

/** the count is read from the data, never typed into a translation */
const withCount = (sentence: string) => sentence.replace("{n}", String(glossary.length));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const g = glossaryPage[lang];
  return pageMeta({
    title: g.title,
    description: withCount(g.metaDescription),
    path: localePath(lang, "glossary"),
    languages: languageAlternates("glossary"),
    locale: localeInfo(lang).og,
  });
}

/**
 * The glossary in the page's language: every term of src/data/glossary.ts
 * with its name and definition from src/i18n/glossary/<code>.ts, its topic,
 * and a link to its English entry, marked as English, where the formula, the
 * example and the related terms are. The list of terms, their order and
 * their topics are the English glossary's own, so the page cannot fall
 * behind it: a term added there before it is translated appears here in
 * English and says so.
 */
export default async function LocaleGlossaryPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const g = glossaryPage[lang];
  const words = await getGlossaryWords(lang);
  const name = d.home.learning.glossary.name;

  const rows: GlossaryRow[] = glossary.map((t) => {
    const w: { term: string; definition: string } | undefined = words[t.slug];
    // an entry with either half missing counts as not translated: a row is never half in one language
    const own = w && w.term && w.definition ? w : null;
    return { slug: t.slug, english: t.term, term: own ? own.term : t.term, definition: own ? own.definition : t.definition, topic: t.topic, translated: own !== null };
  });

  return (
    <>
      <TranslationNotice dict={d} page="glossary" />
      <PageHero
        crumbs={[
          { name: d.common.home, href: localePath(lang) },
          { name, href: localePath(lang, "glossary") },
        ]}
        eyebrow={name}
        title={g.title}
        lead={withCount(g.lead)}
        quiet
      />
      <GlossaryList
        rows={rows}
        topics={glossaryTopics.map((key) => ({ key, label: g.topics[key] }))}
        words={{
          searchLabel: g.searchLabel,
          searchPlaceholder: g.searchPlaceholder,
          topicsLabel: g.topicsLabel,
          allTopics: g.allTopics,
          count: g.count,
          countOf: g.countOf,
          clear: g.clear,
          none: g.none,
          untranslated: g.untranslated,
          inEnglish: d.common.inEnglish,
        }}
      />
    </>
  );
}
