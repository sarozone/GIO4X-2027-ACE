"use client";

import { useId, useState } from "react";
import { PrintButton } from "@/components/ui/PrintButton";
import { riskWarning } from "@/config/legal";
import { answered, fromFile, isEmpty, limitOf, LIMITS, PLAN_KEYS, PLAN_SECTIONS, toFile, type Plan, type PlanField, type PlanKey } from "./record";
import { clearPlan, replacePlan, setAnswer, usePlan } from "./store";

/**
 * THE TRADING PLAN BUILDER: a form of questions, and beneath it the plan as
 * the visitor has written it, set out to be printed.
 *
 * The rules it keeps: the page asks and records. No field has a default, an
 * example answer or a suggested figure, and nothing here judges an answer.
 * The plan is kept in this browser under one key (./store) and is sent
 * nowhere; "Export" builds a JSON file inside the browser and "Import" reads
 * one back with the File API, checked in full before anything is replaced
 * (./record). On paper only the written plan prints: the form and the buttons
 * are left out.
 */

function Question({ field, value, disabled, onChange }: { field: PlanField; value: string; disabled: boolean; onChange: (v: string) => void }) {
  const id = `plan-${field.key}`;
  const max = limitOf(field.key as PlanKey);
  const near = value.length >= max * 0.9;
  return (
    <div className="field content-start">
      <label htmlFor={id}>{field.label}</label>
      {field.lines ? (
        <textarea id={id} className="textarea" rows={4} maxLength={max} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-describedby={`${id}-note`} />
      ) : (
        <input id={id} className="input" type="text" autoComplete="off" maxLength={max} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-describedby={`${id}-note`} />
      )}
      <p id={`${id}-note`} className="field-hint min-h-[1.25rem]">
        {field.hint}
        {near && (
          <span className="num ml-8 whitespace-nowrap text-ink-2">
            {value.length} of {max} characters
          </span>
        )}
      </p>
    </div>
  );
}

