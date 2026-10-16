---
title: Ocean Metrics Atlas
summary: A generalized, server-free atlas that maps any species-distribution product described in a STAC catalog, with a gazetteer of places.
project:
- oceanmetrics
tool_type: app
status: beta
tech:
- Svelte
- TypeScript
- STAC
- DuckDB-WASM
- MapLibre
link: https://oceanmetrics.io/atlas/
repo: oceanmetrics/atlas
version_from: package.json
weight: 5
shot:
  wait: 8000
---

Forked from the [Marine Sensitivity Atlas](/tools/msens-atlas/) and generalized: point it at a STAC catalog of model outputs and it maps them, summarizes them by place from the [marine gazetteer](/tools/places/), and runs entirely in the browser.
