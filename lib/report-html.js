// lib/report-html.js
// HTML report generator with error-bar support.

function htmlReport(results) {
  const scores = results.scores || [];
  const rows = scores.map((s) => {
    const lo = s.ci_low !== undefined ? s.ci_low : s.mean - (s.se || 0) * 1.96;
    const hi = s.ci_high !== undefined ? s.ci_high : s.mean + (s.se || 0) * 1.96;
    return { pid: s.prompt_id, mean: s.mean, lo, hi, n: s.n };
  }).map(({ pid, mean, lo, hi, n }) => `  <tr>
    <td>${pid}</td>
    <td>${mean.toFixed(4)}</td>
    <td>${lo.toFixed(4)}</td>
    <td>${hi.toFixed(4)}</td>
    <td>${n || "-"}</td>
    <td><span class="bar" style="width:${Math.max(0, Math.min(100, mean * 100))}px"></span></td>
  </tr>`).join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>smolbench results</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    table { border-collapse: collapse; width: 100%; max-width: 800px; }
    th, td { border: 1px solid #ccc; padding: 6px 12px; text-align: left; }
    th { background: #f5f5f5; }
    .bar { display: inline-block; height: 12px; background: #4a90e2; }
    .ci-range { font-size: 0.85em; color: #666; }
  </style>
</head>
<body>
  <h1>smolbench results</h1>
  <p>Version: ${results.version || "0.8.0"} &nbsp; Grand mean: ${(results.grand_mean || 0).toFixed(4)}</p>
  <table>
    <thead>
      <tr><th>prompt</th><th>mean</th><th>ci_low</th><th>ci_high</th><th>n</th><th>score bar</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</body>
</html>`;
}

module.exports = { htmlReport };
