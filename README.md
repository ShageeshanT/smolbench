# smolbench

Workload-specific micro-benchmarks for LLM-powered apps. Run YOUR prompts against every provider in your stack, get a leaderboard for YOUR use case, not generic MMLU.

## Why this exists

Public benchmarks (MMLU, MT-Bench, HumanEval) tell you which model is best on someone else's tasks, not yours. smolbench closes that gap.

## Install

\`\`\`bash
git clone https://github.com/ShageeshanT/smolbench.git
cd smolbench
\`\`\`

## Quick start

\`\`\`bash
node ./cli.js init
node ./cli.js run examples/hello.yaml --parallel --cache
node ./cli.js leaderboard runs/hello-*.json
\`\`\`

## Web UI

Runs are written to `runs/` and auto-indexed in `runs/index.json`. The static site under `web/` reads that index and renders a leaderboard. Pages workflow deploys it to GitHub Pages on every master push.

## Status

v0.2.0. Phase 4 (web UI) shipped. Phase 5 close (npm publish, homebrew) pending.

## License

MIT.
