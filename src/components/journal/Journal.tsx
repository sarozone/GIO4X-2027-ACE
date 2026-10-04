"use client";

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { clamp, lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, Note, Stage } from "@/components/labs/kit";
import { PrintButton } from "@/components/ui/PrintButton";
import { EMPTY_DRAFT, LIMITS, checkDraft, fromCsv, toCsv, toDraft, type Draft, type Field } from "./record";
import { DAYS, MIN_GROUP, MIN_TRADES, MOODS, journalStats, type Group } from "./stats";
import { addMany, addTrade, changeTrade, clearJournal, removeTrade, useJournal, type Saved } from "./store";

/**
 * THE TRADING JOURNAL — a private record of the visitor's own trades.
 *
 * The visitor writes a trade down (what, which way, how much, in and out, what
 * it came to, what the plan was, what happened, the mood, whether the plan was
 * followed). The page keeps the list, works the figures out from it
 * (./stats.ts), draws the running total, and can turn the list into a CSV
 * file, read that file back, print it, or delete it.
 *
 * The rule it keeps: the journal never leaves this browser. It is held under
 * one localStorage key (./store.ts); there is no request anywhere in this
 * component. The result of a trade is typed by the visitor and never worked
 * out here, because the page cannot know a contract size or a cost. Every
 * figure is arithmetic on past trades, with its definition beside it, and
 * none of it is advice or a forecast.
 */

const PLAY_SECONDS = 2.6;
/** how many trades the table shows before "Show all" */
const SHOWN = 20;
/** a file larger than this is not read at all */
const MAX_FILE_BYTES = 2_000_000;

