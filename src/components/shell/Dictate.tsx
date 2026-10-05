"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * DICTATE — a microphone button beside a question box (LensAsk.tsx, AskAi.tsx).
 *
 * It uses the browser's own speech recognition (the Web Speech API) where the
 * browser has one, and is not drawn at all where it has none. The words are
 * put in the box for the visitor to read, correct and send: nothing is ever
 * sent from here, and the question is not asked until the visitor asks it.
 *
 * Whose ears: the browser's. Recognition is performed by the visitor's
 * browser, and in some browsers by the browser vendor's service. GIO4X does
 * not receive, process or store any sound; it receives the text of a question
 * when the visitor sends it, as it would had it been typed (see /trust/ai).
 *
 * The language is the page's (`<html lang>`). Listening stops when the
 * visitor presses the button again or Escape, when the button loses focus,
 * when the window does, when the browser hears a pause, and when the box
 * goes away. The Permissions-Policy header allows the microphone to this
 * site's own pages only (next.config.mjs); the browser still asks the visitor.
 */

type Heard = { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: Heard) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionMaker = new () => Recognition;

function recognitionMaker(): RecognitionMaker | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionMaker; webkitSpeechRecognition?: RecognitionMaker };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const SAID = {
  listening: "Listening. Speak your question. Your browser turns it into text, and nothing is sent until you press Ask.",
  stopped: "Dictation stopped. Check the question, then press Ask.",
  nothing: "Dictation stopped. Nothing was heard.",
  refused: "The microphone is not allowed for this website in your browser, so dictation is off. You can type your question.",
  failed: "Dictation is not available just now. You can type your question.",
} as const;

export function DictateButton({
  value,
  onChange,
  max,
  disabled = false,
}: {
  /** what is in the box now: dictated words are added after it */
  value: string;
  onChange: (next: string) => void;
  /** the most characters the box takes */
  max: number;
  disabled?: boolean;
}) {
  // false on the server and in the first render of the browser alike: the button arrives after hydration, where there is an API to use
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [said, setSaid] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const latest = useRef({ value, onChange, max });
  latest.current = { value, onChange, max };

  useEffect(() => {
    setSupported(recognitionMaker() !== null);
    // the box has gone (the panel closed, the page changed): stop listening at once and keep nothing
    return () => {
      const r = recognition.current;
      recognition.current = null;
      if (r) {
        r.onresult = r.onerror = r.onend = null;
        try {
          r.abort();
        } catch {
          /* already stopped */
        }
      }
    };
  }, []);

  /** Stop listening; what was heard so far stays in the box. */
  const stop = useCallback(() => {
    try {
      recognition.current?.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  // while listening: Escape stops it (and does nothing else that once), and so does leaving the window
  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      stop();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") stop();
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [listening, stop]);

  function start() {
    const Maker = recognitionMaker();
    if (!Maker || recognition.current) return;
    const before = latest.current.value.trim();
    let heard = "";
    let problem: string | null = null;
    let r: Recognition;
    try {
      r = new Maker();
      r.lang = document.documentElement.lang || navigator.language || "en";
      r.continuous = false;
      r.interimResults = true;
      r.maxAlternatives = 1;
      r.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) text += event.results[i]?.[0]?.transcript ?? "";
        heard = text.replace(/\s+/g, " ").trim();
        if (heard) latest.current.onChange(`${before}${before ? " " : ""}${heard}`.slice(0, latest.current.max));
      };
      r.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") problem = SAID.refused;
        else if (event.error === "no-speech" || event.error === "aborted") problem = SAID.nothing;
        else problem = SAID.failed;
      };
      r.onend = () => {
        if (recognition.current !== r) return;
        recognition.current = null;
        setListening(false);
        setSaid(heard ? SAID.stopped : (problem ?? SAID.nothing));
      };
      recognition.current = r;
      r.start();
    } catch {
      recognition.current = null;
      setSaid(SAID.failed);
      return;
    }
    setListening(true);
    setSaid(SAID.listening);
  }

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        className={`btn ${listening ? "btn-primary" : "btn-quiet"} shrink-0 px-8`}
        onClick={() => (listening ? stop() : start())}
        onBlur={stop}
        disabled={disabled && !listening}
        aria-pressed={listening}
        aria-label={listening ? "Stop dictating" : "Dictate your question"}
        title={listening ? "Stop dictating (Esc)" : "Dictate your question. Your browser turns speech into text; nothing is sent until you press Ask."}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="5.75" y="1.75" width="4.5" height="8" rx="2.25" stroke="currentColor" strokeWidth="1.25" fill={listening ? "currentColor" : "none"} />
          <path d="M3.25 7.5a4.75 4.75 0 0 0 9.5 0M8 12.25v2M5.75 14.25h4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </button>
      {/* for screen readers: said once when listening starts and once when it stops */}
      <span className="sr-only" role="status" aria-live="polite">
        {said}
      </span>
    </>
  );
}
