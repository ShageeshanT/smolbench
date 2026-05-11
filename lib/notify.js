// Webhook notifier. Sends a markdown-formatted summary to Slack, Discord, or
// any generic webhook that accepts {text} or {content} JSON.

const KIND_TO_FIELD = { slack: "text", discord: "content", generic: "text" };

export async function notify(webhookUrl, summary, kind = "generic") {
  const field = KIND_TO_FIELD[kind] || "text";
  const body = JSON.stringify({ [field]: summary });
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`webhook ${res.status}: ${text.slice(0, 200)}`);
  }
  return { ok: true, status: res.status };
}

/**
 * Build a compact summary line for posting. Pass a ranked rows array.
 */
export function summarise(suite, ranked) {
  if (!ranked.length) return `*${suite}*: no rows`;
  const top = ranked[0];
  const q = typeof top.quality === "number" ? top.quality.toFixed(2) : "?";
  const c = typeof top.cost === "number" ? top.cost.toFixed(6) : "?";
  return `*smolbench: ${suite}*\n` +
    `Winner: ${top.provider} ${top.model} (q=${q}, cost=\$${c}, latency=${top.latencyMs ?? "?"}ms)\n` +
    `Rows: ${ranked.length}`;
}
