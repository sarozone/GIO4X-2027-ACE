/**
 * "Was this page helpful?": the rules shared by the control on the website
 * (src/components/shell/PageFeedback.tsx), its endpoint (/api/feedback) and
 * the Control section that reads the answers (/control/feedback).
 *
 * What is kept is a page's path, yes or no, an optional comment and a time,
 * and nothing about the visitor: supabase/migrations/0032_page_feedback.sql.
 */

/** Longest comment. Must equal `page_feedback_comment_valid` in 0032_page_feedback.sql. */
export const FEEDBACK_COMMENT_MAX = 500;

/**
 * The session-storage key that remembers which pages were answered in this
 * tab, so the question is asked once per page per visit. It holds a list of
 * paths and nothing else, and is never sent anywhere. Listed for visitors in
 * the Cookie & Storage Notice (src/data/legal-docs.ts).
 */
export const FEEDBACK_SESSION_KEY = "gx:helpful";

/**
 * The parts of the site whose pages end with the question, by the first
 * segment of the path. Content a person reads to learn or decide something;
 * not the homepage, not a form, not a desk of the visitor's own, never Control.
 */
export const FEEDBACK_SECTIONS = {
  academy: "Academy",
  primers: "Primers",
  guides: "Guides",
  "chart-school": "Chart school",
  strategies: "Strategies",
  playbook: "Playbook",
  "scam-school": "Scam school",
  history: "History",
  money: "Money",
  investing: "Investing",
  "side-by-side": "Side by side",
  glossary: "Glossary",
  tools: "Tools",
  faq: "Help & FAQ",
  intelligence: "Intelligence",
  markets: "Markets",
  trading: "Trading",
  platforms: "Platforms",
  trust: "Trust",
  legal: "Legal",
} as const;

export type FeedbackSection = keyof typeof FEEDBACK_SECTIONS;

/** Lists and indexes inside those sections: pages that lead to content and are not content themselves. */
const NOT_CONTENT = [/^\/intelligence\/blog$/, /^\/intelligence\/blog\/(category|series|author|tag|tags|search)(\/|$)/, /^\/intelligence\/section\//, /^\/markets\/[a-z0-9-]+$/];

/**
 * The section a path belongs to when its page carries the question, or null.
 * A section's own index (/academy, /tools, /glossary) is a list, so the
 * question starts one level down; the FAQ is one page and is the exception.
 */
export function feedbackSection(path: string): FeedbackSection | null {
  if (!path.startsWith("/") || path.length > 200) return null;
  const clean = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const parts = clean.split("/");
  const first = parts[1] ?? "";
  if (!Object.prototype.hasOwnProperty.call(FEEDBACK_SECTIONS, first)) return null;
  if (parts.length < 3 && first !== "faq") return null;
  if (NOT_CONTENT.some((re) => re.test(clean))) return null;
  return first as FeedbackSection;
}

export function isFeedbackSection(value: unknown): value is FeedbackSection {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(FEEDBACK_SECTIONS, value);
}
