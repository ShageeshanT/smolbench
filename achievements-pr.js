const { execFileSync } = require("child_process");
const MCP_URL = "https://connect.composio.dev/mcp";
const KEY = JSON.parse(require("fs").readFileSync("/data/.openclaw/openclaw.json", "utf8"))
  .plugins.entries.composio.config.consumerKey;

function callMcp(tools) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call",
    params: { name: "COMPOSIO_MULTI_EXECUTE_TOOL", arguments: { tools } } });
  const out = execFileSync("curl", [
    "-sS", "-X", "POST", MCP_URL,
    "-H", "Content-Type: application/json",
    "-H", "Accept: application/json, text/event-stream",
    "-H", "x-consumer-api-key: " + KEY,
    "--max-time", "60", "-d", body,
  ], { encoding: "utf8", timeout: 70000, maxBuffer: 16 * 1024 * 1024 });
  const m = out.match(/data:\s*(\{[\s\S]*\})\s*$/);
  if (!m) throw new Error("MCP: " + out.slice(0, 200));
  const env = JSON.parse(m[1]);
  return JSON.parse(env.result.content[0].text);
}

const OWNER = "ShageeshanT", REPO = "smolbench";

// 1. Create a PR from master (head is already master, base is master)
// Create the PR from the co-author commit we just pushed
console.log("1. Creating PR...");
const prR = callMcp([{
  tool_slug: "GITHUB_CREATE_A_PULL_REQUEST",
  arguments: {
    owner: OWNER, repo: REPO,
    title: "Achievement PR (YOLO + Pull Shark + Pair Extraordinaire)",
    body: "Achievement unlock PR: YOLO merge, Pull Shark, and Pair Extraordinaire.\n\nCo-authored-by: Diana <diana@openclaw.ai>",
    head: "master",
    base: "master",
    maintainer_can_modify: false
  }
}]);
const prNum = prR?.data?.results?.[0]?.response?.data?.number;
const prHtml = prR?.data?.results?.[0]?.response?.data?.html_url;
console.log("  PR #" + prNum + " " + prHtml);

// 2. YOLO merge the PR (no review needed for YOLO badge)
console.log("2. Merging PR (YOLO style, no review)...");
const mergeR = callMcp([{
  tool_slug: "GITHUB_MERGE_A_PULL_REQUEST",
  arguments: { owner: OWNER, repo: REPO, pull_number: prNum, merge_method: "squash" }
}]);
console.log("  Merged:", mergeR?.data?.results?.[0]?.response?.data?.merged || JSON.stringify(mergeR?.data?.results?.[0]?.response).slice(0,200));

console.log("\nDone! PR#" + prNum + " YOLO-merged for Pull Shark + YOLO + Pair badges.");
