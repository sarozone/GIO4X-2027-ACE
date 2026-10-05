"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FEEDBACK_COMMENT_MAX, FEEDBACK_SESSION_KEY, feedbackSection } from "@/lib/feedback";

/**
 * "Was this page helpful?" One quiet line at the foot of a content page
 * (which pages: feedbackSection in src/lib/feedback.ts), mounted once in the
 * site shell. Yes or No, then an optional comment.
 *
 * What is sent is the page's path, the answer and the comment, to
 * /api/feedback, and nothing else: no identifier exists to send. One answer
 * per page per visit: the paths answered in this tab are remembered in
 * session storage (FEEDBACK_SESSION_KEY), which the browser empties when the
 * tab closes and which is never sent anywhere.
 *
 * It keeps out of the way: nothing is drawn until the foot of the page is
 * near and the endpoint has said answers can be stored, so while the table
 * does not exist the question is never asked; and on any failure it puts
 * itself away without a message. An answer is sent once: when the comment is
 * sent or declined, or, if the visitor simply moves on after choosing, as the
 * page is left (without the unsent comment).
 */

type Stage = "hidden" | "waiting" | "ask" | "comment" | "sending" | "done";

/* ---- can answers be stored at all? One question per page load. ------------- */

let available: Promise<boolean> | null = null;

