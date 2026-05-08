// Smoke tests for smolbench core modules. Uses node --test.
// Run: npm test (or node --test test/)

import { test } from "node:test";
import assert from "node:assert/strict";
import { register, list, get, clear } from "../lib/registry.js";
import { costFor, PRICING } from "../lib/cost.js";
import { scoreRow, rankRows } from "../lib/score.js";
import { parseYaml } from "../lib/yaml.js";
import { diff, regressions } from "../lib/diff.js";

test("registry register/list/get/clear", () => {
  clear();
  const p = { id: "fake", model: "m1", call: async () => ({ text: "ok" }) };
  register(p);
  assert.equal(list().length, 1);
  assert.equal(get("fake", "m1"), p);
  clear();
  assert.equal(list().length, 0);
});

test("registry rejects invalid providers", () => {
  assert.throws(() => register({}));
  assert.throws(() => register({ id: "x" }));
});

test("cost.costFor returns USD for known model", () => {
  const c = costFor("claude-haiku-4-5", 1_000_000, 1_000_000);
  assert.equal(c, PRICING["claude-haiku-4-5"].input + PRICING["claude-haiku-4-5"].output);
});

test("cost.costFor returns null for unknown model", () => {
  assert.equal(costFor("nope-9999", 100, 100), null);
});

test("score.scoreRow weights quality inversely", () => {
  const a = scoreRow({ model: "claude-haiku-4-5", quality: 1, latencyMs: 0, promptTokens: 0, completionTokens: 0 });
  const b = scoreRow({ model: "claude-haiku-4-5", quality: 0, latencyMs: 0, promptTokens: 0, completionTokens: 0 });
  assert.ok(a.total < b.total, "higher quality must give lower score");
});

test("score.rankRows sorts ascending by total", () => {
  const rows = [
    { provider: "x", model: "claude-haiku-4-5", quality: 0.2, latencyMs: 1000, promptTokens: 100, completionTokens: 100 },
    { provider: "x", model: "claude-haiku-4-5", quality: 0.9, latencyMs: 200, promptTokens: 100, completionTokens: 100 },
  ];
  const r = rankRows(rows);
  assert.equal(r[0].quality, 0.9);
});

test("yaml.parseYaml top-level mapping with strings and ints", () => {
  const y = parseYaml("name: hello\ncount: 3\nflag: true\n");
  assert.deepEqual(y, { name: "hello", count: 3, flag: true });
});

test("yaml.parseYaml list of mappings", () => {
  const y = parseYaml("items:\n  - id: a\n    n: 1\n  - id: b\n    n: 2\n");
  assert.deepEqual(y, { items: [{ id: "a", n: 1 }, { id: "b", n: 2 }] });
});

test("diff and regressions thresholds", () => {
  const A = { rows: [{ provider: "p", model: "m", promptId: "x", latencyMs: 100, cost: 0.0001, quality: 0.8 }] };
  const B = { rows: [{ provider: "p", model: "m", promptId: "x", latencyMs: 1000, cost: 0.01, quality: 0.5 }] };
  const d = diff(A, B);
  assert.equal(d.length, 1);
  assert.equal(d[0].dLatencyMs, 900);
  const r = regressions(d);
  assert.equal(r.length, 1);
});
