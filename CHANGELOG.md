# Changelog

## [0.7.0] -- 2026-05-15

### Added
- `web/`: Self-contained web dashboard with dark mode, no JS framework.
  - `leaderboard.js`: sortable columns (provider, model, score, cost, latency, status)
  - `scatter.js`: SVG cost vs quality bubble chart per provider
  - `cdf.js`: latency cumulative distribution per provider
  - `diff.js`: two-run side-by-side diff with score/cost/latency delta
  - `filters.js`: filter by provider, suite, free-text search
  - `share.js`: URL deep linking to a filtered view
  - `runs-loader.js`: drop in `runs/*.json` and it renders
  - `styles.css`: hand-rolled, no Tailwind
- `examples/sample-runs/`: two sample runs so the demo works out of the box
- `.github/workflows/pages.yml`: deploys `web/` to GitHub Pages on master push
- README dashboard badge + live URL

### Changed
- README links to live dashboard at https://shageeshant.github.io/smolbench/

---

## [0.6.0] -- 2026-05-14

### Added
- `lib/cache.js`: Content-addressed cache at `~/.smolbench/cache/` with TTL.
- `lib/cost-estimator.js`: Per-provider token pricing; estimates USD per run.
- CLI: `smolbench estimate`, `smolbench cache stats`, `smolbench cache clear`.
- Flag: `--max-cost <usd>` aborts run if cost exceeds budget.
- Cache hit/miss + cost tracking written to `runs.jsonl`.
- Tests for cache and cost estimator.
- README badge row.

---

## [0.5.0] -- 2026-05-10

[Previous entries...]
