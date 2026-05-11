import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("trends.series and regressionSummary basics", async () => {
  const dir = mkdtempSync(join(tmpdir(), "smolt-"));
  process.env.SMOLBENCH_DB = join(dir, "runs.jsonl");
  writeFileSync(process.env.SMOLBENCH_DB, "");
  const { record } = await import("../lib/runs-db.js?t=" + Date.now());
  record({ suite: "s", at: "2026-05-01T00:00:00Z", rows: [{ provider: "p", model: "m", promptId: "x", latencyMs: 100, cost: 0.0001, quality: 0.9 }] });
  record({ suite: "s", at: "2026-05-02T00:00:00Z", rows: [{ provider: "p", model: "m", promptId: "x", latencyMs: 800, cost: 0.0001, quality: 0.7 }] });
  const { series, regressionSummary } = await import("../lib/trends.js?t=" + Date.now());
  const ser = series({ suite: "s" });
  assert.equal(ser.length, 1);
  assert.equal(ser[0].points.length, 2);
  const flagged = regressionSummary({ suite: "s" });
  assert.equal(flagged.length, 1);
  assert.ok(flagged[0].dL > 500);
});
