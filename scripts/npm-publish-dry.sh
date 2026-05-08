#!/bin/bash
# Dry-run npm publish to surface packaging issues before going live.
# Run from repo root: bash scripts/npm-publish-dry.sh

set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not on PATH" >&2; exit 2
fi

echo "==> npm pack --dry-run"
npm pack --dry-run

echo
echo "==> Files that will ship (per package.json 'files'):"
node -e "const f=require('./package.json').files; for (const x of f) console.log('  '+x)"

echo
echo "==> Verifying entry points"
node --check cli.js || { echo "cli.js failed --check" >&2; exit 1; }
echo "  cli.js parses"

echo
echo "==> Tests"
node --test test/ || { echo "tests failed" >&2; exit 1; }

echo
echo "Dry-run complete. To publish for real: npm publish --access public"
