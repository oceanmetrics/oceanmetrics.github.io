---
title: Ocean Metrics ERDDAP
summary: An ERDDAP with CORS and Parquet output that re-serves upstream NOAA datasets for browser-based apps.
project:
- oceanmetrics
tool_type: api
status: production
tech:
- ERDDAP
- Docker
link: https://erddap.oceanmetrics.io/erddap/
repo: oceanmetrics/erddap
weight: 24
---

Browser apps need an ERDDAP that allows cross-origin requests and can return compact formats. This instance mirrors selected upstream datasets with those features switched on.
