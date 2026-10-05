"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Rosette } from "@/components/brand/Rosette";
import { SortingRack } from "@/components/figures/company/SortingRack";
import { FigureNote } from "@/components/figures/Figure";
import { EMAIL_RE, PHONE_RE, readUtm, submitContact } from "./submit";

type Topic = {
  key: string;
  /** value sent to the API and shown in the menu */
  label: string;
  /** what helps us answer, shown beside the form */
  include: string;
  /** a page that may answer the question without waiting for a reply */
  first?: { label: string; href: string };
  /** an extra caution for this kind of message */
  caution?: string;
  placeholder: string;
};

export const TOPICS: Topic[] = [
  {
    key: "general",
    label: "General",
    include: "Tell us what you would like to know. If it concerns a particular page, mention which one.",
    first: { label: "Help & FAQ", href: "/faq" },
    placeholder: "What would you like to ask?",
  },
  {
    key: "account",
    label: "Account",
    include: "The email address registered on your account and a description of what you are trying to do. Do not send identity documents through this form.",
    first: { label: "Account types", href: "/trading/accounts" },
    caution: "We will never ask for your password or a one-time code.",
    placeholder: "Describe the account question. Leave out passwords and security codes.",
  },
  {
    key: "raptor",
    label: "Platform: 777 Raptor",
    include: "Whether you are on web, desktop or mobile, what you did, what you expected and what happened instead.",
    first: { label: "Explore 777 Raptor", href: "/platforms/raptor" },
    placeholder: "Which Raptor surface, and what happened?",
  },
  {
    key: "mt5",
    label: "Platform: MetaTrader 5",
    include: "Your device and operating system, the MetaTrader 5 build if you know it, and the exact wording of any message shown.",
    first: { label: "Explore MetaTrader 5", href: "/platforms/metatrader-5" },
    placeholder: "Which device, and what does MetaTrader 5 show?",
  },
  {
    key: "technical",
    label: "Technical",
    include: "The page address, your browser and device, and the steps that lead to the problem.",
    first: { label: "System status", href: "/status" },
    placeholder: "Which page, which browser, and what went wrong?",
  },
  {
    key: "partnership",
    label: "Partnership",
    include: "Who you are, where you operate and the kind of arrangement you have in mind.",
    first: { label: "Introducing Brokers", href: "/partners" },
    placeholder: "Tell us about your business and what you propose.",
  },
  {
    key: "press",
    label: "Press",
    include: "Your publication, your deadline and the question. Brand assets and naming are in the Media Centre.",
    first: { label: "Media Centre", href: "/media" },
    placeholder: "Publication, deadline and question.",
  },
  {
    key: "security",
    label: "Security",
    include: "What you saw and where: the full address of a suspicious page, or the sender and subject of a suspicious message.",
    first: { label: "Verify a GIO4X link", href: "/trust/verify" },
    caution: "If you think your account details have been exposed, change your password first, then write to us.",
    placeholder: "Describe what you saw. Paste the address or sender, not your credentials.",
  },
  {
    key: "privacy",
    label: "Privacy",
    include: "The request you are making about your personal data (for example access, correction or deletion) and the email address it relates to.",
    first: { label: "Privacy Policy", href: "/legal/privacy" },
    placeholder: "What would you like to ask or request about your data?",
  },
  {
    key: "complaint",
    label: "Complaint",
    include: "What happened, when, the account it concerns (the registered email is enough) and the outcome you are asking for. Dates and order references help.",
    first: { label: "Legal & documents", href: "/legal" },
    placeholder: "What happened, when, and what outcome are you asking for?",
  },
];

export type ContactTopicKey = "general" | "account" | "raptor" | "mt5" | "technical" | "partnership" | "press" | "security" | "privacy" | "complaint";

/**
 * Every sentence the form shows. `{link}`, `{email}` and `{max}` mark where the
 * Privacy Policy link, an email address and the character limit are set; the
 * form puts them there, so a language may place them where its grammar wants.
 */
export type ContactFormStrings = {
  topic: string;
  helpful: string;
  mayBeAnswered: string;
  routedLabel: string;
  routedBody: string;
  name: string;
  email: string;
  phone: string;
  optional: string;
  phoneHint: string;
  message: string;
  messageHint: string;
  privacy: string;
  privacyLink: string;
  required: string;
  marketing: string;
  marketingNote: string;
  send: string;
  sending: string;
  retry: string;
  sendingStatus: string;
  idleStatus: string;
  failedTitle: string;
  failedReach: string;
  failedBody: string;
  sentTitle: string;
  sentBody: string;
  reference: string;
  sentSafety: string;
  another: string;
  errors: { name: string; emailMissing: string; emailInvalid: string; phone: string; topic: string; messageEmpty: string; messageShort: string; messageLong: string; privacy: string };
};

