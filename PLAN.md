# smolbench plan

Tasks for the incremental commit loop. Each entry is a small, self-contained commit. Move items from unchecked to checked as they ship.

## Phase 1, scaffold (week 1)

- [x] Initial commit (auto_init)
- [x] README.md, why and what
- [x] PLAN.md, this file
- [x] package.json, name, version, license, type=module
- [x] .editorconfig, formatting rules
- [x] lib/types.js, JSDoc typedefs for Prompt, Provider, Result
- [x] lib/registry.js, provider registry singleton
- [x] lib/runner.js, fan-out runner with per-provider try/catch
- [x] lib/providers/openai-compat.js, OpenAI-compat adapter (works for NVIDIA NIM, OpenAI, OpenRouter)
- [x] lib/providers/anthropic.js, Anthropic Messages API adapter
- [x] lib/providers/google.js, Gemini API adapter
- [x] lib/providers/nvidia.js, thin alias over openai-compat with nvidia base url
- [x] cli.js, argv parsing and run command
- [x] examples/hello.yaml, sample prompt suite
- [x] CONTRIBUTING.md, PR shape and commit-style notes

## Phase 2, scoring and cost

- [ ] lib/cost.js, per-model pricing table
- [ ] lib/judge.js, LLM-judge eval with rubric
- [ ] lib/score.js, latency, cost, quality composite
- [ ] cli `compare` command across two runs
- [ ] cli `leaderboard` markdown emitter

## Phase 3, persistence and UX

- [ ] lib/cache.js, hash prompt+model, cache results to ~/.smolbench
- [ ] cli `init` command, .smolbench.yaml scaffolder
- [ ] lib/diff.js, run-over-run diff
- [ ] examples/code-review.yaml, real-world suite
- [ ] examples/summarisation.yaml, real-world suite

## Phase 4, web UI (later)

- [ ] tiny static site that reads runs/*.json and renders a leaderboard
- [ ] GitHub Pages deploy via Actions

## Phase 5, distribution

- [ ] npm publish dry-run
- [ ] semver release notes
- [ ] homebrew formula
