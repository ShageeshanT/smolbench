const assert = require("assert");
const smolbench = require("../index");

assert.ok(smolbench.cli.parseArgs);
assert.ok(smolbench.runner.runPrompt);
assert.ok(smolbench.registry.register);
assert.ok(smolbench.report.textReport);
assert.ok(smolbench.reportHtml.renderHtml);
assert.ok(smolbench.score.rankRows);

console.log("index tests ok");
