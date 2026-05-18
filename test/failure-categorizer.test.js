// test/failure-categorizer.test.js
const assert = require("assert");
const { categorize, categorizeSchema, CATEGORIES } = require("../lib/failure-categorizer");

let r = categorize(new Error("Request timeout after 30s"));
assert.strictEqual(r.category, "timeout", "timeout msg should map to timeout");
assert.strictEqual(r.retryable, true, "timeout should be retryable");

r = categorize(new Error("HTTP 429 Too Many Requests"));
assert.strictEqual(r.category, "rate_limit", "429 should map to rate_limit");

r = categorize(new Error("ECONNRESET on socket"));
assert.strictEqual(r.category, "network_error", "ECONNRESET should map to network_error");

r = categorize(new Error("401 Unauthorized"));
assert.strictEqual(r.category, "auth_error");
assert.strictEqual(r.retryable, false, "auth_error must not be retryable");

r = categorize(null, "");
assert.strictEqual(r.category, "empty_output");

r = categorize(null, "I cannot help with that request.");
assert.strictEqual(r.category, "refusal");

r = categorize(null, "The answer is 42.");
assert.strictEqual(r.category, "unknown");

const schema = categorizeSchema({ valid: false, errors: ["x"] });
assert.strictEqual(schema.category, "schema_mismatch");

assert.ok(CATEGORIES.timeout && CATEGORIES.refusal, "category map exposed");

console.log("test/failure-categorizer.test.js: all assertions passed");