function canStore(): Promise<boolean> {
  available ??= (async () => {
    try {
      const res = await fetch("/api/feedback", { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) return false;
      const data: unknown = await res.json();
      return typeof data === "object" && data !== null && (data as { ok?: unknown }).ok === true;
    } catch {
      return false;
    }
  })();
  return available;
}

/* ---- which pages were answered in this tab --------------------------------- */

function answered(): string[] {
  try {
    const raw = window.sessionStorage.getItem(FEEDBACK_SESSION_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
}

function remember(path: string): void {
  try {
    const list = answered().filter((p) => p !== path);
    list.push(path);
    window.sessionStorage.setItem(FEEDBACK_SESSION_KEY, JSON.stringify(list.slice(-100)));
  } catch {
    /* storage unavailable: the question may be asked again on a later page load */
  }
}

/** Resolves to whether the answer was stored. `keepalive` lets it finish while the page is being left. */
async function post(path: string, helpful: boolean, comment: string, website: string): Promise<boolean> {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ path, helpful, ...(comment ? { comment } : {}), website }),
      cache: "no-store",
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function PageFeedback() {
  const raw = usePathname() ?? "/";
  const path = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  const eligible = feedbackSection(path) !== null;
  const uid = useId();
  const [stage, setStage] = useState<Stage>("hidden");
  const [helpful, setHelpful] = useState(true);
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const thanks = useRef<HTMLParagraphElement>(null);
  /** an answer that was chosen and not yet sent */
  const pending = useRef<{ path: string; helpful: boolean } | null>(null);

  // A new page: start again, and send what the last page was still holding.
  useEffect(() => {
    setComment("");
    setWebsite("");
    // not a page that asks, a page already answered in this tab, or a "not found" drawn at a content address
    setStage(eligible && !answered().includes(path) && !document.querySelector("[data-gx-404]") ? "waiting" : "hidden");
    const flush = () => {
      const held = pending.current;
      if (!held) return;
      pending.current = null;
      void post(held.path, held.helpful, "", "");
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [path, eligible]);

  // Ask the endpoint only once the foot of the page is near: most visits never reach it.
  useEffect(() => {
    if (stage !== "waiting") return;
    let alive = true;
    const decide = () =>
      void canStore().then((ok) => {
        if (alive) setStage((s) => (s === "waiting" ? (ok ? "ask" : "hidden") : s));
      });
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      decide();
      return () => {
        alive = false;
      };
    }
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          seen.disconnect();
          decide();
        }
      },
      { rootMargin: "600px 0px" },
    );
    seen.observe(node);
    return () => {
      alive = false;
      seen.disconnect();
    };
  }, [stage, path]);

  // the buttons that had focus are gone: move it to what replaced them
  useEffect(() => {
    if (stage === "comment") field.current?.focus({ preventScroll: true });
    if (stage === "done") thanks.current?.focus({ preventScroll: true });
  }, [stage]);

  if (stage === "hidden") return null;
  if (stage === "waiting") return <div ref={sentinel} aria-hidden className="h-px" />;

  const choose = (value: boolean) => {
    setHelpful(value);
    pending.current = { path, helpful: value };
    remember(path);
    setStage("comment");
  };

  const send = async (text: string) => {
    const held = pending.current;
    if (!held) return;
    pending.current = null;
    setStage("sending");
    const ok = await post(held.path, held.helpful, text, website);
    // a failure is not the visitor's to solve: the control puts itself away
    setStage(ok ? "done" : "hidden");
  };

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    void send(comment.trim().slice(0, FEEDBACK_COMMENT_MAX));
  };

  const busy = stage === "sending";

  return (
    <aside aria-labelledby={`${uid}-q`} className="hairline no-print">
      <div className="wrap py-21 text-sm">
        {stage === "ask" && (
          <div className="flex flex-wrap items-center gap-x-21 gap-y-8">
            <p id={`${uid}-q`} className="text-ink-2">
              Was this page helpful?
            </p>
            <div className="flex gap-8">
              <button type="button" className="btn btn-ghost btn-sm min-h-[2.75rem] min-w-[4.5rem]" onClick={() => choose(true)}>
                Yes
              </button>
              <button type="button" className="btn btn-ghost btn-sm min-h-[2.75rem] min-w-[4.5rem]" onClick={() => choose(false)}>
                No
              </button>
            </div>
          </div>
        )}

        {(stage === "comment" || stage === "sending") && (
          <form onSubmit={onSubmit} aria-busy={busy} className="relative grid max-w-measure gap-8">
            <p id={`${uid}-q`} className="text-ink-2">
              Thank you. You answered <span className="font-medium text-ink">{helpful ? "Yes" : "No"}</span>.
            </p>
            <div className="field">
              <label htmlFor={`${uid}-c`}>
                {helpful ? "Anything you would add?" : "What was missing or unclear?"} <span className="font-normal normal-case tracking-normal text-ink-3">(optional)</span>
              </label>
              <textarea id={`${uid}-c`} ref={field} className="textarea" rows={3} maxLength={FEEDBACK_COMMENT_MAX} value={comment} onChange={(e) => setComment(e.target.value)} aria-describedby={`${uid}-h`} disabled={busy} />
              <p id={`${uid}-h`} className="field-hint flex flex-wrap justify-between gap-x-13">
                <span>
                  Kept with the page’s address and nothing that identifies you, so it cannot be answered: please leave out personal details. To reach GIO4X, use the{" "}
                  <Link href="/contact" className="link">
                    contact page
                  </Link>
                  .
                </span>
                <span className="num" aria-hidden>
                  {comment.length} / {FEEDBACK_COMMENT_MAX}
                </span>
              </p>
            </div>
            {/* honeypot: hidden from people and assistive technology; must stay empty */}
            <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
              <label htmlFor={`${uid}-w`}>Website</label>
              <input id={`${uid}-w`} name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-8">
              <button type="submit" className="btn btn-primary btn-sm min-h-[2.75rem]" disabled={busy || !comment.trim()}>
                Send comment
              </button>
              <button type="button" className="btn btn-ghost btn-sm min-h-[2.75rem]" disabled={busy} onClick={() => void send("")}>
                No comment
              </button>
            </div>
          </form>
        )}

        {stage === "done" && (
          <p id={`${uid}-q`} ref={thanks} tabIndex={-1} role="status" className="text-ink-2 focus:outline-none">
            Thank you. Your answer has been recorded, without anything that identifies you.
          </p>
        )}
      </div>
    </aside>
  );
}
