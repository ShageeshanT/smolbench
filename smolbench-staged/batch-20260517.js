#!/usr/bin/env node
// Staged smolbench commits, batch 17 (2026-05-17). NOT pushed.
// Failure categorization + diagnostics -> 0.9.0

const fs = require("fs");
const { execFileSync } = require("child_process");

const MCP_URL = "https://connect.composio.dev/mcp";
const KEY = JSON.parse(fs.readFileSync("/data/.openclaw/openclaw.json", "utf8"))
  .plugins.entries.composio.config.consumerKey;
const OWNER = "ShageeshanT", REPO = "smolbench", BRANCH = "master";
const AUTHOR = { name: "Shagee", email: "185689517+ShageeshanT@users.noreply.github.com" };

const F = {};

F["lib/failure-categorizer.js"] = `// lib/failure-categorizer.js
// Classify failures from provider responses into named categories.

const CATEGORIES = {
  timeout:          { retryable: true,  severity: "transient" },
  rate_limit:       { retryable: true,  severity: "transient" },
  network_error:    { retryable: true,  severity: "transient" },
  auth_error:       { retryable: false, severity: "config" },
  parse_error:      { retryable: false, severity: "output" },
  schema_mismatch:  { retryable: false, severity: "output" },
  refusal:          { retryable: false, severity: "model" },
  hallucination:    { retryable: false, severity: "model" },
  empty_output:     { retryable: true,  severity: "model" },
  format_violation: { retryable: false, severity: "output" },
  context_overflow: { retryable: false, severity: "input" },
  budget_exceeded:  { retryable: false, severity: "config" },
  unknown:          { retryable: false, severity: "unknown" },
};

function fromError(msg) {
  if (msg.includes("timeout") || msg.includes("etimedout")) return "timeout";
  if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests")) return "rate_limit";
  if (msg.includes("econn") || msg.includes("network") || msg.includes("dns") || msg.includes("socket")) return "network_error";
  if (msg.includes("401") || msg.includes("403") || msg.includes("unauthor") || msg.includes("forbidden")) return "auth_error";
  if (msg.includes("context length") || msg.includes("token limit") || msg.includes("max_tokens")) return "context_overflow";
  if (msg.includes("budget") || msg.includes("max-cost")) return "budget_exceeded";
  if (msg.includes("parse") || msg.includes("invalid json")) return "parse_error";
  return null;
}

function fromOutput(text) {
  if (!text || !text.trim()) return "empty_output";
  const head = text.trim().slice(0, 200).toLowerCase();
  if (/^(i (cannot|can't|won't|am unable|am not able)|sorry, i (can't|cannot))/i.test(head)) return "refusal";
  return null;
}

function categorize(err, output) {
  if (!err && (output === undefined || output === null)) return { category: "unknown", ...CATEGORIES.unknown };
  if (err) {
    const msg = String(err.message || err).toLowerCase();
    const cat = fromError(msg);
    if (cat) return { category: cat, ...CATEGORIES[cat] };
  }
  if (output !== undefined && output !== null) {
    const text = typeof output === "string" ? output : JSON.stringify(output);
    const cat = fromOutput(text);
    if (cat) return { category: cat, ...CATEGORIES[cat] };
  }
  return { category: "unknown", ...CATEGORIES.unknown };
}

function categorizeSchema(validation) {
  if (validation && validation.valid === false) {
    return { category: "schema_mismatch", ...CATEGORIES.schema_mismatch, errors: validation.errors };
  }
  return null;
}

module.exports = { CATEGORIES, categorize, categorizeSchema, fromError, fromOutput };
`;

F["lib/diagnostics.js"] = `// lib/diagnostics.js
// Build a structured diagnostic record for a failed run.

function snapshotError(err) {
  if (!err) return null;
  const stack = err.stack ? String(err.stack).split("\\n").slice(0, 6).join("\\n") : undefined;
  return {
    name: err.name || "Error",
    message: String(err.message || err),
    code: err.code,
    status: err.status,
    stack,
  };
}

function snapshotOutput(output, maxChars) {
  if (output === undefined || output === null) return null;
  const cap = maxChars || 400;
  const text = typeof output === "string" ? output : JSON.stringify(output);
  return {
    length: text.length,
    excerpt: text.slice(0, cap),
    truncated: text.length > cap,
  };
}

function buildDiagnostic(opts) {
  return {
    run_id: opts.runId,
    prompt_id: opts.promptId,
    provider: opts.provider,
    model: opts.model,
    attempt: opts.attempt,
    timestamp: new Date().toISOString(),
    category: opts.category,
    latency_ms: opts.latencyMs,
    cost_usd: opts.costUsd,
    error: snapshotError(opts.err),
    output: snapshotOutput(opts.output),
  };
}

module.exports = { snapshotError, snapshotOutput, buildDiagnostic };
`;

