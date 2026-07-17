# Ocean Metrics — Website Redesign & Execution Plan

> Rebuild oceanmetrics.io as a Hugo site (modeled on the `marinebon/hugo2` prototype),
> replacing the current boilerplate Quarto site. Position Ocean Metrics LLC (the
> rebrand of EcoQuants LLC — a solo practice, Ben Best) as a premium ocean-data-science
> studio, with a portfolio of current + past projects and a personal bio.

## 1. Context — why this change

- The current site is generic AI boilerplate: `index.qmd` (invented "platform" copy),
  `applications.qmd` and `examples/ocean-temperature.qmd` (fabricated apps + synthetic
  data). None of it reflects the real business. **Delete all three.**
- **Company rebrand:** EcoQuants LLC → **Ocean Metrics LLC**. This is a solo consultancy
  (Ben Best, PhD). ecoquants.com must forward/point to the new site.
- **Architecture decision (locked):** Hugo, reusing the `marinebon/hugo2` custom-layout
  scaffold — the user just built that and liked the workflow.
- **Design workflow (locked):** generate a design system via **claude.ai/design**, and
  hero/section imagery via **Gemini "Nano Banana"** (same as marinebon/hugo2).
- **Domain:** `oceanmetrics.io` (DNS already resolves to GitHub Pages; repo has no CNAME
  yet — this activates it, matching the README TODO). `oceanmetrics.github.io` redirects.

## 2. Decisions locked in

| Topic | Decision |
|---|---|
| Generator | Hugo extended (pin `0.163.3`, as hugo2), **no theme** — custom `layouts/` + token CSS |
| Source of scaffold | Copy build/deploy + token-CSS + component patterns from `../../marinebon/hugo2` |
| Deploy | GitHub Actions → GitHub Pages (Hugo + Pagefind + link-check), replacing the Quarto `publish.yml` |
| Domain | `oceanmetrics.io` via `CNAME` |
| Framing | Solo studio: "I" voice in bio, "Ocean Metrics" as the studio brand |
| Design | claude.ai/design system (prompt in §7); imagery via Gemini Nano Banana (§8) |
| Type | Space Grotesk (display) · IBM Plex Sans (body) · IBM Plex Mono (data) — carried from hugo2 |

## 3. Information architecture (sitemap)

```
/ (home)            hero → what I do → featured projects → services → about teaser → contact CTA
/projects/          portfolio grid: current (3 flagship) + past (EcoQuants archive)
/projects/<slug>/   optional per-project detail pages (start with the 3 current ones)
/about/             bio (Ben Best), studio story (EcoQuants→Ocean Metrics, ensō origin), CV links
/services/          Analyze · Develop · Train (carried from EcoQuants, refreshed)
/contact/           email + form (Google Apps Script endpoint, as hugo2)
404
/search/            Pagefind (optional; keep if content grows)
```

Navbar: **Projects · Services · About · Contact** + GitHub icon. Keep it lean.

## 4. Content plan (real content, from site inventories)

### Featured / current projects (flagship cards, link out)

**MarineSensitivity.org** — *BOEM marine sensitivity atlas*
- One-liner: "A BOEM-sponsored atlas mapping marine species sensitivity to guide U.S. offshore energy planning."
- Card (~60w): Fuses species distribution models, extinction-risk scores, and conservation
  status for 16,000+ marine species into composite sensitivity surfaces across the U.S. Outer
  Continental Shelf, delivered as interactive mapping apps, open data (STAC/Parquet), and
  reproducible workflows supporting evidence-based leasing and environmental review.
- Links: marinesensitivity.org · app.marinesensitivity.org/scores · /species · /docs
- Stack: R/Quarto/Shiny, mapgl (Mapbox/MapLibre globe), STAC + partitioned Parquet on S3, PostGIS
- Hero/screenshot asset: `images/mapgl-map.png`; credibility badge: `images/logo_BOEM.png`

