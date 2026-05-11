# Advanced topics

## Streaming responses

Providers that support SSE streaming can emit deltas as they arrive. The `lib/streaming.js` parser turns a Response.body into an async iterator of content strings.

\`\`\`js
import { parseSse } from "smolbench/lib/streaming.js";
const res = await fetch(url, { method: "POST", body: JSON.stringify({ ...payload, stream: true }) });
let full = "";
for await (const delta of parseSse(res.body)) {
  process.stdout.write(delta);
  full += delta;
}
\`\`\`

Streaming changes what "latency" means: time-to-first-token is often more useful than total latency for chat UI workloads. Score on whichever your app cares about.

## Suite composition

A suite can include other suites:

\`\`\`yaml
suite: full-coverage
includes:
  - hello.yaml
  - code-review.yaml
prompts:
  - id: extra
    user: One more for the road.
\`\`\`

Included prompt ids are namespaced `<suite>::<id>` to avoid collisions. Cycles are detected and rejected.

## Run history and trends

Every run can be appended to a JSONL log at `.smolbench/runs.jsonl`. The `lib/trends.js` module then computes per-(provider, model) series for any suite.

\`\`\`js
import { record } from "smolbench/lib/runs-db.js";
import { series, regressionSummary } from "smolbench/lib/trends.js";

record(myRun);
const flagged = regressionSummary({ suite: "my-app" });
\`\`\`

## Webhooks

Pipe leaderboard summaries to Slack or Discord with `lib/notify.js`:

\`\`\`js
import { notify, summarise } from "smolbench/lib/notify.js";
import { rankRows } from "smolbench/lib/score.js";
await notify(SLACK_WEBHOOK, summarise("my-app", rankRows(run.rows)), "slack");
\`\`\`

## Cost ceilings

Pass a `makeCostGuard(ceilingUsd)` into your runner wrapper, abort if `exceeded` flips.

\`\`\`js
import { makeCostGuard } from "smolbench/lib/cost-ceiling.js";
const guard = makeCostGuard(0.50); // 50 cents max per run
\`\`\`

Useful for not-quite-prod evaluation that runs against expensive models.
