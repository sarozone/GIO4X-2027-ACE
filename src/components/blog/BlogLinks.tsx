import Link from "next/link";
import { bylineHref, tagHref } from "@/lib/blog-browse";

/**
 * A post's byline and its tags as links: to the page of that author, and to
 * the page of that tag (src/lib/blog-browse.ts). Text that has no address (no
 * ASCII letter or digit in it) is shown as it always was, without a link.
 *
 * Kept apart from BlogList, which uses these, so that neither imports the other.
 */

/**
 * The byline. With `raised` it stands above a card's own stretched link (see
 * BlogCards), as the category chip does, so it can be followed from a card.
 */
export function BlogByline({ byline, raised = false, className = "" }: { byline: string; raised?: boolean; className?: string }) {
  const href = bylineHref(byline);
  if (!href) return <span className={className}>{byline}</span>;
  return (
    <Link href={href} rel="author" className={`${raised ? "relative z-[1] " : ""}transition-colors duration-fast hover:text-accent ${className}`} data-byline>
      {byline}
    </Link>
  );
}

/** One tag as a chip: a link to the tag's page when it has one. */
export function BlogTagChip({ tag, count }: { tag: string; count?: number }) {
  const href = tagHref(tag);
  const text = (
    <>
      {tag}
      {count !== undefined && <span className="num ml-5 text-ink-3">{count}</span>}
    </>
  );
  if (!href) return <span className="chip">{text}</span>;
  return (
    <Link href={href} rel="tag" className="chip transition-colors duration-fast hover:border-line-strong hover:text-ink" data-chip="tag">
      {text}
    </Link>
  );
}