/** The plan as written: what is printed. An unanswered question is shown as unanswered, never filled in. */
function Written({ plan }: { plan: Plan }) {
  const title = plan.title.trim() || "Trading plan";
  return (
    <article className="panel p-21 sm:p-34 print:border-0 print:p-0" aria-labelledby="plan-written-title">
      <header className="border-b border-line-strong pb-13">
        <p className="eyebrow">Trading plan</p>
        <h3 id="plan-written-title" className="h2 mt-8 break-words">
          {title}
        </h3>
        {plan.written.trim() !== "" && <p className="mt-8 text-sm text-ink-2">Written or last revised: {plan.written}</p>}
      </header>
      {PLAN_SECTIONS.filter((s) => s.key !== "about").map((s, i) => (
        <section key={s.key} className="border-b border-line py-21 [break-inside:avoid]" aria-labelledby={`plan-w-${s.key}`}>
          <h4 id={`plan-w-${s.key}`} className="h4">
            <span className="num mr-8 text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </h4>
          <dl className="mt-13 grid gap-13">
            {s.fields.map((f) => {
              const v = plan[f.key].trim();
              return (
                <div key={f.key}>
                  <dt className="text-sm text-ink-3">{f.label}</dt>
                  <dd className={`mt-3 max-w-measure whitespace-pre-wrap break-words ${v ? "text-ink" : "text-ink-3"}`}>{v || "Not answered yet."}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
      <footer className="pt-13 text-xs text-ink-3">
        <p>The questions are from the GIO4X trading plan builder. The answers are the author’s own: GIO4X has not seen, checked or approved them, and nothing in this plan is advice.</p>
        <p className="mt-5">{riskWarning}</p>
      </footer>
    </article>
  );
}

export function PlanBuilder() {
  const { ready, plan } = usePlan();
  const inputId = useId();
  const [message, setMessage] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, setPending] = useState<{ plan: Plan; answers: number } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const empty = isEmpty(plan);
  const count = answered(plan);
  const say = (ok: string | null, bad: string | null = null) => {
    setMessage(ok);
    setProblem(bad);
  };
  const NOT_KEPT = "This browser would not store the plan (its storage is switched off or full). It is on the page for this visit only: export it to a file to keep it.";

  const type = (key: PlanKey, value: string) => {
    setConfirmClear(false);
    if (setAnswer(key, value)) {
      if (problem === NOT_KEPT) say(null);
    } else say(null, NOT_KEPT);
  };

  const download = () => {
    setPending(null);
    setConfirmClear(false);
    if (empty) {
      say("There is nothing to export yet: no question has an answer.");
      return;
    }
    try {
      const day = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(new Blob([toFile(plan, day)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `gio4x-trading-plan-${day}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2600);
      say(`Exported ${count} ${count === 1 ? "answer" : "answers"} to a file. It is saved by your browser, on this device, and was not sent anywhere.`);
    } catch {
      say(null, "The file could not be created in this browser.");
    }
  };

  const readFile = async (file: File | undefined) => {
    setPending(null);
    setConfirmClear(false);
    if (!file) return;
    if (file.size > LIMITS.file) {
      say(null, "The file is larger than a plan file can be, so it was not read. Nothing was changed.");
      return;
    }
    let text = "";
    try {
      text = await file.text();
    } catch {
      say(null, "The file could not be read. Nothing was changed.");
      return;
    }
    const check = fromFile(text);
    if (!check.ok) {
      say(null, `${check.reason} Nothing was changed.`);
      return;
    }
    if (empty) {
      // nothing here to replace, so there is nothing to confirm
      const kept = replacePlan(check.plan);
      say(kept ? `Imported ${check.answers} ${check.answers === 1 ? "answer" : "answers"} from the file.` : null, kept ? null : NOT_KEPT);
      return;
    }
    say(null);
    setPending({ plan: check.plan, answers: check.answers });
  };

  const confirmImport = () => {
    if (!pending) return;
    const kept = replacePlan(pending.plan);
    say(kept ? `Imported ${pending.answers} ${pending.answers === 1 ? "answer" : "answers"}. They replaced what was here.` : null, kept ? null : NOT_KEPT);
    setPending(null);
  };

  const clear = () => {
    setPending(null);
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    clearPlan();
    say("The plan was cleared. Nothing of it is stored in this browser now.");
  };

  return (
    <div>
      {/* ---- the questions: left out on paper ---- */}
      <div className="print:hidden">
        <form className="grid gap-34" noValidate onSubmit={(e) => e.preventDefault()} aria-label="The questions of the plan">
          {PLAN_SECTIONS.map((s, i) => (
            <fieldset key={s.key} className="min-w-0 border-t border-line-strong pt-21" disabled={!ready}>
              <legend className="h4 float-left mb-13 w-full">
                <span className="num mr-8 text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </legend>
              <div className={`clear-both grid gap-x-21 gap-y-13 ${s.key === "about" ? "sm:grid-cols-2" : ""}`}>
                {s.fields.map((f) => (
                  <Question key={f.key} field={f} value={plan[f.key]} disabled={!ready} onChange={(v) => type(f.key, v)} />
                ))}
              </div>
            </fieldset>
          ))}
        </form>

        <div className="mt-34 border-t border-line-strong pt-21">
          <p className="text-sm text-ink-2">
            {!ready ? (
              "The plan appears once the page has loaded."
            ) : (
              <>
                <span className="num font-semibold text-ink">{count}</span> of <span className="num">{PLAN_KEYS.length}</span> questions answered. Kept in this browser as you type; sent nowhere.
              </>
            )}
          </p>
          <div className="mt-13 flex flex-wrap items-center gap-13">
            <PrintButton>Print the plan, or save as PDF</PrintButton>
            <button type="button" className="btn btn-ghost" onClick={download} disabled={!ready}>
              Export to a file
            </button>
            <label htmlFor={inputId} className={`btn btn-ghost cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent)] ${ready ? "" : "pointer-events-none opacity-50"}`}>
              Import from a file
              <input
                id={inputId}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                disabled={!ready}
                onChange={(e) => {
                  void readFile(e.target.files?.[0]);
                  // the same file can be chosen again after a refusal
                  e.target.value = "";
                }}
              />
            </label>
            <button type="button" className="btn btn-quiet" onClick={clear} disabled={!ready || empty}>
              {confirmClear ? "Yes, clear every answer" : "Clear the plan"}
            </button>
            {confirmClear && (
              <button type="button" className="btn btn-quiet" onClick={() => setConfirmClear(false)}>
                Keep it
              </button>
            )}
          </div>
          {confirmClear && <p className="mt-8 max-w-measure text-sm text-ink-2">Clearing deletes every answer from this browser. It cannot be undone: export the plan first if you want a copy.</p>}

          {pending && (
            <div className="panel mt-21 max-w-measure p-21" role="group" aria-label="Confirm import">
              <p className="h4">Replace the plan on this page?</p>
              <p className="mt-8 text-sm text-ink-2">
                The file was checked and holds {pending.answers} {pending.answers === 1 ? "answer" : "answers"}. Importing it replaces all {count} of the answers here, including any the file leaves empty.
              </p>
              <div className="mt-21 flex flex-wrap gap-13">
                <button type="button" className="btn btn-primary" onClick={confirmImport}>
                  Replace with the file
                </button>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => {
                    setPending(null);
                    say("Import cancelled. Nothing was changed.");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <p role="status" aria-live="polite" className="mt-13 max-w-measure text-sm text-ink-2">
            {message}
          </p>
          {problem && (
            <p role="alert" className="mt-5 max-w-measure border-l-2 border-[var(--warn)] pl-13 text-sm text-ink">
              {problem}
            </p>
          )}
        </div>

        <h3 className="eyebrow mt-55">The plan, as written</h3>
        <p className="mt-8 max-w-measure text-sm text-ink-3">This is what prints. It follows the answers above as you type them.</p>
      </div>

      <div className="mt-21 print:mt-0">
        <Written plan={plan} />
      </div>
    </div>
  );
}
