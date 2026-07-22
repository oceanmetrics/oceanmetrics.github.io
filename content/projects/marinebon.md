---
title: Marine BON
status: current
weight: 3
client: US MBON
years: "2024 – present"
role: Site architect & developer
image: img/projects/marinebon.png
site_url: https://marinebon.org/hugo2
site_label: MarineBON.org
repo: https://github.com/marinebon/hugo2
summary: A network hub for the U.S. Marine Biodiversity Observation Network — connecting regional observing nodes, tools, datasets, and methods.
stack:
  - Hugo
  - Custom design system
  - d3.js
  - Pagefind
  - Python
  - GitHub Actions
links:
  - label: "MarineBON.org"
    url: https://marinebon.org
  - label: "MBON on GitHub"
    url: https://github.com/marinebon
---

The **Marine Biodiversity Observation Network (MBON)** knits together long-term observing programs
into a connected, open record of marine life. Its web presence needs to do the same — pull regional
nodes, a tool and dataset catalog, methods, news, and partner organizations into one coherent,
maintainable place.

I designed and built a prototype of the https://marinebon.org site: a custom **Hugo** architecture with its own design-token system, an
interactive rotating **d3 globe** of network nodes, a faceted tag-and-search system, and a no-Git
contribution pipeline that lets scientists add content through GitHub issue forms. Python harvesters
pull datasets and papers automatically from OBIS, GBIF, EDI, and ERDDAP.

The same architecture — proven, fast, and free to host on GitHub Pages — is what this Ocean Metrics
site is built on.
