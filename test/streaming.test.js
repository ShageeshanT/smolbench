import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSse } from "../lib/streaming.js";

function streamFromStrings(parts) {
  return new ReadableStream({
    start(c) {
      const enc = new TextEncoder();
      for (const p of parts) c.enqueue(enc.encode(p));
      c.close();
    },
  });
}

test("parseSse yields content deltas in order", async () => {
  const stream = streamFromStrings([
    'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
    'data: {"choices":[{"delta":{"content":" world"}}]}\n',
    "data: [DONE]\n",
  ]);
  let acc = "";
  for await (const d of parseSse(stream)) acc += d;
  assert.equal(acc, "Hello world");
});

test("parseSse skips malformed lines", async () => {
  const stream = streamFromStrings([
    'data: not-json\n',
    'data: {"choices":[{"delta":{"content":"ok"}}]}\n',
    "data: [DONE]\n",
  ]);
  let acc = "";
  for await (const d of parseSse(stream)) acc += d;
  assert.equal(acc, "ok");
});
