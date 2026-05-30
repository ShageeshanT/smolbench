// lib/runner.js
// Prompt runner with registry support, cache integration, and cost tracking.

const { cacheGet, cacheSet } = require("./cache");
const { estimateCost } = require("./cost-estimator");
const registry = require("./registry.js");

function promptKey(prompt) {
  return typeof prompt === "string" ? prompt : (prompt.id || prompt.user || JSON.stringify(prompt));
}

function legacyRunPrompt(promptId, model, provider) {
  const key = `${promptId}:${model}`;
  const cached = cacheGet(key);
  if (cached) return { ...cached, cacheHit: true };
  const result = callProvider(promptId, model, provider);
  const costUsd = estimateCost({
    inputTokens: result.usage?.prompt_tokens ?? 0,
    outputTokens: result.usage?.completion_tokens ?? 0,
    provider,
  });
  const enriched = { ...result, cacheHit: false, costUsd: +costUsd.toFixed(6) };
  cacheSet(key, enriched);
  return enriched;
}

async function runProvider(prompt, provider, options = {}) {
  const key = `${promptKey(prompt)}:${provider.id}:${provider.model}`;
  const useCache = options.cache === true;
  if (useCache) {
    const cached = cacheGet(key);
    if (cached) return { ...cached, cacheHit: true };
  }

  try {
    const response = await provider.call(prompt);
    const promptTokens = response.promptTokens ?? response.usage?.prompt_tokens ?? 0;
    const completionTokens = response.completionTokens ?? response.usage?.completion_tokens ?? 0;
    const costUsd = estimateCost({
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      provider: provider.id,
    });
    const row = {
      provider: provider.id,
      model: provider.model,
      promptId: prompt.id,
      output: response.text ?? response.output ?? "",
      latencyMs: response.latencyMs,
      usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens },
      cacheHit: false,
      costUsd: +costUsd.toFixed(6),
    };
    if (useCache) cacheSet(key, row);
    return row;
  } catch (error) {
    return {
      provider: provider.id,
      model: provider.model,
      promptId: prompt.id,
      error: error.message,
      cacheHit: false,
    };
  }
}

async function runPrompt(promptOrId, optionsOrModel, provider) {
  if (typeof promptOrId !== "object") {
    return legacyRunPrompt(promptOrId, optionsOrModel, provider);
  }

  const prompt = promptOrId;
  const options = optionsOrModel || {};
  const providers = registry.list();
  if (options.parallel) {
    return Promise.all(providers.map((item) => runProvider(prompt, item, options)));
  }

  const rows = [];
  for (const item of providers) {
    rows.push(await runProvider(prompt, item, options));
  }
  return rows;
}

function callProvider(promptId, model, provider) {
  return {
    provider,
    model,
    promptId,
    output: "[stub]",
    usage: { prompt_tokens: 50, completion_tokens: 30 },
    ts: Date.now(),
  };
}

module.exports = { runPrompt, runProvider };
