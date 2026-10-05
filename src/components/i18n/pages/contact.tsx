import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnglishLink, TranslationNotice } from "@/components/i18n/Translated";
import { PageHero } from "@/components/ui/Page";
import { site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { isLocale, languageAlternates, localeInfo, localePath } from "@/i18n/config";
import { pageMeta } from "@/lib/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta({
    title: d.contact.metaTitle,
    description: d.contact.metaDescription,
    path: localePath(lang, "contact"),
    languages: languageAlternates("contact"),
    locale: localeInfo(lang).og,
  });
}

/**
 * How to reach GIO4X, in the page's language.
 *
 * The contact form itself is not rendered here. It is one client component
 * with its topics, hints, validation messages and confirmation written in
 * English throughout, and the topic's English label travels to the API with
 * the message; translating it means changing a form that works. So this page
 * gives the public address (site.email), says what the form does and links to
 * it as an English page, and says plainly that a reply may be in English:
 * whether enquiries can be answered in each language is the owner's to decide
 * (docs/I18N.md).
 */
export default async function LocaleContactPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const c = d.contact;
  const en = d.common.inEnglish;
  const offices: { label: string; lines: readonly string[]; country: string; entity: string | null }[] = [
    { label: c.headOffice, ...site.headOffice, entity: site.legalName },
    { label: c.supportOffice, ...site.supportOffice, entity: null },
  ];

  return (
    <>
      <TranslationNotice dict={d} page="contact" />
      <PageHero
        crumbs={[
          { name: d.common.home, href: localePath(lang) },
          { name: c.eyebrow, href: localePath(lang, "contact") },
        ]}
        eyebrow={c.eyebrow}
        title={c.title}
        lead={c.lead}
        quiet
      />

      <section className="section-quiet" aria-labelledby="l10n-email">
        <div className="wrap phi items-start">
          <div>
            <h2 id="l10n-email" className="eyebrow">
              {c.emailTitle}
            </h2>
            <p className="mt-13 text-ink-2">{c.emailBody}:</p>
            <p className="mt-8">
              <a href={`mailto:${site.email}`} dir="ltr" className="link inline-block font-display text-xl">
                {site.email}
              </a>
            </p>
            <p className="mt-21 max-w-measure text-sm font-medium text-ink">{c.safety.password}</p>
          </div>
          <div className="grid gap-21">
            <div className="border-s border-line-strong ps-21">
              <h2 className="h4">{c.formTitle}</h2>
              <p className="mt-8 max-w-measure text-sm text-ink-2">{c.formBody}</p>
              <p className="mt-13">
                <EnglishLink href="/contact" mark={en}>
                  {c.formLink}
                </EnglishLink>
              </p>
            </div>
            <div className="border-s border-line-strong ps-21">
              <h2 className="h4">{c.supportTitle}</h2>
              <p className="mt-8 max-w-measure text-sm text-ink-2">{c.supportBody}</p>
              <p className="mt-13">
                <EnglishLink href="/support" mark={en}>
                  {c.supportLink}
                </EnglishLink>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper" aria-labelledby="l10n-post">
        <div className="wrap phi phi-r items-start">
          <div>
            <h2 id="l10n-post" className="h3">
              {c.postTitle}
            </h2>
            <p className="mt-13 max-w-narrow text-ink-2">{c.postBody}</p>
          </div>
          <div>
            <dl className="grid gap-21 sm:grid-cols-2">
              {offices.map((o) => (
                <div key={o.label} className="border-t border-line-strong pt-13">
                  <dt className="label">{o.label}</dt>
                  <dd className="mt-8">
                    {/* postal addresses are written as they are posted: in English, left to right */}
                    <address lang="en" dir="ltr" className="text-[0.9375rem] not-italic leading-[1.618] text-ink-2">
                      {o.entity && <span className="block font-medium text-ink">{o.entity}</span>}
                      {o.lines.map((l) => (
                        <span key={l} className="block">
                          {l}
                        </span>
                      ))}
                      <span className="block">{o.country}</span>
                    </address>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-21 max-w-measure text-sm text-ink-3">{c.noPhone}</p>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline" aria-labelledby="l10n-safe">
        <div className="wrap phi items-start">
          <h2 id="l10n-safe" className="h3">
            {c.safetyTitle}
          </h2>
          <ul className="border-t border-line-strong text-ink-2">
            <li className="border-b border-line py-13">{c.safety.password}</li>
            <li className="border-b border-line py-13">{c.safety.documents}</li>
            <li className="border-b border-line py-13">
              {c.safety.verify}{" "}
              <EnglishLink href="/trust/verify" mark={en}>
                {c.verifyLink}
              </EnglishLink>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
