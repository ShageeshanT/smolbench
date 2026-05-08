// Fan a prompt across every registered provider. Returns one result row per provider.
// Sequential by default to avoid rate-limit headaches; parallel mode is a phase 2 task.

import { list } from "./registry.js";

export async function runPrompt(prompt, { providers } = {}) {
  const targets = providers || list();
  const rows = [];
  for (const p of targets) {
    const start = Date.now();
    try {
      const out = await p.call(prompt);
      rows.push({
        promptId: prompt.id,
        provider: p.id,
        model: p.model,
        ...out,
        latencyMs: out.latencyMs ?? (Date.now() - start),
      });
    } catch (e) {
      rows.push({
        promptId: prompt.id,
        provider: p.id,
        model: p.model,
        error: String(e?.message || e),
        latencyMs: Date.now() - start,
      });
    }
  }
  return rows;
}

export async function runSuite(prompts, opts = {}) {
  const all = [];
  for (const prompt of prompts) {
    const rows = await runPrompt(prompt, opts);
    all.push(...rows);
  }
  return all;
}
