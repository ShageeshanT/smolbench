# smolbench

A tiny, honest benchmark for evaluating LLMs on real-world tasks.

[![CI](https://github.com/ShageeshanT/smolbench/actions/workflows/ci.yml/badge.svg)](https://github.com/ShageeshanT/smolbench/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/smolbench?logo=npm)](https://www.npmjs.com/package/smolbench)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/smolbench?logo=npm)](https://www.npmjs.com/package/smolbench)

## Quick start

```bash
npm install -g smolbench
smolbench run examples/test-suite.yaml
smolbench estimate          # show cost-per-call for all providers
smolbench cache stats       # show cache entry counts
```

## Features

- **Cache**: Results cached at `~/.smolbench/cache/` -- re-run without re-executing
- **Cost guards**: `--max-cost $` aborts a run if projected cost exceeds your budget
- **Multilingual suites**: Sinhala, Tamil, Japanese, Spanish, and more
- **Plugin providers**: Bring your own provider via `~/.smolbench/providers/`
- **Statistical rigor**: Replicates, confidence intervals, judge consensus
- **GitHub Action**: Drop into any repo with one line

## Documentation

See [docs/](docs/) for full guides.
