// Tiny .env loader. Stdlib only, no quote magic, no variable interpolation.
// Lines starting with # are comments. Empty lines ignored. KEY=VALUE only.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadDotenv(path = join(process.cwd(), ".env")) {
  if (!existsSync(path)) return 0;
  const text = readFileSync(path, "utf8");
  let count = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
      count++;
    }
  }
  return count;
}
