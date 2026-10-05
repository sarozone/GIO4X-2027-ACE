/**
 * The Blog list's filters, in one place: the list screen (/control/blog) and
 * a saved view pinned to the dashboard build their query here, so a pinned
 * view's count can never mean something different from the list it opens.
 *
 * "Scheduled" and "Published" are the same status in the database and differ
 * by whether the publication time has passed, so both are asked for against
 * the moment the caller names (`nowIso`).
 */
import { DEFAULT_BYLINE, type BlogFilter } from "@/components/control/views/blog-shared";
import { BLOG_LIST_COLUMNS, BLOG_LIST_COLUMNS_0011 } from "@/components/control/views/BlogListView";
import { viewParamsFrom, type ViewParams } from "@/components/control/views-shared";
import type { Db } from "@/lib/supabase/server";
import type { BlogCategory, BlogFormat } from "@/lib/supabase/types";

export type BlogFilters = {
  /** "" is every post */
  status: BlogFilter | "";
  category: BlogCategory | "";
  /** "" or left out is every format (0031_blog_journal.sql) */
  format?: BlogFormat | "";
  /** search words, each already through cleanSearch(): only [A-Za-z0-9@._+-] */
  words: string[];
};

/**
 * `blog_posts` with the filters applied, read as the signed-in member of
 * staff. The caller adds the order and the range. With `head` the database
 * returns the count and no rows.
 *
 * A search word must be in the title, in the address, or be one of the post's
 * tags (a whole tag: tags are stored in lower case, one word or several).
 *
 * `legacy` asks only for what existed before 0031_blog_journal.sql: the list
 * page asks that way when the database answers that it has no such column.
 */
export function blogFiltered(supabase: Db, f: BlogFilters, nowIso: string, head = false, legacy = false) {
  let query = supabase.from("blog_posts").select(legacy ? BLOG_LIST_COLUMNS_0011 : BLOG_LIST_COLUMNS, { count: "exact", head });
  if (f.status === "scheduled") query = query.eq("status", "published").gt("published_at", nowIso);
  else if (f.status === "published") query = query.eq("status", "published").lte("published_at", nowIso);
  else if (f.status) query = query.eq("status", f.status);
  if (f.category) query = query.eq("category", f.category);
  if (f.format) query = query.eq("format", f.format);
  // each word contains only [A-Za-z0-9@._+-]; the quotes keep dots inside the value, and none of those characters can end the {array} of one tag
  for (const word of f.words) query = query.or(`title.ilike."%${word}%",slug.ilike."%${word}%",tags.cs.{${word.toLowerCase()}}`);
  return query;
}

/** The names already used as a byline and as a reviewer, most recent first, for the editor to offer. */
export type BlogNames = { bylines: string[]; reviewers: string[] };

/**
 * A byline and a reviewer are free text (the site publishes under desks, not
 * a list of people), so the editor offers what has been used before rather
 * than a fixed list. Read as the signed-in member of staff. A convenience:
 * when a read fails (or the reviewer column is not there yet) that list is
 * simply shorter.
 */
export async function blogNames(supabase: Db): Promise<BlogNames> {
  const distinct = (values: (string | null | undefined)[], first: string[] = []): string[] => {
    const out = [...first];
    for (const v of values) {
      const name = (v ?? "").trim();
      if (name && !out.includes(name)) out.push(name);
    }
    return out.slice(0, 30);
  };
  try {
    const [bylines, reviewers] = await Promise.all([
      supabase.from("blog_posts").select("byline").order("updated_at", { ascending: false }).limit(200),
      supabase.from("blog_posts").select("reviewed_by").neq("reviewed_by", "").order("updated_at", { ascending: false }).limit(200),
    ]);
    return {
      bylines: distinct((bylines.data ?? []).map((r) => r.byline), [DEFAULT_BYLINE]),
      reviewers: distinct((reviewers.data ?? []).map((r) => r.reviewed_by)),
    };
  } catch {
    return { bylines: [DEFAULT_BYLINE], reviewers: [] };
  }
}

/** How many posts a saved view matches now. Null when it could not be counted. */
export async function countBlogView(supabase: Db, stored: ViewParams, nowIso: string): Promise<number | null> {
  const p = viewParamsFrom("blog", stored);
  const { count, error } = await blogFiltered(supabase, { status: (p.status ?? "") as BlogFilter | "", category: (p.category ?? "") as BlogCategory | "", words: [] }, nowIso, true);
  return error || count === null ? null : count;
}
