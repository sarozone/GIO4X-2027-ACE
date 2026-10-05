import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPostHref, BlogUnavailable } from "@/components/blog/BlogList";
import { BlogSeriesTimeline } from "@/components/blog/BlogSeries";
import { blogIso } from "@/components/blog/format";
import { BLOG_FEED } from "@/components/blog/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { EmptyState, NextSteps, PageHero } from "@/components/ui/Page";
import { absoluteUrl } from "@/config/site";
import { BLOG_SERIES, blogSeriesPath, getBlogSeries, numberedParts, type BlogSeries } from "@/data/blog-series";
import { BLOG_PATH } from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { seriesPosts } from "@/lib/server/blog";

type Props = { params: Promise<{ series: string }> };

/**
 * One series of the daily blog as a page of its own: its parts in order, as a
 * timeline. Which posts make a series is a typed list (src/data/blog-series.ts);
 * the posts themselves are read as the index reads them, as the anonymous
 * role, so a part that is not public is not here and the others keep their
 * numbers.
 *
 * The series are known at build time; the posts are not. As everywhere on the
 * blog nothing is frozen: what the page reads is kept for a minute and
 * refreshed by the console when a post is saved (src/lib/server/blog.ts). An
 * address that is not a series is a real 404.
 *
 * This folder has no page of its own, so `/intelligence/blog/series` is still
 * the address of a post with that slug, should one ever be written.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return BLOG_SERIES.map((s) => ({ series: s.slug }));
}

const describe = (s: BlogSeries) => `${s.title}: ${s.subtitle.charAt(0).toLowerCase()}${s.subtitle.slice(1)}. ${s.about} A series of ${s.parts.length} parts on the GIO4X daily blog: educational and never advice.`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const series = getBlogSeries((await params).series);
  if (!series) return {};
  // the same kept read the page makes; a series with no part published yet is kept out of search until it has one
  const result = await seriesPosts(series.parts);
  const path = blogSeriesPath(series.slug);
  return {
    ...pageMeta({ title: `${series.title}: a series on the daily blog`, description: describe(series), path, index: result.state === "none" ? false : undefined }),
    alternates: { canonical: path, types: { "application/rss+xml": [BLOG_FEED] } },
  };
}

export default async function BlogSeriesPage({ params }: Props) {
  const series = getBlogSeries((await params).series);
  if (!series) notFound();
  const result = await seriesPosts(series.parts);
  const parts = result.state === "ok" ? numberedParts(series, result.posts) : [];
  const path = blogSeriesPath(series.slug);
  const minutes = parts.reduce((sum, p) => sum + p.post.minutes, 0);

  return (
    <>
      <JsonLd
        data={{
          ...webPageSchema({ path, name: `${series.title}: GIO4X daily blog`, description: describe(series), type: "CollectionPage" }),
          isPartOf: { "@id": `${absoluteUrl(BLOG_PATH)}#blog` },
          ...(parts.length
            ? {
                hasPart: parts.map(({ part, post }) => ({
                  "@type": "BlogPosting",
                  headline: post.title,
                  url: absoluteUrl(blogPostHref(post.slug)),
                  datePublished: blogIso(post.published_at),
                  author: { "@type": "Organization", name: post.byline },
                  position: part,
                })),
              }
            : {}),
        }}
      />
      <PageHero
        quiet
        crumbs={[
          { name: "Intelligence", href: "/intelligence" },
          { name: "Daily blog", href: BLOG_PATH },
          { name: series.title, href: path },
        ]}
        eyebrow="Daily blog · Series"
        title={series.title}
        lead={
          <>
            <span className="mb-13 block font-display text-2xl text-on-night">{series.subtitle}</span>
            {series.about}
          </>
        }
      />

      <section className="section-quiet" aria-labelledby="series-parts">
        <div className="wrap">
          <h2 id="series-parts" className="sr-only">
            The parts of {series.title}, in order
          </h2>
          {parts.length > 0 ? (
            <>
              <p className="num text-xs text-ink-3">
                {parts.length === series.parts.length ? `${series.parts.length} parts` : `${parts.length} of ${series.parts.length} parts published`}, in order · about {minutes} min to read in all
              </p>
              <div className="mt-21">
                <BlogSeriesTimeline parts={parts} />
              </div>
            </>
          ) : result.state === "failed" ? (
            <BlogUnavailable />
          ) : (
            <EmptyState
              title="No part of this series has been published yet."
              actions={
                <Link href={BLOG_PATH} className="btn btn-ghost">
                  All posts
                </Link>
              }
            >
              Each part appears here, in its place, when it is published.
            </EmptyState>
          )}
          <p className="mt-34 flex flex-wrap gap-x-21 text-sm">
            <Link href={BLOG_PATH} className="link inline-flex min-h-[2.75rem] items-center">
              All posts
            </Link>
            <a href={BLOG_FEED.url} className="link inline-flex min-h-[2.75rem] items-center" type="application/rss+xml">
              RSS feed
            </a>
            <Link href="/trust/editorial-standards" className="link inline-flex min-h-[2.75rem] items-center">
              Editorial standards
            </Link>
          </p>
        </div>
      </section>

      <NextSteps
        items={[
          { kind: "Daily blog", label: "All posts", href: BLOG_PATH, note: "Every post, newest first." },
          { kind: "History", label: "Market history", href: "/history", note: "Crashes and bubbles, 1637 to 2020." },
          { kind: "Learn", label: "Academy", href: "/academy", note: "Lessons in order, from first principles." },
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Every term, defined plainly." },
        ]}
      />
    </>
  );
}
