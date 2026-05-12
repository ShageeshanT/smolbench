# smolbench

Workload-specific micro-benchmarks for LLM-powered apps. v0.5.0.

## What you get

- 11 provider adapters: Anthropic, Google, NVIDIA NIM, OpenRouter, Together, Groq, Cohere, Mistral, Perplexity, plus generic OpenAI-compat
- 5 task rubrics (general, code, classification, extraction, summarisation) plus your own under `.smolbench/rubrics/`
- 13 example suites covering hello, code-review, summarisation, classification, extraction, translation, math reasoning, factual recall, RAG grounding, tool use, function calling, sentiment, PII redaction, coding style
- Composite scoring (latency + cost + LLM judge quality), judge ensemble option, cost ceiling guard
- Result cache, retries with backoff, parallel runs, run history (JSONL), trend analysis, regression flagger
- Webhook notifications (Slack, Discord, generic), OpenTelemetry exporter
- Static web UI with provider filter and column sort, GitHub Pages deploy
- HTML, CSV, markdown report exports
- Suite composition (`includes:`), tag filtering, streaming response parser, dotenv loader
- 0 production dependencies. Stdlib only.

## Install

\`\`\`bash
git clone https://github.com/ShageeshanT/smolbench.git
cd smolbench
\`\`\`

## 30-second quick start

\`\`\`bash
node ./cli.js init
export ANTHROPIC_API_KEY=...
export NVIDIA_API_KEY=...
node ./cli.js run examples/hello.yaml --parallel --cache
node ./cli.js leaderboard runs/hello-*.json
node ./cli.js export runs/hello-*.json --format html --out report.html
\`\`\`

Run every example to smoke-test the whole pipeline:

\`\`\`bash
npm run bench:all
\`\`\`

## Docs

- `docs/providers.md`, `docs/PROMPTING.md`, `docs/ADVANCED.md`, `docs/ARCHITECTURE.md`, `docs/FAQ.md`, `docs/SECURITY.md`, `docs/CODE_OF_CONDUCT.md`

## License

MIT.
