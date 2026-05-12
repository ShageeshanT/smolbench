import { test } from "node:test";
import assert from "node:assert/strict";
import { filterByTags, listAllTags } from "../lib/tags.js";

const SAMPLE = [
  { id: "p1", meta: { tags: ["en", "retail"] } },
  { id: "p2", meta: { tags: ["en", "privacy"] } },
  { id: "p3", meta: {} },
  { id: "p4" },
];

test("filterByTags keeps prompts with at least one matching tag", () => {
  assert.deepEqual(filterByTags(SAMPLE, ["retail"]).map((p) => p.id), ["p1"]);
  assert.deepEqual(filterByTags(SAMPLE, ["en"]).map((p) => p.id), ["p1", "p2"]);
});

test("filterByTags returns input untouched when no tags requested", () => {
  assert.equal(filterByTags(SAMPLE, []).length, 4);
  assert.equal(filterByTags(SAMPLE).length, 4);
});

test("listAllTags returns sorted unique tags", () => {
  assert.deepEqual(listAllTags(SAMPLE), ["en", "privacy", "retail"]);
});
