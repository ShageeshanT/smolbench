#!/usr/bin/env node
// smolbench CLI v0.3.0. Adds --providers, --filter, validate, export, report.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { parseYaml } from "./lib/yaml.js";
import { register, list as listProviders } from "./lib/registry.js";
import { runSuite } from "./lib/runner.js";
import { rankRows } from "./lib/score.js";
import { clearAll, cacheDir } from "./lib/cache.js";
import { diff, regressions } from "./lib/diff.js";
import { version } from "./lib/version.js";
import { renderHtml } from "./lib/report-html.js";
import { renderCsv } from "./lib/report-csv.js";
import { createOpenAICompatProvider } from "./lib/providers/openai-compat.js";
import { createAnthropicProvider } from "./lib/providers/anthropic.js";
import { createGoogleProvider } from "./lib/providers/google.js";
import { createNvidiaProvider } from "./lib/providers/nvidia.js";

const HELP = `smolbench v${version()}, workload-specific LLM benchmarks.

Usage:
  smolbench run <suite.yaml> [--parallel] [--cache] [--providers a,b] [--filter id1,id2]
  smolbench leaderboard <run>
  smolbench compare <a> <b>
  smolbench export <run> [--format html|csv|md] [--out path]
  smolbench validate <suite.yaml>
  smolbench init
  smolbench cache clear
  smolbench --version | -v
`;

function loadConfig() {
  const path = process.env.SMOLBENCH_CONFIG || join(process.cwd(), ".smolbench.yaml");
  if (!existsSync(path)) return { providers: [] };
  return parseYaml(readFileSync(path, "utf8")) || { providers: [] };
}

function configureProviders(cfg) {
  for (const p of cfg.providers || []) {
    const env = (k) => p[k] || process.env[`${p.id?.toUpperCase()}_API_KEY`];
    if (p.kind === "openai-compat") register(createOpenAICompatProvider({ id: p.id, baseUrl: p.baseUrl, apiKey: env("apiKey"), model: p.model }));
    else if (p.kind === "anthropic") register(createAnthropicProvider({ apiKey: env("apiKey") || process.env.ANTHROPIC_API_KEY, model: p.model }));
    else if (p.kind === "google") register(createGoogleProvider({ apiKey: env("apiKey") || process.env.GOOGLE_API_KEY, model: p.model }));
    else if (p.kind === "nvidia") register(createNvidiaProvider({ apiKey: env("apiKey") || process.env.NVIDIA_API_KEY, model: p.model }));
  }
}

function parseFlags(args) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > 0) flags[a.slice(2, eq)] = a.slice(eq + 1);
      else if (args[i + 1] && !args[i + 1].startsWith("--")) { flags[a.slice(2)] = args[++i]; }
      else flags[a.slice(2)] = true;
    } else { positional.push(a); }
  }
  return { flags, positional };
}

async function cmdRun(args) {
  const { flags, positional } = parseFlags(args);
  const suitePath = positional[0];
  if (!suitePath) die("run needs <suite.yaml>");
  configureProviders(loadConfig());
  let providers = listProviders();
  if (flags.providers) {
    const wanted = String(flags.providers).split(",").map((s) => s.trim());
    providers = providers.filter((p) => wanted.includes(p.id));
    if (!providers.length) die(`no providers matched --providers=${flags.providers}`);
  }
  const suite = parseYaml(readFileSync(suitePath, "utf8"));
  if (!suite?.prompts?.length) die("suite has no prompts");
  let prompts = suite.prompts;
  if (flags.filter) {
    const ids = new Set(String(flags.filter).split(",").map((s) => s.trim()));
    prompts = prompts.filter((p) => ids.has(p.id));
    if (!prompts.length) die(`no prompts matched --filter=${flags.filter}`);
  }
  const rows = await runSuite(prompts, { parallel: !!flags.parallel, cache: !!flags.cache, providers });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(join(process.cwd(), "runs"), { recursive: true });
  const outPath = join(process.cwd(), "runs", `${basename(suitePath, ".yaml")}-${ts}.json`);
  writeFileSync(outPath, JSON.stringify({ suite: suite.suite || basename(suitePath, ".yaml"), at: ts, rows }, null, 2));
  refreshRunsIndex();
  process.stdout.write(`smolbench: wrote ${outPath} (${rows.length} rows)\n`);
}

function refreshRunsIndex() {
  const runsDir = join(process.cwd(), "runs");
  if (!existsSync(runsDir)) return;
  const entries = readdirSync(runsDir).filter((f) => f.endsWith(".json") && f !== "index.json");
  writeFileSync(join(runsDir, "index.json"), JSON.stringify({ runs: entries.sort().reverse() }, null, 2));
}

function cmdLeaderboard(runPath) {
  if (!runPath) die("leaderboard needs <run.json>");
  const run = JSON.parse(readFileSync(runPath, "utf8"));
  const ranked = rankRows(run.rows || []);
  const out = [`# ${run.suite || "smolbench run"}`, "", `Run at: \`${run.at || "?"}\` | Rows: ${ranked.length}`, "",
    "| Rank | Provider | Model | Quality | Cost (USD) | Latency (ms) | Score |",
    "|---|---|---|---|---|---|---|"];
  ranked.forEach((r, i) => {
    const q = typeof r.quality === "number" ? r.quality.toFixed(2) : "-";
    const c = typeof r.cost === "number" ? r.cost.toFixed(6) : "-";
    out.push(`| ${i + 1} | ${r.provider} | ${r.model} | ${q} | ${c} | ${r.latencyMs ?? "-"} | ${r._score?.total?.toFixed(4) ?? "-"} |`);
  });
  process.stdout.write(out.join("\n") + "\n");
}

