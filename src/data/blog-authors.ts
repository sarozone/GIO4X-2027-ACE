/**
 * The authors of the daily blog that the site says something about.
 *
 * An author is a post's byline, and the page of an author is at the slug of
 * that byline ("@Abe" → abe: see browseSlug in src/lib/blog-browse.ts). This
 * table adds a name to show and one line, for the bylines listed here; a byline
 * that is not listed still has a page, with the byline alone.
 *
 * Only what is published is written here: no biography, no title and no
 * credential. A new entry is one more line and no migration.
 */

export type BlogAuthor = {
  /** the name shown at the head of the page */
  name: string;
  /** one line under it */
  line: string;
};

export const BLOG_AUTHORS: Readonly<Record<string, BlogAuthor>> = {
  abe: { name: "Abe", line: "Writes GIO4X’s long-form series on the history and the future of trading." },
};

export function getBlogAuthor(slug: string): BlogAuthor | null {
  return Object.prototype.hasOwnProperty.call(BLOG_AUTHORS, slug) ? BLOG_AUTHORS[slug] : null;
}
