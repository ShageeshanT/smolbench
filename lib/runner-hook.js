// lib/runner-hook.js
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
