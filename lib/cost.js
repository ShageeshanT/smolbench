// Per-1M-token pricing in USD. Approximate, current as of authoring date.
// Used by lib/score.js to compute effective cost per call. Add or override
// entries by writing your own pricing.json and passing it via the CLI.

export const PRICING = {
  // Anthropic
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  // OpenAI
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  // Google
  "gemini-2.5-pro": { input: 1.25, output: 5 },
  "gemini-2.5-flash": { input: 0.075, output: 0.3 },
  // NVIDIA NIM (hosted, per 1M)
  "meta/llama-3.3-70b-instruct": { input: 0.18, output: 0.18 },
  "deepseek-ai/deepseek-r1": { input: 0.55, output: 2.19 },
  "qwen/qwen2.5-72b-instruct": { input: 0.35, output: 0.4 },
  // MiniMax
  "MiniMax-M2": { input: 0.3, output: 1.2 },
  "MiniMax-M2.7": { input: 0.4, output: 1.6 },
};

/**
 * Compute USD cost for a single call.
 * @param {string} model - canonical model id (any key from PRICING, or "<vendor>/<id>")
 * @param {number} promptTokens
 * @param {number} completionTokens
 * @returns {number|null} cost in USD, or null if model is unknown
 */
export function costFor(model, promptTokens, completionTokens) {
  const p = PRICING[model] || PRICING[String(model || "").split("/").pop()];
  if (!p) return null;
  const inT = Number(promptTokens) || 0;
  const outT = Number(completionTokens) || 0;
  return (inT * p.input + outT * p.output) / 1_000_000;
}

/** Merge a user-provided pricing override into PRICING. */
export function setPricing(overrides) {
  Object.assign(PRICING, overrides || {});
}
