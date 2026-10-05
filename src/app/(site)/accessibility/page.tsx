import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * ACCESSIBILITY STATEMENT — what the site does for people who use a keyboard,
 * a screen reader, larger text, higher contrast or no motion; what it does
 * not do yet; and how to report a problem.
 *
 * The rule this page keeps: it describes only what the code does. Each item
 * under "What the site does" was checked against the code when it was written
 * (the place is named beside each group below), and anything that could not
 * be checked is under "Known limits" instead. No conformance level is claimed
 * and no audit is mentioned, because there has been none. When a control is
 * added, removed or renamed, this page changes with it and REVIEWED moves.
 */

/** the day this statement was last checked against the code */
const REVIEWED = "2026-10-05";
const REVIEWED_LABEL = "5 October 2026";

const DESCRIPTION =
  "The GIO4X accessibility statement: keyboard use and visible focus, the contrast, text-size and motion controls in the display menu, reduced motion, screen-reader labelling, how canvas figures are handled, printing, the known limits, and how to report a problem. No formal conformance level is claimed.";

export const metadata = pageMeta({ title: "Accessibility statement", description: DESCRIPTION, path: "/accessibility", modifiedTime: REVIEWED });

type Group = { id: string; title: string; items: string[] };

const DOES: Group[] = [
  {
    // src/components/shell/SiteHeader.tsx, SiteShell.tsx, CommandBar.tsx, Appearance.tsx; src/styles/globals.css (:focus-visible)
    id: "keyboard",
    title: "Keyboard and focus",
    items: [
      "The first stop of the Tab key on every page is a “Skip to content” link, which moves past the header to the page itself.",
      "Whatever has keyboard focus is marked by a two-pixel outline in the accent colour, set a little way off the element so that it is not hidden by it.",
      "The menus in the header open from the keyboard as well as by pointer. Escape closes a menu, the display settings or the search, and returns focus to the button that opened it.",
      "Search opens with Ctrl and K (Command and K on a Mac) or with the / key. Its results are moved through with the arrow keys and opened with Enter.",
      "On small screens, links and buttons in lists are built to be at least 44 pixels high.",
    ],
  },
  {
    // src/lib/prefs.ts (motion, contrast, text, effects, links), src/components/shell/Appearance.tsx, src/styles/tokens.css, src/styles/globals.css
    id: "display",
    title: "The display menu",
    items: [
      "The half-shaded circle in the header, labelled “Display settings”, opens the controls. The same controls, with a few more, are on the preferences page.",
      "Higher contrast darkens secondary text and the lines between things in the light theme, and lightens them in the dark theme.",
      "Larger text raises the base size of text across the site by one eighth.",
      "Reduce motion stops animations and transitions.",
      "Light, Dark, Auto (which follows the device) and Sun (light by day and dark by night, estimated from the device’s clock) choose the theme.",
      "On the preferences page only: Low visual effects turns off glass surfaces, canvas scenes and background animation; Underline links underlines every link in the body of a page; and Pointer effects can be switched off.",
      "Each choice is kept in this browser and nowhere else, and applies to every page at once.",
    ],
  },
  {
    // src/styles/globals.css (prefers-reduced-motion), src/components/figures/Figure.tsx
    id: "motion",
    title: "Reduced motion",
    items: [
      "If the device is set to reduce motion, the site follows that setting without being asked: animations and transitions are cut to nothing and smooth scrolling is switched off.",
      "The Reduce motion switch in the display menu does the same for a visitor whose device is not set that way.",
      "A canvas figure draws one composed still frame in either case, and stops drawing while it is off the screen or the tab is hidden.",
      "Nothing on the site plays sound unless interface sounds have been switched on in the preferences. They are off by default.",
    ],
  },
  {
    // src/components/ui/Page.tsx (Breadcrumbs, PageHero), src/components/shell/Appearance.tsx (Toggle), src/app/layout.tsx (lang)
    id: "readers",
    title: "Screen readers",
    items: [
      "Each page has one main heading and headings in order beneath it, a main region, and labelled navigation regions: the primary menu, the breadcrumb trail and, on long pages, the list of what is on the page.",
      "Controls have names. A button that shows only an icon has a text label; a switch reports whether it is on; a button that opens something reports whether it is open.",
      "Data tables are written with a caption and with header cells for their rows and columns. Values that change while a page is open are announced politely, without interrupting.",
      "The language of the page is declared, and a passage in another language inside a page is marked as such.",
      "A rise or a fall in a figure is shown with a sign and a mark as well as a colour.",
    ],
  },
  {
    // src/components/figures/Figure.tsx (aria-hidden on the host), src/components/ui/Page.tsx (cx-stage aria-hidden)
    id: "figures",
    title: "Canvas figures and scenes",
    items: [
      "The animated scene at the top of each page and the small drawn figures beside sections are decoration. They are hidden from assistive technology, and they carry no meaning that the text beside them does not also state.",
      "A figure never shows a price, a statistic or anything that could be read as live data.",
      "The calculators are built from ordinary fields, sliders and buttons with labels, and state their results in text.",
    ],
  },
  {
    // src/styles/globals.css (@media print), src/components/figures/Figure.tsx (beforeprint)
    id: "print",
    title: "Print",
    items: [
      "A page sent to a printer, or saved as a PDF, is set in black on white without the header, the footer, the breadcrumb trail or the page’s own navigation.",
      "The address of an external link is printed after it, so that a link is not lost on paper.",
      "Headings are kept with the text that follows them, and tables and figures are not split across pages where that can be avoided.",
    ],
  },
];

