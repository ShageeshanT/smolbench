/**
 * Prompt runner with cache integration and cost tracking.
 */
const { cacheGet, cacheSet } = require("./cache");
const { estimateCost } = require("./cost-estimator");

function runPrompt(promptId, model, provider) {
  const key = promptId + ":" + model;
  const cached = cacheGet(key);
  if (cached) return { ...cached, cacheHit: true };
  const result = callProvider(promptId, model, provider);
  const costUsd = estimateCost({ inputTokens: result.usage?.prompt_tokens ?? 0, outputTokens: result.usage?.completion_tokens ?? 0, provider });
  const enriched = { ...result, cacheHit: false, costUsd: +costUsd.toFixed(6) };
  cacheSet(key, enriched);
  return enriched;
}

function callProvider(promptId, model, provider) {
  // stub — real impl dispatches to provider adapter
  return { provider, model, promptId, output: "[stub]", usage: { prompt_tokens: 50, completion_tokens: 30 }, ts: Date.now() };
}

module.exports = { runPrompt };
