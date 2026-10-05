import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnglishLink, InEnglish, RestrictedJurisdictions, TranslationNotice } from "@/components/i18n/Translated";
import { PageHero, SectionHead } from "@/components/ui/Page";
import { site } from "@/config/site";
import { accounts, type Account } from "@/data/accounts";
import { lessons } from "@/data/academy";
import { glossary } from "@/data/glossary";
import { assetClasses, instruments, instrumentsByClass } from "@/data/instruments";
import { platforms } from "@/data/platforms";
import { tools } from "@/data/tools";
import { getDictionary, localiseValue } from "@/i18n";
import { isLocale, languageAlternates, localeInfo, localePath } from "@/i18n/config";
import { pageMeta } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta({
    title: `${site.name} | ${d.home.metaTitle}`,
    absoluteTitle: true,
    description: d.home.metaDescription,
    path: localePath(lang),
    languages: languageAlternates(""),
    locale: localeInfo(lang).og,
  });
}

/** The rows of the accounts table shown here: the published figures, read from src/data/accounts.ts. */
const ACCOUNT_ROWS = ["minDeposit", "spreadFrom", "commission", "leverage", "minTrade", "stopOut"] as const satisfies readonly (keyof Account)[];

/**
 * The home page of one language: what GIO4X is, the markets, the two
 * platforms, the three accounts, tools, learning, the Trust Centre and how to
 * get in touch. It is a summary of the English site, not a copy of its home
 * page: every figure is read from the same data the English pages use, and
 * every link that leaves the translated pages says that it leads to English.
 */
