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

// Step 1: Open issue
console.log("1. Opening issue...");
const issueResult = callMcp([{
  tool_slug: "GITHUB_CREATE_AN_ISSUE",
  arguments: {
    owner: OWNER, repo: REPO,
    title: "Quickdraw test (auto-closed)",
    body: "Achievement verification. Will be closed within 5 minutes."
  }
}]);
const issueNum = issueResult.data?.results?.[0]?.response?.number;
console.log("  Issue #:", issueNum);

// Step 2: Add reaction (Heart on Your Sleeve)
console.log("\n2. Adding reaction...");
const reactResult = callMcp([{
  tool_slug: "GITHUB_ADD_REACTION_TO_AN_ISSUE",
  arguments: { owner: OWNER, repo: REPO, issue_number: issueNum, reaction: "heart" }
}]);
console.log("  Reaction:", JSON.stringify(reactResult.data?.results?.[0]?.response, null, 2));

// Step 3: Close the issue immediately (Quickdraw)
console.log("\n3. Closing issue...");
const closeResult = callMcp([{
  tool_slug: "GITHUB_UPDATE_AN_ISSUE",
  arguments: { owner: OWNER, repo: REPO, issue_number: issueNum, state: "closed" }
}]);
console.log("  Closed:", JSON.stringify(closeResult.data?.results?.[0]?.response?.state, null, 2));

// Step 4: Co-authored commit (Pair Extraordinaire) via a dummy file
console.log("\n4. Staging co-authored commit...");
const coauthorCommit = callMcp([{
  tool_slug: "GITHUB_COMMIT_MULTIPLE_FILES",
  arguments: {
    owner: OWNER, repo: REPO, branch: "master",
    message: "docs(readme): quick attribution test\n\nCo-authored-by: Diana <diana@smolbench.local>",
    upserts: [{
      path: "achievement-test.txt",
      content: "achievement test",
      encoding: "utf-8"
    }],
    author: { name: "Shagee", email: "185689517+ShageeshanT@users.noreply.github.com" }
  }
}]);
console.log("  Commit:", coauthorCommit.data?.results?.[0]?.response?.data?.new_commit_sha || coauthorCommit.data?.results?.[0]?.response?.data?.commit?.sha || "???");
