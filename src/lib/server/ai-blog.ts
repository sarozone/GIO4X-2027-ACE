/**
 * GIO4X AI: the blog as a source.
 *
 * The published, public posts, read through the blog's own public reader
 * (src/lib/server/blog.ts): as the anonymous role, so the database decides
 * what may be seen, and a draft, a scheduled post or a withdrawn one is never
 * among them. Each post becomes a few passages (src/lib/ai.ts, blogPassages)
 * of kind "blog", with the post's address as their source.
 *
 * Not read per question. What is read is kept with the blog's own cache: for
 * BLOG_REVALIDATE seconds, under BLOG_CACHE_TAG, so that publishing or
 * withdrawing a post in GIO4X Control refreshes it as it refreshes the blog's
 * pages. A read that fails is thrown through the cache, so it is never kept,
 * and the caller (ai-corpus.ts) then answers from the site's other pages
 * exactly as it did before there was a blog to read.
 */
import "server-only";
import { unstable_cache } from "next/cache";
import { AI_LIMITS, blogPassages, type Passage } from "@/lib/ai";
import { BLOG_PAGE_SIZE } from "@/lib/blog";
import { BLOG_CACHE_TAG, BLOG_REVALIDATE, blogPostPath, getPost, listPosts } from "@/lib/server/blog";

class BlogUnread extends Error {}

/** How many posts are asked for at once. */
const TOGETHER = 6;

async function read(): Promise<Passage[]> {
  const slugs: string[] = [];
  for (let page = 1; slugs.length < AI_LIMITS.blogPosts && page <= Math.ceil(AI_LIMITS.blogPosts / BLOG_PAGE_SIZE); page++) {
    const list = await listPosts({ page });
    if (list.state === "failed") throw new BlogUnread();
    if (list.state !== "ok") break;
    for (const card of list.posts) if (!slugs.includes(card.slug)) slugs.push(card.slug);
    if (page >= list.pages) break;
  }

  const out: Passage[] = [];
  const wanted = slugs.slice(0, AI_LIMITS.blogPosts);
  for (let i = 0; i < wanted.length; i += TOGETHER) {
    const batch = await Promise.all(wanted.slice(i, i + TOGETHER).map((slug) => getPost(slug)));
    batch.forEach((one) => {
      // a post that has gone since the list was read, or that could not be read, is left out
      if (one.state !== "ok") return;
      const { post } = one;
      out.push(...blogPassages({ url: blogPostPath(post.slug), title: post.title, excerpt: post.excerpt, body: post.body, published: post.published_at }));
    });
  }
  return out;
}

const cached = unstable_cache(read, ["ai-blog-passages"], { revalidate: BLOG_REVALIDATE, tags: [BLOG_CACHE_TAG] });

/** The blog's passages, as kept. Rejects when the blog could not be read; resolves to [] when nothing is published. */
export function aiBlogPassages(): Promise<Passage[]> {
  return cached();
}
