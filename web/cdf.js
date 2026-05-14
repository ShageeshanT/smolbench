/**
 * cdf.js — latency cumulative distribution per provider.
 */

function renderCDF(runs) {
  const tab = document.getElementById("tab-content");
  if (!tab) return;

  const valid = runs.filter(r => r.latencyMs != null);
  if (!valid.length) {
    tab.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:2rem;">No latency data yet.</p>`;
    return;
  }

  const width = 800, height = 360, pad = { top: 20, right: 20, bottom: 50, left: 60 };
  const providers = [...new Set(valid.map(r => r.provider))];
  const colors = { openai: "#74c0fc", anthropic: "#a9e34b", google: "#ffd43b", deepseek: "#ff922b", ollama: "#da77f2" };

  // Build CDF data per provider
  const cdfs = {};
  for (const p of providers) {
    const latencies = valid.filter(r => r.provider === p).map(r => r.latencyMs).sort((a, b) => a - b);
    cdfs[p] = latencies.map((v, i) => ({ v, p: (i + 1) / latencies.length }));
  }

  const allVals = valid.map(r => r.latencyMs);
  const xMin = 0, xMax = Math.max(...allVals) * 1.1;
  const scaleX = v => pad.left + (v - xMin) / (xMax - xMin) * (width - pad.left - pad.right);
  const scaleY = v => pad.top + (1 - v) * (height - pad.top - pad.bottom);

  let svg = `<svg id="cdf-svg" viewBox="0 0 ${width} ${height}">`;

  // Grid
  [0.25, 0.5, 0.75, 1.0].forEach(p => {
    const y = scaleY(p);
    svg += `<line x1=${pad.left} y1=${y} x2=${width - pad.right} y2=${y} stroke="var(--border)" stroke-dasharray="3,3"/>`;
    svg += `<text x=${pad.left - 6} y=${y + 4} text-anchor="end" style="font-size:11px;fill:var(--text-muted)">${(p*100).toFixed(0)}%</text>`;
  });

  // Axes
  svg += `<line x1=${pad.left} y1=${pad.top} x2=${pad.left} y2=${height - pad.bottom} stroke="var(--border)"/>`;
  svg += `<line x1=${pad.left} y1=${height - pad.bottom} x2=${width - pad.right} y2=${height - pad.bottom} stroke="var(--border)"/>`;

  // CDF lines per provider
  for (const p of providers) {
    const color = colors[p] ?? "#8b949e";
    const pts = cdfs[p];
    let d = "";
    pts.forEach(({ v, p: pct }) => {
      const x = scaleX(v), y = scaleY(pct);
      d += (d ? "L" : "M") + x + "," + y;
    });
    svg += `<path class="cdf-line" d="${d}" stroke="${color}"/>`;
  }

  // Legend
  let lx = width - pad.right - 80;
  providers.forEach((p, i) => {
    svg += `<line x1=${lx} y1=${pad.top + i * 16} x2=${lx + 20} y2=${pad.top + i * 16} stroke="${colors[p] ?? '#8b949e'}" stroke-width="2"/>`;
    svg += `<text x=${lx + 24} y=${pad.top + i * 16 + 4} style="fill:var(--text-muted);font-size:11px">${p}</text>`;
  });

  // X axis label
  svg += `<text x=${width / 2} y=${height - 6} text-anchor="middle" style="fill:var(--text-muted);font-size:12px">Latency (ms)</text>`;

  svg += `</svg>`;
  tab.innerHTML = svg;
}

window.SMOL.renderCDF = renderCDF;
