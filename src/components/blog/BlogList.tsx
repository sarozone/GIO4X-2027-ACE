import { GeneratedCover } from "@/components/ui/GeneratedCover";
import Link from "next/link";
import { EmptyState } from "@/components/ui/Page";
import { BLOG_CATEGORIES, BLOG_CATEGORY_LABEL, BLOG_FORMAT_LABEL, BLOG_FORMATS, BLOG_PATH, blogCategoryPath } from "@/lib/blog";
import type { BlogCard, BlogCover } from "@/lib/server/blog";
import type { BlogCategory, BlogFormat } from "@/lib/supabase/types";
import { BlogByline } from "./BlogLinks";
import { blogIso, blogShortDate } from "./format";

/**
 * The daily blog as a list. Everything here is presentation: the posts arrive
 * as props, already read and already public. Nothing is invented when there
 * are none: the page says so and points somewhere useful.
 */

export const blogPostHref = (slug: string) => `${BLOG_PATH}/${slug}`;

/** The address of a page of the list. Page one, "all categories" and "every format" add nothing to it. */
export function blogListHref(page = 1, category: BlogCategory | null = null, format: BlogFormat | null = null): string {
  const query = [category ? `category=${category}` : "", format ? `format=${format}` : "", page > 1 ? `page=${page}` : ""].filter(Boolean).join("&");
  return query ? `${BLOG_PATH}?${query}` : BLOG_PATH;
}

/**
 * A cover picture from the blog bucket. The stored size is given to the
 * browser when the row has it, and the frame has a fixed shape either way, so
 * the page does not move when the picture arrives.
 */
