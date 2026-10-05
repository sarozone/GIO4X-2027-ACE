import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnglishLink, InEnglish, TranslationNotice } from "@/components/i18n/Translated";
import { PageHero } from "@/components/ui/Page";
import { nav } from "@/config/nav";
import { getDictionary } from "@/i18n";
import { isLocale, languageAlternates, localeInfo, localePath } from "@/i18n/config";
import { glossaryPage } from "@/i18n/glossary-page";
import { pageMeta } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta({
    title: d.guide.metaTitle,
    description: d.guide.metaDescription,
    path: localePath(lang, "guide"),
    languages: languageAlternates("guide"),
    locale: localeInfo(lang).og,
  });
}

/**
 * The site guide: every main section of the website, described in the page's
 * language. The sections and the pages listed under them are read from
 * config/nav.ts, so the guide cannot fall behind the menus; only the
 * descriptions are in the dictionary. Every link here opens an English page
 * and says so.
 */
export default async function LocaleGuidePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const g = d.guide;
  const en = d.common.inEnglish;
  // a section added to the navigation before its description is translated is shown with its English line
  const described: Record<string, { name: string; body: string } | undefined> = g.sections;
  const also = [
    { href: "/faq", ...g.also.help },
    { href: "/legal", ...g.also.legal },
    { href: "/explore", ...g.also.directory },
  ];

  return (
    <>
      <TranslationNotice dict={d} page="guide" />
      <PageHero
        crumbs={[
          { name: d.common.home, href: localePath(lang) },
          { name: g.eyebrow, href: localePath(lang, "guide") },
        ]}
        eyebrow={g.eyebrow}
        title={g.title}
        lead={g.lead}
        quiet
      />

      <section className="section-quiet" aria-label={g.eyebrow}>
        <div className="wrap">
          <ol className="border-t border-line-strong">
            {nav.map((s, i) => {
              const words = described[s.key];
              return (
                <li key={s.key} className="phi phi-r items-start border-b border-line py-34">
                  <div>
                    <p className="num text-xs font-semibold text-prestige-ink">{String(i + 1).padStart(2, "0")}</p>
                    <h2 className="h3 mt-8">{words?.name ?? <span lang="en">{s.label}</span>}</h2>
                    <p className="mt-13 max-w-measure text-ink-2">{words?.body ?? <span lang="en">{s.blurb}</span>}</p>
                    <p className="mt-21">
                      <EnglishLink href={s.href} mark={en} className="go">
                        {g.open}
                      </EnglishLink>
                    </p>
                    {/* the one page of the Academy that exists in the language: its glossary */}
                    {s.key === "academy" && (
                      <p className="mt-13">
                        <Link href={localePath(lang, "glossary")} className="go">
                          {glossaryPage[lang].title}
                        </Link>
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="label">
                      {g.pages} <InEnglish label={en} />
                    </p>
                    {/* the names of English pages, as the English menus give them */}
                    <ul lang="en" dir="ltr" className="mt-13 grid gap-x-21 gap-y-5 sm:grid-cols-2">
                      {s.groups.flatMap((group) =>
                        group.items.map((item) => (
                          <li key={`${group.title}-${item.href}`}>
                            <Link href={item.href} hrefLang="en" className="link-quiet text-sm">
                              {item.label}
                            </Link>
                          </li>
                        )),
                      )}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper" aria-labelledby="l10n-also">
        <div className="wrap">
          <h2 id="l10n-also" className="eyebrow">
            {g.alsoTitle}
          </h2>
          <ul className="mt-21 grid gap-px overflow-hidden rounded border border-line bg-line md:grid-cols-3">
            {also.map((item) => (
              <li key={item.href} className="bg-paper">
                <Link href={item.href} hrefLang="en" className="group flex h-full flex-col items-start justify-between gap-21 p-21 transition-colors duration-fast hover:bg-surface">
                  <span>
                    <span className="h4 block">{item.name}</span>
                    <span className="mt-5 block text-sm text-ink-3">{item.body}</span>
                  </span>
                  <InEnglish label={en} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
