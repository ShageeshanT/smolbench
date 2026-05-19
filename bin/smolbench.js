#!/usr/bin/env node
// bin/smolbench.js
// Entry point for smolbench CLI.

const { parseArgs } = require("../lib/cli");
const { textReport, jsonReport } = require("../lib/report");
const { htmlReport } = require("../lib/report-html");

function main() {
  const args = parseArgs(process.argv);

  if (!args.commands.length) {
    console.error("Usage: smolbench [--replicates N] [--estimate] [--ci] [--report json|html] <suite.yaml>");
    process.exit(1);
  }

  if (args.commands.includes("run")) {
    console.log("Running suite...");
    // Placeholder: actual run logic lives in index.js / runner.
  }

  if (args.commands.includes("report")) {
    const format = args.flags.format || args.flags.f || "text";
    console.log(`Report format: ${format}`);
  }

  if (args.flags.replicates) {
    console.log(`Replicates: ${args.flags.replicates}`);
  }

  if (args.flags.estimate) {
    console.log("Estimates enabled");
  }

  if (args.flags.ci) {
    console.log("CI enabled");
  }
}

main();
