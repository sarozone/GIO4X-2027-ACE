/**
 * The daily blog, read for the public pages.
 *
 * Every read here is made as the anonymous role. The database decides what
 * that role may see (0011_blog.sql: a post whose status is "published" and
 * whose publication time has passed, and only the public columns), so the
 * filters below are a courtesy that lets the index be used; they are not the
 * gate.
 *
 * Each function says which of three things happened, because a page must not
 * show "nothing published yet" when the truth is "could not ask":
 *   ok      there is something to show
 *   none    the read worked and there is nothing
 *   failed  the project is not configured, or the read did not complete
 *
 * Nothing is frozen at build time. The pages that call these are rendered on
 * demand and kept for BLOG_REVALIDATE seconds, so a post published in the
 * console is on the site within about a minute, without a deploy. The console
 * can make that immediate by calling revalidateTag(BLOG_CACHE_TAG) and
 * revalidatePath(BLOG_PATH, "layout") after publishing.
 *
 * The format, the lead, the pinned posts, the reviewer and the old addresses
 * come from 0031_blog_journal.sql. Each read that wants them asks for them
 * and, when the database answers that it has no such column (the code can be
 * live a moment before the migration is applied), asks again the way it did
 * before 0031: the page is then exactly what it was, newest first, every post
 * a note, nobody leading.
 */
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { BLOG_CATEGORIES, BLOG_PAGE_SIZE, BLOG_PATH, BLOG_RELATED_COUNT, BLOG_RELATED_POOL, blogImageUrl, DEFAULT_BLOG_FORMAT, isBlogFormat, isBlogSlug, readingMinutes } from "@/lib/blog";
import { rankRelated } from "@/lib/blog-related";
import { createPublicSupabase } from "@/lib/supabase/server";
import { BLOG_JOURNAL_COLUMNS, BLOG_PUBLIC_COLUMNS, type BlogCategory, type BlogFormat, type BlogPublicPost } from "@/lib/supabase/types";

/** Seconds a rendered page or a cached list may be served before it is read again. */
export const BLOG_REVALIDATE = 60;
export const BLOG_CACHE_TAG = "blog";
/** The highest page number that is ever asked of the database (a bound on what a visitor can make us read or keep). */
export const BLOG_MAX_PAGE = 500;

export type BlogCover = { src: string; alt: string; width: number | null; height: number | null };

/** A public post: the publication time is always there. */
export type BlogPost = Omit<BlogPublicPost, "published_at"> & { published_at: string };

/** What a list shows of a post. The body is read to count the minutes and is not carried further. */
export type BlogCard = Pick<BlogPost, "slug" | "title" | "excerpt" | "category" | "byline" | "published_at" | "corrected_at"> & {
  minutes: number;
  cover: BlogCover | null;
  format: BlogFormat;
  /** the post the editors chose to lead the index */
  lead: boolean;
  pinned: boolean;
};

export type BlogNeighbour = Pick<BlogPost, "slug" | "title" | "published_at">;
export type BlogFeedItem = Pick<BlogPost, "slug" | "title" | "excerpt" | "category" | "byline" | "published_at">;
/** What a sitemap needs of a post. The category dates the page of that category. */
export type BlogIndexEntry = { slug: string; lastmod: string; category: BlogCategory; /** for the sitemap for people (/explore/sitemap); the XML sitemap does not use it */ title: string };

export type BlogFailure = { state: "failed"; reason: "not-configured" | "unavailable" };
export type BlogList =
  | { state: "ok"; posts: BlogCard[]; total: number; page: number; pages: number }
  | { state: "none" }
  /** the page asked for is past the last one */
  | { state: "out-of-range" }
  | BlogFailure;
