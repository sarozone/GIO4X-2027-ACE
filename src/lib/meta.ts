import type { Metadata } from "next";
import { site } from "@/config/site";

type PageMeta = {
  /** page title without the brand suffix */
  title: string;
  description: string;
  /** canonical path, e.g. "/markets/forex" */
  path: string;
  /** set false for utility pages (search results, preferences, gateways) */
  index?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** the route has its own opengraph-image file: do not attach the default card */
  ownCard?: boolean;
  /** use the title as-is, without the "| GIO4X" template */
  absoluteTitle?: boolean;
  /**
   * `hreflang`: the addresses of this page in other languages, keyed by language tag (with "x-default").
   * Only pages that exist in another language pass it (src/i18n/config.ts); left out, nothing is emitted.
   */
  languages?: Record<string, string>;
  /** Open Graph locale of the page; English (en_GB) unless a translated page says otherwise */
  locale?: string;
};

/**
 * One metadata builder for every route: canonical, Open Graph and X card are
 * always consistent, and tracking or filter parameters can never leak into a
 * canonical URL because the path is supplied explicitly.
 */
const DEFAULT_CARD = { url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name}: ${site.tagline}` };

/** Search and share snippets are cut at ~160 characters; trim on a word so they never end mid-word. */
function snippet(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(": "));
  if (stop > max * 0.55) return cut.slice(0, stop + 1).replace(/[;:]$/, ".");
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–-]$/, "")}…`;
}

export function pageMeta(input: PageMeta): Metadata {
  const m = { ...input, description: snippet(input.description) };
  // a title that would run past 70 characters with the brand suffix goes out without it
  const alone = m.absoluteTitle || `${m.title} | ${site.name}`.length > 70;
  const fullTitle = alone ? m.title : `${m.title} | ${site.name}`;
  return {
    title: alone ? { absolute: m.title } : m.title,
    description: m.description,
    alternates: { canonical: m.path, ...(m.languages ? { languages: m.languages } : {}) },
    ...(m.index === false ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: m.type ?? "website",
      siteName: site.name,
      locale: m.locale ?? "en_GB",
      url: m.path,
      title: fullTitle,
      description: m.description,
      // the default card; a route with its own opengraph-image file overrides it
      ...(m.ownCard ? {} : { images: [DEFAULT_CARD] }),
      ...(m.type === "article" ? { publishedTime: m.publishedTime, modifiedTime: m.modifiedTime ?? m.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: m.description, ...(m.ownCard ? {} : { images: [DEFAULT_CARD.url] }) },
  };
}