const LIMITS: { title: string; text: string }[] = [
  {
    title: "No audit, and no conformance level",
    text: "This site has not been audited by an independent body, and this statement claims no conformance level under any standard. It describes what was built and what the people who built it checked.",
  },
  {
    title: "Third-party chart embeds",
    text: "Charts and the economic calendar from TradingView are that company’s software, shown in a frame. Each frame has a title, and by default it loads only when its button is pressed. What happens inside the frame, including its keyboard and screen-reader behaviour, is not under GIO4X’s control.",
  },
  {
    title: "Canvas scenes are decorative",
    text: "The scenes and figures are hidden from assistive technology on purpose and have no text alternative of their own. The meaning is in the text beside them. If a page seems to depend on a picture you cannot perceive, that is a fault and we would like to hear of it.",
  },
  {
    title: "Some laboratories lean on sight and a pointer",
    text: "Several pages in GIO4X Labs are visual machines, some of them in three dimensions or worked by dragging. Their results are stated in text, but the experience of operating them has not been made equal for every way of using a computer.",
  },
  {
    title: "Translations are awaiting review",
    text: "The pages in languages other than English were written without a human translator and say so. Until a qualified translator has reviewed them, the English version prevails, and the legal documents are in English only.",
  },
  {
    title: "Contrast has not been measured everywhere",
    text: "There are eleven built-in accent colours and a custom one, each in a light and a dark theme. Contrast has not been measured for every combination. If text is hard to read, the Higher contrast switch is the remedy, and a report helps us fix the cause.",
  },
  {
    title: "System high-contrast modes",
    text: "The site’s own Higher contrast switch is separate from a high-contrast or forced-colours mode set in the operating system. The public pages have not been tested in those modes.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/accessibility", name: "Accessibility statement", description: DESCRIPTION })} />
      <PageHero
        quiet
        crumbs={[{ name: "Accessibility statement", href: "/accessibility" }]}
        eyebrow="Support · accessibility"
        title="Accessibility statement"
        lead="What this site does for people who use a keyboard, a screen reader, larger text, higher contrast or no motion; what it does not do yet; and how to tell us when something is in the way. It claims no formal standard."
      >
        <Link href="/preferences" className="btn btn-primary">
          Display preferences
        </Link>
        <Link href="#report" className="btn btn-ghost">
          Report a problem
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="does-h">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-55">
          <nav aria-label="On this page" className="no-print min-w-0">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
              <p className="eyebrow">On this page</p>
              <ul className="mt-13 flex flex-wrap gap-x-21 lg:grid lg:gap-0">
                {[...DOES.map((g) => ({ id: g.id, label: g.title })), { id: "limits", label: "Known limits" }, { id: "report", label: "Report a problem" }].map((c) => (
                  <li key={c.id}>
                    <a href={`#${c.id}`} className="link-quiet flex min-h-[2.75rem] items-center text-sm">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-13 text-sm text-ink-3">
                <span className="label mr-8">Last checked</span>
                <time dateTime={REVIEWED} className="num">
                  {REVIEWED_LABEL}
                </time>
              </p>
            </div>
          </nav>

          <div className="min-w-0">
            <p className="eyebrow">What the site does</p>
            <h2 id="does-h" className="h2 mt-13 max-w-[22ch]">
              Built in, not added on.
            </h2>
            <p className="lead mt-13 max-w-measure">Each item below describes something the site does today. It was checked against the code on the date shown, and nothing is listed because it is intended.</p>

            {DOES.map((g) => (
              <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="mt-34 scroll-mt-[var(--header-h)] border-t border-line pt-21">
                <h3 id={`${g.id}-h`} className="h3">
                  {g.title}
                </h3>
                <ul className="mt-13 grid max-w-measure gap-8 text-ink-2">
                  {g.items.map((x) => (
                    <li key={x} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                      <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
                {g.id === "display" && (
                  <Link href="/preferences" className="go mt-13 min-h-[2.75rem] md:min-h-[2.125rem]">
                    All display preferences
                  </Link>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="limits" className="section hairline scroll-mt-[var(--header-h)] bg-paper" aria-labelledby="limits-h">
        <div className="wrap">
          <p className="eyebrow">Known limits</p>
          <h2 id="limits-h" className="h2 mt-13 max-w-[22ch]">
            What it does not do yet.
          </h2>
          <p className="lead mt-13 max-w-measure">Stated plainly, so that nobody has to find them out by running into them.</p>
          <dl className="mt-34 grid border-l border-t border-line md:grid-cols-2">
            {LIMITS.map((l) => (
              <div key={l.title} className="border-b border-r border-line bg-bg p-21">
                <dt className="h4">{l.title}</dt>
                <dd className="mt-8 text-sm text-ink-2">{l.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="report" className="section hairline scroll-mt-[var(--header-h)]" aria-labelledby="report-h">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-x-55 gap-y-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow">Report a problem</p>
            <h2 id="report-h" className="h2 mt-13 max-w-[22ch]">
              Tell us what was in the way.
            </h2>
            <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
              <p>
                If something on this site cannot be reached, read or operated in the way you use a computer or a telephone, write to us through the{" "}
                <Link href="/contact" className="link">
                  contact form
                </Link>{" "}
                or at{" "}
                <a href={`mailto:${site.email}`} className="link">
                  {site.email}
                </a>
                .
              </p>
              <p>It helps to say which page it was, what you were trying to do, what happened instead, and what you were using: the browser, the device, and any assistive technology such as a screen reader or a magnifier. None of that is required. A one-line report is welcome too.</p>
              <p>If you need something on this site in another form, such as the text of a page that depends on a figure, ask for it the same way.</p>
            </div>
          </div>
          <div className="min-w-0">
            <div className="panel p-21">
              <p className="label">This statement</p>
              <dl className="mt-8">
                <div className="flex items-baseline justify-between gap-21 border-b border-line py-13">
                  <dt className="text-sm text-ink-3">Last checked against the code</dt>
                  <dd className="num text-right text-[0.9375rem] font-medium text-ink">
                    <time dateTime={REVIEWED}>{REVIEWED_LABEL}</time>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-21 border-b border-line py-13">
                  <dt className="text-sm text-ink-3">Independent audit</dt>
                  <dd className="text-right text-[0.9375rem] font-medium text-ink">None</dd>
                </div>
                <div className="flex items-baseline justify-between gap-21 py-13">
                  <dt className="text-sm text-ink-3">Conformance level claimed</dt>
                  <dd className="text-right text-[0.9375rem] font-medium text-ink">None</dd>
                </div>
              </dl>
              <p className="mt-8 text-xs text-ink-3">It is revised when a control is added, removed or renamed, and the date moves with it.</p>
            </div>
          </div>
        </div>
      </section>

      <NextSteps
        items={[
          { kind: "Preferences", label: "Display & privacy", href: "/preferences", note: "Every display control, and what the site stores." },
          { kind: "Company", label: "Contact", href: "/contact", note: "Write to us." },
          { kind: "Design", label: "Designing GIO4X", href: "/design", note: "How the site is put together." },
          { kind: "Support", label: "Help & FAQ", href: "/faq", note: "Answers to common questions." },
        ]}
      />
    </>
  );
}
