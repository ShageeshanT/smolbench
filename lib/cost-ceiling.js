// Cost ceiling guard. Aborts a run if cumulative cost exceeds the ceiling.
import { costFor } from "./cost.js";

export function makeCostGuard(ceilingUsd) {
  let cumulative = 0;
  return {
    accumulate(row) {
      const c = row.cost ?? costFor(row.model, row.promptTokens, row.completionTokens) ?? 0;
      cumulative += c;
      return { cumulative, exceeded: ceilingUsd != null && cumulative > ceilingUsd };
    },
    spent() { return cumulative; },
  };
}
