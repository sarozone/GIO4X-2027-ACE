import { BLOG_CATEGORIES } from "@/lib/blog";
import { isBlogCategory } from "@/lib/server/blog";
import { blogFeedResponse } from "@/lib/server/blog-feed";

/** Read again at most once a minute: posts are published from the console, without a deploy. */
export const revalidate = 60;

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category }));
}

/**
 * One category of the daily blog as RSS 2.0: the same document as the blog's
 * own feed (src/lib/blog-feed.ts), with that category's posts and its page as
 * the channel. An address that is not a category is a real 404.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!isBlogCategory(category)) return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return blogFeedResponse(category);
}
