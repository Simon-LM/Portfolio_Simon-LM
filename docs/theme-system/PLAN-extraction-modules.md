<!-- @format -->

# Execution plan — E5: preference modules (zoom, fonts, animations)

**Execution document meant for an AI.** Same general rules as previous
plans: dedicated branch, one commit per phase, raw check output, stop on
anything unexpected, entries in [CHANGELOG.md](./CHANGELOG.md). Reference
design: [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) § E5
and README § 6.5 (opt-in modules).

> **Status: written 2026-07-07, revised 2026-07-08 (decisions on fonts,
> dyslexia-mode size and spacing), ready to execute.**

## ⛔ Blocking prerequisites

1. **E3 and E4 merged** (done: `812d5d5`, `19df328`).
2. **Font license audit** (done) and **decisions** (below) made.

Branch: `feat/e5-modules`.

## Decisions made (2026-07-08)

- **Fonts bundled in the package** (all OFL, redistributable):
  **OpenDyslexic, Andika, Atkinson Hyperlegible Next, Lexend Giga, Lexend
  Deca**.
- **Excluded from the package**:
  - **Sylexiad Sans/Serif** — proprietary EULA (Feb. 2022), no public
    redistribution, so **not bundled**. But it's the **recommended** body
    font for dyslexia mode: the package **explicitly recommends it**
    (docs + `LICENSES/README`), pointing to downloading it from
    [sylexiad.com](https://www.sylexiad.com) and wiring it in via the
    extension point. Andika is the **bundled OFL default** (works with
    nothing to install); Sylexiad is the **recommended upgrade**.
  - **Tiresias Infofont** — GPL v3 (friction inside an MIT package) **and**
    absent from the portfolio's active selector **and** a signage font
    (RNIB, labels read at 30-100 cm), not for web reading. Excluded.
  - **Raleway Dots** — absent from the active selector, a decorative
    dotted font with no accessibility use case. Excluded.
- **Optimized dyslexia mode (`.dyslexia-optimized`)**: rebuilt as a
  **configurable 3-level module** — title (`h1`), subtitle (`h2-h6`),
  body (paragraphs + running text). Defaults: title = Lexend Giga,
  subtitle = Lexend Deca, **body = Andika**; the portfolio overrides the
  body with **Sylexiad**. Different fonts per level is a deliberate design
  choice (preserve the hierarchy, don't flatten it).
- **Deliberate rendering fix** (bug found 2026-07-08): dyslexia mode
  currently **shrinks** paragraphs (a substitute font with a small
  x-height, no compensation; the old compensation is commented out).
  Clean fix: **`font-size-adjust`** (normalizes x-height) → the body keeps
  the right size regardless of the font. Recommendation: **compensate +
  ~10%** on the body. **Spacing** (British Dyslexia Association,
  visually-validated calibration points): line-height **~1.7**,
  letter-spacing **~0.05em**, word-spacing **~0.16em**.
- **Individual font selector** (OpenDyslexic / Atkinson / Andika +
  Sylexiad on the site side): also gets the `font-size-adjust`
  compensation (same shrinking bug).
- **High-contrast (size/spacing/`font-size-adjust`)**: out of scope for
  E5, noted in [TODO.md](./TODO.md) as "to optimize later."

## Goal and scope

| Goes into the package | Stays in the portfolio |
| --- | --- |
| `fonts/`: OpenDyslexic, Andika, Atkinson, Lexend Giga/Deca + `LICENSES/` | `public/fonts/` unchanged (the site serves ITS OWN files, Sylexiad included) |
| `scss/modules/_a11y-fonts.scss`: `@font-face` (path `$a11y-fonts-path !default`), selector classes (`.dyslexic-font`, `.atkinson-font`, `.andika-font`) **+ `font-size-adjust`**, and the **configurable dyslexia mode** mixin (`$dyslexia-fonts`, `$dyslexia-spacing` `!default`) | **Sylexiad** classes/`@font-face`, brand fonts (Inter, Quicksand), site-specific dyslexia-mode overrides (`.header__title-name`…), `with(body: Sylexiad)` config |
| `scss/modules/_motion.scss`: generic `@media (prefers-reduced-motion)`, `.reduce-motion` class, `motion-safe` mixin | site-specific motion selectors (`.portfolio__card`…) |
| `react/`: SSR-safe DOM appliers + generic `usePreference` + types | zustand stores (`fontSizeStore`, `dyslexicFontStore`) + motion toggle: **kept**, delegate DOM application; localStorage keys/formats unchanged |

## Oracles

- **Phases 1-3 (relocation)**: byte-identical CSS modulo pragmas (the E3
  rule); identical behavior (localStorage keys `font-size-storage`,
  `reduce-motion`, dyslexia store; same DOM classes; 75-150 zoom bounds).
  Normalized diff required.
- **Phase 4 (deliberate fixes)**: **rendering intentionally changes** for
  dyslexia mode and the font classes (compensated + enlarged size,
  spacing). The byte-identical oracle **does not apply** to these blocks;
  it stays required everywhere else (themes, other components). **Visual
  validation required.**
- **Font drift guard**: a test comparing checksums of
  `packages/a11y-prefs/fonts/` files against `public/fonts/` (identical
  copies until the E6 CLI).
- Full suite + build + lint + tsc green at every phase.

## Phase 0 — Preparation

Clean tree, branch, CSS baseline (`/tmp/e5-modules/phase0.css`,
`--load-path=node_modules`). Exact inventory and **capture of the current
rendering** of the blocks that will change in phase 4
(`.dyslexia-optimized`, the `.dyslexic-font`/`.atkinson-font`/
`.andika-font` classes) for a before/after comparison. Locate
`@font-face`, font classes, the `.reduce-motion` block and
`@media prefers-reduced-motion`.

## Phase 1 — Redistributable fonts + licenses into the package

1. Copy (don't move) into `packages/a11y-prefs/fonts/`: OpenDyslexic,
   Andika, Atkinson Hyperlegible Next, Lexend Giga, Lexend Deca. **Never
   Sylexiad, Tiresias, or Raleway Dots.**
2. `packages/a11y-prefs/fonts/LICENSES/`: one OFL file per family (own
   copyright) + a summary `README.md` from the audit that **explicitly
   recommends Sylexiad** as the dyslexia mode's body font (to download
   from sylexiad.com and wire in via the extension point), Andika
   remaining the bundled OFL default.
3. Drift-guard test (checksums) in the Jest suite.
4. The package's package.json `"files"`: add `fonts`.

**Oracle**: strictly byte-identical CSS (no SCSS touched).
**Commit**: `feat(theme): e5 phase 1 — redistributable fonts + licenses into the package`.

## Phase 2 — Opt-in SCSS modules (byte-identical relocation)

Relocation **with no rendering change** (fixes are in phase 4):

1. `scss/modules/_a11y-fonts.scss`: the package fonts' `@font-face` rules
   (path `$a11y-fonts-path: "/fonts" !default`) + the selector classes
   as-is (`.dyslexic-font`, `.atkinson-font`, `.andika-font`) and the
   `.dyslexia-optimized` block **copied identically** (its configurable
   redesign is in phase 4).
2. `scss/modules/_motion.scss`: generic `@media (prefers-reduced-motion)`,
   `.reduce-motion`, and the `motion-safe` mixin.
3. Portfolio: `_typography.scss` keeps the brand fonts + **Sylexiad**
   (classes + `@font-face`); it `@use`s the modules and keeps its
   site-specific selectors. The **dead** Tiresias and Raleway Dots
   `@font-face`/classes (fonts not bundled, absent from the active
   selector) are **removed** — dead-code removal, nothing was using them.

**Oracle**: byte-identical CSS modulo pragmas **and** modulo removing the
dead Tiresias/Raleway rules (expected diff = only those rules; raw output
in the report).
**Commit**: `refactor(theme): e5 phase 2 — opt-in scss modules (relocation)`.

## Phase 3 — DOM appliers + usePreference (react)

1. `react/appliers.ts`: `applyFontSizeFactor(percent)` (`--font-size-factor`,
   formula `size/100`), `applyAccessibilityFont(font, extraClasses?)`
   (removes every class, sets the right one — `extraClasses` covers
   Sylexiad on the portfolio side), `applyReduceMotion(enabled)`.
   SSR-safe.
2. `react/usePreference.ts`: `usePreference<T>(key, { defaultValue,
   serialize?, deserialize?, apply })` — lazy localStorage init, DOM
   application, a persisting setter. **Unit tests** (jsdom). `useTheme` is
   NOT migrated onto it (zero churn, a later iteration).
3. Portfolio: `fontSizeStore`/`dyslexicFontStore`/motion toggle delegate
   DOM application to the appliers — state, keys, formats unchanged.

**Oracle**: identical behavior (same classes, same keys — menu tests +
class-name regression test), CSS untouched.
**Commit**: `refactor(theme): e5 phase 3 — DOM appliers + generic usePreference`.

## Phase 4 — Rendering fixes (VISUAL, validated)

1. **`font-size-adjust`** on the selector classes
   (`.dyslexic-font`/`.atkinson-font`/`.andika-font`) and on the dyslexia
   mode's body: normalizes x-height → no more shrinking. Target value =
   calibration (aim for Inter's appearance; `from-font` if support allows,
   otherwise a numeric value). **+~10%** on the dyslexia mode's body.
2. **Configurable dyslexia mode**: rewrite `.dyslexia-optimized` through a
   mixin driven by `$dyslexia-fonts` (title/subtitle/body) and
   `$dyslexia-spacing` (line-height ~1.7, letter-spacing ~0.05em,
   word-spacing ~0.16em), targeting the **semantic** levels
   (`h1`, `h2-h6`, body). Default body = **Andika**. The portfolio passes
   `with (body: Sylexiad)` + keeps its site-specific class overrides
   (`.header__title-name`…).
3. Remove obsolete, commented-out compensation leftovers.
4. **Expected CSS diff** confined to the `.dyslexia-optimized` blocks and
   the font classes; raw output in the report; before/after screenshots.

**Oracle**: NOT byte-identical (intended changes); the rest of the CSS
unchanged; **visual validation required** (dyslexia mode: paragraph size,
spacing; each selector font: correct size).
**Commit**: `feat(theme): e5 phase 4 — fix a11y font sizing + configurable dyslexia mode`.

## Phase 5 — Wrap-up

1. Full suites + build + `contrast:report` (unchanged); manual smoke test
   (zoom, each font — including Sylexiad —, dyslexia mode, motion
   reduction, persistence on reload).
2. Docs: README § 3 and § 6.5, guide § E5 (done), TODO (audit checked off,
   Tiresias/Raleway/Sylexiad decisions logged); summary changelog entry
   with a before/after dyslexia-mode table; final report.

**Commit**: `docs(theme): e5 phase 5 — finalization`.

## Out of scope (do NOT do)

- Migrating `useTheme` onto `usePreference` (a later iteration).
- Migrating the zustand stores onto the package's hooks (the consumer
  keeps their state; the package provides the appliers).
- **High-contrast typography optimization** (size, spacing,
  `font-size-adjust`) — noted in the TODO, after E5.
- The UI (E6), the publishable dist, and publication + the name (E7).
- The Sylexiad-served-by-the-site question (decision, outside this chantier).
- Anti-FOUC for non-theme preferences (zoom/font on zustand rehydration)
  — a future improvement, not here.
