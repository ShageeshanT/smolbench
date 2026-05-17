// lib/report.js
// Text and JSON report generators.

const { mean } = require("./stats");

function textReport(results) {
  const lines = [];
  lines.push("smolbench results");
  lines.push("================");
  lines.push("");
  if (results.grand_mean !== undefined) {
    lines.push(`grand mean : ${results.grand_mean.toFixed(4)}`);
  }
  if (results.n_prompts) lines.push(`prompts   : ${results.n_prompts}`);
  if (results.n_replicates) lines.push(`replicates: ${results.n_replicates}`);
  lines.push("");
  lines.push("per-prompt scores");
  lines.push("-".repeat(60));
  if (results.scores && results.scores.length) {
    lines.push(`${"prompt_id".padEnd(20)} ${"mean".padStart(8)} ${"ci_low".padStart(8)} ${"ci_high".padStart(8)} ${"n".padStart(4)}`);
    results.scores.forEach((s) => {
      lines.push(`${String(s.prompt_id).padEnd(20)} ${s.mean.toFixed(4).padStart(8)} ${(s.ci_low || 0).toFixed(4).padStart(8)} ${(s.ci_high || 0).toFixed(4).padStart(8)} ${String(s.n || "-").padStart(4)}`);
    });
  }
  return lines.join("\n");
}

function jsonReport(results) {
  return JSON.stringify({
    version: results.version || "0.8.0",
    timestamp: results.timestamp || new Date().toISOString(),
    grand_mean: results.grand_mean,
    n_prompts: results.n_prompts,
    n_replicates: results.n_replicates,
    scores: results.scores || [],
  }, null, 2);
}

module.exports = { textReport, jsonReport };
