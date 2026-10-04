import Link from "next/link";
import { ChangeMarks } from "@/components/figures/company/ChangeMarks";
import { FigureNote } from "@/components/figures/Figure";
import { EmptyState, NextSteps, PageHero } from "@/components/ui/Page";
import { glossary } from "@/data/glossary";
import { assetClasses, instruments } from "@/data/instruments";
import { centralBanks, econEvents } from "@/data/knowledge";
import { tools } from "@/data/tools";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: "What’s new",
  description: "The GIO4X changelog: what changed and when, sorted into site and content, platforms and instruments, legal documents and service notices. One release so far.",
  path: "/whats-new",
});

/**
 * WHAT'S NEW — a dated feed of what changes, in four kinds.
 *
 * The rule this page keeps: real entries only. Every entry carries the kind
 * of change it is and the date of the release it belongs to; a kind with no
 * entries says that none has been published and where such a notice would
 * come from, and nothing is back-filled or invented to fill it. The filter is
 * a row of radio buttons read by the stylesheet alone (no script, nothing
 * stored): with none chosen, or in a browser that cannot read it, everything
 * is shown.
 */
type FeedKind = "site" | "platform" | "legal" | "service";

const FEED_KINDS: { key: FeedKind; name: string; covers: string }[] = [
  { key: "site", name: "Site and content", covers: "Pages, sections, tools, lessons and terms added to this website, changes to how it is organised or worded, and things taken off it." },
  { key: "platform", name: "Platforms and instruments", covers: "A change to a trading platform as GIO4X makes it available, or to the instruments that can be traded: one added or withdrawn, or a change to a contract’s terms or hours." },
  { key: "legal", name: "Documents and legal", covers: "A revision to a legal document: the terms, the privacy notice, the risk disclosure, the cookie notice or the anti-money-laundering policy." },
  { key: "service", name: "Service notices", covers: "Planned maintenance, an interruption to a service, or a change to how a service is reached." },
];

/** Hides an element while the filter is set to a kind it does not carry. Written out in full so the stylesheet is generated for each. */
const HIDE_WHEN: Record<FeedKind, string> = {
  site: "group-has-[#feed-site:checked]/feed:hidden",
  platform: "group-has-[#feed-platform:checked]/feed:hidden",
  legal: "group-has-[#feed-legal:checked]/feed:hidden",
  service: "group-has-[#feed-service:checked]/feed:hidden",
};
const hideUnless = (kinds: FeedKind[]): string =>
  FEED_KINDS.filter((k) => !kinds.includes(k.key))
    .map((k) => HIDE_WHEN[k.key])
    .join(" ");

/** `kind` is the kind of change; the date of an entry is the date of the release it is listed under. */
type Change = { t: string; d: string; kind: FeedKind; href?: string; go?: string };
type Group = { kind: "New" | "Changed" | "Removed"; items: Change[] };
type Release = { id: string; date: string; dateLabel: string; title: string; summary: string; groups: Group[] };

/** Real entries only. A release is added here when it ships; nothing is back-filled. */
const releases: Release[] = [
  {
    id: "2026-10-01",
    date: "2026-10-01",
    dateLabel: "1 October 2026",
    title: "A new GIO4X website",
    summary: "The site has been rebuilt from the ground up around one rule: publish only what can be shown. This entry lists what the release contains and what was deliberately left out.",
    groups: [
      {
        kind: "New",
        items: [
          { t: "A design system", kind: "site", d: "A palette sampled from the logo, a layout built on the golden ratio, Inter and TT Norms, light and dark themes and seven accent moods.", href: "/design", go: "Designing GIO4X" },
          { t: "Market Command", kind: "site", d: `An overview of sessions and reference rates, a world market clock, currency strength from European Central Bank reference data, ${centralBanks.length} central banks and ${econEvents.length} economic releases explained.`, href: "/markets", go: "Markets" },
          { t: "Instrument pages", kind: "site", d: `${instruments.length} instruments across ${assetClasses.length} asset classes, each with its indicative conditions labelled as indicative.`, href: "/markets", go: "Asset classes" },
          { t: "Trader Toolkit", kind: "site", d: `${tools.length} calculators and visualisers. Each shows its formula and works on the figures you enter.`, href: "/tools", go: "All tools" },
          { t: "Glossary", kind: "site", d: `${glossary.length} definitions, linked to each other and to the tools that use them.`, href: "/glossary", go: "Glossary" },
          { t: "Two platform guides and a comparison", kind: "site", d: "MetaTrader 5 and 777 Raptor described side by side, with neither ranked above the other.", href: "/platforms/compare", go: "Compare platforms" },
          { t: "Trust Centre and link verifier", kind: "site", d: "A registry of official destinations and a tool that checks any address against it, with pages on transparency and data methodology.", href: "/trust/verify", go: "Verify a link" },
          { t: "Command bar and search", kind: "site", d: "Press Ctrl or ⌘ and K on any page. It understands symbols, definitions, calculators and typing mistakes.", href: "/search", go: "Search" },
          { t: "Display & privacy", kind: "site", d: "Theme, accent, density and comfort settings, a time-zone preference, and a list of everything the site stores in your browser with one button to clear it.", href: "/preferences", go: "Preferences" },
          { t: "A site directory", kind: "site", d: "Every section, instrument, tool and term on one page.", href: "/explore", go: "Explore GIO4X" },
        ],
      },
      {
        kind: "Changed",
        items: [
          { t: "Sign-in is a gateway", kind: "site", d: "Portal destinations appear as links only once they are verified. Until then each is shown as not connected, with no placeholder address.", href: "/sign-in", go: "Sign in" },
          { t: "Contact is one form", kind: "site", d: "Routed by topic, with a reference returned for every message received.", href: "/contact", go: "Contact" },
          { t: "Risk is stated in ordinary type", kind: "site", d: "The risk warning and disclosure are set at reading size, at the point of decision.", href: "/legal/risk", go: "Risk disclosure" },
        ],
      },
      {
        kind: "Removed",
        items: [
          { t: "Figures that could not be evidenced", kind: "site", d: "Client counts, trading volumes, execution speeds, uptime percentages, awards and testimonials shown on earlier versions of the site are not carried into this one.", href: "/about#unsaid", go: "What we have chosen not to say" },
          { t: "A leadership page, a company timeline and job listings", kind: "site", d: "None is published until its contents are confirmed.", href: "/trust/transparency", go: "Transparency" },
          { t: "A status percentage", kind: "site", d: "The status page now shows what is monitored, which at present is nothing.", href: "/status", go: "System status" },
        ],
      },
    ],
  },
];

