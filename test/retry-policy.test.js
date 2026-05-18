// test/retry-policy.test.js
const assert = require("assert");
const { shouldRetry, backoffMs, nextDelay } = require("../lib/retry-policy");

assert.strictEqual(shouldRetry("timeout", 0), true);
assert.strictEqual(shouldRetry("timeout", 4), false, "stop at max_attempts");
assert.strictEqual(shouldRetry("auth_error", 0), false, "auth_error is fatal");
assert.strictEqual(shouldRetry("refusal", 0), false, "refusal is fatal");
assert.strictEqual(shouldRetry("unknown_cat", 0), false, "unknown category should not retry");

const d0 = backoffMs(0, { jitter: false });
const d2 = backoffMs(2, { jitter: false });
assert.strictEqual(d0, 500, "base delay");
assert.strictEqual(d2, 2000, "exponential");
assert.ok(backoffMs(10, { jitter: false }) <= 8000, "cap respected");

assert.strictEqual(nextDelay("auth_error", 0), null, "no delay for fatal");
assert.ok(nextDelay("timeout", 0) > 0, "delay for retryable");

console.log("test/retry-policy.test.js: all assertions passed");
