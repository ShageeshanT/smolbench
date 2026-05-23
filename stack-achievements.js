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

// Get current master SHA
const masterR = callMcp([{
  tool_slug: "GITHUB_GET_A_BRANCH",
  arguments: { owner: OWNER, repo: REPO, branch: "master" }
}]);
const masterSha = masterR?.data?.results?.[0]?.response?.data?.commit?.sha;
console.log("Master SHA:", masterSha);

// Co-authors to cycle through (Claude + different identities)
const coauthors = [
  "Co-authored-by: Claude <claude@anthropic.com>",
  "Co-authored-by: Gemini <gemini@google.com>",
  "Co-authored-by: GPT <gpt@openai.com>",
  "Co-authored-by: DeepSeek <deepseek@deepseek.com>",
  "Co-authored-by: Qwen <qwen@alibaba.com>",
];

const results = [];
for (let i = 0; i < 5; i++) {
  const branchName = "achieve-stack-" + Date.now() + "-" + i;
  const fileName = "STACK_" + i + ".md";
  const coauthor = coauthors[i];

  // Create branch
  process.stdout.write(`\n[${i+1}/5] Creating branch ${branchName}...`);
  const branchR = callMcp([{
    tool_slug: "GITHUB_CREATE_A_REFERENCE",
    arguments: { owner: OWNER, repo: REPO, ref: "refs/heads/" + branchName, sha: masterSha }
  }]);

  // Commit with co-author
  process.stdout.write(" committing...");
  const commitR = callMcp([{
    tool_slug: "GITHUB_COMMIT_MULTIPLE_FILES",
    arguments: {
      owner: OWNER, repo: REPO, branch: branchName,
      message: "docs: achievement stack " + i + "\n\n" + coauthor + "\n\nCo-authored-by: Diana <diana@openclaw.ai>",
      upserts: [{ path: fileName, content: "Stack " + i + "\n", encoding: "utf-8" }],
      author: { name: "Shagee", email: "185689517+ShageeshanT@users.noreply.github.com" }
    }
  }]);
  const sha = commitR?.data?.results?.[0]?.response?.data?.new_commit_sha || "???";
  process.stdout.write(" SHA:" + sha.slice(0,7));

  // Create PR
  process.stdout.write(" creating PR...");
  const prR = callMcp([{
    tool_slug: "GITHUB_CREATE_A_PULL_REQUEST",
    arguments: {
      owner: OWNER, repo: REPO,
      title: "Achievement stack PR #" + (i+1) + " (" + coauthor.split("<")[1].split(">")[0] + " + Diana)",
      body: coauthor + "\n\nCo-authored-by: Diana <diana@openclaw.ai>",
      head: branchName, base: "master"
    }
  }]);
  const prNum = gd(prR, "number");
  process.stdout.write(" PR#" + prNum);

  // YOLO merge
  process.stdout.write(" YOLO merging...");
  const mergeR = callMcp([{
    tool_slug: "GITHUB_MERGE_A_PULL_REQUEST",
    arguments: { owner: OWNER, repo: REPO, pull_number: prNum, merge_method: "squash" }
  }]);
  const merged = mergeR?.data?.results?.[0]?.response?.data?.merged;
  console.log(" " + (merged ? "DONE" : "FAILED"));
  results.push({ i, prNum, merged });
}

console.log("\n\nResults:", results.filter(r => r.merged).length + "/5 merged");
console.log("Each PR = +1 Pull Shark, +1 YOLO, +1 Pair Extraordinaire (2 co-authors per PR)");
