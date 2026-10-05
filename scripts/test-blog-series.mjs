// Unit tests for src/data/blog-series.ts (which posts make a series, a post's place in it, and the parts before and after).
// Run: node --test scripts/test-blog-series.mjs      (Node 22.18 or later: it reads the TypeScript file directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { BLOG_SERIES, blogSeriesPath, getBlogSeries, numberedParts, seriesNeighbours, seriesOfPost } from "../src/data/blog-series.ts";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/; // as isBlogSlug in src/lib/blog.ts
const S = { slug: "letters", title: "Letters", subtitle: "", about: "", parts: ["a-one", "b-two", "c-three", "d-four"] };
const live = (...slugs) => slugs.map((slug) => ({ slug, title: slug.toUpperCase() }));

test("every series has an address, a title and parts that are the addresses of posts, none twice", () => {
  assert.ok(BLOG_SERIES.length > 0);
  assert.equal(new Set(BLOG_SERIES.map((s) => s.slug)).size, BLOG_SERIES.length);
  for (const s of BLOG_SERIES) {
    assert.match(s.slug, SLUG);
    assert.ok(s.title.trim() && s.subtitle.trim() && s.about.trim());
    assert.ok(s.parts.length > 0);
    assert.equal(new Set(s.parts).size, s.parts.length, `${s.slug}: a part is listed twice`);
    for (const p of s.parts) assert.ok(SLUG.test(p) && p.length >= 3 && p.length <= 96, `${s.slug}: "${p}" is not the address of a post`);
  }
});

test("The History of Trading has fifteen parts, from the first trade to the algorithms", () => {
  const s = getBlogSeries("history-of-trading");
  assert.ok(s);
  assert.equal(s.parts.length, 15);
  assert.equal(s.parts[0], "first-trade-human-history");
  assert.equal(s.parts[14], "trading-floors-to-algorithms");
  assert.equal(blogSeriesPath(s.slug), "/intelligence/blog/series/history-of-trading");
  assert.deepEqual({ part: seriesOfPost("tulip-mania-bubble-or-myth").part, of: seriesOfPost("tulip-mania-bubble-or-myth").of }, { part: 8, of: 15 });
});

test("a post that is in no series has no place, and an unknown series is not one", () => {
  assert.equal(seriesOfPost("gold-and-the-dollar"), null);
  assert.equal(seriesOfPost("series"), null);
  assert.equal(getBlogSeries("no-such-series"), null);
  assert.equal(seriesOfPost("b-two", [S]).part, 2);
});

test("a part that is not public is left out and the others keep their numbers, in the series' order", () => {
  // the database answers in any order, and with one part missing
  const parts = numberedParts(S, live("d-four", "a-one", "c-three", "not-in-the-series"));
  assert.deepEqual(parts.map((p) => [p.part, p.post.slug]), [[1, "a-one"], [3, "c-three"], [4, "d-four"]]);
  assert.deepEqual(numberedParts(S, []), []);
});

test("the parts before and after step over one that is not public", () => {
  const all = live("a-one", "b-two", "c-three", "d-four");
  assert.deepEqual(seriesNeighbours(S, "b-two", all), { previous: { part: 1, post: all[0] }, next: { part: 3, post: all[2] } });
  // part 2 is withdrawn: part 1's next is part 3, part 3's previous is part 1
  const without = live("a-one", "c-three", "d-four");
  assert.equal(seriesNeighbours(S, "a-one", without).next.part, 3);
  assert.equal(seriesNeighbours(S, "c-three", without).previous.part, 1);
  // the ends, a post read while nothing else is public, and a post that is not a part
  assert.equal(seriesNeighbours(S, "a-one", all).previous, null);
  assert.equal(seriesNeighbours(S, "d-four", all).next, null);
  assert.deepEqual(seriesNeighbours(S, "b-two", []), { previous: null, next: null });
  assert.deepEqual(seriesNeighbours(S, "elsewhere", all), { previous: null, next: null });
});
