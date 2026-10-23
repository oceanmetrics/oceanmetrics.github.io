---
title: Docs
eyebrow: Docs
summary: Where each Ocean Metrics app keeps its documentation, what a Place page is, the schemas, the brand kit and the entry point of every catalog.
description: Documentation index for the Ocean Metrics apps, schemas, brand kit and data catalogs.
layout: docs
place:
  title: The Place page, in three lines
  lines:
    - One address per place. Every place in the gazetteer has a page at <code>/places/p/&lt;id&gt;/</code>, built from the same stable identifier that the catalogs and the indicators use.
    - The page holds the map with the place outlined, the layers that cover it, its metadata, licence, attribution and citation, and downloads. Indicator cards and the atlas layers for the place join it in the build weeks to 2026-12-10.
    - 'Example: the Channel Islands National Marine Sanctuary (CINMS, id <code>NMS:CINMS</code>) lives at <code>/places/p/NMS:CINMS/</code>.'
  example: https://oceanmetrics.io/places/p/NMS:CINMS/
  example_label: Open the CINMS page
apps:
  - name: Places
    what: The marine gazetteer and the Place page.
    app: https://oceanmetrics.io/places/
    readme: https://github.com/oceanmetrics/places#readme
    folder: https://github.com/oceanmetrics/places/tree/main/web/docs
    folder_label: web/docs
    live: https://oceanmetrics.io/places/docs/
    live_label: Docs page (STAC, layers.json, URL grammar, DuckDB, Python and R recipes)
  - name: Indicators
    what: Status and trend of ocean indicators for every place.
    app: https://oceanmetrics.io/indicators/
    readme: https://github.com/oceanmetrics/indicators#readme
    folder: https://github.com/oceanmetrics/indicators/tree/main/docs
    folder_label: docs
    note: No docs page of its own. The Help menu in the app explains how to read a cell and lists the keyboard shortcuts; the README holds the rest.
  - name: Atlas
    what: The layer browser, one codebase with a skin per organization.
    app: https://oceanmetrics.io/atlas/
    readme: https://github.com/oceanmetrics/atlas#readme
    folder: https://github.com/oceanmetrics/atlas/tree/main/docs
    folder_label: docs
    note: No docs page of its own. The About panel and the Docs link sit in the top bar of the app; the Docs link opens the README, or the docs of a release when the atlas is showing one.
more:
  - name: ERDDAP Places
    app: https://oceanmetrics.io/erddap-places/
    readme: https://github.com/oceanmetrics/erddap-places#readme
    folder: https://github.com/oceanmetrics/erddap-places/tree/main/docs
  - name: OBIS Hex
    app: https://oceanmetrics.io/obis-hex/
    readme: https://github.com/oceanmetrics/obis-hex#readme
    folder: https://github.com/oceanmetrics/obis-hex/tree/main/docs
  - name: Workflows
    app: https://oceanmetrics.io/workflows/
    readme: https://github.com/oceanmetrics/workflows#readme
  - name: Platform packages (npm)
    readme: https://github.com/oceanmetrics/platform#readme
catalogs:
  intro: The catalogs are static files. The target address of each is on <code>storage.oceanmetrics.io</code>. Until the cutover, that host answers some of them with a redirect to the S3 bucket and does not yet answer the atlas and obis-h3 entries, so the path-style S3 address is the one that works today; use it as the fallback and switch when the target answers.
  rows:
    - name: Places gazetteer
      file: layers.json
      what: One row per map layer. Schema <a href="/schemas/">places-layers</a>.
      target: https://storage.oceanmetrics.io/gazetteer/index/layers.json
      fallback: https://s3.us-east-1.amazonaws.com/oceanmetrics.io-public/gazetteer/index/layers.json
    - name: Indicators
      file: indicators.json
      what: The indicator manifest the Indicators app reads.
      target: https://storage.oceanmetrics.io/indicators/indicators.json
      fallback: https://s3.us-east-1.amazonaws.com/oceanmetrics.io-public/indicators/indicators.json
    - name: Atlas
      file: catalog.json
      what: The STAC root of the atlas collections.
      target: https://storage.oceanmetrics.io/atlas/catalog.json
      fallback: https://s3.us-east-1.amazonaws.com/oceanmetrics.io-public/atlas/catalog.json
    - name: OBIS H3
      file: collection.json
      what: The obis-h3 release as one STAC collection on the H3 grid. Schema <a href="/schemas/">h3</a>.
      target: https://storage.oceanmetrics.io/obis-h3/collection.json
      fallback: https://s3.us-east-1.amazonaws.com/oceanmetrics.io-public/obis-h3/collection.json
---
