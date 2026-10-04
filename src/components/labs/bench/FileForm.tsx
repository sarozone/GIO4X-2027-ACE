"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { BYLINE_MAX, CODE_FORBIDDEN, CODE_MIN, FILE_EXTENSIONS, FILE_KINDS, FILE_MAX_BYTES, FILE_NAME, FILE_PLATFORMS, NOTE_MAX, TITLE_MAX, type FileKind, type FilePlatform } from "@/lib/trader-file";

/**
 * SEND US YOUR EA OR INDICATOR.
 *
 * A visitor chooses a source file (.mq4, .mq5, .mqh, .pine or .txt). It is
 * read as text in the browser, checked, and posted to /api/trader-file, where
 * it is stored for staff to read (GIO4X Control, Content, Traders' files). It
 * is never run, never compiled and never shown on the website, and the form
 * says so before anything is chosen. No e-mail address is asked for, so nobody
 * is contacted: the form says that too.
 */

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string; fields?: Record<string, string> };

const EMPTY = { title: "", kind: "" as FileKind | "", platform: "" as FilePlatform | "", note: "", by: "", rights: false, website: "" };

const PLATFORM_OF: Record<string, FilePlatform> = { mq5: "mt5", mq4: "mt4", pine: "pine" };

export function FileForm() {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [v, setV] = useState(EMPTY);
  const [file, setFile] = useState<{ name: string; code: string; lines: number } | null>(null);
  const [fileError, setFileError] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const startedAt = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const errors = state.kind === "error" ? (state.fields ?? {}) : {};
  const set = <K extends keyof typeof EMPTY>(k: K, value: (typeof EMPTY)[K]) => setV((s) => ({ ...s, [k]: value }));

  const choose = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(null);
    setFileError("");
    if (!f) return;
    const refuse = (message: string) => {
      setFileError(message);
      if (input.current) input.current.value = "";
    };
    // the name is kept in a plain form: other characters become "_", and the extension is lower case
    const name = f.name
      .replace(/[^A-Za-z0-9 ._-]/g, "_")
      .replace(/^[^A-Za-z0-9]+/, "")
      .replace(/\.[A-Za-z0-9]+$/, (x) => x.toLowerCase())
      .slice(-80);
    if (!FILE_NAME.test(name)) return refuse(`Choose a source file: ${FILE_EXTENSIONS.map((x) => `.${x}`).join(", ")}.`);
    if (f.size > FILE_MAX_BYTES) return refuse(`That file is ${Math.ceil(f.size / 1024)} KB. The most that can be sent is ${FILE_MAX_BYTES / 1024} KB.`);
    let code = "";
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      // MetaEditor saves source as UTF-16 with a byte order mark; everything else is read as UTF-8
      const utf16 = buf.length >= 2 && ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff));
      code = new TextDecoder(utf16 ? (buf[0] === 0xff ? "utf-16le" : "utf-16be") : "utf-8").decode(buf).replace(/^﻿/, "").replace(/\r\n?/g, "\n");
    } catch {
      return refuse("That file could not be read.");
    }
    if (CODE_FORBIDDEN.test(code) || code.includes("�")) return refuse("That file is not plain text. A compiled file (.ex4, .ex5) cannot be read by anyone: please send the source.");
    if (code.trim().length < CODE_MIN) return refuse("That file is empty, or too short to be a program.");
    setFile({ name, code, lines: code.split("\n").length });
    const ext = name.split(".").pop() ?? "";
    if (!v.platform && PLATFORM_OF[ext]) set("platform", PLATFORM_OF[ext]);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "sending") return;
    if (!file) {
      setFileError("Choose the file to send.");
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/trader-file", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: v.title, kind: v.kind, platform: v.platform, note: v.note, name: file.name, code: file.code, by: v.by, rights: v.rights, website: v.website, startedAt: startedAt.current }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; fields?: Record<string, string> } | null;
      if (res.ok && body?.ok) {
        setState({ kind: "sent" });
        setV(EMPTY);
        setFile(null);
        startedAt.current = Date.now();
      } else setState({ kind: "error", message: body?.error ?? "It could not be sent. Please try again.", fields: body?.fields });
    } catch {
      setState({ kind: "error", message: "It could not be sent. Check your connection and try again." });
    }
  };

  if (state.kind === "sent") {
    return (
      <div className="rounded-[8px] border border-accent bg-surface p-21" role="status">
        <p className="font-display text-xl text-ink">Received. Thank you.</p>
        <p className="mt-8 text-ink-2">A member of staff will read it. It will not be run and it will not appear on the website. No address was asked for, so you will not be contacted about it.</p>
        <button type="button" className="btn btn-ghost mt-13" onClick={() => setState({ kind: "idle" })}>
          Send another
        </button>
      </div>
    );
  }

  const sending = state.kind === "sending";
  const err = (k: string) =>
    errors[k] ? (
      <p id={id(`${k}-err`)} className="field-error">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="panel grid gap-13 p-21" aria-busy={sending}>
      <p className="text-sm text-ink-2">
        Source files only: {FILE_EXTENSIONS.map((x) => `.${x}`).join(", ")}, up to {FILE_MAX_BYTES / 1024} KB. Before sending, take out anything that should stay private: account numbers, passwords, licence keys, server names, your full name or contact details.
      </p>

      <div className="field">
        <label htmlFor={id("file")}>The file</label>
        <input ref={input} id={id("file")} type="file" accept={FILE_EXTENSIONS.map((x) => `.${x}`).join(",")} onChange={choose} disabled={sending} className="input h-auto py-8 file:mr-13 file:rounded file:border-0 file:bg-paper file:px-13 file:py-5 file:text-sm file:text-ink" aria-invalid={!!(fileError || errors.name || errors.code)} aria-describedby={id("file-note")} />
        <p id={id("file-note")} className={fileError || errors.name || errors.code ? "field-error" : "field-hint"} aria-live="polite">
          {fileError || errors.name || errors.code || (file ? `${file.name}: ${file.lines.toLocaleString("en-GB")} lines, read as text. It has not been sent yet.` : "It is read in your browser first. Nothing is sent until you press Send.")}
        </p>
      </div>

      <div className="field">
        <label htmlFor={id("title")}>What it is called</label>
        <input id={id("title")} className="input" maxLength={TITLE_MAX} value={v.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? id("title-err") : undefined} disabled={sending} required />
        {err("title")}
      </div>

      <div className="grid gap-13 sm:grid-cols-2">
        <div className="field">
          <label htmlFor={id("kind")}>What kind of file</label>
          <select id={id("kind")} className="select" value={v.kind} onChange={(e) => set("kind", e.target.value as FileKind)} aria-invalid={!!errors.kind} disabled={sending} required>
            <option value="">Choose</option>
            {FILE_KINDS.map((k) => (
              <option key={k.key} value={k.key}>
                {k.name}
              </option>
            ))}
          </select>
          {err("kind")}
        </div>
        <div className="field">
          <label htmlFor={id("platform")}>Written for</label>
          <select id={id("platform")} className="select" value={v.platform} onChange={(e) => set("platform", e.target.value as FilePlatform)} aria-invalid={!!errors.platform} disabled={sending} required>
            <option value="">Choose</option>
            {FILE_PLATFORMS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
          {err("platform")}
        </div>
      </div>

      <div className="field">
        <label htmlFor={id("note")}>
          What it does <span className="normal-case tracking-normal text-ink-3">(optional)</span>
        </label>
        <textarea id={id("note")} className="textarea" rows={3} maxLength={NOTE_MAX} value={v.note} onChange={(e) => set("note", e.target.value)} aria-invalid={!!errors.note} disabled={sending} />
        {err("note")}
      </div>

      <div className="field">
        <label htmlFor={id("by")}>
          Initials <span className="normal-case tracking-normal text-ink-3">(optional)</span>
        </label>
        <input id={id("by")} className="input max-w-[16rem]" maxLength={BYLINE_MAX} value={v.by} onChange={(e) => set("by", e.target.value)} autoComplete="off" aria-invalid={!!errors.by} disabled={sending} />
        {err("by")}
      </div>

      <div>
        <label className="check min-h-[2.75rem] content-center">
          <input type="checkbox" checked={v.rights} onChange={(e) => set("rights", e.target.checked)} aria-required="true" aria-invalid={!!errors.rights} disabled={sending} />
          <span>
            I wrote this file or have the right to share it, and I agree that GIO4X staff may read and keep it. <span className="text-ink-3">(Required)</span>
          </span>
        </label>
        {errors.rights && <p className="field-error mt-5 pl-34">{errors.rights}</p>}
      </div>

      {/* a field people do not see and software fills in: anything in it is discarded */}
      <div className="sr-only" aria-hidden>
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      {state.kind === "error" && (
        <p className="field-error" role="alert">
          {state.message}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Sending…" : "Send the file"}
        </button>
      </div>
      <p className="text-xs text-ink-3">Kept: the file’s name and text, what you wrote above, and that you ticked the box. Not kept: an e-mail address, your network address, or anything that identifies you, unless it is written inside the file.</p>
    </form>
  );
}
