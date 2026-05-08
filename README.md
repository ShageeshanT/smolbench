# smolbench

Workload-specific micro-benchmarks for LLM-powered apps. Run YOUR prompts against every provider in your stack, get a leaderboard for YOUR use case, not generic MMLU.

## Why this exists

Public benchmarks (MMLU, MT-Bench, HumanEval) tell you which model is best on someone else's tasks. They do not tell you which model is best for the prompts your app actually runs. smolbench closes that gap.

You write your prompts. smolbench fans them out across every provider you have configured (OpenAI-compatible, Anthropic, Google, NVIDIA NIM, MiniMax, more). It records latency, token cost, and an LLM-judge quality score. Output is a per-prompt leaderboard plus a JSON results file you can diff between runs.

## Status

Pre-alpha. Building in the open, lil by lil.

## License

MIT.
