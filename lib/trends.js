// Trend analysis across run history. Returns per-(provider,model) series.
import { readAll } from "./runs-db.js";

export function series(filter = {}) {
  const runs = readAll();
  const out = new Map();
  for (const run of runs) {
    if (filter.suite && run.suite !== filter.suite) continue;
    const at = run.at;
    for (const r of run.rows || []) {
      if (filter.provider && r.provider !== filter.provider) continue;
      const key = `${r.provider}:${r.model}`;
      if (!out.has(key)) out.set(key, { provider: r.provider, model: r.model, points: [] });
      out.get(key).points.push({
        at,
        latencyMs: r.latencyMs ?? null,
        cost: r.cost ?? null,
        quality: r.quality ?? null,
      });
    }
  }
  return [...out.values()];
}

export function regressionSummary(filter = {}, thresholds = { latencyMs: 500, cost: 0.001, quality: -0.1 }) {
  const ser = series(filter);
  const flagged = [];
  for (const s of ser) {
    if (s.points.length < 2) continue;
    const sorted = [...s.points].sort((a, b) => String(a.at).localeCompare(String(b.at)));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const dL = (last.latencyMs || 0) - (first.latencyMs || 0);
    const dC = (last.cost || 0) - (first.cost || 0);
    const dQ = (last.quality || 0) - (first.quality || 0);
    if (dL > thresholds.latencyMs || dC > thresholds.cost || dQ < thresholds.quality) {
      flagged.push({ provider: s.provider, model: s.model, dL, dC, dQ });
    }
  }
  return flagged;
}
