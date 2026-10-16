---
title: CalCOFI ERDDAP
summary: The CalCOFI datasets served through ERDDAP's tabledap and griddap interfaces, for the wider ocean-data community.
project:
- calcofi
tool_type: api
status: production
tech:
- ERDDAP
- DuckDB
- Docker
link: https://erddap.calcofi.io/erddap/
repo: CalCOFI/erddap
weight: 13
---

ERDDAP is the lingua franca of oceanographic data servers. This instance, backed by DuckDB, exposes the CalCOFI release datasets so any ERDDAP-aware tool — from Python and R clients to NOAA portals — can subset and download them in dozens of formats.
