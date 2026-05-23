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

// 1. List issues
console.log("1. Listing open issues...");
const listResult = callMcp([{
  tool_slug: "GITHUB_LIST_REPOSITORY_ISSUES",
  arguments: { owner: OWNER, repo: REPO, state: "open", per_page: 10 }
}]);
const raw = listResult.data?.results?.[0]?.response;
console.log("Raw response type:", typeof raw);
console.log("Raw:", JSON.stringify(raw).slice(0, 500));

// 2. Add reaction to issue 1 directly via GitHub REST API
console.log("\n2. Adding heart reaction to issue #1 via REST...");
const reactionResult = execFileSync("curl", [
  "-sS", "-X", "POST",
  "https://api.github.com/repos/" + OWNER + "/" + REPO + "/issues/1/reactions",
  "-H", "Accept: application/vnd.github+json",
  "-H", "x-consumer-api-key: " + KEY,
  "-H", "Content-Type: application/json",
  "--max-time", "30",
  "-d", JSON.stringify({ content: "heart" })
], { encoding: "utf8", timeout: 35000 });
console.log("Reaction:", reactionResult.slice(0, 300));

// 3. Close issue #1
console.log("\n3. Closing issue #1...");
const closeResult = callMcp([{
  tool_slug: "GITHUB_UPDATE_AN_ISSUE",
  arguments: { owner: OWNER, repo: REPO, issue_number: 1, state: "closed" }
}]);
const closeRaw = closeResult.data?.results?.[0]?.response;
console.log("Close state:", typeof closeRaw === "string" ? closeRaw : JSON.stringify(closeRaw).slice(0, 200));
