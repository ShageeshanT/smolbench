import { test } from "node:test";
import assert from "node:assert/strict";
import { validateConfig } from "../lib/config-schema.js";

test("validateConfig accepts a minimal valid config", () => {
  const r = validateConfig({ providers: [{ id: "a", kind: "anthropic", model: "claude-haiku-4-5" }] });
  assert.equal(r.ok, true);
  assert.equal(r.errors.length, 0);
});

test("validateConfig flags missing fields", () => {
  const r = validateConfig({ providers: [{ id: "a", model: "m" }] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /missing kind/.test(e)));
});

test("validateConfig flags unknown kind", () => {
  const r = validateConfig({ providers: [{ id: "a", kind: "magic", model: "m" }] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /unknown kind/.test(e)));
});

test("validateConfig requires baseUrl for openai-compat", () => {
  const r = validateConfig({ providers: [{ id: "a", kind: "openai-compat", model: "m" }] });
  assert.ok(r.errors.some((e) => /baseUrl/.test(e)));
});

test("validateConfig flags duplicate provider ids", () => {
  const r = validateConfig({ providers: [
    { id: "x", kind: "anthropic", model: "m" },
    { id: "x", kind: "google", model: "m" },
  ]});
  assert.ok(r.errors.some((e) => /duplicate/.test(e)));
});

test("validateConfig flags weights that do not sum to 1", () => {
  const r = validateConfig({ providers: [{ id: "a", kind: "anthropic", model: "m" }], weights: { q: 0.9, c: 0.5, l: 0.5 } });
  assert.ok(r.errors.some((e) => /weights sum/.test(e)));
});
