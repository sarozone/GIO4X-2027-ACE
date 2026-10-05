import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBrowseView, BlogSearchForm } from "@/components/blog/BlogBrowse";
import { BlogUnavailable } from "@/components/blog/BlogList";
import { EmptyState, NextSteps, PageHero } from "@/components/ui/Page";
import { BLOG_PATH } from "@/lib/blog";
import { BLOG_SEARCH_PATH, BLOG_TAGS_PATH, blogSearchHref } from "@/lib/blog-browse";
import { pageMeta } from "@/lib/meta";
import { BLOG_MAX_PAGE } from "@/lib/server/blog";
import { blogSearchWords, postAtAddress, searchPosts } from "@/lib/server/blog-browse";
import BlogPostPage, { generateMetadata as postMetadata } from "../[slug]/page";

type Search = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * A search of the daily blog: `?q=` is a few words, and a post answers when
 * every one of them is in its title, its excerpt or one of its tags, without
 * regard to case.
 *
 * What is typed is cleaned as GIO4X Control cleans its own searches
 * (cleanSearch: letters, digits and @ . _ + - only, five words at most), and
 * then compared here with posts already read: it is never part of a question
 * to the database (src/lib/server/blog-browse.ts). The page is rendered for
 * each request, because it reads its query string, but what it reads is kept
 * for a minute.
 *
 * A page of results is never indexed. Like `tags`, this folder is a page, so a
 * post whose slug is "search", should one ever be written, is shown here
 * instead.
 */
export const revalidate = 60;

const OWN = "search";
const asPost = { params: Promise.resolve({ slug: OWN }) };
const description = "Search the GIO4X daily blog: the titles, the excerpts and the tags of every published post.";

/** `?q=` is text or absent; `?page=` is a whole number from 1. Anything else is not an address of this page. */
function readQuery(q: Record<string, string | string[] | undefined>): { words: string[]; page: number } | null {
  if (q.q !== undefined && typeof q.q !== "string") return null;
  let page = 1;
  if (q.page !== undefined) {
    if (typeof q.page !== "string" || !/^[1-9]\d{0,3}$/.test(q.page)) return null;
    page = Number(q.page);
    if (page > BLOG_MAX_PAGE) return null;
  }
  return { words: blogSearchWords(q.q), page };
}

export async function generateMetadata(): Promise<Metadata> {
  if (await postAtAddress(OWN)) return postMetadata(asPost);
  // one address for every search, and none of them indexed: what was typed is not put into the title or the canonical
  return pageMeta({ title: "Daily blog: search", description, path: BLOG_SEARCH_PATH, index: false });
}

export default async function BlogSearchPage({ searchParams }: Search) {
  if (await postAtAddress(OWN)) return BlogPostPage(asPost);
  const query = readQuery(await searchParams);
  if (!query) notFound();
  const { words, page } = query;
  const asked = words.join(" ");
  const result = words.length ? await searchPosts(words, page) : null;
  if (result?.state === "out-of-range") notFound();

  return (
    <>
      <PageHero
        quiet
        crumbs={[
          { name: "Intelligence", href: "/intelligence" },
          { name: "Daily blog", href: BLOG_PATH },
          { name: "Search", href: BLOG_SEARCH_PATH },
        ]}
        eyebrow="Daily blog · Search"
        title="Search the blog"
        lead="Looks in the title, the excerpt and the tags of every published post. Every word you type must be found."
      />

      <section className="section-quiet" aria-labelledby="blog-search-results">
        <div className="wrap">
          <BlogSearchForm id="blog-search" q={asked} />
          <h2 id="blog-search-results" className="sr-only">
            {asked ? `Posts that match “${asked}”` : "Results"}
            {page > 1 ? `, page ${page}` : ""}
          </h2>
          <div className="mt-34">
            {!result ? (
              // nothing asked yet, or nothing left of what was typed once it was cleaned
              <EmptyState
                title="Type a word or two to search the blog."
                actions={
                  <>
                    <Link href={BLOG_PATH} className="btn btn-ghost">
                      All posts
                    </Link>
                    <Link href={BLOG_TAGS_PATH} className="btn btn-ghost">
                      All tags
                    </Link>
                  </>
                }
              >
                Letters and digits are looked for; other characters are left out. For example: gold, Amsterdam, tokenized.
              </EmptyState>
            ) : result.state === "ok" ? (
              <BlogBrowseView
                posts={result.posts}
                page={result.page}
                pages={result.pages}
                count={`${result.total} ${result.total === 1 ? "post matches" : "posts match"} “${asked}”, newest first`}
                hrefFor={(n) => blogSearchHref(words, n)}
              />
            ) : result.state === "none" ? (
              <EmptyState
                title={`No post matches “${asked}”.`}
                actions={
                  <>
                    <Link href={BLOG_PATH} className="btn btn-ghost">
                      All posts
                    </Link>
                    <Link href={BLOG_TAGS_PATH} className="btn btn-ghost">
                      All tags
                    </Link>
                  </>
                }
              >
                Every word must be found in a post’s title, excerpt or tags. Try fewer words, or one word spelt another way.
              </EmptyState>
            ) : (
              <BlogUnavailable />
            )}
          </div>
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
