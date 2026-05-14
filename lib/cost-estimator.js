/**
 * Cost estimation for smolbench runs.
 * Published per-provider token pricing.
 */
const PROVIDER_PRICES = {
  openai:    { input: 1.5e-6,  output: 4.86e-6 },
  anthropic:  { input: 1.5e-6,  output: 4.86e-6 },
  google:     { input: 1.5e-6,  output: 4.86e-6 },
  deepseek:   { input: 0.27e-6, output: 1.1e-6  },
  ollama:     { input: 0,       output: 0       },
};

function estimateCost({ inputTokens, outputTokens, provider = "openai" }) {
  const p = PROVIDER_PRICES[provider] ?? PROVIDER_PRICES.openai;
  return inputTokens * p.input + outputTokens * p.output;
}

function estimateRunCost(run) {
  if (!run.usage) return null;
  return estimateCost({ inputTokens: run.usage.prompt_tokens ?? 0, outputTokens: run.usage.completion_tokens ?? 0, provider: run.provider });
}

function summariseCosts(results) {
  let total = 0;
  const byProvider = {};
  for (const r of results) {
    const c = estimateRunCost(r);
    if (c === null) continue;
    total += c;
    const p = r.provider ?? "unknown";
    byProvider[p] = (byProvider[p] ?? 0) + c;
  }
  return { totalUsd: +total.toFixed(4), byProvider };
}

module.exports = { estimateCost, estimateRunCost, summariseCosts, PROVIDER_PRICES };
