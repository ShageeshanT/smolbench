/**
 * leaderboard.js — sortable columns, provider x prompt grid.
 */

let currentSort = { col: "score", asc: false };
let filteredRuns = [];

function renderLeaderboard(runs) {
  filteredRuns = applyFilters(runs);
  sortRuns();
  const tab = document.getElementById("tab-content");
  if (!tab) return;

  let html = `<table>
    <thead>
      <tr>
        <th data-col="provider">Provider</th>
        <th data-col="model">Model</th>
        <th data-col="suite">Suite</th>
        <th data-col="score">Score</th>
        <th data-col="costUsd">Cost</th>
        <th data-col="latencyMs">Latency</th>
        <th data-col="passed">Status</th>
      </tr>
    </thead>
    <tbody>`;

  if (!filteredRuns.length) {
    html += `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No runs yet. Run `smolbench run` to populate.</td></tr>`;
  }

  for (const r of filteredRuns) {
    const score = r.score != null ? r.score.toFixed(3) : "—";
    const cost = r.costUsd != null ? "$" + r.costUsd.toFixed(4) : "—";
    const latency = r.latencyMs != null ? r.latencyMs + "ms" : "—";
    const badge = r.passed ? `<span class="badge pass">pass</span>`
                 : r.score != null && r.score > 0.5 ? `<span class="badge partial">partial</span>`
                 : `<span class="badge fail">fail</span>`;
    html += `<tr>
      <td>${r.provider ?? "—"}</td>
      <td>${r.model ?? "—"}</td>
      <td>${r.suite ?? "—"}</td>
      <td>${score}</td>
      <td>${cost}</td>
      <td>${latency}</td>
      <td>${badge}</td>
    </tr>`;
  }

  html += `</tbody></table>`;
  tab.innerHTML = html;

  // Header sort clicks
  tab.querySelectorAll("th[data-col]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (currentSort.col === col) currentSort.asc = !currentSort.asc;
      else { currentSort.col = col; currentSort.asc = false; }
      sortRuns();
      renderLeaderboard(runs);
    });
  });
}

function sortRuns() {
  const { col, asc } = currentSort;
  filteredRuns.sort((a, b) => {
    const va = a[col] ?? -Infinity, vb = b[col] ?? -Infinity;
    if (va < vb) return asc ? -1 : 1;
    if (va > vb) return asc ? 1 : -1;
    return 0;
  });
}

function applyFilters(runs) {
  const prov = document.getElementById("provider-filter")?.value;
  const suite = document.getElementById("suite-filter")?.value;
  const search = document.getElementById("search")?.value.toLowerCase() ?? "";
  return runs.filter(r => {
    if (prov && r.provider !== prov) return false;
    if (suite && r.suite !== suite) return false;
    if (search && !(r.provider ?? "").includes(search) && !(r.model ?? "").includes(search) && !(r.suite ?? "").includes(search)) return false;
    return true;
  });
}

function populateFilters(runs) {
  const provSel = document.getElementById("provider-filter");
  const suiteSel = document.getElementById("suite-filter");
  if (!provSel || !suiteSel) return;

  const providers = [...new Set(runs.map(r => r.provider))].sort();
  const suites = [...new Set(runs.map(r => r.suite))].sort();

  providers.forEach(p => { const o = document.createElement("option"); o.value = p; o.textContent = p; provSel.appendChild(o); });
  suites.forEach(s => { const o = document.createElement("option"); o.value = s; o.textContent = s; suiteSel.appendChild(o); });

  // Re-render on filter change
  [provSel, suiteSel, document.getElementById("search")].forEach(el => {
    if (el) el.addEventListener("input", () => renderLeaderboard(runs));
  });
}

window.SMOL.renderLeaderboard = renderLeaderboard;
window.SMOL.populateFilters = populateFilters;
