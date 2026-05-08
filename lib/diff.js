// Run-over-run diff. Compute Δ latency, Δ cost, Δ quality per (provider,model,promptId).
// Used by the cli compare command and by future trend dashboards.

/**
 * @param {{rows: Array}} runA
 * @param {{rows: Array}} runB
 * @returns {Array<{key:string, provider:string, model:string, promptId:string, dLatencyMs:number, dCost:number, dQuality:number}>}
 */
export function diff(runA, runB) {
  const idx = new Map();
  for (const r of runA.rows || []) idx.set(`${r.provider}:${r.model}:${r.promptId}`, r);
  const out = [];
  for (const r of runB.rows || []) {
    const k = `${r.provider}:${r.model}:${r.promptId}`;
    const a = idx.get(k);
    if (!a) continue;
    out.push({
      key: k,
      provider: r.provider,
      model: r.model,
      promptId: r.promptId,
      dLatencyMs: (r.latencyMs || 0) - (a.latencyMs || 0),
      dCost: (r.cost || 0) - (a.cost || 0),
      dQuality: (r.quality || 0) - (a.quality || 0),
    });
  }
  return out;
}

/** Filter rows where any delta exceeds the given thresholds. */
export function regressions(diffRows, { latencyMs = 500, cost = 0.001, quality = -0.1 } = {}) {
  return diffRows.filter((d) => d.dLatencyMs > latencyMs || d.dCost > cost || d.dQuality < quality);
}
