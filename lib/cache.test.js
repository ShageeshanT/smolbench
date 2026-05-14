const { cacheGet, cacheSet, cacheDel, cacheEvict, cacheStats, cacheClear } = require("./cache");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(process.env.HOME, ".smolbench", "cache");

function clearCache() {
  if (fs.existsSync(CACHE_DIR)) {
    fs.readdirSync(CACHE_DIR).filter(f => f !== "manifest.json").forEach(f => {
      try { fs.unlinkSync(path.join(CACHE_DIR, f)); } catch {}
    });
    try { fs.unlinkSync(path.join(CACHE_DIR, "manifest.json")); } catch {}
  }
}

describe("cache", () => {
  beforeEach(clearCache);
  afterEach(clearCache);
  it("returns null on miss", () => { expect(cacheGet("nonexistent")).toBeNull(); });
  it("stores and retrieves", () => { cacheSet("k", { v: 42 }); expect(cacheGet("k")).toEqual({ v: 42 }); });
  it("expires after TTL", () => { cacheSet("ttl-key", { x: 1 }); expect(cacheGet("ttl-key", 0)).toBeNull(); });
  it("cacheDel removes", () => { cacheSet("del", { y: 2 }); cacheDel("del"); expect(cacheGet("del")).toBeNull(); });
  it("cacheEvict removes expired", () => { cacheSet("ev", { z: 3 }); cacheEvict(0); expect(cacheGet("ev")).toBeNull(); });
  it("cacheEvict keeps valid", () => { cacheSet("keep", { w: 4 }); expect(cacheEvict(999999999)).toBe(0); expect(cacheGet("keep")).toEqual({ w: 4 }); });
  it("cacheStats counts", () => { cacheSet("s", { q: 5 }); expect(cacheStats().total).toBeGreaterThanOrEqual(1); });
  it("cacheClear wipes all", () => { cacheSet("c1", { a: 1 }); cacheSet("c2", { b: 2 }); const n = cacheClear(); expect(n).toBeGreaterThanOrEqual(2); expect(cacheStats().total).toBe(0); });
});
