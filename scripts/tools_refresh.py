#!/usr/bin/env python3
"""Refresh data/tools_status.json for the Tools gallery.

For every content/tools/*.md page this records:
  last_commit, last_commit_url  date and link of the newest commit to `repo` (restricted to
                                `repo_path` when set, for monorepos such as MarineSensitivity/apps)
  archived, stars, default_branch  from the GitHub repo record (`repo_branch` in front
                                matter overrides the branch that commits and versions are read from)
  version                       read from `version_from` (DESCRIPTION, pyproject.toml,
                                package.json) at `repo_path`/ on the default branch
  http                          status code of a GET to `link` (the live tool)
  checked                       when this record was written

Run by .github/workflows/refresh-tools.yml weekly, or by hand:
  python3 scripts/tools_refresh.py [--only slug,slug] [--no-http]
Auth: GITHUB_TOKEN env var, else `gh auth token` if the gh CLI is logged in.
Existing records are kept when a lookup fails, so one flaky request never blanks a card.
"""
import argparse, json, os, re, subprocess, sys, time
from datetime import datetime, timezone
import requests
from tools_common import DATA, read_tools, parse_only, log

API = "https://api.github.com"
OUT = os.path.join(DATA, "tools_status.json")


def token():
    t = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if t:
        return t
    try:
        return subprocess.check_output(["gh", "auth", "token"], text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return None


def gh(session, endpoint, **params):
    r = session.get(API + endpoint, params=params, timeout=30)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()


def read_version(session, repo, branch, repo_path, kind):
    base = f"https://raw.githubusercontent.com/{repo}/{branch}/"
    if repo_path:
        base += repo_path.rstrip("/") + "/"
    r = session.get(base + kind, timeout=30)
    if r.status_code != 200:
        return None
    txt = r.text
    if kind == "DESCRIPTION":
        m = re.search(r"^Version:\s*(\S+)", txt, re.M)
    elif kind == "pyproject.toml":
        m = re.search(r'^version\s*=\s*"([^"]+)"', txt, re.M)
    elif kind == "package.json":
        m = re.search(r'"version"\s*:\s*"([^"]+)"', txt)
    else:
        return None
    return m.group(1) if m else None


def http_status(url):
    try:
        r = requests.get(url, timeout=30, allow_redirects=True,
                         headers={"User-Agent": "oceanmetrics-tools-refresh/1.0"})
        return r.status_code
    except requests.RequestException:
        return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="comma-separated slugs")
    ap.add_argument("--no-http", action="store_true", help="skip the live-URL check")
    a = ap.parse_args()

    prev = {}
    if os.path.exists(OUT):
        with open(OUT) as f:
            prev = json.load(f)

    s = requests.Session()
    s.headers["Accept"] = "application/vnd.github+json"
    t = token()
    if t:
        s.headers["Authorization"] = f"Bearer {t}"
    else:
        log("warning: no GitHub token; unauthenticated rate limit is 60/hour")

    out = dict(prev)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    for tool in read_tools(parse_only(a.only)):
        slug, repo, path = tool["slug"], tool.get("repo"), tool.get("repo_path")
        rec = dict(prev.get(slug, {}))
        try:
            if repo:
                info = gh(s, f"/repos/{repo}")
                if info:
                    rec["archived"] = bool(info.get("archived"))
                    rec["stars"] = info.get("stargazers_count", 0)
                    rec["default_branch"] = info.get("default_branch", "main")
                    branch = tool.get("repo_branch") or rec["default_branch"]
                    params = {"per_page": 1, "sha": branch}
                    if path:
                        params["path"] = path
                    commits = gh(s, f"/repos/{repo}/commits", **params) or []
                    if commits:
                        c = commits[0]
                        rec["last_commit"] = c["commit"]["committer"]["date"]
                        rec["last_commit_url"] = c["html_url"]
                    vf = tool.get("version_from")
                    if vf:
                        v = read_version(s, repo, branch, path, vf)
                        if v:
                            rec["version"] = v
                else:
                    log(f"{slug}: repo {repo} not found")
            if not a.no_http and tool.get("link"):
                rec["http"] = http_status(tool["link"])
            rec["checked"] = now
            log(f"{slug}: commit {rec.get('last_commit','?')[:10]} v{rec.get('version','-')} http {rec.get('http','-')}")
        except Exception as e:  # keep the previous record for this tool
            log(f"{slug}: ERROR {e}")
        out[slug] = rec
        time.sleep(0.2)

    # drop records for pages that no longer exist
    live = {t["slug"] for t in read_tools()}
    out = {k: v for k, v in out.items() if k in live}
    os.makedirs(DATA, exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(dict(sorted(out.items())), f, indent=1, sort_keys=True)
        f.write("\n")
    log(f"wrote {OUT} ({len(out)} tools)")


if __name__ == "__main__":
    main()