export type BlogOne = { state: "ok"; post: BlogPost } | { state: "none" } | BlogFailure;
/** Where an address that no longer has a post leads: the post's current slug, or nowhere. */
export type BlogMoved = { state: "moved"; slug: string } | { state: "none" };
export type BlogLatest = { state: "ok"; posts: BlogCard[] } | { state: "none" } | BlogFailure;
export type BlogNeighbours = { state: "ok"; previous: BlogNeighbour | null; next: BlogNeighbour | null } | BlogFailure;
export type BlogRelated = { state: "ok"; posts: BlogCard[] } | { state: "none" } | BlogFailure;
export type BlogFeed = { state: "ok"; items: BlogFeedItem[] } | { state: "none" } | BlogFailure;
export type BlogIndex = { state: "ok"; entries: BlogIndexEntry[] } | { state: "none" } | BlogFailure;

const NOT_CONFIGURED: BlogFailure = { state: "failed", reason: "not-configured" };
const UNAVAILABLE: BlogFailure = { state: "failed", reason: "unavailable" };

const CARD_COLUMNS = "slug, title, excerpt, body, category, byline, published_at, corrected_at, cover_path, cover_alt, cover_width, cover_height" as const;
/** A card's row: the columns of 0011 always, those of 0031 when the database has them. */
type CardRow = Pick<BlogPublicPost, "slug" | "title" | "excerpt" | "body" | "category" | "byline" | "published_at" | "corrected_at" | "cover_path" | "cover_alt" | "cover_width" | "cover_height"> &
  Partial<Pick<BlogPublicPost, "format" | "is_lead" | "is_pinned">>;
const CARD_COLUMNS_0031 = `${CARD_COLUMNS}, format, is_lead, is_pinned` as const;
const POST_COLUMNS_0031 = `${BLOG_PUBLIC_COLUMNS}, ${BLOG_JOURNAL_COLUMNS}` as const;

/**
 * The database answered that a column of 0031 is not there (42703), or not the
 * anonymous role's to read yet (42501): the migration has not been applied.
 * The read is then made again without those columns.
 */
const before0031 = (error: { code?: string } | null): boolean => error?.code === "42703" || error?.code === "42501";

export const isBlogCategory = (value: unknown): value is BlogCategory => typeof value === "string" && (BLOG_CATEGORIES as readonly string[]).includes(value);

export const blogPostPath = (slug: string) => `${BLOG_PATH}/${slug}`;

/** The cover of a post as a page can show it, or null when there is none (or the project has no storage address). */
export function blogCover(post: Pick<BlogPublicPost, "cover_path" | "cover_alt" | "cover_width" | "cover_height">): BlogCover | null {
  const src = post.cover_path ? blogImageUrl(post.cover_path) : null;
  if (!src) return null;
  return { src, alt: post.cover_alt, width: post.cover_width, height: post.cover_height };
}

function toCard(row: CardRow): BlogCard | null {
  if (!row.published_at) return null;
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    byline: row.byline,
    published_at: row.published_at,
    corrected_at: row.corrected_at,
    minutes: readingMinutes(row.body),
    cover: blogCover(row),
    format: isBlogFormat(row.format) ? row.format : DEFAULT_BLOG_FORMAT,
    lead: row.is_lead === true,
    pinned: row.is_pinned === true,
  };
}

const cards = (rows: CardRow[] | null): BlogCard[] => (rows ?? []).map(toCard).filter((c): c is BlogCard => c !== null);

/**
 * One page of the list, read from the database: the lead first, then the
 * pinned posts, then the rest, newest first within each. Before 0031 there is
 * no lead and nothing is pinned, so it is simply newest first.
 */
