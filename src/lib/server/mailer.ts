/**
 * Outgoing e-mail, through one provider (Resend), for the Bulk Emailer.
 *
 * Nothing is sent unless the hosting environment holds RESEND_API_KEY (a
 * secret: never in the repository, never NEXT_PUBLIC_) and RESEND_FROM_EMAIL,
 * an address on a domain that has been verified with the provider (SPF, DKIM).
 * Optional: RESEND_FROM_NAME (default "GIO4X"), RESEND_REPLY_TO.
 * Without them mailerReady() is false and the screen says so; no message is
 * queued, simulated or pretended.
 *
 * A message is plain text. It is sent as text and as HTML made from that text
 * by escaping it and turning blank lines into paragraphs: nothing a member of
 * staff types can become markup. Recipients never see each other: every
 * address gets its own message (the provider's batch endpoint, 100 at a time).
 */
import "server-only";

const ENDPOINT = "https://api.resend.com/emails/batch";
const BATCH = 100;

function settings(): { key: string; from: string; replyTo: string | null } | null {
  const key = process.env.RESEND_API_KEY?.trim();
  const email = process.env.RESEND_FROM_EMAIL?.trim();
  if (!key || !email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return null;
  const name = (process.env.RESEND_FROM_NAME?.trim() || "GIO4X").replace(/[<>"\r\n]/g, "").slice(0, 60);
  const reply = process.env.RESEND_REPLY_TO?.trim();
  return { key, from: `${name} <${email}>`, replyTo: reply && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(reply) ? reply : null };
}

export function mailerReady(): boolean {
  return settings() !== null;
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function toHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.55">${escape(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;max-width:640px">${paragraphs}</div>`;
}

export type SendOutcome = { sent: number; failed: number; error: string | null };

/** One message to each address. Stops at the first batch the provider refuses and reports how far it got. */
export async function sendToEach(recipients: string[], subject: string, text: string): Promise<SendOutcome> {
  const s = settings();
  if (!s) return { sent: 0, failed: recipients.length, error: "not_configured" };
  const html = toHtml(text);
  let sent = 0;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const chunk = recipients.slice(i, i + BATCH);
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${s.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk.map((to) => ({ from: s.from, to: [to], subject, text, html, ...(s.replyTo ? { reply_to: s.replyTo } : {}) }))),
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      });
      if (!r.ok) return { sent, failed: recipients.length - sent, error: `provider_${r.status}` };
      sent += chunk.length;
    } catch {
      return { sent, failed: recipients.length - sent, error: "provider_unreachable" };
    }
  }
  return { sent, failed: 0, error: null };
}

/** Where a copy of each enquiry is sent: GIO4X's public address unless the hosting environment names another. */
function inbox(): string {
  const set = process.env.CONTACT_INBOX?.trim();
  return set && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(set) ? set : "info@gio4x.com";
}

/**
 * A copy of one enquiry or support request to GIO4X's own inbox, with the
 * sender as reply-to, so that answering the e-mail answers the person. The
 * record of the enquiry is the row in the database (GIO4X Control); this is
 * a notification of it. It never fails the request that caused it: without
 * the provider's settings, or if the provider refuses, it returns false and
 * the enquiry is still stored. Nothing is logged but an error code.
 */
export async function notifyInbox(subject: string, text: string, replyTo: string | null): Promise<boolean> {
  const s = settings();
  if (!s) return false;
  const reply = replyTo && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(replyTo) ? replyTo : s.replyTo;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${s.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: s.from, to: [inbox()], subject: subject.replace(/[\r\n]+/g, " ").slice(0, 160), text, html: toHtml(text), ...(reply ? { reply_to: reply } : {}) }),
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    });
    if (!r.ok) console.error(`[mailer] inbox notification refused status=${r.status}`);
    return r.ok;
  } catch {
    console.error("[mailer] inbox notification unreachable");
    return false;
  }
}
