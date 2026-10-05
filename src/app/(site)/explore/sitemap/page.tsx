import Link from "next/link";
import { PageHero } from "@/components/ui/Page";
import { nav, secondaryNav } from "@/config/nav";
import { BLOG_SERIES, blogSeriesPath } from "@/data/blog-series";
import { centralBanks } from "@/data/knowledge";
import { localeInfo, parseLocalePath, type LocalePage } from "@/i18n/config";
import { BLOG_CATEGORIES, BLOG_CATEGORY_LABEL, BLOG_PATH, blogCategoryPath } from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { buildSearchIndex } from "@/lib/search-index";
import { blogPostPath, indexablePosts } from "@/lib/server/blog";
import { SITEMAP_NAMES, type SitemapName } from "@/lib/sitemap";
import { sitemapEntries } from "@/lib/sitemap-data";

const PATH = "/explore/sitemap";

export const metadata = pageMeta({
  title: "Sitemap",
  description: "Every page of the GIO4X website, by section, as a list for people: the same pages the XML sitemaps list for search engines, generated from the same sources.",
  path: PATH,
});

/**
 * The sitemap for people: every page the XML sitemaps list, by section, as
 * links with names.
 *
 * Nothing is listed here by hand. Which pages there are comes from
 * sitemapEntries (src/lib/sitemap-data.ts), the one source the XML sitemaps
 * read, and the posts of the daily blog from the read /sitemap-blog.xml makes;
 * so a page that is added to the site is here, and one that is taken away is
 * not, without this file being touched. Only the names are looked up: the
 * navigation's own label for a page, else the title search shows for it, else
 * the last word of its address.
 *
 * "Explore GIO4X" (/explore) is the curated directory, in the order a person
 * would look; this is the complete one. The posts are rows in the database, so
 * the page is read again at most once a minute, like the blog's own sitemap.
 */
export const revalidate = 60;

type Row = { href: string; label: string };
type Group = { title: string; rows: Row[] };
type Chapter = { id: string; title: string; groups: Group[]; note?: string };

const CHAPTER_TITLE: Record<SitemapName, string> = {
  pages: "Pages",
  markets: "Markets",
  instruments: "Instruments",
  intelligence: "Intelligence",
  academy: "Academy",
  glossary: "Glossary",
  tools: "Trader Toolkit",
  blog: "Daily blog",
};

const LOCALE_PAGE_LABEL: Record<LocalePage, string> = { "": "Home", guide: "Guide", "risk-warning": "Risk warning", contact: "Contact" };

/** "/markets/central-banks" → "Central banks": the last resort, when nothing names the page. */
function fromPath(path: string): string {
  const last = path.split("/").filter(Boolean).pop() ?? "";
  const words = last.replace(/-/g, " ");
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Home";
}

/** The name of every page that has one: the first source to name a page wins. */
function pageLabels(): Map<string, string> {
  const labels = new Map<string, string>([["/", "Home"]]);
  const name = (href: string, label: string) => {
    // "/#tour" is a place on a page, not a page
    if (!href.includes("#") && !labels.has(href)) labels.set(href, label);
  };
  for (const s of nav) {
    name(s.href, s.label);
    for (const g of s.groups) for (const i of g.items) name(i.href, i.label);
  }
  for (const g of secondaryNav) for (const i of g.items) name(i.href, i.label);
  // search lists a currency under its central bank's page, before the bank itself: the page is the bank's
  for (const b of centralBanks) name(`/markets/central-banks/${b.slug}`, b.name);
  for (const e of buildSearchIndex()) name(e.h, e.t);
  return labels;
}

/** Which group of the navigation a page stands in, for the pages that belong to no section of their own. */
function navGroups(): Map<string, string> {
  const where = new Map<string, string>();
  const put = (href: string, title: string) => {
    const path = href.split("#")[0];
    if (!where.has(path)) where.set(path, title);
  };
  for (const s of nav) {
    put(s.href, s.label);
    for (const g of s.groups) for (const i of g.items) put(i.href, s.label);
  }
  for (const g of secondaryNav) for (const i of g.items) put(i.href, g.title);
  return where;
}

function chapters(): Chapter[] {
  const labels = pageLabels();
  const where = navGroups();
  const out: Chapter[] = [];
  const languages: Group[] = [];

  for (const name of SITEMAP_NAMES) {
    if (name === "blog") continue; // read from the database: see blogChapter
    const paths = [...new Set(sitemapEntries(name).map((e) => e.path))];
    const groups = new Map<string, Row[]>();
    const add = (title: string, row: Row) => groups.set(title, [...(groups.get(title) ?? []), row]);
    for (const path of paths) {
      const translated = parseLocalePath(path);
      if (translated) {
        const info = localeInfo(translated.lang);
        const title = `${info.english} · ${info.native}`;
        let group = languages.find((g) => g.title === title);
        if (!group) languages.push((group = { title, rows: [] }));
        group.rows.push({ href: path, label: LOCALE_PAGE_LABEL[translated.page] });
        continue;
      }
      // "Pages" is everything that has no sitemap of its own: set out under the navigation's own headings
      add(name === "pages" ? (where.get(path) ?? "Elsewhere on the site") : "", { href: path, label: labels.get(path) ?? fromPath(path) });
    }
    out.push({ id: name, title: CHAPTER_TITLE[name], groups: [...groups].map(([title, rows]) => ({ title, rows })) });
  }
  if (languages.length) out.push({ id: "languages", title: "Other languages", groups: languages });
  return out;
}

