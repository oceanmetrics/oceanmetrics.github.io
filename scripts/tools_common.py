"""Shared helpers for the tools-gallery refresh scripts: read every content/tools/*.md
front matter into a list of dicts (slug + fields). Pure stdlib + PyYAML."""
import os, sys, yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content", "tools")
DATA = os.path.join(ROOT, "data")
SHOTS = os.path.join(ROOT, "assets", "img", "tools")


def read_tools(only=None):
    """Return [{slug, title, url, repo, repo_path, version_from, shot, …}] for every tool page.
    `only` is an optional iterable of slugs to restrict to."""
    tools = []
    for fn in sorted(os.listdir(CONTENT)):
        if not fn.endswith(".md") or fn.startswith("_"):
            continue
        slug = fn[:-3]
        if only and slug not in only:
            continue
        with open(os.path.join(CONTENT, fn), encoding="utf-8") as f:
            text = f.read()
        if not text.startswith("---"):
            continue
        fm = yaml.safe_load(text.split("---", 2)[1]) or {}
        fm["slug"] = slug
        tools.append(fm)
    return tools


def parse_only(arg):
    return set(s.strip() for s in arg.split(",") if s.strip()) if arg else None


def log(*a):
    print(*a, file=sys.stderr, flush=True)
