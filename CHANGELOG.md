# Changelog

All notable changes to smolbench. Format follows Keep a Changelog, dates ISO.

## [Unreleased]

### Added

- Phase 4 web UI scaffold and Pages deploy (planned)
- npm publish dry-run (planned)

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
- Pricing table (`lib/cost.js`) covering Anthropic, OpenAI, Google, NVIDIA NIM, MiniMax.
- Result cache (`lib/cache.js`) keyed by SHA of (model, prompt).
- Mini YAML reader (`lib/yaml.js`) covering the suite-file subset, stdlib only.
- Run-over-run diff (`lib/diff.js`) with regression thresholds.
- Real-world suites: `examples/hello.yaml`, `examples/code-review.yaml`, `examples/summarisation.yaml`.
- Smoke tests (`test/smoke.test.js`) for registry, cost, score, yaml, diff.
- CI workflow on Node 18, 20, 22.
- PR + issue templates, CHANGELOG.
