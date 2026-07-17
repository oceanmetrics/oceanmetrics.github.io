---
title: CalCOFI.io
status: current
weight: 2
client: CalCOFI · Scripps
years: "2021 – present"
role: Technical lead
image: img/projects/calcofi.png
site_url: https://calcofi.io
site_label: CalCOFI.io
repo: https://github.com/CalCOFI
summary: "From ship to screen — turning 75+ years of California Current ocean data into open apps, an API, and a versioned database."
stack:
  - R
  - Shiny
  - DuckDB / WASM
  - PostGIS
  - H3 + MapLibre
  - FastAPI
  - Docker
links:
  - label: "Integrated hex-map app"
    url: https://app.calcofi.io/db-viz-hex/
  - label: "Browser SQL query playground"
    url: https://calcofi.io/db-query/
  - label: "REST API"
    url: https://api.calcofi.io/
  - label: "calcofi4r R package"
    url: https://calcofi.io/calcofi4r/
---

**CalCOFI** — the California Cooperative Oceanic Fisheries Investigations — has sampled the California
Current since **1949**, making it one of the longest-running ocean observing programs anywhere. The
data are extraordinary; getting to them used to be hard.

CalCOFI.io is the open-data software ecosystem that fixes that: **from ship to screen.** Reproducible
workflows ingest each dataset — ichthyoplankton, CTD casts, bottle chemistry, marine mammals — into a
single *versioned integrated database*. That database then powers interactive mapping apps, a
browser-based SQL playground, a REST API, and the `calcofi4r` R package.

As technical lead, I designed the pipeline and the stack behind it — DuckDB and Parquet for frozen
releases, PostGIS and an H3 hexagonal tile server for the maps, FastAPI for the API, all wired
together with Docker — serving scientists, resource managers, students, and the public alike.
