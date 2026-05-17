// lib/score.js
// Score computation with per-row mean, CI, n.

const { mean, stdError } = require("./stats");
const { confidenceInterval } = require("./ci");

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

module.exports = { scoreSinglePrompt, scoreAll };
