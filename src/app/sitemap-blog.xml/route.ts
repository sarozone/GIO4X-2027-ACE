import { latest, urlsetResponse } from "@/lib/sitemap";
import { sitemapEntries } from "@/lib/sitemap-data";
import { BLOG_SERIES, blogSeriesPath } from "@/data/blog-series";
import { BLOG_CATEGORIES, blogCategoryPath } from "@/lib/blog";
import { blogPostPath, indexablePosts } from "@/lib/server/blog";
import { indexableBrowsePages } from "@/lib/server/blog-browse";

/** Posts are published from the console, without a deploy: read again at most once a minute. */
export const revalidate = 60;

/**
 * The daily blog: the list page, the page of each category that has a post
 * listed here, the page of each series that has a part listed here (dated by
 * its newest part), the pages by tag and by author (src/lib/server/blog-browse.ts:
 * a tag that only one post carries is left out), and one URL per post that is public, not marked noindex and
 * canonical to itself. `lastmod` is the day the post last changed; a
 * category's is that of its newest post. When the project is not configured,
 * or the posts cannot be read, this is still a valid urlset (the list page
 * alone).
 */
export async function GET() {
  // the tag index, each tag that two posts or more carry, and each author: dated by their newest post, and none when the posts cannot be read
  const [result, browse] = await Promise.all([indexablePosts(), indexableBrowsePages()]);
  const posts = result.state === "ok" ? result.entries : [];
  const [list] = sitemapEntries("blog");
  // the list page changes when its newest post does
  const newest = latest(posts.map((p) => p.lastmod), list.lastmod);
  // a category with no post is not listed: its page says so and asks not to be indexed
  const categories = BLOG_CATEGORIES.flatMap((c) => {
    const days = posts.filter((p) => p.category === c).map((p) => p.lastmod);
    return days.length ? [{ path: blogCategoryPath(c), lastmod: latest(days) }] : [];
  });
  // a series with no part among these posts is not listed either, for the same reason
  const series = BLOG_SERIES.flatMap((s) => {
    const days = posts.filter((p) => s.parts.includes(p.slug)).map((p) => p.lastmod);
    return days.length ? [{ path: blogSeriesPath(s.slug), lastmod: latest(days) }] : [];
  });
  return urlsetResponse([{ ...list, lastmod: newest }, ...categories, ...series, ...browse.map((b) => ({ path: b.path, lastmod: b.lastmod })), ...posts.map((p) => ({ path: blogPostPath(p.slug), lastmod: p.lastmod }))]);
}
