/**
 * The daily blog by tag, by author and by search, read for the public pages.
 *
 * Read as the anonymous role like everything in src/lib/server/blog.ts: the
 * database decides what that role may see, and the filters below are a courtesy.
 *
 * One question answers all of it: the tags, the byline, the title and the
 * excerpt of the live posts, newest first (no body, no cover), kept for
 * BLOG_REVALIDATE seconds under the blog's own cache tag, so the console
 * refreshes it with the lists when a post is saved. The tag index, a tag's
 * page, an author's page and a search are then worked out from that answer
 * (src/lib/blog-browse.ts), and only the twelve posts of the page being shown
 * are read as cards, through seriesPosts(), which keeps its answer too.
 *
 * So what a visitor types never reaches a filter: a search is a comparison made
 * here, over rows already read. The words are still cleaned as GIO4X Control
 * cleans its own (cleanSearch), and a search costs at most one small read a
 * minute for each page of results, however often it is asked; one that finds
 * nothing costs none.
 *
 * None of the columns of 0031 are asked for, so this reads the same before
 * that migration as after it; the cards fall back as they do everywhere else.
 */
import { unstable_cache } from "next/cache";
import { BLOG_PAGE_SIZE, isBlogSlug } from "@/lib/blog";
import { authorIndex, BLOG_TAGS_PATH, blogAuthorPath, blogTagPath, type BrowseCount, type BrowsePost, matchesSearch, pageOf, postsByAuthor, postsWithTag, searchWords, TAG_INDEX_MIN, tagIndex } from "@/lib/blog-browse";
import { BLOG_CACHE_TAG, BLOG_MAX_PAGE, BLOG_REVALIDATE, type BlogCard, blogDay, type BlogFailure, seriesPosts } from "@/lib/server/blog";
import { cleanSearch } from "@/lib/server/validate";
import { createPublicSupabase } from "@/lib/supabase/server";

/** The most live posts that are ever read for this (a bound on one question to the database). Older ones are not found by tag, author or search. */
export const BLOG_BROWSE_MAX = 1000;

export type BlogBrowseList =
  /** `label` is the tag or the byline as it is written on the newest post that carries it; for a search, the words */
  | { state: "ok"; label: string; posts: BlogCard[]; total: number; page: number; pages: number }
  | { state: "none" }
  /** the page asked for is past the last one */
  | { state: "out-of-range" }
  | BlogFailure;
export type BlogTags = { state: "ok"; tags: BrowseCount[] } | { state: "none" } | BlogFailure;

const NOT_CONFIGURED: BlogFailure = { state: "failed", reason: "not-configured" };
const UNAVAILABLE: BlogFailure = { state: "failed", reason: "unavailable" };

class BrowseReadFailed extends Error {}

/** Kept like the list, and refreshed with it: a failed read is thrown through the cache so that it is never kept. */
const cachedLive = unstable_cache(
  async (): Promise<BrowsePost[]> => {
    const supabase = createPublicSupabase();
    if (!supabase) throw new BrowseReadFailed("not-configured");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, tags, byline, published_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .order("slug", { ascending: true })
      .limit(BLOG_BROWSE_MAX);
    if (error) throw new BrowseReadFailed("unavailable");
    type Row = Omit<BrowsePost, "tags" | "published_at"> & { tags: string[] | null; published_at: string | null };
    return ((data ?? []) as Row[]).flatMap((r) => (r.published_at ? [{ ...r, tags: Array.isArray(r.tags) ? r.tags : [], published_at: r.published_at }] : []));
  },
  ["blog-browse"],
  { revalidate: BLOG_REVALIDATE, tags: [BLOG_CACHE_TAG] },
);

async function livePosts(): Promise<{ state: "ok"; posts: BrowsePost[] } | BlogFailure> {
  if (!createPublicSupabase()) return NOT_CONFIGURED;
  try {
    return { state: "ok", posts: await cachedLive() };
  } catch (e) {
    return e instanceof BrowseReadFailed && e.message === "not-configured" ? NOT_CONFIGURED : UNAVAILABLE;
  }
}

