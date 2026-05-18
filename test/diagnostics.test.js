// test/diagnostics.test.js
const assert = require("assert");
const { buildDiagnostic, snapshotError, snapshotOutput } = require("../lib/diagnostics");

const err = Object.assign(new Error("boom"), { code: "E_X", status: 500 });
const e = snapshotError(err);
assert.strictEqual(e.name, "Error");
assert.strictEqual(e.message, "boom");
assert.strictEqual(e.code, "E_X");
assert.strictEqual(e.status, 500);

const o = snapshotOutput("a".repeat(1000), 100);
assert.strictEqual(o.length, 1000);
assert.strictEqual(o.excerpt.length, 100);
assert.strictEqual(o.truncated, true);

const d = buildDiagnostic({
  runId: "r1", promptId: "p1", provider: "openai", model: "gpt-x",
  attempt: 2, category: "timeout", err, output: "hi", latencyMs: 1200, costUsd: 0.01,
});
assert.strictEqual(d.run_id, "r1");
assert.strictEqual(d.attempt, 2);
assert.strictEqual(d.category, "timeout");
assert.ok(d.timestamp);
assert.strictEqual(d.error.message, "boom");
assert.strictEqual(d.output.excerpt, "hi");

console.log("test/diagnostics.test.js: all assertions passed");
