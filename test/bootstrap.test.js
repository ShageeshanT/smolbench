// test/bootstrap.test.js
// Tests for bootstrap resampling and CI.

const assert = require("assert");
const { resample, bootstrapCI } = require("../lib/bootstrap");

// Resample must produce same length.
const arr = [1, 2, 3, 4, 5];
const r = resample(arr);
assert.strictEqual(r.length, arr.length, "resample length must match input length");
assert.ok(r.every((x) => arr.includes(x)), "resample values must come from original");

// Bootstrap CI must contain observed mean at roughly the right rate (within broad bounds).
const statFn = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const result = bootstrapCI(arr, statFn, 999, 0.95);
assert.ok(result.ci_low <= result.observed && result.observed <= result.ci_high,
  `CI [${result.ci_low.toFixed(4)}, ${result.ci_high.toFixed(4)}] must contain observed ${result.observed}`);
assert.strictEqual(result.n_boot, 999, "n_boot must be 999");

console.log("test/bootstrap.test.js: all assertions passed");
