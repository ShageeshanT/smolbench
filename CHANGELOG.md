# Changelog

All notable changes to smolbench. Format follows Keep a Changelog, dates ISO.

## [0.3.0] - 2026-05-08

### Added

- `lib/retries.js`: exponential backoff retry helper, full jitter, retries on 429 and 5xx.
- Provider adapters now wrap fetch in `withRetries` (3 attempts default, override per provider).
- `smolbench run --providers a,b`: run only the named subset of registered providers.
- `smolbench run --filter id1,id2`: run only the named prompt ids from the suite.
- `smolbench export <run> --format html|csv|md [--out path]`: export a run as a self-contained HTML report, CSV, or markdown.
- `lib/report-html.js`: dark-mode single-file HTML renderer, no CDN.
- `lib/report-csv.js`: CSV exporter with proper field escaping.
- `smolbench validate <suite.yaml>`: schema check on suite YAML, surfaces missing ids, missing prompts, duplicate ids.
- `scripts/npm-publish-dry.sh`: pre-flight pack + tests before `npm publish`.
- `Formula/smolbench.rb`: Homebrew formula for tap install.

### Changed

- Bumped to 0.3.0 to mark Phase 5 close shipping.

## [0.2.0] - 2026-05-07

### Added

- Web UI: index.html, app.js, style.css, dark mode static leaderboard.
- GitHub Pages deploy via `.github/workflows/pages.yml`.
- `lib/version.js`, `smolbench --version`.
- `smolbench run --parallel`, `--cache` flags.
- `runs/index.json` auto regenerated.

## [0.1.0] - 2026-05-06

### Added

- Run, leaderboard, compare, init, cache clear commands.
- Provider adapters (Anthropic, Google, NVIDIA, OpenAI-compat).
- Composite scoring, LLM judge, pricing table, result cache, YAML reader, run diff.
- Real-world suites: hello, code-review, summarisation, classification, extraction.
- Smoke tests, CI workflow, PR + issue templates, CHANGELOG.
