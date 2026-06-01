const assert = require("assert");
const { readFileSync } = require("fs");

for (const file of ["examples/hello.yaml", "examples/math.yaml"]) {
  const text = readFileSync(file, "utf8");
  assert.match(text, /^name:/m);
  assert.match(text, /^providers:/m);
  assert.match(text, /^prompts:/m);
}

const config = JSON.parse(readFileSync("examples/provider-config.mock.json", "utf8"));
assert.ok(Array.isArray(config.providers));
assert.ok(config.providers.some((provider) => provider.id === "mock"));

console.log("example fixture tests ok");
