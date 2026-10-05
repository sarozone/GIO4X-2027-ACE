// Unit tests for src/lib/blog-related.ts (which posts stand under "Related posts" at the foot of a post, and in what order).
// Run: node --test scripts/test-blog-related.mjs      (Node 22.18 or later: it reads the TypeScript file directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { rankRelated, sharedTags } from "../src/lib/blog-related.ts";

const day = (n) => new Date(Date.UTC(2026, 8, n, 9)).toISOString(); // n September 2026, 09:00 UTC
const post = (slug, over = {}) => ({ slug, tags: [], category: "market-notes", format: "note", published_at: day(1), ...over });
const slugs = (list) => list.map((p) => p.slug);

const SUBJECT = { slug: "gold-and-the-dollar", tags: ["Gold", "US dollar", "rates"], category: "market-notes", format: "analysis" };

test("shared tags are counted without regard to case, space or repetition", () => {
  assert.equal(sharedTags(["Gold", "US dollar"], [" gold ", "GOLD", "us DOLLAR", "oil"]), 2);
  assert.equal(sharedTags(["Gold"], []), 0);
  assert.equal(sharedTags(["", "  "], ["", " "]), 0);
});

test("shared tags come first, the more the earlier, whatever else differs", () => {
  const ranked = rankRelated(SUBJECT, [
    post("newest-same-category-and-format", { format: "analysis", published_at: day(30) }),
    post("one-tag", { tags: ["rates"], category: "education", format: "guide", published_at: day(2) }),
    post("two-tags", { tags: ["gold", "us dollar"], category: "company", format: "news", published_at: day(1) }),
  ]);
  assert.deepEqual(slugs(ranked), ["two-tags", "one-tag", "newest-same-category-and-format"]);
});

test("then the same category, then the same format, then the newer post", () => {
  const ranked = rankRelated(
    SUBJECT,
    [
      post("other-category-newest", { category: "education", format: "guide", published_at: day(29) }),
      post("other-category-same-format", { category: "education", format: "analysis", published_at: day(3) }),
      post("same-category-other-format-old", { format: "note", published_at: day(4) }),
      post("same-category-other-format-new", { format: "note", published_at: day(20) }),
      post("same-category-same-format", { format: "analysis", published_at: day(2) }),
    ],
    5,
  );
  assert.deepEqual(slugs(ranked), ["same-category-same-format", "same-category-other-format-new", "same-category-other-format-old", "other-category-same-format", "other-category-newest"]);
});

test("the post itself is never among them, and no post appears twice", () => {
  const ranked = rankRelated(SUBJECT, [post(SUBJECT.slug, { tags: SUBJECT.tags, format: "analysis" }), post("a", { published_at: day(5) }), post("a", { published_at: day(6) }), post("b", { published_at: day(4) })], 5);
  assert.deepEqual(slugs(ranked), ["a", "b"]);
});

test("at most three unless told otherwise; none when there is nothing else", () => {
  const five = [1, 2, 3, 4, 5].map((n) => post(`p${n}`, { published_at: day(n) }));
  assert.deepEqual(slugs(rankRelated(SUBJECT, five)), ["p5", "p4", "p3"]);
  assert.deepEqual(rankRelated(SUBJECT, five, 0), []);
  assert.deepEqual(rankRelated(SUBJECT, []), []);
  assert.deepEqual(rankRelated(SUBJECT, [post(SUBJECT.slug)]), []);
});

test("a post without a publication date is left out; equal posts are ordered by slug, the same every time", () => {
  const ranked = rankRelated(SUBJECT, [post("zebra"), post("undated", { published_at: "not a date" }), post("alpha")], 5);
  assert.deepEqual(slugs(ranked), ["alpha", "zebra"]);
});

test("what is handed in is handed back: the same objects, and the list is not reordered in place", () => {
  const list = [post("old", { published_at: day(1) }), post("new", { published_at: day(9) })];
  const ranked = rankRelated(SUBJECT, list);
  assert.equal(ranked[0], list[1]);
  assert.deepEqual(slugs(list), ["old", "new"]);
});
