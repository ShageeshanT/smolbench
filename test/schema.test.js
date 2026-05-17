// test/schema.test.js
// Tests for schema validation.

const assert = require("assert");
const { validateScoreRow, validateReport } = require("../lib/output-schema");

// Valid row passes.
const valid = { prompt_id: "test-1", mean: 0.85, ci_low: 0.7, ci_high: 0.95, n: 10 };
let r = validateScoreRow(valid);
assert.strictEqual(r.valid, true, "valid row must pass");

// Missing prompt_id fails.
r = validateScoreRow({ mean: 0.5 });
assert.strictEqual(r.valid, false, "missing prompt_id must fail");

// ci_high < ci_low fails.
r = validateScoreRow({ prompt_id: "x", mean: 0.5, ci_low: 0.8, ci_high: 0.3 });
assert.strictEqual(r.valid, false, "ci_high < ci_low must fail");

// Full report validation.
const report = {
  version: "0.8.0", timestamp: new Date().toISOString(), grand_mean: 0.75,
  scores: [{ prompt_id: "p1", mean: 0.8, ci_low: 0.7, ci_high: 0.9, n: 5 }],
};
r = validateReport(report);
assert.strictEqual(r.valid, true, "valid report must pass");

console.log("test/schema.test.js: all assertions passed");
