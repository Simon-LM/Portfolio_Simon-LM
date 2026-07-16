<!-- @format -->

# To do — theme system / future package

Single list of pending work and decisions for the theme system. The
package-extraction **roadmap** (chantiers E3→E7) lives in
[GUIDE-package-extraction.md](./GUIDE-package-extraction.md); this file only
lists **loose ends** and **pending decisions**, so nothing gets forgotten.
Update as you go (check off / remove once done).

## Pending decisions (awaiting a call)

- [ ] **Status resolver's legibility floor** — constant
      `$status-legibility-floor` in `src/styles/abstracts/_theme-utils.scss`
      (default **3:1**). Below it, graceful degradation emits a "nearly
      invisible" `@warn`. Doesn't gate anything today (latent path); value
      to confirm or adjust. Added in part 3 (2026-07-06).

## To do BEFORE publication (E7)

- [ ] **Process the pre-E7 review findings** — bugs, backlog, Tailwind
      path, package README + AGENTS.md: see
      [REVIEW-e7-readiness.md](./REVIEW-e7-readiness.md) (2026-07-14),
      handled item by item.
- [x] **Renamed the `redd` → `red` palette family** (done 2026-07-13). Root
      cause confirmed by test: an UNQUOTED map key `red:` is read as the
      CSS color `red`, so `map.get($colors, "red")` returned null. Fix
      consistent with `"orange"`/`"violet"` (already quoted): quoted key
      `"red":`. 6 files; byte-identical CSS.

## Proposed micro-chantiers (unplanned, under the test safety net)