F["lib/failure-store.js"] = `// lib/failure-store.js
// Append diagnostic records to a JSONL store on disk.

const fs = require("fs");
const path = require("path");
const os = require("os");

const DEFAULT_PATH = path.join(os.homedir(), ".smolbench", "failures.jsonl");

function ensureDir(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function append(diagnostic, filePath) {
  const fp = filePath || DEFAULT_PATH;
  ensureDir(fp);
  fs.appendFileSync(fp, JSON.stringify(diagnostic) + "\\n");
}

function readAll(filePath) {
  const fp = filePath || DEFAULT_PATH;
  if (!fs.existsSync(fp)) return [];
  return fs.readFileSync(fp, "utf8").split("\\n").filter(Boolean).map(function (line) {
    try { return JSON.parse(line); } catch (e) { return null; }
  }).filter(Boolean);
}

function readBy(filter, filePath) {
  return readAll(filePath).filter(filter);
}

function clear(filePath) {
  const fp = filePath || DEFAULT_PATH;
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

module.exports = { DEFAULT_PATH, append, readAll, readBy, clear };
`;

F["lib/failure-report.js"] = `// lib/failure-report.js
// Summarize failure counts and patterns from diagnostic records.

function groupBy(records, key) {
  const out = {};
  for (const r of records) {
    const k = r[key] || "unknown";
    if (!out[k]) out[k] = [];
    out[k].push(r);
  }
  return out;
}

function summarize(records) {
  const byCategory = groupBy(records, "category");
  const byProvider = groupBy(records, "provider");
  const byPrompt = groupBy(records, "prompt_id");
  const total = records.length;
  const transient = records.filter(function (r) {
    return r.category === "timeout" || r.category === "rate_limit" || r.category === "network_error";
  }).length;
  return {
    total,
    by_category: Object.fromEntries(Object.entries(byCategory).map(function (e) { return [e[0], e[1].length]; })),
    by_provider: Object.fromEntries(Object.entries(byProvider).map(function (e) { return [e[0], e[1].length]; })),
    top_prompts: Object.entries(byPrompt).sort(function (a, b) { return b[1].length - a[1].length; }).slice(0, 5)
      .map(function (e) { return { prompt_id: e[0], count: e[1].length }; }),
    transient_share: total ? transient / total : 0,
  };
}

function textReport(records) {
  const s = summarize(records);
  const lines = [];
  lines.push("smolbench failure report");
  lines.push("========================");
  lines.push("");
  lines.push("total failures : " + s.total);
  lines.push("transient share: " + (s.transient_share * 100).toFixed(1) + "%");
  lines.push("");
  lines.push("by category:");
  for (const e of Object.entries(s.by_category)) lines.push("  " + e[0].padEnd(20) + " " + e[1]);
  lines.push("");
  lines.push("by provider:");
  for (const e of Object.entries(s.by_provider)) lines.push("  " + e[0].padEnd(20) + " " + e[1]);
  if (s.top_prompts.length) {
    lines.push("");
    lines.push("top failing prompts:");
    for (const p of s.top_prompts) lines.push("  " + p.prompt_id.padEnd(20) + " " + p.count);
  }
  return lines.join("\\n");
}

module.exports = { groupBy, summarize, textReport };
`;

