/**
 * filters.js — filter runs by provider, suite, tag.
 */

function getFilterState() {
  return {
    provider: document.getElementById("provider-filter")?.value ?? "",
    suite: document.getElementById("suite-filter")?.value ?? "",
    search: document.getElementById("search")?.value ?? "",
  };
}

function applyFiltersToRuns(runs) {
  const { provider, suite, search } = getFilterState();
  return runs.filter(r => {
    if (provider && r.provider !== provider) return false;
    if (suite && r.suite !== suite) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(r.provider ?? "").includes(s) && !(r.model ?? "").includes(s) && !(r.suite ?? "").includes(s)) return false;
    }
    return true;
  });
}

function updateSummaryCards(runs) {
  const section = document.getElementById("summary-cards");
  if (!section) return;
  const filtered = applyFiltersToRuns(runs);
  const sum = window.SMOL.summariseRunsFiltered ? window.SMOL.summariseRunsFiltered(filtered) : {
    total: filtered.length,
    avgScore: filtered.length ? (filtered.reduce((s, r) => s + (r.score ?? 0), 0) / filtered.length) : 0,
    avgCost: filtered.length ? (filtered.reduce((s, r) => s + (r.costUsd ?? 0), 0) / filtered.length) : 0,
    passRate: filtered.length ? (filtered.filter(r => r.passed).length / filtered.length * 100) : 0,
  };

  section.innerHTML = `
    <div class="card"><div class="label">Runs</div><div class="value">${sum.total}</div></div>
    <div class="card"><div class="label">Avg Score</div><div class="value green">${sum.avgScore.toFixed(3)}</div></div>
    <div class="card"><div class="label">Avg Cost</div><div class="value yellow">$${sum.avgCost.toFixed(4)}</div></div>
    <div class="card"><div class="label">Pass Rate</div><div class="value ${sum.passRate > 80 ? 'green' : sum.passRate > 50 ? 'yellow' : 'red'}">${sum.passRate.toFixed(1)}%</div></div>
  `;
}

window.SMOL.getFilterState = getFilterState;
window.SMOL.applyFiltersToRuns = applyFiltersToRuns;
window.SMOL.updateSummaryCards = updateSummaryCards;
