// lib/output-schema.js
// Output schema validation using Ajv-compatible JSON Schema.

const SCORE_ROW_SCHEMA = {
  type: "object",
  required: ["prompt_id", "mean"],
  properties: {
    prompt_id: { type: "string" },
    mean: { type: "number" },
    ci_low: { type: "number" },
    ci_high: { type: "number" },
    n: { type: "number", minimum: 1 },
    replicate_ids: { type: "array", items: { type: "string" } },
    variance: { type: "number" },
  },
};

const REPORT_SCHEMA = {
  type: "object",
  required: ["version", "timestamp", "grand_mean"],
  properties: {
    version: { type: "string" },
    timestamp: { type: "string", format: "date-time" },
    grand_mean: { type: "number" },
    n_prompts: { type: "number" },
    n_replicates: { type: "number" },
    scores: { type: "array", items: SCORE_ROW_SCHEMA },
  },
};

function validateScoreRow(row) {
  const errors = [];
  if (typeof row.prompt_id !== "string" || !row.prompt_id) errors.push("prompt_id must be a non-empty string");
  if (typeof row.mean !== "number" || isNaN(row.mean)) errors.push("mean must be a number");
  if (row.n !== undefined && (typeof row.n !== "number" || row.n < 1)) errors.push("n must be >= 1");
  if (row.ci_low !== undefined && typeof row.ci_low !== "number") errors.push("ci_low must be a number");
  if (row.ci_high !== undefined && typeof row.ci_high !== "number") errors.push("ci_high must be a number");
  if (row.ci_high !== undefined && row.ci_low !== undefined && row.ci_high < row.ci_low) errors.push("ci_high must be >= ci_low");
  return { valid: errors.length === 0, errors };
}

function validateReport(report) {
  const errors = [];
  if (!report.version) errors.push("version is required");
  if (!report.timestamp) errors.push("timestamp is required");
  if (typeof report.grand_mean !== "number") errors.push("grand_mean must be a number");
  if (Array.isArray(report.scores)) {
    report.scores.forEach((row, i) => {
      const vr = validateScoreRow(row);
      if (!vr.valid) errors.push(`scores[${i}]: ${vr.errors.join(", ")}`);
    });
  }
  return { valid: errors.length === 0, errors };
}

module.exports = { SCORE_ROW_SCHEMA, REPORT_SCHEMA, validateScoreRow, validateReport };