**CalCOFI.io** — *"From ship to screen"* (Ben Best = technical lead)
- One-liner: "Turning 75+ years of California Current ocean data into open apps, an API, and a database."
- Card (~60w): The open-data platform for the California Cooperative Oceanic Fisheries
  Investigations, sampling the California Current since 1949 — one of the world's longest ocean
  time series. Reproducible workflows load every dataset into a versioned integrated database
  powering interactive maps, a browser SQL playground, a REST API, and an R package.
- Links: calcofi.io · app.calcofi.io/db-viz-hex · api.calcofi.io · calcofi.io/docs
- Stack: R/Shiny, DuckDB + DuckDB-WASM, Parquet, PostGIS, H3 + MapLibre, FastAPI, Docker/Caddy
- Hero/screenshot asset: `images/db-viz-hex.png`; brand: `assets/logo_calcofi.svg`

**Marinebon.org (US MBON)** — *marine biodiversity observation network*
- One-liner: "A network hub connecting U.S. marine biodiversity observing — tools, data, methods, and people."
- Card (~60w): The web presence for the U.S. Marine Biodiversity Observation Network — a Hugo
  site knitting together regional observing nodes, a tool and dataset catalog, methods, news,
  and partner organizations, with an interactive rotating globe of network sites and a no-Git
  contribution pipeline. (Ocean Metrics designed and built the site.)
- Links: marinebon.org · github.com/marinebon
- Stack: Hugo (custom layouts + token CSS), d3 globe, Pagefind search, Python harvesters (OBIS/GBIF/EDI/ERDDAP)

### Past projects (EcoQuants archive — smaller cards / condensed list)

From `../../ecoquants/ecoquants.github.io`: eDNA Explorer (MBON/NOAA/NASA), Biodiversity
Synthesis & Viz — MBON, Ocean Health Index viz (Conservation International/NCEAS), coral-reef
interactive infographic (MBON), Route Ships to Avoid Whale Strike (Duke PhD), Site Offshore Wind
Energy (Best & Halpin 2019, PLOS ONE), Check Water Quality, Submarine Cable Conflict Analysis
(NREL). Clients to surface as logos: **NASA, NOAA, NREL, NCEAS, Conservation International, MBON, Duke**.

### About / bio (solo LLC — modeled on the EcoQuants about page)

- **Ben Best, PhD** — Environmental Data Scientist & Founder. Marine spatial ecology; former
  lecturer, UCSB Bren School; former senior analyst, Ocean Health Index (NCEAS); PhD 2016, Duke
  Marine Geospatial Ecology Lab. CV: bdbest.org/cv · benbestphd.com.
- **Studio story:** EcoQuants LLC (formed Feb 2017) is now **Ocean Metrics LLC**. Carry forward
  the ensō (incomplete Zen circle hiding a "Q") origin story as brand heritage — "measuring the
  ocean while embracing uncertainty." U.S.-registered LLC, St. Petersburg, FL.
- Reusable portrait assets in `../../ecoquants/.../images/`: `ben_full.jpg`, `Ben_2017-3.jpg`,
  `bbest_swcarpentry.jpg` (teaching).

### Services (carried from EcoQuants, refreshed)

**Analyze** (reproducible research in R/Python) · **Develop** (Shiny/Quarto apps, APIs, cloud
hosting, interactive maps) · **Train** (certified Software/Data Carpentry instructor). Refresh
copy to match the new project examples.

## 5. Technical architecture — what to reuse from `marinebon/hugo2`

Copy nearly as-is, then re-skin:
- **Build/deploy toolchain**: `.github/workflows/deploy.yml` (Hugo-extended → Pagefind →
  `scripts/check_links.py` → Pages), `scripts/reindex.sh`, `scripts/check_links.py`. Swap
  `HUGO_VERSION`/`baseURL`.
- **Token-CSS architecture**: `static/css/styles.css` → `tokens/{fonts,colors,typography,spacing,base}.css`
  + `components.css` + `layout.css`. Keep structure; re-skin `colors.css`/`fonts.css` to the new
  design-system palette.