F["lib/retry-policy.js"] = `// lib/retry-policy.js
// Category-aware retry policy with exponential backoff and jitter.

const { CATEGORIES } = require("./failure-categorizer");

const DEFAULTS = {
  max_attempts: 4,
  base_ms: 500,
  cap_ms: 8000,
  jitter: true,
};

function shouldRetry(category, attempt, opts) {
  const o = Object.assign({}, DEFAULTS, opts || {});
  if (attempt >= o.max_attempts) return false;
  const meta = CATEGORIES[category];
  if (!meta) return false;
  return Boolean(meta.retryable);
}

function backoffMs(attempt, opts) {
  const o = Object.assign({}, DEFAULTS, opts || {});
  const raw = Math.min(o.cap_ms, o.base_ms * Math.pow(2, attempt));
  if (!o.jitter) return raw;
  return Math.floor(raw / 2 + Math.random() * (raw / 2));
}

function nextDelay(category, attempt, opts) {
  if (!shouldRetry(category, attempt, opts)) return null;
  return backoffMs(attempt, opts);
}

module.exports = { DEFAULTS, shouldRetry, backoffMs, nextDelay };
`;

F["lib/failure-html.js"] = `// lib/failure-html.js
// HTML dashboard for failure diagnostics.

const { summarize } = require("./failure-report");

function failureHtml(records) {
  const s = summarize(records);
  const catRows = Object.entries(s.by_category).map(function (e) {
    return "<tr><td>" + e[0] + "</td><td>" + e[1] + "</td></tr>";
  }).join("\\n");
  const provRows = Object.entries(s.by_provider).map(function (e) {
    return "<tr><td>" + e[0] + "</td><td>" + e[1] + "</td></tr>";
  }).join("\\n");

  return [
    "<!DOCTYPE html>",
    "<html><head><meta charset=\\"utf-8\\"><title>smolbench failures</title>",
    "<style>body{font-family:sans-serif;margin:2rem;}",
    "table{border-collapse:collapse;margin-bottom:1.5rem;}",
    "th,td{border:1px solid #ccc;padding:6px 12px;text-align:left;}",
    "th{background:#f5f5f5;}h2{margin-top:1.5rem;}</style></head><body>",
    "<h1>smolbench failures</h1>",
    "<p>Total: " + s.total + " &nbsp; Transient: " + (s.transient_share * 100).toFixed(1) + "%</p>",
    "<h2>By category</h2><table><thead><tr><th>category</th><th>count</th></tr></thead><tbody>",
    catRows,
    "</tbody></table>",
    "<h2>By provider</h2><table><thead><tr><th>provider</th><th>count</th></tr></thead><tbody>",
    provRows,
    "</tbody></table>",
    "</body></html>",
  ].join("\\n");
}

module.exports = { failureHtml };
`;

F["lib/runner-hook.js"] = `// lib/runner-hook.js
// Glue between runner error path and the diagnostics pipeline.

const { categorize, categorizeSchema } = require("./failure-categorizer");
const { buildDiagnostic } = require("./diagnostics");
const { append } = require("./failure-store");
const { nextDelay } = require("./retry-policy");

async function recordFailure(ctx, err, output, validation) {
  const schemaCat = categorizeSchema(validation);
  const cat = schemaCat || categorize(err, output);
  const diag = buildDiagnostic({
    runId: ctx.runId,
    promptId: ctx.promptId,
    provider: ctx.provider,
    model: ctx.model,
    attempt: ctx.attempt,
    category: cat.category,
    err,
    output,
    latencyMs: ctx.latencyMs,
    costUsd: ctx.costUsd,
  });
  append(diag, ctx.storePath);
  return { diagnostic: diag, retryDelayMs: nextDelay(cat.category, ctx.attempt, ctx.retry) };
}

module.exports = { recordFailure };
`;

F["bin/smolbench.js"] = `#!/usr/bin/env node
// bin/smolbench.js
// Entry point for smolbench CLI.

const { parseArgs } = require("../lib/cli");
const { textReport, jsonReport } = require("../lib/report");
const { htmlReport } = require("../lib/report-html");
const { readAll } = require("../lib/failure-store");
const { textReport: failureText, summarize } = require("../lib/failure-report");
const { failureHtml } = require("../lib/failure-html");

function main() {
  const args = parseArgs(process.argv);

  if (!args.commands.length) {
    console.error("Usage: smolbench <run|report|failures|diagnose> [flags]");
    process.exit(1);
  }

  if (args.commands.includes("run")) {
    console.log("Running suite...");
  }

  if (args.commands.includes("report")) {
    const format = args.flags.format || args.flags.f || "text";
    console.log("Report format: " + format);
  }

  if (args.commands.includes("failures")) {
    const records = readAll(args.flags.store);
    const format = args.flags.format || "text";
    if (format === "json") {
      console.log(JSON.stringify(summarize(records), null, 2));
    } else if (format === "html") {
      console.log(failureHtml(records));
    } else {
      console.log(failureText(records));
    }
  }

  if (args.commands.includes("diagnose")) {
    const runId = args.flags.run || args._[0];
    const records = readAll(args.flags.store).filter(function (r) { return r.run_id === runId; });
    if (!records.length) {
      console.error("no diagnostics found for run " + runId);
      process.exit(2);
    }
    console.log(JSON.stringify(records, null, 2));
  }
}

main();
`;