export function BlogCoverImage({ cover, eager = false, own = false, className = "" }: { cover: BlogCover; eager?: boolean; own?: boolean; className?: string }) {
  // `own`: the frame takes the picture's own shape (within reason) instead of the list's 16:10, so a wide
  // cover with words drawn on it is shown whole and not cut at the sides
  const shape = own && cover.width && cover.height ? { aspectRatio: String(Math.min(2.6, Math.max(1.2, cover.width / cover.height))) } : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- served from the project's own storage bucket
    <img
      src={cover.src}
      alt={cover.alt}
      {...(cover.width && cover.height ? { width: cover.width, height: cover.height } : {})}
      {...(eager ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
      decoding="async"
      style={shape}
      className={`rounded border border-line bg-surface ${className}`}
    />
  );
}

/** Byline, date and reading time: the line under every post in a list. */
export function BlogCardMeta({ post, date = true, className = "" }: { post: BlogCard; date?: boolean; className?: string }) {
  return (
    <p className={`flex flex-wrap gap-x-13 gap-y-2 text-xs text-ink-3 ${className}`}>
      {/* a link to the author's page; raised, because a row of a series is itself one stretched link */}
      <BlogByline byline={post.byline} raised />
      {date && <time dateTime={blogIso(post.published_at)}>{blogShortDate(post.published_at)}</time>}
      <span className="num">{post.minutes} min read</span>
    </p>
  );
}

/** The category rail. Real addresses, so a filtered list can be linked to and opened in a new tab. */
export function BlogCategoryNav({ current, format = null }: { current: BlogCategory | null; /** the format the list is narrowed to, kept when the category changes */ format?: BlogFormat | null }) {
  const item = "inline-flex min-h-[2.75rem] shrink-0 snap-start items-center whitespace-nowrap border-b-2 px-13 text-sm font-medium transition-colors duration-fast first:pl-0";
  const on = "border-ink text-ink";
  const off = "border-transparent text-ink-3 hover:text-ink";
  return (
    <nav aria-label="Blog categories" className="scroll-x no-print -mx-[var(--gutter)] px-[var(--gutter)]">
      <ul className="flex snap-x gap-5">
        <li>
          <Link href={blogListHref(1, null, format)} aria-current={current ? undefined : "page"} className={`${item} ${current ? off : on}`}>
            All posts
          </Link>
        </li>
        {BLOG_CATEGORIES.map((c) => (
          <li key={c}>
            <Link href={blogListHref(1, c, format)} aria-current={current === c ? "page" : undefined} className={`${item} ${current === c ? on : off}`}>
              {BLOG_CATEGORY_LABEL[c]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The formats as a second, smaller rail under the categories: what kind of
 * piece (a note, an explainer, a guide) rather than what it is about. Real
 * addresses like the rail above, and the category chosen there is kept.
 */
export function BlogFormatNav({ current, category = null }: { current: BlogFormat | null; category?: BlogCategory | null }) {
  const item = "chip inline-flex min-h-[2.125rem] shrink-0 snap-start items-center whitespace-nowrap transition-colors duration-fast";
  const on = "!border-ink !text-ink";
  const off = "hover:border-line-strong hover:text-ink";
  return (
    <nav aria-label="Blog formats" className="scroll-x no-print -mx-[var(--gutter)] px-[var(--gutter)]">
      <ul className="flex snap-x items-center gap-8">
        <li>
          <Link href={blogListHref(1, category)} aria-current={current ? undefined : "page"} className={`${item} ${current ? off : on}`}>
            Every format
          </Link>
        </li>
        {BLOG_FORMATS.map((f) => (
          <li key={f}>
            <Link href={blogListHref(1, category, f)} aria-current={current === f ? "page" : undefined} className={`${item} ${current === f ? on : off}`}>
              {BLOG_FORMAT_LABEL[f]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The pages of the categories as a row of links: every category, or every one
 * but the page being read. The rail above filters the index in place; these
 * lead to each category's own page.
 */
export function BlogCategoryLinks({ id, label = "Browse by category", except = null }: { id: string; label?: string; except?: BlogCategory | null }) {
  return (
    <nav aria-labelledby={id} className="no-print">
      <h2 id={id} className="label">
        {label}
      </h2>
      <ul className="mt-8 flex flex-wrap gap-x-34 gap-y-2">
        {BLOG_CATEGORIES.filter((c) => c !== except).map((c) => (
          <li key={c}>
            <Link href={blogCategoryPath(c)} className="h4 inline-flex min-h-[2.75rem] items-center transition-colors duration-fast hover:text-accent">
              {BLOG_CATEGORY_LABEL[c]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * What kind of piece a post is, and what it is about: the two chips on a card.
 * With `link`, the category is a link to that category's page; it is raised
 * above the card's own link (see BlogCards), so it can be followed from a card.
 */
export function BlogChips({ post, link = false, className = "" }: { post: Pick<BlogCard, "format" | "category">; link?: boolean; className?: string }) {
  return (
    <span className={`flex flex-wrap gap-5 ${className}`}>
      <span className="chip" data-chip="format">
        {BLOG_FORMAT_LABEL[post.format]}
      </span>
      {link ? (
        <Link href={blogCategoryPath(post.category)} className="chip relative z-[1] transition-colors duration-fast hover:border-line-strong hover:text-ink" data-chip="category">
          {BLOG_CATEGORY_LABEL[post.category]}
        </Link>
      ) : (
        <span className="chip" data-chip="category">
          {BLOG_CATEGORY_LABEL[post.category]}
        </span>
      )}
    </span>
  );
}

/**
 * The first post of page one, set larger: the post the editors chose to lead
 * when there is one, otherwise the first pinned post, otherwise the newest.
 */
function Featured({ post }: { post: BlogCard }) {
  const href = blogPostHref(post.slug);
  const standing = post.lead ? "Lead" : post.pinned ? "Pinned" : "Latest";
  return (
    <article className="grid items-center gap-34 border-b border-line pb-34 lg:grid-cols-phi lg:gap-55 lg:pb-55" aria-labelledby="blog-latest-post">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        {/* a post without a picture of its own is given a drawn cover, worked out from its address */}
        {post.cover ? <BlogCoverImage cover={post.cover} own className="aspect-[16/10] w-full object-cover" /> : <GeneratedCover seed={post.slug} className="aspect-[16/10] w-full" />}
      </Link>
      <div>
        <p className="label">{standing}</p>
        <BlogChips post={post} link className="mt-13" />
        <h3 id="blog-latest-post" className="h2 mt-13 max-w-[22ch] [overflow-wrap:anywhere]">
          <Link href={href} className="transition-colors duration-fast hover:text-accent">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="lead mt-21 max-w-measure">{post.excerpt}</p>}
        <BlogCardMeta post={post} className="mt-21" />
        <Link href={href} className="btn btn-primary no-print mt-34">
          Read the post
        </Link>
      </div>
    </article>
  );
}

/**
 * Every other post, as cards: three to a row on a desk, two on a tablet, one
 * on a phone. A card is its cover (a drawn one when the post has no picture),
 * the two chips, the date, and the title and the excerpt held to two lines
 * each, so that every card in a row is the same height.
 *
 * The whole card leads to the post: the link is the title, stretched over the
 * card (its ::after covers the list item), and the focus ring is drawn there.
 * Only the category chip stands above it, as a link of its own, because a
 * link cannot contain another.
 *
 * `columns` is for a place narrower than the index (the foot of a post).
 */
export function BlogCards({ posts, columns = "sm:grid-cols-2 lg:grid-cols-3" }: { posts: BlogCard[]; columns?: string }) {
  return (
    <ul className={`grid gap-x-21 gap-y-34 ${columns}`} data-blog-cards>
      {posts.map((p) => (
        <li key={p.slug} className="relative grid">
          <div className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors duration-fast hover:border-line-strong">
            {p.cover ? (
              <BlogCoverImage cover={p.cover} own className="aspect-[16/10] w-full !rounded-none border-0 border-b object-cover" />
            ) : (
              <GeneratedCover seed={p.slug} className="aspect-[16/10] w-full !rounded-none border-b border-line" />
            )}
            <span className="flex flex-1 flex-col gap-13 p-21">
              <span className="flex flex-wrap items-center justify-between gap-x-13 gap-y-8">
                <BlogChips post={p} link />
                {p.pinned && <span className="label text-ink-2">Pinned</span>}
              </span>
              <time dateTime={blogIso(p.published_at)} className="num text-xs text-ink-3">
                {blogShortDate(p.published_at)}
              </time>
              <span role="heading" aria-level={3} className="h4 line-clamp-2 transition-colors duration-fast [overflow-wrap:anywhere] group-hover:text-accent">
                <Link
                  href={blogPostHref(p.slug)}
                  className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[3px] focus-visible:after:outline-accent"
                >
                  {p.title}
                </Link>
              </span>
              {p.excerpt && <span className="line-clamp-2 text-sm text-ink-2">{p.excerpt}</span>}
              <span className="mt-auto flex flex-wrap items-center gap-x-13 gap-y-2 pt-8 text-xs text-ink-3">
                <BlogByline byline={p.byline} raised />
                <span className="num">{p.minutes} min read</span>
              </span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** "Newer posts", "Page 2 of 5", "Older posts". Also under the lists by tag, by author and of a search (BlogBrowse). */
export function Pages({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (page: number) => string }) {
  if (pages <= 1) return null;
  const link = "link inline-flex min-h-[2.75rem] items-center text-sm font-medium";
  return (
    <nav aria-label="Pages of posts" className="no-print mt-34 grid grid-cols-[1fr_auto_1fr] items-center gap-13">
      <span>
        {page > 1 && (
          <Link href={hrefFor(page - 1)} rel="prev" className={link}>
            Newer posts
          </Link>
        )}
      </span>
      <p className="num text-sm text-ink-3">
        Page {page} of {pages}
      </p>
      <span className="text-right">
        {page < pages && (
          <Link href={hrefFor(page + 1)} rel="next" className={link}>
            Older posts
          </Link>
        )}
      </span>
    </nav>
  );
}

/**
 * One page of posts. `hrefFor` is the address of another page of the same
 * list; left out, it is the index with its query string, as it always was.
 */
export function BlogListView({
  posts,
  page,
  pages,
  total,
  category,
  format = null,
  hrefFor = (n) => blogListHref(n, category, format),
}: {
  posts: BlogCard[];
  page: number;
  pages: number;
  total: number;
  category: BlogCategory | null;
  /** the format the list is narrowed to (the index only); left out, nothing here differs */
  format?: BlogFormat | null;
  hrefFor?: (page: number) => string;
}) {
  const feature = page === 1 ? posts[0] : undefined;
  const rest = feature ? posts.slice(1) : posts;
  return (
    <>
      <p className="num text-xs text-ink-3">
        {total} {total === 1 ? "post" : "posts"}
        {category ? ` in ${BLOG_CATEGORY_LABEL[category]}` : ""}
        {format ? `, format: ${BLOG_FORMAT_LABEL[format]}` : ""}, newest first
      </p>
      <div className="mt-21">
        {feature && <Featured post={feature} />}
        {rest.length > 0 && (
          <div className={feature ? "mt-34 lg:mt-55" : ""}>
            {feature && <p className="label mb-21">More from the blog</p>}
            <BlogCards posts={rest} />
          </div>
        )}
      </div>
      <Pages page={page} pages={pages} hrefFor={hrefFor} />
    </>
  );
}

/** Nothing has been published (at all, or under one category). Said plainly, with somewhere to go. */
export function BlogEmpty({ category = null, format = null }: { category?: BlogCategory | null; format?: BlogFormat | null }) {
  const under = category ? ` under ${BLOG_CATEGORY_LABEL[category]}` : "";
  return (
    <EmptyState
      title={format ? `No post of the format “${BLOG_FORMAT_LABEL[format]}” has been published${under} yet.` : category ? `No post has been published under ${BLOG_CATEGORY_LABEL[category]} yet.` : "No post has been published yet."}
      actions={
        <>
          {(category || format) && (
            <Link href={BLOG_PATH} className="btn btn-ghost">
              All posts
            </Link>
          )}
          <Link href="/intelligence" className="btn btn-ghost">
            GIO4X Intelligence
          </Link>
          <Link href="/academy" className="btn btn-ghost">
            The Academy
          </Link>
        </>
      }
    >
      The daily blog is written by GIO4X staff, and each post appears here when it is published. Until the first one is, the longer pieces in GIO4X Intelligence and the lessons in the Academy are open.
    </EmptyState>
  );
}

/** The posts could not be read: said as that, never as "there are none". */
export function BlogUnavailable() {
  return (
    <p className="max-w-measure text-ink-2" role="status">
      Posts could not be loaded just now. Please reload the page in a moment. GIO4X Intelligence and the Academy do not depend on this and are open.
    </p>
  );
}

/** A few posts as compact cells, for a section on another page. */
export function BlogCompactList({ posts }: { posts: BlogCard[] }) {
  return (
    <ul className="grid border-l border-t border-line md:grid-cols-3">
      {posts.map((p) => (
        <li key={p.slug} className="border-b border-r border-line">
          <Link href={blogPostHref(p.slug)} className="group flex h-full flex-col gap-13 p-21 transition-colors duration-fast hover:bg-surface">
            <span className="flex flex-wrap items-baseline justify-between gap-x-13 gap-y-2">
              <span className="label">{BLOG_CATEGORY_LABEL[p.category]}</span>
              <time dateTime={blogIso(p.published_at)} className="num text-xs text-ink-3">
                {blogShortDate(p.published_at)}
              </time>
            </span>
            <span role="heading" aria-level={3} className="h4 block transition-colors duration-fast [overflow-wrap:anywhere] group-hover:text-accent">
              {p.title}
            </span>
            {p.excerpt && <span className="line-clamp-3 text-sm text-ink-2">{p.excerpt}</span>}
            <span className="mt-auto flex flex-wrap gap-x-13 gap-y-2 text-xs text-ink-3">
              <span>{p.byline}</span>
              <span className="num">{p.minutes} min read</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
