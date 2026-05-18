// lib/failure-categorizer.js
// Classify failures from provider responses into named categories.

const CATEGORIES = {
  timeout:          { retryable: true,  severity: "transient" },
  rate_limit:       { retryable: true,  severity: "transient" },
  network_error:    { retryable: true,  severity: "transient" },
  auth_error:       { retryable: false, severity: "config" },
  parse_error:      { retryable: false, severity: "output" },
  schema_mismatch:  { retryable: false, severity: "output" },
  refusal:          { retryable: false, severity: "model" },
  hallucination:    { retryable: false, severity: "model" },
  empty_output:     { retryable: true,  severity: "model" },
  format_violation: { retryable: false, severity: "output" },
  context_overflow: { retryable: false, severity: "input" },
  budget_exceeded:  { retryable: false, severity: "config" },
  unknown:          { retryable: false, severity: "unknown" },
};

function fromError(msg) {
  if (msg.includes("timeout") || msg.includes("etimedout")) return "timeout";
  if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests")) return "rate_limit";
  if (msg.includes("econn") || msg.includes("network") || msg.includes("dns") || msg.includes("socket")) return "network_error";
  if (msg.includes("401") || msg.includes("403") || msg.includes("unauthor") || msg.includes("forbidden")) return "auth_error";
  if (msg.includes("context length") || msg.includes("token limit") || msg.includes("max_tokens")) return "context_overflow";
  if (msg.includes("budget") || msg.includes("max-cost")) return "budget_exceeded";
  if (msg.includes("parse") || msg.includes("invalid json")) return "parse_error";
  return null;
}

function fromOutput(text) {
  if (!text || !text.trim()) return "empty_output";
  const head = text.trim().slice(0, 200).toLowerCase();
  if (/^(i (cannot|can't|won't|am unable|am not able)|sorry, i (can't|cannot))/i.test(head)) return "refusal";
  return null;
}

function categorize(err, output) {
  if (!err && (output === undefined || output === null)) return { category: "unknown", ...CATEGORIES.unknown };
  if (err) {
    const msg = String(err.message || err).toLowerCase();
    const cat = fromError(msg);
    if (cat) return { category: cat, ...CATEGORIES[cat] };
  }
  if (output !== undefined && output !== null) {
    const text = typeof output === "string" ? output : JSON.stringify(output);
    const cat = fromOutput(text);
    if (cat) return { category: cat, ...CATEGORIES[cat] };
  }
  return { category: "unknown", ...CATEGORIES.unknown };
}

function categorizeSchema(validation) {
  if (validation && validation.valid === false) {
    return { category: "schema_mismatch", ...CATEGORIES.schema_mismatch, errors: validation.errors };
  }
  return null;
}

module.exports = { CATEGORIES, categorize, categorizeSchema, fromError, fromOutput };
