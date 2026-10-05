/**
 * The daily blog: what the public pages and the console share.
 *
 * Posts are rows in `blog_posts` (supabase/migrations/0011_blog.sql), written
 * in GIO4X Control. A post is public when its status is "published" and its
 * publication time has passed; the database enforces that for the anonymous
 * role, so nothing here is a gate.
 */
import type { BlogCategory, BlogFormat, BlogStatus } from "@/lib/supabase/types";

/** Must equal `blog_posts_category_valid` in 0011_blog.sql. */
export const BLOG_CATEGORIES = ["market-notes", "education", "platform", "company"] as const satisfies readonly BlogCategory[];

export const BLOG_CATEGORY_LABEL: Record<BlogCategory, string> = {
  "market-notes": "Market notes",
  education: "Education",
  platform: "Platforms",
  company: "GIO4X",
};

/** What each category covers, in one sentence: the standfirst of its page and that page's description. */
export const BLOG_CATEGORY_ABOUT: Record<BlogCategory, string> = {
  "market-notes": "Short notes on what happened in the markets and what lay behind it, written after the event and never as a forecast.",
  education: "How trading works, one idea at a time: the terms, the arithmetic and the mechanics behind an order.",
  platform: "The trading platforms offered through GIO4X: what they do, how to use them and what has changed in them.",
  company: "Posts about the firm itself: what has changed at GIO4X and how it works.",
};

/**
 * What kind of piece a post is, beside its category (which says what it is
 * about). Must equal `blog_posts_format_valid` in 0031_blog_journal.sql.
 */
export const BLOG_FORMATS = ["note", "explainer", "guide", "how-to", "analysis", "news"] as const satisfies readonly BlogFormat[];

export const BLOG_FORMAT_LABEL: Record<BlogFormat, string> = {
  note: "Note",
  explainer: "Explainer",
  guide: "Guide",
  "how-to": "How-to",
  analysis: "Analysis",
  news: "News",
};

/** What a post is when nothing says otherwise: every post written before formats existed. */
export const DEFAULT_BLOG_FORMAT: BlogFormat = "note";

export const isBlogFormat = (value: unknown): value is BlogFormat => typeof value === "string" && (BLOG_FORMATS as readonly string[]).includes(value);

export const BLOG_STATUSES = ["draft", "review", "published", "archived"] as const satisfies readonly BlogStatus[];

export const BLOG_STATUS_LABEL: Record<BlogStatus, string> = {
  draft: "Draft",
  review: "Ready for review",
  published: "Published",
  archived: "Archived",
};

export const BLOG_PATH = "/intelligence/blog";
export const BLOG_BUCKET = "blog";
export const BLOG_PAGE_SIZE = 12;

/**
 * The page of one category. It sits in a folder of its own beside the posts
 * (`category/[category]`), so it takes no post's address: a post whose slug is
 * "category" is still at BLOG_PATH/category, where this folder has no page.
 */
export function blogCategoryPath(category: BlogCategory, page = 1): string {
  return `${BLOG_PATH}/category/${category}${page > 1 ? `?page=${page}` : ""}`;
}

/** How many posts stand under "Related posts" at the foot of a post, at most. */
export const BLOG_RELATED_COUNT = 3;
/** How many of the newest other posts are read to choose them from. */
export const BLOG_RELATED_POOL = 36;

/** Limits. Must equal the checks in 0011_blog.sql. */
export const BLOG_LIMITS = {
  slug: 96,
  title: 140,
  excerpt: 320,
  body: 60000,
  tags: 8,
  tag: 32,
  byline: 80,
  /** `blog_posts_reviewed_by_valid` in 0031_blog_journal.sql */
  reviewedBy: 80,
  seoTitle: 70,
  seoDescription: 170,
  canonical: 300,
  coverAlt: 200,
  coverCaption: 300,
  coverCredit: 120,
  correction: 500,
  /** bytes: the bucket refuses anything larger */
  image: 4 * 1024 * 1024,
} as const;

export const BLOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const isBlogSlug = (value: unknown): value is string => typeof value === "string" && value.length >= 3 && value.length <= BLOG_LIMITS.slug && SLUG.test(value);

/** A title as an address: lower case, ASCII letters and digits, single hyphens. */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, BLOG_LIMITS.slug)
    .replace(/-+$/g, "");
}

/** A path inside the bucket, as the database accepts it. */
const IMAGE_PATH = /^[a-z0-9][a-z0-9/_.-]*$/;
export const isBlogImagePath = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 200 && IMAGE_PATH.test(value) && !value.includes("..");

/**
 * The public address of a picture in the blog bucket, or null when the path is
 * not one or the project is not configured. Only this bucket is ever linked:
 * a post cannot point an <img> at another host.
 */
export function blogImageUrl(path: string): string | null {
  if (!isBlogImagePath(path)) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  try {
    return `${new URL(base).origin}/storage/v1/object/public/${BLOG_BUCKET}/${path}`;
  } catch {
    return null;
  }
}

/** Whether a post is in front of the public at this moment. */
export function isLive(post: { status: BlogStatus; published_at: string | null }, now: number = Date.now()): boolean {
  return post.status === "published" && !!post.published_at && Date.parse(post.published_at) <= now;
}

/** Minutes to read at about 220 words a minute, at least one. */
export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
