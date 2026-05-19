# smolbench plan

## Phase 1 to 6: shipped (see CHANGELOG)

## Phase 7, ensemble and observability
- [x] judge ensemble across multiple judges
- [x] OpenTelemetry OTLP/HTTP exporter
- [x] dotenv loader
- [x] tag-based prompt filtering
- [x] custom rubric loader for project-local rubrics
- [x] config schema validator
- [x] sentiment, pii-redaction, coding-style example suites
- [x] run-all-examples and prune-history scripts
- [x] SECURITY.md and CODE_OF_CONDUCT.md
- [x] 0.5.0 release

## Phase 8, ideas pool

- [ ] Prometheus textfile exporter from runs.jsonl
- [ ] Grafana dashboard JSON for trend visualisation
- [ ] CLI `tags` subcommand to list and filter
- [ ] CLI `bench-against` to A/B a model swap on a saved suite
- [ ] CLI `compare-trends` over runs.jsonl
- [ ] OAuth2 token refresh for private endpoints
- [ ] Suite hot-reload during long runs
- [ ] Per-prompt latency histograms in the web UI
- [ ] Persistent run database via SQLite (currently JSONL)
