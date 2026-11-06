---
title: "storage.oceanmetrics.io moves to Cloudflare; obis-hex retires into the atlas"
date: 2026-10-24
project: atlas
summary: The platform's published data is now served by a Cloudflare Worker from R2, and the old OBIS-hex app redirects to the Ocean Metrics atlas.
links:
  - label: Ocean Metrics atlas
    url: https://oceanmetrics.io/atlas/
  - label: oceanmetrics on GitHub
    url: https://github.com/oceanmetrics
---

Two visible changes from the October platform restructure. First, **storage.oceanmetrics.io** is
served by a Cloudflare Worker from R2 buckets: every catalog resolves by range request, the
restricted prefixes stay closed, CORS is set, and immutable release files are cached at the edge
(about 200 ms median on the cutover check).

Second, the stand-alone **obis-hex** app retired on 24 October. Every old link lands on a notice and
carries on to the atlas, which now reads the same OBIS-by-hexagon files; `?noredirect=1` keeps the
old app for anyone who needs it.
