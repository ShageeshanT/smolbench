// Single-file HTML report renderer. No CDN, no JS framework, dark mode.

const CSS = `body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;background:#0d1117;color:#e6edf3;padding:2rem 1rem;max-width:960px;margin-inline:auto;line-height:1.5}h1{margin:0 0 .25rem;font-size:1.75rem;letter-spacing:-.02em}.tag{color:#8b949e;margin:0 0 1.5rem}table{width:100%;border-collapse:collapse;font-size:.92rem}th,td{text-align:left;padding:.55rem .75rem;border-bottom:1px solid #30363d}th{color:#8b949e;font-weight:600}tbody tr:nth-child(odd){background:#161b22}tbody tr.winner td:first-child{color:#22d3ee;font-weight:700}.bar{display:inline-block;height:.6rem;background:#22d3ee;vertical-align:middle;border-radius:2px;opacity:.6}`;

function escape(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

export function renderHtml(run, rankedRows) {
  const rows = rankedRows || run.rows || [];
  const maxScore = Math.max(...rows.map((r) => r._score?.total || 0), 0.0001);
  const tbody = rows.map((r, i) => {
    const q = typeof r.quality === "number" ? r.quality.toFixed(2) : "-";
    const c = typeof r.cost === "number" ? r.cost.toFixed(6) : "-";
    const s = r._score?.total?.toFixed(4) || "-";
    const barW = ((r._score?.total || 0) / maxScore * 100).toFixed(1);
    return `<tr${i === 0 ? ' class="winner"' : ""}><td>${i + 1}</td><td>${escape(r.provider)}</td><td>${escape(r.model)}</td><td>${q}</td><td>${c}</td><td>${r.latencyMs ?? "-"}</td><td>${s} <span class="bar" style="width:${barW}px"></span></td></tr>`;
  }).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>smolbench, ${escape(run.suite || "run")}</title><style>${CSS}</style></head>
<body><h1>${escape(run.suite || "smolbench run")}</h1>
<p class="tag">Generated ${escape(run.at || "")} &middot; ${rows.length} rows</p>
<table><thead><tr><th>Rank</th><th>Provider</th><th>Model</th><th>Quality</th><th>Cost (USD)</th><th>Latency (ms)</th><th>Score</th></tr></thead>
<tbody>${tbody}</tbody></table></body></html>`;
}
