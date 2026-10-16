---
title: calcofi4db
summary: The builder's package — ingest every CalCOFI dataset, version the integrated database, and publish each release as Parquet and a STAC catalog.
project:
- calcofi
tool_type: package
status: production
tech:
- R
- DuckDB
- PostGIS
- STAC
link: https://calcofi.io/calcofi4db/
repo: CalCOFI/calcofi4db
version_from: DESCRIPTION
weight: 21
---

`calcofi4db` is the engine behind the [workflows](/tools/calcofi-workflows/): it loads source datasets into PostGIS, checks them, freezes a versioned release to Parquet, and writes the [STAC catalog](/tools/calcofi-stac/) that describes it. It is aimed at the people who build the database rather than those who use it.
