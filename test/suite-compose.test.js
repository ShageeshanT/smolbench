import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadSuite } from "../lib/suite-compose.js";

test("loadSuite composes included suites with namespaced ids", () => {
  const dir = mkdtempSync(join(tmpdir(), "smolc-"));
  writeFileSync(join(dir, "child.yaml"), "suite: child\nprompts:\n  - id: a\n    user: hi\n");
  writeFileSync(join(dir, "parent.yaml"), "suite: parent\nincludes:\n  - child.yaml\nprompts:\n  - id: b\n    user: ho\n");
  const out = loadSuite(join(dir, "parent.yaml"));
  assert.equal(out.suite, "parent");
  const ids = out.prompts.map((p) => p.id).sort();
  assert.deepEqual(ids, ["b", "child::a"]);
});

test("loadSuite detects include loops", () => {
  const dir = mkdtempSync(join(tmpdir(), "smolc-"));
  writeFileSync(join(dir, "a.yaml"), "suite: a\nincludes:\n  - b.yaml\n");
  writeFileSync(join(dir, "b.yaml"), "suite: b\nincludes:\n  - a.yaml\n");
  assert.throws(() => loadSuite(join(dir, "a.yaml")), /include loop/);
});
