// lib/score.js
// Score computation helpers for prompt statistics and model ranking.

const { confidenceInterval } = require("./ci");
const { estimateCost } = require("./cost-estimator");

const DEFAULT_WEIGHTS = Object.freeze({ quality: 0.55, cost: 0.2, latency: 0.25 });

function scoreSinglePrompt(runScores, promptId) {
  const scores = runScores[promptId];
  if (!scores || !scores.length) return null;
  const ci = confidenceInterval(scores, 0.95);
  return {
    prompt_id: promptId,
    mean: ci.mean,
    ci_low: ci.ci_low,
    ci_high: ci.ci_high,
    n: ci.n,
    se: ci.se,
  };
}

function scoreAll(runScores) {
  return Object.keys(runScores).map((pid) => scoreSinglePrompt(runScores, pid)).filter(Boolean);
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function tokenCost(row) {
  if (typeof row.cost === "number") return row.cost;
  if (typeof row.costUsd === "number") return row.costUsd;
  return estimateCost({
    provider: row.provider,
    inputTokens: row.promptTokens ?? row.inputTokens ?? row.usage?.prompt_tokens ?? 0,
    outputTokens: row.completionTokens ?? row.outputTokens ?? row.usage?.completion_tokens ?? 0,
  });
}

function scoreRow(row, weights = DEFAULT_WEIGHTS) {
  const quality = clamp01(Number(row.quality ?? row.score ?? 0));
  const cost = Math.max(0, Number(tokenCost(row)) || 0);
  const latencySeconds = Math.max(0, Number(row.latencyMs ?? row.durationMs ?? 0) || 0) / 1000;
  const qualityPenalty = (1 - quality) * weights.quality;
  const costPenalty = cost * weights.cost;
  const latencyPenalty = latencySeconds * weights.latency;
  return {
    total: qualityPenalty + costPenalty + latencyPenalty,
    qualityPenalty,
    costPenalty,
    latencyPenalty,
    cost,
  };
}

function rankRows(rows, weights = DEFAULT_WEIGHTS) {
  return [...(rows || [])]
    .map((row) => ({ ...row, _score: scoreRow(row, weights) }))
    .sort((a, b) => a._score.total - b._score.total);
}

module.exports = { DEFAULT_WEIGHTS, scoreSinglePrompt, scoreAll, scoreRow, rankRows };
