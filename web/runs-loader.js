/**
 * runs-loader.js — drop in runs/*.json and it renders.
 * Looks for runs/ directory relative to web/ or cwd.
 */

window.SMOL = { runs: [], providers: [], suites: [] };

function loadRuns() {
  // If runs were embedded at build time, use them directly
  if (window.EMBEDDED_RUNS) {
    window.SMOL.runs = window.EMBEDDED_RUNS;
    window.SMOL.providers = [...new Set(window.SMOL.runs.map(r => r.provider))];
    window.SMOL.suites = [...new Set(window.SMOL.runs.map(r => r.suite))];
    return Promise.resolve();
  }

  // Otherwise fetch runs.json from the same origin
  return fetch("runs.json")
    .then(r => r.json())
    .then(data => {
      window.SMOL.runs = data.runs || data || [];
      window.SMOL.providers = [...new Set(window.SMOL.runs.map(r => r.provider))];
      window.SMOL.suites = [...new Set(window.SMOL.runs.map(r => r.suite))];
    })
    .catch(() => {
      // No runs found — show empty state
      window.SMOL.runs = [];
    });
}

function summariseRuns() {
  const runs = window.SMOL.runs;
  if (!runs.length) return { total: 0, avgScore: 0, avgCost: 0, passRate: 0 };
  const avgScore = runs.reduce((s, r) => s + (r.score ?? 0), 0) / runs.length;
  const avgCost = runs.reduce((s, r) => s + (r.costUsd ?? 0), 0) / runs.length;
  const passRate = runs.filter(r => r.passed).length / runs.length * 100;
  return {
    total: runs.length,
    avgScore: +avgScore.toFixed(3),
    avgCost: +avgCost.toFixed(4),
    passRate: +passRate.toFixed(1),
  };
}

// Export for use by other modules
window.SMOL.loadRuns = loadRuns;
window.SMOL.summariseRuns = summariseRuns;
