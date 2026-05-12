// Custom rubric loader. Reads .smolbench/rubrics/<task>.txt and merges with
// the built-in rubrics. Project-local rubrics override built-ins of the same
// name.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { rubricFor as builtinRubricFor, TASKS as BUILTIN_TASKS } from "./judge-rubrics.js";

const DIR = process.env.SMOLBENCH_RUBRICS_DIR || join(process.cwd(), ".smolbench", "rubrics");

let cache = null;

export function rubricFor(task) {
  if (!cache) cache = loadCustom();
  if (cache[task]) return cache[task];
  return builtinRubricFor(task);
}

export function listTasks() {
  if (!cache) cache = loadCustom();
  return [...new Set([...BUILTIN_TASKS, ...Object.keys(cache)])].sort();
}

function loadCustom() {
  if (!existsSync(DIR)) return {};
  const out = {};
  for (const f of readdirSync(DIR)) {
    if (!f.endsWith(".txt")) continue;
    const task = f.slice(0, -4);
    out[task] = readFileSync(join(DIR, f), "utf8");
  }
  return out;
}
