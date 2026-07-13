<!-- @format -->

# Plan — High-contrast mode variants + HC typography

Written 2026-07-10 (after the E5 merge `7bae83f`). Executed on branch
`feat/hc-variants`. Reflection inspired by ZoomText (Colour Enhancements:
two-color presets + a toggle that remembers the last choice), adapted to
the existing theme architecture.

## Decisions made (2026-07-10)

- **4 variants** (the list Simon had planned):
  1. **Yellow on black** — the current one, rendering unchanged, stays the default
  2. **Green on black** — the classic "phosphor" look of magnifier TVs
  3. **White on black** — maximum contrast, no hue
  4. **Black on white** — positive polarity (preferred by some low-vision
     conditions: cataracts vs AMD)
- **UI**: a single "High contrast" control in the menu (not 4 theme
  buttons). The current button stays a **clear toggle** that activates
  maximum contrast; below it (or built in as a *split button*), a
  **variant selector**. Exact form decided by Simon after seeing both;
  recommendation: toggle + selector visible when active (more robust for
  screen readers / mobile than a split button).
- The toggle reactivates the **last variant used** (ZoomText pattern,
  generalized `lastBaseTheme`).
- **HC typography**: `font-size-adjust: 0.56`, body ls `0.04em` / ws
  `0.128em` (values already calibrated and visually validated on
  2026-07-09); body line-height 1.75 already in place; headings unchanged
  (0.02em / 1.5). **Atkinson confirmed**: designed by the Braille
  Institute for low vision — that's its primary use case.
- **No dedicated preview**: the variants are real themes, tested directly
  on the site in dev.
- **Out of scope**: a "single hue" mode à la ZoomText Blue Dye (that's a
  light-comfort need → a possible future evolution of the anti-glare axis,
  not HC); declarative rewrite of HC (still deferred — the current
  mechanism is parameterized, not rewritten).

## Architecture

Each variant = **a real** `data-theme` theme (engine, contrast report,
anti-FOUC, persistence all free). Internally: `high-contrast` (yellow, the
historical value kept for existing localStorage entries),
`high-contrast-green`, `high-contrast-white`, `high-contrast-paper` (black
on white — name to be confirmed).

The current `_high-contrast.scss` file isn't monolithic: it's a
**semantic map** (background/text/link/highlight/action/success/error)
passed to `transform-light-to-high-contrast` + focus/header overrides. A
variant = the same mixin with a different map + parameterized overrides.

Point of attention for "black on white": the current focus overrides
assume a dark background (white outline) → also parameterize focus colors
and header overrides per variant.

Each variant needs **its whole map** (not just text/background): I propose
full maps, the contrast system verifies them (AAA thresholds like the
current one), Simon validates the on-screen rendering.

## Phases

### Phase 0 — Preparation

Oracle: reference compiled CSS (`main`), normalized diff at each phase.

### Phase 1 — HC typography (pre-validated visual change)

Replace the `html.high-contrast` typography block in `_typography.scss`
with `@include a11y-font-class("high-contrast", "Atkinson Hyperlegible")`
— the E5 mixin emits exactly the wanted structure: font everywhere +
`font-size-adjust: 0.56` + body 0.04em/1.75/0.128em + headings 0.02em/1.5.
Expected CSS diff: confined to the `html.high-contrast` block (body ls
0.02→0.04, ws 0.064→0.128, adjust added).

**Commit**: `feat(theme): hc phase 1 — typography (a11y-font-class, adjust 0.56)`.

### Phase 2 — The 3 SCSS variants (MINIMAL — technology unchanged)

Scope reaffirmed by Simon (2026-07-10): **the feature already exists, we
change the colors**. No semantic or technological redesign (both = a
"second pass" explicitly deferred). The current mechanism
(`transform-light-to-high-contrast` + overrides) is kept as-is; the mixin
simply takes the color map as an argument (default = the current map →
**byte-identical yellow**).

Palettes decided (proposed by me, validated as a starting point — Simon
judges each variant on screen):

| Role | Yellow/black (current) | Green/black | White/black | Black/white |
| --- | --- | --- | --- | --- |
| Text | `#ffff00` | `#00ff00` | `#ffffff` | `#000000` |
| Links | `#00ffff` | `#00ffff` | `#00ffff` | `#0000cc` |
| Header (bg) | `#bfff00` | `#99ff99` | `#e0e0e0` | `#000000` (white header text) |
| Action | `#ffffff` | `#ffffff` | `#ffff00` | `#000000` |
| Success | `#00ff00` | `#00ff00` | `#00ff00` | `#007700` |
| Error | `#ff0000` | `#ff0000` | `#ff0000` | `#cc0000` |
| Focus | white | white | white | black (inverted fill) |

Philosophy: on a black background, the "system" roles (links/action/status/
focus) stay common; only text + header change. Deviations forced by
collisions: yellow action in white/black (otherwise interactive elements
vanish into the white mass); black/white = a fully darkened mirror
(contrast physics: pure cyan/white/greens are illegible on white).

1. Parameterized mixin (map as argument, current defaults) + parameterized
   focus/header overrides **only** for the paper variant's needs (inverted
   polarity).
2. 3 theme files (green/white/paper) carrying their map.
3. `[data-theme]` blocks + 3 THEMES/anti-FOUC entries (the contrast report
   and the anti-gamut guard cover the new themes automatically — nothing
   to extend). ⚠️ the "anti-FOUC script byte-identical to the historical
   literal" test (E4) will need updating: the theme list changes, and
   that's intentional.

**Oracle**: byte-identical yellow theme; new blocks = the only additions.
**Commit**: `feat(theme): hc phase 2 — green/white/paper variants`.

### Phase 3 — UI and runtime

1. `html.high-contrast` (typography class) set for EVERY variant
   (`theme.startsWith("high-contrast")`); `getColorVisionMode` updated.
2. Memory of the last variant (persisted); the toggle activates it.
3. Variant selector below the button (both forms shown to Simon:
   toggle+selector vs split button — he decides on screen); FR/EN i18n.

**Commit**: `feat(theme): hc phase 3 — toggle + variant selector`.

### Phase 4 — Wrap-up

Test suites + build + `contrast:report` (15 themes); docs (README §
themes, TODO: "HC typography" item closed out); changelog; **variant-by-
variant smoke test** before merge.

**Commit**: `docs(theme): hc phase 4 — wrap-up`.

## Out of scope (do NOT do)

- Declarative rewrite of the HC mechanism (deferred, earlier decision).
- Single-hue (Dye) mode — noted as an anti-glare idea.
- HC × dyslexia combinations: current behavior kept (the classes coexist,
  the selector's font keeps the last word via CSS ordering).