export default async function LocaleHomePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const h = d.home;
  const en = d.common.inEnglish;

  const doors = [
    { key: "verify", href: "/trust/verify", english: true, ...h.trust.doors.verify },
    { key: "disclose", href: "/trust/transparency", english: true, ...h.trust.doors.disclose },
    { key: "source", href: "/trust/data-methodology", english: true, ...h.trust.doors.source },
    // the one door that stays in the language: the translated risk warning
    { key: "risk", href: localePath(lang, "risk-warning"), english: false, ...h.trust.doors.risk },
  ];
  const principles = [h.what.principles.show, h.what.principles.explain, h.what.principles.respect];

  return (
    <>
      <TranslationNotice dict={d} page="" />
      <PageHero eyebrow={site.tagline} title={h.title} lead={h.lead}>
        <Link href={localePath(lang, "guide")} className="btn btn-primary">
          {h.ctaGuide}
        </Link>
        <Link href={localePath(lang, "contact")} className="btn btn-ghost">
          {h.ctaContact}
        </Link>
      </PageHero>

      {/* what GIO4X is */}
      <section className="section" aria-labelledby="l10n-what">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">{h.what.eyebrow}</p>
            <h2 id="l10n-what" className="h2 mt-13">
              {h.what.title}
            </h2>
            <p className="mt-21 max-w-measure text-ink-2">{h.what.body}</p>
            <p className="mt-13 max-w-measure text-ink-2">{h.what.tagline}</p>
            <p className="mt-13 max-w-measure text-sm text-ink-3">{h.what.language}</p>
          </div>
          <ol className="grid gap-px border-t border-line">
            {principles.map((p, i) => (
              <li key={p.t} className="grid grid-cols-[3.4375rem_1fr] gap-x-13 border-b border-line py-21">
                <span className="num pt-3 text-xs font-semibold text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="h4">{p.t}</h3>
                  <p className="mt-8 max-w-measure text-ink-2">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* the markets: names and lines from the dictionary, counts and symbols from the data */}
      <section className="section hairline bg-paper" aria-labelledby="l10n-markets">
        <div className="wrap">
          <SectionHead
            eyebrow={h.markets.eyebrow}
            title={<span id="l10n-markets">{h.markets.title(assetClasses.length)}</span>}
            lead={h.markets.lead(instruments.length)}
            action={
              <EnglishLink href="/markets" mark={en} className="go">
                {h.markets.link}
              </EnglishLink>
            }
          />
          <ul className="mt-34 border-t border-line-strong">
            {assetClasses.map((a, i) => {
              const list = instrumentsByClass(a.key);
              const words = h.markets.classes[a.key];
              return (
                <li key={a.key} className="border-b border-line">
                  <Link href={`/markets/${a.key}`} hrefLang="en" className="group grid items-baseline gap-x-21 gap-y-5 py-21 transition-colors duration-fast hover:bg-surface md:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)_17rem] md:px-13">
                    <span className="flex items-baseline gap-13">
                      <span className="num w-21 text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                      <span className="h3 transition-colors duration-fast group-hover:text-accent">{words.name}</span>
                    </span>
                    <span className="ps-34 text-ink-2 md:ps-0">{words.line}</span>
                    <span className="flex flex-wrap items-baseline gap-x-13 gap-y-5 ps-34 md:justify-end md:ps-0">
                      <span className="text-xs text-ink-3">
                        {h.markets.count(list.length)}
                        <bdi dir="ltr" className="ms-8">
                          {list
                            .slice(0, 3)
                            .map((x) => x.symbol)
                            .join(" · ")}
                        </bdi>
                      </span>
                      <InEnglish label={en} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* the two platforms, on the night material like the English chapter */}
      <section className="on-night relative overflow-hidden" aria-labelledby="l10n-platforms">
        <div className="wrap section-quiet relative pb-55">
          <div className="phi items-end">
            <div>
              <p className="eyebrow">{h.platforms.eyebrow}</p>
              <h2 id="l10n-platforms" className="h2 mt-13">
                {h.platforms.title}
              </h2>
            </div>
            <p className="lead">{h.platforms.lead}</p>
          </div>
          <div className="mt-34 grid border-t border-night-line md:grid-cols-2">
            <article className="flex flex-col justify-between gap-21 py-34 md:pe-55">
              <div>
                <p className="label">{h.platforms.raptor.role}</p>
                <h3 className="h2 mt-13" lang="en">
                  {platforms.raptor.name}
                </h3>
                <p className="mt-13 max-w-measure text-on-night-2">{h.platforms.raptor.body}</p>
              </div>
              <EnglishLink href={platforms.raptor.href} mark={en} className="link text-on-night">
                {platforms.raptor.name}
              </EnglishLink>
            </article>
            <article className="flex flex-col justify-between gap-21 border-t border-night-line py-34 md:border-s md:border-t-0 md:ps-55">
              <div>
                <p className="label">{h.platforms.mt5.role}</p>
                <h3 className="h2 mt-13" lang="en">
                  {platforms.mt5.name}
                </h3>
                <p className="mt-13 max-w-measure text-on-night-2">{h.platforms.mt5.body}</p>
              </div>
              <EnglishLink href={platforms.mt5.href} mark={en} className="link text-on-night">
                {platforms.mt5.name}
              </EnglishLink>
            </article>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-34 gap-y-13 border-t border-night-line pt-21">
            <EnglishLink href="/platforms/compare" mark={en} className="link text-on-night">
              {h.platforms.compare}
            </EnglishLink>
            <p className="text-xs text-on-night-2">{h.platforms.trademark}</p>
          </div>
        </div>
      </section>

      {/* the accounts: one comparison table */}
      <section className="section" aria-labelledby="l10n-accounts">
        <div className="wrap">
          <SectionHead
            eyebrow={h.accounts.eyebrow}
            title={<span id="l10n-accounts">{h.accounts.title(accounts.length)}</span>}
            lead={h.accounts.lead}
            action={
              <EnglishLink href="/trading/accounts" mark={en} className="go">
                {h.accounts.link}
              </EnglishLink>
            }
          />
          <div className="panel scroll-x mt-34 px-21 pb-8 pt-13 lg:px-34">
            <table className="w-full min-w-[38rem] border-collapse text-start">
              <thead>
                <tr>
                  <td className="w-[30%] border-b border-line-strong" />
                  {accounts.map((a) => (
                    <th key={a.key} scope="col" className="border-b border-line-strong py-13 pe-13 text-start align-bottom font-normal">
                      <span className="block font-display text-xl text-ink" lang="en">
                        {a.name}
                      </span>
                      <span className="mt-2 block text-xs text-ink-3">{h.accounts.suits[a.key]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACCOUNT_ROWS.map((row) => (
                  <tr key={row}>
                    <th scope="row" className="border-b border-line py-13 pe-13 text-start text-[0.8125rem] font-normal text-ink-2">
                      {h.accounts.rows[row]}
                    </th>
                    {accounts.map((a) => (
                      <td key={a.key} className="num border-b border-line py-13 pe-13 text-[0.9375rem] font-medium">
                        <bdi>{localiseValue(a[row], h.accounts.words)}</bdi>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-13 max-w-measure text-xs text-ink-3">{h.accounts.note}</p>
        </div>
      </section>

      {/* tools and learning */}
      <section className="section hairline bg-paper" aria-labelledby="l10n-tools">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">{h.tools.eyebrow}</p>
            <h2 id="l10n-tools" className="h2 mt-13">
              {h.tools.title}
            </h2>
            <p className="lead mt-13 max-w-measure">{h.tools.lead(tools.length)}</p>
            <p className="mt-21">
              <EnglishLink href="/tools" mark={en} className="go">
                {h.tools.link}
              </EnglishLink>
            </p>
          </div>
          <div>
            <p className="eyebrow">{h.learning.eyebrow}</p>
            <h2 className="h3 mt-13">{h.learning.title}</h2>
            <p className="mt-13 max-w-measure text-ink-2">{h.learning.lead}</p>
            <ul className="mt-21 border-t border-line-strong">
              <li className="border-b border-line py-13">
                <EnglishLink href="/academy" mark={en} className="h4 link-quiet">
                  {h.learning.academy.name}
                </EnglishLink>
                <p className="mt-5 text-sm text-ink-3">{h.learning.academy.body(lessons.length)}</p>
              </li>
              <li className="border-b border-line py-13">
                <EnglishLink href="/glossary" mark={en} className="h4 link-quiet">
                  {h.learning.glossary.name}
                </EnglishLink>
                <p className="mt-5 text-sm text-ink-3">{h.learning.glossary.body(glossary.length)}</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* the Trust Centre: four doors, each to something that can be checked */}
      <section className="section" aria-labelledby="l10n-trust">
        <div className="wrap">
          <div className="phi phi-r items-end">
            <div>
              <p className="eyebrow">{h.trust.eyebrow}</p>
              <h2 id="l10n-trust" className="h2 mt-13">
                {h.trust.title}
              </h2>
            </div>
            <p className="lead">{h.trust.lead}</p>
          </div>
          <ul className="mt-34 grid gap-px overflow-hidden rounded border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
            {doors.map((door) => (
              <li key={door.key} className="bg-bg">
                <Link href={door.href} hrefLang={door.english ? "en" : undefined} className="group flex h-full flex-col justify-between gap-34 p-21 transition-colors duration-fast hover:bg-paper lg:p-34">
                  <span>
                    <span className="h4 block">{door.t}</span>
                    <span className="mt-8 block text-sm text-ink-3">{door.d}</span>
                  </span>
                  <span className="flex items-center">
                    <span className="go" aria-hidden />
                    {door.english && <InEnglish label={en} />}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* contact, and where the services are not offered */}
      <section className="section hairline bg-paper" aria-labelledby="l10n-contact">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">{h.contact.eyebrow}</p>
            <h2 id="l10n-contact" className="h2 mt-13">
              {h.contact.title}
            </h2>
            <p className="lead mt-13 max-w-measure">{h.contact.lead}</p>
            <div className="mt-21 flex flex-wrap items-center gap-13">
              <Link href={localePath(lang, "contact")} className="btn btn-primary">
                {h.contact.link}
              </Link>
              <a href={`mailto:${site.email}`} className="link" dir="ltr">
                {site.email}
              </a>
            </div>
          </div>
          <RestrictedJurisdictions dict={d} className="border-s border-line-strong ps-21" />
        </div>
      </section>
    </>
  );
}
