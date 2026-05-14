/**
 * diff.js — two runs side by side.
 */

let selectedRuns = [];

function renderDiff(runs) {
  const tab = document.getElementById("tab-content");
  if (!tab) return;

  if (selectedRuns.length < 2) {
    // Run selector UI
    const grouped = {};
    runs.forEach(r => {
      const key = r.provider + "/" + r.model;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    let html = `<p style="margin-bottom:1rem;color:var(--text-muted)">Select two runs to compare:</p><div class="diff-side">`;

    Object.entries(grouped).slice(0, 2).forEach(([key, runGroup]) => {
      const latest = runGroup[runGroup.length - 1];
      html += `<div class="diff-panel">
        <div class="provider">${key}</div>
        <div class="diff-score">${latest.score?.toFixed(3) ?? "—"}</div>
        <div style="margin-top:0.5rem;color:var(--text-muted);font-size:12px">Suite: ${latest.suite}</div>
        <div style="color:var(--text-muted);font-size:12px">Cost: $${latest.costUsd?.toFixed(4) ?? "—"}</div>
        <div style="color:var(--text-muted);font-size:12px">Latency: ${latest.latencyMs ?? "—"}ms</div>
        <button class="tab" style="margin-top:0.75rem" onclick="window.SMOL.selectDiff('0')">Use this</button>
      </div>`;
    });

    html += `</div>`;
    tab.innerHTML = html;
    return;
  }

  const [a, b] = selectedRuns;
  const diff = {
    score: (a.score ?? 0) - (b.score ?? 0),
    cost: (a.costUsd ?? 0) - (b.costUsd ?? 0),
    latency: (a.latencyMs ?? 0) - (b.latencyMs ?? 0),
  };

  const makePanel = (r, other) => `<div class="diff-panel">
    <div class="provider">${r.provider}/${r.model}</div>
    <div class="diff-score">${r.score?.toFixed(3) ?? "—"}</div>
    <div style="margin-top:0.5rem">
      <div class="diff-metric">Cost: $${r.costUsd?.toFixed(4) ?? "—"}</div>
      <div class="diff-metric">Latency: ${r.latencyMs ?? "—"}ms</div>
      <div class="diff-metric">Suite: ${r.suite ?? "—"}</div>
    </div>
    <div style="margin-top:0.75rem;font-size:12px;color:var(--text-muted)">
      ${r.output?.slice(0, 120) ?? "—"}${(r.output?.length ?? 0) > 120 ? "..." : ""}
    </div>
  </div>`;

  const tabEl = document.getElementById("tab-content");
  tabEl.innerHTML = `<div class="diff-side">
    ${makePanel(a, b)}
    ${makePanel(b, a)}
  </div>
  <div style="margin-top:1rem;padding:0.75rem;background:var(--bg2);border:1px solid var(--border);border-radius:6px;font-size:13px">
    <strong>Delta:</strong>
    Score <span style="color:${diff.score > 0 ? 'var(--green)' : 'var(--red)'}">${diff.score > 0 ? "+" : ""}${diff.score.toFixed(3)}</span>,
    Cost <span style="color:${diff.cost < 0 ? 'var(--green)' : 'var(--red)'}">${diff.cost > 0 ? "+" : ""}$${diff.cost.toFixed(4)}</span>,
    Latency <span style="color:${diff.latency < 0 ? 'var(--green)' : 'var(--red)'}">${diff.latency > 0 ? "+" : ""}${diff.latency}ms</span>
  </div>
  <button class="tab" style="margin-top:0.75rem" onclick="window.SMOL.resetDiff()">Reset comparison</button>`;
}

function selectDiff(idx) {
  // placeholder — real impl would show a picker
  selectedRuns = window.SMOL.runs.slice(0, 2);
  renderDiff(window.SMOL.runs);
}

function resetDiff() {
  selectedRuns = [];
  renderDiff(window.SMOL.runs);
}

window.SMOL.selectDiff = selectDiff;
window.SMOL.resetDiff = resetDiff;
window.SMOL.renderDiff = renderDiff;