async function readList(page: number, category: BlogCategory | null, format: BlogFormat | null = null): Promise<BlogList> {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  try {
    const from = (page - 1) * BLOG_PAGE_SIZE;
    const now = new Date().toISOString();
    const ask = async (journal: boolean) => {
      let query = supabase.from("blog_posts").select(journal ? CARD_COLUMNS_0031 : CARD_COLUMNS, { count: "exact" }).eq("status", "published").lte("published_at", now);
      if (category) query = query.eq("category", category);
      if (journal && format) query = query.eq("format", format);
      if (journal) query = query.order("is_lead", { ascending: false }).order("is_pinned", { ascending: false });
      const answer = await query
        .order("published_at", { ascending: false })
        .order("slug", { ascending: true })
        .range(from, from + BLOG_PAGE_SIZE - 1);
      return { data: answer.data as unknown as CardRow[] | null, count: answer.count, error: answer.error };
    };
    let { data, count, error } = await ask(true);
    if (before0031(error)) {
      // before 0031 every post is a note: that format is every post, and any other is none of them
      if (format && format !== DEFAULT_BLOG_FORMAT) return page > 1 ? { state: "out-of-range" } : { state: "none" };
      ({ data, count, error } = await ask(false));
    }
    if (error) {
      // PostgREST answers "range not satisfiable" when the first row asked for is past the last one
      if (error.code === "PGRST103") return page > 1 ? { state: "out-of-range" } : { state: "none" };
      return UNAVAILABLE;
    }
    const posts = cards(data);
    if (!posts.length) return page > 1 ? { state: "out-of-range" } : { state: "none" };
    const total = Math.max(count ?? 0, from + posts.length);
    return { state: "ok", posts, total, page, pages: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)) };
  } catch {
    return UNAVAILABLE;
  }
}

class BlogReadFailed extends Error {}

/**
 * The list page reads its query string, so it is rendered for every request.
 * What it reads is kept for a minute, so that many visitors, or one visitor
 * asking many times, are one question to the database. A failed read is thrown
 * through the cache so that it is never kept.
 */
const cachedList = unstable_cache(
  async (page: number, category: string, format: string = ""): Promise<BlogList> => {
    const result = await readList(page, isBlogCategory(category) ? category : null, isBlogFormat(format) ? format : null);
    if (result.state === "failed") throw new BlogReadFailed(result.reason);
    return result;
  },
  // "-0031": a card gained its format and its place on the index; a list kept from before must not be handed to code that expects them
  ["blog-list-0031"],
  { revalidate: BLOG_REVALIDATE, tags: [BLOG_CACHE_TAG] },
);

/** Published posts, newest first, BLOG_PAGE_SIZE to a page. `page` starts at 1. With a format, only the posts of that kind. */
export async function listPosts({ page = 1, category = null, format = null }: { page?: number; category?: BlogCategory | null; format?: BlogFormat | null } = {}): Promise<BlogList> {
  if (!Number.isInteger(page) || page < 1 || page > BLOG_MAX_PAGE) return { state: "out-of-range" };
  if (category !== null && !isBlogCategory(category)) return { state: "none" };
  if (format !== null && !isBlogFormat(format)) return { state: "none" };
  if (!createPublicSupabase()) return NOT_CONFIGURED;
  try {
    // without a format the question is asked exactly as it was before there was one, so what is kept is kept under the same key
    return format ? await cachedList(page, category ?? "", format) : await cachedList(page, category ?? "");
  } catch (e) {
    return e instanceof BlogReadFailed && e.message === "not-configured" ? NOT_CONFIGURED : UNAVAILABLE;
  }
}

/**
 * One public post by its address. The caller validates the slug (isBlogSlug)
 * before asking. Shared between a page and its metadata within one request.
 */
