// Compose suites by reference. A suite can include other suite YAMLs.
// Loops are detected. Prompt id collisions are namespaced by suite name.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseYaml } from "./yaml.js";

export function loadSuite(path, opts = {}) {
  const visited = opts._visited || new Set();
  const abs = resolve(path);
  if (visited.has(abs)) throw new Error(`include loop at ${abs}`);
  visited.add(abs);
  const raw = parseYaml(readFileSync(abs, "utf8")) || {};
  const out = {
    suite: raw.suite || "(unnamed)",
    task: raw.task || null,
    prompts: [],
  };
  for (const inc of raw.includes || []) {
    const incPath = resolve(dirname(abs), inc);
    const sub = loadSuite(incPath, { _visited: visited });
    for (const p of sub.prompts) {
      out.prompts.push({ ...p, id: `${sub.suite}::${p.id}` });
    }
  }
  for (const p of raw.prompts || []) out.prompts.push(p);
  // Detect duplicate prompt ids after composition.
  const seen = new Set();
  for (const p of out.prompts) {
    if (seen.has(p.id)) throw new Error(`duplicate prompt id after compose: ${p.id}`);
    seen.add(p.id);
  }
  return out;
}
