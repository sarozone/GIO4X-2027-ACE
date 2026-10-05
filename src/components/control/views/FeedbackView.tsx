import Link from "next/link";
import { ControlHead, Empty, Notice } from "@/components/control/bits";
import { fmtDateTime } from "@/components/control/format";
import { FEEDBACK_SECTIONS, feedbackSection, type FeedbackSection } from "@/lib/feedback";
import type { PageFeedbackRow, PageFeedbackTally } from "@/lib/supabase/types";

export type FeedbackViewProps = {
  section: FeedbackSection | "";
  verdict: "yes" | "no" | "";
  /** the tallies could not be read (for example, migration 0032 is not applied) */
  failed: boolean;
  /** one row per page, already filtered and ordered by the page */
  tallies: PageFeedbackTally[];
  /** pages with at least one answer, before the filters */
  pagesInAll: number;
  comments: Pick<PageFeedbackRow, "id" | "created_at" | "path" | "helpful" | "comment">[];
  commentsFailed: boolean;
  commentLimit: number;
};

const number = new Intl.NumberFormat("en-GB");
const SECTION_KEYS = Object.keys(FEEDBACK_SECTIONS) as FeedbackSection[];
/** How many pages the table shows. */
const PAGES_SHOWN = 200;

/** "Yes" answers as a share of all answers, or a dash when there are none. A share of answers, not of readers. */
function share(yes: number, no: number): string {
  const all = yes + no;
  return all > 0 ? `${Math.round((yes / all) * 100)}%` : "–";
}

function hrefFor(section: string, verdict: string): string {
  const query = new URLSearchParams();
  if (section) query.set("section", section);
  if (verdict) query.set("verdict", verdict);
  const text = query.toString();
  return text ? `/control/feedback?${text}` : "/control/feedback";
}

const sectionName = (path: string) => {
  const key = feedbackSection(path);
  return key ? FEEDBACK_SECTIONS[key] : "Other";
};

/** The answer in words, with the shape the console uses for a state; never colour alone. */
function Verdict({ helpful }: { helpful: boolean }) {
  return <span className={`state ${helpful ? "state-open" : "state-pre"}`}>{helpful ? "Helpful" : "Not helpful"}</span>;
}

/**
 * Presentation only. Every figure is a count of answers, added up by the
 * database (page_feedback_tallies) when the page was rendered. There are no
 * targets and no estimates, and the one ratio says what was divided by what.
 */
