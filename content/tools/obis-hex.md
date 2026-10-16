---
title: OBIS Hex
summary: Biodiversity indicators from every OBIS record — ES50, richness and more — on H3 hexagons, computed in the browser.
project:
- marinebon
- oceanmetrics
tool_type: app
status: production
tech:
- Svelte
- DuckDB-WASM
- deck.gl
- H3
- Parquet
link: https://oceanmetrics.io/obis-hex/
repo: oceanmetrics/obis-hex
featured: true
weight: 3
shot:
  url: https://oceanmetrics.io/obis-hex/?tour=off
  wait: 10000
---

OBIS Hex puts the whole Ocean Biodiversity Information System on a hexagon map. Indicators such as expected species in 50 records (ES50), Shannon diversity and richness are computed on the fly with DuckDB-WASM from a monthly Parquet release built by [obisindicators](/tools/obisindicators/), and drawn with deck.gl. It replaces an earlier Shiny prototype.
