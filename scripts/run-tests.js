#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");

const tests = readdirSync(join(process.cwd(), "test"))
  .filter((name) => name.endsWith(".test.js"))
  .sort();

for (const test of tests) {
  const file = join("test", test);
  const result = spawnSync(process.execPath, [file], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
console.log(`all ${tests.length} test files passed`);
