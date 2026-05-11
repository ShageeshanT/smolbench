import { test } from "node:test";
import assert from "node:assert/strict";
import { summarise } from "../lib/notify.js";

test("summarise renders a winner line", () => {
  const out = summarise("hello", [
    { provider: "anthropic", model: "claude-haiku-4-5", quality: 0.92, cost: 0.001, latencyMs: 250 },
    { provider: "google", model: "gemini-2.5-flash", quality: 0.85, cost: 0.0001, latencyMs: 200 },
  ]);
  assert.match(out, /Winner: anthropic claude-haiku-4-5/);
  assert.match(out, /q=0.92/);
  assert.match(out, /Rows: 2/);
});

test("summarise handles empty rows", () => {
  const out = summarise("empty", []);
  assert.match(out, /no rows/);
});
