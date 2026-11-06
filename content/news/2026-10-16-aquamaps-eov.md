---
title: "AquaMaps EOV share product 1.0.0"
date: 2026-10-16
project: atlas
summary: Per-cell share and risk of the GOOS Essential Ocean Variable groups from AquaMaps species models, with a 6.35 billion row cell-to-species table, published to the atlas.
links:
  - label: oceanmetrics/workflows
    url: https://github.com/oceanmetrics/workflows
  - label: Ocean Metrics atlas
    url: https://oceanmetrics.io/atlas/
---

The AquaMaps EOV share product takes the AquaMaps species distribution models for **10,750
species**, groups them by the GOOS biological Essential Ocean Variables, and computes for every
half-degree cell each group's share, an extinction-risk weighted score and a composite, with an H3
twin for the atlas.

Version 1.0.0 is staged as cloud-optimized GeoTIFFs, Parquet and a STAC collection, and includes a
cell-to-species table of 6,347,722,747 rows in 1,986 tiles (8.1 GB), so a click on any cell can list
the species behind the score. The whole pipeline is one Quarto notebook with its rules in tested R
functions.
