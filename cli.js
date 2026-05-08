#!/usr/bin/env node
// smolbench CLI. Phase 2: `run` is now wired.
//
// Usage:
//   smolbench run <suite.yaml>     execute a suite, write runs/<ts>.json
//   smolbench leaderboard <run>    render a markdown leaderboard
//   smolbench compare <a> <b>      diff two runs
//   smolbench init                 scaffold .smolbench.yaml in cwd

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parseYaml } from "./lib/yaml.js";
import { register } from "./lib/registry.js";
import { runSuite } from "./lib/runner.js";
import { createOpenAICompatProvider } from "./lib/providers/openai-compat.js";
import { createAnthropicProvider } from "./lib/providers/anthropic.js";
import { createGoogleProvider } from "./lib/providers/google.js";
import { createNvidiaProvider } from "./lib/providers/nvidia.js";

const HELP = `smolbench, workload-specific LLM benchmarks.

Usage:
  smolbench run <suite.yaml>     Run a prompt suite across registered providers
  smolbench leaderboard <run>    Render a markdown leaderboard from a run JSON
  smolbench compare <a> <b>      Diff two runs
  smolbench init                 Scaffold .smolbench.yaml in cwd

Environment:
  SMOLBENCH_CONFIG               Path to config (default: ./.smolbench.yaml)
  ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, NVIDIA_API_KEY
                                 Provider keys, used by the matching adapters
`;

function loadConfig() {
  const path = process.env.SMOLBENCH_CONFIG || join(process.cwd(), ".smolbench.yaml");
  if (!existsSync(path)) return { providers: [] };
  return parseYaml(readFileSync(path, "utf8")) || { providers: [] };
}

function configureProviders(cfg) {
  for (const p of cfg.providers || []) {
    const env = (k) => p[k] || process.env[`${p.id?.toUpperCase()}_API_KEY`] || process.env[p.envKey || ""];
    if (p.kind === "openai-compat") {
      register(createOpenAICompatProvider({ id: p.id, baseUrl: p.baseUrl, apiKey: env("apiKey"), model: p.model }));
    } else if (p.kind === "anthropic") {
      register(createAnthropicProvider({ apiKey: env("apiKey") || process.env.ANTHROPIC_API_KEY, model: p.model }));
    } else if (p.kind === "google") {
      register(createGoogleProvider({ apiKey: env("apiKey") || process.env.GOOGLE_API_KEY, model: p.model }));
    } else if (p.kind === "nvidia") {
      register(createNvidiaProvider({ apiKey: env("apiKey") || process.env.NVIDIA_API_KEY, model: p.model }));
    }
  }
}

async function cmdRun(suitePath) {
  if (!suitePath) { process.stderr.write("smolbench: run needs <suite.yaml>\n"); process.exit(2); }
  const cfg = loadConfig();
  configureProviders(cfg);
  const suite = parseYaml(readFileSync(suitePath, "utf8"));
  if (!suite?.prompts?.length) { process.stderr.write("smolbench: suite has no prompts\n"); process.exit(2); }
  const rows = await runSuite(suite.prompts);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = join(process.cwd(), "runs");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${basename(suitePath, ".yaml")}-${ts}.json`);
  writeFileSync(outPath, JSON.stringify({ suite: suite.suite || basename(suitePath, ".yaml"), at: ts, rows }, null, 2));
  process.stdout.write(`smolbench: wrote ${outPath} (${rows.length} rows)\n`);
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") { process.stdout.write(HELP); return; }
  if (cmd === "run") return cmdRun(args[0]);
  process.stderr.write(`smolbench: command "${cmd}" not implemented yet, see PLAN.md\n`);
  process.exit(2);
}

main().catch((e) => { process.stderr.write(`smolbench: ${e.message}\n`); process.exit(1); });
