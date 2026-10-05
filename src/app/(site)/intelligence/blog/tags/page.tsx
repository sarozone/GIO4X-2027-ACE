import type { Metadata } from "next";
import Link from "next/link";
import { BlogSearchForm, BlogTagList } from "@/components/blog/BlogBrowse";
import { BlogUnavailable } from "@/components/blog/BlogList";
import { BLOG_FEED } from "@/components/blog/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { EmptyState, NextSteps, PageHero } from "@/components/ui/Page";
import { absoluteUrl } from "@/config/site";
import { BLOG_PATH } from "@/lib/blog";
import { BLOG_TAGS_PATH } from "@/lib/blog-browse";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { blogTags, postAtAddress } from "@/lib/server/blog-browse";
import BlogPostPage, { generateMetadata as postMetadata } from "../[slug]/page";

/**
 * Every tag in use on the daily blog, with how many posts carry it, the most
 * used first. One read, kept for a minute and refreshed by the console when a
 * post is saved (src/lib/server/blog-browse.ts).
 *
 * Unlike `category`, `series`, `tag` and `author`, this folder is a page, and
 * a page takes the address before `[slug]` is asked. So a post whose slug is
 * "tags", should one ever be written, is shown here instead of the list: a
 * post that is at an address always wins, as it does over an old address.
 */
export const revalidate = 60;

const OWN = "tags";
const asPost = { params: Promise.resolve({ slug: OWN }) };
const description = "Every tag in use on the GIO4X daily blog, with the number of posts that carry it. Choose a tag to read its posts, newest first.";

export async function generateMetadata(): Promise<Metadata> {
  if (await postAtAddress(OWN)) return postMetadata(asPost);
  // the same kept read the page makes; with no tag in use there is nothing here to index
  const result = await blogTags();
  return {
    ...pageMeta({ title: "Daily blog: tags", description, path: BLOG_TAGS_PATH, index: result.state === "ok" ? undefined : false }),
    alternates: { canonical: BLOG_TAGS_PATH, types: { "application/rss+xml": [BLOG_FEED] } },
  };
}

export default async function BlogTagsPage() {
  if (await postAtAddress(OWN)) return BlogPostPage(asPost);
  const result = await blogTags();
  const tags = result.state === "ok" ? result.tags : [];

  return (
    <>
      <JsonLd data={{ ...webPageSchema({ path: BLOG_TAGS_PATH, name: "Tags: GIO4X daily blog", description, type: "CollectionPage" }), isPartOf: { "@id": `${absoluteUrl(BLOG_PATH)}#blog` } }} />
      <PageHero
        quiet
        crumbs={[
          { name: "Intelligence", href: "/intelligence" },
          { name: "Daily blog", href: BLOG_PATH },
          { name: "Tags", href: BLOG_TAGS_PATH },
        ]}
        eyebrow="Daily blog · Tags"
        title="Tags"
        lead="Every tag a post on the daily blog carries, with the number of posts under it. The most used come first."
      />

      <section className="section-quiet" aria-labelledby="blog-tags">
        <div className="wrap">
          <h2 id="blog-tags" className="sr-only">
            Tags in use
          </h2>
          {tags.length > 0 ? (
            <>
              <p className="num text-xs text-ink-3">
                {tags.length} {tags.length === 1 ? "tag" : "tags"} in use, the most used first
              </p>
              <div className="mt-21">
                <BlogTagList tags={tags} />
              </div>
            </>
          ) : result.state === "failed" ? (
            <BlogUnavailable />
          ) : (
            <EmptyState
              title="No published post carries a tag yet."
              actions={
                <Link href={BLOG_PATH} className="btn btn-ghost">
                  All posts
                </Link>
              }
            >
              A tag appears here when a post that carries it is published.
            </EmptyState>
          )}
          <div className="mt-34 border-t border-line pt-21">
            <BlogSearchForm id="blog-tags-search" />
          </div>
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
          { kind: "Intelligence", label: "GIO4X Intelligence", href: "/intelligence", note: "Longer analysis, explainers and guides." },
          { kind: "Learn", label: "Academy", href: "/academy", note: "Lessons in order, from first principles." },
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Every term, defined plainly." },
        ]}
      />
    </>
  );
}
