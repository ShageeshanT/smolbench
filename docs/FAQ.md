# FAQ

## Why not just use existing benchmarks?

MMLU, MT-Bench, HumanEval grade general capability. They tell you which model is "smart" on average. They do not tell you which model is best for the specific prompts your app sends. smolbench fills that gap with your own prompts.

## Why no SaaS, no dashboard, no signup?

Three reasons. (1) Your prompts are often confidential and you should not be uploading them anywhere. (2) Adding SaaS adds account creation, billing, account permissions, none of which the core benchmark needs. (3) The fastest path from prompt change to leaderboard is a local CLI.

## How accurate is the LLM judge?

Calibrated on its own rubric, the judge is fairly consistent within a single model and run. Across models, scoring drifts. Use the judge for relative ranking, not absolute correctness scoring. For high-stakes evaluation, pair it with a human-reviewed gold set on a subset of prompts.

## Will my prompts leak?

Locally, no. The CLI keeps prompts on disk. Across providers: yes, by definition. Each prompt goes to whichever provider you call. Use the cache to avoid re-sending identical prompts. If a prompt is sensitive, do not include the actual sensitive content in the suite, mock it.

## Why no streaming?

Coming in Phase 6. Streaming changes the latency measurement (time to first token vs time to full completion) and adds API surface. We are doing it carefully.

## Can I add my own provider?

Yes. The simplest case is OpenAI-compatible: pass kind `openai-compat` with your baseUrl and model. For non-compatible APIs, copy `lib/providers/anthropic.js` and adapt to your provider's request/response shape. Five files exist as templates: `anthropic.js`, `google.js`, `nvidia.js`, `openrouter.js`, `together.js`, `groq.js`.

## Why is the cost in USD?

Provider pricing is published in USD. Convert on your side if needed. The pricing table in `lib/cost.js` is approximate and may lag, override with your own table for tighter numbers.
