/**
 * The daily blog's feeds, read and answered: the whole blog, or one category.
 *
 * The document itself is built by buildBlogFeed (src/lib/blog-feed.ts), which
 * is text only. Here the posts are read, as the anonymous role like every
 * other public read, and their addresses made absolute. When there is no
 * post, or the posts cannot be read, the feed is still a valid channel with no
 * items; a minute later it is read again.
 */
import { absoluteUrl, site } from "@/config/site";
import { BLOG_CATEGORY_ABOUT, BLOG_CATEGORY_LABEL, BLOG_PATH, blogCategoryPath } from "@/lib/blog";
import { buildBlogFeed, type FeedChannel } from "@/lib/blog-feed";
import { blogPostPath, feedPosts } from "@/lib/server/blog";
import type { BlogCategory } from "@/lib/supabase/types";

const ITEMS = 30;

/** The address of a category's own feed, beside that category's page. */
export const blogCategoryFeedPath = (category: BlogCategory) => `${BLOG_PATH}/category/${category}/feed.xml`;

/** The feed of the whole blog, or of one category when one is given. */
function channel(category: BlogCategory | null): FeedChannel {
  if (!category)
    return {
      title: "GIO4X daily blog",
      link: absoluteUrl(BLOG_PATH),
      self: absoluteUrl(`${BLOG_PATH}/feed.xml`),
      description: "Short notes from GIO4X’s desks. Educational, not advice or a recommendation to trade.",
      copyright: site.legalName,
    };
  return {
    title: `GIO4X daily blog: ${BLOG_CATEGORY_LABEL[category]}`,
    link: absoluteUrl(blogCategoryPath(category)),
    self: absoluteUrl(blogCategoryFeedPath(category)),
    description: `${BLOG_CATEGORY_ABOUT[category]} Educational, not advice or a recommendation to trade.`,
    copyright: site.legalName,
  };
}

export async function blogFeedResponse(category: BlogCategory | null = null): Promise<Response> {
  const result = await feedPosts(ITEMS, category);
  const posts = result.state === "ok" ? result.items : [];
  const xml = buildBlogFeed(
    channel(category),
    posts.map((p) => ({
      title: p.title,
      url: absoluteUrl(blogPostPath(p.slug)),
      published_at: p.published_at,
      byline: p.byline,
      category: BLOG_CATEGORY_LABEL[p.category] ?? p.category,
      excerpt: p.excerpt,
    })),
  );
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=60" } });
}
