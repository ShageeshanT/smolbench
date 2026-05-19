# Changelog

All notable changes to smolbench. Format follows Keep a Changelog, dates ISO.

## [0.4.0] - 2026-05-09

### Added

- `lib/streaming.js`: SSE parser for OpenAI-compatible streaming responses, async iterator of content deltas.
- `lib/suite-compose.js`: suites can `include:` other suites by relative path, ids namespaced `<suite>::<id>`, cycles rejected.
- `lib/runs-db.js`: JSONL run history at `.smolbench/runs.jsonl`, append per run.
- `lib/trends.js`: per-(provider, model) series + first-vs-last regression flagger.
- `lib/notify.js`: webhook poster for Slack, Discord, generic. Includes `summarise()` helper.
- New providers: Cohere (native chat shape), Mistral (OpenAI-compat), Perplexity (OpenAI-compat).
- New example suites: rag-grounding, tool-use, function-calling.
- New tests: streaming SSE parser, suite compose, notify summarise, trends regression.
- New docs: `docs/ADVANCED.md` (streaming, composition, history, webhooks, ceilings), `docs/ARCHITECTURE.md`.
- `scripts/bench.sh`: one-shot local benchmark wrapper, runs + leaderboards.
- `npm run bench` shortcut.

## [0.3.0] - 2026-05-08

(see batch 2 for full notes)

## [0.2.0] - 2026-05-07

(see batch 1 for full notes)

## [0.1.0] - 2026-05-06

(see initial release)
