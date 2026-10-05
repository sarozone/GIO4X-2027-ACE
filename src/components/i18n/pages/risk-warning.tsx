import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnglishLink, RestrictedJurisdictions, TranslationNotice } from "@/components/i18n/Translated";
import { PageHero } from "@/components/ui/Page";
import { companyLine, riskWarning } from "@/config/legal";
import { getDictionary } from "@/i18n";
import { isLocale, languageAlternates, localeInfo, localePath } from "@/i18n/config";
import { pageMeta } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta({
    title: d.risk.metaTitle,
    description: d.risk.metaDescription,
    path: localePath(lang, "risk-warning"),
    languages: languageAlternates("risk-warning"),
    locale: localeInfo(lang).og,
  });
}

/**
 * The risk warning and the company line of config/legal.ts, translated, with
 * the English original set beneath them. The English text is read from the
 * configuration when the page is rendered, so it is always the wording the
 * English site carries; the translation is in the dictionary and must be
 * revised whenever that wording changes. The page says which one prevails.
 * The Risk Disclosure itself (/legal/risk) stays in English and is linked so.
 */
export default async function LocaleRiskPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const r = d.risk;
  const en = d.common.inEnglish;

  return (
    <>
      <TranslationNotice dict={d} page="risk-warning" />
      <PageHero
        crumbs={[
          { name: d.common.home, href: localePath(lang) },
          { name: r.eyebrow, href: localePath(lang, "risk-warning") },
        ]}
        eyebrow={r.eyebrow}
        title={r.title}
        lead={r.lead}
        quiet
      />

      {/* readable by design, never fine print: the same rule as the English footer */}
      <section className="section-quiet" aria-labelledby="l10n-risk">
        <div className="wrap phi items-start">
          <div>
            <h2 id="l10n-risk" className="label">
              {r.warningTitle}
            </h2>
            <p className="mt-13 max-w-measure text-md leading-relaxed text-ink">{r.warning}</p>
            <p className="mt-21 max-w-measure text-ink-2">{r.company}</p>
            <p className="mt-13 max-w-measure text-ink-2">{r.notAdvice}</p>
          </div>
          <div className="border-s border-accent ps-21">
            <p className="font-medium text-ink">{r.prevails}</p>
            <p className="mt-13 text-sm text-ink-2">{r.fullBody}</p>
            <p className="mt-13">
              <EnglishLink href="/legal/risk" mark={en}>
                {r.fullLink}
              </EnglishLink>
            </p>
            <p className="mt-8">
              <EnglishLink href="/legal" mark={en}>
                {r.legalLink}
              </EnglishLink>
            </p>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper" aria-labelledby="l10n-original">
        <div className="wrap">
          <h2 id="l10n-original" className="label">
            {r.originalTitle}
          </h2>
          <div lang="en" dir="ltr" className="panel mt-13 p-21 lg:p-34">
            <p className="max-w-measure leading-relaxed text-ink">{riskWarning}</p>
            <p className="mt-13 max-w-measure text-ink-2">{companyLine}</p>
          </div>
          <p className="mt-13 max-w-measure text-sm text-ink-2">{r.prevails}</p>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label={d.common.restrictedTitle}>
        <div className="wrap">
          <RestrictedJurisdictions dict={d} />
        </div>
      </section>
    </>
  );
}
