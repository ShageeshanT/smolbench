# PLAN.md

## Current milestone: 0.9.0 — Failure categorization + diagnostics

### Theme
Turn noisy benchmark runs into structured failure data so a flaky model is
distinguishable from a misconfigured run, a refusal, or a schema regression.

### Commits (all complete)
- [x] feat(failure): lib/failure-categorizer.js
- [x] feat(failure): lib/diagnostics.js
- [x] feat(failure): lib/failure-store.js
- [x] feat(failure): lib/failure-report.js
- [x] feat(failure): lib/retry-policy.js
- [x] feat(failure): lib/failure-html.js
- [x] feat(failure): lib/runner-hook.js
- [x] feat(cli): bin/smolbench.js failures + diagnose subcommands
- [x] feat(cli): lib/cli.js recognises the new subcommands
- [x] test: failure-categorizer
- [x] test: diagnostics
- [x] test: failure-store
- [x] test: failure-report
- [x] test: retry-policy
- [x] docs: failure-diagnostics.md
- [x] docs: error-taxonomy.md
- [x] chore: version bump and changelog

### Next: 1.0.0 candidate work (batches 18-28 per master schedule)
- Plugin architecture for providers
- Real-world example suites at scale
- GitHub Action wrapper and Marketplace
- TUI live dashboard
- Eval harness importers
- Reproducibility and run provenance
- Regression alerts + baselines
- Multilingual + locale-aware
- Programmatic API + TypeScript defs
- Security hardening
- Docs overhaul + tutorial site + v1.0.0 launch
