---
title: Marine Places gazetteer
summary: One STAC catalog of marine place layers — sanctuaries, marine regions, planning areas — with stable identifiers, licences and H3 membership.
project:
- oceanmetrics
- marinebon
tool_type: catalog
status: beta
tech:
- Python
- STAC
- GeoParquet
- PMTiles
- H3
link: https://oceanmetrics.io/places/
repo: oceanmetrics/places
docs: https://storage.oceanmetrics.io/gazetteer/
weight: 7
shot:
  wait: 8000
---

The gazetteer collects the boundary layers that ocean analyses keep needing, normalizes them into GeoParquet and PMTiles with a stable `place_id` per feature, and publishes them as a STAC catalog that the Atlas, ERDDAP Places and OBIS Hex all share.
