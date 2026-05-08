#!/usr/bin/env node
// smolbench CLI. Phase 2 + 3 wired: run, leaderboard, compare, init, cache.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parseYaml } from "./lib/yaml.js";
import { register } from "./lib/registry.js";
import { runSuite } from "./lib/runner.js";
import { rankRows } from "./lib/score.js";
import { clearAll, cacheDir } from "./lib/cache.js";
import { diff, regressions } from "./lib/diff.js";
import { createOpenAICompatProvider } from "./lib/providers/openai-compat.js";
import { createAnthropicProvider } from "./lib/providers/anthropic.js";
import { createGoogleProvider } from "./lib/providers/google.js";
import { createNvidiaProvider } from "./lib/providers/nvidia.js";

const HELP = `smolbench, workload-specific LLM benchmarks.

Usage:
  smolbench run <suite.yaml>     Run a prompt suite across registered providers
  smolbench leaderboard <run>    Render a markdown leaderboard from a run JSON
  smolbench compare <a> <b>      Diff two runs side by side
  smolbench init                 Scaffold .smolbench.yaml in cwd
  smolbench cache clear          Clear the on-disk result cache
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

async function cmdRun(suitePath) {
  if (!suitePath) die("run needs <suite.yaml>");
  configureProviders(loadConfig());
  const suite = parseYaml(readFileSync(suitePath, "utf8"));
  if (!suite?.prompts?.length) die("suite has no prompts");
  const rows = await runSuite(suite.prompts);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(join(process.cwd(), "runs"), { recursive: true });
  const outPath = join(process.cwd(), "runs", `${basename(suitePath, ".yaml")}-${ts}.json`);
  writeFileSync(outPath, JSON.stringify({ suite: suite.suite || basename(suitePath, ".yaml"), at: ts, rows }, null, 2));
  process.stdout.write(`smolbench: wrote ${outPath} (${rows.length} rows)\n`);
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
  if (regs.length) lines.push("", `**Regressions: ${regs.length}**`, "(latency >500ms, cost >\$0.001, or quality <-0.1)");
  process.stdout.write(lines.join("\n") + "\n");
}

function cmdInit() {
  const path = join(process.cwd(), ".smolbench.yaml");
  if (existsSync(path)) die(`.smolbench.yaml already exists at ${path}`);
  const tpl = `# smolbench config. Run: smolbench run examples/hello.yaml
providers:
  - id: anthropic
    kind: anthropic
    model: claude-haiku-4-5
    # apiKey: \$ANTHROPIC_API_KEY (default)
  - id: nvidia
    kind: nvidia
    model: meta/llama-3.3-70b-instruct
    # apiKey: \$NVIDIA_API_KEY (default)
  - id: google
    kind: google
    model: gemini-2.5-flash
    # apiKey: \$GOOGLE_API_KEY (default)

# Optional: override scoring weights (must sum to 1.0)
# weights:
#   quality: 0.5
#   cost: 0.25
#   latency: 0.25
`;
  writeFileSync(path, tpl);
  process.stdout.write(`smolbench: scaffolded ${path}\n`);
}

function cmdCache(sub) {
  if (sub === "clear") { clearAll(); process.stdout.write(`smolbench: cache cleared (${cacheDir()})\n`); }
  else die(`cache subcommand "${sub || ""}" unknown, try: cache clear`);
}

function die(msg) { process.stderr.write(`smolbench: ${msg}\n`); process.exit(2); }

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") { process.stdout.write(HELP); return; }
  if (cmd === "run") return cmdRun(args[0]);
  if (cmd === "leaderboard") return cmdLeaderboard(args[0]);
  if (cmd === "compare") return cmdCompare(args[0], args[1]);
  if (cmd === "init") return cmdInit();
  if (cmd === "cache") return cmdCache(args[0]);
  die(`command "${cmd}" not implemented`);
}

main().catch((e) => die(e.message));
