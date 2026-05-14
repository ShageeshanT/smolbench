# Changelog

## [0.6.0] -- 2026-05-14

### Added
- `lib/cache.js`: Content-addressed cache at `~/.smolbench/cache/` with TTL (default 6h) and manifest.
- `lib/cost-estimator.js`: Per-provider token pricing; estimates USD cost per run.
- CLI: `smolbench estimate`, `smolbench cache stats`, `smolbench cache clear`.
- Flag: `--max-cost <usd>` aborts a run mid-execution if projected cost exceeds the budget.
- Cache hit/miss + cost tracking written to `runs.jsonl` on every run.
- Tests for cache, cost estimator, max-cost guard.

### Changed
- `lib/runner.js` integrates cache lookup before provider call and cost estimation after.
- README badge row: CI, npm version, license, downloads.

---

## [0.5.0] -- 2026-05-10

[Previous entries...]
