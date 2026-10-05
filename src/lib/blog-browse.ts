/**
 * The daily blog by tag, by author and by search: the addresses and the
 * arithmetic.
 *
 * Nothing about a tag or an author is stored beside the post: a tag is one of
 * a post's `tags`, an author is its `byline`, and the page of either is at the
 * slug of that text ("US dollar" → us-dollar, "@Abe" → abe). So there is no
 * migration, and the way back from an address is to slug what is stored and
 * compare.
 *
 * Arithmetic only: the posts arrive already read and already public (see
 * src/lib/server/blog-browse.ts), and nothing here asks anything of anyone. It
 * imports nothing, so that it can be tested without a database
 * (scripts/test-blog-browse.mjs).
 */

/** Must equal BLOG_PATH in src/lib/blog.ts (not imported, so that this file stands alone). */
const BLOG_PATH = "/intelligence/blog";
/** Must equal BLOG_LIMITS.slug in src/lib/blog.ts. */
const SLUG_MAX = 96;

/** What is compared of a post: no body, no cover. */
export type BrowsePost = { slug: string; title: string; excerpt: string; tags: readonly string[]; byline: string; published_at: string };

/**
 * A tag or a byline as an address: lower case, ASCII letters and digits,
 * single hyphens (the rule of `slugify` in src/lib/blog.ts). Text with no
 * letter or digit of that kind has no address, and is then shown without a link.
 */
export function browseSlug(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Shorter than a post's slug may be: a tag can be "fx", a byline "AB". */
export const isBrowseSlug = (value: unknown): value is string => typeof value === "string" && value.length >= 1 && value.length <= SLUG_MAX && SLUG.test(value);

const paged = (path: string, page: number) => `${path}${page > 1 ? `?page=${page}` : ""}`;

/**
 * The pages. `tag/[tag]` and `author/[author]` sit in folders of their own
 * beside the posts and those folders have no page, so a post whose slug is
 * "tag" or "author" is still at its address. `tags` and `search` are pages:
 * each gives way to a post that has its slug (see postAtAddress).
 */
export const BLOG_TAGS_PATH = `${BLOG_PATH}/tags`;
export const BLOG_SEARCH_PATH = `${BLOG_PATH}/search`;
export const blogTagPath = (slug: string, page = 1) => paged(`${BLOG_PATH}/tag/${slug}`, page);
export const blogAuthorPath = (slug: string, page = 1) => paged(`${BLOG_PATH}/author/${slug}`, page);

/** The address of a search. The words are already clean (searchWords), so nothing in them needs more than the space encoded. */
export function blogSearchHref(words: readonly string[], page = 1): string {
  const query = [words.length ? `q=${encodeURIComponent(words.join(" "))}` : "", page > 1 ? `page=${page}` : ""].filter(Boolean).join("&");
  return query ? `${BLOG_SEARCH_PATH}?${query}` : BLOG_SEARCH_PATH;
}

/** Where a tag as stored leads, or null when it has no address. */
export function tagHref(tag: string): string | null {
  const slug = browseSlug(tag);
  return slug ? blogTagPath(slug) : null;
}

/** Where a byline as stored leads, or null when it has no address. */
export function bylineHref(byline: string): string | null {
  const slug = browseSlug(byline);
  return slug ? blogAuthorPath(slug) : null;
}

/** The slugs of a post's tags, each once: "Gold" and " gold " are one tag. */
function tagSlugs(post: Pick<BrowsePost, "tags">): Map<string, string> {
  const found = new Map<string, string>();
  for (const tag of post.tags) {
    const label = typeof tag === "string" ? tag.trim() : "";
    const slug = browseSlug(label);
    if (slug && !found.has(slug)) found.set(slug, label);
  }
  return found;
}

export const postsWithTag = <T extends BrowsePost>(posts: readonly T[], slug: string): T[] => posts.filter((p) => tagSlugs(p).has(slug));
export const postsByAuthor = <T extends BrowsePost>(posts: readonly T[], slug: string): T[] => posts.filter((p) => browseSlug(p.byline) === slug);

/** A tag or an author in use: its address, the way it is written, how many posts carry it and when the newest of them was published. */
export type BrowseCount = { slug: string; label: string; count: number; newest: string };

function counted(posts: readonly BrowsePost[], of: (post: BrowsePost) => Map<string, string>): BrowseCount[] {
  const all = new Map<string, BrowseCount>();
  for (const post of posts) {
    for (const [slug, label] of of(post)) {
      const seen = all.get(slug);
      // the first post to carry it names it; handed in newest first, that is the newest spelling
      if (!seen) all.set(slug, { slug, label, count: 1, newest: post.published_at });
      else {
        seen.count += 1;
        if (post.published_at > seen.newest) seen.newest = post.published_at;
      }
    }
  }
  // the most used first; the slug decides what the count leaves equal, so the order is the same every time
  return [...all.values()].sort((a, b) => b.count - a.count || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}

/** Every tag in use, the most used first. A tag written twice on one post counts once. */
export const tagIndex = (posts: readonly BrowsePost[]): BrowseCount[] => counted(posts, tagSlugs);

/** Every byline in use, the most used first. Bylines that slug alike ("@Abe", "Abe") are one author. */
export function authorIndex(posts: readonly BrowsePost[]): BrowseCount[] {
  return counted(posts, (post) => {
    const label = post.byline.trim();
    const slug = browseSlug(label);
    return new Map(slug ? [[slug, label]] : []);
  });
}

/** A tag page with fewer posts than this asks not to be indexed, and is not in the sitemap. */
export const TAG_INDEX_MIN = 2;

/** A search is a few words, as in GIO4X Control. */
export const SEARCH_MAX_WORDS = 5;
export const SEARCH_MAX_LENGTH = 200;

/**
 * What was typed, as the words that are looked for: split at white space, each
 * word cleaned by `clean` (cleanSearch in src/lib/server/validate.ts, handed in
 * so that this file imports nothing), lower case, none twice, and no more than
 * SEARCH_MAX_WORDS of them.
 */
export function searchWords(typed: unknown, clean: (word: string) => string): string[] {
  if (typeof typed !== "string") return [];
  const words = typed
    .slice(0, SEARCH_MAX_LENGTH)
    .split(/\s+/)
    .map((word) => clean(word).toLowerCase())
    .filter(Boolean);
  return [...new Set(words)].slice(0, SEARCH_MAX_WORDS);
}

/**
 * Whether a post answers a search: every word is somewhere in its title, its
 * excerpt or one of its tags, without regard to case. No word, no answer.
 */
export function matchesSearch(post: Pick<BrowsePost, "title" | "excerpt" | "tags">, words: readonly string[]): boolean {
  if (!words.length) return false;
  const text = [post.title, post.excerpt, ...post.tags].join("\n").toLowerCase();
  return words.every((word) => text.includes(word.toLowerCase()));
}

/** One page of a list: the items of that page, or null when the page is past the last one. Page 1 of nothing is an empty page. */
export function pageOf<T>(items: readonly T[], page: number, size: number): { items: T[]; total: number; pages: number } | null {
  const pages = Math.max(1, Math.ceil(items.length / size));
  if (!Number.isInteger(page) || page < 1 || page > pages) return null;
  return { items: items.slice((page - 1) * size, page * size), total: items.length, pages };
}
