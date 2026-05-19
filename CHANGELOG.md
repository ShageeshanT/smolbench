# Changelog

## [0.5.0] - 2026-05-10

### Added

- `lib/judge-ensemble.js`: average score across multiple judge models, gracefully drops failing judges from the mean.
- `lib/otel-export.js`: OpenTelemetry OTLP/HTTP JSON exporter, one span per result row, smolbench attributes attached.
- `lib/dotenv.js`: tiny .env loader (stdlib, no quote magic, does not overwrite existing env).
- `lib/tags.js`: filter prompts by `meta.tags`, list all tags across a suite.
- `lib/rubric-loader.js`: project-local rubrics under `.smolbench/rubrics/<task>.txt` override built-ins.
- `lib/config-schema.js`: structural validator for `.smolbench.yaml` (kinds, ids, weights, baseUrl).
- New example suites: sentiment, pii-redaction, coding-style.
- New tests: judge-ensemble, dotenv, tags, config-schema, otel-export.
- New scripts: `run-all-examples.sh`, `prune-history.sh`.
- New docs: `docs/SECURITY.md`, `docs/CODE_OF_CONDUCT.md`.

## [0.4.0] - 2026-05-09 (see batch 3 staging)

## [0.3.0] - 2026-05-08 (see batch 2 staging)

## [0.2.0] - 2026-05-07 (web UI)

## [0.1.0] - 2026-05-06 (initial)
