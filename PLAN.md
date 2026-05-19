# smolbench plan

## Phase 1, scaffold
- [x] all complete

## Phase 2, scoring and cost
- [x] all complete

## Phase 3, persistence and UX
- [x] all complete

## Phase 4, web UI
- [x] all complete

## Phase 5, distribution and quality
- [x] all complete (Homebrew formula, npm publish dry-run, retries, --providers, --filter, export, validate)

## Phase 6, advanced features
- [x] streaming response parser (lib/streaming.js)
- [x] suite composition with includes (lib/suite-compose.js)
- [x] persistent run history (lib/runs-db.js, JSONL)
- [x] trend analysis across runs (lib/trends.js)
- [x] webhook notifications (lib/notify.js, Slack + Discord + generic)
- [x] additional providers: Cohere, Mistral, Perplexity
- [x] real-world suites: rag-grounding, tool-use, function-calling
- [x] docs/ADVANCED.md, docs/ARCHITECTURE.md
- [x] scripts/bench.sh local quick bench
- [x] 0.4.0 release

## Phase 7, ideas pool

- [ ] judge ensemble: average score across 2 or 3 judge models
- [ ] cost ceiling enforced inside the runner (currently lib only)
- [ ] suite hot-reload during long runs
- [ ] Grafana / Prometheus exporter from runs-db
- [ ] per-prompt latency histogram in the web UI
- [ ] CLI `compare-trends` command using lib/trends
- [ ] `smolbench bench-against` to A/B a model swap on a specific suite
- [ ] OAuth/PAT support for private model endpoints
