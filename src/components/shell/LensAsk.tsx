"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { askSuggestions } from "@/components/shell/ask-suggestions";
import { AI_LIMITS, AI_MESSAGES, type AiEvent, type AiLimit, type AiSource } from "@/lib/ai";

/**
 * ASK GIO4X AI — the one part of the Lens that is a language model.
 *
 * It keeps the limits published on /trust/ai. What the visitor sees of them:
 *   every answer is labelled as written by a language model (the panel's footer)
 *   every answer lists the GIO4X pages it rests on, as links
 *   a route to a person and a "this is wrong" link sit under every answer
 * The text of an answer is shown as text: nothing the model writes becomes a
 * link. Only the numbered sources the server sent are links, and they are
 * pages of this site.
 *
 * The conversation is component state in the Lens: it is never written to
 * storage, to the address bar or to a cookie, and a reload ends it. The
 * server keeps nothing either (src/app/api/ai/route.ts).
 */

export type Exchange = { q: string; a: string; sources: AiSource[]; page: string };

/**
 * A request, from outside the Lens, to arrive in this view ready to type: the
 * "Ask AI" button in the header, the Help window, the question boxes on the
 * homepage and the Help page (AskAi.tsx). `q` is a question to ask straight
 * away, or "" to wait for one. A new object each time, so two requests for the
 * same question are two requests.
 */
export type AskSeed = { q: string };

/* ---- is the assistant there at all? ----------------------------------------- */

let availability: Promise<boolean> | null = null;

/** Asked once per page load, and only where the build has the assistant switched on. */
function loadAvailability(): Promise<boolean> {
  // written into the build by next.config.mjs: where it is off, no request is ever made
  if (process.env.GIO4X_AI_ENABLED !== "true") return Promise.resolve(false);
  availability ??= fetch("/api/ai", { headers: { Accept: "application/json" } })
    .then((r) => (r.ok ? (r.json() as Promise<{ available?: unknown }>) : { available: false }))
    .then((d) => d.available === true)
    .catch(() => false);
  return availability;
}

/**
 * True once the server has said the assistant is switched on and set up. The Lens passes its own
 * `open`, so it asks when it is first opened; the ways in to the assistant (AskAi.tsx, the Help
 * window) pass `true` and ask as the page loads. However many ask, it is one request per page load,
 * and they all get the one answer. It starts false on the server and in the browser alike, so
 * whatever depends on it is absent from the first render of both.
 */
export function useAiAvailable(open: boolean): boolean {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (!open || available) return;
    let alive = true;
    loadAvailability().then((ok) => alive && setAvailable(ok));
    return () => {
      alive = false;
    };
  }, [open, available]);
  return available;
}

/* ---- one answer --------------------------------------------------------------- */

/** The answer as text, with each [n] that names a supplied source turned into a link to that page. */
function AnswerText({ text, sources }: { text: string; sources: AiSource[] }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\[(\d{1,2})\]/g)) {
    const source = sources.find((s) => s.n === Number(m[1]));
    if (!source) continue;
    parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={m.index} href={source.url} className="link num text-xs" aria-label={`Source ${source.n}: ${source.title}`}>
        [{source.n}]
      </Link>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink [overflow-wrap:anywhere]">{parts}</p>;
}

const cited = (answer: string, sources: AiSource[]) => sources.filter((s) => answer.includes(`[${s.n}]`));

