// Unit tests for src/lib/blog-browse.ts (the daily blog by tag, by author and by search: the addresses, the counts and which posts answer).
// Run: node --test scripts/test-blog-browse.mjs      (Node 22.18 or later: it reads the TypeScript file directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  authorIndex,
  blogAuthorPath,
  blogSearchHref,
  blogTagPath,
  browseSlug,
  bylineHref,
  isBrowseSlug,
  matchesSearch,
  pageOf,
  postsByAuthor,
  postsWithTag,
  SEARCH_MAX_WORDS,
  searchWords,
  tagHref,
  tagIndex,
} from "../src/lib/blog-browse.ts";

// as cleanSearch in src/lib/server/validate.ts
const clean = (value) => (typeof value !== "string" ? "" : value.normalize("NFC").replace(/[^A-Za-z0-9@._+-]/g, "").slice(0, 100));

const day = (n) => new Date(Date.UTC(2026, 8, n, 9)).toISOString(); // n September 2026, 09:00 UTC
const post = (slug, over = {}) => ({ slug, title: slug, excerpt: "", tags: [], byline: "@Abe", published_at: day(1), ...over });
const slugs = (list) => list.map((p) => p.slug);

test("a tag or a byline as an address: lower case, spaces to hyphens, nothing else kept", () => {
  assert.equal(browseSlug("US dollar"), "us-dollar");
  assert.equal(browseSlug("  Gold  "), "gold");
  assert.equal(browseSlug("@Abe"), "abe");
  assert.equal(browseSlug("GIO4X Research Desk"), "gio4x-research-desk");
  assert.equal(browseSlug("S&P 500"), "s-p-500");
  assert.equal(browseSlug("Crédit"), "credit");
  assert.equal(browseSlug("../../etc"), "etc");
  assert.equal(browseSlug("?page=2&x"), "page-2-x");
  assert.equal(browseSlug("—"), "");
  assert.ok(browseSlug("x".repeat(300)).length <= 96);
});

test("what is an address of a tag or an author, and what is not", () => {
  for (const good of ["abe", "fx", "a", "us-dollar", "s-p-500"]) assert.ok(isBrowseSlug(good), good);
  for (const bad of ["", "Abe", "us dollar", "-gold", "gold-", "us--dollar", "a/b", "%40abe", "x".repeat(97), 7, null, undefined]) assert.ok(!isBrowseSlug(bad), String(bad));
  // every slug that is made is one that is accepted
  for (const text of ["US dollar", "@Abe", "S&P 500", "Bretton Woods"]) assert.ok(isBrowseSlug(browseSlug(text)), text);
});

test("the addresses of the pages; text without an address has no link", () => {
  assert.equal(blogTagPath("gold"), "/intelligence/blog/tag/gold");
  assert.equal(blogTagPath("gold", 3), "/intelligence/blog/tag/gold?page=3");
  assert.equal(blogAuthorPath("abe"), "/intelligence/blog/author/abe");
  assert.equal(blogAuthorPath("abe", 2), "/intelligence/blog/author/abe?page=2");
  assert.equal(tagHref("US dollar"), "/intelligence/blog/tag/us-dollar");
  assert.equal(bylineHref("@Abe"), "/intelligence/blog/author/abe");
  assert.equal(tagHref("  "), null);
  assert.equal(bylineHref("—"), null);
  assert.equal(blogSearchHref([]), "/intelligence/blog/search");
  assert.equal(blogSearchHref(["gold", "dollar"]), "/intelligence/blog/search?q=gold%20dollar");
  assert.equal(blogSearchHref(["gold"], 2), "/intelligence/blog/search?q=gold&page=2");
  assert.equal(blogSearchHref(["a+b"]), "/intelligence/blog/search?q=a%2Bb");
});

