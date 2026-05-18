// lib/failure-report.js
// Summarize failure counts and patterns from diagnostic records.

function groupBy(records, key) {
  const out = {};
  for (const r of records) {
    const k = r[key] || "unknown";
    if (!out[k]) out[k] = [];
    out[k].push(r);
  }
  return out;
}

function summarize(records) {
  const byCategory = groupBy(records, "category");
  const byProvider = groupBy(records, "provider");
  const byPrompt = groupBy(records, "prompt_id");
  const total = records.length;
  const transient = records.filter(function (r) {
    return r.category === "timeout" || r.category === "rate_limit" || r.category === "network_error";
  }).length;
  return {
    total,
    by_category: Object.fromEntries(Object.entries(byCategory).map(function (e) { return [e[0], e[1].length]; })),
    by_provider: Object.fromEntries(Object.entries(byProvider).map(function (e) { return [e[0], e[1].length]; })),
    top_prompts: Object.entries(byPrompt).sort(function (a, b) { return b[1].length - a[1].length; }).slice(0, 5)
      .map(function (e) { return { prompt_id: e[0], count: e[1].length }; }),
    transient_share: total ? transient / total : 0,
  };
}

function textReport(records) {
  const s = summarize(records);
  const lines = [];
  lines.push("smolbench failure report");
  lines.push("========================");
  lines.push("");
  lines.push("total failures : " + s.total);
  lines.push("transient share: " + (s.transient_share * 100).toFixed(1) + "%");
  lines.push("");
  lines.push("by category:");
  for (const e of Object.entries(s.by_category)) lines.push("  " + e[0].padEnd(20) + " " + e[1]);
  lines.push("");
  lines.push("by provider:");
  for (const e of Object.entries(s.by_provider)) lines.push("  " + e[0].padEnd(20) + " " + e[1]);
  if (s.top_prompts.length) {
    lines.push("");
    lines.push("top failing prompts:");
    for (const p of s.top_prompts) lines.push("  " + p.prompt_id.padEnd(20) + " " + p.count);
  }
  return lines.join("\n");
}

module.exports = { groupBy, summarize, textReport };
