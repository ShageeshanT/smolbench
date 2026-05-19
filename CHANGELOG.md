# Changelog

## 0.9.0 (2026-05-17)

### Added
- `lib/failure-categorizer.js` — category map plus `categorize(err, output)` resolving timeout, rate_limit, network_error, auth_error, parse_error, schema_mismatch, refusal, hallucination, empty_output, format_violation, context_overflow, budget_exceeded, unknown
- `lib/diagnostics.js` — `buildDiagnostic`, `snapshotError`, `snapshotOutput` for structured failure records
- `lib/failure-store.js` — JSONL append/read/clear at `~/.smolbench/failures.jsonl`
- `lib/failure-report.js` — `groupBy`, `summarize`, `textReport` for failure analytics
- `lib/failure-html.js` — HTML failure dashboard
- `lib/retry-policy.js` — category-aware retries with exponential backoff and jitter
- `lib/runner-hook.js` — `recordFailure` glue between runner error path and the diagnostics pipeline
- CLI: `smolbench failures [--format text|json|html] [--store <path>]`
- CLI: `smolbench diagnose <run-id> [--store <path>]`
- Tests: `test/failure-categorizer.test.js`, `test/diagnostics.test.js`, `test/failure-store.test.js`, `test/failure-report.test.js`, `test/retry-policy.test.js`
- Docs: `docs/failure-diagnostics.md`, `docs/error-taxonomy.md`

### Changed
- `bin/smolbench.js` adds `failures` and `diagnose` subcommands
- `lib/cli.js` recognises the new subcommands via the `known` set

## 0.8.0