function Answer({ x }: { x: Exchange }) {
  const used = cited(x.a, x.sources);
  return (
    <article className="border-t border-line pt-13">
      <p className="label">You asked</p>
      <p className="mt-2 text-sm text-ink-2 [overflow-wrap:anywhere]">{x.q}</p>
      <p className="label mt-13">GIO4X AI · language model</p>
      <div className="mt-2">
        <AnswerText text={x.a} sources={x.sources} />
      </div>
      {used.length > 0 && (
        <ul className="mt-13 grid gap-5 text-sm" aria-label="Sources for this answer">
          {used.map((s) => (
            <li key={s.n} className="flex gap-8">
              <span className="num shrink-0 text-ink-3">[{s.n}]</span>
              <Link href={s.url} className="link min-w-0 [overflow-wrap:anywhere]">
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-13 text-xs text-ink-3">
        <Link href="/contact" className="link">
          Ask a person
        </Link>
        {" · "}
        {/* opens the support form with the subject filled in; nothing of the question or the answer is sent */}
        <Link href={`/support?about=ai-answer&page=${encodeURIComponent(x.page)}#open`} className="link">
          This is wrong
        </Link>
      </p>
    </article>
  );
}

/* ---- the section ---------------------------------------------------------------- */

/** A suggested question, as a button: here and in the question boxes (AskAi.tsx). Tall enough to press with a thumb. */
export const SUGGESTION =
  "inline-flex min-h-[2.125rem] items-center rounded-sm border border-line px-8 py-5 text-left text-[0.8125rem] leading-snug text-ink-2 transition-colors duration-fast hover:border-line-strong hover:text-ink";

type Status = { kind: "idle" } | { kind: "asking"; q: string; text: string; sources: AiSource[] } | { kind: "refused"; message: string; limit?: AiLimit };

export function LensAsk({
  pathname,
  talk,
  setTalk,
  seed = null,
  onSeedUsed,
}: {
  pathname: string;
  talk: Exchange[];
  setTalk: Dispatch<SetStateAction<Exchange[]>>;
  /** asked for from outside the Lens: put the cursor in the box and, if it carries a question, ask it */
  seed?: AskSeed | null;
  onSeedUsed?: () => void;
}) {
  const uid = useId();
  const [question, setQuestion] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  /** read out once, when an answer is complete: the text is not announced word by word as it arrives */
  const [spoken, setSpoken] = useState("");
  const startedAt = useRef(0);
  const request = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    // leaving the tab or closing the Lens stops the answer being written (and paid for)
    return () => request.current?.abort();
  }, []);

  // Arrived here from "Ask AI" or a question box: the cursor goes to the box, and a question that
  // came along is asked. On a timer so that it happens once: an effect that is run, undone and run
  // again (as React does in development) has its first timer cleared before it fires.
  useEffect(() => {
    if (!seed) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      onSeedUsed?.();
      if (seed.q) void send(seed.q);
    }, 0);
    return () => window.clearTimeout(timer);
    // only a new request is a reason to run this again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const asking = status.kind === "asking";
  const left = AI_LIMITS.questionMax - question.length;
  const reachedLimit = status.kind === "refused" && (status.limit === "day" || status.limit === "site");

  function ask(e: FormEvent) {
    e.preventDefault();
    void send(question);
  }

  /** Asks `raw`: what was typed in the box, a suggestion that was pressed, or a question brought in from outside the Lens. */
  async function send(raw: string) {
    const q = raw.replace(/\s+/g, " ").trim().slice(0, AI_LIMITS.questionMax);
    if (q.length < 2 || asking) return;
    const control = new AbortController();
    request.current = control;
    setStatus({ kind: "asking", q, text: "", sources: [] });
    setSpoken("");

    // A suggestion can be pressed, and a question brought in from a box is asked, sooner after this
    // view appears than the endpoint takes a person to be able to ask (minThinkMs). The rest of
    // that moment is waited out here. A question typed in the box took longer than that to type.
    const early = AI_LIMITS.minThinkMs - (Date.now() - startedAt.current);
    if (early > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, early));
      if (control.signal.aborted) return;
    }

    let text = "";
    let sources: AiSource[] = [];
    let failure: string | null = null;
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({
          question: q,
          page: pathname,
          history: talk
            .slice(-AI_LIMITS.historyMax)
            .map((x) => ({ q: x.q.slice(0, AI_LIMITS.historyQuestionMax), a: x.a.slice(0, AI_LIMITS.historyAnswerMax) })),
          website,
          startedAt: startedAt.current,
        }),
        signal: control.signal,
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as { error?: unknown; limit?: unknown } | null;
        const limit = body?.limit === "minute" || body?.limit === "day" || body?.limit === "site" ? body.limit : undefined;
        setStatus({ kind: "refused", message: limit ? AI_MESSAGES[limit] : typeof body?.error === "string" ? body.error : AI_MESSAGES.failed, limit });
        return;
      }

      // Server-Sent Events read by hand (the request is a POST). It reads the same whether the
      // answer arrives piece by piece or, behind a proxy that holds it back, all at once.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        pending += decoder.decode(value, { stream: true });
        let at: number;
        while ((at = pending.indexOf("\n")) >= 0) {
          const row = pending.slice(0, at).trim();
          pending = pending.slice(at + 1);
          if (!row.startsWith("data:")) continue;
          let event: AiEvent;
          try {
            event = JSON.parse(row.slice(5)) as AiEvent;
          } catch {
            continue;
          }
          if (event.type === "sources") sources = event.sources;
          else if (event.type === "delta") text += event.text;
          else if (event.type === "error") failure = event.error;
          if (event.type === "sources" || event.type === "delta") setStatus({ kind: "asking", q, text, sources });
        }
      }
    } catch {
      if (control.signal.aborted) return; // the panel was closed: nothing to show
      failure = AI_MESSAGES.failed;
    }

    const answer = text.trim();
    if (failure || !answer) {
      setStatus({ kind: "refused", message: failure ?? AI_MESSAGES.failed });
      return;
    }
    setTalk((t) => [...t, { q, a: answer, sources, page: pathname }]);
    setSpoken(`GIO4X AI answered: ${answer.replace(/\[\d{1,2}\]/g, "")}`);
    setQuestion("");
    setStatus({ kind: "idle" });
  }

  return (
    <div className="grid gap-21">
      <form onSubmit={ask} className="field" noValidate>
        <label htmlFor={`${uid}-q`}>Ask GIO4X AI</label>
        <div className="flex gap-8">
          <input
            id={`${uid}-q`}
            ref={inputRef}
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
            disabled={reachedLimit}
          />
          <button type="submit" className="btn btn-primary shrink-0" disabled={asking || reachedLimit || question.trim().length < 2}>
            {asking ? "Answering" : "Ask"}
          </button>
        </div>
        <p id={`${uid}-hint`} className="text-xs text-ink-3">
          It explains what GIO4X has published and links to the pages. It does not give advice, predict prices or act on an account. Do not type passwords, codes or account details.
          {left <= 100 && <span className="num"> {left} characters left.</span>}
        </p>
        {/* honeypot: hidden from people and assistive technology; must stay empty */}
        <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
          <label htmlFor={`${uid}-website`}>Website</label>
          <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </form>

      {/* one announcement per answer, for screen readers; the visible text below is not a live region */}
      <p className="sr-only" role="status" aria-live="polite">
        {asking ? "GIO4X AI is answering." : spoken}
      </p>

      {status.kind === "refused" && (
        <p role="alert" className="border-l-2 border-line-strong pl-13 text-sm text-ink-2">
          {status.message}{" "}
          <Link href="/contact" className="link">
            Contact a person
          </Link>
        </p>
      )}

      <div className="grid gap-21" aria-live="off">
        {status.kind === "asking" && (
          <article className="border-t border-line pt-13" aria-busy="true">
            <p className="label">You asked</p>
            <p className="mt-2 text-sm text-ink-2 [overflow-wrap:anywhere]">{status.q}</p>
            <p className="label mt-13">GIO4X AI · language model</p>
            <div className="mt-2">{status.text ? <AnswerText text={status.text} sources={status.sources} /> : <p className="text-sm text-ink-3">Reading GIO4X’s pages…</p>}</div>
          </article>
        )}
        {[...talk].reverse().map((x, i) => (
          <Answer key={talk.length - i} x={x} />
        ))}
      </div>

      {talk.length === 0 && status.kind === "idle" && (
        <>
          <p className="text-sm text-ink-2">Answers come only from pages GIO4X has published. Where those pages are silent, it says so and points you to a person.</p>
          {/* somewhere to start: three questions the published pages answer, chosen by the part of the site this page is in */}
          <div>
            <p id={`${uid}-try`} className="label">
              Questions to start with
            </p>
            <ul className="mt-8 grid gap-5" aria-labelledby={`${uid}-try`}>
              {askSuggestions(pathname).map((s) => (
                <li key={s}>
                  <button type="button" className={SUGGESTION} onClick={() => void send(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
