import Link from "next/link";
import { GeneratedCover } from "@/components/ui/GeneratedCover";
import { BLOG_SERIES, blogSeriesPath, type BlogSeries, type BlogSeriesPlace } from "@/data/blog-series";
import type { BlogCard } from "@/lib/server/blog";
import { BlogCardMeta, BlogCoverImage, blogPostHref } from "./BlogList";

/**
 * A series of the daily blog (src/data/blog-series.ts), as it is shown: the
 * timeline on the series' own page, the line at the head of each part, the
 * part before and after at its foot, and the band on the index. Presentation
 * only: the parts arrive as props, already read and already public, each with
 * the number it has in the series.
 */

export type BlogSeriesPart = { part: number; post: BlogCard };
/** What stands at the foot of a part: the public part before it and the one after, either of which may be missing. */
type Step = { part: number; post: Pick<BlogCard, "slug" | "title"> };
export type BlogSeriesAround = { previous: Step | null; next: Step | null };

const two = (n: number) => String(n).padStart(2, "0");

/** "Part 3 of 15 · The History of Trading", at the head of a part: the way to the whole series. */
export function BlogSeriesLine({ place, className = "" }: { place: BlogSeriesPlace; className?: string }) {
  return (
    <p className={`no-print text-sm text-ink-3 ${className}`} data-blog-series>
      <Link href={blogSeriesPath(place.series.slug)} className="link inline-flex min-h-[2.75rem] items-center">
        <span className="num">
          Part {place.part} of {place.of}
        </span>
        <span aria-hidden className="mx-8">
          ·
        </span>
        {place.series.title}
      </Link>
    </p>
  );
}

function StepLink({ part, post, kind, align = "left" }: Step & { kind: string; align?: "left" | "right" }) {
  return (
    <Link href={blogPostHref(post.slug)} className={`group flex min-h-[2.75rem] flex-col gap-5 py-21 transition-colors duration-fast hover:bg-surface sm:px-13 ${align === "right" ? "sm:items-end sm:text-right" : ""}`}>
      <span className="label">
        {kind} · <span className="num">Part {part}</span>
      </span>
      <span className="h4 transition-colors duration-fast [overflow-wrap:anywhere] group-hover:text-accent">{post.title}</span>
    </Link>
  );
}

/**
 * The foot of a part: the part before, the part after, and the series itself.
 * These are the parts of the series, in its order; the posts published just
 * before and just after this one stand beneath, as on every post.
 */
export function BlogSeriesNav({ place, around }: { place: BlogSeriesPlace; around: BlogSeriesAround }) {
  const { previous, next } = around;
  return (
    <nav aria-label={`${place.series.title}: the parts before and after`} className="no-print mt-55 border-t border-line-strong" data-blog-series-nav>
      <p className="label pt-21">
        {place.series.title} · <span className="num">Part {place.part} of {place.of}</span>
      </p>
      {(previous || next) && (
        <div className="mt-8 grid border-y border-line sm:grid-cols-2">
          <div className={previous && next ? "border-b border-line sm:border-b-0 sm:border-r" : ""}>{previous && <StepLink part={previous.part} post={previous.post} kind="Previous part" />}</div>
          <div>{next && <StepLink part={next.part} post={next.post} kind="Next part" align="right" />}</div>
        </div>
      )}
      <Link href={blogSeriesPath(place.series.slug)} className="go mt-13 min-h-[2.75rem]">
        The whole series
      </Link>
    </nav>
  );
}

/**
 * The series as a timeline: every public part, in order, with its number, its
 * cover (a drawn one when the post has no picture), its title, its excerpt
 * and how long it takes to read. A part that is not public is not here, and
 * the numbers of the others are their own.
 */
export function BlogSeriesTimeline({ parts }: { parts: BlogSeriesPart[] }) {
  return (
    <ol className="grid" data-blog-series-timeline>
      {parts.map(({ part, post }, i) => (
        <li key={post.slug} className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-x-13 sm:grid-cols-[3.4375rem_minmax(0,1fr)] sm:gap-x-21">
          {/* the line of the timeline: a number, and a rule down to the next part */}
          <div className="flex flex-col items-center" aria-hidden>
            <span className="num pt-21 text-sm font-semibold text-ink-3">{two(part)}</span>
            {i < parts.length - 1 && <span className="mt-8 w-px flex-1 bg-line" />}
          </div>
          <article className="group relative grid items-start gap-x-21 gap-y-13 border-b border-line py-21 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]" aria-labelledby={`part-${part}`}>
            {post.cover ? <BlogCoverImage cover={post.cover} own className="aspect-[16/10] w-full object-cover" /> : <GeneratedCover seed={post.slug} className="aspect-[16/10] w-full" />}
            <div>
              <p className="label">
                Part <span className="num">{part}</span>
              </p>
              <h3 id={`part-${part}`} className="h4 mt-5 [overflow-wrap:anywhere]">
                {/* the whole row leads to the part: the link is the title, stretched over the row */}
                <Link
                  href={blogPostHref(post.slug)}
                  className="transition-colors duration-fast after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[3px] focus-visible:after:outline-accent group-hover:text-accent"
                >
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && <p className="mt-8 max-w-measure text-sm text-ink-2">{post.excerpt}</p>}
              <BlogCardMeta post={post} className="mt-13" />
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}

/** The series there are, as a band on the index: each leads to its own page. */
export function BlogSeriesBand({ series = BLOG_SERIES }: { series?: readonly BlogSeries[] }) {
  if (!series.length) return null;
  return (
    <nav aria-labelledby="blog-series" className="no-print">
      <h2 id="blog-series" className="label">
        Read in order
      </h2>
      <ul className="mt-8 grid gap-13 md:grid-cols-2">
        {series.map((s) => (
          <li key={s.slug}>
            <Link href={blogSeriesPath(s.slug)} className="group flex h-full flex-col gap-5 rounded-md border border-line bg-surface p-21 transition-colors duration-fast hover:border-line-strong">
              <span className="label">
                Series · <span className="num">{s.parts.length} parts</span>
              </span>
              <span className="h4 transition-colors duration-fast group-hover:text-accent">{s.title}</span>
              <span className="text-sm text-ink-2">{s.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
