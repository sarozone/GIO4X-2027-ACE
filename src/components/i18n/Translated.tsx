import Link from "next/link";
import type { ReactNode } from "react";
import { restrictedJurisdictions } from "@/data/accounts";
import { ENGLISH_EQUIVALENT, type LocalePage } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

/**
 * Small pieces shared by the translated pages (src/components/i18n/pages).
 * Server components: they receive finished strings from the dictionary.
 */

/** Marks a link whose destination is an English page. Never omitted: a translated page does not pretend the rest is translated. */
export function InEnglish({ label }: { label: string }) {
  return <span className="chip ms-8 align-middle !h-[1.375rem] !normal-case !tracking-normal">{label}</span>;
}

/** A link to an English page: the words in the page's language, the mark saying where it leads. */
export function EnglishLink({ href, children, mark, className = "link" }: { href: string; children: ReactNode; mark: string; className?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-y-3">
      <Link href={href} hrefLang="en" className={className}>
        {children}
      </Link>
      <InEnglish label={mark} />
    </span>
  );
}

/**
 * The notice every translated page opens with, in its own language: the
 * translation is a convenience, it has not yet been reviewed, English prevails.
 */
export function TranslationNotice({ dict, page }: { dict: Dictionary; page: LocalePage }) {
  return (
    <section className="border-b border-line bg-paper" aria-label={dict.notice.label}>
      <div className="wrap flex flex-wrap items-baseline gap-x-13 gap-y-5 py-13 text-sm text-ink-2">
        <span className="chip shrink-0">{dict.notice.label}</span>
        <p className="min-w-0 flex-1 basis-[18rem]">{dict.notice.body}</p>
        <Link href={ENGLISH_EQUIVALENT[page]} hrefLang="en" className="link shrink-0">
          {dict.notice.english}
        </Link>
      </div>
    </section>
  );
}

/**
 * Where the services are not offered. The list is read from the data module
 * when the page is rendered, never copied into a dictionary, so it is always
 * the list the English site shows. The names are English and are marked so.
 */
export function RestrictedJurisdictions({ dict, className = "" }: { dict: Dictionary; className?: string }) {
  return (
    <div className={className}>
      <p className="label">{dict.common.restrictedTitle}</p>
      <p className="mt-8 max-w-measure text-sm leading-relaxed text-ink-2">
        {dict.common.restrictedBody} ({dict.common.namesInEnglish}):
      </p>
      <p lang="en" dir="ltr" className="mt-8 max-w-measure text-sm leading-relaxed text-ink-2">
        {restrictedJurisdictions.join(", ")}.
      </p>
    </div>
  );
}