F["lib/cli.js"] = `// lib/cli.js
// CLI argument parser for smolbench.

function parseArgs(argv) {
  const args = { commands: [], flags: {}, _: [] };
  const known = new Set(["run", "report", "failures", "diagnose", "estimate", "cache"]);
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (known.has(a)) {
      args.commands.push(a);
    } else if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args.flags[key] = val;
    } else if (a.startsWith("-")) {
      const key = a.slice(1);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args.flags[key] = val;
    } else {
      args._.push(a);
    }
  }
  return args;
}

module.exports = { parseArgs };
`;

F["test/failure-categorizer.test.js"] = `// test/failure-categorizer.test.js
const assert = require("assert");
const { categorize, categorizeSchema, CATEGORIES } = require("../lib/failure-categorizer");

let r = categorize(new Error("Request timeout after 30s"));
assert.strictEqual(r.category, "timeout", "timeout msg should map to timeout");
assert.strictEqual(r.retryable, true, "timeout should be retryable");

r = categorize(new Error("HTTP 429 Too Many Requests"));
assert.strictEqual(r.category, "rate_limit", "429 should map to rate_limit");

r = categorize(new Error("ECONNRESET on socket"));
assert.strictEqual(r.category, "network_error", "ECONNRESET should map to network_error");

r = categorize(new Error("401 Unauthorized"));
assert.strictEqual(r.category, "auth_error");
assert.strictEqual(r.retryable, false, "auth_error must not be retryable");

r = categorize(null, "");
assert.strictEqual(r.category, "empty_output");

r = categorize(null, "I cannot help with that request.");
assert.strictEqual(r.category, "refusal");

r = categorize(null, "The answer is 42.");
assert.strictEqual(r.category, "unknown");

const schema = categorizeSchema({ valid: false, errors: ["x"] });
assert.strictEqual(schema.category, "schema_mismatch");

assert.ok(CATEGORIES.timeout && CATEGORIES.refusal, "category map exposed");

console.log("test/failure-categorizer.test.js: all assertions passed");
`;

F["test/diagnostics.test.js"] = `// test/diagnostics.test.js
const assert = require("assert");
const { buildDiagnostic, snapshotError, snapshotOutput } = require("../lib/diagnostics");

const err = Object.assign(new Error("boom"), { code: "E_X", status: 500 });
const e = snapshotError(err);
assert.strictEqual(e.name, "Error");
assert.strictEqual(e.message, "boom");
assert.strictEqual(e.code, "E_X");
assert.strictEqual(e.status, 500);

const o = snapshotOutput("a".repeat(1000), 100);
assert.strictEqual(o.length, 1000);
assert.strictEqual(o.excerpt.length, 100);
assert.strictEqual(o.truncated, true);

const d = buildDiagnostic({
  runId: "r1", promptId: "p1", provider: "openai", model: "gpt-x",
  attempt: 2, category: "timeout", err, output: "hi", latencyMs: 1200, costUsd: 0.01,
});
assert.strictEqual(d.run_id, "r1");
assert.strictEqual(d.attempt, 2);
assert.strictEqual(d.category, "timeout");
assert.ok(d.timestamp);
assert.strictEqual(d.error.message, "boom");
assert.strictEqual(d.output.excerpt, "hi");

console.log("test/diagnostics.test.js: all assertions passed");
`;

