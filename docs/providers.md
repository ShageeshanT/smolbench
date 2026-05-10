# Provider tuning guide

Each provider adapter ships with sensible defaults. Override per provider in your `.smolbench.yaml` or via env.

## Anthropic

\`\`\`yaml
- id: anthropic
  kind: anthropic
  model: claude-haiku-4-5      # or claude-sonnet-4-6, claude-opus-4-7
  apiKey: \$ANTHROPIC_API_KEY  # default
\`\`\`

Costs and limits follow Anthropic's published pricing. Retries are on by default for 429 and 5xx, max 3.

## NVIDIA NIM

\`\`\`yaml
- id: nvidia
  kind: nvidia
  model: meta/llama-3.3-70b-instruct
  apiKey: \$NVIDIA_API_KEY
\`\`\`

The NVIDIA NIM endpoint at `integrate.api.nvidia.com` exposes ~140 models. Slug includes the publisher prefix (e.g. `meta/`, `qwen/`, `deepseek-ai/`).

## Google Gemini

\`\`\`yaml
- id: google
  kind: google
  model: gemini-2.5-flash      # or gemini-2.5-pro
  apiKey: \$GOOGLE_API_KEY
\`\`\`

Uses the OpenAI-compatible endpoint at `generativelanguage.googleapis.com`. Supports JSON mode via `response_format`.

## OpenAI compatible (third party)

Any endpoint that speaks the OpenAI chat completions schema works. Smolbench ships dedicated adapters for the common ones:

\`\`\`yaml
- id: openrouter
  kind: openai-compat
  baseUrl: https://openrouter.ai/api/v1
  model: anthropic/claude-haiku-4-5
  apiKey: \$OPENROUTER_API_KEY

- id: together
  kind: openai-compat
  baseUrl: https://api.together.xyz/v1
  model: meta-llama/Llama-3.3-70B-Instruct
  apiKey: \$TOGETHER_API_KEY

- id: groq
  kind: openai-compat
  baseUrl: https://api.groq.com/openai/v1
  model: llama-3.3-70b-versatile
  apiKey: \$GROQ_API_KEY
\`\`\`

## MiniMax

The MiniMax chat completion endpoint uses a slightly different schema than OpenAI (response includes a `reasoning_content` channel for M2.7). Native adapter coming, for now use the raw HTTP from your own scripts and feed results into a local `smolbench` run via the JSON ingest path.

## Picking a provider

| Task type | Default suggestion |
|---|---|
| Code review, reasoning | Claude Sonnet 4.6 or Opus 4.7 |
| Classification, extraction | Gemini 2.5 Flash, Llama 3.3 70B |
| Summarisation, translation | Claude Haiku 4.5, Llama 3.3 70B |
| Cheapest acceptable | Gemini 2.5 Flash, Llama 3.3 70B on NIM |

Run smolbench against a real workload and trust the leaderboard, not the table.
