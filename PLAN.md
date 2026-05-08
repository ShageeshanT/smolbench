# smolbench plan

Tasks for the incremental commit loop. Each entry is a small, self-contained commit.

## Phase 1, scaffold

- [x] Initial commit (auto_init)
- [x] README.md
- [x] PLAN.md
- [x] package.json
- [x] .editorconfig
- [x] lib/types.js, lib/registry.js, lib/runner.js
- [x] lib/providers/{openai-compat, anthropic, google, nvidia}.js
- [x] cli.js
- [x] examples/hello.yaml
- [x] CONTRIBUTING.md

## Phase 2, scoring and cost

- [x] lib/cost.js, lib/judge.js, lib/score.js
- [x] cli compare command
- [x] cli leaderboard markdown emitter

## Phase 3, persistence and UX

- [x] lib/cache.js
- [x] cli init command
- [x] lib/diff.js
- [x] examples/code-review.yaml, examples/summarisation.yaml
- [x] test/smoke.test.js
- [x] cli cache clear subcommand

## Phase 4, web UI

- [x] web/index.html, static leaderboard renderer
- [x] web/app.js, loads runs/*.json and renders
- [x] web/style.css, dark mode, minimal
- [x] GitHub Pages deploy via Actions
- [x] runs/index.json auto regenerated after each run
- [x] runner parallel mode
- [x] runner cache integration
- [x] cli --version flag
- [x] cli compare uses lib/diff.js

## Phase 5, distribution

- [x] CHANGELOG.md
- [x] .github/workflows/ci.yml
- [x] .github/PULL_REQUEST_TEMPLATE.md
- [x] .github/ISSUE_TEMPLATE/{bug, feature}.md
- [x] examples/classification.yaml, examples/extraction.yaml
- [x] lib/format.js
- [ ] npm publish dry-run (Phase 5 close)
- [ ] homebrew formula