const allChanges = releases.flatMap((r) => r.groups.flatMap((g) => g.items.map((c) => ({ ...c, date: r.date, dateLabel: r.dateLabel }))));
const countOf = (k: FeedKind): number => allChanges.filter((c) => c.kind === k).length;
const kindName = (k: FeedKind): string => FEED_KINDS.find((x) => x.key === k)?.name ?? k;
const kindsIn = (items: Change[]): FeedKind[] => [...new Set(items.map((c) => c.kind))];

/** Where a notice of a kind that has none yet would come from. */
const EMPTY: Record<Exclude<FeedKind, "site">, { title: string; body: string; links: { label: string; href: string }[] }> = {
  platform: {
    title: "No platform or instrument change has been published.",
    body: "No change to a platform or to the instruments has been recorded since this feed began. When one is, it is entered here with its date. Until then, the platform pages and the instrument pages show what is published and what is not yet.",
    links: [
      { label: "Platforms", href: "/platforms" },
      { label: "Market Command", href: "/markets" },
    ],
  },
  legal: {
    title: "No document revision has been published.",
    body: "No legal document has been revised since this feed began. Revisions come from the Legal & Document Centre, the register of the documents, which shows for each one where its text came from, when it was last updated and whether it is under review.",
    links: [{ label: "Legal & Document Centre", href: "/legal" }],
  },
  service: {
    title: "No service notice has been published.",
    body: "No notice of maintenance or interruption has been issued. Service notices come from the status page, which at present says that no monitor is connected to it.",
    links: [{ label: "System status", href: "/status" }],
  },
};
const emptyKinds = (Object.keys(EMPTY) as Exclude<FeedKind, "site">[]).filter((k) => countOf(k) === 0);

const pill =
  "inline-flex min-h-[2.75rem] cursor-pointer items-center gap-8 rounded border border-line px-13 text-sm text-ink-2 transition-colors duration-fast hover:border-line-strong hover:text-ink has-[:checked]:border-ink has-[:checked]:bg-surface has-[:checked]:font-medium has-[:checked]:text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent";

const kindStyle: Record<Group["kind"], string> = { New: "text-pos", Changed: "text-accent", Removed: "text-ink-3" };
const kindMark: Record<Group["kind"], string> = { New: "+", Changed: "~", Removed: "−" };

