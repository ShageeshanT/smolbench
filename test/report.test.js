import { test } from "node:test";
import assert from "node:assert/strict";
import { renderHtml } from "../lib/report-html.js";
import { renderCsv } from "../lib/report-csv.js";

test("renderHtml produces a self-contained document", () => {
  const html = renderHtml({ suite: "demo", at: "now" }, [
    { provider: "p", model: "m", quality: 0.8, cost: 0.001, latencyMs: 100, _score: { total: 0.5 } },
  ]);
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /smolbench, demo/);
  assert.match(html, /class="winner"/);
  assert.ok(!html.includes("http://"), "no external resources");
});

test("renderHtml escapes HTML in fields", () => {
  const html = renderHtml({ suite: "<bad>" }, [
    { provider: "<x>", model: "m", _score: { total: 0 } },
  ]);
  assert.ok(!html.includes("<bad>"));
  assert.match(html, /&lt;bad&gt;/);
});

test("renderCsv emits headers and rows", () => {
  const csv = renderCsv([
    { provider: "p", model: "m", promptId: "id1", quality: 0.9, cost: 0.001, latencyMs: 100, _score: { total: 0.5 } },
  ]);
  const lines = csv.trim().split("\n");
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^rank,provider,model/);
  assert.match(lines[1], /^1,p,m,id1/);
});

test("renderCsv quotes fields containing commas", () => {
  const csv = renderCsv([{ provider: "a,b", model: "m", promptId: "x", _score: { total: 0 } }]);
  assert.match(csv, /"a,b"/);
});
