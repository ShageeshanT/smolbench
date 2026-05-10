import { test } from "node:test";
import assert from "node:assert/strict";
import { makeCostGuard } from "../lib/cost-ceiling.js";

test("cost guard accumulates and flags when exceeded", () => {
  const g = makeCostGuard(0.005);
  let r = g.accumulate({ cost: 0.002 });
  assert.equal(r.exceeded, false);
  r = g.accumulate({ cost: 0.002 });
  assert.equal(r.exceeded, false);
  r = g.accumulate({ cost: 0.003 });
  assert.equal(r.exceeded, true);
  assert.ok(g.spent() > 0.005);
});

test("cost guard with no ceiling never flags", () => {
  const g = makeCostGuard(null);
  const r = g.accumulate({ cost: 1000 });
  assert.equal(r.exceeded, false);
});