const fmt = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n))}`;
const price = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 8 });
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;

/** today in the visitor's own time zone, as YYYY-MM-DD. Called only from an effect or an event handler. */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** An id for a new trade: the clock and four random characters. Called only from an event handler. */
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6).padEnd(4, "0");

const NOT_YET = "Not enough trades yet";

const WHY: Record<Exclude<Saved, { ok: true }>["why"], string> = {
  full: `The journal holds ${LIMITS.trades} trades and is full. Export it, then delete the trades you no longer need.`,
  unsaved: "This browser would not keep it: its storage is switched off or full. Nothing was changed.",
  gone: "That trade is no longer in the journal. It may have been deleted in another tab.",
  invalid: "That trade could not be saved.",
};

type Notice = { tone: "ok" | "error"; text: string } | null;

const ORDER: Field[] = ["date", "instrument", "side", "size", "entry", "exit", "stop", "result", "plan", "happened", "mood", "followed"];

export function Journal() {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const { ready, trades, rev } = useJournal();
  const stats = useMemo(() => journalStats(trades), [trades]);

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [formNote, setFormNote] = useState<Notice>(null);
  const [fileNote, setFileNote] = useState<Notice>(null);
  const [asking, setAsking] = useState<string | null>(null);
  const [askingAll, setAskingAll] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [today, setToday] = useState("");
  /** rises on "Play again", so the curve is drawn again from the left */
  const [run, setRun] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  // the date starts at today, which only the browser knows
  useEffect(() => {
    const day = localToday();
    setToday(day);
    setDraft((d) => (d.date ? d : { ...d, date: day }));
  }, []);

  const set = (k: Field, value: string) => {
    setDraft((d) => ({ ...d, [k]: value }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const fresh = (): Draft => ({ ...EMPTY_DRAFT, date: localToday() });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const day = localToday();
    const checked = checkDraft(draft);
    const found: Partial<Record<Field, string>> = checked.ok ? {} : { ...checked.errors };
    if (!found.date && draft.date.trim() > day) found.date = "A journal records what has happened: the date cannot be after today.";
    const first = ORDER.find((k) => found[k]);
    if (!checked.ok || first) {
      setErrors(found);
      const count = ORDER.filter((k) => found[k]).length;
      setFormNote({ tone: "error", text: `Nothing was saved: ${plural(count, "field needs", "fields need")} attention.` });
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    const res = editing ? changeTrade(editing, checked.body) : addTrade(newId(), checked.body);
    if (!res.ok) {
      setFormNote({ tone: "error", text: WHY[res.why] });
      if (res.why === "gone") setEditing(null);
      return;
    }
    setFormNote({ tone: "ok", text: editing ? "The trade was changed. It is kept in this browser only." : "The trade was added. It is kept in this browser only." });
    setEditing(null);
    setErrors({});
    setDraft(fresh());
  };

  const edit = (tradeId: string) => {
    const t = trades.find((x) => x.id === tradeId);
    if (!t) return;
    setDraft(toDraft(t));
    setErrors({});
    setEditing(tradeId);
    setAsking(null);
    setFormNote(null);
    form.current?.scrollIntoView({ block: "start" });
    document.getElementById(id("date"))?.focus({ preventScroll: true });
  };

  const cancelEdit = () => {
    setEditing(null);
    setErrors({});
    setDraft(fresh());
    setFormNote(null);
  };

  const remove = (tradeId: string) => {
    const res = removeTrade(tradeId);
    setAsking(null);
    if (!res.ok) return setFileNote({ tone: "error", text: WHY[res.why] });
    if (editing === tradeId) cancelEdit();
    setFileNote({ tone: "ok", text: "The trade was deleted." });
  };

  const removeAll = () => {
    const n = trades.length;
    const res = clearJournal();
    setAskingAll(false);
    if (!res.ok) return setFileNote({ tone: "error", text: WHY[res.why] });
    cancelEdit();
    setShowAll(false);
    setFileNote({ tone: "ok", text: `${cap(plural(n, "trade"))} deleted. The journal is empty and nothing of it is kept in this browser.` });
  };

  const exportCsv = () => {
    if (!trades.length) return;
    try {
      // the mark at the start tells a spreadsheet the file is UTF-8; it is taken off again on import
      const blob = new Blob(["﻿", toCsv(trades)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trading-journal-${localToday()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFileNote({ tone: "ok", text: `A file with ${plural(trades.length, "trade")} was made in this browser. Your browser has saved it, or asked where to. Keep it somewhere safe: it is the only copy outside this browser.` });
    } catch {
      setFileNote({ tone: "error", text: "This browser could not make the file." });
    }
  };

  const importCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (picker.current) picker.current.value = "";
    if (!file) return;
    const refuse = (text: string) => setFileNote({ tone: "error", text: `Nothing was imported. ${text}` });
    if (file.size > MAX_FILE_BYTES) return refuse("That file is too large to be a journal exported from this page.");
    let text = "";
    try {
      text = await file.text();
    } catch {
      return refuse("That file could not be read.");
    }
    const read = fromCsv(text);
    if (!read.ok) return refuse(read.error);
    const day = localToday();
    const late = read.bodies.find((b) => b.date > day);
    if (late) return refuse(`A trade in that file is dated ${late.date}, which is after today. A journal records what has happened.`);
    const stem = newId();
    const res = addMany(stem, read.bodies);
    if (!res.ok) {
      if (res.why === "full") return refuse(`The journal holds ${LIMITS.trades} trades and has room for ${res.room}. That file would add more.`);
      return refuse(WHY[res.why]);
    }
    const already = res.already ? ` ${cap(plural(res.already, "trade"))} in the file ${res.already === 1 ? "was" : "were"} already here and ${res.already === 1 ? "was" : "were"} left as ${res.already === 1 ? "it is" : "they are"}.` : "";
    setFileNote({ tone: "ok", text: res.added ? `${cap(plural(res.added, "trade"))} imported.${already}` : `Nothing new was in that file.${already}` });
  };

  /* ---- the running total --------------------------------------------- */

  const equity = stats.equity;
  const draw = useMemo<FigureDraw>(() => {
    void run;
    /** the moment this drawing began: each new list of trades, and each "Play again", draws from the left */
    let from = -1;
    const results = trades.map((t) => t.result);
    return ({ ctx, w, h, t, pal, still }) => {
      if (w < 100 || h < 60) return;
      if (from < 0) from = t;
      const p = still ? 1 : smooth(clamp((t - from) / PLAY_SECONDS));
      const n = equity.length;
      const padX = 12;
      const top = 30;
      const bottom = h - 14;
      const pts = [0, ...equity];
      let lo = 0;
      let hi = 0;
      for (const v of pts) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      const span = hi - lo || 1;
      const x = (i: number) => lerp(padX, w - padX, n ? i / n : 0);
      const y = (v: number) => lerp(bottom, top, (v - lo) / span);

      ctx.font = `600 10px ${pal.font}`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = rgba(pal.ink3, 1);
      ctx.fillText(n ? "RUNNING TOTAL · YOUR OWN ENTRIES" : "NO TRADES WRITTEN YET", padX, 12);

      // the line everything starts from
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = rgba(pal.ink3, 0.8);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, y(0));
      ctx.lineTo(w - padX, y(0));
      ctx.stroke();
      ctx.setLineDash([]);
      if (!n) return;

      const reach = p * n;
      const whole = Math.floor(reach);
      const part = reach - whole;
      const headV = whole >= n ? pts[n]! : lerp(pts[whole]!, pts[whole + 1]!, part);
      const headX = x(reach);
      const colour = headV >= 0 ? pal.emerald : ALERT;

      const trace = () => {
        ctx.beginPath();
        ctx.moveTo(x(0), y(0));
        for (let i = 1; i <= whole; i++) ctx.lineTo(x(i), y(pts[i]!));
        if (whole < n) ctx.lineTo(headX, y(headV));
      };
      // a faint wash between the line and zero
      trace();
      ctx.lineTo(headX, y(0));
      ctx.closePath();
      ctx.fillStyle = rgba(pal.accent, 0.1);
      ctx.fill();

      trace();
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.stroke();

      // one mark for each trade, green for a gain and red for a loss, while there is room for them
      if (n <= 80) {
        for (let i = 1; i <= whole; i++) {
          const r = results[i - 1] ?? 0;
          ctx.fillStyle = rgba(r > 0 ? pal.emerald : r < 0 ? ALERT : pal.ink3, 1);
          ctx.beginPath();
          ctx.arc(x(i), y(pts[i]!), 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = rgba(colour, 1);
      ctx.beginPath();
      ctx.arc(headX, y(headV), 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = "right";
      ctx.fillStyle = rgba(pal.ink, 1);
      ctx.fillText(signed(pts[Math.min(n, whole)]!), w - padX, 12);
      ctx.textAlign = "left";
    };
  }, [equity, trades, run]);

  let peak = 0;
  let trough = 0;
  equity.forEach((v, i) => {
    if (v > equity[peak]!) peak = i;
    if (v < equity[trough]!) trough = i;
  });
  const n = stats.n;
  const sentence = !ready
    ? "The journal is read from this browser once the page has loaded."
    : n === 0
      ? "No trade is written here yet, so the line rests at zero."
      : n === 1
        ? `One trade is written here, and the running total stands at ${signed(stats.net)}.`
        : `Over ${plural(n, "trade")} the running total went from zero to ${signed(stats.net)}. It was highest at ${signed(equity[peak]!)}, after trade ${peak + 1}, and lowest at ${signed(equity[trough]!)}, after trade ${trough + 1}.`;

  /* ---- the figures, each with what it means ---------------------------- */

  const enough = n >= MIN_TRADES;
  const or = (v: number | null, show: (x: number) => string, none: string) => (!enough ? NOT_YET : v === null ? none : show(v));
  const tiles: { k: string; v: string; d: string }[] = [
    { k: "Trades", v: n.toLocaleString("en-GB"), d: `Every trade written in the journal. It holds up to ${LIMITS.trades}.` },
    { k: "Net result", v: enough ? signed(stats.net) : NOT_YET, d: "The sum of every result: the point where the curve ends." },
    { k: "Share that gained", v: or(stats.gainShare, (x) => `${pct(x)} (${stats.gained} of ${n})`, NOT_YET), d: "Trades with a result above zero ÷ all trades. A result of exactly zero is neither a gain nor a loss." },
    { k: "Average gain", v: or(stats.avgGain, signed, "No gaining trade yet"), d: "The sum of the gains ÷ the number of trades that gained." },
    { k: "Average loss", v: or(stats.avgLoss, signed, "No losing trade yet"), d: "The sum of the losses ÷ the number of trades that lost." },
    { k: "Expectancy per trade", v: or(stats.expectancy, signed, NOT_YET), d: "The net result ÷ the number of trades: what one of these trades came to on average. It describes the trades written here, not the next one." },
    { k: "Profit factor", v: or(stats.profitFactor, (x) => x.toFixed(2), "No losing trade yet"), d: "The sum of the gains ÷ the sum of the losses. Above 1 the gains were the larger; below 1 the losses were." },
    { k: "Largest gain", v: or(stats.largestGain, signed, "No gaining trade yet"), d: "The single highest result." },
    { k: "Largest loss", v: or(stats.largestLoss, signed, "No losing trade yet"), d: "The single lowest result." },
    { k: "Longest losing run", v: enough ? plural(stats.losingRun, "trade") : NOT_YET, d: "The most losing trades one after another, by date. A result of exactly zero ends a run." },
  ];

  const sending = !ready;
  const hiddenRows = showAll ? 0 : Math.max(0, n - SHOWN);

  const field = (k: Field, label: ReactNode, control: (p: { id: string; "aria-invalid": boolean; "aria-describedby": string | undefined }) => ReactNode, hint?: string) => (
    <div className="field">
      <label htmlFor={id(k)}>{label}</label>
      {control({ id: id(k), "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? id(`${k}-err`) : hint ? id(`${k}-hint`) : undefined })}
      {errors[k] ? (
        <p id={id(`${k}-err`)} className="field-error">
          {errors[k]}
        </p>
      ) : hint ? (
        <p id={id(`${k}-hint`)} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
  const optional = <span className="normal-case tracking-normal text-ink-3">(optional)</span>;
  const numeric = (k: Field, label: ReactNode, hint?: string, keys: "decimal" | "text" = "decimal") =>
    field(k, label, (p) => <input {...p} className="input num" type="text" inputMode={keys} autoComplete="off" spellCheck={false} maxLength={20} value={draft[k]} onChange={(e) => set(k, e.target.value)} disabled={sending} />, hint);

  return (
    <div>
      <p className="hidden text-sm text-ink-2 print:block">Printed{today ? ` on ${today}` : ""} from the browser the journal is kept in. A record of past trades, as the person who made them wrote them down. Past results say nothing about future ones.</p>

      {/* ---- write a trade down ---- */}
      <form ref={form} onSubmit={submit} noValidate className="panel grid scroll-mt-[calc(var(--header-h)+1.3125rem)] gap-13 p-21 print:hidden" aria-labelledby={id("form-h")}>
        <div className="flex flex-wrap items-baseline justify-between gap-8">
          <h3 id={id("form-h")} className="h4">
            {editing ? "Change a trade" : "Write a trade down"}
          </h3>
          <p className="text-xs text-ink-3">
            {ready ? `${plural(n, "trade")} of ${LIMITS.trades}` : "Reading the journal…"}
          </p>
        </div>

        <div className="grid gap-13 sm:grid-cols-2 lg:grid-cols-4">
          {field("date", "Date", (p) => <input {...p} className="input" type="date" max={today || undefined} value={draft.date} onChange={(e) => set("date", e.target.value)} disabled={sending} required />)}
          {field("instrument", "Instrument", (p) => <input {...p} className="input" type="text" maxLength={LIMITS.instrument} autoComplete="off" spellCheck={false} value={draft.instrument} onChange={(e) => set("instrument", e.target.value)} disabled={sending} required />, "What was traded, in your own words.")}
          {field("side", "Side", (p) => (
            <select {...p} className="select" value={draft.side} onChange={(e) => set("side", e.target.value)} disabled={sending}>
              <option value="long">Long (bought)</option>
              <option value="short">Short (sold)</option>
            </select>
          ))}
          {numeric("size", "Size", "Lots, units or contracts, as you count them.")}
          {numeric("entry", "Entry price")}
          {numeric("exit", "Exit price")}
          {numeric("stop", <>Stop {optional}</>, "Where the stop was when the trade opened.")}
          {numeric("result", "Result", "In your account currency. A loss has a minus sign: -42.50.", "text")}
        </div>

        <div className="grid gap-13 lg:grid-cols-2">
          {field(
            "plan",
            <>What the plan was {optional}</>,
            (p) => <textarea {...p} className="textarea h-auto py-8" rows={3} maxLength={LIMITS.text} value={draft.plan} onChange={(e) => set("plan", e.target.value)} disabled={sending} />,
            `${draft.plan.length} of ${LIMITS.text} characters.`,
          )}
          {field(
            "happened",
            <>What happened {optional}</>,
            (p) => <textarea {...p} className="textarea h-auto py-8" rows={3} maxLength={LIMITS.text} value={draft.happened} onChange={(e) => set("happened", e.target.value)} disabled={sending} />,
            `${draft.happened.length} of ${LIMITS.text} characters.`,
          )}
        </div>

        <div className="grid gap-13 sm:grid-cols-2 lg:grid-cols-4">
          {field("mood", "Mood at the time", (p) => (
            <select {...p} className="select" value={draft.mood} onChange={(e) => set("mood", e.target.value)} disabled={sending} required>
              <option value="">Choose</option>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {cap(m)}
                </option>
              ))}
            </select>
          ))}
          {field("followed", "Followed my plan", (p) => (
            <select {...p} className="select" value={draft.followed} onChange={(e) => set("followed", e.target.value)} disabled={sending} required>
              <option value="">Choose</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-8 border-t border-line pt-13">
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {editing ? "Save the change" : "Add to the journal"}
          </button>
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
              Leave it as it was
            </button>
          )}
        </div>
        <p className={formNote?.tone === "error" ? "field-error" : "text-sm text-ink-2"} role={formNote?.tone === "error" ? "alert" : "status"}>
          {formNote?.text ?? ""}
        </p>
        <p className="text-xs text-ink-3">The result is the figure from your own statement, typed by you. This page does not work it out from the prices: it cannot know a contract size, a commission or a swap. Do not write account numbers or passwords in the notes.</p>
      </form>

      {/* ---- the running total ---- */}
      <div className="mt-34 grid items-start gap-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] print:mt-13 print:block">
        <div className="min-w-0 print:hidden">
          <Stage draw={draw} ratio={2.1} rev={rev + run} />
        </div>
        <div>
          <p className="eyebrow">The running total</p>
          <p className="mt-8 min-h-[4.5rem] text-ink-2 print:min-h-0" aria-live="polite">
            {sentence}
          </p>
          <Note>Each point is the sum of your results up to that trade, in date order. It is drawn from what you typed. It is a record of the past and not a forecast.</Note>
          <button type="button" className="btn btn-ghost btn-sm mt-13 print:hidden" onClick={() => setRun((r) => r + 1)} disabled={n < 2}>
            Draw it again
          </button>
        </div>
      </div>

      {/* ---- the figures ---- */}
      <div className="mt-34 border-t border-line pt-21">
        <h3 className="h4">The figures, and what each one means</h3>
        <p className="mt-8 max-w-measure text-sm text-ink-2">
          {!ready
            ? "The journal is read from this browser once the page has loaded."
            : enough
              ? "Worked out in this browser from the trades below. Amounts are in your account currency, as you typed them."
              : `Figures for the whole journal appear from ${MIN_TRADES} trades: fewer than that say almost nothing. There ${n === 1 ? "is" : "are"} ${plural(n, "trade")} here so far.`}
        </p>
        <dl className="mt-13 grid grid-cols-1 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
          {tiles.map((t) => (
            <div key={t.k} className="break-inside-avoid bg-surface p-13">
              <dt className="label">{t.k}</dt>
              <dd className="mt-3">
                <span className={`num block ${t.v === NOT_YET || t.v.startsWith("No ") ? "text-sm text-ink-3" : "text-lg text-ink"}`}>{ready ? t.v : "…"}</span>
                <span className="mt-5 block text-xs text-ink-3">{t.d}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---- the same trades, taken in groups ---- */}
      <div className="mt-34 border-t border-line pt-21">
        <h3 className="h4">The same trades, in groups</h3>
        <p className="mt-8 max-w-measure text-sm text-ink-2">
          A group is shown from {MIN_GROUP} trades. “Gained” is the share of the group with a result above zero; “Total” is the sum of its results; “Average” is the total ÷ the trades in the group. A difference between two small groups is often chance.
        </p>
        <div className="mt-13 grid gap-21 xl:grid-cols-3 print:block">
          <Groups
            title="Plan followed, and not"
            head="Followed my plan"
            ready={ready}
            rows={[
              { name: "Yes", g: stats.followed },
              { name: "No", g: stats.notFollowed },
            ]}
          />
          <Groups title="By mood" head="Mood" ready={ready} rows={MOODS.map((m) => ({ name: cap(m), g: stats.byMood[m] }))} />
          <Groups title="By day of the week" head="Day" ready={ready} rows={DAYS.map((d, i) => ({ name: d, g: stats.byDay[i]! }))} />
        </div>
      </div>

      {/* ---- every trade ---- */}
      <div className="mt-34 border-t border-line pt-21">
        <div className="flex flex-wrap items-baseline justify-between gap-8">
          <h3 className="h4">Every trade</h3>
          {ready && n > SHOWN && (
            <button type="button" className="btn btn-ghost btn-sm print:hidden" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll}>
              {showAll ? `Show the latest ${SHOWN}` : `Show all ${n}`}
            </button>
          )}
        </div>
        {!ready ? (
          <p className="mt-13 text-sm text-ink-3">The journal is read from this browser once the page has loaded.</p>
        ) : n === 0 ? (
          <p className="mt-13 max-w-measure text-sm text-ink-2">Nothing is written here yet. Add a trade with the form above, or import a CSV file that this page exported.</p>
        ) : (
          <>
            {hiddenRows > 0 && (
              <p className="mt-8 text-xs text-ink-3 print:hidden">
                The latest {SHOWN} of {n} are shown. A printed copy has all of them.
              </p>
            )}
            <div className="mt-13 overflow-x-auto print:overflow-visible">
              <table className="table-gx w-full min-w-[56rem] text-sm print:min-w-0 print:text-[8pt]">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Date</th>
                    <th scope="col">Instrument</th>
                    <th scope="col">Side</th>
                    <th scope="col" className="num">
                      Size
                    </th>
                    <th scope="col" className="num">
                      Entry
                    </th>
                    <th scope="col" className="num">
                      Exit
                    </th>
                    <th scope="col" className="num">
                      Stop
                    </th>
                    <th scope="col">Mood</th>
                    <th scope="col">Plan kept</th>
                    <th scope="col" className="num">
                      Result
                    </th>
                    <th scope="col" className="num">
                      Running
                    </th>
                    <th scope="col" className="print:hidden">
                      <span className="sr-only">Change or delete</span>
                    </th>
                  </tr>
                </thead>
                {trades.map((t, i) => {
                  const away = i < hiddenRows ? "hidden print:table-row-group" : "";
                  const notes = t.plan || t.happened;
                  return (
                    <tbody key={t.id} className={`break-inside-avoid ${away}`}>
                      <tr>
                        <td className={notes ? "!border-b-0" : ""}>{i + 1}</td>
                        <td className={`num whitespace-nowrap ${notes ? "!border-b-0" : ""}`}>{t.date}</td>
                        <td className={`break-words ${notes ? "!border-b-0" : ""}`}>{t.instrument}</td>
                        <td className={notes ? "!border-b-0" : ""}>{t.side === "long" ? "Long" : "Short"}</td>
                        <td className={`num-right num ${notes ? "!border-b-0" : ""}`}>{price(t.size)}</td>
                        <td className={`num-right num ${notes ? "!border-b-0" : ""}`}>{price(t.entry)}</td>
                        <td className={`num-right num ${notes ? "!border-b-0" : ""}`}>{price(t.exit)}</td>
                        <td className={`num-right num ${notes ? "!border-b-0" : ""}`}>{t.stop === null ? "none" : price(t.stop)}</td>
                        <td className={notes ? "!border-b-0" : ""}>{cap(t.mood)}</td>
                        <td className={notes ? "!border-b-0" : ""}>{t.followed ? "Yes" : "No"}</td>
                        <td className={`num-right num whitespace-nowrap ${notes ? "!border-b-0" : ""}`}>{signed(t.result)}</td>
                        <td className={`num-right num whitespace-nowrap ${notes ? "!border-b-0" : ""}`}>{signed(equity[i] ?? 0)}</td>
                        <td className={`whitespace-nowrap print:hidden ${notes ? "!border-b-0" : ""}`}>
                          {asking === t.id ? (
                            <span className="flex items-center gap-5" role="group" aria-label={`Delete trade ${i + 1}?`}>
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => remove(t.id)}>
                                Delete it
                              </button>
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAsking(null)}>
                                Keep
                              </button>
                            </span>
                          ) : (
                            <span className="flex items-center gap-5">
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => edit(t.id)} aria-label={`Change trade ${i + 1}`}>
                                Change
                              </button>
                              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setAsking(t.id)} aria-label={`Delete trade ${i + 1}`}>
                                Delete
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                      {notes && (
                        <tr>
                          <td />
                          <td colSpan={12} className="!h-auto pb-13 text-ink-2 print:pb-5">
                            {t.plan && (
                              <p className="max-w-measure whitespace-pre-line break-words">
                                <span className="label mr-8">Plan</span>
                                {t.plan}
                              </p>
                            )}
                            {t.happened && (
                              <p className={`max-w-measure whitespace-pre-line break-words ${t.plan ? "mt-5" : ""}`}>
                                <span className="label mr-8">What happened</span>
                                {t.happened}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </table>
            </div>
          </>
        )}
      </div>

      {/* ---- the file, the paper copy, and the end of it ---- */}
      <div className="mt-34 border-t border-line pt-21 print:hidden">
        <h3 className="h4">Back it up, print it, or delete it</h3>
        <p className="mt-8 max-w-measure text-sm text-ink-2">
          Export makes a CSV file in this browser: nothing is uploaded. Import reads a file this page exported and adds its trades to those already here; a file with anything wrong in it is refused whole. Printing uses your browser’s own print window, where “Save as PDF” is one of the printers.
        </p>
        <div className="mt-13 flex flex-wrap items-center gap-8">
          <button type="button" className="btn btn-primary" onClick={exportCsv} disabled={!ready || n === 0}>
            Export as CSV
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => picker.current?.click()} disabled={!ready}>
            Import a CSV
          </button>
          <input ref={picker} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} aria-hidden onChange={importCsv} />
          <PrintButton className="btn btn-ghost">Print, or save as PDF</PrintButton>
          {!askingAll && (
            <button type="button" className="btn btn-quiet" onClick={() => setAskingAll(true)} disabled={!ready || n === 0}>
              Delete everything
            </button>
          )}
        </div>
        {askingAll && (
          <div className="mt-13 max-w-measure rounded-[8px] border border-line bg-surface p-21" role="group" aria-labelledby={id("all-h")}>
            <p id={id("all-h")} className="font-medium text-ink">
              Delete all {plural(n, "trade")} from this browser?
            </p>
            <p className="mt-5 text-sm text-ink-2">This cannot be undone. Nobody else has a copy: if you want one, export the journal first.</p>
            <div className="mt-13 flex flex-wrap gap-8">
              <button type="button" className="btn btn-primary" onClick={removeAll}>
                Yes, delete all of it
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setAskingAll(false)}>
                Keep the journal
              </button>
            </div>
          </div>
        )}
        <p className={`mt-13 max-w-measure ${fileNote?.tone === "error" ? "field-error" : "text-sm text-ink-2"}`} role={fileNote?.tone === "error" ? "alert" : "status"}>
          {fileNote?.text ?? ""}
        </p>
      </div>
    </div>
  );
}

/** One table of groups: how many trades, the share that gained, the total and the average, or "not enough trades yet". */
function Groups({ title, head, rows, ready }: { title: string; head: string; rows: { name: string; g: Group }[]; ready: boolean }) {
  return (
    <div className="min-w-0 break-inside-avoid print:mt-13">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="table-gx w-full min-w-[21rem] text-sm print:min-w-0">
          <caption className="label pb-5 text-left">{title}</caption>
          <thead>
            <tr>
              <th scope="col">{head}</th>
              <th scope="col" className="num">
                Trades
              </th>
              <th scope="col" className="num">
                Gained
              </th>
              <th scope="col" className="num">
                Total
              </th>
              <th scope="col" className="num">
                Average
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ name, g }) => (
              <tr key={name}>
                <th scope="row" className="!border-b !border-line !py-0 !text-sm !font-normal !normal-case !tracking-normal !text-ink">
                  {name}
                </th>
                <td className="num-right num">{ready ? g.n : "…"}</td>
                {ready && g.n >= MIN_GROUP && g.mean !== null ? (
                  <>
                    <td className="num-right num">{pct(g.gained / g.n)}</td>
                    <td className="num-right num whitespace-nowrap">{signed(g.net)}</td>
                    <td className="num-right num whitespace-nowrap">{signed(g.mean)}</td>
                  </>
                ) : (
                  <td colSpan={3} className="num-right text-xs text-ink-3">
                    {ready ? NOT_YET : ""}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
