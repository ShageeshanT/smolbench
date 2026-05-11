#!/bin/bash
# Quick local bench script. Runs the hello suite in parallel mode with cache,
# then renders a leaderboard. Adjust the suite path for your own.

set -euo pipefail

SUITE="${1:-examples/hello.yaml}"
echo "==> smolbench run $SUITE --parallel --cache"
node ./cli.js run "$SUITE" --parallel --cache

LATEST="$(ls -t runs/$(basename "$SUITE" .yaml)-*.json | head -n 1)"
echo
echo "==> smolbench leaderboard $LATEST"
node ./cli.js leaderboard "$LATEST"
