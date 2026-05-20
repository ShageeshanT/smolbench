# Changelog

## 0.8.0 (2026-05-16)

### Added
- `lib/replicate.js` — Run and ReplicatePool classes for managing statistical replicates
- `lib/stats.js` — mean, variance, stdError, welchTTest, pValueFromT
- `lib/ci.js` — t-distribution lookup and confidenceInterval utility
- `lib/bootstrap.js` — resample, bootstrapCI, bootstrapSE for non-parametric CIs
- `lib/effect-size.js` — cohensD, cohensDUnpooled, interpretCohenD
- `lib/power.js` — powerAnalysis and requiredN for sample-size planning
- `lib/output-schema.js` — JSON Schema definitions and validators
- `lib/score.js` — scoreAll emits mean, ci_low, ci_high, n per row
- `lib/judge-ensemble.js` — ensembleVote and ensembleStats with variance reporting
- `lib/report.js` — TextReport and JSONReport generators
- `lib/report-html.js` — HTML report with CI error-bar visualization
- `bin/smolbench.js` — CLI entry point with --replicates, --estimate, --ci, --report flags
- `test/replicate.test.js`, `test/stats.test.js`, `test/bootstrap.test.js`, `test/schema.test.js`
- `docs/statistical-rigor.md` — documentation for all new statistical features

### Changed
- Score rows now include ci_low, ci_high, n, variance per prompt
- CLI supports --replicates N, --estimate, --ci, --report json|html|text

## 0.7.0
