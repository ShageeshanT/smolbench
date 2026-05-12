#!/bin/bash
# Prune .smolbench/runs.jsonl to the last N entries (default 1000).
# Run periodically if you keep long-term run history and the file grows large.

set -euo pipefail

DB="${SMOLBENCH_DB:-.smolbench/runs.jsonl}"
KEEP="${1:-1000}"

if [ ! -f "$DB" ]; then
  echo "no history at $DB"; exit 0
fi

total="$(wc -l < "$DB")"
if [ "$total" -le "$KEEP" ]; then
  echo "history has $total entries, under cap $KEEP, no prune"; exit 0
fi

tmp="$DB.tmp"
tail -n "$KEEP" "$DB" > "$tmp"
mv "$tmp" "$DB"
echo "pruned $DB: $total -> $KEEP entries"
