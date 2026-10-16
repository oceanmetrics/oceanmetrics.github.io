---
title: Marine Sensitivity STAC API
summary: A searchable STAC API with one item per species model — ask which models cover an area and get the answer as STAC.
project:
- marinesensitivity
tool_type: api
status: beta
tech:
- Python
- FastAPI
- STAC
- DuckDB
link: https://stac-api.marinesensitivity.org/
repo: MarineSensitivity/server
repo_path: stac-api
weight: 13
shot:
  url: https://stac-api.marinesensitivity.org/api.html
  wait: 6000
---

Where the static catalog lists datasets, the STAC API indexes every individual species distribution model, so a client can search by bounding box, taxon or date. It is built on stac-fastapi with a DuckDB backend over Parquet.
