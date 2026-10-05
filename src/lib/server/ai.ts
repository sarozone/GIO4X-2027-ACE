/**
 * GIO4X AI: the one place that talks to the model provider (Anthropic's
 * Messages API, called with fetch: no SDK, no new dependency).
 *
 * What leaves this server, and nothing else:
 *   the rules of the house (SYSTEM_PROMPT in src/lib/ai.ts)
 *   short passages of this site's own published pages (ai-corpus.ts)
 *   the visitor's question and, at most, the last three exchanges
 * and, for a question that is not in English and that the site's own word
 * lists could not match, one small request before that one, carrying the
 * question alone, for English search words (`searchWords`).
 * Not sent: the visitor's address, user agent, cookies, the page's contents
 * beyond its published passage, or anything that identifies a person.
 *
 * What is kept here: nothing. No question, answer or source list is written
 * to a database or to a log. A failure logs a status and an error type only.
 *
 * ANTHROPIC_API_KEY is a secret: hosting environment only, read here and
 * nowhere else, never NEXT_PUBLIC_, never logged. Without it, or with the
 * assistant switched off (src/config/ai.ts), `aiAvailable()` is false and the
 * endpoint answers 503.
 */
import "server-only";
import { AI_ENABLED, AI_KEYWORD_MODEL, aiModel } from "@/config/ai";
import { site } from "@/config/site";
import { ENGLISH_EQUIVALENT, LOCALES } from "@/i18n/config";
import {
  AI_LIMITS,
  AI_MESSAGES,
  KEYWORD_PROMPT,
  SYSTEM_PROMPT,
  bridgedQuestion,
  buildKeywordMessage,
  buildUserMessage,
  citedNumbers,
  cleanKeywords,
  englishPagePath,
  isEnglishQuestion,
  linkGuard,
  rank,
  relevance,
  siteHosts,
  toSources,
  type AiAsk,
  type AiEvent,
  type AiSource,
} from "@/lib/ai";
import { aiBridge } from "@/lib/server/ai-bridge";
import { aiCorpusLive } from "@/lib/server/ai-corpus";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

// GIO4X_ANTHROPIC_API_KEY comes first: on Netlify the name ANTHROPIC_API_KEY is taken by the host's own
// AI gateway, whose token the provider refuses (401) when called directly.
const apiKey = () => (process.env.GIO4X_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? "").trim();

/** Switched on at build time and a key present now. Says nothing about the key itself. */
export function aiAvailable(): boolean {
  return AI_ENABLED && apiKey() !== "";
}

const LOCALE_CODES: readonly string[] = LOCALES.map((l) => l.code);

/**
 * The passages a question will be answered from, numbered.
 *
 * A question in English is matched on its own words against the site's corpus
 * (with the blog's published posts, when they can be read), as it always was.
 *
 * A question in another language is matched on its own words too (tickers and
 * loanwords are the same in every language), and on the English words of every
 * glossary term and section name it contains (ai-bridge.ts). On a translated
 * page, the English page behind it counts as the current page. Only when all
 * of that has found nothing above AI_LIMITS.relevanceFloor, and `mayAsk`
 * allows it, is the provider asked once for English search words
 * (`searchWords` below) and the question matched again with them.
 *
 * `mayAsk` is the endpoint's: it counts that extra call against the limits and
 * says no when one is reached. It is never consulted for an English question.
 */
export async function retrieve(ask: AiAsk, mayAsk: () => boolean = () => false, signal?: AbortSignal): Promise<{ sources: AiSource[]; texts: string[] }> {
  const corpus = await aiCorpusLive();
  const page = englishPagePath(ask.page, LOCALE_CODES, ENGLISH_EQUIVALENT);
  const last = ask.history.length ? ask.history[ask.history.length - 1].q : undefined;
  if (isEnglishQuestion(ask.question)) return toSources(rank(corpus, ask.question, { page, earlier: last }));

  const bridge = await aiBridge();
  let question = bridgedQuestion(ask.question, bridge);
  if (relevance(corpus, question) < AI_LIMITS.relevanceFloor && mayAsk()) {
    const words = await searchWords(ask.question, signal);
    if (words) question = `${question} ${words}`;
  }
  return toSources(rank(corpus, question, { page, earlier: last ? bridgedQuestion(last, bridge) : undefined }));
}

/**
 * The body of the search-words call, exactly as sent: fixed rules and the
 * question, and nothing else. Not the earlier exchanges, not the page, not a
 * passage. Thirty tokens of reply at most, not streamed.
 */
export function keywordRequest(question: string): Record<string, unknown> {
  return {
    model: AI_KEYWORD_MODEL.id,
    max_tokens: AI_LIMITS.keywordTokens,
    system: KEYWORD_PROMPT,
    messages: [{ role: "user", content: buildKeywordMessage(question) }],
  };
}

/**
 * Three to six English search words for a question in another language, or ""
 * when the provider did not give any (it failed, was too slow, declined, or
 * the question is not about anything the site covers). The words are used to
 * find passages and for nothing else: the visitor never sees them, and they
 * are not sent on to the model that answers. A failure logs a status and an
 * error type, like every other.
 */
