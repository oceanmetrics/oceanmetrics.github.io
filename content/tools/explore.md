---
title: CalCOFI Explorer
summary: One app, six lenses — stations, hexagons, contours, cruises, regions and sections — for any taxon or ocean variable in the frozen CalCOFI release, computed entirely in the browser.
project:
- calcofi
tool_type: app
status: production
tech:
- TypeScript
- DuckDB-WASM
- MapLibre
- deck.gl
- Plotly
- Parquet
link: https://calcofi.io/explore/
repo: CalCOFI/explore
featured: true
weight: 1
shot:
  wait: 6000
---

CalCOFI Explorer is the front door to the integrated database. Pick a dataset (ichthyoplankton taxa, bottle chemistry, CTD variables) and switch between **lenses** that each answer a different question: where was it sampled (stations), how does it vary across the grid (hexagons, contours), how has it changed by cruise (cruises), how do regions compare (regions), and what does the water column look like along a line (sections).

Every query runs in the browser against the release Parquet files with DuckDB-WASM, so there is no app server to scale or keep alive. Maps are drawn with MapLibre and deck.gl; plots with Plotly. The app supersedes the earlier Shiny explorers (Hexagon, Cruise and Contour) and shares its section-drawing conventions with [CTD Transects](/tools/ctd-transects/).
