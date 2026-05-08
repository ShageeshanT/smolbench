# smolbench plan

Tasks for the incremental commit loop. Each entry is a small, self-contained commit.

## Phase 1, scaffold (week 1)

- [x] Initial commit (auto_init)
- [x] README.md, why and what
- [x] PLAN.md, this file
- [x] package.json, name, version, license, type=module
- [x] .editorconfig, formatting rules
- [x] lib/types.js, JSDoc typedefs for Prompt, Provider, Result
- [x] lib/registry.js, provider registry singleton
- [x] lib/runner.js, fan-out runner with per-provider try/catch
- [x] lib/providers/openai-compat.js, OpenAI-compat adapter
- [x] lib/providers/anthropic.js, Anthropic Messages API adapter
- [x] lib/providers/google.js, Gemini API adapter
- [x] lib/providers/nvidia.js, thin alias over openai-compat
- [x] cli.js, argv parsing and run command
- [x] examples/hello.yaml, sample prompt suite
- [x] CONTRIBUTING.md, PR shape and commit-style notes

## Phase 2, scoring and cost

- [x] lib/cost.js, per-model pricing table
- [x] lib/judge.js, LLM-judge eval with rubric
- [x] lib/score.js, latency, cost, quality composite
- [x] cli compare command across two runs
- [x] cli leaderboard markdown emitter

## Phase 3, persistence and UX

- [x] lib/cache.js, hash prompt+model, cache results to ~/.smolbench
- [x] cli init command, .smolbench.yaml scaffolder
- [x] lib/diff.js, run-over-run diff
- [x] examples/code-review.yaml, real-world suite
- [x] examples/summarisation.yaml, real-world suite
- [x] test/smoke.test.js, node --test smoke coverage
- [x] cli cache clear subcommand

## Phase 4, web UI

- [ ] web/index.html, static leaderboard renderer
- [ ] web/app.js, loads runs/*.json and renders
- [ ] web/style.css, dark mode, minimal
- [ ] GitHub Pages deploy via Actions

## Phase 5, distribution

- [ ] CHANGELOG.md, semver release notes
- [ ] .github/workflows/ci.yml, run smoke tests on push
- [ ] .github/PULL_REQUEST_TEMPLATE.md
- [ ] .github/ISSUE_TEMPLATE/bug.md
- [ ] .github/ISSUE_TEMPLATE/feature.md
- [ ] examples/classification.yaml, real-world suite
- [ ] examples/extraction.yaml, JSON extraction suite
- [ ] lib/format.js, text formatting helpers
- [ ] npm publish dry-run
- [ ] homebrew formula
