import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCategoryLinks, BlogCategoryNav, BlogEmpty, BlogFormatNav, blogListHref, BlogListView, blogPostHref, BlogUnavailable } from "@/components/blog/BlogList";
import { BlogSearchForm } from "@/components/blog/BlogBrowse";
import { BlogSeriesBand } from "@/components/blog/BlogSeries";
import { blogIso } from "@/components/blog/format";
import { BLOG_FEED } from "@/components/blog/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { absoluteUrl } from "@/config/site";
import { BLOG_CATEGORY_LABEL, BLOG_FORMAT_LABEL, BLOG_PATH, isBlogFormat } from "@/lib/blog";
import { BLOG_TAGS_PATH } from "@/lib/blog-browse";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { BLOG_MAX_PAGE, isBlogCategory, listPosts } from "@/lib/server/blog";
import type { BlogCategory, BlogFormat } from "@/lib/supabase/types";

type Search = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const FEED = BLOG_FEED;
const description = "The GIO4X daily blog: short notes from GIO4X’s desks on markets, platforms and the firm, published by staff. Dated, signed by a desk, educational and never advice.";

/**
 * Posts are written in GIO4X Control and change without a deploy, so nothing
 * here is frozen at build time: the page is rendered on demand and what it
 * reads is kept for a minute (see src/lib/server/blog.ts).
 */
export const revalidate = 60;

/**
 * The query string, validated. `?page=` is a whole number from 1; `?category=`
 * is one of the four categories; `?format=` is one of the six formats.
 * Anything else is not an address of this page.
 */
function readQuery(q: Record<string, string | string[] | undefined>): { page: number; category: BlogCategory | null; format: BlogFormat | null } | null {
  let page = 1;
  if (q.page !== undefined) {
    if (typeof q.page !== "string" || !/^[1-9]\d{0,3}$/.test(q.page)) return null;
    page = Number(q.page);
    if (page > BLOG_MAX_PAGE) return null;
  }
  let category: BlogCategory | null = null;
  if (q.category !== undefined) {
    if (!isBlogCategory(q.category)) return null;
    category = q.category;
  }
  let format: BlogFormat | null = null;
  if (q.format !== undefined) {
    if (!isBlogFormat(q.format)) return null;
    format = q.format;
  }
  return { page, category, format };
}

export async function generateMetadata({ searchParams }: Search): Promise<Metadata> {
  const query = readQuery(await searchParams);
  if (!query) return { title: "Daily blog", robots: { index: false, follow: true } };
  const { page, category, format } = query;
  const title = `Daily blog${category ? `: ${BLOG_CATEGORY_LABEL[category]}` : ""}${format ? ` (${BLOG_FORMAT_LABEL[format]})` : ""}${page > 1 ? `, page ${page}` : ""}`;
  return {
    // a page of the list is its own page; a category or a format is a filter of the same posts and is left out of search
    ...pageMeta({ title, description, path: blogListHref(page, category, format), index: category || format ? false : undefined }),
    alternates: { canonical: blogListHref(page, category, format), types: { "application/rss+xml": [FEED] } },
  };
}

export default async function BlogPage({ searchParams }: Search) {
  const query = readQuery(await searchParams);
  if (!query) notFound();
  const { page, category, format } = query;
  const result = await listPosts({ page, category, format });
  if (result.state === "out-of-range") notFound();

  return (
    <>
      <JsonLd
        data={{
          ...webPageSchema({ path: BLOG_PATH, name: "GIO4X daily blog", description, type: "Blog" }),
          "@id": `${absoluteUrl(BLOG_PATH)}#blog`,
          ...(result.state === "ok"
            ? {
                blogPost: result.posts.map((p) => ({
                  "@type": "BlogPosting",
                  headline: p.title,
                  url: absoluteUrl(blogPostHref(p.slug)),
                  datePublished: blogIso(p.published_at),
                  author: { "@type": "Organization", name: p.byline },
                })),
              }
            : {}),
        }}
      />
      <PageHero
        crumbs={[
          { name: "Intelligence", href: "/intelligence" },
          { name: "Daily blog", href: BLOG_PATH },
        ]}
        eyebrow="Daily blog"
        title="The daily blog"
        lead={
          <>
            {/* the blog's caption, given by the owner */}
            <span className="mb-13 block font-display text-2xl text-on-night">One Market. One Story. Every Day.</span>
            Short notes from GIO4X’s desks, written and published by staff. They explain what happened or how something works. They are educational, and they are not advice or a recommendation to trade.
          </>
        }
      />

      <section className="section-quiet" aria-labelledby="blog-posts">
        <div className="wrap">
          <h2 id="blog-posts" className="sr-only">
            {category ? `Posts in ${BLOG_CATEGORY_LABEL[category]}` : "Posts"}
            {page > 1 ? `, page ${page}` : ""}
          </h2>
          {/* a search of the titles, excerpts and tags: it asks its own page (search/page.tsx), and this list is not changed by it */}
          <BlogSearchForm id="blog-search" className="mb-21" />
          <BlogCategoryNav current={category} format={format} />
          {/* what kind of piece, beside what it is about: a second filter of the same list */}
          <div className="mt-13">
            <BlogFormatNav current={format} category={category} />
          </div>
          <div className="mt-34">
            {result.state === "ok" ? (
              <BlogListView posts={result.posts} page={result.page} pages={result.pages} total={result.total} category={category} format={format} />
            ) : result.state === "none" ? (
              <BlogEmpty category={category} format={format} />
            ) : (
              <BlogUnavailable />
            )}
          </div>
          {/* the series: posts written to be read in order, each series on a page of its own */}
          <div className="mt-34 border-t border-line pt-21">
            <BlogSeriesBand />
          </div>
          {/* the rail above filters this page; these lead to each category's own page */}
          <div className="mt-34 border-t border-line pt-21">
            <BlogCategoryLinks id="blog-by-category" />
          </div>
          <p className="mt-34 flex flex-wrap gap-x-21 text-sm">
            <a href={FEED.url} className="link inline-flex min-h-[2.75rem] items-center" type="application/rss+xml">
              RSS feed
            </a>
            <Link href={BLOG_TAGS_PATH} className="link inline-flex min-h-[2.75rem] items-center">
              All tags
            </Link>
            <Link href="/trust/editorial-standards" className="link inline-flex min-h-[2.75rem] items-center">
              Editorial standards
            </Link>
          </p>
        </div>
      </section>

      <NextSteps
        items={[
          { kind: "Intelligence", label: "GIO4X Intelligence", href: "/intelligence", note: "Longer analysis, explainers and guides." },
          { kind: "Learn", label: "Academy", href: "/academy", note: "Lessons in order, from first principles." },
          { kind: "Daily", label: "Morning Room", href: "/morning-room", note: "Sessions, fixings and today’s reading." },
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Every term, defined plainly." },
        ]}
      />
    </>
  );
}
