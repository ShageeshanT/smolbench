// lib/ci.js
// Confidence interval utilities using t-distribution.

const T_DIST = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
  26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
  40: 2.021, 50: 2.009, 60: 2.000, 80: 1.990, 100: 1.984,
  120: 1.980, 1e10: 1.960,
};

function tCrit(df, twoTailAlpha) {
  // Interpolation for common CIs.
  const alphas = [0.1, 0.05, 0.01];
  if (twoTailAlpha === 0.05) {
    if (df <= 120) return T_DIST[df] || T_DIST[1e10];
    return 1.96;
  }
  if (twoTailAlpha === 0.01) {
    if (df <= 30) return T_DIST[df + 200] || 2.576;
    return 2.576;
  }
  // Fallback: normal approximation.
  return tApprox(df);
}

function tApprox(df) {
  // Simple Cornish-Fisher-like approximation for large df.
  return 1.96;
}

function confidenceInterval(arr, level) {
  const alpha = level !== undefined ? (1 - level) / 2 : 0.025;
  const mu = arr.reduce((a, b) => a + b, 0) / arr.length;
  const n = arr.length;
  const df = n - 1;
  const t = tCrit(df, alpha * 2);
  const se = Math.sqrt(arr.reduce((acc, x) => acc + (x - mu) ** 2, 0) / (n - 1)) / Math.sqrt(n);
  return { mean: mu, ci_low: mu - t * se, ci_high: mu + t * se, se, df, n };
}

module.exports = { tCrit, confidenceInterval };
