<!-- docs/failure-diagnostics.md -->
# Failure Diagnostics in smolbench 0.9.0

smolbench 0.9.0 introduces structured failure handling so noisy runs become
actionable signal. Every failed call is categorized, captured as a diagnostic
record, persisted to disk, and surfaced through CLI reports.

## Categories

Each failure resolves to one of: `timeout`, `rate_limit`, `network_error`,
`auth_error`, `parse_error`, `schema_mismatch`, `refusal`,
`hallucination`, `empty_output`, `format_violation`, `context_overflow`,
`budget_exceeded`, `unknown`. See `docs/error-taxonomy.md` for the full
definitions and retry semantics.

```js
const { categorize } = require("./lib/failure-categorizer");
categorize(err, output); // { category, retryable, severity }
```

## Diagnostic record

Every failure produces a record with provider, model, attempt, timestamp,
latency, cost, error snapshot, and output excerpt.

```js
const { buildDiagnostic } = require("./lib/diagnostics");
buildDiagnostic({ runId, promptId, provider, model, attempt, category, err, output });
```

## Persistent store

Records are appended as JSONL at `~/.smolbench/failures.jsonl` (configurable
via `--store`).

```js
const { append, readAll } = require("./lib/failure-store");
```

## Retry policy

The retry policy is category aware: transient categories retry with
exponential backoff and jitter, fatal categories surface immediately.

```js
const { nextDelay } = require("./lib/retry-policy");
nextDelay("timeout", attempt); // ms or null
```

## CLI

* `smolbench failures` summarises by category, provider, and top prompts.
* `smolbench failures --format json` and `--format html` emit structured views.
* `smolbench diagnose <run-id>` prints the full record set for one run.

## Runner integration

`lib/runner-hook.js` exposes `recordFailure(ctx, err, output, validation)`
which the runner calls on every error path. It returns the diagnostic plus the
retry delay if any.
