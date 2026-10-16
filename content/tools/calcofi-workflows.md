---
title: CalCOFI Workflows
summary: The reproducible notebooks that ingest every dataset and build each database release, published as rendered pages.
project:
- calcofi
tool_type: notebook
status: production
tech:
- R
- Quarto
- targets
link: https://calcofi.io/workflows/
repo: CalCOFI/workflows
weight: 31
---

Every step from raw source files to a frozen release is a Quarto notebook orchestrated by targets. The rendered notebooks are published so that anyone can see exactly how a release was built and rerun it.
