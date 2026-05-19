# PLAN.md

## Current milestone: 0.8.0 — Statistical rigor

### Theme
Add replicates, confidence intervals, schema validation, and structured reporting so benchmark scores are statistically sound and comparable.

### Commits (all complete)
- [x] feat(replicate): Run and ReplicatePool classes
- [x] feat(stats): mean, variance, stdError, welchTTest
- [x] feat(ci): t-distribution lookup and confidence intervals
- [x] feat(bootstrap): resample, bootstrapCI, bootstrapSE
- [x] feat(effect): Cohen's d calculation
- [x] feat(power): powerAnalysis and requiredN
- [x] feat(schema): output-schema with JSON Schema validators
- [x] feat(score): extend score.js to emit ci_low, ci_high, n
- [x] feat(ensemble): ensemble variance reporting
- [x] feat(report): TextReport and JSONReport
- [x] feat(report-html): HTML report with error bars
- [x] feat(cli): --replicates, --estimate, --ci, --report
- [x] test: replicate, stats, bootstrap, schema
- [x] docs: statistical-rigor.md
- [x] chore: version bump and changelog

### Next: 0.9.0
- Structured JSON output for CI dashboard integration
- Persistent result storage (SQLite)
- Web UI for browsing results
