// lib/diagnostics.js
// Build a structured diagnostic record for a failed run.

function snapshotError(err) {
  if (!err) return null;
  const stack = err.stack ? String(err.stack).split("\n").slice(0, 6).join("\n") : undefined;
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
