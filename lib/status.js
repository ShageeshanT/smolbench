// Print registered provider summary plus cache stats.
import { list as listProviders } from "./registry.js";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { cacheDir } from "./cache.js";

export function status() {
  const lines = [];
  const provs = listProviders();
  lines.push(`Providers registered: ${provs.length}`);
  for (const p of provs) lines.push(`  - ${p.id} -> ${p.model}`);
  const dir = cacheDir();
  if (!existsSync(dir)) {
    lines.push(`Cache: empty (would live at ${dir})`);
  } else {
    let count = 0, bytes = 0;
    function walk(d) {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.isFile() && e.name.endsWith(".json")) { count++; bytes += statSync(p).size; }
      }
    }
    walk(dir);
    lines.push(`Cache: ${count} entries, ${(bytes / 1024).toFixed(1)} KB at ${dir}`);
  }
  return lines.join("\n");
}
