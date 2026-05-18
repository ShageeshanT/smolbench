// test/failure-report.test.js
const assert = require("assert");
const { groupBy, summarize, textReport } = require("../lib/failure-report");

const records = [
  { category: "timeout", provider: "openai", prompt_id: "p1" },
  { category: "timeout", provider: "openai", prompt_id: "p2" },
  { category: "refusal", provider: "anthropic", prompt_id: "p1" },
  { category: "rate_limit", provider: "openai", prompt_id: "p1" },
];

const g = groupBy(records, "category");
assert.strictEqual(g.timeout.length, 2);
assert.strictEqual(g.refusal.length, 1);

const s = summarize(records);
assert.strictEqual(s.total, 4);
assert.strictEqual(s.by_category.timeout, 2);
assert.strictEqual(s.by_provider.openai, 3);
assert.ok(s.transient_share > 0.7, "transient share should be high");
assert.strictEqual(s.top_prompts[0].prompt_id, "p1");

const text = textReport(records);
assert.ok(text.includes("smolbench failure report"));
assert.ok(text.includes("timeout"));

console.log("test/failure-report.test.js: all assertions passed");
