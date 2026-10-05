"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Rosette } from "@/components/brand/Rosette";
import { CALLBACK_DAY_PARTS, CALLBACK_PHONE_RE, CALLBACK_TOPICS, TIME_ZONE_RE, type CallbackDayPart } from "@/lib/callback";
import { restrictedMatch } from "@/lib/restricted";
import { EMAIL_RE, readUtm, type SubmitResult } from "./submit";

type Values = { name: string; email: string; phone: string; country: string; dayPart: CallbackDayPart; timeZone: string; topic: string; consent: boolean; website: string };
type FieldKey = "name" | "email" | "phone" | "country" | "dayPart" | "timeZone" | "topic" | "consent";
type Errors = Partial<Record<FieldKey, string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; reference: string } | { kind: "failed"; error?: string };

const EMPTY: Values = { name: "", email: "", phone: "", country: "", dayPart: "any", timeZone: "", topic: "General", consent: false, website: "" };
const ORDER: FieldKey[] = ["name", "phone", "email", "country", "topic", "dayPart", "timeZone", "consent"];
const PARTS = Object.keys(CALLBACK_DAY_PARTS) as CallbackDayPart[];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** As submitContact (./submit.ts), to /api/callback: anything that is not a well-formed success resolves to a calm failure. Nothing here throws. */
async function submitCallback(payload: Record<string, unknown>, timeoutMs = 20_000): Promise<SubmitResult> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch("/api/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: "no-store",
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null; // not JSON (for example an HTML 404): handled as a failure below
    }
    if (res.ok && isRecord(data) && data.ok === true && typeof data.reference === "string" && data.reference) return { ok: true, reference: data.reference };
    const error = isRecord(data) && typeof data.error === "string" ? data.error.slice(0, 240) : undefined;
    const fields: Record<string, string> = {};
    if (isRecord(data) && isRecord(data.fields)) for (const [k, val] of Object.entries(data.fields)) if (typeof val === "string" && val) fields[k] = val;
    const client = res.status >= 400 && res.status < 500;
    if (client && Object.keys(fields).length) return { ok: false, kind: "fields", fields, error };
    // only a 4xx carries a message meant for the visitor; a 5xx text is not shown
    return { ok: false, kind: "failed", error: client && res.status !== 404 ? error : undefined };
  } catch {
    return { ok: false, kind: "failed" };
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * "Ask for a call back": a second, separate form on /contact. It posts to
 * /api/callback, which stores the request as an enquiry marked "Callback
 * requested" (src/lib/callback.ts), and keeps everything the visitor typed if
 * sending fails.
 *
 * The time zone is read from the browser and can be corrected. A country on
 * the restricted list is refused here, as the account-interest form does, and
 * again on the server. Nothing on this form promises when the call will come:
 * GIO4X has not yet published support hours.
 */
export function CallbackForm({ email }: { email: string }) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef(0);
  const utm = useRef<Record<string, string> | undefined>(undefined);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    utm.current = readUtm();
    // the visitor's own time zone, as their device reports it; they can change it
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone && TIME_ZONE_RE.test(zone)) setV((s) => (s.timeZone ? s : { ...s, timeZone: zone }));
    } catch {
      /* no time zone reported: the field stays empty and is asked for */
    }
  }, []);

  useEffect(() => {
    if (status.kind === "sent" || status.kind === "failed") resultRef.current?.focus();
  }, [status.kind]);

  const set = <K extends keyof Values>(k: K, value: Values[K]) => {
    setV((s) => ({ ...s, [k]: value }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validate(): Errors {
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = "Please enter your name.";
    const phone = v.phone.trim();
    if (!phone) e.phone = "Please enter the number to call.";
    else if (!CALLBACK_PHONE_RE.test(phone) || phone.replace(/[^0-9]/g, "").length < 7) e.phone = "Start with + and your country code, then the number: for example +91 98765 43210.";
    if (!v.email.trim()) e.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(v.email.trim())) e.email = "That does not look like an email address. Check for a missing @ or domain.";
    const hit = restrictedMatch(v.country);
    if (v.country.trim().length < 2) e.country = "Please enter your country of residence.";
    else if (hit) e.country = `GIO4X services are not available to residents of ${hit}, so we cannot arrange a call there.`;
    if (!(CALLBACK_TOPICS as readonly string[]).includes(v.topic)) e.topic = "Please choose what the call is about.";
    if (!PARTS.includes(v.dayPart)) e.dayPart = "Please choose a part of the day.";
    if (!TIME_ZONE_RE.test(v.timeZone.trim())) e.timeZone = "Enter a time zone such as Europe/London or Asia/Kolkata.";
    if (!v.consent) e.consent = "Please confirm that GIO4X may telephone you on this number.";
    return e;
  }

  const focusFirst = (e: Errors) => {
    const first = ORDER.find((k) => e[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(first))}`)?.focus();
  };

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (busy.current) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirst(found);
      return;
    }
    busy.current = true;
    setStatus({ kind: "sending" });
    const result = await submitCallback({
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      country: v.country.trim(),
      dayPart: v.dayPart,
      timeZone: v.timeZone.trim(),
      topic: v.topic,
      consent: true,
      website: v.website,
      startedAt: startedAt.current,
      page: window.location.pathname,
      ...(utm.current ? { utm: utm.current } : {}),
    });
    busy.current = false;
    if (result.ok) {
      setStatus({ kind: "sent", reference: result.reference });
      return;
    }
    if (result.kind === "fields") {
      const mapped: Errors = {};
      for (const [k, msg] of Object.entries(result.fields)) if ((ORDER as string[]).includes(k)) mapped[k as FieldKey] = msg;
      if (Object.keys(mapped).length) {
        setErrors(mapped);
        setStatus({ kind: "idle" });
        // the fields are disabled while sending: focus once they are enabled again
        window.requestAnimationFrame(() => focusFirst(mapped));
        return;
      }
    }
    setStatus({ kind: "failed", error: result.error });
  }

  if (status.kind === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="panel grid justify-items-start gap-13 p-21 focus:outline-none sm:p-34">
        <Rosette size={34} dna />
        <h3 className="h3">Your request for a call has been received.</h3>
        <p className="max-w-measure text-ink-2">
          We will try to telephone <span className="num font-medium text-ink">{v.phone.trim()}</span>. No time has been fixed: GIO4X has not yet published its support hours, so we cannot say when the call will come. If we do not reach you, we write to{" "}
          <span className="font-medium text-ink">{v.email.trim()}</span> instead.
        </p>
        <dl className="w-full border-y border-line py-13">
          <dt className="label">Reference</dt>
          <dd className="num mt-5 select-all break-all text-lg font-medium text-ink">{status.reference}</dd>
        </dl>
        <p className="text-sm text-ink-3">A genuine caller from GIO4X will quote this reference if you ask for it, and will never ask for your password or a one-time security code.</p>
      </div>
    );
  }

  const sending = status.kind === "sending";
  const describe = (k: FieldKey, hint?: boolean) => [errors[k] ? id(`${k}-err`) : null, hint ? id(`${k}-hint`) : null].filter(Boolean).join(" ") || undefined;
  const problem = (k: FieldKey) =>
    errors[k] ? (
      <p id={id(`${k}-err`)} className="field-error">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={sending} className="panel relative grid gap-21 p-21 sm:p-34">
      <div className="grid gap-21 sm:grid-cols-2">
        <div className="field content-start">
          <label htmlFor={id("name")}>Name</label>
          <input id={id("name")} className="input" type="text" autoComplete="name" maxLength={120} value={v.name} onChange={(e) => set("name", e.target.value)} aria-required="true" aria-invalid={!!errors.name} aria-describedby={describe("name")} disabled={sending} />
          {problem("name")}
        </div>
        <div className="field content-start">
          <label htmlFor={id("phone")}>Telephone, with country code</label>
          <input id={id("phone")} className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} placeholder="+91 98765 43210" value={v.phone} onChange={(e) => set("phone", e.target.value)} aria-required="true" aria-invalid={!!errors.phone} aria-describedby={describe("phone")} disabled={sending} />
          {problem("phone")}
        </div>
      </div>

      <div className="grid gap-21 sm:grid-cols-2">
        <div className="field content-start">
          <label htmlFor={id("email")}>Email</label>
          <input id={id("email")} className="input" type="email" inputMode="email" autoComplete="email" maxLength={200} value={v.email} onChange={(e) => set("email", e.target.value)} aria-required="true" aria-invalid={!!errors.email} aria-describedby={describe("email", true)} disabled={sending} />
          {problem("email")}
          <p id={id("email-hint")} className="field-hint">
            Used only if the call does not reach you.
          </p>
        </div>
        <div className="field content-start">
          <label htmlFor={id("country")}>Country of residence</label>
          <input id={id("country")} className="input" type="text" autoComplete="country-name" maxLength={80} value={v.country} onChange={(e) => set("country", e.target.value)} aria-required="true" aria-invalid={!!errors.country} aria-describedby={describe("country")} disabled={sending} />
          {problem("country")}
        </div>
      </div>

      <div className="grid gap-21 sm:grid-cols-3">
        <div className="field content-start">
          <label htmlFor={id("topic")}>About</label>
          <select id={id("topic")} className="select" value={v.topic} onChange={(e) => set("topic", e.target.value)} aria-invalid={!!errors.topic} aria-describedby={describe("topic")} disabled={sending}>
            {CALLBACK_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {problem("topic")}
        </div>
        <div className="field content-start">
          <label htmlFor={id("dayPart")}>Preferred part of the day</label>
          <select id={id("dayPart")} className="select" value={v.dayPart} onChange={(e) => set("dayPart", e.target.value as CallbackDayPart)} aria-invalid={!!errors.dayPart} aria-describedby={describe("dayPart")} disabled={sending}>
            {PARTS.map((p) => (
              <option key={p} value={p}>
                {CALLBACK_DAY_PARTS[p]}
              </option>
            ))}
          </select>
          {problem("dayPart")}
        </div>
        <div className="field content-start">
          <label htmlFor={id("timeZone")}>Your time zone</label>
          <input id={id("timeZone")} className="input" type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={64} value={v.timeZone} onChange={(e) => set("timeZone", e.target.value)} aria-required="true" aria-invalid={!!errors.timeZone} aria-describedby={describe("timeZone", true)} disabled={sending} />
          {problem("timeZone")}
          <p id={id("timeZone-hint")} className="field-hint">
            Taken from this device. Change it if it is wrong.
          </p>
        </div>
      </div>

      {/* honeypot: hidden from people and assistive technology; must stay empty */}
      <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div className="border-t border-line pt-21">
        <label className="check min-h-[2.75rem] content-center">
          <input id={id("consent")} type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} aria-required="true" aria-invalid={!!errors.consent} aria-describedby={describe("consent")} disabled={sending} />
          <span>
            GIO4X may telephone me on this number about my enquiry. I have read the{" "}
            <Link href="/legal/privacy" className="link">
              Privacy Policy
            </Link>{" "}
            and understand that these details are used only for that. <span className="text-ink-3">(Required)</span>
          </span>
        </label>
        {errors.consent && (
          <p id={id("consent-err")} className="field-error mt-5 pl-34">
            {errors.consent}
          </p>
        )}
      </div>

      {status.kind === "failed" && (
        <div ref={resultRef} tabIndex={-1} role="alert" className="rounded-sm border border-neg p-13 focus:outline-none sm:p-21">
          <p className="h4">Your request was not sent.</p>
          <p className="mt-5 text-sm text-ink-2">
            {status.error ?? "The form could not reach GIO4X just now."} What you entered is still above. You can try again, or email{" "}
            <a href={`mailto:${email}`} className="link">
              {email}
            </a>{" "}
            and ask to be called.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-21 gap-y-13">
        <button type="submit" className="btn btn-primary btn-lg min-w-[13rem]" disabled={sending}>
          {sending ? (
            <>
              <Rosette size={16} spin strokeWidth={1.5} />
              Sending
            </>
          ) : status.kind === "failed" ? (
            "Try again"
          ) : (
            "Ask for a call"
          )}
        </button>
        <p className="text-xs text-ink-3" role="status" aria-live="polite">
          {sending ? "Sending your request…" : "No time for the call is promised. You will be shown a reference."}
        </p>
      </div>
    </form>
  );
}
