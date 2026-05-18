// lib/retry-policy.js
// Category-aware retry policy with exponential backoff and jitter.

const { CATEGORIES } = require("./failure-categorizer");

const DEFAULTS = {
  max_attempts: 4,
  base_ms: 500,
  cap_ms: 8000,
  jitter: true,
};

function shouldRetry(category, attempt, opts) {
  const o = Object.assign({}, DEFAULTS, opts || {});
  if (attempt >= o.max_attempts) return false;
  const meta = CATEGORIES[category];
  if (!meta) return false;
  return Boolean(meta.retryable);
}

function backoffMs(attempt, opts) {
  const o = Object.assign({}, DEFAULTS, opts || {});
  const raw = Math.min(o.cap_ms, o.base_ms * Math.pow(2, attempt));
  if (!o.jitter) return raw;
  return Math.floor(raw / 2 + Math.random() * (raw / 2));
}

function nextDelay(category, attempt, opts) {
  if (!shouldRetry(category, attempt, opts)) return null;
  return backoffMs(attempt, opts);
}

module.exports = { DEFAULTS, shouldRetry, backoffMs, nextDelay };
