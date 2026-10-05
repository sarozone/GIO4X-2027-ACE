/**
 * GIO4X AI: the switch and the model, as the BUILD saw them.
 *
 * Both values are written into the build by next.config.mjs (`env`), so the
 * static pages that describe the assistant (/trust/ai, /trust), the Lens panel
 * and the endpoint that answers (/api/ai) all read one value and cannot
 * disagree. To switch the assistant on or off, change GIO4X_AI_ENABLED in the
 * hosting environment and redeploy: the pages change in the same deploy.
 *
 * Nothing here is a secret. The provider key is read in one place only,
 * src/lib/server/ai.ts, on the server, at the moment a question is answered.
 */

/** True only when GIO4X_AI_ENABLED was exactly "true" when the site was built. */
export const AI_ENABLED = process.env.GIO4X_AI_ENABLED === "true";

export type AiModel = {
  /** the id sent to the provider */
  id: string;
  /** as named on /trust/ai */
  label: string;
  /** the newer models think before they answer and take an effort setting; Haiku 4.5 does neither */
  effort: boolean;
};

/** The models GIO4X_AI_MODEL may name. Anything else falls back to the first. */
export const AI_MODELS: AiModel[] = [
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", effort: false },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", effort: true },
  { id: "claude-opus-5-5", label: "Claude Opus 5.5", effort: true },
];

/** The dated name of the default model is accepted as the same model. */
const ALSO: Record<string, string> = { "claude-haiku-4-5-20251001": "claude-haiku-4-5" };

export function aiModel(): AiModel {
  const asked = (process.env.GIO4X_AI_MODEL ?? "").trim().toLowerCase();
  return AI_MODELS.find((m) => m.id === (ALSO[asked] ?? asked)) ?? AI_MODELS[0];
}

/** The company whose model answers. Named on /trust/ai whenever the assistant is on. */
export const AI_PROVIDER = "Anthropic";
