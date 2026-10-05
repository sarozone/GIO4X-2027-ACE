// Unit tests for src/lib/blog-feed.ts (the daily blog as an RSS 2.0 document, for the whole blog and for one category).
// Run: node --test scripts/test-blog-feed.mjs      (Node 22.18 or later: it reads the TypeScript file directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildBlogFeed } from "../src/lib/blog-feed.ts";

const SITE = "https://www.example.test";
const LEGAL = "GIO4X & Co. Ltd";
const LABEL = { "market-notes": "Market notes", education: "Education", platform: "Platforms", company: "GIO4X" };

/**
 * The feed exactly as src/app/(site)/intelligence/blog/feed.xml/route.ts built it before the builder was
 * taken out of it (commit a2a08c9), with the site's address, the firm's name and the category labels given
 * instead of imported. It is here to be compared with, and must not be "tidied": what it writes is the
 * document readers of the feed have always been sent.
 */
function feedAsItWas(posts) {
  const esc = (s) =>
    s
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  const rfc822 = (timestamp) => new Date(timestamp).toUTCString();
  const absoluteUrl = (path) => `${SITE}${path}`;
  const BLOG_PATH = "/intelligence/blog";
  const self = absoluteUrl(`${BLOG_PATH}/feed.xml`);
  const items = posts.map((p) => {
    const url = absoluteUrl(`${BLOG_PATH}/${p.slug}`);
    return [
      "    <item>",
      `      <title>${esc(p.title)}</title>`,
      `      <link>${esc(url)}</link>`,
      `      <guid isPermaLink="true">${esc(url)}</guid>`,
      `      <pubDate>${esc(rfc822(p.published_at))}</pubDate>`,
      `      <dc:creator>${esc(p.byline)}</dc:creator>`,
      `      <category>${esc(LABEL[p.category] ?? p.category)}</category>`,
      ...(p.excerpt.trim() ? [`      <description>${esc(p.excerpt)}</description>`] : []),
      "    </item>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    "    <title>GIO4X daily blog</title>",
    `    <link>${esc(absoluteUrl(BLOG_PATH))}</link>`,
    `    <atom:link href="${esc(self)}" rel="self" type="application/rss+xml" />`,
    "    <description>Short notes from GIO4X’s desks. Educational, not advice or a recommendation to trade.</description>",
    "    <language>en-GB</language>",
    `    <copyright>${esc(LEGAL)}</copyright>`,
    ...(posts.length ? [`    <lastBuildDate>${esc(rfc822(posts[0].published_at))}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

/** The main feed as src/lib/server/blog-feed.ts asks for it: the same channel, the same items. */
const MAIN = {
  title: "GIO4X daily blog",
  link: `${SITE}/intelligence/blog`,
  self: `${SITE}/intelligence/blog/feed.xml`,
  description: "Short notes from GIO4X’s desks. Educational, not advice or a recommendation to trade.",
  copyright: LEGAL,
};
const entries = (posts) => posts.map((p) => ({ title: p.title, url: `${SITE}/intelligence/blog/${p.slug}`, published_at: p.published_at, byline: p.byline, category: LABEL[p.category] ?? p.category, excerpt: p.excerpt }));

const POSTS = [
  { slug: "birth-of-banking", title: "The Birth of Banking", excerpt: "From the temple to the counting house.", category: "education", byline: "@Abe", published_at: "2026-10-04T09:00:00+00:00" },
  { slug: "gold-and-the-dollar", title: 'Gold & the "dollar": <what> moved, and why it\'s odd', excerpt: "  ", category: "market-notes", byline: "Markets desk", published_at: "2026-09-30T16:45:10.123Z" },
  { slug: "odd-characters", title: "A form\u000Bfeed and a bell\u0007 are dropped￾", excerpt: "Tabs\tand\nnew lines are kept; ’curly’ quotes are left alone.", category: "unknown-category", byline: "O'Brien & Sons", published_at: "2026-01-01T00:00:00Z" },
];

test("the main feed is, byte for byte, the document the route wrote before the builder was shared", () => {
  assert.equal(buildBlogFeed(MAIN, entries(POSTS)), feedAsItWas(POSTS));
  assert.equal(buildBlogFeed(MAIN, entries(POSTS.slice(1))), feedAsItWas(POSTS.slice(1)));
});

test("a feed with no post is still the same valid channel, with no build date", () => {
  const xml = buildBlogFeed(MAIN, []);
  assert.equal(xml, feedAsItWas([]));
  assert.ok(!xml.includes("<lastBuildDate>"));
  assert.ok(!xml.includes("<item>"));
});

test("the document for one fixed post, written out", () => {
  assert.equal(
    buildBlogFeed(MAIN, entries(POSTS.slice(0, 1))),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
      "  <channel>",
      "    <title>GIO4X daily blog</title>",
      "    <link>https://www.example.test/intelligence/blog</link>",
      '    <atom:link href="https://www.example.test/intelligence/blog/feed.xml" rel="self" type="application/rss+xml" />',
      "    <description>Short notes from GIO4X’s desks. Educational, not advice or a recommendation to trade.</description>",
      "    <language>en-GB</language>",
      "    <copyright>GIO4X &amp; Co. Ltd</copyright>",
      "    <lastBuildDate>Sun, 04 Oct 2026 09:00:00 GMT</lastBuildDate>",
      "    <item>",
      "      <title>The Birth of Banking</title>",
      "      <link>https://www.example.test/intelligence/blog/birth-of-banking</link>",
      '      <guid isPermaLink="true">https://www.example.test/intelligence/blog/birth-of-banking</guid>',
      "      <pubDate>Sun, 04 Oct 2026 09:00:00 GMT</pubDate>",
      "      <dc:creator>@Abe</dc:creator>",
      "      <category>Education</category>",
      "      <description>From the temple to the counting house.</description>",
      "    </item>",
      "  </channel>",
      "</rss>",
      "",
    ].join("\n"),
  );
});

test("a category's feed is the same document with its own channel, and what is given is escaped", () => {
  const xml = buildBlogFeed({ ...MAIN, title: "GIO4X daily blog: Education", link: `${SITE}/intelligence/blog/category/education`, self: `${SITE}/intelligence/blog/category/education/feed.xml?a=1&b=2`, description: 'How trading works, <one> idea at a "time".' }, entries(POSTS.slice(0, 1)));
  assert.ok(xml.includes("    <title>GIO4X daily blog: Education</title>"));
  assert.ok(xml.includes("    <link>https://www.example.test/intelligence/blog/category/education</link>"));
  assert.ok(xml.includes('href="https://www.example.test/intelligence/blog/category/education/feed.xml?a=1&amp;b=2"'));
  assert.ok(xml.includes("    <description>How trading works, &lt;one&gt; idea at a &quot;time&quot;.</description>"));
  // everything below the channel's own lines is what the main feed writes for the same post
  const items = (doc) => doc.slice(doc.indexOf("    <lastBuildDate>"));
  assert.equal(items(xml), items(buildBlogFeed(MAIN, entries(POSTS.slice(0, 1)))));
});
