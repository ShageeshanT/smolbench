// lib/failure-store.js
// Append diagnostic records to a JSONL store on disk.

const fs = require("fs");
const path = require("path");
const os = require("os");

const DEFAULT_PATH = path.join(os.homedir(), ".smolbench", "failures.jsonl");

function ensureDir(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function append(diagnostic, filePath) {
  const fp = filePath || DEFAULT_PATH;
  ensureDir(fp);
  fs.appendFileSync(fp, JSON.stringify(diagnostic) + "\n");
}

function readAll(filePath) {
  const fp = filePath || DEFAULT_PATH;
  if (!fs.existsSync(fp)) return [];
  return fs.readFileSync(fp, "utf8").split("\n").filter(Boolean).map(function (line) {
    try { return JSON.parse(line); } catch (e) { return null; }
  }).filter(Boolean);
}

function readBy(filter, filePath) {
  return readAll(filePath).filter(filter);
}

function clear(filePath) {
  const fp = filePath || DEFAULT_PATH;
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

module.exports = { DEFAULT_PATH, append, readAll, readBy, clear };
