# CLI additions (batch 14)

## New commands

```sh
smolbench estimate           # cost-per-call for all providers
smolbench cache stats        # entry count, hit/miss summary
smolbench cache clear        # wipe cache
```

## New flags

```sh
smolbench run examples/test-suite.yaml --max-cost 0.50  # abort if cost exceeds $0.50
```

## runs.jsonl output

Each run now records `cacheHit: true|false` and `costUsd: number` per prompt.
