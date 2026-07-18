---
name: Ocean Metrics
description: The visual system behind Ocean Metrics — a sunrise on the water, in light or dark.
colors:
  teal: "#0c7288"
  teal-deep: "#0a5c6e"
  teal-bright: "#1aa0bd"
  sky-teal: "#86d6e5"
  sun: "#f5b528"
  sun-bright: "#ffce4d"
  sun-deep: "#e0951a"
  deep-navy: "#0c4553"
  night: "#0a2831"
  ink-strong: "#082129"
  ink-heading: "#123a45"
  ink-body: "#3c5b64"
  ink-muted: "#5c7880"
  line: "#d6ebef"
  foam-tint: "#e6f5f8"
  foam-bg: "#f4fafb"
  white: "#ffffff"
typography:
  display:
    fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 4.8vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "'IBM Plex Mono', 'SFMono-Regular', ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  xs: "3px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "3rem"
  "8": "4rem"
  "9": "6rem"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0.65em 1.15em"
  button-primary-hover:
    backgroundColor: "{colors.teal-deep}"
  button-action:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.sm}"
    padding: "0.8em 1.5em"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.teal}"
    rounded: "{rounded.sm}"
    padding: "0.65em 1.15em"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  chip:
    backgroundColor: "{colors.foam-tint}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.pill}"
    padding: "0.28em 0.7em"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-heading}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
  nav-link:
    textColor: "{colors.ink-heading}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  theme-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink-heading}"
    rounded: "{rounded.sm}"
    size: "2.15rem"
---

# Design System: Ocean Metrics

## 1. Overview

**Creative North Star: "The Sunrise Horizon"**

The whole system is the studio's mark drawn large: an ensō ring rising like a sun over a horizon waterline. Living-reef **teal** is the water; a warm **yellow** sun is the single warm accent; the space between them is bright, generous, and welcoming. The site ships in **both light and dark** and means it — light is a sunlit shallows (foam-white paper, teal water, a warm glow), dark is the same ocean after dusk (deep teal-navy, the sun's warmth intact). The animated ensō in the hero is self-lit and reads on either ground, which is what makes the two themes one identity rather than two skins.

The system is **precise and calm, but warm**. Components are the instrument, not the operator — hairline-bordered surfaces at rest, one confident display face, monospaced data annotations — yet the palette is positive and spacious rather than austere. Color is a **committed pairing**: teal carries brand and interaction, the warm yellow is rationed to a single spark per view (the ensō waterline, one CTA, a highlight), and a deep teal-navy anchors the footer. Nothing shouts; the page feels like a calm, sunlit morning at the water.

This system explicitly rejects the four traps in PRODUCT.md. It is **not a generic consultancy template**, **not a startup SaaS landing**, **not a dated academic homepage**, and **not over-designed or flashy** — the one animation is the brand mark itself, motion is otherwise quiet, and every effect serves the evidence. A federal COR and an academic PI should both read it as serious, current, reproducible, and approachable.

**Key Characteristics:**
- Teal-and-yellow ocean palette: foam-white/teal-navy grounds, teal brand, one warm-yellow spark, deep-teal footer anchor.
- Full light + dark theming via CSS `light-dark()`, one source of truth; a header toggle, OS-preference default, no-flash init.
- The animated ensō-sunrise mark is the hero and the logo — self-lit, works on light or dark, with a `prefers-reduced-motion` static frame.
- One display voice (Space Grotesk) + humanist body (IBM Plex Sans) + monospaced data annotations (IBM Plex Mono).
- Flat, hairline-bordered surfaces that lift only on interaction; spacious vertical rhythm.

## 2. Colors

A teal-and-yellow ocean, tuned so the warm and cool stay balanced: teal never tips cold, yellow never tips loud. Every semantic role resolves per theme via `light-dark()` — the hexes below are the light-mode canonical values; the dark-mode partner is in the sidecar and in `tokens/colors.css`.

