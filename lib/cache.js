// SHA keyed result cache for (model, prompt) pairs. Stored under
// ~/.smolbench/cache/<aa>/<full-sha>.json by default. Skips network when
// the same prompt is run on the same model again, useful for iterating on
// scoring code without burning provider quota.
//
// Override location with SMOLBENCH_CACHE_DIR.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const CACHE_DIR = process.env.SMOLBENCH_CACHE_DIR || join(homedir(), ".smolbench", "cache");

function key(model, prompt) {
  const h = createHash("sha256");
  h.update(String(model));
  h.update("\0");
  h.update(prompt.system || "");
  h.update("\0");
  h.update(prompt.user || "");
  return h.digest("hex");
}

function pathFor(k) {
  return join(CACHE_DIR, k.slice(0, 2), `${k}.json`);
}

/** Read cached result. Returns null on miss or parse error. */
export function get(model, prompt) {
  const p = pathFor(key(model, prompt));
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Persist a result under the (model, prompt) key. */
export function put(model, prompt, result) {
  const k = key(model, prompt);
  const dir = join(CACHE_DIR, k.slice(0, 2));
  mkdirSync(dir, { recursive: true });
  writeFileSync(pathFor(k), JSON.stringify({ ...result, cachedAt: Date.now() }));
}

/** Remove the cache directory entirely. Used by `smolbench cache clear`. */
export function clearAll() {
  if (existsSync(CACHE_DIR)) rmSync(CACHE_DIR, { recursive: true, force: true });
}

export function cacheDir() {
  return CACHE_DIR;
}