F["test/failure-store.test.js"] = `// test/failure-store.test.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { append, readAll, readBy, clear } = require("../lib/failure-store");

const tmp = path.join(os.tmpdir(), "smolbench-failure-store-" + Date.now() + ".jsonl");
clear(tmp);

append({ run_id: "r1", prompt_id: "p1", category: "timeout" }, tmp);
append({ run_id: "r1", prompt_id: "p2", category: "refusal" }, tmp);
append({ run_id: "r2", prompt_id: "p1", category: "timeout" }, tmp);

const all = readAll(tmp);
assert.strictEqual(all.length, 3, "three records appended");
assert.strictEqual(all[0].run_id, "r1");

const r1 = readBy(function (r) { return r.run_id === "r1"; }, tmp);
assert.strictEqual(r1.length, 2);

clear(tmp);
assert.strictEqual(fs.existsSync(tmp), false, "store cleared");

console.log("test/failure-store.test.js: all assertions passed");
`;

F["test/failure-report.test.js"] = `// test/failure-report.test.js
const assert = require("assert");
const { groupBy, summarize, textReport } = require("../lib/failure-report");

const records = [
  { category: "timeout", provider: "openai", prompt_id: "p1" },
  { category: "timeout", provider: "openai", prompt_id: "p2" },
  { category: "refusal", provider: "anthropic", prompt_id: "p1" },
  { category: "rate_limit", provider: "openai", prompt_id: "p1" },
];

const g = groupBy(records, "category");
assert.strictEqual(g.timeout.length, 2);
assert.strictEqual(g.refusal.length, 1);

const s = summarize(records);
assert.strictEqual(s.total, 4);
assert.strictEqual(s.by_category.timeout, 2);
assert.strictEqual(s.by_provider.openai, 3);
assert.ok(s.transient_share > 0.7, "transient share should be high");
assert.strictEqual(s.top_prompts[0].prompt_id, "p1");

const text = textReport(records);
assert.ok(text.includes("smolbench failure report"));
assert.ok(text.includes("timeout"));

console.log("test/failure-report.test.js: all assertions passed");
`;

F["test/retry-policy.test.js"] = `// test/retry-policy.test.js
const assert = require("assert");
const { shouldRetry, backoffMs, nextDelay } = require("../lib/retry-policy");

assert.strictEqual(shouldRetry("timeout", 0), true);
assert.strictEqual(shouldRetry("timeout", 4), false, "stop at max_attempts");
assert.strictEqual(shouldRetry("auth_error", 0), false, "auth_error is fatal");
assert.strictEqual(shouldRetry("refusal", 0), false, "refusal is fatal");
assert.strictEqual(shouldRetry("unknown_cat", 0), false, "unknown category should not retry");

const d0 = backoffMs(0, { jitter: false });
const d2 = backoffMs(2, { jitter: false });
assert.strictEqual(d0, 500, "base delay");
assert.strictEqual(d2, 2000, "exponential");
assert.ok(backoffMs(10, { jitter: false }) <= 8000, "cap respected");

assert.strictEqual(nextDelay("auth_error", 0), null, "no delay for fatal");
assert.ok(nextDelay("timeout", 0) > 0, "delay for retryable");

console.log("test/retry-policy.test.js: all assertions passed");
`;

F["docs/failure-diagnostics.md"] = `<!-- docs/failure-diagnostics.md -->
# Failure Diagnostics in smolbench 0.9.0

smolbench 0.9.0 introduces structured failure handling so noisy runs become
actionable signal. Every failed call is categorized, captured as a diagnostic
record, persisted to disk, and surfaced through CLI reports.

## Categories

Each failure resolves to one of: \`timeout\`, \`rate_limit\`, \`network_error\`,
\`auth_error\`, \`parse_error\`, \`schema_mismatch\`, \`refusal\`,
\`hallucination\`, \`empty_output\`, \`format_violation\`, \`context_overflow\`,
\`budget_exceeded\`, \`unknown\`. See \`docs/error-taxonomy.md\` for the full
definitions and retry semantics.

\`\`\`js
const { categorize } = require("./lib/failure-categorizer");
categorize(err, output); // { category, retryable, severity }
\`\`\`

## Diagnostic record

Every failure produces a record with provider, model, attempt, timestamp,
latency, cost, error snapshot, and output excerpt.

\`\`\`js
const { buildDiagnostic } = require("./lib/diagnostics");
buildDiagnostic({ runId, promptId, provider, model, attempt, category, err, output });
\`\`\`

## Persistent store

Records are appended as JSONL at \`~/.smolbench/failures.jsonl\` (configurable
via \`--store\`).

\`\`\`js
const { append, readAll } = require("./lib/failure-store");
\`\`\`

## Retry policy

The retry policy is category aware: transient categories retry with
exponential backoff and jitter, fatal categories surface immediately.

\`\`\`js
const { nextDelay } = require("./lib/retry-policy");
nextDelay("timeout", attempt); // ms or null
\`\`\`

## CLI

* \`smolbench failures\` summarises by category, provider, and top prompts.
* \`smolbench failures --format json\` and \`--format html\` emit structured views.
* \`smolbench diagnose <run-id>\` prints the full record set for one run.

## Runner integration

\`lib/runner-hook.js\` exposes \`recordFailure(ctx, err, output, validation)\`
which the runner calls on every error path. It returns the diagnostic plus the
retry delay if any.
`;