/** One page of the posts `choose` keeps, newest first, as cards. */
async function browse(page: number, choose: (posts: BrowsePost[]) => { label: string; found: BrowsePost[] }): Promise<BlogBrowseList> {
  if (!Number.isInteger(page) || page < 1 || page > BLOG_MAX_PAGE) return { state: "out-of-range" };
  const live = await livePosts();
  if (live.state === "failed") return live;
  const { label, found } = choose(live.posts);
  if (!found.length) return page > 1 ? { state: "out-of-range" } : { state: "none" };
  const slice = pageOf(found, page, BLOG_PAGE_SIZE);
  if (!slice) return { state: "out-of-range" };
  // the same kept read a series makes: the public posts among these addresses, in this order
  const result = await seriesPosts(slice.items.map((p) => p.slug));
  if (result.state !== "ok") return result;
  return { state: "ok", label, posts: result.posts, total: slice.total, page, pages: slice.pages };
}

/** The posts that carry a tag. `slug` is the tag as an address (isBrowseSlug, checked by the caller); a tag no live post carries is "none". */
export function tagPosts(slug: string, page = 1): Promise<BlogBrowseList> {
  return browse(page, (posts) => {
    const found = postsWithTag(posts, slug);
    return { label: tagIndex(found).find((t) => t.slug === slug)?.label ?? slug, found };
  });
}

/** The posts under a byline. `slug` is the byline as an address; a byline no live post carries is "none". */
export function authorPosts(slug: string, page = 1): Promise<BlogBrowseList> {
  return browse(page, (posts) => {
    const found = postsByAuthor(posts, slug);
    return { label: found[0]?.byline.trim() ?? slug, found };
  });
}

/** What was typed into the search box, as the words that are looked for (see searchWords): only [a-z0-9@._+-], at most five. */
export const blogSearchWords = (typed: unknown): string[] => searchWords(typed, cleanSearch);

/** The posts in which every word is found, in the title, the excerpt or a tag. `words` come from blogSearchWords(). */
export function searchPosts(words: readonly string[], page = 1): Promise<BlogBrowseList> {
  return browse(page, (posts) => ({ label: words.join(" "), found: words.length ? posts.filter((p) => matchesSearch(p, words)) : [] }));
}

/** Every tag in use on a live post with how many carry it, the most used first. */
export async function blogTags(): Promise<BlogTags> {
  const live = await livePosts();
  if (live.state === "failed") return live;
  const tags = tagIndex(live.posts);
  return tags.length ? { state: "ok", tags } : { state: "none" };
}

/**
 * Whether a live post has this slug. The pages at `tags` and `search` ask it of
 * their own names, because unlike `category`, `series`, `tag` and `author` they
 * are pages, and a page takes the address before `[slug]` is asked: a post
 * that has the name is shown there instead, as it would have been. Anything
 * but a clear yes is no.
 */
export async function postAtAddress(slug: string): Promise<boolean> {
  if (!isBlogSlug(slug)) return false;
  const live = await livePosts();
  return live.state === "ok" && live.posts.some((p) => p.slug === slug);
}

/** A page a search engine is told about, with the name the sitemap for people gives it. */
export type BlogBrowsePage = { path: string; lastmod: string; label: string };

/**
 * The pages by tag and by author that are worth telling a search engine about:
 * the tag index when there is a tag, each tag that at least TAG_INDEX_MIN
 * posts carry (a page with fewer asks not to be indexed), and each author. Each
 * is dated by its newest post. Nothing when the posts cannot be read.
 */
export async function indexableBrowsePages(): Promise<BlogBrowsePage[]> {
  const live = await livePosts();
  if (live.state === "failed") return [];
  const pages: BlogBrowsePage[] = [];
  const add = (path: string, newest: string, label: string) => {
    const lastmod = blogDay(newest);
    if (lastmod) pages.push({ path, lastmod, label });
  };
  const tags = tagIndex(live.posts);
  if (tags.length) add(BLOG_TAGS_PATH, live.posts[0].published_at, "Tags");
  for (const t of tags) if (t.count >= TAG_INDEX_MIN) add(blogTagPath(t.slug), t.newest, `Tag: ${t.label}`);
  for (const a of authorIndex(live.posts)) add(blogAuthorPath(a.slug), a.newest, `Author: ${a.label}`);
  return pages;
}
