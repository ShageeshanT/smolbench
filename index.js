// Public module entry point for smolbench.

module.exports = {
  cli: require("./lib/cli"),
  runner: require("./lib/runner"),
  registry: require("./lib/registry"),
  report: require("./lib/report"),
  reportHtml: require("./lib/report-html"),
  score: require("./lib/score"),
  stats: require("./lib/stats"),
  diagnostics: require("./lib/diagnostics"),
};
