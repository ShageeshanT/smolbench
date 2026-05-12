#!/bin/bash
# Run every example suite and print a one-line winner per suite.
# Useful as a smoke test that the whole pipeline works after a refactor.

set -euo pipefail

shopt -s nullglob
suites=(examples/*.yaml)
if [ ${#suites[@]} -eq 0 ]; then
  echo "no example suites found in examples/" >&2
  exit 2
fi

for s in "${suites[@]}"; do
  echo "==> $s"
  if node ./cli.js run "$s" --parallel --cache; then
    latest="$(ls -t runs/$(basename "$s" .yaml)-*.json 2>/dev/null | head -n 1)"
    if [ -n "$latest" ]; then
      node ./cli.js leaderboard "$latest" | head -n 5
    fi
  else
    echo "  FAILED on $s, continuing"
  fi
  echo
done