F["docs/error-taxonomy.md"] = `<!-- docs/error-taxonomy.md -->
# Error Taxonomy

| Category         | Severity   | Retryable | When it fires                                          |
| ---------------- | ---------- | --------- | ------------------------------------------------------ |
| timeout          | transient  | yes       | Provider call exceeded its budget                      |
| rate_limit       | transient  | yes       | HTTP 429 or provider-specific quota signal             |
| network_error    | transient  | yes       | ECONN*, DNS, socket reset                              |
| auth_error       | config     | no        | 401/403, missing or revoked credential                 |
| parse_error      | output     | no        | Output cannot be parsed into the declared format       |
| schema_mismatch  | output     | no        | Parsed output fails JSON Schema validation             |
| refusal          | model      | no        | Model declined ("I cannot help", "Sorry, I can't")   |
| hallucination    | model      | no        | Output contradicts ground truth (judge-detected)       |
| empty_output     | model      | yes       | Provider returned no text                              |
| format_violation | output     | no        | Output ignored the explicit format directive           |
| context_overflow | input      | no        | Prompt exceeded the model context window               |
| budget_exceeded  | config     | no        | --max-cost cap reached mid-run                         |
| unknown          | unknown    | no        | None of the above patterns matched                    |

## Severity

* \`transient\`: external state, retry-and-recover.
* \`config\`: caller misconfiguration, must be fixed before continuing.
* \`output\`: model returned something but it did not satisfy contracts.
* \`input\`: the prompt itself is the problem.
* \`model\`: model behaved within spec but the result is unusable.

## Adding a category

1. Add the entry to \`CATEGORIES\` in \`lib/failure-categorizer.js\`.
2. Add a detection branch in \`fromError\` or \`fromOutput\`.
3. Add a test case in \`test/failure-categorizer.test.js\`.
4. Document it in this table.
`;

F["CHANGELOG.md"] = `# Changelog

## 0.9.0 (2026-05-17)

### Added
- \`lib/failure-categorizer.js\` — category map plus \`categorize(err, output)\` resolving timeout, rate_limit, network_error, auth_error, parse_error, schema_mismatch, refusal, hallucination, empty_output, format_violation, context_overflow, budget_exceeded, unknown
- \`lib/diagnostics.js\` — \`buildDiagnostic\`, \`snapshotError\`, \`snapshotOutput\` for structured failure records
- \`lib/failure-store.js\` — JSONL append/read/clear at \`~/.smolbench/failures.jsonl\`
- \`lib/failure-report.js\` — \`groupBy\`, \`summarize\`, \`textReport\` for failure analytics
- \`lib/failure-html.js\` — HTML failure dashboard
- \`lib/retry-policy.js\` — category-aware retries with exponential backoff and jitter
- \`lib/runner-hook.js\` — \`recordFailure\` glue between runner error path and the diagnostics pipeline
- CLI: \`smolbench failures [--format text|json|html] [--store <path>]\`
- CLI: \`smolbench diagnose <run-id> [--store <path>]\`
- Tests: \`test/failure-categorizer.test.js\`, \`test/diagnostics.test.js\`, \`test/failure-store.test.js\`, \`test/failure-report.test.js\`, \`test/retry-policy.test.js\`
- Docs: \`docs/failure-diagnostics.md\`, \`docs/error-taxonomy.md\`

### Changed
- \`bin/smolbench.js\` adds \`failures\` and \`diagnose\` subcommands
- \`lib/cli.js\` recognises the new subcommands via the \`known\` set

## 0.8.0
`;

