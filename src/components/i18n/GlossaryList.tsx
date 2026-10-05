"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

export type GlossaryRow = {
  slug: string;
  /** the term's English name: the text of the link to its English entry */
  english: string;
  term: string;
  definition: string;
  /** the English topic, which is the key the filter works on */
  topic: string;
  /** false when the language's file has no entry for this slug: the row is then the English one */
  translated: boolean;
};

export type GlossaryListWords = {
  searchLabel: string;
  searchPlaceholder: string;
  topicsLabel: string;
  allTopics: string;
  count: string;
  countOf: string;
  clear: string;
  none: string;
  untranslated: string;
  inEnglish: string;
};

/**
 * The glossary of one language as a list with a filter box and a topic
 * filter (src/components/i18n/pages/glossary.tsx). It is the translated
 * pages' own list, not the English index (components/knowledge/GlossaryIndex):
 * that one files terms under A to Z, which means nothing in most of these
 * scripts, and carries the lessons' progress marks, which are English.
 *
 * The whole list is in the HTML, so it reads, prints and indexes without
 * JavaScript; the filter only hides rows. It receives finished strings: no
 * dictionary reaches the client.
 */
export function GlossaryList({ rows, topics, words }: { rows: GlossaryRow[]; topics: { key: string; label: string }[]; words: GlossaryListWords }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const inputId = useId();

  const needle = q.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rows.filter((r) => {
        if (topic && r.topic !== topic) return false;
        if (!needle) return true;
        // the term in the page's language, its English name, and the words of the definition
        return r.term.toLowerCase().includes(needle) || r.english.toLowerCase().includes(needle) || r.slug.replace(/-/g, " ").includes(needle) || r.definition.toLowerCase().includes(needle);
      }),
    [rows, topic, needle],
  );
  const shown = new Set(visible.map((r) => r.slug));
  const filtered = Boolean(needle || topic);
  const label = Object.fromEntries(topics.map((t) => [t.key, t.label]));
  const pill = "chip !h-auto min-h-[2.125rem] cursor-pointer !normal-case !tracking-normal aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg";

  return (
    <div className="wrap section-quiet">
      <div className="field">
        <label htmlFor={inputId}>{words.searchLabel}</label>
        <input id={inputId} type="search" className="input !h-[3.4375rem] !text-lg" placeholder={words.searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))} autoComplete="off" spellCheck={false} enterKeyHint="search" />
      </div>

      <div className="mt-13 flex flex-wrap items-center gap-8" role="group" aria-label={words.topicsLabel}>
        <button type="button" className={pill} aria-pressed={topic === null} onClick={() => setTopic(null)}>
          {words.allTopics}
        </button>
        {topics.map((t) => (
          <button key={t.key} type="button" className={pill} aria-pressed={topic === t.key} onClick={() => setTopic(topic === t.key ? null : t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-13 text-xs text-ink-3" aria-live="polite">
        {filtered ? words.countOf.replace("{shown}", String(visible.length)).replace("{n}", String(rows.length)) : words.count.replace("{n}", String(rows.length))}
        {filtered && (
          <button
            type="button"
            className="link ms-13"
            onClick={() => {
              setQ("");
              setTopic(null);
            }}
          >
            {words.clear}
          </button>
        )}
      </p>

      {visible.length === 0 && (
        <div className="panel-quiet mt-34 p-34">
          <p className="h4">{words.none}</p>
        </div>
      )}

      <ul className="mt-34 border-t border-line-strong">
        {rows.map((r) => (
          <li key={r.slug} id={r.slug} hidden={!shown.has(r.slug)} className="scroll-mt-[calc(var(--header-h)+1.3125rem)] border-b border-line">
            <div className="grid gap-x-34 gap-y-5 py-13 md:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)_9.5rem] md:items-baseline md:py-21">
              <div>
                {/* a term the language's file does not carry yet is the English one, and is marked so */}
                <h2 className="h4" lang={r.translated ? undefined : "en"} dir={r.translated ? undefined : "ltr"}>
                  {r.term}
                </h2>
                <p className="mt-5 flex flex-wrap items-center gap-y-3 text-sm">
                  {/* the full entry (formula, example, related terms) is the English page */}
                  <Link href={`/glossary/${r.slug}`} hrefLang="en" lang="en" dir="ltr" className="link-quiet">
                    {r.english}
                  </Link>
                  <span className="chip ms-8 align-middle !h-[1.375rem] !normal-case !tracking-normal">{words.inEnglish}</span>
                </p>
              </div>
              <div>
                <p className="text-[0.9375rem] text-ink-2" lang={r.translated ? undefined : "en"} dir={r.translated ? undefined : "ltr"}>
                  {r.definition}
                </p>
                {!r.translated && <p className="mt-5 text-xs text-ink-3">{words.untranslated}</p>}
              </div>
              <p className="label md:text-end">{label[r.topic] ?? r.topic}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
