"use client";

import { useEffect, useReducer } from "react";

/**
 * Stepping through a dated line: where the visitor is, and whether it is
 * playing by itself. Shared by the two history timelines. Playing only ever
 * starts from the visitor's own press, moves one stop at a time and stops at
 * the last stop, so the sentence that is read aloud never runs ahead.
 */
type State = { step: number; playing: boolean };
type Action = { type: "prev" | "next" | "tick" | "toggle"; count: number };

function reduce(s: State, a: Action): State {
  const last = a.count - 1;
  switch (a.type) {
    case "prev":
      return { step: Math.max(0, s.step - 1), playing: false };
    case "next":
      return { step: Math.min(last, s.step + 1), playing: false };
    case "tick": {
      const step = Math.min(last, s.step + 1);
      return { step, playing: s.playing && step < last };
    }
    case "toggle":
      if (s.playing) return { ...s, playing: false };
      // pressed at the end, Play starts again from the first stop
      return { step: s.step >= last ? 0 : s.step, playing: true };
  }
}

export function useStepper(count: number, ms: number) {
  const [state, send] = useReducer(reduce, { step: 0, playing: false });
  useEffect(() => {
    if (!state.playing) return;
    const id = window.setInterval(() => send({ type: "tick", count }), ms);
    return () => window.clearInterval(id);
  }, [state.playing, count, ms]);
  return {
    step: Math.min(state.step, count - 1),
    playing: state.playing,
    prev: () => send({ type: "prev", count }),
    next: () => send({ type: "next", count }),
    toggle: () => send({ type: "toggle", count }),
  };
}

export function StepControls({ step, count, playing, prev, next, toggle, noun }: { step: number; count: number; playing: boolean; prev: () => void; next: () => void; toggle: () => void; noun: string }) {
  return (
    <div className="no-print mt-13 flex flex-wrap items-center gap-8">
      <button type="button" className="btn btn-ghost" onClick={prev} disabled={step === 0}>
        Previous
      </button>
      <button type="button" className="btn btn-primary" onClick={toggle} aria-pressed={playing}>
        {playing ? "Pause" : step >= count - 1 ? "Play again" : "Play"}
      </button>
      <button type="button" className="btn btn-ghost" onClick={next} disabled={step >= count - 1}>
        Next
      </button>
      <span className="num ml-auto text-sm text-ink-3">
        {noun} {step + 1} of {count}
      </span>
    </div>
  );
}