export async function searchWords(question: string, signal?: AbortSignal): Promise<string> {
  const limit = AbortSignal.timeout(AI_LIMITS.keywordTimeoutMs);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey(), "anthropic-version": API_VERSION },
      body: JSON.stringify(keywordRequest(question)),
      signal: signal ? AbortSignal.any([signal, limit]) : limit,
      cache: "no-store",
    });
    const parsed = (await response.json().catch(() => null)) as { content?: unknown; stop_reason?: unknown; error?: { type?: unknown } } | null;
    if (!response.ok) {
      const kind = typeof parsed?.error?.type === "string" ? parsed.error.type.replace(/[^a-z_]/g, "").slice(0, 40) : "unknown";
      console.error(`[api/ai] search words failure status=${response.status} type=${kind}`);
      return "";
    }
    if (!parsed || parsed.stop_reason === "refusal" || !Array.isArray(parsed.content)) return "";
    const text = (parsed.content as { type?: unknown; text?: unknown }[]).map((b) => (b?.type === "text" && typeof b.text === "string" ? b.text : "")).join(" ");
    return cleanKeywords(text);
  } catch {
    // too slow, or no connection: the question is answered from what it found without them
    return "";
  }
}

/**
 * The request body, exactly as sent. The system prompt is one unchanging
 * block marked for the provider's prompt cache; everything that varies (the
 * passages, the history, the question) comes after it, in a single user
 * message, so that nothing a visitor writes is ever sent as an assistant turn.
 *
 * On the cache: the provider caches a prefix only above a minimum length
 * (4,096 tokens on Claude Haiku 4.5), and these rules are far shorter, so on
 * the default model the mark costs nothing and saves nothing. It takes effect
 * on a model with a lower minimum, or if the rules ever grow past it.
 */
export function providerRequest(sources: AiSource[], texts: string[], ask: AiAsk): Record<string, unknown> {
  const model = aiModel();
  return {
    model: model.id,
    max_tokens: model.effort ? AI_LIMITS.maxTokensThinking : AI_LIMITS.maxTokens,
    stream: true,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserMessage(sources, texts, ask.history, ask.question) }],
    // a model that thinks before answering is asked to think briefly; Haiku 4.5 takes no such setting
    ...(model.effort ? { output_config: { effort: "low" } } : {}),
  };
}

export type ProviderOpen = { ok: true; body: ReadableStream<Uint8Array> } | { ok: false; status: number; kind: string };

/** Opens the answer stream. On refusal by the provider, returns its status and error type and nothing more. */
export async function openProvider(body: Record<string, unknown>, signal: AbortSignal): Promise<ProviderOpen> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey(), "anthropic-version": API_VERSION },
      body: JSON.stringify(body),
      signal,
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, kind: signal.aborted ? "timeout" : "network" };
  }
  if (!response.ok || !response.body) {
    let kind = "unknown";
    try {
      const parsed = (await response.json()) as { error?: { type?: unknown } };
      if (typeof parsed.error?.type === "string") kind = parsed.error.type.replace(/[^a-z_]/g, "").slice(0, 40);
    } catch {
      /* no readable error body: the status is enough */
    }
    return { ok: false, status: response.status, kind };
  }
  return { ok: true, body: response.body };
}

const encoder = new TextEncoder();
const line = (event: AiEvent) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`);

/** A whole answer that never went near the provider (see AI_MESSAGES.nothing). Same shape as a real one. */
export function cannedStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(line({ type: "sources", sources: [] }));
      controller.enqueue(line({ type: "delta", text }));
      controller.enqueue(line({ type: "done", cited: [] }));
      controller.close();
    },
  });
}

/**
 * Turns the provider's event stream into the site's own: the sources first,
 * then the text as it is written (every address checked on the way through,
 * see linkGuard), then which sources the answer cited.
 *
 * `finish` is called exactly once, when the stream ends for any reason, so
 * the caller can release its timer. `fail` receives a short code for the log.
 */
export function answerStream(upstream: ReadableStream<Uint8Array>, sources: AiSource[], finish: () => void, fail: (code: string) => void): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  const guard = linkGuard(siteHosts(site.url));
  let pending = "";
  let answer = "";
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    finish();
  };

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(line({ type: "sources", sources }));
    },
    async pull(controller) {
      let wrote = false;
      const emit = (text: string) => {
        if (!text) return;
        answer += text;
        wrote = true;
        controller.enqueue(line({ type: "delta", text }));
      };
      const close = (event: AiEvent) => {
        controller.enqueue(line(event));
        controller.close();
        end();
        reader.cancel().catch(() => undefined);
      };
      try {
        // read until there is something to pass on: a pull that enqueues nothing is not called again
        while (!wrote) {
          const { done, value } = await reader.read();
          if (done) {
            emit(guard.flush());
            close({ type: "done", cited: citedNumbers(answer, sources.length) });
            return;
          }
          pending += decoder.decode(value, { stream: true });
          let at: number;
          while ((at = pending.indexOf("\n")) >= 0) {
            const row = pending.slice(0, at).trim();
            pending = pending.slice(at + 1);
            if (!row.startsWith("data:")) continue;
            let event: { type?: string; delta?: { type?: string; text?: string; stop_reason?: string }; error?: { type?: string } };
            try {
              event = JSON.parse(row.slice(5));
            } catch {
              continue;
            }
            if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && typeof event.delta.text === "string") {
              emit(guard.push(event.delta.text));
            } else if (event.type === "message_delta" && event.delta?.stop_reason === "refusal") {
              // the provider's own safeguards declined: say so rather than show half an answer
              fail("refusal");
              close({ type: "error", error: AI_MESSAGES.declined });
              return;
            } else if (event.type === "error") {
              fail(`stream ${String(event.error?.type ?? "unknown").replace(/[^a-z_]/g, "").slice(0, 40)}`);
              close({ type: "error", error: AI_MESSAGES.failed });
              return;
            }
          }
        }
      } catch {
        fail("stream interrupted");
        try {
          close({ type: "error", error: AI_MESSAGES.failed });
        } catch {
          end();
        }
      }
    },
    cancel() {
      // the visitor closed the panel or left the page: stop paying for the rest of the answer
      end();
      reader.cancel().catch(() => undefined);
    },
  });
}
