import { test } from "node:test";
import assert from "node:assert/strict";
import { withRetries } from "../lib/retries.js";

test("retries succeeds on first try when fn returns ok", async () => {
  let attempts = 0;
  const out = await withRetries(async () => { attempts++; return { status: 200 }; });
  assert.equal(attempts, 1);
  assert.equal(out.status, 200);
});

test("retries on retryable status until success", async () => {
  let attempts = 0;
  const out = await withRetries(async () => {
    attempts++;
    return { status: attempts < 3 ? 503 : 200 };
  }, { base: 5 });
  assert.equal(out.status, 200);
  assert.equal(attempts, 3);
});

test("retries returns final retryable status after max", async () => {
  let attempts = 0;
  const out = await withRetries(async () => { attempts++; return { status: 429 }; }, { max: 2, base: 5 });
  assert.equal(out.status, 429);
  assert.equal(attempts, 3);
});

test("retries throws after max on persistent error", async () => {
  let attempts = 0;
  await assert.rejects(
    () => withRetries(async () => { attempts++; throw new Error("boom"); }, { max: 2, base: 5 }),
    /boom/,
  );
  assert.equal(attempts, 3);
});
