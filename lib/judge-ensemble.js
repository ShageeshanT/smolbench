// lib/judge-ensemble.js
// Ensemble judge with consensus variance reporting.

function ensembleVote(results) {
  const counts = {};
  results.forEach((r) => {
    const key = String(r.score ?? r);
    counts[key] = (counts[key] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topScore = sorted[0][0];
  const topCount = sorted[0][1];
  const consensus = topCount / results.length;
  const spread = Math.sqrt(Object.entries(counts).reduce((acc, [k, v]) => acc + (v - topCount) ** 2, 0) / results.length);
  return {
    top_score: isNaN(topScore) ? topScore : parseFloat(topScore),
    top_count: topCount,
    consensus,
    spread,
    votes: counts,
  };
}

function ensembleStats(ensembleResults) {
  const allScores = ensembleResults.flatMap((e) => e.scores || []);
  const m = allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1);
  const v = allScores.reduce((acc, s) => acc + (s - m) ** 2, 0) / (allScores.length || 1);
  return {
    grand_mean: m,
    variance: v,
    std: Math.sqrt(v),
    n: allScores.length,
  };
}

function parseJudgeScore(text) {
  try {
    const parsed = JSON.parse(text);
    const score = Number(parsed.score);
    if (!Number.isFinite(score)) return 0;
    return Math.max(0, Math.min(1, score / 10));
  } catch {
    return 0;
  }
}

async function ensembleJudge({ judgeProviders = [], prompt = {}, candidate = "" }) {
  const votes = [];

  for (const provider of judgeProviders) {
    try {
      const response = await provider.call({ prompt, candidate });
      const score = parseJudgeScore(response?.text ?? "");
      votes.push({ provider: provider.id, score });
    } catch (error) {
      votes.push({ provider: provider.id, score: null, error: error.message });
    }
  }

  const validScores = votes.map((vote) => vote.score).filter((score) => typeof score === "number");
  const score = validScores.reduce((sum, value) => sum + value, 0) / (validScores.length || 1);
  return { score, votes };
}

module.exports = { ensembleVote, ensembleStats, ensembleJudge };
