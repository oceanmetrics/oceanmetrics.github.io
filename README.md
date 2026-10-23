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
  counts.json          the front page's counts and "What changed" (scripts/counts.mjs at build; committed = last good)
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
scripts/counts.mjs     the front page's counts and "What changed" from the bucket -> data/counts.json (+ counts.test.mjs)
scripts/check-no-addresses.mjs  fails the build on any email address but the studio's own and RFC 2606 examples
scripts/*-schemas.mjs  sync-schemas (copy schemas to their $id) and check-schemas (assert they are served)
scripts/tools_*.py     gallery refresh: status from the GitHub API + Playwright screenshots
.github/workflows/     deploy.yml — build with Hugo, link-check, publish to Pages
                       refresh-tools.yml — weekly (Mon 06:17 UTC) status + screenshot refresh, commits, redeploys
```

## Front page (`/`)

The front page leads with the platform (decision D4, 2026-10-23; `PRODUCT.md` notes the override): a hero with the one
line (`params.platformHeadline`) and a place search, the three doors with their counts, "What changed", then the studio
(intro, stats band, projects, services, about and clients, contact), unchanged in content.

- **The search** is a plain form to `https://oceanmetrics.io/places/?q=<text>`, the same hand-off as the bar's search;
  the "Try" examples are `params.platformTry`.
- **The counts and "What changed" are baked at build, no JavaScript.** `scripts/counts.mjs` (`npm run counts`; run by
  `deploy.yml` before `hugo`) reads the bucket through `@oceanmetrics/catalog/storage`, the one host rule the apps use
  (`OM_STORAGE`, else the package default: path-style S3 until the storage cutover), and writes `data/counts.json`:
  - Places: `gazetteer/index/layers.json` rows (layers) and the sum of each row's `n` (places);
  - Indicators: `indicators/indicators.json` indicators, and the distinct `place_id`s of `indicators/coverage.parquet`
    (read with hyparquet; its `place_name` names the places in "What changed");
  - Atlas: the `child` links of `atlas/catalog.json` (collections);
  - What changed: the newest five entries of `indicators/feeds/all.xml` (title, place, date, kind, link) and
    `indicators/changes/latest.json`'s `checked_at`. Each place links to its Place page (`/places/p/<id>/`), each
    sentence to the indicators viewer, the section to `/alerts/` and the feed. The bar's "What changed" is
    `/#what-changed`.
- **Fallback.** `data/counts.json` is committed: if the bucket does not answer, the script keeps it (the last good
  numbers) and prints a warning annotation, so the build never fails on the bucket. Refresh it locally with
  `npm run counts` and commit when you like; CI does not commit it.
- **Fresh.** `deploy.yml` also runs daily (15:17 UTC, after the indicators' daily check), so the numbers are a day old at
  most.
- **Example links** (Ben 2026-10-23: the map features must be findable without asking): one "Try:" line under each door
  and the `/docs/` "Maps" section come from **`data/examples.json`** (`doors.places|indicators|atlas`, and `maps`, the
  five views of the indicators viewer's Help -> Try these, `viewer/src/lib/tryThese.ts` there: change both together).
  `scripts/examples.test.mjs` (in `npm test`) checks the shape and that every link answers 200 (skipped with
  `OM_OFFLINE=1` or when oceanmetrics.io cannot be reached).
- **Icons** come from the published `static/brand/v1/icons/icons.css`: `layouts/partials/om-icons-css.html` cuts the few
  glyphs a page uses into an inline `<style>` (no path typed by hand, not the whole 34 kB set).
- **Tests.** `scripts/counts.test.mjs` (`node --test`, in `npm test`) runs every rule on the bucket-shaped fixtures in
  `scripts/fixtures/counts/` (including a six-row parquet) and the keep-the-last-good-file fallback. The `verify` job
  checks the live front page has the doors and "What changed".

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

## Analytics

Off unless the repository variable **`GA_ID`** (Settings -> Secrets and variables -> Actions -> Variables) holds a GA4
measurement id. `deploy.yml` passes it to `hugo` as `HUGOxPARAMSxGA_ID` (Hugo's x-delimited form of `params.ga_id`:
`HUGO_PARAMS_GA_ID` would set `params.ga.id`); `hugo.yaml` keeps `ga_id: ""`. `layouts/partials/header.html` writes
`data-ga` on the bar only for an id matching `^G-[A-Z0-9]{4,16}$`. The bar (`@oceanmetrics/nav` 0.2.0, its README
"Analytics") loads gtag.js once, with `anonymize_ip`, no Google signals and no ad personalization, and a rebuilt
`page_location` (origin + path: no query, no fragment). No id is written in the repo.

- `npm test`: `scripts/ga.test.mjs` runs `scripts/check-ga.mjs` on small dists, then builds the site with `hugo` (skipped
  without it) unset, malformed and `G-TEST000000`: no `data-ga` and no id, then `data-ga="G-TEST000000"` and the
  bundled bar carrying the loader.
- `deploy.yml` runs `node scripts/check-ga.mjs public --id "$GA_ID"` after the build: no page carries a gtag.js script
  tag, and the id is in the build exactly when the variable is set.

The GA4 stream's enhanced measurement "Page changes based on browser history events" must be off (the nav README says why).

## Deploy

Push to `main`; GitHub Actions builds and publishes to Pages. Set the custom domain to
`oceanmetrics.io` in **Settings → Pages** (the `static/CNAME` file is also included in the build).

## Roadmap

See [`PLAN.md`](PLAN.md) — the design system (via claude.ai/design) and hero/section
imagery (via Gemini) are the remaining polish; the current build ships with a proven
ocean palette and a CSS gradient hero as placeholders.
