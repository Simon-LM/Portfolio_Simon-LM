<!-- @format -->

# To do — theme system / future package

Single list of pending work and decisions for the theme system. The
package-extraction **roadmap** (chantiers E3→E7) lives in
[GUIDE-package-extraction.md](./GUIDE-package-extraction.md); this file only
lists **loose ends** and **pending decisions**, so nothing gets forgotten.
Update as you go (check off / remove once done).

## ⚠️ Hold — npm supply-chain incident, 2026-08-04

- [ ] **Do not upgrade ESLint, and do not re-resolve the dependency
      tree, until the advisories for the 2026-08-04 npm incident have
      settled.** Compromised publishes hit `keyv`, `flat-cache`,
      `file-entry-cache`, `cacheable-request`, `cacheable` and
      `cache-manager` — same maintainer, three of them republished
      within 38 minutes that morning (`keyv@6.0.0` 09:35 UTC,
      `flat-cache@6.1.24` 10:10, `file-entry-cache@11.1.6` 10:13, all
      UTC).

      **This project was checked and is NOT affected.** It carries
      `keyv@4.5.4`, `flat-cache@4.0.1` and `file-entry-cache@8.0.0` —
      earlier major lines, none of them republished that day, and npm
      does not allow overwriting an already published version. The
      other three packages are absent, as are the `@keyv` and
      `@cacheable` scopes. They reach the tree only through ESLint's
      cache chain (`eslint` → `file-entry-cache` → `flat-cache` →
      `keyv`), as a dev dependency, never in the shipped bundle.

      **The only way in is an ESLint upgrade.** ESLint 9.39.4 requires
      `file-entry-cache@^8`, so even a full re-resolution stays on the
      8.x line; a major ESLint bump would not. Same reasoning defers
      the pnpm 10 → 11 migration, which re-resolves everything: the
      worst day to re-resolve is during an active supply-chain
      incident.

      Lift this hold once the advisories are published and the clean
      versions are known. Then re-check with the recipe used on
      2026-08-04: list the packages present in `pnpm-lock.yaml`,
      compare against the registry's publish dates
      (`npm view <pkg> time --json`), and confirm the pinned versions
      predate the incident.

## Pending decisions (awaiting a call)

- [ ] **Status resolver's legibility floor** — constant
      `$status-legibility-floor` in `src/styles/abstracts/_theme-utils.scss`
      (default **3:1**). Below it, graceful degradation emits a "nearly
      invisible" `@warn`. Doesn't gate anything today (latent path); value
      to confirm or adjust. Added in part 3 (2026-07-06).

- [ ] **Link-aware status anchor** — deferred from 0.6.0 (2026-07-26), to
      settle **before `1.0.0`**, not after. Today the engine only
      [_warns_](./CHANGELOG.md) when an anchored status color may collide
      with `--link` under red-green deficiency; it never moves a color.
      Picking the anchor _knowing_ where `link` sits would fix the cause
      instead of reporting it.

      **Why it was not shipped:** the naive form — darken the anchor when
      the mutual contrast ratio is low — was simulated against the same
      sweep that calibrated the warning (25 plausible blue-ish link
      choices, 12 colliding). It fixed **10 of 12**, darkened **5**
      palettes that were already fine, and still left **2** broken. The
      ratio alone does not discriminate: the failing cases top out at 1.56
      while the passing ones start at 1.08, so the two ranges overlap.

      **What a real design needs**, beyond that: a hue gate (the same
      reason the warning carries `$status-link-hue-window` — cyan and teal
      stay distinct on hue alone), a fallback to another green family when
      lightness cannot separate the pair inside the anchor's own family,
      and the hard case where `link` is _itself_ violet. Each needs its own
      calibration and validation pass.

      **When — `0.9.0`, in two steps.** (Was 0.7.0, then 0.8.0; both
      numbers went to user-facing work that shipped first — the template
      fixes of 2026-07-28, then dropping react-select and rebuilding the
      panel for extreme zoom on 2026-08-04. The trigger below is what
      matters, not the number; if it keeps sliding, that is the trigger
      telling us the third site has not arrived yet.) The risk is not
      building the mechanism, it is making it the _default_: that is what
      moves colors for people who did not ask. So the two are separated.

      1. **The mechanism, off by default** (`$status-link-auto-separate:
         false`) — ships in **`0.9.0`**. Costs nothing, changes no output,
         and makes the idea testable on real palettes instead of the 25
         hand-picked ones the sweep used. **Trigger: the third site**, the
         next time a genuinely different palette is available to watch it
         run against.
      2. **Flipping the default to `true`** — the **last minor before
         `1.0.0`**. This is the only irreversible call, and it must land
         **before** `1.0.0`, not after: a breaking change may land in a
         minor while in `0.x` (see README "Upgrading"), whereas changing
         an emitted color afterwards needs a deprecation path.

      **Hard stop:** this does not cross `1.0.0` undecided. Either the
      default flips, or it is documented as permanently opt-in — but the
      call is made before the line, not after. Note it adds and removes no
      role, so it is not an
      API break either way.

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

- [ ] **Extreme-zoom SCSS/CSS recommendations module** — 🚧 **STARTED
      2026-08-04**, now planned in
      [PLAN-css-conventions.md](./PLAN-css-conventions.md) (opt-in
      conventions layer: functions, mixins, placeholders, Tailwind v4
      utilities). The notes below are the original framing and stay
      here as the north star the plan answers to. — Simon's stated
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
- [ ] **Off-palette anchor V2 — delta-preservation idea** (noted
      2026-07-17, for later — not v1). V1 of the off-palette anchor
      (see [PLAN-off-palette-anchor.md](./PLAN-off-palette-anchor.md))
      substitutes the nearest palette anchor's own derived color for an
      off-palette custom color in derived themes (dark, CVD remapping) —
      accepted light-mode discontinuity between the anchor and the
      derived result (no clean-result promise). V2 idea: instead of
      substituting the anchor, apply the anchor's transformation
      *delta* (ΔL/ΔC/ΔH between the anchor and its derived color) to the
      user's actual off-palette color, so the derived result stays tied
      to the user's real swatch instead of only to its nearest palette
      neighbor. Candidate for a future custom-palette system; explicitly
      out of scope for `feat/off-palette-anchor` — logged here so it
      isn't lost.

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
- [x] **Question — Sylexiad served by the site**: settled 2026-07-17.
      The EULA requires webfonts that are "not publicly downloadable";
      the portfolio's woff2 files technically were. Fixed: the font
      files are gitignored (`public/fonts/Sylexiad*`), kept locally as
      a backup only (`private/fonts-backup/sylexiad/`), and Andika
      (OFL) added as a code-level fallback in `_typography.scss`. See
      `public/fonts/README.md` for the restore instructions.

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
