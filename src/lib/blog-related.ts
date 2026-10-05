/**
 * Which posts stand under "Related posts" at the foot of a post.
 *
 * Arithmetic only: the posts arrive already read and already public (see
 * relatedPosts in src/lib/server/blog.ts), and nothing here asks anything of
 * anyone. Kept apart so that it can be tested without a database
 * (scripts/test-blog-related.mjs).
 *
 * The order, each rule deciding only what the one before it left equal:
 *   1. the more tags a post shares with this one, the earlier it stands
 *      (compared without regard to case or to space around a tag)
 *   2. the same category
 *   3. the same format
 *   4. the newer post
 *   5. the slug, so that the order is the same every time
 *
 * The post itself is never among them, no post appears twice, and a post
 * without a publication date is left out.
 */

/** What is compared of the post being read. */
export type RelatedSubject = { slug: string; tags: readonly string[]; category: string; format: string };
/** What is compared of every other post. */
export type RelatedCandidate = RelatedSubject & { published_at: string };

const tagKey = (tag: string) => tag.trim().toLowerCase();
const tagSet = (tags: readonly string[]) => new Set(tags.map(tagKey).filter(Boolean));

/** How many tags two posts have in common. A tag written twice on one post counts once. */
export function sharedTags(a: readonly string[], b: readonly string[]): number {
  const mine = tagSet(a);
  let n = 0;
  for (const t of tagSet(b)) if (mine.has(t)) n += 1;
  return n;
}

export function rankRelated<T extends RelatedCandidate>(post: RelatedSubject, candidates: readonly T[], limit = 3): T[] {
  const seen = new Set<string>([post.slug]);
  const scored: { item: T; tags: number; category: number; format: number; at: number }[] = [];
  for (const item of candidates) {
    const at = Date.parse(item.published_at);
    if (seen.has(item.slug) || Number.isNaN(at)) continue;
    seen.add(item.slug);
    scored.push({ item, tags: sharedTags(post.tags, item.tags), category: item.category === post.category ? 1 : 0, format: item.format === post.format ? 1 : 0, at });
  }
  scored.sort((a, b) => b.tags - a.tags || b.category - a.category || b.format - a.format || b.at - a.at || (a.item.slug < b.item.slug ? -1 : a.item.slug > b.item.slug ? 1 : 0));
  return scored.slice(0, Math.max(0, Math.floor(limit))).map((s) => s.item);
}
