import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBrowseView } from "@/components/blog/BlogBrowse";
import { blogPostHref } from "@/components/blog/BlogList";
import { blogIso } from "@/components/blog/format";
import { BLOG_FEED } from "@/components/blog/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { absoluteUrl } from "@/config/site";
import { BLOG_PATH } from "@/lib/blog";
import { BLOG_TAGS_PATH, blogTagPath, isBrowseSlug, TAG_INDEX_MIN } from "@/lib/blog-browse";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { BLOG_MAX_PAGE } from "@/lib/server/blog";
import { tagPosts } from "@/lib/server/blog-browse";

type Props = { params: Promise<{ tag: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * The posts that carry one tag, as a page of its own. The tag in the address
 * is the slug of the tag as a writer typed it in GIO4X Control ("US dollar" →
 * us-dollar); the way back is to slug the tags of the live posts and compare
 * (src/lib/blog-browse.ts), so nothing about a tag is stored anywhere else.
 *
 * Which tags there are is not known at build time, so nothing is made then
 * and, as for a post, there is no generateStaticParams (the page reads
 * `?page=`, and a page that is first made at run time must not be promised as
 * a static one): it is rendered when it is asked for, from a read kept for a
 * minute and refreshed by the console when a post is saved
 * (src/lib/server/blog-browse.ts). A tag no live post carries is a real 404;
 * `dynamicParams = false` is deliberately not used (docs/ARCHITECTURE.md).
 *
 * This folder has no page of its own, so `/intelligence/blog/tag` is still the
 * address of a post with that slug, should one ever be written.
 */
export const revalidate = 60;

/** `?page=` is a whole number from 1, as on the index. Anything else is not an address of this page. */
function readPage(q: Record<string, string | string[] | undefined>): number | null {
  if (q.page === undefined) return 1;
  if (typeof q.page !== "string" || !/^[1-9]\d{0,3}$/.test(q.page)) return null;
  const page = Number(q.page);
  return page > BLOG_MAX_PAGE ? null : page;
}

const describe = (label: string) => `Posts tagged “${label}” on the GIO4X daily blog, newest first: dated, signed, educational and never advice.`;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { tag } = await params;
  if (!isBrowseSlug(tag)) return {};
  const page = readPage(await searchParams);
  if (!page) return { title: "Daily blog: tag", robots: { index: false, follow: true } };
  // the same kept read the page makes
  const result = await tagPosts(tag, page);
  if (result.state !== "ok") return {};
  const path = blogTagPath(tag, page);
  return {
    // a tag one post carries is that post again: kept out of search until a second post carries it
    ...pageMeta({ title: `Daily blog: posts tagged “${result.label}”${page > 1 ? `, page ${page}` : ""}`, description: describe(result.label), path, index: result.total < TAG_INDEX_MIN ? false : undefined }),
    alternates: { canonical: path, types: { "application/rss+xml": [BLOG_FEED] } },
  };
}

export default async function BlogTagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  if (!isBrowseSlug(tag)) notFound();
  const page = readPage(await searchParams);
  if (!page) notFound();
  const result = await tagPosts(tag, page);
  // "no live post carries this tag" is a 404; "the database did not answer" is an error, so that it is never kept as a 404
  if (result.state === "none" || result.state === "out-of-range") notFound();
  if (result.state === "failed" && result.reason === "not-configured") notFound();
  if (result.state === "failed") throw new Error("The posts could not be read.");

  const { label, total } = result;
  const path = blogTagPath(tag);

  return (
    <>
      <JsonLd
        data={{
          ...webPageSchema({ path, name: `Posts tagged “${label}”: GIO4X daily blog`, description: describe(label), type: "CollectionPage" }),
          isPartOf: { "@id": `${absoluteUrl(BLOG_PATH)}#blog` },
          hasPart: result.posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absoluteUrl(blogPostHref(p.slug)),
            datePublished: blogIso(p.published_at),
            author: { "@type": "Organization", name: p.byline },
          })),
        }}
      />
      <PageHero
        quiet
        crumbs={[
          { name: "Intelligence", href: "/intelligence" },
          { name: "Daily blog", href: BLOG_PATH },
          { name: "Tags", href: BLOG_TAGS_PATH },
          { name: label, href: path },
        ]}
        eyebrow="Daily blog · Tag"
        title={<span className="[overflow-wrap:anywhere]">{label}</span>}
        lead={`Every post on the daily blog that carries the tag “${label}”, newest first.`}
      />

      <section className="section-quiet" aria-labelledby="blog-tag-posts">
        <div className="wrap">
          <h2 id="blog-tag-posts" className="sr-only">
            Posts tagged {label}
            {page > 1 ? `, page ${page}` : ""}
          </h2>
          <BlogBrowseView posts={result.posts} page={result.page} pages={result.pages} count={`${total} ${total === 1 ? "post" : "posts"} tagged “${label}”, newest first`} hrefFor={(n) => blogTagPath(tag, n)} />
          <p className="mt-34 flex flex-wrap gap-x-21 text-sm">
            <Link href={BLOG_TAGS_PATH} className="link inline-flex min-h-[2.75rem] items-center">
              All tags
            </Link>
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
          { kind: "Daily blog", label: "All tags", href: BLOG_TAGS_PATH, note: "Every tag in use, with its count." },
          { kind: "Learn", label: "Academy", href: "/academy", note: "Lessons in order, from first principles." },
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Every term, defined plainly." },
        ]}
      />
    </>
  );
}
