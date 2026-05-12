import { test } from "node:test";
import assert from "node:assert/strict";
import { ensembleJudge } from "../lib/judge-ensemble.js";

function fakeJudge(score, id = "f") {
  return { id, model: "m", call: async () => ({ text: `{"score": ${score * 10}, "rationale": "ok"}` }) };
}

test("ensembleJudge averages scores from multiple judges", async () => {
  const out = await ensembleJudge({
    judgeProviders: [fakeJudge(0.8, "a"), fakeJudge(0.6, "b"), fakeJudge(1.0, "c")],
    prompt: { id: "x", user: "anything" },
    candidate: "answer",
  });
  assert.equal(out.votes.length, 3);
  assert.ok(Math.abs(out.score - 0.8) < 0.001);
});

test("ensembleJudge ignores throwing judges in the average", async () => {
  const broken = { id: "broken", model: "m", call: async () => { throw new Error("nope"); } };
  const out = await ensembleJudge({
    judgeProviders: [fakeJudge(0.9, "ok"), broken],
    prompt: { id: "x", user: "anything" },
    candidate: "answer",
  });
  assert.ok(Math.abs(out.score - 0.9) < 0.001);
  assert.equal(out.votes.find((v) => v.provider === "broken").error, "nope");
});

test("ensembleJudge returns score 0 when all judges fail", async () => {
  const broken = { id: "x", model: "m", call: async () => { throw new Error("nope"); } };
  const out = await ensembleJudge({
    judgeProviders: [broken, broken],
    prompt: { id: "x", user: "anything" },
    candidate: "answer",
  });
  assert.equal(out.score, 0);
});
