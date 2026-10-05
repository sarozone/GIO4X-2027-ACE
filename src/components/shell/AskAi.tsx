"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { askSuggestions } from "@/components/shell/ask-suggestions";
import { openLensAsk } from "@/components/shell/Lens";
import { SUGGESTION, useAiAvailable } from "@/components/shell/LensAsk";
import { AI_LIMITS } from "@/lib/ai";

/**
 * WAYS IN TO GIO4X AI — the assistant itself is the Lens's "Ask" view
 * (LensAsk.tsx) and nothing here answers anything. These are the signposts:
 *   AskAiButton  the "Ask AI" button in the site header
 *   AskAiBox     a question box for a page (the homepage, Help & FAQ)
 * Each opens the Lens on "Ask"; the box hands its question over to be asked
 * there, so every answer is read in the one place that carries the label, the
 * sources and the route to a person.
 *
 * Nothing here is drawn unless the assistant is available: the same check the
 * Lens makes (useAiAvailable), shared, so it is still one request per page
 * load. Where the build has the assistant switched off no request is made and
 * none of this exists.
 */

export function AiGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M7 1.6 8.4 5.6 12.4 7 8.4 8.4 7 12.4 5.6 8.4 1.6 7 5.6 5.6z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M12.6 10.6v3.2M11 12.2h3.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The header's button. It is the caller's to show or not (the header asks
 * useAiAvailable once, for this and for its drawer). The mark alone where the
 * row is narrow, with its name for assistive technology and as a tooltip; the
 * words "Ask AI" from 1280px, where the language menu also joins the row.
 */
export function AskAiButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={`btn btn-quiet h-[2.125rem] gap-5 px-8 normal-case tracking-normal ${className}`} onClick={() => openLensAsk()} aria-label="Ask GIO4X AI" title="Ask GIO4X AI">
      <AiGlyph />
      <span aria-hidden className="hidden text-[0.8125rem] font-medium min-[1280px]:inline">
        Ask AI
      </span>
    </button>
  );
}

/**
 * A question box for a page. Typing a question, or pressing one of the
 * suggestions, opens the Lens on "Ask" with that question asked. Nothing is
 * sent from here.
 *
 * An <aside>, not a <section>, and no heading of its own: the homepage's story
 * and the gap figures both look for sections, and this is neither a chapter
 * nor a gap. It arrives after the page has loaded (see above), so it is kept
 * slim.
 */
export function AskAiBox({ className = "hairline hairline-b" }: { className?: string }) {
  const uid = useId();
  const pathname = usePathname();
  const available = useAiAvailable(true);
  const [question, setQuestion] = useState("");

  if (!available) return null;

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const q = question.replace(/\s+/g, " ").trim();
    if (q.length < 2) return;
    openLensAsk(q);
    setQuestion("");
  };

  return (
    <aside aria-label="Ask GIO4X AI" className={`no-print bg-paper ${className}`}>
      <div className="wrap grid gap-13 py-21 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:items-start lg:gap-34">
        <div>
          <p className="label">GIO4X AI · language model</p>
          <p className="h4 mt-5">Ask about anything on this website.</p>
          {/* the same disclosure the "Ask" view carries in its footer */}
          <p className="mt-8 max-w-[52ch] text-xs text-ink-3">
            Answered by a language model from GIO4X&rsquo;s own pages. Not advice. It can be wrong: check the source.{" "}
            <Link href="/trust/ai" className="link">
              AI at GIO4X
            </Link>
          </p>
        </div>
        <div>
          <form onSubmit={ask} className="flex gap-8" noValidate>
            <label htmlFor={`${uid}-q`} className="sr-only">
              Your question for GIO4X AI
            </label>
            <input
              id={`${uid}-q`}
              className="input min-w-0 flex-1"
              type="text"
              inputMode="text"
              enterKeyHint="send"
              autoComplete="off"
              maxLength={AI_LIMITS.questionMax}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="How does a margin call work?"
              aria-describedby={`${uid}-hint`}
            />
            <button type="submit" className="btn btn-primary shrink-0" disabled={question.trim().length < 2}>
              Ask
            </button>
          </form>
          <p id={`${uid}-hint`} className="sr-only">
            The answer opens in the GIO4X Lens panel. Do not type passwords, codes or account details.
          </p>
          <ul className="mt-13 flex flex-wrap gap-8" aria-label="Questions to start with">
            {askSuggestions(pathname, 4).map((s) => (
              <li key={s}>
                <button type="button" className={SUGGESTION} onClick={() => openLensAsk(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
