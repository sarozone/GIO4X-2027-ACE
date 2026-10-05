/**
 * /api/ai : GIO4X AI, the assistant in the Lens panel. The limits it keeps
 * are the ones published on /trust/ai; how it works is in docs/AI.md.
 *
 *   GET   → 200 { ok: true, available }      is the assistant switched on and set up?
 *
 *   POST  request  { question (<= 600 characters), page, history?: [{ q, a }] (the last 3 are used),
 *                    website: "" (honeypot), startedAt }
 *   200   text/event-stream, one JSON object per `data:` line:
 *           { type: "sources", sources: [{ n, title, url }] }   first, always
 *           { type: "delta", text }                             the answer, as it is written
 *           { type: "done", cited: [n, ...] }                   or { type: "error", error }
 *   400   { ok: false, error }           validation, unknown field, bad JSON
 *   403   { ok: false, error }           not sent from this site
 *   413   { ok: false, error }           body too large
 *   415   { ok: false, error }           not application/json
 *   429   { ok: false, error, limit }    "minute", "day" (this address) or "site" (everyone, today)
 *   503   { ok: false, error }           switched off, no key, or the provider did not answer
 *
 * Every limit is checked before the provider is called, so a refused request
 * costs nothing. The numbers are AI_LIMITS in src/lib/ai.ts.
 *
 * A question that is not in English, and that the site's own word lists could
 * not match to a passage, costs one small extra call for English search words
 * before the answer (src/lib/server/ai.ts, `searchWords`). It is counted too:
 * see `maySearchWords` below. An English question never makes it.
 *
 * Nothing about a question is stored or logged: not the question, the answer,
 * the page, the sources or the address. A failure logs a status and an error
 * type, and that is all.
 */
import { AI_LIMITS, AI_MESSAGES, validateAsk, type AiLimit } from "@/lib/ai";
import { aiAvailable, answerStream, cannedStream, openProvider, providerRequest, retrieve } from "@/lib/server/ai";
import { fail, json } from "@/lib/server/http";
import { honeypotFilled, openGate } from "@/lib/server/public-form";
import { rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  // never cached, never rewritten or held back by anything between here and the browser
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no",
  "X-Content-Type-Options": "nosniff",
};

const stream = (body: ReadableStream<Uint8Array>) => new Response(body, { status: 200, headers: STREAM_HEADERS });

function limited(limit: AiLimit, retryAfterSeconds: number) {
  return json({ ok: false, error: AI_MESSAGES[limit], limit }, 429, { "Retry-After": String(retryAfterSeconds) });
}

export function GET() {
  return json({ ok: true, available: aiAvailable() });
}

export async function POST(request: Request) {
  // switched off or not set up: said before anything is read
  if (!aiAvailable()) return fail(503, AI_MESSAGES.unavailable);

  const gate = await openGate(request, "ai");
  if (!gate.ok) return gate.response;

  // browsers state where a request came from; anything not from this site's own pages is refused
  const from = request.headers.get("sec-fetch-site");
  if (from !== null && from !== "same-origin") return fail(403, "This form can only be submitted from the GIO4X website.");

  // An automated sender gets what a person gets when nothing may be said, and the provider is never called.
  if (honeypotFilled(gate.body)) return stream(cannedStream(AI_MESSAGES.nothing));

  const checked = validateAsk(gate.body);
  if (!checked.ok) return fail(400, checked.error);
  const ask = checked.value;

  // asked sooner after the panel opened than a person can type (a clock that runs ahead is not held against anyone)
  const elapsed = Date.now() - ask.startedAt;
  if (elapsed >= 0 && elapsed < AI_LIMITS.minThinkMs) return stream(cannedStream(AI_MESSAGES.nothing));

  // the three limits, cheapest to trip first; the address is the key of an in-memory window and goes no further
  const minute = rateLimit("ai:minute", gate.ip, AI_LIMITS.perMinute);
  if (!minute.ok) return limited("minute", minute.retryAfterSeconds);
  const day = rateLimit("ai:day", gate.ip, AI_LIMITS.perDay);
  if (!day.ok) return limited("day", day.retryAfterSeconds);
  const everyone = rateLimit("ai:site", "all", AI_LIMITS.siteDay);
  if (!everyone.ok) return limited("site", everyone.retryAfterSeconds);

  // one clock for everything the provider is asked: the search words, if they are needed, and the answer
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), AI_LIMITS.timeoutMs);

  // Consulted only for a question that is not in English and found nothing (see retrieve). The one
  // extra call it allows is counted: against this address, by the same per-minute and per-day
  // numbers in windows of its own (so the question itself is still one question of the thirty),
  // and against the day's total for everyone, which is what bounds the bill. At a limit the
  // answer is: no, and the question is answered from what it found.
  const maySearchWords = () =>
    rateLimit("ai:words:minute", gate.ip, AI_LIMITS.perMinute).ok && rateLimit("ai:words:day", gate.ip, AI_LIMITS.perDay).ok && rateLimit("ai:site", "all", AI_LIMITS.siteDay).ok;

  let found: Awaited<ReturnType<typeof retrieve>>;
  try {
    found = await retrieve(ask, maySearchWords, abort.signal);
  } catch {
    clearTimeout(timer);
    console.error("[api/ai] retrieval failure");
    return fail(503, AI_MESSAGES.failed);
  }
  const { sources, texts } = found;

  const opened = await openProvider(providerRequest(sources, texts, ask), abort.signal);
  if (!opened.ok) {
    clearTimeout(timer);
    // status and error type only: never the question, the sources or the key
    console.error(`[api/ai] provider failure status=${opened.status} type=${opened.kind}`);
    return fail(503, AI_MESSAGES.failed);
  }

  return stream(
    answerStream(
      opened.body,
      sources,
      () => clearTimeout(timer),
      (code) => console.error(`[api/ai] answer failure code=${code}`),
    ),
  );
}