export const getPost = cache(async (slug: string): Promise<BlogOne> => {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  try {
    const now = new Date().toISOString();
    // before 0031 the four columns are not in the answer: the post is then a note, leads nothing, and names no reviewer
    type Row = Omit<BlogPublicPost, "format" | "is_lead" | "is_pinned" | "reviewed_by"> & Partial<Pick<BlogPublicPost, "format" | "is_lead" | "is_pinned" | "reviewed_by">>;
    const ask = async (journal: boolean) => {
      const answer = await supabase
        .from("blog_posts")
        .select(journal ? POST_COLUMNS_0031 : BLOG_PUBLIC_COLUMNS)
        .eq("slug", slug)
        .eq("status", "published")
        .lte("published_at", now)
        .maybeSingle();
      return { data: answer.data as unknown as Row | null, error: answer.error };
    };
    let { data: row, error } = await ask(true);
    if (before0031(error)) ({ data: row, error } = await ask(false));
    if (error) return UNAVAILABLE;
    if (!row || !row.published_at) return { state: "none" };
    return {
      state: "ok",
      post: {
        ...row,
        published_at: row.published_at,
        format: isBlogFormat(row.format) ? row.format : DEFAULT_BLOG_FORMAT,
        is_lead: row.is_lead === true,
        is_pinned: row.is_pinned === true,
        reviewed_by: typeof row.reviewed_by === "string" ? row.reviewed_by : "",
      },
    };
  } catch {
    return UNAVAILABLE;
  }
});

/**
 * Where an address that has no public post leads, when a published post used
 * to live there (`blog_slug_redirects`, 0031). Asked only after getPost() has
 * answered "none", and read the same way: as the anonymous role, which is
 * shown an old address only while the post it belongs to is public.
 *
 * Anything other than a clear answer is "none": the table not being there yet,
 * or a read that did not complete, leaves the page what it was before 0031, a
 * 404 that is read again within a minute.
 */
export const movedPost = cache(async (slug: string): Promise<BlogMoved> => {
  const supabase = createPublicSupabase();
  if (!supabase) return { state: "none" };
  try {
    const old = await supabase.from("blog_slug_redirects").select("post_id").eq("old_slug", slug).maybeSingle();
    if (old.error || !old.data) return { state: "none" };
    const current = await supabase.from("blog_posts").select("slug").eq("id", old.data.post_id).eq("status", "published").lte("published_at", new Date().toISOString()).maybeSingle();
    const to = current.data?.slug;
    // never to itself, and never to anything that is not the address of a post
    if (current.error || !isBlogSlug(to) || to === slug) return { state: "none" };
    return { state: "moved", slug: to };
  } catch {
    return { state: "none" };
  }
});

/** The post published just before this one ("previous") and just after it ("next"). */
export async function neighbours(post: Pick<BlogPost, "slug" | "published_at">): Promise<BlogNeighbours> {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  try {
    const columns = "slug, title, published_at";
    const now = new Date().toISOString();
    const [before, after] = await Promise.all([
      supabase.from("blog_posts").select(columns).eq("status", "published").lt("published_at", post.published_at).neq("slug", post.slug).order("published_at", { ascending: false }).limit(1),
      supabase.from("blog_posts").select(columns).eq("status", "published").gt("published_at", post.published_at).lte("published_at", now).neq("slug", post.slug).order("published_at", { ascending: true }).limit(1),
    ]);
    if (before.error || after.error) return UNAVAILABLE;
    const first = (rows: unknown): BlogNeighbour | null => {
      const row = ((rows as { slug: string; title: string; published_at: string | null }[] | null) ?? [])[0];
      return row && row.published_at ? { slug: row.slug, title: row.title, published_at: row.published_at } : null;
    };
    return { state: "ok", previous: first(before.data), next: first(after.data) };
  } catch {
    return UNAVAILABLE;
  }
}

/**
 * Up to BLOG_RELATED_COUNT other public posts for the foot of a post, chosen
 * by rankRelated (src/lib/blog-related.ts): shared tags first, then the same
 * category, then the same format, then the newer post.
 *
 * One read, as the anonymous role like every other here: the newest
 * BLOG_RELATED_POOL public posts other than this one, from which the three are
 * chosen. A post older than those is therefore not found, however many tags it
 * shares. Before 0031 every post is a note, so the format decides nothing.
 */
