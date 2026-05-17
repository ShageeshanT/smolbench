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

module.exports = { ensembleVote, ensembleStats };
