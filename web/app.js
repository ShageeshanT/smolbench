// smolbench static leaderboard. Loads runs/index.json, lets the user pick a
// run, fetches it, ranks rows client-side, renders the table.

const W = { q: 0.4, c: 0.3, l: 0.3 };

function scoreRow(r) {
  const quality = typeof r.quality === "number" ? Math.max(0, Math.min(1, r.quality)) : 0;
  const cost = typeof r.cost === "number" ? r.cost : 0;
  const latencySec = (Number(r.latencyMs) || 0) / 1000;
  return (1 - quality) * W.q + cost * W.c + latencySec * W.l;
}

function rank(rows) {
  return [...rows].map((r) => ({ ...r, _score: scoreRow(r) })).sort((a, b) => a._score - b._score);
}

function fmtCost(c) { return typeof c === "number" ? c.toFixed(6) : "-"; }
function fmtQ(q) { return typeof q === "number" ? q.toFixed(2) : "-"; }

async function loadIndex() {
  try {
    const r = await fetch("./runs/index.json", { cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()).runs || [];
  } catch { return []; }
}

async function loadRun(name) {
  const r = await fetch(`./runs/${name}`, { cache: "no-store" });
  return r.json();
}

function render(run) {
  const tbody = document.getElementById("rows");
  tbody.innerHTML = "";
  const rows = rank(run.rows || []);
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    if (i === 0) tr.classList.add("winner");
    tr.innerHTML = `<td>${i + 1}</td><td>${r.provider}</td><td>${r.model}</td><td>${fmtQ(r.quality)}</td><td>${fmtCost(r.cost)}</td><td>${r.latencyMs ?? "-"}</td><td>${r._score.toFixed(4)}</td>`;
    tbody.appendChild(tr);
  });
}

async function main() {
  const select = document.getElementById("run-select");
  const runs = await loadIndex();
  if (!runs.length) {
    select.innerHTML = '<option>(no runs)</option>';
    return;
  }
  for (const name of runs) {
    const opt = document.createElement("option");
    opt.value = name; opt.textContent = name;
    select.appendChild(opt);
  }
  select.addEventListener("change", async () => render(await loadRun(select.value)));
  render(await loadRun(runs[0]));
}

main();
