const assert = require("assert");
const { rankRows, scoreAll, scoreRow } = require("../lib/score");

const weighted = scoreRow({ provider: "openai", quality: 0.8, latencyMs: 500, promptTokens: 1000, completionTokens: 500 });
assert.ok(weighted.total > 0);
assert.ok(weighted.qualityPenalty > 0);
assert.ok(weighted.latencyPenalty > 0);
assert.equal(typeof weighted.cost, "number");

const ranked = rankRows([
  { provider: "openai", quality: 0.1, latencyMs: 1000 },
  { provider: "openai", quality: 0.9, latencyMs: 100 },
]);
assert.equal(ranked[0].quality, 0.9);
assert.ok(ranked[0]._score.total < ranked[1]._score.total);

const cheap = scoreRow({ provider: "unknown", quality: 0.8, latencyMs: 0, costUsd: 0.001 });
const expensive = scoreRow({ provider: "unknown", quality: 0.8, latencyMs: 0, costUsd: 0.1 });
assert.ok(cheap.total < expensive.total);

const promptScores = scoreAll({ p1: [0.7, 0.8, 0.9], empty: [] });
assert.equal(promptScores.length, 1);
assert.equal(promptScores[0].prompt_id, "p1");

console.log("score tests ok");