/** The daily blog: its list, the categories and series that have a post, and every post a search engine is told about. */
async function blogChapter(): Promise<Chapter> {
  const result = await indexablePosts();
  const posts = result.state === "ok" ? result.entries : [];
  const slugs = new Set(posts.map((p) => p.slug));
  const pages: Row[] = [
    ...sitemapEntries("blog").map((e) => ({ href: e.path, label: "The daily blog" })),
    ...BLOG_CATEGORIES.filter((c) => posts.some((p) => p.category === c)).map((c) => ({ href: blogCategoryPath(c), label: `Category: ${BLOG_CATEGORY_LABEL[c]}` })),
    ...BLOG_SERIES.filter((s) => s.parts.some((slug) => slugs.has(slug))).map((s) => ({ href: blogSeriesPath(s.slug), label: `Series: ${s.title}` })),
  ];
  return {
    id: "blog",
    title: CHAPTER_TITLE.blog,
    groups: [{ title: "", rows: pages }, ...(posts.length ? [{ title: "Posts, newest first", rows: posts.map((p) => ({ href: blogPostPath(p.slug), label: p.title || fromPath(p.slug) })) }] : [])],
    ...(result.state === "failed" ? { note: "The posts could not be loaded just now. They are listed on the daily blog itself." } : {}),
  };
}

const anchor = "scroll-mt-[calc(var(--header-h)+4.25rem)]";
const count = (c: Chapter) => c.groups.reduce((n, g) => n + g.rows.length, 0);

export default async function SitemapPage() {
  const all = [...chapters(), await blogChapter()];
  // the blog stands with the reading, after Intelligence, as it does in the navigation
  const order = ["pages", "markets", "instruments", "tools", "intelligence", "blog", "academy", "glossary", "languages"];
  const list = [...all].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)).filter((c) => count(c) > 0);
  const total = list.reduce((n, c) => n + count(c), 0);

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Explore GIO4X", href: "/explore" },
          { name: "Sitemap", href: PATH },
        ]}
        eyebrow="Site directory"
        title="Sitemap"
        lead="Every page of this website, by section. The same list search engines are given, written for people."
        quiet
      />

      {/* chapter index: sticky on desktop, a scrolling rail on mobile */}
      <nav aria-label="On this page" className="glass no-print sticky top-[var(--header-h)] z-1 border-b border-line">
        <div className="wrap">
          <ul className="scroll-x -mx-8 flex gap-5 py-8">
            {list.map((c) => (
              <li key={c.id} className="shrink-0">
                <a href={`#${c.id}`} className="btn btn-quiet btn-sm h-[2.75rem] md:h-[2.125rem]">
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {list.map((c, n) => (
        <section key={c.id} id={c.id} className={`section-quiet ${n ? "hairline" : ""} ${n % 2 ? "bg-paper" : ""} ${anchor}`} aria-labelledby={`${c.id}-h`}>
          <div className="wrap">
            <div className="flex flex-wrap items-baseline justify-between gap-x-21 gap-y-8 border-b border-line-strong pb-13">
              <h2 id={`${c.id}-h`} className="h3">
                {c.title}
              </h2>
              <span className="num text-xs text-ink-3">
                {count(c)} {count(c) === 1 ? "page" : "pages"}
              </span>
            </div>
            {c.note && (
              <p className="mt-13 max-w-measure text-sm text-ink-2" role="status">
                {c.note}
              </p>
            )}
            {c.groups.map((g) => (
              <div key={g.title} className="pt-21">
                {g.title && <h3 className="label">{g.title}</h3>}
                <ul className={`${g.title ? "mt-8" : ""} columns-1 gap-x-34 sm:columns-2 lg:columns-3 xl:columns-4`}>
                  {g.rows.map((r) => (
                    <li key={r.href} className="break-inside-avoid">
                      <Link href={r.href} className="link-quiet block py-5 text-[0.9375rem] [overflow-wrap:anywhere]">
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="section-quiet hairline">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-2">
            <span className="num">{total}</span> pages in all. Gateways and private pages (sign in, open an account, search, My desk, preferences) are not listed, as they are not in the XML sitemaps. For a shorter directory in the order a person would look, see{" "}
            <Link href="/explore" className="link">
              Explore GIO4X
            </Link>
            . For machines, the same list is at{" "}
            <a href="/sitemap.xml" className="link">
              /sitemap.xml
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
