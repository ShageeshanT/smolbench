// Fan a prompt across registered providers.
// Adds two opts:
//   parallel: true => run all providers concurrently per prompt (default false)
//   cache:    true => check lib/cache before calling, persist on hit-miss (default false)
//
// Errors are returned as result rows with .error set, never thrown.

import { list } from "./registry.js";
import * as cache from "./cache.js";

async function callOne(prompt, p, useCache) {
  const start = Date.now();
  if (useCache) {
    const hit = cache.get(p.model, prompt);
    if (hit) return { promptId: prompt.id, provider: p.id, model: p.model, ...hit, fromCache: true };
  }
  try {
    const out = await p.call(prompt);
    const row = {
      promptId: prompt.id, provider: p.id, model: p.model, ...out,
      latencyMs: out.latencyMs ?? (Date.now() - start),
    };
    if (useCache && !out.error) cache.put(p.model, prompt, out);
    return row;
  } catch (e) {
    return {
      promptId: prompt.id, provider: p.id, model: p.model,
      error: String(e?.message || e), latencyMs: Date.now() - start,
    };
  }
}

export async function runPrompt(prompt, opts = {}) {
  const targets = opts.providers || list();
  const useCache = !!opts.cache;
  if (opts.parallel) {
    return Promise.all(targets.map((p) => callOne(prompt, p, useCache)));
  }
  const rows = [];
  for (const p of targets) rows.push(await callOne(prompt, p, useCache));
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
