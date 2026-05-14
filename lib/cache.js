/**
 * Content-addressed cache with TTL.
 * Stores results at ~/.smolbench/cache/<hash>.json with a manifest.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CACHE_DIR = path.join(process.env.HOME, ".smolbench", "cache");
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000;

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}
function hashKey(k) { return crypto.createHash("sha256").update(k).digest("hex").slice(0, 16); }
function cachePath(h) { return path.join(CACHE_DIR, h + ".json"); }
function manifestPath() { return path.join(CACHE_DIR, "manifest.json"); }
function readManifest() { const p = manifestPath(); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {}; }
function writeManifest(m) { ensureCacheDir(); fs.writeFileSync(manifestPath(), JSON.stringify(m, null, 2)); }

function cacheGet(key, ttlMs = DEFAULT_TTL_MS) {
  ensureCacheDir();
  const h = hashKey(key);
  const p = cachePath(h);
  if (!fs.existsSync(p)) return null;
  let entry;
  try { entry = JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
  if (Date.now() - entry.ts > ttlMs) { try { fs.unlinkSync(p); } catch {} return null; }
  return entry.value;
}

function cacheSet(key, value) {
  ensureCacheDir();
  const h = hashKey(key);
  const p = cachePath(h);
  const entry = { ts: Date.now(), value };
  fs.writeFileSync(p, JSON.stringify(entry));
  const m = readManifest();
  m[key] = { hash: h, ts: entry.ts };
  writeManifest(m);
}

function cacheDel(key) {
  const h = hashKey(key);
  const p = cachePath(h);
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
  const m = readManifest();
  delete m[key];
  writeManifest(m);
}

function cacheEvict(ttlMs = DEFAULT_TTL_MS) {
  ensureCacheDir();
  const m = readManifest();
  const now = Date.now();
  let evicted = 0;
  for (const [key, info] of Object.entries(m)) {
    if (now - info.ts > ttlMs) {
      try { const p = cachePath(info.hash); if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
      delete m[key];
      evicted++;
    }
  }
  writeManifest(m);
  return evicted;
}

function cacheStats() {
  ensureCacheDir();
  const m = readManifest();
  const now = Date.now();
  const active = Object.values(m).filter(i => now - i.ts <= DEFAULT_TTL_MS).length;
  return { total: Object.keys(m).length, expired: Object.keys(m).length - active, active };
}

function cacheClear() {
  ensureCacheDir();
  const files = fs.readdirSync(CACHE_DIR).filter(f => f !== "manifest.json");
  files.forEach(f => { try { fs.unlinkSync(path.join(CACHE_DIR, f)); } catch {} });
  writeManifest({});
  return files.length;
}

module.exports = { cacheGet, cacheSet, cacheDel, cacheEvict, cacheStats, cacheClear };
