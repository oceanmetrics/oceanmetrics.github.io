---
title: Marine Sensitivity
status: current
weight: 1
client: BOEM
years: "2023 – present"
role: Founder & lead scientist
image: img/projects/marinesensitivity.png
site_url: https://marinesensitivity.org
site_label: MarineSensitivity.org
repo: https://github.com/MarineSensitivity
summary: A BOEM-sponsored atlas mapping where offshore energy development meets vulnerable marine life across the U.S. Outer Continental Shelf.
stack:
  - R
  - Quarto
  - Shiny
  - Mapbox GL
  - STAC + Parquet
  - PostGIS
  - AWS S3
links:
  - label: "Composite sensitivity scores app"
    url: https://app.marinesensitivity.org/scores/
  - label: "Species distributions app"
    url: https://app.marinesensitivity.org/species/
  - label: "Documentation & methods"
    url: https://marinesensitivity.org/docs/
---

Offshore wind, oil, and gas decisions on the U.S. Outer Continental Shelf all turn on the same
question: **where does energy development overlap the most vulnerable marine life?** The Marine
Sensitivity toolkit answers it with data.

Sponsored by the **Bureau of Ocean Energy Management (BOEM)**, the project fuses species distribution
models, extinction-risk scores, and federal conservation status for **more than 16,000 marine
species** — fish, marine mammals, seabirds, sea turtles, corals, and invertebrates — into composite
*sensitivity surfaces* across the twenty BOEM planning areas.

Those surfaces are delivered as interactive Mapbox globe apps, an open STAC + partitioned-Parquet
data release on S3, and reproducible R and Quarto workflows — so leasing decisions and environmental
reviews rest on evidence anyone can inspect and rerun.
