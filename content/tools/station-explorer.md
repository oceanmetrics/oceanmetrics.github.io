---
title: Station Explorer
summary: Click any CalCOFI station to see every dataset and variable ever collected there, across 75 years of cruises.
project:
- calcofi
tool_type: app
status: production
tech:
- JavaScript
- MapLibre
link: https://app.calcofi.io/station/
repo: CalCOFI/db-viz-station
weight: 5
shot:
  wait: 5000
---

Station Explorer answers the simplest question a CalCOFI user has — *what has been measured here?* — for each of the standard stations on the sampling grid. Clicking a station lists its datasets, variables and sampling history from prebuilt JSON, drawn on a MapLibre map.

It grew out of the 2026 UCSB PSTAT 197 student station portal and now replaces it.
