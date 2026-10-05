/**
 * A callback request: a visitor on /contact asks to be telephoned.
 *
 * It is stored as an ordinary enquiry in `leads`, through the same pipeline as
 * the contact form, so that no column and no migration is needed. What makes
 * it a callback request is the first line of its message, which the server
 * writes in a fixed form (never the visitor):
 *
 *   Callback requested: Morning (08:00 to 12:00), Asia/Kolkata time
 *
 * GIO4X Control reads that line back to mark the enquiry (readCallback).
 * Shared by the form, /api/callback and the console, so the three cannot drift.
 */

export const CALLBACK_PREFIX = "Callback requested: ";

/** When in the visitor's own day they would rather be called. A preference, never an appointment. */
export const CALLBACK_DAY_PARTS = {
  morning: "Morning (08:00 to 12:00)",
  afternoon: "Afternoon (12:00 to 17:00)",
  evening: "Evening (17:00 to 20:00)",
  any: "Any time of day",
} as const;
export type CallbackDayPart = keyof typeof CALLBACK_DAY_PARTS;

export function isCallbackDayPart(value: unknown): value is CallbackDayPart {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(CALLBACK_DAY_PARTS, value);
}

/** What a call can be about: the enquiry topics a conversation suits. Each is one of CONTACT_TOPICS (lib/server/constants.ts). */
export const CALLBACK_TOPICS = ["General", "Account opening", "Account", "Platform: 777 Raptor", "Platform: MetaTrader 5", "Partnership"] as const;
export type CallbackTopic = (typeof CALLBACK_TOPICS)[number];

/** The shape of an IANA time zone name ("Europe/London", "America/Argentina/Buenos_Aires", "UTC"). */
export const TIME_ZONE_RE = /^[A-Za-z][A-Za-z0-9_+-]{0,31}(\/[A-Za-z0-9_+-]{1,32}){0,2}$/;

/** A telephone number with its country code: a plus sign, then digits with ordinary separators. Within `leads_phone_valid`. */
export const CALLBACK_PHONE_RE = /^\+[0-9][0-9 ()./-]{5,38}$/;

/** "Morning (08:00 to 12:00), Asia/Kolkata time" */
export function callbackWhen(part: CallbackDayPart, timeZone: string): string {
  return `${CALLBACK_DAY_PARTS[part]}, ${timeZone} time`;
}

/**
 * The "when" of a callback request, read from the first line of an enquiry's
 * message, or null when the enquiry is not one. Bounded, and returned as text
 * to be rendered as text.
 */
export function readCallback(message: string | null | undefined): string | null {
  if (!message || !message.startsWith(CALLBACK_PREFIX)) return null;
  const line = message.slice(CALLBACK_PREFIX.length).split("\n", 1)[0]?.trim() ?? "";
  return line ? line.slice(0, 120) : null;
}
