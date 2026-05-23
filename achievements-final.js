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

// 1. Get current master SHA
console.log("1. Getting master SHA...");
const masterR = callMcp([{
  tool_slug: "GITHUB_GET_A_BRANCH",
  arguments: { owner: OWNER, repo: REPO, branch: "master" }
}]);
const masterSha = masterR?.data?.results?.[0]?.response?.data?.commit?.sha;
console.log("  Master SHA:", masterSha);

// 2. Create a new branch pointing to master
const branchName = "achievement-unlock-" + Date.now();
console.log("\n2. Creating branch: " + branchName + "...");
const branchR = callMcp([{
  tool_slug: "GITHUB_CREATE_A_REFERENCE",
  arguments: { owner: OWNER, repo: REPO, ref: "refs/heads/" + branchName, sha: masterSha }
}]);
console.log("  Branch created:", branchR?.data?.results?.[0]?.response?.ref);

// 3. Add co-authored file to the branch
console.log("\n3. Committing co-authored file to branch...");
const coauthorR = callMcp([{
  tool_slug: "GITHUB_COMMIT_MULTIPLE_FILES",
  arguments: {
    owner: OWNER, repo: REPO,
    branch: branchName,
    message: "docs: achievement unlock\n\nCo-authored-by: Diana <diana@openclaw.ai>",
    upserts: [{ path: "ACHIEVEMENT_UNLOCK.md", content: "Achievement unlock test commit\n", encoding: "utf-8" }],
    author: { name: "Shagee", email: "185689517+ShageeshanT@users.noreply.github.com" }
  }
}]);
console.log("  SHA:", coauthorR?.data?.results?.[0]?.response?.data?.new_commit_sha || coauthorR?.data?.results?.[0]?.response?.data?.commit?.sha);

// 4. Create PR
console.log("\n4. Creating PR...");
const prR = callMcp([{
  tool_slug: "GITHUB_CREATE_A_PULL_REQUEST",
  arguments: {
    owner: OWNER, repo: REPO,
    title: "Achievement PR: YOLO + Pull Shark + Pair Extraordinaire",
    body: "Achievement unlock PR.\n\nCo-authored-by: Diana <diana@openclaw.ai>",
    head: branchName,
    base: "master"
  }
}]);
const prNum = gd(prR, "number");
const prUrl = gd(prR, "html_url");
console.log("  PR #" + prNum + " " + prUrl);

// 5. YOLO merge (no review = YOLO badge, squash = Pull Shark badge)
console.log("\n5. YOLO merging PR#" + prNum + "...");
const mergeR = callMcp([{
  tool_slug: "GITHUB_MERGE_A_PULL_REQUEST",
  arguments: { owner: OWNER, repo: REPO, pull_number: prNum, merge_method: "squash" }
}]);
console.log("  Merged:", gd(mergeR, "merged") || JSON.stringify(mergeR.data?.results?.[0]?.response).slice(0, 200));

console.log("\nAll achievements unlocked!");
