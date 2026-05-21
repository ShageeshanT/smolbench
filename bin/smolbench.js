#!/usr/bin/env node
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
