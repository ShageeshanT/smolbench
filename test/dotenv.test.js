import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadDotenv } from "../lib/dotenv.js";

test("loadDotenv reads KEY=VALUE pairs", () => {
  const dir = mkdtempSync(join(tmpdir(), "smol-env-"));
  const path = join(dir, ".env");
  writeFileSync(path, "FOO=bar\n# comment\nBAZ=\"quoted value\"\n\nQUX='another'\n");
  delete process.env.FOO; delete process.env.BAZ; delete process.env.QUX;
  const n = loadDotenv(path);
  assert.equal(n, 3);
  assert.equal(process.env.FOO, "bar");
  assert.equal(process.env.BAZ, "quoted value");
  assert.equal(process.env.QUX, "another");
});

test("loadDotenv does not overwrite existing env", () => {
  const dir = mkdtempSync(join(tmpdir(), "smol-env-"));
  const path = join(dir, ".env");
  writeFileSync(path, "PRESET=fromfile\n");
  process.env.PRESET = "preset";
  const n = loadDotenv(path);
  assert.equal(n, 0);
  assert.equal(process.env.PRESET, "preset");
});

test("loadDotenv returns 0 when file missing", () => {
  assert.equal(loadDotenv("/nonexistent/path/.env"), 0);
});
