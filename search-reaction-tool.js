const { execFileSync } = require("child_process");
const MCP_URL = "https://connect.composio.dev/mcp";
const KEY = JSON.parse(require("fs").readFileSync("/data/.openclaw/openclaw.json", "utf8"))
  .plugins.entries.composio.config.consumerKey;

function callMcp(query) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call",
    params: { name: "COMPOSIO_SEARCH_TOOLS", arguments: { query } } });
  const out = execFileSync("curl", [
    "-sS", "-X", "POST", MCP_URL,
    "-H", "Content-Type: application/json",
    "-H", "Accept: application/json, text/event-stream",
    "-H", "x-consumer-api-key: " + KEY,
    "--max-time", "60", "-d", body,
  ], { encoding: "utf8", timeout: 70000 });
  const m = out.match(/data:\s*(\{[\s\S]*\})\s*$/);
  if (!m) return null;
  const env = JSON.parse(m[1]);
  return JSON.parse(env.result.content[0].text);
}

const queries = ["reaction for issue", "issue reaction", "github reaction for issue"];
for (const q of queries) {
  const r = callMcp(q);
  console.log(`\n${q}:`);
  const slugs = r?.data?.results?.[0]?.primary_tool_slugs || r?.data?.results?.[0]?.related_tool_slugs || ["no results"];
  console.log(JSON.stringify(slugs, null, 2));
}