test("the way back from an address: the stored tags and bylines are slugged and compared", () => {
  const posts = [post("one", { tags: ["US dollar", "Gold"] }), post("two", { tags: [" us DOLLAR "], byline: "Abe" }), post("three", { tags: ["oil"], byline: "GIO4X Research Desk" })];
  assert.deepEqual(slugs(postsWithTag(posts, "us-dollar")), ["one", "two"]);
  assert.deepEqual(slugs(postsWithTag(posts, "gold")), ["one"]);
  assert.deepEqual(postsWithTag(posts, "silver"), []);
  // "@Abe" and "Abe" are one author
  assert.deepEqual(slugs(postsByAuthor(posts, "abe")), ["one", "two"]);
  assert.deepEqual(slugs(postsByAuthor(posts, "gio4x-research-desk")), ["three"]);
  assert.deepEqual(postsByAuthor(posts, "nobody"), []);
});

test("the tag index: each tag once per post, the most used first, named as the newest post writes it", () => {
  const posts = [
    post("newest", { tags: ["Gold", "gold", "Rates"], published_at: day(9) }),
    post("middle", { tags: ["GOLD", "US dollar", "", "—"], published_at: day(5) }),
    post("oldest", { tags: ["rates", "gold", "Amsterdam"], published_at: day(1) }),
  ];
  assert.deepEqual(tagIndex(posts), [
    { slug: "gold", label: "Gold", count: 3, newest: day(9) },
    { slug: "rates", label: "Rates", count: 2, newest: day(9) },
    { slug: "amsterdam", label: "Amsterdam", count: 1, newest: day(1) },
    { slug: "us-dollar", label: "US dollar", count: 1, newest: day(5) },
  ]);
  assert.deepEqual(tagIndex([]), []);
  assert.deepEqual(
    authorIndex([...posts, post("desk", { byline: "GIO4X Research Desk", published_at: day(7) })]).map((a) => [a.slug, a.label, a.count]),
    [
      ["abe", "@Abe", 3],
      ["gio4x-research-desk", "GIO4X Research Desk", 1],
    ],
  );
});

test("what is typed becomes a few clean words: nothing that could alter a filter is left", () => {
  assert.deepEqual(searchWords("  Gold   DOLLAR ", clean), ["gold", "dollar"]);
  assert.deepEqual(searchWords("gold Gold GOLD", clean), ["gold"]);
  assert.deepEqual(searchWords('gold,title.ilike.% (x) "y" \\z *', clean), ["goldtitle.ilike.", "x", "y", "z"]);
  assert.deepEqual(searchWords("%_ ,() ''", clean), ["_"]);
  assert.deepEqual(searchWords("", clean), []);
  assert.deepEqual(searchWords(undefined, clean), []);
  assert.deepEqual(searchWords(["gold"], clean), []);
  assert.equal(searchWords("a b c d e f g h", clean).length, SEARCH_MAX_WORDS);
  for (const word of searchWords("x".repeat(500), clean)) assert.ok(word.length <= 100);
});

test("a post answers when every word is in its title, its excerpt or a tag, whatever the case", () => {
  const p = post("p", { title: "How Wall Street got its name", excerpt: "A wall, a street and a market.", tags: ["New York", "History"] });
  assert.ok(matchesSearch(p, ["wall"]));
  assert.ok(matchesSearch(p, ["WALL", "market"])); // title and excerpt
  assert.ok(matchesSearch(p, ["york", "street"])); // tag and title
  assert.ok(matchesSearch(p, ["hist"])); // part of a word
  assert.ok(!matchesSearch(p, ["wall", "amsterdam"])); // every word, not any
  assert.ok(!matchesSearch(p, ["streetgot"])); // not across the fields, nor across words
  assert.ok(!matchesSearch(p, [])); // no word, no answer
  // the body and the address are not looked in
  assert.ok(!matchesSearch(post("gold-and-the-dollar", { title: "A note" }), ["gold"]));
});

test("a page of a list: its items, how many there are in all, and null past the last page", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);
  assert.deepEqual(pageOf(items, 1, 12), { items: items.slice(0, 12), total: 25, pages: 3 });
  assert.deepEqual(pageOf(items, 3, 12), { items: [25], total: 25, pages: 3 });
  assert.equal(pageOf(items, 4, 12), null);
  assert.equal(pageOf(items, 0, 12), null);
  assert.equal(pageOf(items, 1.5, 12), null);
  assert.deepEqual(pageOf([], 1, 12), { items: [], total: 0, pages: 1 });
});
