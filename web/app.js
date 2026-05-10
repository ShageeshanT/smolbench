// smolbench static leaderboard with provider filter and column sort.

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

let state = { rows: [], sortKey: "_score", sortDir: 1, providerFilter: "all" };

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

function applyAndRender() {
  const filtered = state.providerFilter === "all" ? state.rows : state.rows.filter((r) => r.provider === state.providerFilter);
  const ranked = rank(filtered);
  const sorted = [...ranked].sort((a, b) => {
    const av = a[state.sortKey], bv = b[state.sortKey];
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number") return (av - bv) * state.sortDir;
    return String(av).localeCompare(String(bv)) * state.sortDir;
  });
  const tbody = document.getElementById("rows");
  tbody.innerHTML = "";
  sorted.forEach((r, i) => {
    const tr = document.createElement("tr");
    if (i === 0 && state.sortKey === "_score" && state.sortDir === 1) tr.classList.add("winner");
    tr.innerHTML = `<td>${i + 1}</td><td>${r.provider}</td><td>${r.model}</td><td>${fmtQ(r.quality)}</td><td>${fmtCost(r.cost)}</td><td>${r.latencyMs ?? "-"}</td><td>${r._score.toFixed(4)}</td>`;
    tbody.appendChild(tr);
  });
  document.querySelectorAll("th[data-key]").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.key === state.sortKey) th.classList.add(state.sortDir === 1 ? "sort-asc" : "sort-desc");
  });
}

function setupHeaderSort() {
  document.querySelectorAll("th[data-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const k = th.dataset.key;
      if (state.sortKey === k) state.sortDir *= -1;
      else { state.sortKey = k; state.sortDir = 1; }
      applyAndRender();
    });
  });
}

function setupProviderFilter() {
  const sel = document.getElementById("provider-filter");
  const seen = new Set(state.rows.map((r) => r.provider));
  sel.innerHTML = '<option value="all">All providers</option>';
  for (const p of [...seen].sort()) {
    const opt = document.createElement("option");
    opt.value = p; opt.textContent = p;
    sel.appendChild(opt);
  }
  sel.addEventListener("change", () => { state.providerFilter = sel.value; applyAndRender(); });
}

async function main() {
  setupHeaderSort();
  const select = document.getElementById("run-select");
  const runs = await loadIndex();
  if (!runs.length) { select.innerHTML = '<option>(no runs)</option>'; return; }
  for (const name of runs) {
    const opt = document.createElement("option");
    opt.value = name; opt.textContent = name;
    select.appendChild(opt);
  }
  async function load(name) {
    const run = await loadRun(name);
    state.rows = run.rows || [];
    state.sortKey = "_score"; state.sortDir = 1; state.providerFilter = "all";
    setupProviderFilter();
    applyAndRender();
  }
  select.addEventListener("change", () => load(select.value));
  load(runs[0]);
}
main();
