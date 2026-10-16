---
title: ERDDAP Places
summary: Place-based statistics from any ERDDAP grid — sanctuaries, marine regions and more — computed in the browser.
project:
- marinebon
- oceanmetrics
tool_type: app
status: beta
tech:
- Svelte
- DuckDB-WASM
- ERDDAP
link: https://oceanmetrics.io/erddap-places/
repo: oceanmetrics/erddap-places
weight: 6
shot:
  wait: 8000
---

Pick a place from the gazetteer and an ERDDAP gridded dataset, and the app extracts and summarizes the time series for that place without a server in between.
