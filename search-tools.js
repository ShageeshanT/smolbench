const { execFileSync } = require("child_process");
const MCP_URL = "https://connect.composio.dev/mcp";
const KEY = JSON.parse(require("fs").readFileSync("/data/.openclaw/openclaw.json", "utf8"))
  .plugins.entries.composio.config.consumerKey;

function callMcp(tools) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call",
    params: { name: "COMPOSIO_SEARCH_TOOLS", arguments: { query: tools } } });
  const out = execFileSync("curl", [
    "-sS", "-X", "POST", MCP_URL,
    "-H", "Content-Type: application/json",
    "-H", "Accept: application/json, text/event-stream",
    "-H", "x-consumer-api-key: " + KEY,
    "--max-time", "60", "-d", body,
  ], { encoding: "utf8", timeout: 70000 });
  const m = out.match(/data:\s*(\{[\s\S]*\})\s*$/);
  if (!m) { console.log("raw out:", out.slice(0, 500)); return null; }
  const env = JSON.parse(m[1]);
  return JSON.parse(env.result.content[0].text);
}

const r = callMcp("github push");
console.log(JSON.stringify(r, null, 2));
