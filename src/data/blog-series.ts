/**
 * The series of the daily blog: posts written to be read in order.
 *
 * A series is a typed list of the addresses of its parts, in order. The posts
 * themselves are rows in the database like every other post; nothing about a
 * series is stored there, so a new series is one more entry here and no
 * migration. The page of a series (/intelligence/blog/series/<slug>) and the
 * line at the head of each of its parts are made from this list and from the
 * posts that are public at that moment: a part that is not written yet, not
 * published, or withdrawn is simply left out, and the others keep their
 * numbers.
 *
 * It imports nothing, so that the arithmetic can be tested without a database
 * (scripts/test-blog-series.mjs).
 */

export type BlogSeries = {
  /** the address of the series' own page, under /intelligence/blog/series/ */
  slug: string;
  title: string;
  /** one line under the title */
  subtitle: string;
  /** what the series is about, in a sentence or two */
  about: string;
  /** the slugs of the parts, in the order they are read: part 1 first */
  parts: readonly string[];
};

export const BLOG_SERIES: readonly BlogSeries[] = [
  {
    slug: "history-of-trading",
    title: "The History of Trading",
    subtitle: "From the first exchanges to the age of algorithms",
    about: "How people learned to exchange value, record obligations, finance enterprise and trade risk.",
    parts: [
      "first-trade-human-history",
      "before-money-how-humans-traded",
      "how-coins-changed-civilization",
      "birth-of-banking",
      "medici-banking-empire",
      "voc-birth-of-stock-market",
      "worlds-first-stock-exchange-amsterdam",
      "tulip-mania-bubble-or-myth",
      "south-sea-bubble-1720",
      "how-wall-street-got-its-name",
      "birth-of-the-dollar",
      "bretton-woods-dollar-gold-system",
      "day-america-abandoned-gold-1971",
      "how-forex-became-global-market",
      "trading-floors-to-algorithms",
    ],
  },
  {
    slug: "future-of-trading",
    title: "The Future of Trading",
    subtitle: "Machines, markets that do not close, and money on new rails",
    about: "Twenty pieces on what artificial intelligence, tokenization, new forms of money and new interfaces may change about trading, and what they probably will not.",
    parts: [
      "will-ai-replace-traders",
      "human-trader-vs-ai-trader",
      "can-llms-understand-financial-markets",
      "autonomous-trading-agents",
      "when-ais-trade-against-other-ais",
      "quantum-computing-and-financial-markets",
      "future-of-trading-terminals",
      "trading-in-2035",
      "will-stock-exchanges-ever-close",
      "could-markets-trade-around-the-clock",
      "tokenized-stocks",
      "tokenized-real-estate",
      "future-of-money",
      "cbdcs-versus-crypto",
      "could-cash-disappear",
      "what-comes-after-smartphones-for-trading",
      "voice-controlled-trading",
      "ar-trading-desks",
      "future-of-the-100-dollar-trading-terminal",
      "will-everyone-have-an-ai-portfolio-manager",
    ],
  },
];

/** Must equal BLOG_PATH in src/lib/blog.ts (not imported, so that this file stands alone). */
const BLOG_PATH = "/intelligence/blog";

/**
 * The page of a series. It sits in a folder of its own beside the posts
 * (`series/[series]`), so it takes no post's address: a post whose slug is
 * "series" is still at /intelligence/blog/series, where this folder has no page.
 */
export const blogSeriesPath = (slug: string) => `${BLOG_PATH}/series/${slug}`;

export function getBlogSeries(slug: string): BlogSeries | null {
  return BLOG_SERIES.find((s) => s.slug === slug) ?? null;
}

/** Where a post stands in a series: its number (from 1) and how many parts the series has. */
export type BlogSeriesPlace = { series: BlogSeries; part: number; of: number };

/** The series a post belongs to and its place there, or null. A post listed in two series belongs to the first. */
export function seriesOfPost(slug: string, all: readonly BlogSeries[] = BLOG_SERIES): BlogSeriesPlace | null {
  for (const series of all) {
    const i = series.parts.indexOf(slug);
    if (i >= 0) return { series, part: i + 1, of: series.parts.length };
  }
  return null;
}

/**
 * The parts that are public, each with the number it has in the series. `live`
 * is what the database answered, in any order; a part that is not in it is
 * left out, and the numbers of the others do not move.
 */
export function numberedParts<T extends { slug: string }>(series: BlogSeries, live: readonly T[]): { part: number; post: T }[] {
  const bySlug = new Map(live.map((p) => [p.slug, p]));
  return series.parts.flatMap((slug, i) => {
    const post = bySlug.get(slug);
    return post ? [{ part: i + 1, post }] : [];
  });
}

/**
 * The public part before a post and the one after it, in the series' order.
 * A part that is not public is stepped over, so "next" is the next part that
 * can be read. The post itself need not be among `live`.
 */
export function seriesNeighbours<T extends { slug: string }>(series: BlogSeries, slug: string, live: readonly T[]): { previous: { part: number; post: T } | null; next: { part: number; post: T } | null } {
  const at = series.parts.indexOf(slug) + 1;
  if (at < 1) return { previous: null, next: null };
  const parts = numberedParts(series, live);
  return {
    previous: parts.filter((p) => p.part < at).pop() ?? null,
    next: parts.find((p) => p.part > at) ?? null,
  };
}