/**
 * The form in another language (docs/I18N.md, 6.8; the translations are in
 * src/i18n/contact-form.ts). Beside the sentences above: the topics as they
 * are DISPLAYED (the value sent to the API stays the English label of TOPICS,
 * which is what the server validates), the mark for a link that leads to an
 * English page, and the line set beside a message the server sent in English.
 */
export type ContactFormWords = ContactFormStrings & {
  inEnglish: string;
  serverNote: string;
  topics: Record<ContactTopicKey, { label: string; include: string; placeholder: string }>;
  cautions: { account: string; security: string };
};

/** The English of the form: what it has always said. Used whenever no other language is handed over. */
const EN: ContactFormStrings = {
  topic: "Topic",
  helpful: "Helpful to include",
  mayBeAnswered: "May already be answered:",
  routedLabel: "How it is routed",
  routedBody: "The topic you choose travels with the message. Once it is received you are shown a reference: keep it, and quote it if you write again about the same matter.",
  name: "Name",
  email: "Email",
  phone: "Phone",
  optional: "(optional)",
  phoneHint: "Include the country code. We reply by email unless you ask otherwise.",
  message: "Message",
  messageHint: "Never share your password or one-time security code in a message.",
  privacy: "I have read the {link} and understand that GIO4X will use these details to answer my message.",
  privacyLink: "Privacy Policy",
  required: "(Required)",
  marketing: "GIO4X may also email me occasional updates about its markets, tools and research.",
  marketingNote: "(Optional. Your message is answered either way.)",
  send: "Send message",
  sending: "Sending",
  retry: "Try again",
  sendingStatus: "Sending your message…",
  idleStatus: "You will be shown a reference once it is received.",
  failedTitle: "Your message was not sent.",
  failedReach: "The form could not reach GIO4X just now.",
  failedBody: "Nothing you wrote has been lost: it is still in the form above. You can try again, or email {email} directly.",
  sentTitle: "Your message has been received.",
  sentBody: "We reply by email to {email}. Please keep the reference below; quote it if you write to us again about the same matter.",
  reference: "Reference",
  sentSafety: "A genuine reply from GIO4X will never ask for your password or a one-time security code.",
  another: "Write another message",
  errors: {
    name: "Please enter your name.",
    emailMissing: "Please enter your email address.",
    emailInvalid: "That does not look like an email address. Check for a missing @ or domain.",
    phone: "Use digits, spaces and an optional leading +, or leave this empty.",
    topic: "Please choose a topic.",
    messageEmpty: "Please write your message.",
    messageShort: "A little more detail will help us answer: at least ten characters.",
    messageLong: "Please keep the message under {max} characters.",
    privacy: "Please confirm that you have read how your message is handled.",
  },
};

/** "before {mark} after" → ["before ", " after"]; a sentence without the mark is all "before". */
function cut(sentence: string, mark: string): [string, string] {
  const at = sentence.indexOf(mark);
  return at < 0 ? [sentence, ""] : [sentence.slice(0, at), sentence.slice(at + mark.length)];
}

/** the mark beside a link that leaves a translated page for an English one (as InEnglish in components/i18n/Translated.tsx) */
const MARK = "chip ms-8 align-middle !h-[1.375rem] !normal-case !tracking-normal";

type Values = { name: string; email: string; phone: string; topic: string; message: string; privacy: boolean; marketing: boolean; website: string };
type FieldKey = "name" | "email" | "phone" | "topic" | "message" | "privacy";
type Errors = Partial<Record<FieldKey, string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; reference: string } | { kind: "failed"; error?: string };

const EMPTY: Values = { name: "", email: "", phone: "", topic: "general", message: "", privacy: false, marketing: false, website: "" };
const MESSAGE_MAX = 4000;
const ORDER: FieldKey[] = ["name", "email", "phone", "topic", "message", "privacy"];

