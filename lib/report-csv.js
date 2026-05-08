// CSV export of ranked run rows.

function escapeField(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function renderCsv(rows) {
  const headers = ["rank", "provider", "model", "promptId", "quality", "cost_usd", "latency_ms", "prompt_tokens", "completion_tokens", "score"];
  const lines = [headers.join(",")];
  rows.forEach((r, i) => {
    lines.push([
      i + 1,
      r.provider,
      r.model,
      r.promptId,
      r.quality ?? "",
      r.cost ?? "",
      r.latencyMs ?? "",
      r.promptTokens ?? "",
      r.completionTokens ?? "",
      r._score?.total ?? "",
    ].map(escapeField).join(","));
  });
  return lines.join("\n") + "\n";
}