- [x] **Role corrections** (proposed after E1) — **done 2026-07-07**
      (branch `refactor/theme-role-corrections`, 2 commits, awaiting visual
      validation before merge):
  - [x] Dead token `--color-button-active-outline` **removed** (+ its
        contrast pair).
  - [x] Header **title** fixed (`--fg-on-accent` by luminance) — zero
        visual change.
  - [x] **Subtitle** anchored to a fixed muted gray (decision: "muted
        gray") — in dark, goes from near-black to `stone-700`.
  - [x] **Blog link**: original design restored — **grayed chip + amber
        text in both modes** (light and dark identical: `#44403c` +
        `#fcd34d`). The near-white chip in dark was a defect predating
        these chantiers (automatic gray inversion, partly in prod), not
        the intended design. No patch needed, green pair everywhere.
  - [x] Every `.header` patch in `_dark.scss` removed; the 4 header/accent
        waivers lifted (anti-zombie).

## Findings from the 2026-07-07 review (emitted/consumed audit)

- [x] **"Phantom variables" micro-chantier** — done 2026-07-07 (branch
      `chore/theme-token-cleanup`): the 5 inert declarations **removed**
      (rendering strictly unchanged — they did nothing, the inherited
      color already applied) and the 3 fallbacks simplified
      (`--color-divider`/`--color-input-bg`/`--color-text-secondary` →
      their fallback directly).
- [x] **5 emitted-but-never-consumed tokens removed** (under a "everything
      except E3" mandate): `--color-hero-bg`, `--color-hero-text` (+ their
      contrast pair), `--color-collapse-border`,
      `--color-section-even-card-bg`, `--constant-success-color`.
- [x] **Contact form success toast** — decided and done 2026-07-07: the
      `--success` role bumped to **emerald-700** (5.25:1) and the toast
      wired to `var(--success)` (themed green across all 12 themes, the
      role's first consumer). Waiver reduced to achromatopsia alone.

## Long-term roadmap (noted 2026-07-14, explicitly not soon)

- [ ] **Extreme-zoom SCSS/CSS recommendations module** — Simon's stated
      direction for the package: beyond colors/themes, ship coding
      recommendations (and possibly tooling) so layouts stay
      **functional and responsive at ≥ 10× magnification (1000 %+)** —
      natively better than a screen magnifier like ZoomText (reflow:
      sharp vector text, single reading axis, no 2D panning). WCAG
      1.4.4 (200 %) / 1.4.10 (400 % reflow) are only the floor — "400 %
      is nothing". Technical territory this implies (first notes,
      2026-07-14): at 10× a 1920 px screen behaves like a ~192 CSS px
      viewport, so no fixed dimensions **even in rem** (a 22.5rem panel
      = 12× the viewport) — content-driven and viewport-capped sizing
      (`min()`, `clamp()`, `max-width: 100%`); browsers cap zoom around
      500 %, so reaching 10× **compounds browser zoom with the
      package's font-size factor** (500 % × 2 = 10×) — the font-size
      control is a load-bearing part of the strategy, not a gadget;
      `em`-based media queries (they respond to font-size increases,
      `px` ones do not); sticky/fixed chrome must collapse or unstick
      (a 4rem sticky header eats half the screen at 10×); and a
      mechanical verification harness in the spirit of the contrast
      suite (render at ~130-190 px effective viewport, assert no
      horizontal overflow, no overlap, controls reachable). Almost
      nobody does this; it is the package's radical differentiator and
      the core of its **SCSS-first** positioning (see
      REVIEW-e7-readiness.md § 4); Tailwind support remains an on-ramp,
      never the destination. Do not start before the package
      publication (E7) is done and stable.

## To optimize later (noted, not urgent)

- [x] **High-contrast typography** — closed out in the HC chantier
      (2026-07-10): `html.high-contrast` now goes through
      `a11y-font-class` (Atkinson everywhere, `font-size-adjust: 0.56`,
      body 0.04em/1.75/0.128em). One micro-decision remains, non-blocking:
      HEADING line-height in HC (1.5 today, consistent with the font
      classes).

## Dropped (closed decision — do not re-propose)

- [x] **Full-site preview on hover of the HC variant buttons** (dropped
      2026-07-11, decision). Main reason: KEYBOARD navigation would
      mislead — focus would trigger the preview and the user would think
      they'd made a selection. Secondary reasons: rapid full-screen
      flashes (photosensitivity, and the HC audience is the most exposed),
      hover ≠ intent, doesn't exist on touch, real-state/preview
      confusion. A click is already a zero-cost reversible preview.

## Done (hc-mécanique chantier, 2026-07-11)

- [x] **HC mechanics — "second pass," architecture part**: focus promoted
      to a map role; value-based control (palette); name-based semantic
      inspector (`pnpm hc:audit`). See README § 6.6. Still open: the fate
      of `$accent*` in HC (parked, decision pending) and the underlying
      tech redesign (still deferred).

## Explicitly deferred (do not touch without a decision)

- [ ] **Declarative rewrite of the high-contrast theme** — deferred to the
      package extraction (decision). The current mechanism (deducing the
      role from the variable name) has its reasons; do not touch it until
      this is decided.

## Blocking before open-source publication

- [x] **Accessibility font license audit** — done 2026-07-08. Decisions
      made: **bundled** (OFL) = OpenDyslexic, Andika, Atkinson, Lexend
      Giga/Deca; **excluded** = Sylexiad (proprietary EULA), **Tiresias**
      (GPLv3 + unused + a signage font), **Raleway Dots** (unused).
      Details: [PLAN-extraction-modules.md](./PLAN-extraction-modules.md).
- [ ] **Question — Sylexiad served by the site**: the EULA requires
      webfonts that are "not publicly downloadable"; the portfolio's
      woff2 files technically are. To be settled (outside the E5 chantier).

## Role corrections — details

Both defects share a common root: **`--accent` is deliberately fixed**
(light amber-300) across all 12 themes — it doesn't invert in dark, that's
a brand choice. But tokens that build on top of it follow the general
inversion → light-on-light.

### 1. Invisible active-button outline

- `--color-button-active-outline` = `$accent` (light amber-300). Set on
  `--color-panel-bg` = `$bg-base` (near-white in the light theme) → below
  the 3:1 non-text threshold. In **high-contrast**, `$accent` and
  `$bg-base` both equal `#000000` → **1.00:1**, the outline is literally
  invisible.
- **Fix**: rewire the token to a more contrasted, already-existing role —
  `$accent-strong` (amber-500) or a border role. One line in
  `_theme-variables.scss` (definition + mixin), to validate via the test
  suite + visually.

### 2. Light-on-light header text in dark (masked by hacks)

- The header's background is `--color-header-bg` = `$accent` (light amber,
  **fixed**). Its text `--color-header-text` = `$fg-on-accent`, and
  `--color-header-text-role` = `$fg-muted`. But `$fg-on-accent` =
  `$gray-950` and `$fg-muted` = `$gray-700`: in dark-based themes, the
  gray rail **inverts**, so these tokens become **light** → light text on
  light amber (~1.15:1).
- Today **invisible to the eye** because `_dark.scss` (lines ~57-72)
  contains hardcoded `.header` overrides that force the text back to
  `var(--constant-near-black)` (one with `!important`). These are
  **patches** compensating for the flawed role model.
- **Fix**: since accent is fixed, its ink must be fixed too. Bind
  `fg-on-accent` (and the header text role) to a **stable** ink (constant
  near-black / `accent-ink`) instead of the rail that inverts. The header
  becomes correct by construction across all 12 themes, and the `.header`
  overrides in `_dark.scss` **can then be removed** (they no longer
  compensate for anything). The `fg-on-accent` / header-* waivers become
  obsolete → removed by the anti-zombie check.
- Constraint: this change touches the **role model** (layer 2, the future
  package's API) — so do it properly, with a mini-plan, the contrast test
  suite as a safety net, and visual validation of the header in dark.
