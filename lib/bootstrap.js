// lib/bootstrap.js
// Non-parametric bootstrap for confidence intervals.

function resample(arr) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[Math.floor(Math.random() * arr.length)]);
  }
  return out;
}

function bootstrapCI(arr, statisticFn, nBoot, level) {
  const obs = statisticFn(arr);
  const replicates = [];
  for (let i = 0; i < nBoot; i++) {
    replicates.push(statisticFn(resample(arr)));
  }
  replicates.sort((a, b) => a - b);
  const alpha = (1 - level) / 2;
  const loIdx = Math.floor(alpha * nBoot);
  const hiIdx = Math.floor((1 - alpha) * nBoot);
  return {
    observed: obs,
    ci_low: replicates[loIdx],
    ci_high: replicates[hiIdx],
    n_boot: nBoot,
    level,
  };
}

function bootstrapSE(arr, statisticFn, nBoot) {
  const replicates = [];
  for (let i = 0; i < nBoot; i++) {
    replicates.push(statisticFn(resample(arr)));
  }
  const mean = replicates.reduce((a, b) => a + b, 0) / nBoot;
  const se = Math.sqrt(replicates.reduce((acc, x) => acc + (x - mean) ** 2, 0) / nBoot);
  return se;
}

module.exports = { resample, bootstrapCI, bootstrapSE };
