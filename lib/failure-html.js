// lib/failure-html.js
// HTML dashboard for failure diagnostics.

const { summarize } = require("./failure-report");

function failureHtml(records) {
  const s = summarize(records);
  const catRows = Object.entries(s.by_category).map(function (e) {
    return "<tr><td>" + e[0] + "</td><td>" + e[1] + "</td></tr>";
  }).join("\n");
  const provRows = Object.entries(s.by_provider).map(function (e) {
    return "<tr><td>" + e[0] + "</td><td>" + e[1] + "</td></tr>";
  }).join("\n");

  return [
    "<!DOCTYPE html>",
    "<html><head><meta charset=\"utf-8\"><title>smolbench failures</title>",
    "<style>body{font-family:sans-serif;margin:2rem;}",
    "table{border-collapse:collapse;margin-bottom:1.5rem;}",
    "th,td{border:1px solid #ccc;padding:6px 12px;text-align:left;}",
    "th{background:#f5f5f5;}h2{margin-top:1.5rem;}</style></head><body>",
    "<h1>smolbench failures</h1>",
    "<p>Total: " + s.total + " &nbsp; Transient: " + (s.transient_share * 100).toFixed(1) + "%</p>",
    "<h2>By category</h2><table><thead><tr><th>category</th><th>count</th></tr></thead><tbody>",
    catRows,
    "</tbody></table>",
    "<h2>By provider</h2><table><thead><tr><th>provider</th><th>count</th></tr></thead><tbody>",
    provRows,
    "</tbody></table>",
    "</body></html>",
  ].join("\n");
}

module.exports = { failureHtml };
