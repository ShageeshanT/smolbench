// lib/stats.js
// Basic descriptive and inferential statistics.

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr, mu) {
  if (!arr.length) return 0;
  const m = mu !== undefined ? mu : mean(arr);
  return arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / arr.length;
}

function stdError(arr) {
  if (arr.length < 2) return 0;
  return Math.sqrt(variance(arr) / arr.length);
}

function welchTTest(sample1, sample2) {
  const m1 = mean(sample1), m2 = mean(sample2);
  const v1 = variance(sample1, m1) / sample1.length;
  const v2 = variance(sample2, m2) / sample2.length;
  const t = (m1 - m2) / Math.sqrt(v1 + v2);
  const df = ((v1 + v2) ** 2) / ((v1 ** 2) / (sample1.length - 1) + (v2 ** 2) / (sample2.length - 1));
  return { t, df, mean1: m1, mean2: m2 };
}

function pValueFromT(t, df) {
  // Approximate p-value using normal approximation for large df.
  // For exact use, pair with a t-distribution table.
  const x = df / (df + t * t);
  let p = 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
  return Math.max(0, Math.min(1, p));
}

function incompleteBeta(x, a, b) {
  // Simple continued-fraction approximation (NIST SGB, §6.6).
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.pow(x, a) * Math.pow(1 - x, b) / x / (1 - x);
  const bt = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) * psi(a) / psi(a + b);
  return bt;
}

function lgamma(z) {
  // Lanczos approximation (g=5).
  const g = 5;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5046324520526053e-5];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * lgamma(1 - z));
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function psi(x) {
  // Digamma via series expansion.
  const Euler = 0.57721566490153286;
  if (x < 0) return psi(1 - x) - Math.PI / Math.tan(Math.PI * x);
  let sum = -Euler - 1 / x;
  for (let n = 1; n < 1000; n++) sum += x / (n * (n + x));
  return sum;
}

module.exports = { mean, variance, stdError, welchTTest, pValueFromT };
