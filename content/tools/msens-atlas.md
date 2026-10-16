---
title: Marine Sensitivity Atlas
summary: A server-free atlas of scores, species, places and reports — HTML, ZIP and DOCX export — running entirely in the browser.
project:
- marinesensitivity
tool_type: app
status: beta
tech:
- Svelte
- TypeScript
- MapLibre
- STAC
- DuckDB-WASM
link: https://marinesensitivity.org/atlas/
repo: MarineSensitivity/atlas
version_from: package.json
featured: true
weight: 3
shot:
  wait: 8000
---

The Atlas is the next generation of the sensitivity apps: a static Svelte application that reads the release STAC catalog and Parquet tables directly, so it needs no Shiny server. It covers scores, species and places, and can export a report for any area. A generalized fork powers the [Ocean Metrics Atlas](/tools/om-atlas/).
