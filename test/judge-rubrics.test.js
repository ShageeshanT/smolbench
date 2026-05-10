import { test } from "node:test";
import assert from "node:assert/strict";
import { rubricFor, TASKS } from "../lib/judge-rubrics.js";

test("rubricFor returns task-specific rubric", () => {
  assert.notEqual(rubricFor("code"), rubricFor("classification"));
  assert.match(rubricFor("code"), /code review/i);
  assert.match(rubricFor("extraction"), /JSON/i);
  assert.match(rubricFor("summarisation"), /word count/i);
});

test("rubricFor falls back to general for unknown task", () => {
  assert.equal(rubricFor("unknown-task-xyz"), rubricFor("general"));
});

test("TASKS lists all defined rubrics", () => {
  assert.ok(TASKS.includes("general"));
  assert.ok(TASKS.includes("code"));
  assert.ok(TASKS.includes("classification"));
  assert.ok(TASKS.includes("extraction"));
  assert.ok(TASKS.includes("summarisation"));
});
