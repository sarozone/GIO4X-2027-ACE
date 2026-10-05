/**
 * GIO4X AI: the one place that talks to the model provider (Anthropic's
 * Messages API, called with fetch: no SDK, no new dependency).
 *
 * What leaves this server, and nothing else:
 *   the rules of the house (SYSTEM_PROMPT in src/lib/ai.ts)
 *   short passages of this site's own published pages (ai-corpus.ts)
 *   the visitor's question and, at most, the last three exchanges
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
import { AI_ENABLED, aiModel } from "@/config/ai";
import { site } from "@/config/site";
import { AI_LIMITS, AI_MESSAGES, SYSTEM_PROMPT, buildUserMessage, citedNumbers, linkGuard, rank, siteHosts, toSources, type AiAsk, type AiEvent, type AiSource } from "@/lib/ai";
import { aiCorpus } from "@/lib/server/ai-corpus";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

const apiKey = () => (process.env.ANTHROPIC_API_KEY ?? "").trim();

/** Switched on at build time and a key present now. Says nothing about the key itself. */
export function aiAvailable(): boolean {
  return AI_ENABLED && apiKey() !== "";
}

/** The passages a question will be answered from, numbered. No network: the site's own corpus. */
export function retrieve(ask: AiAsk): { sources: AiSource[]; texts: string[] } {
  const earlier = ask.history.length ? ask.history[ask.history.length - 1].q : undefined;
  return toSources(rank(aiCorpus(), ask.question, { page: ask.page, earlier }));
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
