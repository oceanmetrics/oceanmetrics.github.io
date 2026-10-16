#!/usr/bin/env python3
"""Take light + dark screenshots of every tool for the Tools gallery.

Writes assets/img/tools/<slug>-light.png and <slug>-dark.png (1280x800 viewport) and
data/tools_shots.json ({slug: {taken, dark, light}}). Hugo resizes them to webp at build.

Per-tool options come from the `shot:` block in content/tools/<slug>.md:
  url      page to capture (default: the tool's `link`)
  wait     ms to wait after load before capturing (default 4000)
  click    CSS selector to click before capturing (e.g. to dismiss a welcome dialog)
  js       JavaScript to run before capturing
  keep_dialogs  true to skip the default dismissal of welcome dialogs (Escape, then any
           "Explore / Get started / Skip / Close…" button inside a modal or dialog)
  skip     true to leave this tool without a screenshot

Dark mode is emulated with prefers-color-scheme. If the dark capture is pixel-identical to
the light one (the tool has no dark theme) the dark file is not kept, and the site shows
the light shot in both themes. A new capture only replaces the file on disk when more than
--threshold of pixels changed, so a weekly run does not churn git history with noise.

  python3 scripts/tools_shots.py [--only slug,slug] [--force] [--threshold 0.01]
Requires: playwright (with chromium installed), pillow, pyyaml.
"""
import argparse, json, os, sys
from datetime import datetime, timezone
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
from tools_common import DATA, SHOTS, read_tools, parse_only, log

OUT = os.path.join(DATA, "tools_shots.json")
VIEWPORT = {"width": 1280, "height": 800}
# default dismissal of welcome/tour dialogs: only buttons INSIDE a dialog-like container,
# so a landing page's "Explore the data" link is never followed
DISMISS_JS = r"""(() => {
  const re = /^(explore|start exploring|get started|skip|skip tour|close|got it|continue|dismiss|ok|okay|let'?s go|start|begin)\b/i;
  const box = '[role=dialog], dialog, .modal, [class*=modal], [class*=welcome], [class*=dialog], [class*=overlay], [class*=tour], [class*=intro]';
  for (const el of document.querySelectorAll('button, [role=button]')) {
    if (!el.closest(box)) continue;
    const t = (el.textContent || '').trim(), al = el.getAttribute('aria-label') || '';
    if (re.test(t) || /^(×|✕|x)$/.test(t) || /close|dismiss/i.test(al)) { try { el.click(); } catch (e) {} }
  }
})()"""
BROWSER_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                "--ignore-gpu-blocklist", "--disable-dev-shm-usage"]


def diff_fraction(a_path, b_bytes_path):
    """Fraction of pixels that differ noticeably between two PNG files."""
    a = Image.open(a_path).convert("RGB")
    b = Image.open(b_bytes_path).convert("RGB")
    if a.size != b.size:
        return 1.0
    d = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 24 else 0)
    hist = d.histogram()
    return hist[255] / float(a.size[0] * a.size[1])


def capture(browser, tool, scheme, dest):
    opts = tool.get("shot") or {}
    url = opts.get("url") or tool["link"]
    ctx = browser.new_context(viewport=VIEWPORT, device_scale_factor=1, color_scheme=scheme,
                              user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 oceanmetrics-shots")
    page = ctx.new_page()
    try:
        page.goto(url, wait_until="load", timeout=90000)
        try:
            page.wait_for_load_state("networkidle", timeout=30000)
        except PWTimeout:
            pass  # long-polling apps (Shiny websockets) never go idle; the fixed wait covers them
        page.wait_for_timeout(int(opts.get("wait", 4000)))
        if not opts.get("keep_dialogs"):
            try:
                page.keyboard.press("Escape")
                page.evaluate(DISMISS_JS)
                page.wait_for_timeout(1200)
            except Exception as e:
                log(f"  dismiss failed: {e}")
        if opts.get("click"):
            try:
                page.click(opts["click"], timeout=5000)
                page.wait_for_timeout(800)
            except Exception as e:
                log(f"  click failed: {e}")
        if opts.get("js"):
            try:
                page.evaluate(opts["js"])
                page.wait_for_timeout(800)
            except Exception as e:
                log(f"  js failed: {e}")
        page.screenshot(path=dest, full_page=False)
        return True
    except Exception as e:
        log(f"  {scheme} capture failed: {e}")
        return False
    finally:
        ctx.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    ap.add_argument("--force", action="store_true", help="replace files even if unchanged")
    ap.add_argument("--threshold", type=float, default=0.01, help="min changed-pixel fraction to replace a file")
    a = ap.parse_args()

    os.makedirs(SHOTS, exist_ok=True)
    meta = {}
    if os.path.exists(OUT):
        with open(OUT) as f:
            meta = json.load(f)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    tmp = os.path.join(SHOTS, ".tmp")
    os.makedirs(tmp, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(args=BROWSER_ARGS)
        for tool in read_tools(parse_only(a.only)):
            slug = tool["slug"]
            if not tool.get("link") or (tool.get("shot") or {}).get("skip"):
                continue
            log(f"{slug}: {(tool.get('shot') or {}).get('url') or tool['link']}")
            light_tmp, dark_tmp = os.path.join(tmp, f"{slug}-light.png"), os.path.join(tmp, f"{slug}-dark.png")
            light, dark = os.path.join(SHOTS, f"{slug}-light.png"), os.path.join(SHOTS, f"{slug}-dark.png")
            if not capture(browser, tool, "light", light_tmp):
                continue
            has_dark = capture(browser, tool, "dark", dark_tmp) and diff_fraction(light_tmp, dark_tmp) > 0.002
            rec = dict(meta.get(slug, {}))
            changed = False
            for src, dst, present in ((light_tmp, light, True), (dark_tmp, dark, has_dark)):
                if not present:
                    if os.path.exists(dst):
                        os.remove(dst); changed = True
                    continue
                if a.force or not os.path.exists(dst) or diff_fraction(dst, src) > a.threshold:
                    os.replace(src, dst); changed = True
            rec.update(light=True, dark=has_dark, checked=now)
            if changed or "taken" not in rec:
                rec["taken"] = now
            meta[slug] = rec
            log(f"  dark={'yes' if has_dark else 'same as light'} {'updated' if changed else 'unchanged'}")
        browser.close()

    for fn in os.listdir(tmp):
        os.remove(os.path.join(tmp, fn))
    os.rmdir(tmp)
    live = {t["slug"] for t in read_tools()}
    meta = {k: v for k, v in meta.items() if k in live}
    with open(OUT, "w") as f:
        json.dump(dict(sorted(meta.items())), f, indent=1, sort_keys=True)
        f.write("\n")
    log(f"wrote {OUT} ({len(meta)} tools)")


if __name__ == "__main__":
    main()
