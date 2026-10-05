import { blogFeedResponse } from "@/lib/server/blog-feed";

/** Read again at most once a minute: posts are published from the console, without a deploy. */
export const revalidate = 60;

/**
 * The daily blog as RSS 2.0. Summaries only: the full text lives on the site.
 * When there is no post, or the posts cannot be read, the feed is still a
 * valid channel with no items; a minute later it is read again.
 *
 * The document is built in src/lib/blog-feed.ts, which the feed of each
 * category (category/[category]/feed.xml) shares.
 */
export async function GET() {
  return blogFeedResponse();
}
