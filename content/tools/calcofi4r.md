---
title: calcofi4r
summary: The R package for CalCOFI — read any release dataset, summarize by station, cruise or hexagon, and plot it, from one function call.
project:
- calcofi
tool_type: package
status: production
tech:
- R
- DuckDB
- Parquet
link: https://calcofi.io/calcofi4r/
repo: CalCOFI/calcofi4r
version_from: DESCRIPTION
weight: 10
---

`calcofi4r` wraps the release Parquet files and the integrated database so an analyst can get a tidy data frame in one line. Functions cover reading datasets, filtering by space and time, summarizing by station, line, cruise or H3 hexagon, and standard visualizations. The package is documented with pkgdown and tested with testthat.
