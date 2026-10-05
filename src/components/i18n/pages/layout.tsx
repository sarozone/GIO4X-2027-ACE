import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LocaleDocument } from "@/components/i18n/LocaleDocument";
import { isLocale, localeInfo } from "@/i18n/config";
import "@/styles/i18n.css";

/**
 * The frame of every translated page (docs/I18N.md): `/hi`, `/ta`, `/ar`,
 * `/es`, `/pt`, `/fr`, `/de`. English is not here: it stays at the addresses
 * it has always had.
 *
 * Each language is a fixed folder under `src/app/(site)` holding four small
 * files that hand their language to the pages in this folder. A dynamic
 * `[lang]` segment at the root was tried and withdrawn on the same day: it
 * caught every unknown first segment, and because the site streams a loading
 * state, `/zzz` then answered 200 with the not-found page where it used to
 * answer 404. Fixed folders leave unknown addresses exactly as they were.
 */
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { tag, dir } = localeInfo(lang);
  return (
    // the element that says which language and direction the page is in; styles/i18n.css hangs on it
    <div lang={tag} dir={dir} className="gx-l10n">
      <LocaleDocument lang={tag} dir={dir} />
      {children}
    </div>
  );
}
