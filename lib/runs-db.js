// JSONL-backed run history for trend analysis. One line per run.
// Stored under .smolbench/runs.jsonl by default.

import { appendFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const DB_PATH = process.env.SMOLBENCH_DB || join(process.cwd(), ".smolbench", "runs.jsonl");

export function record(run) {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const summary = {
    suite: run.suite,
    at: run.at || new Date().toISOString(),
    rows: (run.rows || []).map((r) => ({
      provider: r.provider, model: r.model, promptId: r.promptId,
      latencyMs: r.latencyMs, cost: r.cost, quality: r.quality,
    })),
  };
  appendFileSync(DB_PATH, JSON.stringify(summary) + "\n");
  return DB_PATH;
}

export function readAll() {
  if (!existsSync(DB_PATH)) return [];
  return readFileSync(DB_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

export function dbPath() { return DB_PATH; }
