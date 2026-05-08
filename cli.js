#!/usr/bin/env node
// smolbench CLI entry. Phase 1 stub: parses argv and prints help. Real
// commands will land in subsequent commits.

const args = process.argv.slice(2);
const cmd = args[0];

const usage = `smolbench, workload-specific LLM benchmarks.

Usage:
  smolbench run <suite.yaml>     Run a prompt suite across registered providers
  smolbench leaderboard <run>    Render a markdown leaderboard from a run JSON
  smolbench compare <a> <b>      Diff two runs

Examples:
  smolbench run examples/hello.yaml
`;

if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
  process.stdout.write(usage);
  process.exit(0);
}

console.error(`smolbench: command "${cmd}" not implemented yet, see PLAN.md`);
process.exit(2);