function validate(v: Values, m: ContactFormStrings["errors"]): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = m.name;
  if (!v.email.trim()) e.email = m.emailMissing;
  else if (!EMAIL_RE.test(v.email.trim())) e.email = m.emailInvalid;
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = m.phone;
  if (!TOPICS.some((t) => t.key === v.topic)) e.topic = m.topic;
  const len = v.message.trim().length;
  if (len < 10) e.message = len === 0 ? m.messageEmpty : m.messageShort;
  else if (len > MESSAGE_MAX) e.message = m.messageLong.replace("{max}", MESSAGE_MAX.toLocaleString("en-GB"));
  if (!v.privacy) e.privacy = m.privacy;
  return e;
}

/** maps a server-side field name onto one of ours */
const SERVER_FIELD: Record<string, FieldKey> = { name: "name", email: "email", phone: "phone", topic: "topic", message: "message", privacyAccepted: "privacy", privacy: "privacy" };

/**
 * One contact experience that routes by topic. Client-validated, posts JSON to
 * /api/contact, and keeps everything the visitor typed if sending fails.
 *
 * `words` is the form in another language, for the translated contact pages.
 * Without it the form is the English one, word for word and class for class:
 * everything that differs on a translated page hangs on `words` being there.
 */
export function ContactForm({ email, words }: { email: string; words?: ContactFormWords }) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const w: ContactFormStrings = words ?? EN;
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  // the messages in `errors` came back from the server, which writes in English
  const [fromServer, setFromServer] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef<number>(0);
  const utm = useRef<Record<string, string> | undefined>(undefined);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    utm.current = readUtm();
    // a link may pre-select a topic: /contact?topic=press
    const wanted = new URLSearchParams(window.location.search).get("topic")?.toLowerCase();
    if (wanted && TOPICS.some((t) => t.key === wanted)) setV((s) => ({ ...s, topic: wanted }));
  }, []);

  useEffect(() => {
    if (status.kind === "sent" || status.kind === "failed") resultRef.current?.focus();
  }, [status.kind]);

  const topic = TOPICS.find((t) => t.key === v.topic) ?? TOPICS[0];
  // the topic as it is shown; `topic.label` is what is sent
  const shownTopic = (t: Topic) => words?.topics[t.key as ContactTopicKey];
  const topicLabel = shownTopic(topic)?.label ?? topic.label;
  const topicCaution = topic.caution && ((words?.cautions as Record<string, string> | undefined)?.[topic.key] ?? topic.caution);
  const set =<K extends keyof Values>(k: K, value: Values[K]) => {
    setV((s) => ({ ...s, [k]: value }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const focusFirst = (e: Errors) => {
    const first = ORDER.find((k) => e[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(first))}`)?.focus();
  };

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (busy.current) return;
    const found = validate(v, w.errors);
    setErrors(found);
    setFromServer(false);
    if (Object.keys(found).length) {
      focusFirst(found);
      return;
    }
    busy.current = true;
    setStatus({ kind: "sending" });
    const result = await submitContact({
      name: v.name.trim(),
      email: v.email.trim(),
      ...(v.phone.trim() ? { phone: v.phone.trim() } : {}),
      topic: topic.label,
      message: v.message.trim(),
      privacyAccepted: true,
      marketingConsent: v.marketing,
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
      for (const [k, msg] of Object.entries(result.fields)) {
        const key = SERVER_FIELD[k];
        if (key) mapped[key] = msg;
      }
      if (Object.keys(mapped).length) {
        setErrors(mapped);
        setFromServer(true);
        setStatus({ kind: "idle" });
        // the fields are disabled while sending: focus once they are enabled again
        window.requestAnimationFrame(() => focusFirst(mapped));
        return;
      }
    }
    setStatus({ kind: "failed", error: result.error });
  }

  if (status.kind === "sent") {
    const [sentBefore, sentAfter] = cut(w.sentBody, "{email}");
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="panel grid justify-items-start gap-13 p-21 focus:outline-none sm:p-34">
        <Rosette size={34} dna />
        <h2 className="h3">{w.sentTitle}</h2>
        <p className="max-w-measure text-ink-2">
          {sentBefore}
          <span className="font-medium text-ink">{v.email.trim()}</span>
          {sentAfter}
        </p>
        <dl className="mt-8 grid w-full gap-px border-y border-line sm:grid-cols-2">
          <div className="py-13">
            <dt className="label">{w.reference}</dt>
            <dd className="num mt-5 select-all break-all text-lg font-medium text-ink">{status.reference}</dd>
          </div>
          {/* on a translated page the rule stands on the side the reading starts from, whichever that is */}
          <div className={words ? "py-13 sm:border-s sm:border-line sm:ps-21" : "py-13 sm:border-l sm:border-line sm:pl-21"}>
            <dt className="label">{w.topic}</dt>
            <dd className="mt-5 text-lg text-ink">{topicLabel}</dd>
          </div>
        </dl>
        <p className="text-sm text-ink-3">{w.sentSafety}</p>
        <button
          type="button"
          className="btn btn-ghost mt-8"
          onClick={() => {
            setV({ ...EMPTY, name: v.name, email: v.email, topic: v.topic });
            setErrors({});
            startedAt.current = Date.now();
            setStatus({ kind: "idle" });
          }}
        >
          {w.another}
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";
  const count = v.message.length;
  const describe = (k: FieldKey, hint?: boolean) => [errors[k] ? id(`${k}-err`) : null, hint ? id(`${k}-hint`) : null].filter(Boolean).join(" ") || undefined;
  // a message the server sent is in English: on a translated page it is shown as English, after a line in the page's language
  const said = (text: string | undefined) =>
    words && fromServer ? (
      <>
        {words.serverNote}{" "}
        <span lang="en" dir="ltr">
          {text}
        </span>
      </>
    ) : (
      text
    );
  const [privacyBefore, privacyAfter] = cut(w.privacy, "{link}").map((s) => s.trim());
  const [failedBefore, failedAfter] = cut(w.failedBody, "{email}").map((s) => s.trim());
  // an address and a telephone number are written left to right in every language
  const latin = words ? { dir: "ltr" as const, className: "input rtl:text-right" } : { className: "input" };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={sending} className="panel p-21 sm:p-34">
      <div className="grid gap-21 lg:grid-cols-phi-r lg:gap-34">
        {/* topic first: it decides what the rest of the form asks for */}
        <div className="grid content-start gap-13">
          <div className="field">
            <label htmlFor={id("topic")}>{w.topic}</label>
            <select id={id("topic")} className="select" value={v.topic} onChange={(e) => set("topic", e.target.value)} aria-invalid={!!errors.topic} aria-describedby={describe("topic")} disabled={sending}>
              {TOPICS.map((t) => (
                <option key={t.key} value={t.key}>
                  {shownTopic(t)?.label ?? t.label}
                </option>
              ))}
            </select>
            {errors.topic && (
              <p id={id("topic-err")} className="field-error">
                {said(errors.topic)}
              </p>
            )}
          </div>
          <div aria-live="polite" className={words ? "border-s border-accent ps-13" : "border-l border-accent pl-13"}>
            <p className="label">{w.helpful}</p>
            <p className="mt-5 text-sm text-ink-2">{shownTopic(topic)?.include ?? topic.include}</p>
            {topicCaution && <p className="mt-8 text-sm font-medium text-ink">{topicCaution}</p>}
            {topic.first && (
              <p className="mt-8 text-sm text-ink-3">
                {w.mayBeAnswered}{" "}
                {/* the name of an English page, as the English site gives it */}
                <Link href={topic.first.href} className="link" lang={words ? "en" : undefined} hrefLang={words ? "en" : undefined}>
                  {topic.first.label}
                </Link>
                {words && <span className={MARK}>{words.inEnglish}</span>}
              </p>
            )}
          </div>
          <FigureNote figure={<SortingRack />} label={w.routedLabel} className="!mt-21">
            {w.routedBody}
          </FigureNote>
        </div>

        <div className="grid gap-21">
          <div className="grid gap-21 sm:grid-cols-2">
            <div className="field">
              <label htmlFor={id("name")}>{w.name}</label>
              <input id={id("name")} className="input" type="text" autoComplete="name" maxLength={120} value={v.name} onChange={(e) => set("name", e.target.value)} aria-required="true" aria-invalid={!!errors.name} aria-describedby={describe("name")} disabled={sending} />
              {errors.name && (
                <p id={id("name-err")} className="field-error">
                  {said(errors.name)}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor={id("email")}>{w.email}</label>
              <input id={id("email")} {...latin} type="email" inputMode="email" autoComplete="email" maxLength={200} value={v.email} onChange={(e) => set("email", e.target.value)} aria-required="true" aria-invalid={!!errors.email} aria-describedby={describe("email")} disabled={sending} />
              {errors.email && (
                <p id={id("email-err")} className="field-error">
                  {said(errors.email)}
                </p>
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor={id("phone")}>
              {`${w.phone} `}
              <span className="font-normal normal-case tracking-normal text-ink-3">{w.optional}</span>
            </label>
            <input id={id("phone")} {...latin} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={v.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} aria-describedby={describe("phone", true)} disabled={sending} />
            {errors.phone ? (
              <p id={id("phone-err")} className="field-error">
                {said(errors.phone)}
              </p>
            ) : null}
            <p id={id("phone-hint")} className="field-hint">
              {w.phoneHint}
            </p>
          </div>

          <div className="field">
            <label htmlFor={id("message")}>{w.message}</label>
            <textarea id={id("message")} className="textarea" rows={7} maxLength={MESSAGE_MAX} placeholder={shownTopic(topic)?.placeholder ?? topic.placeholder} value={v.message} onChange={(e) => set("message", e.target.value)} aria-required="true" aria-invalid={!!errors.message} aria-describedby={describe("message", true)} disabled={sending} />
            {errors.message && (
              <p id={id("message-err")} className="field-error">
                {said(errors.message)}
              </p>
            )}
            <p id={id("message-hint")} className="field-hint flex flex-wrap justify-between gap-x-13">
              <span>{w.messageHint}</span>
              <span className="num" aria-hidden dir={words ? "ltr" : undefined}>
                {count.toLocaleString("en-GB")} / {MESSAGE_MAX.toLocaleString("en-GB")}
              </span>
            </p>
          </div>

          {/* honeypot: hidden from people and assistive technology; must stay empty.
              Where a page may run right to left it is not moved off to the left: there, that is the side a page scrolls to. */}
          <div aria-hidden className={words ? "pointer-events-none absolute h-px w-px overflow-hidden opacity-0" : "pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"}>
            <label htmlFor={id("website")}>Website</label>
            <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} />
          </div>

          <div className="grid gap-13 border-t border-line pt-21">
            <div>
              <label className="check min-h-[2.75rem] content-center">
                <input id={id("privacy")} type="checkbox" checked={v.privacy} onChange={(e) => set("privacy", e.target.checked)} aria-required="true" aria-invalid={!!errors.privacy} aria-describedby={describe("privacy")} disabled={sending} />
                <span>
                  {privacyBefore}{" "}
                  <Link href="/legal/privacy" className="link" hrefLang={words ? "en" : undefined}>
                    {w.privacyLink}
                  </Link>
                  {words && <span className={MARK}>{words.inEnglish}</span>}{" "}
                  {`${privacyAfter} `}
                  <span className="text-ink-3">{w.required}</span>
                </span>
              </label>
              {errors.privacy && (
                <p id={id("privacy-err")} className={words ? "field-error mt-5 ps-34" : "field-error mt-5 pl-34"}>
                  {said(errors.privacy)}
                </p>
              )}
            </div>
            <label className="check min-h-[2.75rem] content-center">
              <input type="checkbox" checked={v.marketing} onChange={(e) => set("marketing", e.target.checked)} disabled={sending} />
              <span>
                {`${w.marketing} `}
                <span className="text-ink-3">{w.marketingNote}</span>
              </span>
            </label>
          </div>

          {status.kind === "failed" && (
            <div ref={resultRef} tabIndex={-1} role="alert" className="rounded-sm border border-neg p-13 focus:outline-none sm:p-21">
              <p className="h4">{w.failedTitle}</p>
              <p className="mt-5 text-sm text-ink-2">
                {words && status.error ? (
                  <>
                    {words.serverNote}{" "}
                    <span lang="en" dir="ltr">
                      {status.error}
                    </span>
                  </>
                ) : (
                  (status.error ?? w.failedReach)
                )}
                {` ${failedBefore}`}{" "}
                <a href={`mailto:${email}`} className="link">
                  {email}
                </a>{" "}
                {failedAfter}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-21 gap-y-13">
            <button type="submit" className="btn btn-primary btn-lg min-w-[13rem]" disabled={sending}>
              {sending ? (
                <>
                  <Rosette size={16} spin strokeWidth={1.5} />
                  {w.sending}
                </>
              ) : status.kind === "failed" ? (
                w.retry
              ) : (
                w.send
              )}
            </button>
            <p className="text-xs text-ink-3" role="status" aria-live="polite">
              {sending ? w.sendingStatus : w.idleStatus}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