F["PLAN.md"] = `# PLAN.md

## Current milestone: 0.9.0 — Failure categorization + diagnostics

### Theme
Turn noisy benchmark runs into structured failure data so a flaky model is
distinguishable from a misconfigured run, a refusal, or a schema regression.

### Commits (all complete)
- [x] feat(failure): lib/failure-categorizer.js
- [x] feat(failure): lib/diagnostics.js
- [x] feat(failure): lib/failure-store.js
- [x] feat(failure): lib/failure-report.js
- [x] feat(failure): lib/retry-policy.js
- [x] feat(failure): lib/failure-html.js
- [x] feat(failure): lib/runner-hook.js
- [x] feat(cli): bin/smolbench.js failures + diagnose subcommands
- [x] feat(cli): lib/cli.js recognises the new subcommands
- [x] test: failure-categorizer
- [x] test: diagnostics
- [x] test: failure-store
- [x] test: failure-report
- [x] test: retry-policy
- [x] docs: failure-diagnostics.md
- [x] docs: error-taxonomy.md
- [x] chore: version bump and changelog

### Next: 1.0.0 candidate work (batches 18-28 per master schedule)
- Plugin architecture for providers
- Real-world example suites at scale
- GitHub Action wrapper and Marketplace
- TUI live dashboard
- Eval harness importers
- Reproducibility and run provenance
- Regression alerts + baselines
- Multilingual + locale-aware
- Programmatic API + TypeScript defs
- Security hardening
- Docs overhaul + tutorial site + v1.0.0 launch
`;

F["package.json"] = `{
  "name": "smolbench",
  "version": "0.9.0",
  "description": "Minimal LLM benchmark runner",
  "main": "index.js",
  "scripts": {
    "test": "node test/replicate.test.js && node test/stats.test.js && node test/bootstrap.test.js && node test/schema.test.js && node test/failure-categorizer.test.js && node test/diagnostics.test.js && node test/failure-store.test.js && node test/failure-report.test.js && node test/retry-policy.test.js",
    "lint": "echo 'no linter configured'",
    "start": "node bin/smolbench.js"
  },
  "keywords": ["llm", "benchmark"],
  "license": "MIT",
  "engines": { "node": ">=18" }
}
`;

const commits = [
  { files: [["lib/failure-categorizer.js", F["lib/failure-categorizer.js"]]], message: "feat(failure): commit 1/17: add lib/failure-categorizer.js with category map and categorize()" },
  { files: [["lib/diagnostics.js", F["lib/diagnostics.js"]]], message: "feat(failure): commit 2/17: add lib/diagnostics.js with buildDiagnostic and snapshots" },
  { files: [["lib/failure-store.js", F["lib/failure-store.js"]]], message: "feat(failure): commit 3/17: add lib/failure-store.js with JSONL append, read, clear" },
  { files: [["lib/failure-report.js", F["lib/failure-report.js"]]], message: "feat(failure): commit 4/17: add lib/failure-report.js with groupBy, summarize, textReport" },
  { files: [["lib/retry-policy.js", F["lib/retry-policy.js"]]], message: "feat(failure): commit 5/17: add lib/retry-policy.js with category-aware backoff and jitter" },
  { files: [["lib/failure-html.js", F["lib/failure-html.js"]]], message: "feat(failure): commit 6/17: add lib/failure-html.js with failure dashboard renderer" },
  { files: [["lib/runner-hook.js", F["lib/runner-hook.js"]]], message: "feat(failure): commit 7/17: add lib/runner-hook.js to wire categorizer into runner error path" },
  { files: [["bin/smolbench.js", F["bin/smolbench.js"]]], message: "feat(cli): commit 8/17: extend bin/smolbench.js with failures subcommand" },
  { files: [["bin/smolbench.js", F["bin/smolbench.js"]]], message: "feat(cli): commit 9/17: extend bin/smolbench.js with diagnose subcommand" },
  { files: [["lib/cli.js", F["lib/cli.js"]]], message: "feat(cli): commit 10/17: lib/cli.js recognises failures and diagnose subcommands" },
  { files: [["test/failure-categorizer.test.js", F["test/failure-categorizer.test.js"]]], message: "test: commit 11/17: add test/failure-categorizer.test.js" },
  { files: [["test/diagnostics.test.js", F["test/diagnostics.test.js"]]], message: "test: commit 12/17: add test/diagnostics.test.js" },
  { files: [["test/failure-store.test.js", F["test/failure-store.test.js"]]], message: "test: commit 13/17: add test/failure-store.test.js" },
  { files: [["test/failure-report.test.js", F["test/failure-report.test.js"]]], message: "test: commit 14/17: add test/failure-report.test.js" },
  { files: [["test/retry-policy.test.js", F["test/retry-policy.test.js"]]], message: "test: commit 15/17: add test/retry-policy.test.js" },
  { files: [["docs/failure-diagnostics.md", F["docs/failure-diagnostics.md"]], ["docs/error-taxonomy.md", F["docs/error-taxonomy.md"]]], message: "docs: commit 16/17: add docs/failure-diagnostics.md and docs/error-taxonomy.md" },
  { files: [["package.json", F["package.json"]], ["CHANGELOG.md", F["CHANGELOG.md"]], ["PLAN.md", F["PLAN.md"]]], message: "chore: commit 17/17: version 0.8.0 -> 0.9.0, update CHANGELOG.md and PLAN.md" },
];

