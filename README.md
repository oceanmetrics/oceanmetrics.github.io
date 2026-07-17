# oceanmetrics.io

The Ocean Metrics LLC website — a Hugo static site deployed to GitHub Pages at
[oceanmetrics.io](https://oceanmetrics.io).

Built on the custom-layout + design-token architecture prototyped for
[marinebon.org](https://marinebon.org) (`marinebon/hugo2`). No theme, no framework —
hand-written layouts and a token-based CSS system.

## Develop

```bash
hugo server            # live preview at http://localhost:1313
hugo --gc --minify     # production build → ./public
python3 scripts/check_links.py public   # verify internal links (same gate as CI)
```

Requires Hugo **extended** ≥ 0.163 (`brew install hugo`).

## Structure

```
hugo.yaml              site config, menu, hero copy, contact params
content/               _index, projects/*, about, contact
  projects/*.md        one file per current project (status: current|past, front matter drives the cards)
data/                  stats.yaml, clients.yaml, past_projects.yaml (EcoQuants archive)
layouts/               baseof, index (home), projects/{list,single}, _default/{about,contact,single,list}, 404, partials/
static/css/            styles.css (manifest) → tokens/* + components.css + layout.css + om.css
static/img/            project screenshots, client logos, portrait
static/CNAME           oceanmetrics.io
scripts/check_links.py internal-link checker (fails CI on broken links)
.github/workflows/     deploy.yml — build with Hugo, link-check, publish to Pages
```

## Adding a project

Create `content/projects/<slug>.md` with front matter (`title`, `status`, `weight`,
`client`, `years`, `role`, `image`, `site_url`, `repo`, `summary`, `stack`, `links`) and a
markdown body. `status: current` projects appear in the home + portfolio grids;
`status: past` are omitted from the grid (the EcoQuants archive lives in
`data/past_projects.yaml`).

## Deploy

Push to `main`; GitHub Actions builds and publishes to Pages. Set the custom domain to
`oceanmetrics.io` in **Settings → Pages** (the `static/CNAME` file is also included in the build).

## Roadmap

See [`PLAN.md`](PLAN.md) — the design system (via claude.ai/design) and hero/section
imagery (via Gemini) are the remaining polish; the current build ships with a proven
ocean palette and a CSS gradient hero as placeholders.
