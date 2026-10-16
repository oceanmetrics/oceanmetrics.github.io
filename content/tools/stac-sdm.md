---
title: STAC SDM extension
summary: A proposed STAC extension for describing species distribution models — taxon, method, inputs and evaluation — as standard metadata.
project:
- marinesensitivity
tool_type: catalog
status: beta
tech:
- STAC
link: https://github.com/MarineSensitivity/stac-sdm
repo: MarineSensitivity/stac-sdm
version_from: package.json
weight: 14
---

The `sdm:` extension adds fields for the taxon, modeling method, environmental inputs and evaluation statistics of a species distribution model to a STAC item, so model outputs from any program can be cataloged and compared the same way. Published as a JSON Schema with tests.
