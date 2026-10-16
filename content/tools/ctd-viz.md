---
title: CTD Explorer
summary: CTD profiles and maps by cruise, station and depth, with a transect you define by clicking stations on the map.
project:
- calcofi
tool_type: app
status: production
tech:
- R
- Shiny
- DuckDB
- MapLibre
link: https://app.calcofi.io/ctd/
repo: CalCOFI/apps
repo_path: ctd-viz
weight: 8
shot:
  wait: 8000
---

The Shiny CTD Explorer complements [CTD Transects](/tools/ctd-transects/): instead of fixed lines it lets you pick any set of stations on the map and draws the profiles and section between them.
