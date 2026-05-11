# Architecture

A short tour of how smolbench is laid out so contributors do not have to spelunk.

## Directory layout

\`\`\`
cli.js                 entry, dispatches subcommands
lib/
  registry.js          provider Map, register/list/get/clear
  runner.js            fan-out across providers, sequential or parallel
  cost.js              pricing table + costFor()
  score.js             composite scoring + rankRows()
  judge.js             LLM-as-judge harness
  judge-rubrics.js     per-task rubrics (general, code, classification, ...)
  cache.js             SHA keyed result cache at ~/.smolbench/cache
  cost-ceiling.js      cumulative spend guard
  diff.js              run-over-run diff
  yaml.js              minimal stdlib YAML reader
  retries.js           exponential backoff helper
  streaming.js         SSE parser for streaming providers
  suite-compose.js     suite-level includes
  runs-db.js           JSONL run history
  trends.js            per-(provider, model) series + regression flags
  notify.js            Slack/Discord/generic webhook poster
  report-html.js       single-file dark mode HTML report
  report-csv.js        CSV exporter
  doctor.js            config self-diagnostic
  status.js            registered providers + cache stats
  version.js           version resolver
  format.js            small text helpers
  providers/           one file per adapter, all return {id, model, call(prompt)}
test/                  node --test smoke tests
examples/              reference prompt suites
runs/                  output dir for run JSONs (auto)
web/                   static leaderboard UI
docs/                  guides
.github/               CI, Pages, templates
\`\`\`

## Data flow per run

1. `cli.js cmdRun` reads `.smolbench.yaml` config, registers providers.
2. `parseYaml` reads the suite.
3. Optional filters (`--providers`, `--filter`) trim the matrix.
4. `runner.runSuite` loops prompts, fans across providers (parallel or sequential).
5. Each provider's `call(prompt)` returns `{text, latencyMs, promptTokens, completionTokens}`.
6. (Optional) `judge.judge` scores each row, attaching `quality`.
7. (Optional) `cost-ceiling` aborts mid-run if cumulative cost exceeds the ceiling.
8. Final rows written to `runs/<suite>-<ts>.json` and indexed in `runs/index.json`.
9. (Optional) `runs-db.record` appends a compact summary to the JSONL history.

## Extension points

- New provider: copy `lib/providers/anthropic.js`, swap the request/response shape, register with kind in `.smolbench.yaml`.
- New rubric: add an entry to `RUBRICS` in `lib/judge-rubrics.js` keyed by task.
- New report format: add `lib/report-<fmt>.js` exporting a render function, wire into `cmdExport` in `cli.js`.
- New webhook target: add a kind to `KIND_TO_FIELD` in `lib/notify.js` if the payload field name differs.

## Why stdlib only

Two reasons. First, `npm install` is a security and supply-chain pain even for benchmark code. Second, every dep is a hostage for the long-term health of the project. Stdlib means the same checkout works in 5 years.

The cost is reinventing small wheels (YAML reader, SSE parser). Fine.
