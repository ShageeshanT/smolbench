// lib/cli.js
// CLI argument parser for smolbench.

function parseArgs(argv) {
  const args = { commands: [], flags: {}, _: [] };
  const known = new Set(["run", "report", "failures", "diagnose", "estimate", "cache"]);
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (known.has(a)) {
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
