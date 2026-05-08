// Smoke tests for the new runner parallel and cache flags.

import { test } from "node:test";
import assert from "node:assert/strict";
import { register, clear } from "../lib/registry.js";
import { runPrompt } from "../lib/runner.js";

test("runner parallel returns one row per provider", async () => {
  clear();
  let calls = 0;
  for (const id of ["a", "b", "c"]) {
    register({
      id, model: "m1",
      call: async () => { calls++; await new Promise((r) => setTimeout(r, 10)); return { text: id, latencyMs: 10, promptTokens: 1, completionTokens: 1 }; },
    });
  }
  const start = Date.now();
  const rows = await runPrompt({ id: "p1", user: "ping" }, { parallel: true });
  const elapsed = Date.now() - start;
  assert.equal(rows.length, 3);
  assert.equal(calls, 3);
  // sequential would be ~30ms+, parallel should comfortably finish under 25ms
  assert.ok(elapsed < 30, `parallel elapsed ${elapsed}ms suggests sequential`);
  clear();
});

test("runner returns error rows on provider throw", async () => {
  clear();
  register({ id: "broken", model: "m1", call: async () => { throw new Error("boom"); } });
  const rows = await runPrompt({ id: "p1", user: "ping" });
  assert.equal(rows.length, 1);
  assert.match(rows[0].error, /boom/);
  clear();
});
