import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCategoryLinks, BlogEmpty, BlogListView, blogPostHref, BlogUnavailable } from "@/components/blog/BlogList";
import { blogIso } from "@/components/blog/format";
import { BLOG_FEED } from "@/components/blog/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { absoluteUrl } from "@/config/site";
import { BLOG_CATEGORIES, BLOG_CATEGORY_ABOUT, BLOG_CATEGORY_LABEL, BLOG_PATH, blogCategoryPath } from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { BLOG_MAX_PAGE, isBlogCategory, listPosts } from "@/lib/server/blog";
import { blogCategoryFeedPath } from "@/lib/server/blog-feed";
import type { BlogCategory } from "@/lib/supabase/types";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * One category of the daily blog as a page of its own: the same posts the
 * index shows under `?category=`, at an address that can be linked to, listed
 * in the sitemap and found by a search engine.
 *
 * The four categories are known at build time; the posts are not. As on the
 * index, nothing is frozen: the page reads `?page=`, so it is rendered on
 * demand, and what it reads is the same cached list the index reads, kept for
 * a minute and refreshed by the console when a post is saved
 * (src/lib/server/blog.ts). An address that is not a category is a real 404;
 * `dynamicParams = false` is deliberately not used (docs/ARCHITECTURE.md).
 *
 * This folder has no page of its own, so `/intelligence/blog/category` is
 * still the address of a post with that slug, should one ever be written.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category }));
}

/** `?page=` is a whole number from 1, as on the index. Anything else is not an address of this page. */
function readPage(q: Record<string, string | string[] | undefined>): number | null {
  if (q.page === undefined) return 1;
  if (typeof q.page !== "string" || !/^[1-9]\d{0,3}$/.test(q.page)) return null;
  const page = Number(q.page);
  return page > BLOG_MAX_PAGE ? null : page;
}

const describe = (category: BlogCategory) => `${BLOG_CATEGORY_ABOUT[category]} A category of the GIO4X daily blog: dated, signed by a desk, educational and never advice.`;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isBlogCategory(category)) return {};
  const page = readPage(await searchParams);
  if (!page) return { title: `Daily blog: ${BLOG_CATEGORY_LABEL[category]}`, robots: { index: false, follow: true } };
  // the same cached read the page makes; a category with nothing in it yet is kept out of search until it has a post
  const result = await listPosts({ page, category });
  const path = blogCategoryPath(category, page);
  return {
    ...pageMeta({ title: `Daily blog: ${BLOG_CATEGORY_LABEL[category]}${page > 1 ? `, page ${page}` : ""}`, description: describe(category), path, index: result.state === "none" ? false : undefined }),
    // the blog's own feed first, as it was; then this category's
    alternates: { canonical: path, types: { "application/rss+xml": [BLOG_FEED, { url: blogCategoryFeedPath(category), title: `${BLOG_FEED.title}: ${BLOG_CATEGORY_LABEL[category]}` }] } },
  };
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  if (!isBlogCategory(category)) notFound();
  const page = readPage(await searchParams);
  if (!page) notFound();
  const result = await listPosts({ page, category });
  if (result.state === "out-of-range") notFound();

  const label = BLOG_CATEGORY_LABEL[category];
  const path = blogCategoryPath(category);

  return (
    <>
      <JsonLd
        data={{
          ...webPageSchema({ path, name: `${label}: GIO4X daily blog`, description: describe(category), type: "CollectionPage" }),
          isPartOf: { "@id": `${absoluteUrl(BLOG_PATH)}#blog` },
          ...(result.state === "ok"
            ? {
                hasPart: result.posts.map((p) => ({
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
        quiet
        crumbs={[
          { name: "Intelligence", href: "/intelligence" },
          { name: "Daily blog", href: BLOG_PATH },
          { name: label, href: path },
        ]}
        eyebrow="Daily blog · Category"
        title={label}
        lead={BLOG_CATEGORY_ABOUT[category]}
      />

      <section className="section-quiet" aria-labelledby="blog-category-posts">
        <div className="wrap">
          <h2 id="blog-category-posts" className="sr-only">
            Posts in {label}
            {page > 1 ? `, page ${page}` : ""}
          </h2>
          {result.state === "ok" ? (
            <BlogListView posts={result.posts} page={result.page} pages={result.pages} total={result.total} category={category} hrefFor={(n) => blogCategoryPath(category, n)} />
          ) : result.state === "none" ? (
            <BlogEmpty category={category} />
          ) : (
            <BlogUnavailable />
          )}
          <p className="mt-34 flex flex-wrap gap-x-21 text-sm">
            <Link href={BLOG_PATH} className="link inline-flex min-h-[2.75rem] items-center">
              All posts
            </Link>
            <a href={BLOG_FEED.url} className="link inline-flex min-h-[2.75rem] items-center" type="application/rss+xml">
              RSS feed
            </a>
            <a href={blogCategoryFeedPath(category)} className="link inline-flex min-h-[2.75rem] items-center" type="application/rss+xml">
              RSS feed of {label}
            </a>
            <Link href="/trust/editorial-standards" className="link inline-flex min-h-[2.75rem] items-center">
              Editorial standards
            </Link>
          </p>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper">
        <div className="wrap">
          <BlogCategoryLinks id="other-categories" label="Other categories" except={category} />
        </div>
      </section>

      <NextSteps
        items={[
          { kind: "Daily blog", label: "All posts", href: BLOG_PATH, note: "Every post, newest first." },
          { kind: "Intelligence", label: "GIO4X Intelligence", href: "/intelligence", note: "Longer analysis, explainers and guides." },
          { kind: "Learn", label: "Academy", href: "/academy", note: "Lessons in order, from first principles." },
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Every term, defined plainly." },
        ]}
      />
    </>
  );
}
