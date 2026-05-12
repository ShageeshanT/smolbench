import { test } from "node:test";
import assert from "node:assert/strict";
import { toOtlpJson } from "../lib/otel-export.js";

test("toOtlpJson produces one span per row with smolbench attributes", () => {
  const out = toOtlpJson({
    suite: "demo", at: "2026-05-09T10:00:00Z",
    rows: [
      { provider: "p", model: "m", promptId: "x", latencyMs: 100, cost: 0.001, quality: 0.9, promptTokens: 10, completionTokens: 20 },
      { provider: "q", model: "n", promptId: "y", latencyMs: 200, cost: 0.002, quality: 0.5 },
    ],
  });
  const spans = out.resourceSpans[0].scopeSpans[0].spans;
  assert.equal(spans.length, 2);
  assert.equal(spans[0].name, "p.m.x");
  const cost = spans[0].attributes.find((a) => a.key === "smolbench.cost_usd");
  assert.equal(cost.value.doubleValue, 0.001);
});

test("toOtlpJson marks errored rows", () => {
  const out = toOtlpJson({ suite: "s", rows: [{ provider: "p", model: "m", promptId: "x", error: "nope" }] });
  const span = out.resourceSpans[0].scopeSpans[0].spans[0];
  assert.equal(span.status.code, "STATUS_CODE_ERROR");
});
