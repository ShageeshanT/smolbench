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

// 1. List issues to find the quickdraw one
console.log("1. Listing open issues...");
const listResult = callMcp([{
  tool_slug: "GITHUB_LIST_REPOSITORY_ISSUES",
  arguments: { owner: OWNER, repo: REPO, state: "open", per_page: 10 }
}]);
const issues = listResult.data?.results?.[0]?.response?.data?.issues || [];
issues.forEach(i => console.log(`  #${i.number} "${i.title}"`));

// 2. Try reaction on issue 1 via PR review comment tool (might work)
const targetIssue = issues.find(i => i.title.includes("Quickdraw") || i.title.includes("achievement"));
if (targetIssue) {
  console.log("\n2. Adding reaction to issue #" + targetIssue.number + "...");
  const r = callMcp([{
    tool_slug: "GITHUB_CREATE_REACTION_FOR_A_PULL_REQUEST_REVIEW_COMMENT",
    arguments: { owner: OWNER, repo: REPO, issue_number: targetIssue.number, reaction: "heart" }
  }]);
  console.log("Result:", JSON.stringify(r.data?.results?.[0]?.response).slice(0, 300));
}

// 3. Close the quickdraw issue
if (targetIssue) {
  console.log("\n3. Closing issue #" + targetIssue.number + "...");
  const closeR = callMcp([{
    tool_slug: "GITHUB_UPDATE_AN_ISSUE",
    arguments: { owner: OWNER, repo: REPO, issue_number: targetIssue.number, state: "closed" }
  }]);
  console.log("Closed:", closeR.data?.results?.[0]?.response?.state || "???");
}
