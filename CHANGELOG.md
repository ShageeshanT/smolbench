# Changelog

All notable changes to smolbench. Format follows Keep a Changelog, dates ISO.

## [0.2.0] - 2026-05-07

### Added

- `web/index.html`, `web/app.js`, `web/style.css`: static leaderboard renderer, dark mode, no JS framework.
- `.github/workflows/pages.yml`: deploy `web/` to GitHub Pages on push to master.
- `lib/version.js`: version resolver that reads from package.json without bundlers.
- `smolbench --version` / `-v` flag.
- `runner.parallel` option (`smolbench run --parallel`): run all providers concurrently per prompt.
- `runner.cache` option (`smolbench run --cache`): hit-miss the on-disk cache during runs.
- `runs/index.json` auto-regenerated after each `smolbench run` so the static UI can list runs.

### Changed

- `smolbench compare` now uses `lib/diff.js` (was inline in cli.js). Same output, deduplicated logic.
- Bumped to 0.2.0 to mark the Phase 4 web UI shipping.

## [0.1.0] - 2026-05-06

### Added

- `smolbench run <suite.yaml>`: execute a YAML prompt suite across all registered providers, write run JSON to `runs/`.
- `smolbench leaderboard <run.json>`: render a markdown leaderboard ranked by composite score.
- `smolbench compare <a.json> <b.json>`: per-prompt latency / cost / quality deltas between two runs.
- `smolbench init`: scaffold `.smolbench.yaml` in cwd.
- `smolbench cache clear`: drop the on-disk `~/.smolbench/cache` directory.
- Provider adapters: OpenAI-compatible, Anthropic, Google Gemini, NVIDIA NIM.
- Composite scoring (`lib/score.js`) weighting quality, cost, latency.
- LLM judge harness (`lib/judge.js`) with a calibrated 0-10 rubric.
- Pricing table (`lib/cost.js`).
- Result cache (`lib/cache.js`) keyed by SHA of (model, prompt).
- Mini YAML reader (`lib/yaml.js`).
- Run-over-run diff (`lib/diff.js`) with regression thresholds.
- Real-world suites: hello, code-review, summarisation, classification, extraction.
- Smoke tests via `node --test`.
- CI workflow on Node 18, 20, 22.
- PR + issue templates, CHANGELOG.
