"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadSearchIndex, openCommandBar } from "@/components/shell/CommandBar";
import { search, type SearchHit } from "@/lib/search";

/**
 * "Did you mean…?" Words from the requested path are matched against the site
 * index, in the browser: up to five pages, the address read as one phrase
 * first and then word by word. Only internal, existing destinations are ever
 * suggested and the path itself is never rendered as markup; its words are
 * offered as the starting text of the search box, which the visitor can change.
 * Nothing here redirects: the response stays a 404.
 */
export function NotFoundSuggestions() {
  const pathname = usePathname();
  const [hits, setHits] = useState<SearchHit[]>([]);
  // what the search box starts with: the words of the address, as text in a field (never as markup)
  const [query, setQuery] = useState("");

  useEffect(() => {
    const words = pathname
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .filter((w) => w.length >= 3)
      .slice(0, 6);
    if (!words.length) return;
    setQuery(words.join(" "));
    let alive = true;
    loadSearchIndex()
      .then((index) => {
        if (!alive) return;
        const seen = new Set<string>();
        const out: SearchHit[] = [];
        // the address read as one phrase first: a page that matches every word is the nearest there is
        for (const h of search(index, words.join(" "), { limit: 5 })) {
          seen.add(h.h);
          out.push({ ...h, score: h.score * 1.618 });
        }
        for (const w of [...words].reverse()) {
          for (const h of search(index, w, { limit: 3 })) {
            if (!seen.has(h.h)) {
              seen.add(h.h);
              out.push(h);
            }
          }
        }
        setHits(out.sort((a, b) => b.score - a.score).slice(0, 5));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <div className="mt-34">
      {hits.length > 0 && (
        <div className="mb-21">
          <p className="label">Did you mean…</p>
          <ul className="mt-8 grid gap-2">
            {hits.map((h) => (
              <li key={h.h}>
                <Link href={h.h} className="link text-md">
                  {h.t}
                </Link>
                <span className="ml-8 text-xs text-ink-3">{h.g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* a plain form to the search page: it works before scripts load, and on a browser without them */}
      <form action="/search" method="get" role="search" className="mb-13 flex max-w-[34rem] flex-wrap gap-8">
        <label htmlFor="nf-q" className="sr-only">
          Search GIO4X
        </label>
        <input id="nf-q" name="q" type="search" className="input min-w-0 flex-1 basis-[13rem]" maxLength={120} autoComplete="off" placeholder="Search instruments, terms, tools and pages" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" className="btn btn-ghost">
          Search
        </button>
      </form>
      <button type="button" className="btn btn-primary" onClick={() => openCommandBar()}>
        Search GIO4X
      </button>
    </div>
  );
}
