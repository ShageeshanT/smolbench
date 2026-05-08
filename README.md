# smolbench

Workload-specific micro-benchmarks for LLM-powered apps. Run YOUR prompts against every provider in your stack, get a leaderboard for YOUR use case, not generic MMLU.

## Why this exists

Public benchmarks (MMLU, MT-Bench, HumanEval) tell you which model is best on someone else's tasks. They do not tell you which model is best for the prompts your app actually runs. smolbench closes that gap.

You write your prompts. smolbench fans them out across every provider you have configured (OpenAI-compatible, Anthropic, Google, NVIDIA NIM, MiniMax). It records latency, token cost, and an LLM-judge quality score. Output is a per-prompt leaderboard plus a JSON results file you can diff between runs.

## Install

\`\`\`bash
git clone https://github.com/ShageeshanT/smolbench.git
cd smolbench
\`\`\`

(npm publish coming in Phase 5.)

## Quick start

\`\`\`bash
# 1. Scaffold a config in your project
node ./cli.js init

# 2. Edit .smolbench.yaml, set provider keys via env or inline

# 3. Run the bundled hello suite
node ./cli.js run examples/hello.yaml

# 4. Render a leaderboard
node ./cli.js leaderboard runs/hello-*.json

# 5. Compare two runs
node ./cli.js compare runs/hello-old.json runs/hello-new.json
\`\`\`

## Status

Phase 2 + 3 shipped: run, leaderboard, compare, init, cache, diff. Three real-world example suites (hello, code-review, summarisation). Smoke tests via \`node --test\`. See PLAN.md for what is next.

## License

MIT.
