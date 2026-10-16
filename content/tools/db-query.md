---
title: CalCOFI SQL Query
summary: An in-browser SQL playground over the CalCOFI release — write a query, run it against Parquet with DuckDB-WASM, download the result.
project:
- calcofi
tool_type: app
status: production
tech:
- DuckDB-WASM
- SQL
- Parquet
- Jekyll
link: https://calcofi.io/db-query/
repo: CalCOFI/db-query
weight: 6
shot:
  wait: 6000
---

The SQL playground loads the release Parquet files directly into DuckDB running in your browser. Queries never leave your machine and there is no server to rate-limit. Starter queries mirror the SQL emitted by [calcofi4r](/tools/calcofi4r/) and [calcofi4py](/tools/calcofi4py/), so a query sketched here drops straight into an R or Python analysis.
