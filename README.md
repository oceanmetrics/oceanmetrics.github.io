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
content/               _index, projects/*, tools/*, about, contact
  projects/*.md        one file per current project (status: current|past, front matter drives the cards)
  tools/*.md           one file per tool in the gallery (see "Tools gallery" below)
data/                  stats.yaml, clients.yaml, past_projects.yaml (EcoQuants archive)
  tools_tags.yaml      facet registry for the gallery (project / kind / status / tech labels + colors)
  tools_status.json    AUTO: last commit, version, HTTP status per tool (scripts/tools_refresh.py)
  tools_shots.json     AUTO: when each screenshot was taken, whether a dark variant exists
assets/img/tools/      AUTO: <slug>-light.png / -dark.png screenshots (scripts/tools_shots.py); Hugo resizes to webp
layouts/               baseof, index (home), projects/{list,single}, tools/{list,single}, _default/{about,contact,single,list}, 404, partials/
static/css/            styles.css (manifest) → tokens/* + components.css + layout.css + om.css
static/js/             theme.js (light/dark toggle), tools-filter.js (gallery filter/search/sort, URL-synced)
static/img/            project screenshots, client logos, portrait
static/CNAME           oceanmetrics.io
scripts/check_links.py internal-link checker (fails CI on broken links)
scripts/tools_*.py     gallery refresh: status from the GitHub API + Playwright screenshots
.github/workflows/     deploy.yml — build with Hugo, link-check, publish to Pages
                       refresh-tools.yml — weekly (Mon 06:17 UTC) status + screenshot refresh, commits, redeploys
```

## Adding a project

Create `content/projects/<slug>.md` with front matter (`title`, `status`, `weight`,
`client`, `years`, `role`, `image`, `site_url`, `repo`, `summary`, `stack`, `links`) and a
markdown body. `status: current` projects appear in the home + portfolio grids;
`status: past` are omitted from the grid (the EcoQuants archive lives in
`data/past_projects.yaml`).

## Tools gallery (`/tools/`)

One page per tool in `content/tools/<slug>.md`. Front matter:

| field | meaning |
|---|---|
| `title`, `summary` | card title and one-sentence summary |
| `project` | list of project keys from `data/tools_tags.yaml` (`calcofi`, `marinesensitivity`, `marinebon`, `oceanmetrics`); a tool may belong to several |
| `tool_type` | `app` · `package` · `api` · `catalog` · `docs` · `notebook` · `site` |
| `status` | `production` · `beta` · `archived` · `superseded` (+ `superseded_by: <slug>`) |
| `tech` | free list of technologies; chips on the card, pills in the filter |
| `link` | the live URL (`url` is reserved by Hugo) |
| `repo`, `repo_path`, `repo_branch` | GitHub `owner/name`, optional subfolder for monorepos, optional branch (default: the repo's default branch) |
| `version_from` | `DESCRIPTION`, `pyproject.toml` or `package.json` to read a version from |
| `docs`, `featured`, `credit`, `weight` | optional docs URL, pin to the top, who built it, manual order |
| `shot` | screenshot recipe: `url` override, `wait` ms, `click` selector, `js` to run, `skip: true` |

The body is the long description. Pages link to each other with `/tools/<slug>/`.
The gallery filters client-side (`static/js/tools-filter.js`) and deep-links as
`/tools/?project=calcofi&kind=app&tech=r&q=hex`, which the project pages use.

**Auto-updates.** `.github/workflows/refresh-tools.yml` runs weekly (and on demand from the
Actions tab, optionally for a few slugs) and:

1. `scripts/tools_refresh.py` — reads each tool's last commit, version and live HTTP status
   into `data/tools_status.json` (keeps the old record if a lookup fails).
2. `scripts/tools_shots.py` — Playwright captures 1280×800 light and dark screenshots into
   `assets/img/tools/`; the dark file is dropped when the tool has no dark theme, and a file is
   only replaced when more than 1 % of pixels changed, so git history stays quiet.
3. Commits what changed and dispatches `deploy.yml` (pushes made with `GITHUB_TOKEN` do not
   trigger push workflows on their own).

Locally: `uv venv .venv && uv pip install -r scripts/requirements-tools.txt && .venv/bin/python -m playwright install chromium`,
then `.venv/bin/python scripts/tools_refresh.py --only explore` (uses `gh auth token`) and
`.venv/bin/python scripts/tools_shots.py --only explore --force`.

## Deploy

Push to `main`; GitHub Actions builds and publishes to Pages. Set the custom domain to
`oceanmetrics.io` in **Settings → Pages** (the `static/CNAME` file is also included in the build).

## Roadmap

See [`PLAN.md`](PLAN.md) — the design system (via claude.ai/design) and hero/section
imagery (via Gemini) are the remaining polish; the current build ships with a proven
ocean palette and a CSS gradient hero as placeholders.
