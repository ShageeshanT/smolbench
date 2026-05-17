// test/replicate.test.js
// Tests for Run and ReplicatePool.

const assert = require("assert");
const { Run, ReplicatePool } = require("../lib/replicate");

// Known distribution: exact mean of [1,2,3] is 2.0.
const r1 = new Run("r1", [1, 2, 3]);
assert.strictEqual(r1.mean, 2.0, "Run mean of [1,2,3] must be 2.0");
assert.strictEqual(r1.n, 3, "Run n must be 3");

// ReplicatePool across two runs.
const pool = new ReplicatePool([[1, 2, 3], [5, 7, 9]]);
const grandMean = pool.grandMean();
assert.ok(grandMean >= 4.4 && grandMean <= 4.6, `grand mean expected ~4.5, got ${grandMean}`);

const pool2 = new ReplicatePool([[1, 1, 1], [3, 3, 3]]);
assert.strictEqual(pool2.grandMean(), 2.0, "grand mean of [1,1,1] and [3,3,3] must be 2.0");

console.log("test/replicate.test.js: all assertions passed");