function cmdCompare(aPath, bPath) {
  if (!aPath || !bPath) die("compare needs <runA.json> <runB.json>");
  const a = JSON.parse(readFileSync(aPath, "utf8"));
  const b = JSON.parse(readFileSync(bPath, "utf8"));
  const rows = diff(a, b);
  const lines = [`# Comparison: ${basename(aPath)} vs ${basename(bPath)}`, "",
    "| Provider | Model | Prompt | Δ latency (ms) | Δ cost (USD) | Δ quality |",
    "|---|---|---|---|---|---|"];
  for (const r of rows) {
    lines.push(`| ${r.provider} | ${r.model} | ${r.promptId} | ${r.dLatencyMs >= 0 ? "+" : ""}${r.dLatencyMs} | ${r.dCost.toFixed(6)} | ${r.dQuality.toFixed(2)} |`);
  }
  const regs = regressions(rows);
  if (regs.length) lines.push("", `**Regressions: ${regs.length}** (latency >500ms, cost >\$0.001, or quality <-0.1)`);
  process.stdout.write(lines.join("\n") + "\n");
}

function cmdExport(args) {
  const { flags, positional } = parseFlags(args);
  const runPath = positional[0];
  if (!runPath) die("export needs <run.json>");
  const run = JSON.parse(readFileSync(runPath, "utf8"));
  const ranked = rankRows(run.rows || []);
  const fmt = flags.format || "html";
  let body;
  if (fmt === "html") body = renderHtml(run, ranked);
  else if (fmt === "csv") body = renderCsv(ranked);
  else if (fmt === "md") return cmdLeaderboard(runPath);
  else die(`unknown --format ${fmt}, try html, csv, md`);
  if (flags.out) {
    writeFileSync(flags.out, body);
    process.stdout.write(`smolbench: wrote ${flags.out}\n`);
  } else {
    process.stdout.write(body);
  }
}

function cmdValidate(suitePath) {
  if (!suitePath) die("validate needs <suite.yaml>");
  const text = readFileSync(suitePath, "utf8");
  let parsed;
  try { parsed = parseYaml(text); } catch (e) { die(`yaml parse error: ${e.message}`); }
  const errors = [];
  if (!parsed) errors.push("empty document");
  if (!parsed?.suite) errors.push("missing suite name (top-level 'suite:')");
  if (!Array.isArray(parsed?.prompts)) errors.push("missing 'prompts' list");
  else {
    parsed.prompts.forEach((p, i) => {
      if (!p?.id) errors.push(`prompts[${i}]: missing id`);
      if (!p?.user) errors.push(`prompts[${i}]: missing user`);
    });
    const ids = parsed.prompts.map((p) => p?.id).filter(Boolean);
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup) errors.push(`duplicate prompt id: ${dup}`);
  }
  if (errors.length) {
    process.stderr.write("smolbench: validation failed\n");
    for (const e of errors) process.stderr.write(`  - ${e}\n`);
    process.exit(2);
  }
  process.stdout.write(`smolbench: ${suitePath} OK (suite=${parsed.suite}, ${parsed.prompts.length} prompts)\n`);
}

function cmdInit() {
  const path = join(process.cwd(), ".smolbench.yaml");
  if (existsSync(path)) die(`.smolbench.yaml already exists at ${path}`);
  writeFileSync(path, `providers:
  - id: anthropic
    kind: anthropic
    model: claude-haiku-4-5
  - id: nvidia
    kind: nvidia
    model: meta/llama-3.3-70b-instruct
  - id: google
    kind: google
    model: gemini-2.5-flash
`);
  process.stdout.write(`smolbench: scaffolded ${path}\n`);
}

function cmdCache(sub) {
  if (sub === "clear") { clearAll(); process.stdout.write(`smolbench: cache cleared (${cacheDir()})\n`); }
  else die(`cache subcommand "${sub || ""}" unknown, try: cache clear`);
}

function die(msg) { process.stderr.write(`smolbench: ${msg}\n`); process.exit(2); }

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") { process.stdout.write(HELP); return; }
  if (cmd === "--version" || cmd === "-v") { process.stdout.write(`smolbench ${version()}\n`); return; }
  if (cmd === "run") return cmdRun(argv.slice(1));
  if (cmd === "leaderboard") return cmdLeaderboard(argv[1]);
  if (cmd === "compare") return cmdCompare(argv[1], argv[2]);
  if (cmd === "export") return cmdExport(argv.slice(1));
  if (cmd === "validate") return cmdValidate(argv[1]);
  if (cmd === "init") return cmdInit();
  if (cmd === "cache") return cmdCache(argv[1]);
  die(`command "${cmd}" not implemented`);
}

main().catch((e) => die(e.message));
