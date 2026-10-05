import { NoAccess } from "@/components/control/bits";
import { controlMeta, firstParam } from "@/components/control/format";
import { FeedbackView } from "@/components/control/views/FeedbackView";
import { feedbackSection, isFeedbackSection, type FeedbackSection } from "@/lib/feedback";
import { can, requireStaff } from "@/lib/server/staff";
import type { PageFeedbackRow, PageFeedbackTally } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const metadata = controlMeta("Page feedback", "/control/feedback");

/** How many of the newest comments are shown. */
const COMMENTS = 100;

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

/** page_feedback_tallies() is printed as figures, so its shape is checked before it is believed. */
function isTally(row: unknown): row is PageFeedbackTally {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return typeof r.path === "string" && isCount(r.yes_all) && isCount(r.no_all) && isCount(r.yes_30) && isCount(r.no_30) && typeof r.last_at === "string";
}

/**
 * Page feedback: what readers answered to "Was this page helpful?" at the foot
 * of the website's content pages. Per page, the answers of each kind over all
 * time and over the last 30 days; and the newest comments with their page.
 * The filters arrive as query parameters and are checked against allow-lists
 * before they reach the database.
 *
 * `feedback.read`, checked here and again by the database: the tallies come
 * from page_feedback_tallies(), which refuses anyone else, and the comments
 * are read as the signed-in member of staff through row-level security.
 */
export default async function FeedbackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const ctx = await requireStaff();
  if (!ctx) return null;
  if (!can(ctx, "feedback.read")) return <NoAccess title="Page feedback" />;
  const { supabase } = ctx;

  const params = await searchParams;
  const sectionParam = firstParam(params.section);
  const section: FeedbackSection | "" = isFeedbackSection(sectionParam) ? sectionParam : "";
  const verdictParam = firstParam(params.verdict);
  const verdict: "yes" | "no" | "" = verdictParam === "yes" || verdictParam === "no" ? verdictParam : "";

  let comments = supabase.from("page_feedback").select("id, created_at, path, helpful, comment").neq("comment", "");
  // a section key is a fixed word from the allow-list, so it cannot alter the filter
  if (section) comments = comments.like("path", `/${section}%`);
  if (verdict) comments = comments.eq("helpful", verdict === "yes");

  const [tallied, commented] = await Promise.all([supabase.rpc("page_feedback_tallies"), comments.order("created_at", { ascending: false }).limit(COMMENTS)]);

  const failed = !!tallied.error || !Array.isArray(tallied.data) || !tallied.data.every(isTally);
  const all = failed ? [] : (tallied.data as PageFeedbackTally[]);
  const tallies = all
    .filter((t) => (!section || feedbackSection(t.path) === section) && (verdict === "yes" ? t.yes_all > 0 : verdict === "no" ? t.no_all > 0 : true))
    // with "No" chosen, the pages most often found unhelpful lead; otherwise the pages with the most answers
    .sort((a, b) => (verdict === "no" ? b.no_all - a.no_all : verdict === "yes" ? b.yes_all - a.yes_all : b.yes_all + b.no_all - (a.yes_all + a.no_all)) || a.path.localeCompare(b.path));

  return (
    <FeedbackView
      section={section}
      verdict={verdict}
      failed={failed}
      tallies={tallies}
      pagesInAll={all.length}
      comments={(commented.data ?? []) as PageFeedbackRow[]}
      commentsFailed={!!commented.error}
      commentLimit={COMMENTS}
    />
  );
}
