// test/stats.test.js
// Tests for stats.js functions.

const assert = require("assert");
const { mean, variance, stdError, welchTTest } = require("../lib/stats");
const { confidenceInterval } = require("../lib/ci");

assert.strictEqual(mean([1, 2, 3, 4, 5]), 3.0, "mean of 1..5 must be 3.0");
assert.strictEqual(variance([2, 2, 2, 2]), 0, "variance of constant must be 0");

// Welch t-test: two identical samples should give t near 0.
const t1 = welchTTest([1, 2, 3], [1.1, 2.1, 3.1]);
assert.ok(Math.abs(t1.t) < 1.0, `t should be small for similar samples, got ${t1.t}`);

// CI: known 95% CI of a small sample should contain the mean.
const ci = confidenceInterval([1, 2, 3, 4, 5], 0.95);
assert.ok(ci.ci_low < 3.0 && ci.ci_high > 3.0, `CI [${ci.ci_low.toFixed(3)}, ${ci.ci_high.toFixed(3)}] must contain 3.0`);
assert.ok(ci.n === 5, `n must be 5, got ${ci.n}`);

console.log("test/stats.test.js: all assertions passed");
