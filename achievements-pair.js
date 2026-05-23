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

const gd = (r, path) => {
  const inner = r?.data?.results?.[0]?.response?.data;
  if (!inner) return undefined;
  return path.split(".").reduce((o, k) => o && o[k], inner);
};

// Create a co-authored commit on master
console.log("Creating co-authored commit with Co-authored-by trailer...");
const result = callMcp([{
  tool_slug: "GITHUB_COMMIT_MULTIPLE_FILES",
  arguments: {
    owner: OWNER, repo: REPO, branch: "master",
    message: "docs: add achievement co-author test\n\nCo-authored-by: Diana <diana@openclaw.ai>",
    upserts: [{ path: ".coauthor-test", content: "pair extraodinaire test\n", encoding: "utf-8" }],
    author: { name: "Shagee", email: "185689517+ShageeshanT@users.noreply.github.com" }
  }
}]);
console.log("SHA:", result.data?.results?.[0]?.response?.data?.new_commit_sha || "???");
console.log(JSON.stringify(result.data?.results?.[0]?.response?.data).slice(0, 300));