- **Custom-layout scaffold**: `layouts/_default/{baseof,single,list}.html`, `404.html`,
  `partials/{header,footer,head}.html`.
- **Component patterns** (all data/param-driven → domain-agnostic): config-driven hero,
  **stats-band** (`data/stats.yaml`), **card dispatcher** (`partials/card.html`) — build a
  `card-project` variant, contact form (Google Apps Script), FAQ accordion, partners/clients grid
  (`data/partners.yaml` → reuse for the client-logo strip).

Drop / don't port: `globe.html`+`globe.js` (network-node specific — optional if a map story is
wanted), `methods-band`, `harvest_datasets.py`, `import_papers.py`, COinS/Zotero, all MBON
`content/` and section templates, stale `products`/`regions` archetypes.

New content model: a single `content/projects/*.md` type with front matter
(`title, client, year, status: current|past, url, repo, image, stack[], summary`) driving the
portfolio grid — no per-type harvesters needed.

## 6. Repo, domain & deploy plan

1. New Hugo scaffold replaces Quarto: remove `index.qmd`, `applications.qmd`, `examples/`,
   `_quarto.yml`, `styles.css`, `index.css`, `DESCRIPTION` (R deps no longer needed for a Hugo
   build). Keep `LICENSE`, `favicon.svg` (or replace with new mark), `.git`, `.github/` (rewrite
   the workflow).
2. Add `hugo.yaml`, `layouts/`, `static/`, `content/`, `data/`, `archetypes/`, `scripts/`.
3. Replace `.github/workflows/publish.yml` (Quarto) with the Hugo `deploy.yml`.
4. Add `CNAME` = `oceanmetrics.io`; set `baseURL` accordingly. Confirm Pages custom-domain in
   repo settings after first deploy.
5. Update `DESCRIPTION`/author email if kept anywhere: `ben@ecoquants.com` → new address.

## 7. Prompt for claude.ai/design (copy-paste)

> **Design a website design system for "Ocean Metrics" — a boutique ocean-data-science studio.**
>
> Ocean Metrics is a one-person consultancy run by a marine data scientist (PhD, marine spatial
> ecology). The studio builds reproducible data pipelines, species-distribution models,
> interactive maps and web apps, and open-data platforms for ocean science — clients include
> federal agencies (BOEM, NOAA, NASA, NREL) and research programs (CalCOFI, US MBON, Ocean Health
> Index). The tone is **scientifically authoritative, precise, and quietly premium** — think a
> peer-reviewed atlas crossed with a modern data studio. Not corporate-generic, not startup-loud.
>
> **Deliver a full design system**: color tokens (light + dark), typography scale, spacing scale,
> and styled components. Use a **deep-ocean palette** — abyssal navy / near-black backgrounds,
> cobalt and ocean-teal primaries, a warm coral accent for calls-to-action and data highlights,
> plus bioluminescent teal/cyan glows. Typography: **Space Grotesk** for display/headlines, **IBM
> Plex Sans** for body, **IBM Plex Mono** for data, metrics, and code. Favor generous whitespace,
> crisp hairline rules, and a subtle "measurement / gridded data" motif (fine grids, contour
> lines, tessellated facets, connected data nodes).
>
> **Components to design:**
> 1. A **hero** with a large full-bleed illustration background, an eyebrow label, a bold headline,
>    a one-line lead, and two buttons (primary coral + ghost).
> 2. A **stats band** — 3–4 big monospaced figures with labels (e.g. "16,000+ species mapped",
>    "75+ years of ocean data", "20 BOEM planning areas").
> 3. A **project portfolio grid** — cards with a screenshot image, client/agency badge, title,
>    one-line summary, a small stack/tag row, and a "View project →" link; distinguish "current"
>    vs "past" projects.
> 4. A **services** trio (Analyze / Develop / Train) as icon + heading + short copy.
> 5. An **about / bio** section — portrait, name + title, narrative, and a row of client logos.
> 6. A **contact** section with a simple form and email.
> 7. Nav header (light logo) + footer.
>
> Design **both light and dark themes** from the same tokens (dark is the signature look). Show the
> hero, a populated project grid, the stats band, and the about section. Make it feel like a
> premium magazine centerpiece that still reads as a working scientist's studio.

