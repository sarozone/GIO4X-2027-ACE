/**
 * The daily blog as an RSS 2.0 document.
 *
 * Text only: the channel and its items arrive already read, with their
 * addresses already absolute, and nothing here asks anything of anyone. Kept
 * apart so that the feed of the whole blog and the feed of one category are
 * the same document with a different channel, and so that it can be tested
 * without a database (scripts/test-blog-feed.mjs). It imports nothing.
 *
 * Summaries only: the full text lives on the site. A channel with no items is
 * still a valid feed.
 */

export type FeedChannel = {
  title: string;
  /** the page the feed is of, absolute */
  link: string;
  /** the feed's own address, absolute */
  self: string;
  description: string;
  copyright: string;
};

export type FeedEntry = {
  title: string;
  /** the post's address, absolute */
  url: string;
  published_at: string;
  byline: string;
  /** the category as a reader is shown it */
  category: string;
  excerpt: string;
};

/** Everything that goes into the document is escaped, and characters XML 1.0 does not allow are dropped. */
const esc = (s: string) =>
  s
    // eslint-disable-next-line no-control-regex -- these are exactly the characters XML 1.0 forbids
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** RFC 822 date, as RSS 2.0 requires. */
const rfc822 = (timestamp: string) => new Date(timestamp).toUTCString();

/** The document, newest item first as given. The channel's title and description are escaped like everything else. */
export function buildBlogFeed(channel: FeedChannel, entries: readonly FeedEntry[]): string {
  const items = entries.map((p) =>
    [
      "    <item>",
      `      <title>${esc(p.title)}</title>`,
      `      <link>${esc(p.url)}</link>`,
      `      <guid isPermaLink="true">${esc(p.url)}</guid>`,
      `      <pubDate>${esc(rfc822(p.published_at))}</pubDate>`,
      `      <dc:creator>${esc(p.byline)}</dc:creator>`,
      `      <category>${esc(p.category)}</category>`,
      ...(p.excerpt.trim() ? [`      <description>${esc(p.excerpt)}</description>`] : []),
      "    </item>",
    ].join("\n"),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${esc(channel.title)}</title>`,
    `    <link>${esc(channel.link)}</link>`,
    `    <atom:link href="${esc(channel.self)}" rel="self" type="application/rss+xml" />`,
    `    <description>${esc(channel.description)}</description>`,
    "    <language>en-GB</language>",
    `    <copyright>${esc(channel.copyright)}</copyright>`,
    // the newest post dates the feed; a feed with no post carries no build date, never "now"
    ...(entries.length ? [`    <lastBuildDate>${esc(rfc822(entries[0].published_at))}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
