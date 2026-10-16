---
title: CalCOFI Data Catalog
summary: A STAC catalog of every CalCOFI dataset and spatial layer, one item per database release, browsable in the browser.
project:
- calcofi
tool_type: catalog
status: production
tech:
- STAC
- Parquet
link: https://calcofi.io/stac/
repo: CalCOFI/CalCOFI.github.io
repo_path: stac
weight: 12
shot:
  wait: 8000
---

The catalog describes each release of the integrated database using the SpatioTemporal Asset Catalog (STAC) standard: one collection per dataset and per spatial layer, one item per release, with links to the Parquet assets. STAC Browser renders it for people; any STAC client can read it for machines.
