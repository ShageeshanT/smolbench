// lib/effect-size.js
// Cohen's d effect size calculation.

function cohensD(sample1, sample2) {
  const n1 = sample1.length, n2 = sample2.length;
  const m1 = sample1.reduce((a, b) => a + b, 0) / n1;
  const m2 = sample2.reduce((a, b) => a + b, 0) / n2;
  const v1 = sample1.reduce((acc, x) => acc + (x - m1) ** 2, 0) / (n1 - 1);
  const v2 = sample2.reduce((acc, x) => acc + (x - m2) ** 2, 0) / (n2 - 1);
  const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
  return (m1 - m2) / Math.sqrt(pooledVar);
}

function cohensDUnpooled(sample1, sample2) {
  const m1 = sample1.reduce((a, b) => a + b, 0) / sample1.length;
  const m2 = sample2.reduce((a, b) => a + b, 0) / sample2.length;
  const v1 = sample1.reduce((acc, x) => acc + (x - m1) ** 2, 0) / sample1.length;
  const v2 = sample2.reduce((acc, x) => acc + (x - m2) ** 2, 0) / sample2.length;
  return (m1 - m2) / Math.sqrt((v1 + v2) / 2);
}

function interpretCohenD(d) {
  const abs = Math.abs(d);
  if (abs < 0.2) return "negligible";
  if (abs < 0.5) return "small";
  if (abs < 0.8) return "medium";
  return "large";
}

module.exports = { cohensD, cohensDUnpooled, interpretCohenD };
