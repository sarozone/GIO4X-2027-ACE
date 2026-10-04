import Link from "next/link";
import type { Style } from "@/data/trader-type";

/**
 * One style of working, set out the same way every time: what it is, what it
 * demands, what it costs, where it goes wrong, and the lessons that bear on
 * it. Used for the quiz result and for the reference list beneath it, so the
 * two can never say different things. It describes; it does not recommend.
 */
export type StyleLinks = { lessons: { slug: string; title: string }[]; term?: { slug: string; term: string } };

const Part = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h4 className="label">{title}</h4>
    <ul className="mt-8 grid gap-8 text-sm text-ink-2">
      {items.map((x) => (
        <li key={x} className="border-l border-line pl-13">
          {x}
        </li>
      ))}
    </ul>
  </div>
);

export function StyleCard({ style, links, as: H = "h3", newTab = false }: { style: Style; links: StyleLinks; as?: "h3" | "h4"; newTab?: boolean }) {
  const tab = newTab ? { target: "_blank", rel: "noopener" } : {};
  return (
    <div>
      <H className="h3">{style.name}</H>
      <p className="num mt-5 text-xs text-ink-3">
        Holds: {style.holds} · Attention: {style.screen}
      </p>
      <p className="mt-13 max-w-measure text-ink-2">{style.summary}</p>
      <div className="mt-21 grid gap-21 md:grid-cols-3">
        <Part title="What it demands" items={style.demands} />
        <Part title="What it costs" items={style.costs} />
        <Part title="Where it goes wrong" items={style.wrong} />
      </div>
      {(links.lessons.length > 0 || links.term) && (
        <ul className="mt-21 flex flex-wrap gap-8" aria-label={`Lessons and terms for the ${style.name.toLowerCase()} style`}>
          {links.lessons.map((l) => (
            <li key={l.slug}>
              <Link href={`/academy/${l.slug}`} className="btn btn-ghost btn-sm" {...tab}>
                Lesson: {l.title}
              </Link>
            </li>
          ))}
          {links.term && (
            <li>
              <Link href={`/glossary/${links.term.slug}`} className="btn btn-quiet btn-sm" {...tab}>
                Glossary: {links.term.term}
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
