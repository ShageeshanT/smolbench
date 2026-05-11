# smolbench

Workload-specific micro-benchmarks for LLM-powered apps. Run YOUR prompts against every provider in your stack, get a leaderboard for YOUR use case, not generic MMLU.

## What is here

- 8 provider adapters: Anthropic, Google, NVIDIA NIM, OpenAI-compat, OpenRouter, Together, Groq, Cohere, Mistral, Perplexity
- 5 task types with calibrated judge rubrics: general, code, classification, extraction, summarisation
- 8 example suites: hello, code-review, summarisation, classification, extraction, translation, math-reasoning, factual-recall, rag-grounding, tool-use, function-calling
- Composite scoring: latency + cost + LLM-judge quality
- Result cache, retries with backoff, parallel runs, cost ceilings
- Run history (JSONL) + trends + regression flagger
- Webhook notifications (Slack, Discord, generic)
- Static web UI with provider filter and column sort
- HTML, CSV, markdown report exports
- Suite composition (`includes:`)
- Streaming response parser (SSE) for sub-second feedback

## Install

\`\`\`bash
git clone https://github.com/ShageeshanT/smolbench.git
cd smolbench
\`\`\`

Or via Homebrew tap (after a tagged release):

\`\`\`bash
brew tap ShageeshanT/smolbench https://github.com/ShageeshanT/smolbench.git
brew install smolbench
\`\`\`

## 30-second quick start

\`\`\`bash
node ./cli.js init                                            # scaffold .smolbench.yaml
export ANTHROPIC_API_KEY=...
export NVIDIA_API_KEY=...
node ./cli.js run examples/hello.yaml --parallel --cache     # execute
node ./cli.js leaderboard runs/hello-*.json                  # markdown
node ./cli.js export runs/hello-*.json --format html --out report.html
\`\`\`

## Status

v0.4.0. Phases 1 to 6 shipped. See `CHANGELOG.md` and `PLAN.md`.

## Docs

- `docs/providers.md` per-provider tuning
- `docs/PROMPTING.md` suite authoring
- `docs/ADVANCED.md` streaming, history, webhooks, composition
- `docs/ARCHITECTURE.md` directory tour and extension points
- `docs/FAQ.md`

## License

MIT.