## 8. Imagery generation plan

**Primary model:** Google **Gemini "Nano Banana"** (Gemini 3 Pro image) — best one-shot per the
marinebon/hugo2 experience ("tweaks become fraught," so prompt for the whole composition at once,
then do minimal edits). Downsample the ~6 MB PNG outputs for web. Alternatives if needed:
Midjourney v6 (painterly heroes), Ideogram (if any in-image text), Recraft (vector/flat-diagram
consistency across a set).

**(a) Home hero — "measuring the ocean" (16:9):**
> A wide-format (16:9) scientific illustration in a clean, flat-diagram vector style: a cross-section
> from space to seafloor showing how ocean data is measured and synthesized. Limited palette of deep
> navy, ocean teal, steel blue, and warm coral on a near-black navy background. No text or labels.
> Top: a satellite with downward scan-line sensor fans. Surface: a research vessel with a faint sonar
> cone; seabirds. A crisp luminous ocean-surface boundary with gentle waves. Mid-water: an underwater
> glider emitting acoustic beams, a tagged fish with radiating signal arcs, a rising DNA double-helix
> from a water sample (eDNA). Seafloor: a benthic sensor lander; soft coral. Far-right edge: a
> translucent data-viz overlay — thin time-series lines and a fragment of a world-map heatmap —
> suggesting synthesis. Deep, luminous, scientifically authoritative; teal bioluminescence accents;
> premium-magazine centerpiece that also works as a UI background. Aspect ratio 16:9, no letterboxing.

**(b) Abstract brand/section motif (for section dividers, card fallbacks):**
> A minimalist abstract illustration on a near-black navy background: a tessellated ocean-wave surface
> rendered as a low-poly faceted mesh, with glowing cyan-teal data nodes connected by thin lines
> across the facets — evoking a measurement grid over water. A single incomplete circle (ensō)
> subtly integrated as a horizon. Deep navy, cobalt, ocean teal, one warm coral node. Flat vector,
> clean, lots of negative space. 16:9 and a 1:1 crop variant. No text.

**(c) Project-card fallback tiles** (use only where no real screenshot exists): request 1:1 or 16:10
flat-diagram tiles in the same palette themed to each project (offshore-energy map grid; a hex-tile
data map for CalCOFI; a network-of-nodes globe for MBON). Prefer **real screenshots** where they
exist: `mapgl-map.png` (MarineSensitivity), `db-viz-hex.png` (CalCOFI).

**(d) Favicon / logo:** commission or generate an ensō-derived mark (nod to the EcoQuants heritage)
in the new palette; export SVG + favicon set.

## 9. EcoQuants → Ocean Metrics handoff

`../../ecoquants/ecoquants.github.io` is a committed blogdown/Hugo build (source in `src/`,
`publishDir=".."`, served from `master` root; no CI). No 404 page, no shared JS include, so the
clean options are:
- **Recommended — full site-wide redirect:** add a `<meta http-equiv="refresh" content="0; url=https://oceanmetrics.io/">`
  (plus canonical + a visible "EcoQuants is now Ocean Metrics" fallback link) to the theme `<head>`
  partial in `src/`, rebuild with `blogdown::build_site()`, commit. Every deep link forwards.
- **Quickest:** hand-edit the committed root `index.html` with the same meta-refresh (static build,
  no toolchain needed) — homepage-only.
- Keep the repo as an archive; projects live on the new site's Projects page.
- Also point `oceanmetrics.github.io` → `oceanmetrics.io` (via the new CNAME on this repo).

## 10. Phased execution checklist

