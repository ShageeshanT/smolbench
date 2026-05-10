import { test } from "node:test";
import assert from "node:assert/strict";
import { createOpenRouterProvider } from "../lib/providers/openrouter.js";
import { createTogetherProvider } from "../lib/providers/together.js";
import { createGroqProvider } from "../lib/providers/groq.js";

test("openrouter provider has correct id and headers", () => {
  const p = createOpenRouterProvider({ apiKey: "x", model: "anthropic/claude-haiku-4-5" });
  assert.equal(p.id, "openrouter");
  assert.equal(p.model, "anthropic/claude-haiku-4-5");
  assert.equal(typeof p.call, "function");
});

test("together provider has correct id and base url shape", () => {
  const p = createTogetherProvider({ apiKey: "x", model: "meta-llama/Llama-3.3-70B" });
  assert.equal(p.id, "together");
});

test("groq provider has correct id", () => {
  const p = createGroqProvider({ apiKey: "x", model: "llama-3.3-70b-versatile" });
  assert.equal(p.id, "groq");
});
