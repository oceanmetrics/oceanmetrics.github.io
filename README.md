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

The schemas page and files are generated, not committed: run `npm ci && npm run schemas` once
before `hugo` (see "Schemas" below). Without it `/schemas/` shows a one-line hint.

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
static/js/             theme.js (light/dark toggle), tools-filter.js (gallery filter/search/sort, URL-synced),
                       alerts.js (the /alerts/ pages: subscribe, confirm, manage; pure functions are tested)
static/img/            project screenshots, client logos, portrait
static/CNAME           oceanmetrics.io
scripts/check_links.py internal-link checker (fails CI on broken links)
scripts/alerts.test.mjs node --test of the pure functions of static/js/alerts.js (`npm test`)
scripts/check-no-addresses.mjs  fails the build on any email address but the studio's own and RFC 2606 examples
scripts/*-schemas.mjs  sync-schemas (copy schemas to their $id) and check-schemas (assert they are served)
scripts/tools_*.py     gallery refresh: status from the GitHub API + Playwright screenshots
.github/workflows/     deploy.yml — build with Hugo, link-check, publish to Pages
                       refresh-tools.yml — weekly (Mon 06:17 UTC) status + screenshot refresh, commits, redeploys
```

## Alerts (`/alerts/`)

Email alerts and Atom feeds for the indicators' changes. The pages are static; `static/js/alerts.js` posts to the
om-alerts Worker (platform `workers/alerts`). Site params in `hugo.yaml`: `alerts_api` (the Worker URL; workers.dev
now, `https://alerts.oceanmetrics.io` once the zone is active) and `turnstile_site_key` (the public key; the widget
renders only when it is set). Pages: `/alerts/` (form + feeds), `/alerts/confirm/#t=` (a button POSTs the token),
`/alerts/manage/#t=` (list, update, delete, unsubscribe; `&u=all` asks to end every alert), `/alerts/privacy/`. The
form reads `?place=<id>` or the report keys `?pi=&px=&ii=&ix=&title=`. Until the Worker has its secrets every POST
answers 503 and the pages say alerts are being set up and point at the feeds.

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

## Schemas (`/schemas/`) and docs (`/docs/`)

Every JSON Schema `$id` in `oceanmetrics/platform` `packages/catalog/schemas/` is
`https://oceanmetrics.io/schemas/<name>/v<version>/schema.json`; this site serves them there.

- `package.json` pins `@oceanmetrics/catalog` (exact version). **A bump is a one-line change**: edit that
  version, `npm install` (refreshes `package-lock.json`), commit, push.
- `scripts/sync-schemas.mjs` (run by `npm run schemas` and by `deploy.yml` after `npm ci`) copies
  `node_modules/@oceanmetrics/catalog/schemas/*.schema.json` to `static/schemas/<name>/v<version>/schema.json`,
  reading each file's `$id` for the path, and writes `static/schemas/index.json` and `data/schemas.json`
  (all git-ignored). The `/schemas/` page (`content/schemas/_index.md`, `layouts/schemas/list.html`) lists them.
- `scripts/check-schemas.mjs` is the test: `node scripts/check-schemas.mjs public` asserts each schema is in the
  built site at its `$id` path with the same `$id` and bytes, listed in `index.json` and linked from `/schemas/`
  (the deploy gate); `--live [origin] [--retries n]` fetches each `$id` from the live site (the `verify` job
  after deploy). `scripts/check_links.py` also checks every link on `/schemas/`.
- `/docs/` is `content/docs/_index.md` (front matter: the Place page lines, the apps, the catalog entry points)
  rendered by `layouts/docs/list.html`. Edit the front matter when an app gains or loses a docs page.

## Navigation bar (`<om-nav>`)

The header is the shared bar of `@oceanmetrics/nav` (pinned in `package.json`; `hugo.yaml` mounts its `dist/` as
`assets/om-nav` and `layouts/partials/header.html` bundles it with `js.Build`). The items are the three doors, "What
changed" and Docs, then `menu.main` from `hugo.yaml` and GitHub (`params.github`); the theme toggle
(`data-theme-toggle`, `static/js/theme.js`) and "Work with me" sit in the bar's slot. It collapses below 1100 px.
`scripts/check_links.py` reads the bar's `items`; the doors (`/places/`, `/indicators/`, `/atlas/`) are other apps and
are listed in `scripts/linkcheck_allow.txt`.

## Deploy

Push to `main`; GitHub Actions builds and publishes to Pages. Set the custom domain to
`oceanmetrics.io` in **Settings → Pages** (the `static/CNAME` file is also included in the build).

## Roadmap

See [`PLAN.md`](PLAN.md) — the design system (via claude.ai/design) and hero/section
imagery (via Gemini) are the remaining polish; the current build ships with a proven
ocean palette and a CSS gradient hero as placeholders.
