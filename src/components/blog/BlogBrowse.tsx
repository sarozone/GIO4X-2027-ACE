import type { ReactNode } from "react";
import { BLOG_SEARCH_PATH, type BrowseCount, SEARCH_MAX_LENGTH } from "@/lib/blog-browse";
import type { BlogCard } from "@/lib/server/blog";
import { BlogTagChip } from "./BlogLinks";
import { BlogCards, Pages } from "./BlogList";

/**
 * The daily blog by tag, by author and by search. Presentation only, as in
 * BlogList: the posts arrive as props, already read and already public.
 */

/**
 * One page of posts as the card grid of the index, under a line that says how
 * many there are. No post is set larger here: the lead belongs to the index.
 */
export function BlogBrowseView({ posts, page, pages, count, hrefFor }: { posts: BlogCard[]; page: number; pages: number; /** the line above the cards: "12 posts tagged …" */ count: ReactNode; hrefFor: (page: number) => string }) {
  return (
    <>
      <p className="num text-xs text-ink-3" role="status">
        {count}
      </p>
      <div className="mt-21">
        <BlogCards posts={posts} />
      </div>
      <Pages page={page} pages={pages} hrefFor={hrefFor} />
    </>
  );
}

/**
 * The search box. A plain form that asks the results page (GET), so it works
 * without a script and a search can be linked to. What is typed is cleaned on
 * the server before anything is compared (blogSearchWords).
 */
export function BlogSearchForm({ id, q = "", className = "" }: { id: string; /** the words being shown, already clean */ q?: string; className?: string }) {
  return (
    <form method="get" action={BLOG_SEARCH_PATH} role="search" aria-label="Search the daily blog" className={`no-print grid max-w-measure gap-13 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end ${className}`}>
      <div className="field">
        <label htmlFor={id}>Search the blog</label>
        <input id={id} name="q" type="search" className="input" defaultValue={q} maxLength={SEARCH_MAX_LENGTH} placeholder="For example: gold, Amsterdam, tokenized" autoComplete="off" spellCheck={false} enterKeyHint="search" />
      </div>
      <button type="submit" className="btn btn-ghost">
        Search
      </button>
    </form>
  );
}

/** Every tag in use as a chip with its count, in the order given (the most used first). */
export function BlogTagList({ tags }: { tags: BrowseCount[] }) {
  return (
    <ul className="flex flex-wrap gap-8" data-blog-tags>
      {tags.map((t) => (
        <li key={t.slug} className="flex">
          <BlogTagChip tag={t.label} count={t.count} />
        </li>
      ))}
    </ul>
  );
}
