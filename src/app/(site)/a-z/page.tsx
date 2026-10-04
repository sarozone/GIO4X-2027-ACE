import Link from "next/link";
import { AzFilter } from "@/components/az/AzFilter";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { nav, secondaryNav } from "@/config/nav";
import { lessons } from "@/data/academy";
import { AZ_EXTRA } from "@/data/az-extra";
import { COMPARISONS } from "@/data/comparisons";
import { glossary } from "@/data/glossary";
import { PLAYBOOK } from "@/data/playbook";
import { tools } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * The A to Z index: every glossary term, tool, lesson, Playbook page,
 * comparison and page in the navigation, in one alphabetical list.
 *
 * Nothing is copied here. The entries are read from the modules that own
 * them (and from data/az-extra.ts for pages found in none of them), so a new
 * term or page appears without this file changing. An address is listed once:
 * the first source to name it wins, in the order below. The whole list is in
 * the HTML; the filter box is the only client component, and without
 * JavaScript everything is simply shown.
 */
const DESCRIPTION =
  "The A to Z of the GIO4X website: every glossary term, trading tool, Academy lesson, candlestick pattern, Labs experiment and page, in one alphabetical index with a filter. Find a word or a page by its first letter.";

export const metadata = pageMeta({ title: "A to Z index: every term, tool, lesson and page", description: DESCRIPTION, path: "/a-z" });

type Entry = { label: string; href: string; kind: string };

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const OTHER = "0-9";

/** filed without a leading article, as an index is: “The Playbook” under P */
const fileAs = (label: string) => label.replace(/^(the|an|a)\s+/i, "").replace(/^[^\p{L}\p{N}]+/u, "");
const letterOf = (label: string) => {
  const first = fileAs(label).charAt(0).normalize("NFD").charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : OTHER;
};

function entries(): Entry[] {
  const pageKind = (href: string) => (href === "/labs" || href.startsWith("/labs/") ? "Lab" : "Page");
  const all: Entry[] = [
    ...glossary.map((t) => ({ label: t.term, href: `/glossary/${t.slug}`, kind: "Term" })),
    ...tools.map((t) => ({ label: t.name, href: `/tools/${t.slug}`, kind: "Tool" })),
    ...lessons.map((l) => ({ label: l.title, href: `/academy/${l.slug}`, kind: "Lesson" })),
    ...PLAYBOOK.map((p) => ({ label: p.name, href: `/playbook/${p.slug}`, kind: p.kind === "pattern" ? "Pattern" : "Situation" })),
    ...COMPARISONS.map((c) => ({ label: `${c.name}, compared`, href: `/side-by-side/${c.slug}`, kind: "Comparison" })),
    ...nav.flatMap((s) => [{ label: s.label, href: s.href, kind: pageKind(s.href) }, ...s.groups.flatMap((g) => g.items.map((i) => ({ label: i.label, href: i.href, kind: pageKind(i.href) })))]),
    ...secondaryNav.flatMap((g) => g.items.map((i) => ({ label: i.label, href: i.href, kind: pageKind(i.href) }))),
    ...AZ_EXTRA.map(({ label, href, kind }) => ({ label, href, kind })),
  ];
  const seen = new Set<string>();
  return all
    .filter((e) => {
      if (!e.label || !e.href || seen.has(e.href)) return false;
      seen.add(e.href);
      return true;
    })
    .sort((a, b) => fileAs(a.label).localeCompare(fileAs(b.label), "en", { sensitivity: "base", numeric: true }) || a.kind.localeCompare(b.kind, "en"));
}

export default function Page() {
  const list = entries();
  const byLetter = new Map<string, Entry[]>();
  for (const e of list) {
    const k = letterOf(e.label);
    byLetter.set(k, [...(byLetter.get(k) ?? []), e]);
  }
  const groups = [...LETTERS, OTHER].filter((k) => byLetter.has(k));
  const kinds = [...new Set(list.map((e) => e.kind))].sort((a, b) => a.localeCompare(b, "en"));

  return (
    <>
      <JsonLd data={webPageSchema({ path: "/a-z", name: "A to Z index", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero quiet crumbs={[{ name: "A to Z", href: "/a-z" }]} eyebrow="Index" title="A to Z" lead={`Every term, tool, lesson and page on this website, in one alphabetical list: ${list.length} entries. Each says what kind of thing it is and links to it.`} />

      <section className="section" aria-labelledby="az-h">
        <div className="wrap">
          <h2 id="az-h" className="sr-only">
            The index
          </h2>
          <AzFilter target="az-list" total={list.length} />
          <p className="mt-13 flex flex-wrap items-center gap-5 text-xs text-ink-3">
            <span className="mr-5">Kinds of entry:</span>
            {kinds.map((k) => (
              <span key={k} className="chip">
                {k}
              </span>
            ))}
          </p>
        </div>

        {/* the letter bar stays in reach while the list scrolls; on a phone it slides sideways inside itself */}
        <nav aria-label="Jump to a letter" className="no-print sticky top-[var(--header-h)] z-10 mt-21 border-y border-line bg-paper">
          <div className="wrap">
            <ul className="-mx-5 flex overflow-x-auto">
              {LETTERS.map((k) => (
                <li key={k} className="shrink-0 grow basis-[2.75rem]">
                  {byLetter.has(k) ? (
                    <a href={`#${k.toLowerCase()}`} className="num flex h-[2.75rem] min-w-[2.75rem] items-center justify-center text-sm font-semibold text-ink transition-colors duration-fast hover:text-accent">
                      {k}
                    </a>
                  ) : (
                    <span aria-hidden className="num flex h-[2.75rem] min-w-[2.75rem] items-center justify-center text-sm text-ink-3 opacity-50">
                      {k}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div id="az-list" className="wrap">
          {groups.map((k) => {
            const id = k.toLowerCase();
            return (
              <section key={k} id={id} data-az-group aria-labelledby={`az-${id}`} className="scroll-mt-[calc(var(--header-h)+3.5rem)] pt-34">
                <h2 id={`az-${id}`} className="gx-numeral border-b border-line pb-8">
                  {k === OTHER ? "0–9" : k}
                </h2>
                <ul className="grid gap-x-34 sm:grid-cols-2 lg:grid-cols-3">
                  {(byLetter.get(k) ?? []).map((e) => (
                    <li key={e.href} data-az={`${e.label} ${e.kind}`.toLowerCase()}>
                      <Link href={e.href} className="group flex min-h-[2.75rem] items-baseline justify-between gap-13 border-b border-line py-8">
                        <span className="min-w-0 text-ink transition-colors duration-fast group-hover:text-accent">{e.label}</span>
                        <span className="label shrink-0">{e.kind}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="glossary" />
      <NextSteps
        items={[
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "The terms, with their definitions." },
          { kind: "Academy", label: "Academy", href: "/academy", note: "The lessons, in order." },
          { kind: "Tools", label: "Trader toolkit", href: "/tools", note: "Calculators that show their formula." },
          { kind: "Labs", label: "GIO4X Labs", href: "/labs", note: "Things to handle, on invented prices." },
        ]}
      />
    </>
  );
}
