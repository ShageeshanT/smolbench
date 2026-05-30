// lib/report-html.js
// HTML report generator with ranked run support and legacy score summaries.

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNumber(value, digits = 4) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "";
}

function renderHtml(meta = {}, rows = []) {
  const ranked = [...(rows || [])].sort((a, b) => (a._score?.total ?? Infinity) - (b._score?.total ?? Infinity));
  const body = ranked.map((row, index) => {
    const rank = index + 1;
    const winnerClass = rank === 1 ? ' class="winner"' : "";
    return `  <tr${winnerClass}>
    <td>${rank}</td>
    <td>${escapeHtml(row.provider)}</td>
    <td>${escapeHtml(row.model)}</td>
    <td>${escapeHtml(row.promptId ?? row.prompt_id)}</td>
    <td>${formatNumber(row.quality)}</td>
    <td>${formatNumber(row.cost ?? row.costUsd, 6)}</td>
    <td>${formatNumber(row.latencyMs ?? row.durationMs, 0)}</td>
    <td>${formatNumber(row._score?.total)}</td>
  </tr>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>smolbench, ${escapeHtml(meta.suite || "results")}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; background: #0f172a; color: #e2e8f0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border-bottom: 1px solid #334155; padding: 0.55rem; text-align: left; }
    th { color: #93c5fd; }
    .winner { background: rgba(34, 197, 94, 0.14); }
  </style>
</head>
<body>
  <h1>smolbench, ${escapeHtml(meta.suite || "results")}</h1>
  <p>Generated: ${escapeHtml(meta.at || new Date().toISOString())}</p>
  <table>
    <thead><tr><th>rank</th><th>provider</th><th>model</th><th>prompt</th><th>quality</th><th>cost</th><th>latency ms</th><th>score</th></tr></thead>
    <tbody>
${body}
    </tbody>
  </table>
</body>
</html>`;
}

function htmlReport(results = {}) {
  const scores = results.scores || [];
  const rows = scores.map((score) => ({
    provider: results.provider || "summary",
    model: results.model || "aggregate",
    promptId: score.prompt_id,
    quality: score.mean,
    _score: { total: 1 - Number(score.mean || 0) },
  }));
  return renderHtml({ suite: results.suite || "results", at: results.at }, rows);
}

module.exports = { escapeHtml, htmlReport, renderHtml };
