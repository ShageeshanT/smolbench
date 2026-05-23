const { execFileSync } = require("child_process");
const MCP_URL = "https://connect.composio.dev/mcp";
const KEY = JSON.parse(require("fs").readFileSync("/data/.openclaw/openclaw.json", "utf8"))
  .plugins.entries.composio.config.consumerKey;
const OWNER = "ShageeshanT", REPO = "smolbench", BRANCH = "master";

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
  if (!m) throw new Error("unexpected MCP response: " + out.slice(0, 200));
  const env = JSON.parse(m[1]);
  return JSON.parse(env.result.content[0].text);
}

const target = execFileSync("git", ["rev-parse", "HEAD~15"], { cwd: "/data/workspace/smolbench", encoding: "utf8" }).trim();
console.log("Target (HEAD~15):", target);

const result = callMcp([{
  tool_slug: "GITHUB_UPDATE_A_REFERENCE",
  arguments: { owner: OWNER, repo: REPO, ref: BRANCH, sha: target, force: true },
}]);
console.log(JSON.stringify(result, null, 2));
