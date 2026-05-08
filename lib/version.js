// Resolve smolbench version from package.json without bundlers.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(here, "..", "package.json");

let cached = null;
export function version() {
  if (cached) return cached;
  try {
    cached = JSON.parse(readFileSync(pkgPath, "utf8")).version || "0.0.0";
  } catch {
    cached = "0.0.0";
  }
  return cached;
}
