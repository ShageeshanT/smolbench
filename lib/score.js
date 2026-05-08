// Composite score per result row. Lower total = better.
// Defaults: 40% quality (inverted, since we want high quality => low score),
//           30% cost, 30% latency.
// Override via { weights: { q, c, l } } in opts.

import { costFor } from "./cost.js";

const DEFAULT_WEIGHTS = { q: 0.4, c: 0.3, l: 0.3 };

/**
 * @typedef {Object} ScoreParts
 * @property {number} qPart
 * @property {number} cPart
 * @property {number} lPart
 */

/**
 * @param {Object} row - result row from the runner (and optionally judge)
 * @returns {{ total: number, parts: ScoreParts, cost: number|null }}
 */
export function scoreRow(row, opts = {}) {
  const w = { ...DEFAULT_WEIGHTS, ...(opts.weights || {}) };
  const cost = row.cost ?? costFor(row.model, row.promptTokens, row.completionTokens);
  const quality = typeof row.quality === "number" ? Math.max(0, Math.min(1, row.quality)) : 0;
  const latencySec = (Number(row.latencyMs) || 0) / 1000;
  const qPart = (1 - quality) * w.q;
  const cPart = (cost || 0) * w.c;
  const lPart = latencySec * w.l;
  return { total: qPart + cPart + lPart, parts: { qPart, cPart, lPart }, cost };
}

/** Sort rows ascending by composite score. Mutates a shallow copy. */
export function rankRows(rows, opts = {}) {
  return rows
    .map((r) => {
      const s = scoreRow(r, opts);
      return { ...r, _score: s, cost: r.cost ?? s.cost };
    })
    .sort((a, b) => a._score.total - b._score.total);
}
