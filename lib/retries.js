// Exponential backoff retry wrapper for provider calls.
// Retries on 429, 500, 502, 503, 504, and on network errors. Caller passes
// a thunk that returns a Response-like object or throws.
//
// Defaults: 3 retries, base 500ms, factor 2, full jitter.

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export async function withRetries(fn, opts = {}) {
  const max = opts.max ?? 3;
  const base = opts.base ?? 500;
  const factor = opts.factor ?? 2;
  let lastErr;
  for (let attempt = 0; attempt <= max; attempt++) {
    try {
      const out = await fn(attempt);
      if (out && typeof out.status === "number" && RETRYABLE_STATUSES.has(out.status)) {
        if (attempt === max) return out;
        await sleep(jitter(base * Math.pow(factor, attempt)));
        continue;
      }
      return out;
    } catch (e) {
      lastErr = e;
      if (attempt === max) throw e;
      await sleep(jitter(base * Math.pow(factor, attempt)));
    }
  }
  throw lastErr;
}

function jitter(ms) { return Math.random() * ms; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
