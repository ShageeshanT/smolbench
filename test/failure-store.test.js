// test/failure-store.test.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { append, readAll, readBy, clear } = require("../lib/failure-store");

const tmp = path.join(os.tmpdir(), "smolbench-failure-store-" + Date.now() + ".jsonl");
clear(tmp);

append({ run_id: "r1", prompt_id: "p1", category: "timeout" }, tmp);
append({ run_id: "r1", prompt_id: "p2", category: "refusal" }, tmp);
append({ run_id: "r2", prompt_id: "p1", category: "timeout" }, tmp);

const all = readAll(tmp);
assert.strictEqual(all.length, 3, "three records appended");
assert.strictEqual(all[0].run_id, "r1");

const r1 = readBy(function (r) { return r.run_id === "r1"; }, tmp);
assert.strictEqual(r1.length, 2);

clear(tmp);
assert.strictEqual(fs.existsSync(tmp), false, "store cleared");

console.log("test/failure-store.test.js: all assertions passed");
