<!-- docs/statistical-rigor.md -->
# Statistical Rigor in smolbench 0.8.0

smolbench 0.8.0 introduces a set of statistical tools to make benchmark results
more trustworthy and reportable.

## Replicates

Each run produces a `Run` object. A `ReplicatePool` aggregates multiple runs so you can
report the grand mean and per-replicate statistics.

```js
const { ReplicatePool } = require("./lib/replicate");
const pool = new ReplicatePool(runScores);
console.log(pool.grandMean());
```

## Confidence Intervals

Every prompt score now includes a 95% CI computed via the t-distribution.

```js
const { confidenceInterval } = require("./lib/ci");
const ci = confidenceInterval([0.8, 0.85, 0.9], 0.95);
// ci.mean, ci.ci_low, ci.ci_high
```

## Bootstrap CI

For non-parametric cases, bootstrap resampling generates CIs without normality assumptions.

```js
const { bootstrapCI } = require("./lib/bootstrap");
bootstrapCI(scores, (arr) => mean(arr), 999, 0.95);
```

## Effect Size

Cohen's d measures the magnitude of differences between two conditions.

```js
const { cohensD } = require("./lib/effect-size");
cohensD(conditionA, conditionB);
```

## Welch's t-test

For comparing two samples with unequal variances, Welch's t-test is used.

```js
const { welchTTest } = require("./lib/stats");
welchTTest(sample1, sample2);
```

## Output Schema

All score rows are validated against a JSON Schema before being emitted.

```js
const { validateScoreRow } = require("./lib/output-schema");
validateScoreRow(row); // { valid, errors }
```

## Power Analysis

For planning required sample size:

```js
const { powerAnalysis, requiredN } = require("./lib/power");
requiredN({ effectSize: 0.5, alpha: 0.05, power: 0.8 });
```

## Reporting

Reports are available in text, JSON, and HTML (with error bars).

```js
const { textReport, jsonReport } = require("./lib/report");
const { htmlReport } = require("./lib/report-html");
```