export async function relatedPosts(post: Pick<BlogPost, "slug" | "tags" | "category" | "format">): Promise<BlogRelated> {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  try {
    const now = new Date().toISOString();
    type Row = CardRow & { tags: string[] | null };
    const ask = async (journal: boolean) => {
      const answer = await supabase
        .from("blog_posts")
        .select(journal ? `${CARD_COLUMNS_0031}, tags` : `${CARD_COLUMNS}, tags`)
        .eq("status", "published")
        .lte("published_at", now)
        .neq("slug", post.slug)
        .order("published_at", { ascending: false })
        .order("slug", { ascending: true })
        .limit(BLOG_RELATED_POOL);
      return { data: answer.data as unknown as Row[] | null, error: answer.error };
    };
    let { data, error } = await ask(true);
    if (before0031(error)) ({ data, error } = await ask(false));
    if (error) return UNAVAILABLE;
    const candidates = (data ?? []).flatMap((row) => {
      const card = toCard(row);
      return card ? [{ card, slug: card.slug, tags: Array.isArray(row.tags) ? row.tags : [], category: card.category, format: card.format, published_at: card.published_at }] : [];
    });
    const posts = rankRelated(post, candidates, BLOG_RELATED_COUNT).map((c) => c.card);
    return posts.length ? { state: "ok", posts } : { state: "none" };
  } catch {
    return UNAVAILABLE;
  }
}

/** The most parts a series is ever read for (a bound on one question to the database). */
const BLOG_SERIES_MAX = 60;

/**
 * The public posts among the given addresses, in the order given: the parts of
 * a series (src/data/blog-series.ts). One read, as the anonymous role like
 * every other here, so a part that is not written yet, not published, or
 * withdrawn is simply not in the answer; nothing says so and nothing breaks.
 */
async function readSeries(slugs: readonly string[]): Promise<BlogLatest> {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  const wanted = [...new Set(slugs.filter(isBlogSlug))].slice(0, BLOG_SERIES_MAX);
  if (!wanted.length) return { state: "none" };
  try {
    const now = new Date().toISOString();
    const ask = async (journal: boolean) => {
      const answer = await supabase
        .from("blog_posts")
        .select(journal ? CARD_COLUMNS_0031 : CARD_COLUMNS)
        .in("slug", wanted)
        .eq("status", "published")
        .lte("published_at", now)
        .limit(BLOG_SERIES_MAX);
      return { data: answer.data as unknown as CardRow[] | null, error: answer.error };
    };
    let { data, error } = await ask(true);
    if (before0031(error)) ({ data, error } = await ask(false));
    if (error) return UNAVAILABLE;
    const found = new Map(cards(data).map((c) => [c.slug, c]));
    const posts = wanted.flatMap((slug) => found.get(slug) ?? []);
    return posts.length ? { state: "ok", posts } : { state: "none" };
  } catch {
    return UNAVAILABLE;
  }
}

/** Kept for a minute like the list, and refreshed with it: a failed read is thrown through the cache so that it is never kept. */
const cachedSeries = unstable_cache(
  async (slugs: string): Promise<BlogLatest> => {
    const result = await readSeries(slugs.split(","));
    if (result.state === "failed") throw new BlogReadFailed(result.reason);
    return result;
  },
  ["blog-series"],
  { revalidate: BLOG_REVALIDATE, tags: [BLOG_CACHE_TAG] },
);

/** The parts of a series that are public now, in the series' own order. The hub and every part ask the same kept question. */
export async function seriesPosts(slugs: readonly string[]): Promise<BlogLatest> {
  if (!createPublicSupabase()) return NOT_CONFIGURED;
  try {
    return await cachedSeries(slugs.join(","));
  } catch (e) {
    return e instanceof BlogReadFailed && e.message === "not-configured" ? NOT_CONFIGURED : UNAVAILABLE;
  }
}

