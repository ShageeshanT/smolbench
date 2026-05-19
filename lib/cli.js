/**
 * smolbench CLI — with estimate, cache stats, max-cost guard.
 */
const fs = require("fs");
const path = require("path");
const { cacheGet, cacheSet, cacheStats, cacheClear } = require("./cache");
const { estimateCost, PROVIDER_PRICES } = require("./cost-estimator");
const { parseSuite } = require("./suite-parser");
const { runPrompt } = require("./runner");

const VERSION = "0.6.0";
const log = m => console.log("[smolbench] " + m);

const cmd = process.argv[2] || "";
const args = process.argv.slice(3);

if (cmd === "estimate") {
  log("Cost estimates (per 1K tokens input / output):");
  for (const [p, prices] of Object.entries(PROVIDER_PRICES)) {
    log("  " + p + ": $" + (prices.input * 1000).toFixed(4) + " / $" + (prices.output * 1000).toFixed(4));
  }
  process.exit(0);
}

if (cmd === "cache") {
  const sub = args[0];
  if (sub === "stats") {
    const s = cacheStats();
    log("Cache: " + s.active + " active, " + s.expired + " expired, " + s.total + " total");
  } else if (sub === "clear") {
    log("Cleared " + cacheClear() + " cache entries.");
  } else {
    log("Usage: smolbench cache stats | clear");
  }
  process.exit(0);
}

const maxCostIdx = args.indexOf("--max-cost");
const maxCostUsd = maxCostIdx >= 0 ? parseFloat(args[maxCostIdx + 1]) : null;

if (cmd === "run") {
  const suite = args.find(a => !a.startsWith("--")) || "examples/test-suite.yaml";
  log("Running suite: " + suite + (maxCostUsd ? " (max $" + maxCostUsd + ")" : ""));
  const suiteData = parseSuite(suite);
  let totalCost = 0;
  const results = [];
  const cacheKey = p => suite + ":" + p + ":" + suiteData.model;

  for (const prompt of suiteData.prompts) {
    if (maxCostUsd && totalCost >= maxCostUsd) {
      log("Cost guard triggered: $" + totalCost.toFixed(4) + " >= $" + maxCostUsd + ". Aborting.");
      break;
    }
    const cached = cacheGet(cacheKey(prompt.id));
    if (cached) {
      results.push({ ...cached, cacheHit: true });
      log("  [CACHE HIT] " + prompt.id);
      continue;
    }
    const r = runPrompt(prompt.id, suiteData.model, suiteData.provider);
    totalCost += r.costUsd;
    results.push(r);
    cacheSet(cacheKey(prompt.id), r);
    log("  [DONE] " + prompt.id + " -- $" + r.costUsd.toFixed(4));
  }

  const runsFile = path.join(process.cwd(), "runs.jsonl");
  fs.appendFileSync(runsFile, JSON.stringify({ ts: Date.now(), totalCostUsd: +totalCost.toFixed(6), results }) + "
");
  log("Done. " + results.length + " prompts. Total: $" + totalCost.toFixed(4));
  process.exit(0);
}

log("smolbench v" + VERSION + " -- run <suite>, estimate, cache stats|clear, --max-cost <usd>");
