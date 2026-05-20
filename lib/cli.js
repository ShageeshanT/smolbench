// lib/cli.js
// CLI argument parser for smolbench.

const { readFileSync } = require("fs");

function parseArgs(argv) {
  const args = { commands: [], flags: {} };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "run" || a === "report") {
      args.commands.push(a);
    } else if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args.flags[key] = val;
    } else if (a.startsWith("-")) {
      const key = a.slice(1);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args.flags[key] = val;
    } else {
      args._.push(a);
    }
  }
  return args;
}

module.exports = { parseArgs };