### Primary
- **Teal** (`teal` #0c7288 light / #86d6e5 dark as text): the brand. Primary buttons, links, the "Ocean" of the wordmark, the ensō ring, stat numerals. Button fill stays #0c7288 in both themes (white text, 5.6:1); as *text* it flips to sky-teal on dark for legibility.
- **Teal Deep** (`teal-deep` #0a5c6e): the pressed/hover shade of Teal.

### Secondary
- **Teal Bright** (`teal-bright` #1aa0bd light / #43b9d2 dark): the interactive accent — hover edges, service icons, focus glow, stat/eyebrow accents.
- **Sky Teal** (`sky-teal` #86d6e5): light teal for on-dark accents (footer wordmark, dark-mode links) and hover borders.

### Tertiary (the one warm)
- **Sun** (`sun` #f5b528): the warm accent, rationed hard. The ensō waterline, the single warm CTA (with dark ink), a highlight, the hero's dawn glow. One per view.
- **Sun Bright / Sun Deep** (`sun-bright` #ffce4d, `sun-deep` #e0951a): the sun's brighter core and its deeper hover/text-on-light shade.

### Neutral
- **Deep Navy** (`deep-navy` #0c4553): the light-mode footer/inverse anchor; a soft deep teal.
- **Night** (`night` #0a2831): the dark-mode page ground.
- **Ink Strong / Heading / Body / Muted** (`#082129` / `#123a45` / `#3c5b64` / `#5c7880`): the light-mode text ramp (each flips to a light slate on dark). Body measures ~6.9:1 on paper; Muted ~4.5:1 — usable but reserved for captions.
- **Line / Foam Tint / Foam Bg / White** (`#d6ebef` / `#e6f5f8` / `#f4fafb` / `#ffffff`): borders, tints, page paper, surfaces (each flips to a teal-navy equivalent on dark).

### Named Rules
**The Rationed Sun Rule.** Yellow is a sunrise, not a coat of paint. At most one warm-yellow element competes for attention on any view — usually the primary CTA or the ensō spark. Two yellows in one viewport means one is wrong.

**The One-Spark, Teal-Carries-the-Rest Rule.** Teal does brand, links, and interaction; yellow only sparks. Never let yellow take a job teal should do (a second button, a link, a border).

**The Both-Themes-Or-Neither Rule.** Every color decision resolves in light *and* dark through `light-dark()`. Never hard-code a hex that only works in one theme; add the token, give it both values.

## 3. Typography

**Display Font:** Space Grotesk (with Segoe UI, system-ui fallback)
**Body Font:** IBM Plex Sans (with system-ui, -apple-system fallback)
**Label/Mono Font:** IBM Plex Mono (with SFMono-Regular, ui-monospace fallback)
**Wordmark Accent:** Fraunces (fluid display serif, calm cut — opsz 60, wght 600, soft/wonk off) — the word "Ocean" in the logotype only, loaded subset to O-c-e-a-n. Also a full document family, so it doubles for brand-consistent proposals.

**Character:** A geometric-scientific display face over a humanist, highly legible body — technical without going cold. The monospace carries actual data (coordinates, station codes, stats, stack tags, labels), which is what earns a third family. A 1.20 minor-third scale from 12px to 84px.

### Hierarchy
- **Display** (700, `clamp(2.4rem, 4.8vw, 4.25rem)`, line-height 1.05, tracking −0.02em): hero headline only. `text-wrap: balance`, capped ~16ch.
- **Headline** (700, 3rem / 48px): interior page titles (h1).
- **Title** (600, 2.25rem / 36px): section heads (h2).
- **Subhead / Card title** (600, 1.75rem→1.375rem): h3 and card titles.
- **Body** (400, 1rem / 16px, line-height 1.5–1.65): prose in IBM Plex Sans; measure 52–70ch.
- **Label** (500, 0.75rem / 12px, tracking 0.14em, UPPERCASE): mono eyebrows, stat labels, meta rows, stack chips.

### Named Rules
**The Mono-Means-Data Rule.** IBM Plex Mono is reserved for things literally measured or coded: stats, coordinates, counts, stack chips, dates, short labels. Prose is never mono; mono is never decorative.

**The One-Display-Voice Rule.** All headings and card titles use Space Grotesk. The one deliberate exception is the wordmark logotype: a fluid serif ("Ocean", Fraunces) paired with mono ("Metrics", IBM Plex Mono) — fluid water beside measured data. Never add a second display or serif face anywhere else, or for "editorial" flavor.

**The One-Kicker Rule.** The mono uppercase eyebrow is a brand element, not section grammar. Use it sparingly (a hero kicker, the occasional section) — never above every section, which reads as AI scaffolding.

## 4. Elevation

The system is **flat at rest and lifts on interaction**. Resting surfaces are hairline-bordered with no shadow; on hover a card rises ~4px and gains a soft, cool teal-navy shadow plus a bright-teal edge — light catching an object as it surfaces. Shadows are diffuse and low-contrast, tinted with the deep teal (`rgba(16,58,92,…)`) rather than neutral black. In dark mode, elevation reads through a lighter surface tint (`bg-surface` sits above `bg-page`) more than through shadow.

### Shadow Vocabulary
- **xs–sm** (`0 1px 2px` / `0 2px 8px rgba(16,58,92,.05–.06)`): faint seats for chips/inputs.
- **md** (`0 8px 22px rgba(16,58,92,.08)`): portrait and mid-level lifts.
- **lg** (`0 16px 42px rgba(16,58,92,.12)`): the card hover "surfacing."
- **xl** (`0 30px 70px rgba(12,46,74,.18)`): overlays.
- **sun / teal glow** (`0 10px 28px rgba(242,178,48,.30)` / `rgba(43,147,222,.22)`): warm/cool interactive emphasis.
- **focus** (`0 0 0 3px rgba(43,147,222,.35)`): the teal focus ring.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest — border-defined, shadow-free. Shadows appear only on hover, focus, or true overlay elevation.

## 5. Components

Components are precise, calm, and warm: crisp geometry, restrained radii, state changes felt more than seen.

### Buttons
- **Shape:** 6px (`rounded.sm`); pills are reserved for chips.
- **Primary:** Teal fill (#0c7288), white text (5.6:1 both themes). The default action.
- **Action (warm):** Sun fill (#f5b528) with **dark ink** text (never white — yellow+white fails contrast). The single rationed warm CTA per view.
- **Outline:** transparent with theme-aware teal text (`brand-text`) and a strong hairline; hover fills foam-tint.
- **States:** hover darkens via `brightness(.94)`; `:active` nudges 1px; focus shows the teal ring, never a bare outline.

### Chips (stack tags / meta)
- Foam-tint background, **body-ink** mono text (not muted — these are real signals), 1px border, pill radius, ~0.68rem.

### Cards / Containers
- 16px radius; white surface (teal-navy panel in dark); flat at rest, hover = translateY(−4px) + `shadow-lg` + bright-teal border + 1.04 media zoom.
- **Project card signature:** a mono client/funder badge over an abyss-scrimmed media, a mono stack row, role + period in **body ink** — a labeled chart plate.

### Inputs / Fields
- Surface fill, 1px hairline, 10px radius, IBM Plex Sans in heading ink; mono uppercase labels; focus shifts border to teal with a soft teal glow.

### Navigation
- Sticky, translucent header (`light-dark(rgba white, rgba teal-navy)`) with a 12px blur and hairline; 72px tall. Depth via blur, not shadow. Active link = teal text on foam-tint. Mobile collapses to a toggled panel.

### Theme toggle (signature)
- A 2.15rem hairline-bordered icon button in the nav: moon in light mode, sun in dark. Persists to `localStorage` (`om-theme`), defaults to the OS preference, and is applied before first paint by an inline `<head>` script so there's no flash.

### Wordmark + ensō (signature)
- The mark (an ensō ring in `currentColor` + a fixed-yellow horizon waterline) precedes the "Ocean Metrics" logotype. Ring color = `brand-text` (deep teal on light, sky-teal on dark); the yellow waterline is the constant warm spark. On the footer the ring flips to sky-teal.
- The logotype pairs two textures: **"Ocean" in Fraunces** (fluid display serif) and **"Metrics" in IBM Plex Mono** (measured data) — the brand thesis in the logo, fluid water beside measurement. This is the sole exception to the One-Display-Voice Rule.

### Animated hero (signature)
- The ensō drawn as a sunrise: a circle contracts to a point, spreads into the horizon line, then rises as the ring — SMIL, self-contained, teal-and-yellow gradient, with a `prefers-reduced-motion` static final frame. It *is* the hero; it needs no photo.

## 6. Do's and Don'ts

### Do:
- **Do** keep body copy at Ink Body (#3c5b64 / light-slate on dark); it measures ~6.9:1. Bump toward heading ink when in doubt.
- **Do** ration Sun to one warm element per view (the Rationed Sun Rule); let teal carry brand, links, and interaction.
- **Do** give the warm-yellow CTA **dark ink** text — never white.
- **Do** resolve every color in light *and* dark via `light-dark()`; add a token with both values rather than a one-theme hex.
- **Do** use IBM Plex Mono only for real data (the Mono-Means-Data Rule).
- **Do** keep surfaces flat at rest and let them lift on hover/focus.
- **Do** let real project work and named institutions (BOEM, NOAA, NASA, NREL, NCEAS; CalCOFI, MBON) carry the proof — full-color and legible, never faded filler.

### Don't:
- **Don't** ship a **generic consultancy template**, a **startup SaaS landing** (no "Trusted by" logo wall as filler; name the work), a **dated academic homepage**, or an **over-designed/flashy** page.
- **Don't** use yellow for text, links, borders, or a second button — it sparks, it doesn't work (the One-Spark Rule).
- **Don't** use white text on a yellow fill (fails contrast) — use dark ink.
- **Don't** rely on Ink Muted (#5c7880) for anything a reader must actually read; captions and decorative labels only.
- **Don't** repeat the mono uppercase eyebrow above every section — one kicker is voice, a stack is AI scaffolding.
- **Don't** hard-code a color that only works in one theme; it will break the toggle.
- **Don't** use a `border-left`/`border-right` colored stripe as a card/callout accent (the legacy `.card--event` stripe in the ported CSS — do not propagate it).
- **Don't** introduce a second display or serif face, `background-clip:text` gradient headings, or decorative glassmorphism.
- **Don't** ship an animation without a `prefers-reduced-motion` alternative.