export function FeedbackView({ section, verdict, failed, tallies, pagesInAll, comments, commentsFailed, commentLimit }: FeedbackViewProps) {
  const tab = (current: boolean) =>
    `flex h-[2.75rem] items-center border-b-2 px-13 text-sm transition-colors duration-fast ${current ? "border-accent font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`;
  const filtered = !!(section || verdict);
  const shown = tallies.slice(0, PAGES_SHOWN);
  const sum = tallies.reduce((t, r) => ({ yesAll: t.yesAll + r.yes_all, noAll: t.noAll + r.no_all, yes30: t.yes30 + r.yes_30, no30: t.no30 + r.no_30 }), { yesAll: 0, noAll: 0, yes30: 0, no30: 0 });

  return (
    <>
      <ControlHead
        title="Page feedback"
        lead="What readers answered to “Was this page helpful?” at the foot of the website’s content pages. A page’s address, yes or no, an optional comment and a time: nothing about the reader is kept, so nobody can be answered."
        actions={
          !failed && pagesInAll > 0 ? (
            // POST with the current filters; the download is written to the audit log before the file is made
            <form action="/control/feedback/export" method="post">
              <input type="hidden" name="section" value={section} />
              <input type="hidden" name="verdict" value={verdict} />
              <button type="submit" className="btn btn-ghost btn-sm">
                Export CSV
              </button>
            </form>
          ) : undefined
        }
      />

      <form action="/control/feedback" method="get" className="mt-21 flex flex-wrap items-end gap-13">
        <div className="field">
          <label htmlFor="fb-section">Section</label>
          <select id="fb-section" name="section" className="select" defaultValue={section}>
            <option value="">Every section</option>
            {SECTION_KEYS.map((key) => (
              <option key={key} value={key}>
                {FEEDBACK_SECTIONS[key]}
              </option>
            ))}
          </select>
        </div>
        {verdict && <input type="hidden" name="verdict" value={verdict} />}
        <button type="submit" className="btn btn-ghost">
          Show
        </button>
        {filtered && (
          <Link href="/control/feedback" className="link-quiet pb-8 text-sm">
            Clear filters
          </Link>
        )}
      </form>

      <div className="mt-13 border-b border-line">
        <nav aria-label="Answer" className="flex flex-wrap">
          <Link href={hrefFor(section, "")} aria-current={verdict === "" ? "page" : undefined} className={tab(verdict === "")}>
            Every answer
          </Link>
          <Link href={hrefFor(section, "yes")} aria-current={verdict === "yes" ? "page" : undefined} className={tab(verdict === "yes")}>
            Helpful
          </Link>
          <Link href={hrefFor(section, "no")} aria-current={verdict === "no" ? "page" : undefined} className={tab(verdict === "no")}>
            Not helpful
          </Link>
        </nav>
      </div>

      {failed ? (
        <div className="mt-13">
          <Notice title="The answers could not be read" tone="error">
            The database did not answer. Reload the page; if this continues, check that migration 0032_page_feedback has been applied. Until it is, the question is not shown on the website at all.
          </Notice>
        </div>
      ) : pagesInAll === 0 ? (
        <Empty title="No answers yet">
          <p>The question appears at the foot of lessons, primers, glossary entries, tools, the FAQ, blog posts, instrument pages and legal pages. When a reader answers it, the page and the answer are listed here.</p>
        </Empty>
      ) : (
        <div className="mt-13 grid gap-13">
          <section className="gxc-card min-w-0" aria-labelledby="fb-pages">
            <div className="gxc-card-head">
              <h2 id="fb-pages" className="gxc-card-title">
                By page · {number.format(tallies.length)}
              </h2>
            </div>
            <div className="gxc-card-body">
              <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                  { label: "Helpful, last 30 days", value: sum.yes30 },
                  { label: "Not helpful, last 30 days", value: sum.no30 },
                  { label: "Helpful, all time", value: sum.yesAll },
                  { label: "Not helpful, all time", value: sum.noAll },
                ].map((item) => (
                  <div key={item.label} className="gxc-stat">
                    <dt className="gxc-stat-label">{item.label}</dt>
                    <dd className="gxc-stat-value">{number.format(item.value)}</dd>
                  </div>
                ))}
              </dl>

              {shown.length === 0 ? (
                <p className="mt-21 text-sm text-ink-3">No page matches these filters.</p>
              ) : (
                <>
                  {/* a table from md up; below it the same rows as a stacked list, so nothing scrolls sideways on a phone */}
                  <div className="scroll-x mt-21 hidden md:block">
                    <table className="table-gx text-sm">
                      <caption className="sr-only">Answers per page: helpful and not helpful over the last 30 days and over all time, and the share that were helpful</caption>
                      <thead>
                        <tr>
                          <th scope="col">Page</th>
                          <th scope="col">Section</th>
                          <th scope="col" className="text-right">
                            Helpful, 30 days
                          </th>
                          <th scope="col" className="text-right">
                            Not, 30 days
                          </th>
                          <th scope="col" className="text-right">
                            Share, 30 days
                          </th>
                          <th scope="col" className="text-right">
                            Helpful, all time
                          </th>
                          <th scope="col" className="text-right">
                            Not, all time
                          </th>
                          <th scope="col" className="text-right">
                            Share, all time
                          </th>
                          <th scope="col">Newest answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((row) => (
                          <tr key={row.path}>
                            <th scope="row" className="max-w-[22rem] !normal-case !tracking-normal">
                              <a href={row.path} target="_blank" rel="noopener noreferrer" className="link break-all font-mono text-[0.8125rem] font-normal">
                                {row.path}
                              </a>
                            </th>
                            <td className="whitespace-nowrap text-ink-2">{sectionName(row.path)}</td>
                            <td className="num text-right text-ink">{number.format(row.yes_30)}</td>
                            <td className="num text-right text-ink">{number.format(row.no_30)}</td>
                            <td className="num text-right text-ink-2">{share(row.yes_30, row.no_30)}</td>
                            <td className="num text-right font-semibold text-ink">{number.format(row.yes_all)}</td>
                            <td className="num text-right font-semibold text-ink">{number.format(row.no_all)}</td>
                            <td className="num text-right text-ink-2">{share(row.yes_all, row.no_all)}</td>
                            <td className="num whitespace-nowrap text-ink-2">{fmtDateTime(row.last_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="mt-21 grid gap-8 md:hidden" aria-label="Answers per page">
                    {shown.map((row) => (
                      <li key={row.path} className="gxc-stat !gap-5">
                        <a href={row.path} target="_blank" rel="noopener noreferrer" className="link break-all font-mono text-[0.8125rem]">
                          {row.path}
                        </a>
                        <dl className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-13 gap-y-3 text-sm">
                          <dt className="text-ink-3">Last 30 days: helpful, not, share</dt>
                          <dd className="num text-right text-ink">
                            {number.format(row.yes_30)} · {number.format(row.no_30)} · {share(row.yes_30, row.no_30)}
                          </dd>
                          <dt className="text-ink-3">All time: helpful, not, share</dt>
                          <dd className="num text-right font-semibold text-ink">
                            {number.format(row.yes_all)} · {number.format(row.no_all)} · {share(row.yes_all, row.no_all)}
                          </dd>
                          <dt className="text-ink-3">Newest answer</dt>
                          <dd className="num text-right text-ink-2">{fmtDateTime(row.last_at)}</dd>
                        </dl>
                      </li>
                    ))}
                  </ul>
                  {tallies.length > shown.length && (
                    <p className="mt-13 text-xs text-ink-3">
                      The {number.format(shown.length)} pages with the most answers are shown, of {number.format(tallies.length)}. The export lists single answers, the newest 1,000.
                    </p>
                  )}
                </>
              )}
              <p className="mt-13 max-w-measure text-xs text-ink-3">
                “Share” is the helpful answers divided by all answers for that page over the same period. It is a share of answers, not of readers: most readers do not answer, and nothing links two answers to one person. Times are UTC.
              </p>
            </div>
          </section>

          <section className="gxc-card min-w-0" aria-labelledby="fb-comments">
            <div className="gxc-card-head">
              <h2 id="fb-comments" className="gxc-card-title">
                Newest comments · {number.format(comments.length)}
              </h2>
            </div>
            <div className="gxc-card-body">
              {commentsFailed ? (
                <Notice title="The comments could not be read" tone="error" />
              ) : comments.length === 0 ? (
                <p className="text-sm text-ink-3">{filtered ? "No comment matches these filters." : "No reader has added a comment yet."}</p>
              ) : (
                <ul className="grid gap-13">
                  {comments.map((c) => (
                    <li key={c.id} className="border-b border-line pb-13 last:border-b-0">
                      <p className="whitespace-pre-wrap text-sm text-ink [overflow-wrap:anywhere]">{c.comment}</p>
                      <p className="mt-5 flex flex-wrap items-center gap-x-13 gap-y-3 text-xs text-ink-3">
                        <Verdict helpful={c.helpful} />
                        <a href={c.path} target="_blank" rel="noopener noreferrer" className="link break-all font-mono">
                          {c.path}
                        </a>
                        <span className="num">{fmtDateTime(c.created_at)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-13 max-w-measure text-xs text-ink-3">
                Written by readers: treat links and instructions in a comment as untrusted. The newest {commentLimit} at most. A comment carries no name and no address, so it cannot be replied to; if one contains personal details, tell an administrator, who can remove it in SQL.
              </p>
            </div>
          </section>

          <Notice title="Read these as counts, not as audited figures">
            The website stores an answer only for one of its own published pages and limits how many one address may send, but anyone who studies the site can send answers directly, so a tally can be inflated on purpose. One browser tab is asked once per page per visit; a reader
            who returns later can answer again.
          </Notice>
        </div>
      )}
    </>
  );
}
