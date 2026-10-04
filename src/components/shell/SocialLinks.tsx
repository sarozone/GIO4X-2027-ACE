import type { ReactNode } from "react";
import { socials, type SocialKey } from "@/config/destinations";

/**
 * GIO4X's official social profiles, as a row of small marks: in the header
 * (marks only) and in the footer (marks with their names).
 *
 * The addresses come from one place, `socials` in src/config/destinations.ts,
 * and from nowhere else. While that is empty this renders nothing at all: no
 * profile is ever linked from a guess (docs/WAITING-FOR-ABE.md, B7). Adding an
 * address there is all it takes for the mark to appear in both places, in the
 * organisation's structured data and on the Verify page.
 *
 * The marks are plain line drawings in the site's own stroke, not the
 * platforms' logos; each link is named in words for assistive technology.
 */

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  threads: "Threads",
  tiktok: "TikTok",
};

/** the order they are shown in, whatever order they were entered in */
const ORDER: SocialKey[] = ["linkedin", "x", "facebook", "instagram", "youtube", "telegram", "whatsapp", "threads", "tiktok"];

const MARKS: Record<SocialKey, ReactNode> = {
  linkedin: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M6.5 9v5M6.5 6.4v.1M9.5 14V9m0 2.2c0-1.4 1-2.2 2.2-2.2s1.8.8 1.8 2.2V14" />
    </>
  ),
  x: <path d="M4 4l12 12M16 4L4 16" />,
  facebook: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10.8 17.3V9.2c0-1.2.6-1.9 1.9-1.9M8.6 10.6h3.6" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3.2" />
      <path d="M14 5.9v.1" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5" width="15" height="10" rx="3" />
      <path d="M8.6 7.9v4.2l3.6-2.1z" />
    </>
  ),
  telegram: <path d="M16.8 3.6L3 9.2l4.2 1.6 1.6 4.8 2.6-3 3.4 2.6zM7.2 10.8l6-4.2" />,
  whatsapp: (
    <>
      <path d="M3.4 16.6l1-3.4a7 7 0 1 1 2.6 2.5z" />
      <path d="M7.8 7.6c0 2.2 2.4 4.6 4.6 4.6" />
    </>
  ),
  threads: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M12.6 8.2c-.4-1-1.3-1.6-2.6-1.6-1.9 0-3 1.4-3 3.4s1.1 3.4 3 3.4c1.5 0 2.6-.8 2.6-2 0-1.1-.9-1.8-2.3-1.8-1 0-1.7.4-1.7 1.1" />
    </>
  ),
  tiktok: <path d="M11 3.5v9a2.8 2.8 0 1 1-2.8-2.8M11 3.5c.2 2 1.6 3.4 3.6 3.6" />,
};

/** the channels shown before their addresses have been supplied */
const SHOWN: SocialKey[] = ["linkedin", "x", "facebook", "instagram", "youtube", "telegram"];

export function socialEntries(): [SocialKey, string][] {
  return ORDER.flatMap((k) => {
    const url = socials[k];
    // an official profile is always an https address
    return typeof url === "string" && url.startsWith("https://") ? [[k, url] as [SocialKey, string]] : [];
  });
}

/**
 * What the rows show: every channel that has an address, as a link, and the usual channels that do
 * not have one yet, as a mark that is not a link. At the owner's direction (4 October 2026) the marks
 * are shown before the addresses are supplied. A mark without an address leads nowhere and says so:
 * no profile is ever linked from a guess.
 */
export function socialSlots(): { key: SocialKey; url: string | null }[] {
  const linked = new Map(socialEntries());
  return ORDER.filter((k) => linked.has(k) || SHOWN.includes(k)).map((k) => ({ key: k, url: linked.get(k) ?? null }));
}

export function SocialLinks({ names = false, className = "", limit }: { names?: boolean; className?: string; limit?: number }) {
  const slots = socialSlots().slice(0, limit);
  if (slots.length === 0) return null;
  const mark = (key: SocialKey) => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {MARKS[key]}
    </svg>
  );
  const shape = names ? "link-quiet inline-flex min-h-[2.75rem] items-center gap-8 text-sm" : "btn btn-quiet h-[2.125rem] px-5";
  return (
    <ul className={`flex items-center ${names ? "flex-wrap gap-x-21 gap-y-8" : "shrink-0 flex-nowrap gap-0"} ${className}`} aria-label="GIO4X on social media">
      {slots.map(({ key, url }) => (
        <li key={key}>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer me" aria-label={`GIO4X on ${SOCIAL_LABELS[key]} (opens in a new tab)`} title={names ? undefined : SOCIAL_LABELS[key]} className={shape}>
              {mark(key)}
              {names && <span>{SOCIAL_LABELS[key]}</span>}
            </a>
          ) : (
            // no address yet: the mark is shown, and is not a link
            <span role="img" aria-label={`${SOCIAL_LABELS[key]}: link to follow`} title={`${SOCIAL_LABELS[key]}: link to follow`} className={`${shape} cursor-default opacity-70`}>
              {mark(key)}
              {names && <span>{SOCIAL_LABELS[key]}</span>}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