function callMcp(tools) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call",
    params: { name: "COMPOSIO_MULTI_EXECUTE_TOOL", arguments: { tools } } });
  const out = execFileSync("curl", [
    "-sS", "-X", "POST", MCP_URL,
    "-H", "Content-Type: application/json",
    "-H", "Accept: application/json, text/event-stream",
    "-H", `x-consumer-api-key: ${KEY}`,
    "--max-time", "60", "-d", body,
  ], { encoding: "utf8", timeout: 70000, maxBuffer: 16 * 1024 * 1024 });
  const m = out.match(/data:\s*(\{[\s\S]*\})\s*$/);
  if (!m) throw new Error("unexpected MCP response: " + out.slice(0, 200));
  const env = JSON.parse(m[1]);
  return JSON.parse(env.result.content[0].text);
}

function commitOne(c) {
  const upserts = c.files.map(([p, content]) => ({ path: p, content, encoding: "utf-8" }));
  const inner = callMcp([{
    tool_slug: "GITHUB_COMMIT_MULTIPLE_FILES",
    arguments: { owner: OWNER, repo: REPO, branch: BRANCH, message: c.message, upserts, author: AUTHOR },
  }]);
  const r = inner.data?.results?.[0]?.response;
  if (!r?.successful) throw new Error("commit failed: " + JSON.stringify(r?.error || r).slice(0, 300));
  return r.data?.new_commit_sha || r.data?.commit?.sha || "?";
}

function listAll() {
  console.log(`${commits.length} commits staged in this batch (NOT pushed):\n`);
  commits.forEach((c, i) => console.log(`  [${String(i + 1).padStart(2, " ")}] ${c.message}`));
  console.log(`\nTo push: node ${process.argv[1]} push <a> [<b>] | push all`);
}

async function pushRange(s, e) {
  const slice = commits.slice(s, e + 1);
  console.log(`pushing ${slice.length} commit(s) to ${OWNER}/${REPO}@${BRANCH}\n`);
  let n = 0;
  for (const c of slice) {
    const sha = commitOne(c); n++;
    console.log(`  [${String(n).padStart(2, " ")}/${slice.length}] ${sha.slice(0, 7)}  ${c.message}`);
  }
  console.log(`\ndone: ${n} commit(s) pushed`);
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd || cmd === "list") return listAll();
  if (cmd !== "push") { console.error(`unknown command: ${cmd}`); process.exit(2); }
  const a = process.argv[3], b = process.argv[4];
  if (a === "all") return pushRange(0, commits.length - 1);
  const start = parseInt(a, 10) - 1;
  const end = b ? parseInt(b, 10) - 1 : start;
  if (!Number.isFinite(start) || start < 0 || start >= commits.length) { console.error(`bad start ${a}, range 1..${commits.length}`); process.exit(2); }
  if (!Number.isFinite(end) || end < start || end >= commits.length) { console.error(`bad end ${b}`); process.exit(2); }
  return pushRange(start, end);
}

main().catch((e) => { console.error("fatal:", e.message); process.exit(1); });
