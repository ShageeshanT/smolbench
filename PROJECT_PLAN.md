# smolbench Project Plan

## Goal
Turn smolbench from a promising benchmark scaffold into a genuinely runnable, publishable LLM benchmark CLI for small model and provider comparisons.

## Current State
- The repository has strong documentation, examples, diagnostics, retry, scoring, cost, and dashboard modules.
- The CLI is mostly a stub: `run` and `report` print simple messages instead of executing full workflows.
- Runtime module style is inconsistent: some files use CommonJS while others use ES modules.
- `package.json` references `index.js`, but the file is currently missing.
- The README references `examples/test-suite.yaml`, which does not exist.
- `npm test` only runs a subset of tests.

## Product Definition
smolbench should provide:
1. A CLI that can run benchmark suites from YAML.
2. Provider adapters for local/mock providers and API providers.
3. Honest scoring with replicates, confidence intervals, and judge rubrics.
4. Cost, latency, and quality reporting.
5. Failure diagnostics and retry classification.
6. Exportable JSON, text, HTML, and dashboard-ready run artifacts.
7. CI-tested examples that work without paid API keys through a mock provider.

## Milestones

### Milestone 1: Runtime Foundation
- Pick one module system and standardize the repo.
- Fix `package.json` entry points and CLI bin configuration.
- Add or repair `index.js` exports.
- Ensure all test files run under one command.
- Fix README commands to use real example files.

### Milestone 2: Runnable CLI
- Implement `smolbench run <suite.yaml>`.
- Parse YAML suites.
- Load provider config.
- Execute prompts.
- Store run artifacts under `runs/`.
- Print a useful terminal summary.
- Add `--provider mock` for zero-key local demos.

### Milestone 3: Reports
- Implement `smolbench report <run-file>`.
- Support text, JSON, CSV, and HTML report formats.
- Include cost, latency, score, provider, model, suite, and run metadata.
- Add `smolbench failures` and `smolbench diagnose` integration with real run IDs.

### Milestone 4: Providers
- Harden OpenAI-compatible provider adapter.
- Add provider config validation.
- Support environment variables through `.env`.
- Add mock provider for tests and demos.
- Add clear errors for missing API keys, bad models, rate limits, and invalid provider responses.

### Milestone 5: Scoring and Rigor
- Wire scoring into the runner.
- Support deterministic exact-match and rubric-based evaluation.
- Support replicates.
- Compute confidence intervals and effect sizes.
- Add regression detection across previous runs.

### Milestone 6: Dashboard
- Generate dashboard-compatible run data.
- Improve dashboard loading from `runs/index.json`.
- Add leaderboard, cost-quality scatter, latency CDF, and run diff flows.
- Document GitHub Pages deployment.

### Milestone 7: Release Polish
- Clean root-level achievement and one-off scripts into an archive or scripts folder.
- Add complete CI coverage.
- Add npm publish dry-run verification.
- Add security notes for API keys.
- Update docs and examples.
- Prepare v1.0.0 release checklist.

## Daily Commit Strategy
Each daily work session should create 20 to 30 meaningful commits, pushed to `ShageeshanT/smolbench`.

Commit batches should usually follow this order:
1. Inspect current repo state and sync from origin.
2. Pick a milestone section.
3. Make small, focused code or documentation changes.
4. Run relevant tests after each few commits.
5. Run full test suite before pushing.
6. Push commits to the repo.
7. Notify Shagee with commit count, test result, pushed branch, and next priorities.

## Definition of Done
smolbench is considered finished when:
- A new user can install it and run a benchmark with a mock provider in under 2 minutes.
- Real providers work through documented config.
- Run artifacts are saved and reportable.
- Dashboard can visualize produced runs.
- Full CI passes.
- Documentation matches real commands.
- No placeholder CLI paths remain for core flows.

## First Implementation Targets
1. Fix package entry points.
2. Standardize module system.
3. Add full test runner.
4. Add mock provider.
5. Implement real `run` command for `examples/hello.yaml`.
6. Implement real `report` command for generated run JSON.
7. Update README quick start.
