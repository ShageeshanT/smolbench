/**
 * scatter.js — cost vs quality bubble chart (SVG, no D3).
 */

function renderScatter(runs) {
  const tab = document.getElementById("tab-content");
  if (!tab) return;

  const width = 800, height = 420, pad = { top: 20, right: 20, bottom: 50, left: 60 };

  const valid = runs.filter(r => r.costUsd != null && r.score != null);
  if (!valid.length) {
    tab.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:2rem;">No cost/score data yet.</p>`;
    return;
  }

  const xs = valid.map(r => r.costUsd);
  const ys = valid.map(r => r.score);
  const xMin = Math.min(...xs) * 0.9, xMax = Math.max(...xs) * 1.1;
  const yMin = 0, yMax = 1;

  const scaleX = v => pad.left + (v - xMin) / (xMax - xMin) * (width - pad.left - pad.right);
  const scaleY = v => pad.top + (yMax - v) / (yMax - yMin) * (height - pad.top - pad.bottom);

  const colors = { openai: "#74c0fc", anthropic: "#a9e34b", google: "#ffd43b", deepseek: "#ff922b", ollama: "#da77f2" };
  const getColor = p => colors[p] ?? "#8b949e";

  let svg = `<svg id="scatter-svg" viewBox="0 0 ${width} ${height}">`;

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = scaleY(i / 4);
    svg += `<line x1=${pad.left} y1=${y} x2=${width - pad.right} y2=${y} stroke="var(--border)" stroke-dasharray="3,3"/>`;
    svg += `<text x=${pad.left - 8} y=${y + 4} text-anchor="end" class="cdf-axis" style="font-size:11px;fill:var(--text-muted)">${(i / 4).toFixed(2)}</text>`;
  }

  // Axes
  svg += `<line x1=${pad.left} y1=${height - pad.bottom} x2=${width - pad.right} y2=${height - pad.bottom} stroke="var(--border)"/>`;
  svg += `<line x1=${pad.left} y1=${pad.top} x2=${pad.left} y2=${height - pad.bottom} stroke="var(--border)"/>`;

  // Bubbles
  for (const r of valid) {
    const cx = scaleX(r.costUsd);
    const cy = scaleY(r.score);
    const rPx = 6;
    svg += `<circle class="bubble" cx=${cx} cy=${cy} r=${rPx} fill="${getColor(r.provider)}"
      title="${r.provider}/${r.model}: score=${r.score.toFixed(3)}, cost=$${r.costUsd.toFixed(4)}"/>`;
  }

  // Axis labels
  svg += `<text x=${width / 2} y=${height - 6} text-anchor="middle" style="fill:var(--text-muted);font-size:12px">Cost (USD)</text>`;
  svg += `<text x=${12} y=${height / 2} text-anchor="middle" transform="rotate(-90,12,${height/2})" style="fill:var(--text-muted);font-size:12px">Score</text>`;

  // Legend
  const providers = [...new Set(valid.map(r => r.provider))];
  let lx = width - pad.right - 80;
  providers.forEach((p, i) => {
    svg += `<circle cx=${lx} cy=${pad.top + i * 18} r="5" fill="${getColor(p)}"/>`;
    svg += `<text x=${lx + 10} y=${pad.top + i * 18 + 4} style="fill:var(--text-muted);font-size:11px">${p}</text>`;
  });

  svg += `</svg>`;
  tab.innerHTML = svg;
}

window.SMOL.renderScatter = renderScatter;