/** The newest posts, for a short section on another page. */
export async function latestPosts(n: number): Promise<BlogLatest> {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  try {
    const now = new Date().toISOString();
    // newest first, as it always was: the lead and the pinned posts order the blog's own index, not this section
    const ask = async (journal: boolean) => {
      const answer = await supabase
        .from("blog_posts")
        .select(journal ? CARD_COLUMNS_0031 : CARD_COLUMNS)
        .eq("status", "published")
        .lte("published_at", now)
        .order("published_at", { ascending: false })
        .order("slug", { ascending: true })
        .limit(Math.min(Math.max(1, Math.floor(n)), BLOG_PAGE_SIZE));
      return { data: answer.data as unknown as CardRow[] | null, error: answer.error };
    };
    let { data, error } = await ask(true);
    if (before0031(error)) ({ data, error } = await ask(false));
    if (error) return UNAVAILABLE;
    const posts = cards(data);
    return posts.length ? { state: "ok", posts } : { state: "none" };
  } catch {
    return UNAVAILABLE;
  }
}

/** The newest posts as a feed lists them: no body is read. With a category, the newest of that category. */
export async function feedPosts(n: number, category: BlogCategory | null = null): Promise<BlogFeed> {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  try {
    let query = supabase.from("blog_posts").select("slug, title, excerpt, category, byline, published_at").eq("status", "published").lte("published_at", new Date().toISOString());
    if (category) query = query.eq("category", category);
    const { data, error } = await query.order("published_at", { ascending: false }).limit(Math.min(Math.max(1, Math.floor(n)), 100));
    if (error) return UNAVAILABLE;
    const items = ((data ?? []) as (Omit<BlogFeedItem, "published_at"> & { published_at: string | null })[]).flatMap((r) => (r.published_at ? [{ ...r, published_at: r.published_at }] : []));
    return items.length ? { state: "ok", items } : { state: "none" };
  } catch {
    return UNAVAILABLE;
  }
}

/** The canonical address a post declares, when it is not its own page. */
function pointsElsewhere(slug: string, canonical: string): boolean {
  const c = canonical.trim();
  if (!c) return false;
  const own = blogPostPath(slug);
  return !(c === own || c.endsWith(own));
}

/**
 * Every post a search engine should be told about, newest first: public, not
 * marked noindex, and canonical to itself. `lastmod` is the day the row last
 * changed, or the day it was published when that is later (a scheduled post).
 */
export async function indexablePosts(): Promise<BlogIndex> {
  const supabase = createPublicSupabase();
  if (!supabase) return NOT_CONFIGURED;
  try {
    const step = 1000;
    const entries: BlogIndexEntry[] = [];
    const now = new Date().toISOString();
    for (let from = 0; from < 10 * step; from += step) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, category, published_at, updated_at, canonical_url")
        .eq("status", "published")
        .eq("noindex", false)
        .lte("published_at", now)
        .order("published_at", { ascending: false })
        .order("slug", { ascending: true })
        .range(from, from + step - 1);
      if (error) {
        if (error.code === "PGRST103") break;
        return UNAVAILABLE;
      }
      const rows = (data ?? []) as { slug: string; title: string; category: BlogCategory; published_at: string | null; updated_at: string; canonical_url: string }[];
      for (const r of rows) {
        if (!r.published_at || pointsElsewhere(r.slug, r.canonical_url)) continue;
        const day = blogDay(Date.parse(r.updated_at) > Date.parse(r.published_at) ? r.updated_at : r.published_at);
        if (day) entries.push({ slug: r.slug, lastmod: day, category: r.category, title: r.title });
      }
      if (rows.length < step) break;
    }
    return entries.length ? { state: "ok", entries } : { state: "none" };
  } catch {
    return UNAVAILABLE;
  }
}

/** "2026-10-02" from a timestamp, in UTC; "" when it is not a date. */
export function blogDay(timestamp: string): string {
  const d = new Date(timestamp);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