**Phase 0 — Design & assets (parallel, no code):**
- [ ] Run the §7 prompt in claude.ai/design; export tokens (colors, type, spacing).
- [ ] Generate §8 hero (a) + motif (b) in Gemini Nano Banana; downsample for web.
- [ ] Pull screenshots: `mapgl-map.png`, `db-viz-hex.png`; client logos (BOEM, NASA, NOAA, NREL, NCEAS).

**Phase 1 — Scaffold:**
- [ ] Copy hugo2 build/deploy + token-CSS + baseof/list/single/partials into this repo.
- [ ] Remove Quarto files (`index.qmd`, `applications.qmd`, `examples/`, `_quarto.yml`, `*.css`, `DESCRIPTION`).
- [ ] New `hugo.yaml` (title, menu, params: hero copy, github_repo, contact_endpoint, baseURL).
- [ ] Re-skin `colors.css`/`fonts.css` from the design-system tokens.

**Phase 2 — Content:**
- [ ] `content/projects/*.md` for the 3 current + past-project archive; `card-project` partial + grid.
- [ ] Home (`layouts/index.html`): hero → stats-band → featured projects → services → about teaser → contact.
- [ ] `about.md` (bio + studio story), `services` page, `contact.md`.
- [ ] `data/{stats,partners}.yaml` (headline figures + client logos).

**Phase 3 — Ship:**
- [ ] `CNAME` = oceanmetrics.io; swap workflow to Hugo `deploy.yml`; verify Pages custom domain.
- [ ] EcoQuants redirect (§9).

## 11. Verification

- Local: `hugo server` → visually check home, projects grid (light + dark), about, contact, 404.
- Build parity with CI: `hugo --gc --minify` then `npx pagefind --site public` then
  `python3 scripts/check_links.py public` — all must pass (link-check gates the deploy).
- After deploy: confirm oceanmetrics.io serves over HTTPS with the custom domain; confirm
  ecoquants.com redirects to oceanmetrics.io; check hero image + fonts load (no CDN/CSP surprises).
- Responsive/theme pass on mobile widths; verify project card images have alt text.

## Decisions (resolved 2026-07-17)
1. Domain: **oceanmetrics.io** ✓
2. Contact email: **ben@oceanmetrics.io** ✓
3. EcoQuants: **full site-wide redirect** to oceanmetrics.io ✓ (see §9; not yet applied — separate repo)
4. Services: **folded into Home + About** (no dedicated /services page) ✓
5. Interactive globe: **skipped for v1** ✓

## Build status (2026-07-17)
**Phases 1–3 complete — the Hugo site is built and verified locally.**
- Quarto boilerplate removed; Hugo scaffold in place (hugo.yaml, layouts/, static/, content/, data/, scripts/).
- Design-system CSS ported from hugo2 (tokens + components + layout) + `om.css` for OM-specific components.
- Home (hero → stats → current projects → services → about teaser + client strip → contact CTA),
  Projects (current grid + EcoQuants archive), 3 project detail pages, About (bio), Contact, 404.
- Real assets copied in: project screenshots (MarineSensitivity, CalCOFI, MarineBON), client logos
  (BOEM/NOAA/NASA/NREL/NCEAS), portrait. Deploy workflow + link-checker wired; `hugo --gc --minify`
  and `check_links.py` both pass; CNAME = oceanmetrics.io in the build.

**Remaining (Phase 0 polish, optional before launch):**
- Run the §7 claude.ai/design prompt → swap `tokens/colors.css` + `tokens/fonts.css` for the output.
- Generate the §8 Gemini hero illustration → set `params.heroImage` in hugo.yaml (a CSS gradient +
  data-grid motif is the current placeholder).
- Commission the ensō-derived logo/favicon.
- Apply the EcoQuants → oceanmetrics.io redirect (§9) in the ecoquants repo.
- In GitHub: Settings → Pages → set source to GitHub Actions and custom domain oceanmetrics.io.
