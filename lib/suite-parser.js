const fs = require("fs");
const path = require("path");
const yaml = require("yaml");

function parseSuite(suitePath) {
  const full = path.resolve(process.cwd(), suitePath);
  if (!fs.existsSync(full)) throw new Error("Suite not found: " + full);
  const parsed = yaml.parse(fs.readFileSync(full, "utf8"));
  return {
    id: parsed.id ?? path.basename(suitePath, ".yaml"),
    description: parsed.description ?? "",
    prompts: parsed.prompts ?? [],
    model: parsed.model ?? "gpt-4o-mini",
    provider: parsed.provider ?? "openai",
    metadata: parsed.metadata ?? {},
  };
}

module.exports = { parseSuite };
