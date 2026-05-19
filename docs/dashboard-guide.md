# Dashboard Guide

## Live Dashboard

Your results are visualised at **https://shageeshant.github.io/smolbench/**

The dashboard is deployed automatically via `.github/workflows/pages.yml` on every push to master.

## Tabs

### Leaderboard
Sortable table of all runs. Click any column header to sort. Filter by provider, suite, or free text.

### Cost vs Quality (Scatter)
Each bubble is one run. X axis = cost (USD), Y axis = quality score. Color = provider. Hover for details.

### Latency CDF
Cumulative distribution of response latency per provider. Shows what fraction of requests finish under a given time.

### Diff View
Select two runs to compare side by side. Shows score, cost, latency, and a snippet of the output, plus a delta summary.

## Sharing a filtered view

Use the search box + filters, then copy the URL. It encodes your filter state so anyone you send it to sees the same view.

## Adding your own runs

Drop `runs/*.json` (or a merged `runs.json`) into the `web/` directory before deploying, or extend `runs-loader.js` to point at your own data source.
