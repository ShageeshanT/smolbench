# smolbench

Workload-specific micro-benchmarks for LLM-powered apps. Run YOUR prompts against every provider in your stack, get a leaderboard for YOUR use case, not generic MMLU.

## Why this exists

Public benchmarks (MMLU, MT-Bench, HumanEval) tell you which model is best on someone else's tasks. They do not tell you which model is best for the prompts your app actually runs. smolbench closes that gap.

## Install

\`\`\`bash
git clone https://github.com/ShageeshanT/smolbench.git
cd smolbench
\`\`\`

Or via Homebrew (requires repo tag):

\`\`\`bash
brew tap ShageeshanT/smolbench https://github.com/ShageeshanT/smolbench.git
brew install smolbench
\`\`\`

## Quick start

\`\`\`bash
node ./cli.js init
node ./cli.js run examples/hello.yaml --parallel --cache
node ./cli.js leaderboard runs/hello-*.json
node ./cli.js export runs/hello-*.json --format html --out report.html
\`\`\`

## Commands

| Command | What it does |
|---|---|
| `run <suite.yaml> [--parallel] [--cache] [--providers a,b] [--filter id1,id2]` | Execute a suite, write run JSON |
| `leaderboard <run.json>` | Markdown leaderboard ranked by composite score |
| `compare <a.json> <b.json>` | Per-prompt latency / cost / quality deltas |
| `export <run.json> --format html|csv|md [--out path]` | Export run as HTML, CSV, or markdown |
| `validate <suite.yaml>` | Schema-check a suite |
| `init` | Scaffold `.smolbench.yaml` in cwd |
| `cache clear` | Drop the on-disk result cache |
| `--version` | Print version |

## Web UI

Runs are auto indexed in `runs/index.json`. The static site under `web/` reads that index. The Pages workflow deploys it on master push, live at `https://shageeshant.github.io/smolbench/`.

## Status

v0.3.0. Phases 1 through 5 shipped. See CHANGELOG and PLAN.md.

## License

MIT.
