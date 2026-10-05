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
import { getBlogAuthor } from "@/data/blog-authors";
import { BLOG_PATH } from "@/lib/blog";
import { BLOG_TAGS_PATH, blogAuthorPath, isBrowseSlug } from "@/lib/blog-browse";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { BLOG_MAX_PAGE } from "@/lib/server/blog";
import { authorPosts } from "@/lib/server/blog-browse";

type Props = { params: Promise<{ author: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * The posts under one byline, as a page of its own. The author in the address
 * is the slug of the byline as it is written on the posts ("@Abe" → abe); the
 * way back is to slug the bylines of the live posts and compare
 * (src/lib/blog-browse.ts).
 *
 * What the page says of an author is what src/data/blog-authors.ts says: a
 * name and one line, for the bylines listed there. A byline that is not listed
 * still has its page, with the byline alone. Nothing else is said of anybody:
 * no biography, no title, no credential.
 *
 * Rendered when it is asked for, like a tag's page and for the same reasons
 * (see tag/[tag]/page.tsx). A byline no live post carries is a real 404.
 *
 * This folder has no page of its own, so `/intelligence/blog/author` is still
 * the address of a post with that slug, should one ever be written.
 */
export const revalidate = 60;

/** `?page=` is a whole number from 1, as on the index. Anything else is not an address of this page. */
function readPage(q: Record<string, string | string[] | undefined>): number | null {
  if (q.page === undefined) return 1;
  if (typeof q.page !== "string" || !/^[1-9]\d{0,3}$/.test(q.page)) return null;
  const page = Number(q.page);
  return page > BLOG_MAX_PAGE ? null : page;
}

/** The name at the head of the page, and the line under it: the table's when the byline is listed, else the byline and a plain sentence. */
function shown(slug: string, byline: string): { name: string; line: string; known: boolean } {
  const author = getBlogAuthor(slug);
  return author ? { ...author, known: true } : { name: byline, line: `Posts on the GIO4X daily blog published under the byline ${byline}.`, known: false };
}

const describe = (name: string, line: string) => `${name} on the GIO4X daily blog. ${line} Every post under this byline, newest first: educational and never advice.`;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { author } = await params;
  if (!isBrowseSlug(author)) return {};
  const page = readPage(await searchParams);
  if (!page) return { title: "Daily blog: author", robots: { index: false, follow: true } };
  // the same kept read the page makes
  const result = await authorPosts(author, page);
  if (result.state !== "ok") return {};
  const { name, line } = shown(author, result.label);
  const path = blogAuthorPath(author, page);
  return {
    ...pageMeta({ title: `Daily blog: posts by ${name}${page > 1 ? `, page ${page}` : ""}`, description: describe(name, line), path }),
    alternates: { canonical: path, types: { "application/rss+xml": [BLOG_FEED] } },
  };
}

export default async function BlogAuthorPage({ params, searchParams }: Props) {
  const { author } = await params;
  if (!isBrowseSlug(author)) notFound();
  const page = readPage(await searchParams);
  if (!page) notFound();
  const result = await authorPosts(author, page);
  // "no live post has this byline" is a 404; "the database did not answer" is an error, so that it is never kept as a 404
  if (result.state === "none" || result.state === "out-of-range") notFound();
  if (result.state === "failed" && result.reason === "not-configured") notFound();
  if (result.state === "failed") throw new Error("The posts could not be read.");

  const { label: byline, total } = result;
  const { name, line, known } = shown(author, byline);
  const path = blogAuthorPath(author);

  return (
    <>
      <JsonLd
        data={{
          // a listed author is a person, and the page a profile of them: the name and the one line, which are on the page, and nothing more.
          // A byline that is not listed may be a desk, so nothing is claimed of it: the page is then a list of posts.
          ...webPageSchema({ path, name: `${name}: GIO4X daily blog`, description: describe(name, line), type: known ? "ProfilePage" : "CollectionPage" }),
          isPartOf: { "@id": `${absoluteUrl(BLOG_PATH)}#blog` },
          ...(known ? { mainEntity: { "@type": "Person", "@id": `${absoluteUrl(path)}#author`, name, alternateName: byline, description: line, url: absoluteUrl(path) } } : {}),
          hasPart: result.posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absoluteUrl(blogPostHref(p.slug)),
            datePublished: blogIso(p.published_at),
          })),
        }}
      />
      <PageHero
        quiet
        crumbs={[
          { name: "Intelligence", href: "/intelligence" },
          { name: "Daily blog", href: BLOG_PATH },
          { name, href: path },
        ]}
        eyebrow="Daily blog · Author"
        title={<span className="[overflow-wrap:anywhere]">{name}</span>}
        lead={line}
      />

      <section className="section-quiet" aria-labelledby="blog-author-posts">
        <div className="wrap">
          <h2 id="blog-author-posts" className="sr-only">
            Posts by {name}
            {page > 1 ? `, page ${page}` : ""}
          </h2>
          <BlogBrowseView posts={result.posts} page={result.page} pages={result.pages} count={`${total} ${total === 1 ? "post" : "posts"} under the byline ${byline}, newest first`} hrefFor={(n) => blogAuthorPath(author, n)} />
          <p className="mt-34 flex flex-wrap gap-x-21 text-sm">
            <Link href={BLOG_PATH} className="link inline-flex min-h-[2.75rem] items-center">
              All posts
            </Link>
            <Link href={BLOG_TAGS_PATH} className="link inline-flex min-h-[2.75rem] items-center">
              All tags
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
          { kind: "Intelligence", label: "GIO4X Intelligence", href: "/intelligence", note: "Longer analysis, explainers and guides." },
          { kind: "Learn", label: "Academy", href: "/academy", note: "Lessons in order, from first principles." },
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Every term, defined plainly." },
        ]}
      />
    </>
  );
}