export default function WhatsNewPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "What’s new", href: "/whats-new" }]}
        eyebrow="Changelog"
        title="What’s new"
        lead="A dated record of what changes: on this website, on the platforms and instruments, in the legal documents and in the service. It begins with this release; earlier history is not reconstructed."
        quiet
      />

      <section className="section-quiet group/feed" aria-label="Changes">
        <div className="wrap">
          {/* the filter: radio buttons the stylesheet reads; nothing is scripted or stored */}
          <fieldset>
            <legend className="label">Show</legend>
            <div className="mt-8 flex flex-wrap gap-8">
              <label className={pill}>
                <input type="radio" name="feed" id="feed-all" value="all" defaultChecked className="sr-only" />
                Everything
                <span className="num text-xs font-normal text-ink-3">{allChanges.length}</span>
              </label>
              {FEED_KINDS.map((k) => (
                <label key={k.key} className={pill}>
                  <input type="radio" name="feed" id={`feed-${k.key}`} value={k.key} className="sr-only" />
                  {k.name}
                  <span className="num text-xs font-normal text-ink-3">{countOf(k.key)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* what each kind covers */}
          <dl className="mt-21 border-t border-line-strong" aria-label="What each kind covers">
            {FEED_KINDS.map((k) => {
              const n = countOf(k.key);
              return (
                <div key={k.key} className={`grid gap-x-34 gap-y-3 border-b border-line py-13 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto] md:items-baseline ${hideUnless([k.key])}`}>
                  <dt className="font-medium text-ink">{k.name}</dt>
                  <dd className="max-w-measure text-sm text-ink-2">{k.covers}</dd>
                  <dd className="num text-xs text-ink-3">{n === 0 ? "None published" : `${n} ${n === 1 ? "entry" : "entries"}`}</dd>
                </div>
              );
            })}
          </dl>

          {releases.map((r) => (
            <article
              key={r.id}
              id={r.id}
              className={`mt-55 grid scroll-mt-[calc(var(--header-h)+1.3125rem)] gap-x-55 gap-y-21 lg:grid-cols-[13rem_minmax(0,1fr)] ${hideUnless(kindsIn(r.groups.flatMap((g) => g.items)))}`}
              aria-labelledby={`${r.id}-h`}
            >
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2.125rem)] lg:self-start">
                <time dateTime={r.date} className="num font-display text-xl text-ink">
                  {r.dateLabel}
                </time>
                <p className="mt-5">
                  <span className="chip">Current release</span>
                </p>
                <FigureNote figure={<ChangeMarks />} label="Key" className="!mt-21">
                  Each entry is sorted by its mark: + for what is new, ~ for what has changed, − for what was removed.
                </FigureNote>
              </div>
              <div>
                <h2 id={`${r.id}-h`} className="h2">
                  {r.title}
                </h2>
                <p className="lead mt-13 max-w-measure">{r.summary}</p>

                {r.groups.map((g) => (
                  <section key={g.kind} className={`mt-34 ${hideUnless(kindsIn(g.items))}`} aria-label={g.kind}>
                    <h3 className="label flex items-center gap-8 border-b border-line-strong pb-13">
                      <span aria-hidden className={`num inline-grid h-21 w-21 place-items-center rounded-xs border border-line text-sm font-semibold ${kindStyle[g.kind]}`}>
                        {kindMark[g.kind]}
                      </span>
                      {g.kind}
                      <span className="num font-normal text-ink-3">{g.items.length}</span>
                    </h3>
                    <ul>
                      {g.items.map((c) => (
                        <li key={c.t} className={`grid gap-x-34 gap-y-5 border-b border-line py-13 md:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] md:items-baseline ${hideUnless([c.kind])}`}>
                          <div>
                            <p className="font-medium text-ink">{c.t}</p>
                            <p className="mt-2 max-w-measure text-sm text-ink-2">{c.d}</p>
                            <p className="mt-3 text-xs text-ink-3">
                              {kindName(c.kind)} · <time dateTime={r.date}>{r.dateLabel}</time>
                            </p>
                          </div>
                          {c.href && c.go && (
                            <Link href={c.href} className="go min-h-[2.125rem] md:justify-self-end">
                              {c.go}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          ))}

          {/* the kinds that have no entries: said plainly, with where such a notice would come from */}
          {emptyKinds.map((k) => (
            <div key={k} id={`none-${k}`} className={`mt-55 grid scroll-mt-[calc(var(--header-h)+1.3125rem)] gap-x-55 gap-y-13 lg:grid-cols-[13rem_minmax(0,1fr)] ${hideUnless([k])}`}>
              <div className="pt-8">
                <p className="label">{kindName(k)}</p>
                <p className="mt-5">
                  <span className="chip">None published</span>
                </p>
              </div>
              <EmptyState
                title={EMPTY[k].title}
                actions={EMPTY[k].links.map((l) => (
                  <Link key={l.href} href={l.href} className="go min-h-[2.75rem] md:min-h-0">
                    {l.label}
                  </Link>
                ))}
              >
                <p>{EMPTY[k].body}</p>
              </EmptyState>
            </div>
          ))}

          <div className="mt-55 grid gap-x-55 lg:grid-cols-[13rem_minmax(0,1fr)]">
            <p className="label pt-8">Earlier</p>
            <EmptyState title="No earlier entries.">
              <p>This changelog starts with the current release. Changes made before it were not recorded in this form, and they have not been written up after the fact.</p>
            </EmptyState>
          </div>
        </div>
      </section>

      <NextSteps
        items={[
          { kind: "Company", label: "Designing GIO4X", note: "The system behind this release.", href: "/design" },
          { kind: "Directory", label: "Explore GIO4X", note: "Everything, on one page.", href: "/explore" },
          { kind: "Trust", label: "Transparency", note: "What is published, and what is open.", href: "/trust/transparency" },
          { kind: "Help", label: "System status", note: "What is monitored.", href: "/status" },
        ]}
      />
    </>
  );
}
