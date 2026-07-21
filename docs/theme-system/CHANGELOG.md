<!-- @format -->

# Changelog — Color theme system

Tracks changes to color theme management (SCSS `abstracts/` + `themes/`,
`useTheme`, the anti-FOUC script, `AccessibilityMenu`). Complements the
project's global [CHANGELOG](../../CHANGELOG.md): every change to the
theme system must be logged **here**, with the level of detail useful for
the future extraction into a reusable package.

Format: grouped by date (the project deploys continuously, no versions).
Sections: `Added` / `Changed` / `Fixed` / `Removed` / `Docs`.

---

## 2026-07-21 (integration-guide docs + `theme-example` → `theme-setup` rename, branch `docs/package-integration-guide`)

Acting on the ArgentBank integration feedback (points #1–8, #12, #13).
Mostly documentation; one file rename. Not published yet — folds into
the next release (0.4.0) with the trigger-icon work.

### Changed

- **Renamed the scaffolded `theme-example.scss` → `theme-setup.scss`**
  (#13). "example" read as throwaway, but it's permanent production code
  that drives every theme. Updated the template header (with a warning:
  `init --diff` tracks by exact path, so don't rename your local copy),
  `README`, `AGENTS.md`, the `theme.config.scss` cross-reference, and
  the CLI "next steps" message. Low-risk for existing consumers: they
  own their copied file (shadcn model), so upgrading the npm package
  never touches it — only fresh `init` runs get the new name.

### Docs (`AGENTS.md` / `README.md`)

- **New "Migrating an existing codebase" section** (#4, #12 + family
  guidance): grep recipes to find hardcoded colors (no codemod ships —
  mapping needs judgment, an agent refactors it); the **map-by-value-
  not-by-element-type** rule (a "card" that was the page color maps to
  `$bg-base`, not `$bg-container`); and **family choice framed as an
  advisory, conditional conversation** — the nearest Tailwind match is a
  starting point, the guide surfaces the dark-theme consequence, offers
  alternatives, and lets the client decide (contrast holds regardless,
  so it's a look choice, never a rule). Applies to any color, but
  matters most for the background (its family becomes the whole neutral
  rail and tints every dark theme). Presented as a spectrum — stays gray
  (`neutral`/`zinc`/`stone`), cooler (`gray`/`slate`), tinted neutrals
  (`taupe`/`mauve`/`mist`/`olive`), fully chromatic (a bold colored dark,
  `+2` toward `900`/`950` to keep it usable) — with a sample
  client-guiding phrasing.
- Anti-FOUC: **static-HTML / Vite worked examples** (precompute-once and
  `transformIndexHtml` plugin) (#1).
- Path A: show the `$primitives` declaration syntax up front (#2);
  document that re-running `init` **skips** existing files, never
  clobbers without `--force` (#3).
- `AccessibilityControl` props fully typed — `position` enum, `icon`
  as `ReactNode`, `complianceUrl` (#6). Concrete **pre-header band**
  markup + SCSS example (#7).
- `configureThemeExtraction`: `entry` is compiled by Sass directly —
  no bundler aliases, use `loadPaths`; keep it a minimal alias-free
  assembly file (#5).
- `--waive` grammar: first `=` separates a JS regex from the free-text
  reason; quote the whole argument in the shell (#8).

## 2026-07-19 (trigger icon restored — Simon's pictogram, as SVG, branch `feat/trigger-icon-svg`)

### Fixed

- **The scaffolded trigger's default icon is Simon's own accessibility
  pictogram again** (half-dark/half-light eye + adjustment gauge —
  designed for this package). The E6 template generalization had
  silently swapped it for react-icons' generic `FaUniversalAccess`
  (shipped through 0.1.0→0.3.0); decision recalled: icon/visual choices
  are Simon's, never substituted silently. Now an **inline SVG** in
  `templates/react/AccessibilityControl.tsx` (from Simon's new
  vectorization of the icon): crisp at any zoom, zero image assets to
  scaffold, recolored by the existing CSS filters exactly like the
  raster was. `icon` prop unchanged as the override. The menu's
  compliance-statement link keeps `FaUniversalAccess` (faithful to the
  portfolio, which uses it there too).

### Changed

- Portfolio: the header button now serves the SVG
  (`public/icons/…/Icon_Accessibility_Contrasts-Visuals.svg`, replacing
  the AVIF/WebP/PNG `<picture>`) — same drawing, same filters, vector
  sharpness at high zoom.

Not published yet — further improvements are queued before the next npm
release (Simon, step by step).

## 2026-07-18 (darkmode-plus-a11y 0.3.0 — per-theme engine overrides in the generator, branch `feat/generator-config-passthrough`)

Prompted by an external review of 0.2.0: the CVD `family-remap` tables
(and every other per-theme engine config) were reachable only by calling
the transforms directly — `generate-all-themes()`, the recommended path,
hardcoded the defaults with no way through. Additive → MINOR (0.3.0).
**Published to npm the same day** (tag `latest`, merge `4351918`).

### Added

- **`generate-all-themes($themes, $configs: ())`** and
  **`apply-theme($name, $config: null)`** (`_theme-generator.scss`):
  optional per-theme partial configs, deep-merged over each theme's
  defaults (one extra `family-remap` entry extends the default table
  instead of replacing it). `anti-glare-dark`'s config reaches its dark
  base; `light`/`anti-glare-light` take none (`@warn` if given one).
  Typo guard: a `$configs` key matching no requested theme warns instead
  of dying silently.
- **6 probe tests** (`generator-config.test.ts`): control values, CVD
  remap override + default-entry survival, dark adjustments override,
  HC partial colors slot merge, both warning guards.

### Changed

- The 9 transform mixins' internal config merge is now
  `map.deep-merge` (was shallow `map.merge`): a partial nested map
  passed to a transform directly no longer silently wipes the untouched
  entries of `family-remap`/`adjustments`/`colors`. Byte-identical for
  empty or complete configs — the full suite is the oracle.

### Fixed

- AGENTS.md's Path B example claimed the role variables were "already
  emitted" by the generator — false (the portfolio and the scaffolded
  template each emit their own): the example now includes
  `emit-role-vars()`, without which the shipped contrast suite has no
  role custom properties to read.

### Docs

- AGENTS.md: new "Per-theme engine overrides (`$configs`)" section,
  including the semantics of a family ABSENT from a CVD remap table
  (left unchanged; distinguishability is a property of your palette's
  role pairs — run the suite, then add an entry only if a pair fails).
- README: pointer to that section from the Path B paragraph.

## 2026-07-18 (darkmode-plus-a11y 0.2.0 — published to npm)

`darkmode-plus-a11y@0.2.0` published to the npm registry (tag `latest`),
bundling the two chantiers below (full Tailwind palette + off-palette
color anchor) plus the shipped-package comment cleanup. Pre-publication
review: full diff re-read, 758/758 tests, tsc/eslint clean, tarball
dry-run validated (94 files, fresh `dist/` via `prepack`).

## 2026-07-17 (darkmode-plus-a11y 0.2.0 — the full Tailwind palette, branch `feat/complete-palette`)

Prompted by the first integration attempt outside this repo: the package
shipped only 9 of Tailwind's 26 color families, so a bluish indigo
brand color (`#6866e9`) had no close anchor (`violet` was the nearest,
visibly too pink). Plan: [PLAN-complete-palette.md](./PLAN-complete-palette.md).
Published to npm on 2026-07-18, together with the off-palette color
anchor below.

### Added

- **17 new Tailwind families** (`_base-palette.scss`, `10388b3`): 11
  chromatic (`yellow`, `lime`, `green`, `teal`, `cyan`, `blue`,
  `indigo`, `purple`, `fuchsia`, `pink`, `rose`), 2 grays (`gray`,
  `zinc`), 4 tinted neutrals new to Tailwind v4 (`taupe`, `mauve`,
  `mist`, `olive` — hex values cross-checked byte-identical between
  Simon's pasted OKLCH figures and `tailwindcss@4.3.3`'s own
  `theme.css`). The palette moves from Tailwind v3 hex values to v4's
  native OKLCH, extracted verbatim from the installed package (not
  retyped) — 26 families × 11 weights.
- Every `$colors` key is now **quoted** (`10388b3`), the 6 originally
  unquoted keys included: the `redd → red` incident (2026-07-13)
  generalized and closed for good — an unquoted key matching a CSS
  named color silently breaks every string lookup.
- **Package README / AGENTS.md**: the "Palettes" / "Prerequisites"
  sections now enumerate all 26 available families (previously
  undocumented — a consumer had no way to know which families
  existed).

### Fixed

- **Anti-glare engine gamut bug** (`_anti-glare-functions.scss`,
  `10388b3`): `transform-for-anti-glare` ended on a bare
  `color.to-space(…, rgb)` — a coordinate conversion, not a gamut map.
  Latent since day one (v3 hex colors never triggered it), surfaced by
  v4's wider gamut: an out-of-sRGB result serialized with broken HSL
  channels (saturation > 100%) instead of being brought back in-gamut.
  Fixed by routing through `gamut-map-srgb` (the CVD engine's existing
  CSS Color 4 `local-minde` helper) — output stays OKLCH throughout,
  only out-of-gamut colors get chroma-reduced.
- **CVD engine's off-palette custom-color branch** (`_theme-utils.scss`,
  `remap-for-cvd`, `10388b3` + `1ac7f8e`): same anti-pattern on output
  (gamut-mapped, then still downgraded to legacy `rgb()`), plus a
  second gap on input — `color.change()`'s `$space:` only governs
  channel interpretation, not the return color's serialization, so a
  legacy hex custom color kept its legacy space through the pipeline
  (Sass's own behavior, confirmed in isolation, not a bug in itself).
  Fixed: `color.to-space($color, oklch)` upgrades the input first, so
  both an OKLCH and a legacy hex custom color now come out
  OKLCH-consistent. Deliberately scoped to this one already-isolated,
  currently-dead-code branch (the portfolio's own themes never carry an
  off-palette color) — not extended to the anti-glare engine (no
  equivalent branch, and explicitly out of scope per Simon: the
  package is designed around Tailwind-palette primitives, not general
  custom-color support, which isn't offered yet).
- **`_theme-variables.scss`**: two `rgba($role, alpha)` calls
  (tooltip-bg, shadow) — `rgba()` only accepts legacy RGB/HSL/HWB,
  not OKLCH. Replaced with `color.change($role, $alpha:)`.

### Verified

- 748/748 tests, `tsc` clean, `sass` compile clean throughout.
- `CONTRAST-REPORT.md` and `HC-SEMANTIC-AUDIT.md` regenerated (HC audit
  unchanged: 0 active / 15 waived).
- 15 themes recompiled and **visually validated by Simon** on the live
  site — the byte-identical oracle no longer applies by design (OKLCH
  v4 colors differ slightly from v3 hex); the full contrast /
  distinguishability / gamut suite is the safety net instead.
- **CVD measurement, methodology corrected mid-flight**
  (`4a53855`): the first attempt (each new family vs the 6 existing
  roles, 2 weights, 7 CVD types) produced 345 findings that were
  mostly noise — comparing families against roles they'd never coexist
  with, and testing a uniform weight even for hues that are naturally
  lower-contrast at that weight regardless of CVD. Reframed: the
  package's real safety net for a consumer's actual role choice is
  their own contrast/distinguishability suite (documented in
  AGENTS.md); this phase is a data sanity check on the palette itself,
  not pre-validation of every hypothetical combination the engine
  can't solve in advance anyway. Final test: the 11 new chromatic
  families at weight 600 under the 7 CVD types (6 dichromacy +
  achromatopsia) — zero anomalies, plausible and stable contrast
  ranges throughout (blue 4.25–6.65:1, indigo 5.38–7.10:1, directly
  answering the bluish-indigo case). No remap/anchor entries added: the
  existing fallback (unmapped family left unchanged for red-green;
  OKLCH hue-nudge for off-palette colors) already covers new families,
  same as the original 9.

### Docs

- `package.json` version bumped to `0.2.0` (additive → MINOR, per the
  recorded 0.x release strategy).

## 2026-07-17 (darkmode-plus-a11y 0.2.0 — off-palette color anchor, branch `feat/off-palette-anchor`)

A silent safety net for consumers who bypass the documented Tailwind-
primitive contract (hand-assign a role to a color outside the palette,
off-spec, no clean-result guarantee). Plan:
[PLAN-off-palette-anchor.md](./PLAN-off-palette-anchor.md). Joins the
still-unpublished `0.2.0` — not a separate bump. **Deliberately not
documented in the public README/AGENTS** (stays a silent internal
mechanism, per Simon).

### Added

- **`oklch-distance($c1, $c2)`** (`_theme-utils.scss`): perceptual
  distance on OKLCH's Cartesian projection (`a = C·cos(H)`,
  `b = C·sin(H)`, the same idea as CIELAB's a\*/b\*). Not CIEDE2000
  (unavailable in SCSS — the testing layer's `differenceCiede2000()`
  is TypeScript/culori), cross-checked against it on a small sample,
  then used as the SCSS-native metric for the calibration below.
- **`analyze-tailwind-color()` extended**: now always tracks the
  nearest palette entry during its existing exact-match walk (no
  second pass) — returns `nearest-family`/`nearest-weight`/`distance`
  alongside the existing `family`/`weight`/`found`. Purely additive;
  every existing caller (`convert-to-neutral-gray`, achromatopsia)
  only reads `found`, unaffected.
- **`$off-palette-same-color-threshold: 3.75`**: calibrated by
  exhaustively compiling `oklch-distance` against two real
  distributions (throwaway probe, not kept in the source tree) — 242
  "same real color, different Tailwind major version" pairs (every
  family shared between v3 and v4 × 11 weights, v3 hex read from the
  real `tailwindcss@3.4.17` package) measured 0.0056–3.6127; 260
  "genuinely different, adjacent palette weight" pairs (all 26
  families × 10 weight-steps) measured 1.50–16.97, with the smallest
  17 exclusively the 50→100 step (an intrinsic near-white compression
  in Tailwind's own ramp, not a defect here). 3.75 sits just above the
  full same-color range and below every other genuinely-distinct
  adjacent-weight pair except two near-white outliers whose worst-case
  effect is bounded (never a wrong family, never the light-mode value —
  only which of two visually-adjacent near-white grays gets picked as
  a derived-theme anchor).
- **`auto-dark-transform` and `remap-for-cvd` wired to the anchor**:
  their off-palette branches now resolve `family`/`weight` from
  `nearest-family`/`nearest-weight` instead of the old generic
  fallbacks, then proceed through the exact same calibrated,
  gamut-safe machinery every recognized Tailwind color already uses.
  Below the threshold: silent. Above it: one `@warn` per token
  (`"«name»: off-palette color, anchored to «nearest-family»-«nearest-weight»
  for derived themes (distance «distance») — result not guaranteed,
  prefer a Tailwind primitive."`). The light-mode value itself stays
  exactly what the consumer gave (upgraded to OKLCH if needed, per the
  existing 2026-07-15 fix) — only derived themes read the anchor.
- **Direct SCSS-level probe tests**
  (`src/accessibility/contrast/__tests__/off-palette-anchor.test.ts`,
  10 tests): `oklch-distance` sanity, `analyze-tailwind-color`'s
  regression guard on exact matches, the v3-hex-paste silent case, and
  a real custom brand color as the "genuine custom color" warn
  case for both engines, plus a dark-mode gamut check on a saturated
  off-palette color.

### Fixed

- **The dark-mode gamut gap found and parked on 2026-07-17** (`auto-
  dark-transform`'s old "not found" branch, `adjust-lightness-clamped`
  with no gamut guard at all — confirmed broken:
  `oklch(39% 0.164 32.9deg)`, `in-gamut: false`) is closed as a side
  effect: an anchored result is a real, already-verified-in-gamut
  palette color by construction.

### Removed

- **`cvd-safe-anchor-hue()`** (`_theme-utils.scss`): the OKLCH hue-
  rotation fallback it fed was `remap-for-cvd`'s own off-palette
  branch, now replaced by the anchor. Zero remaining call sites, not
  part of the documented public API — removed rather than left dead.

### Verified

- Full portfolio suite: 758/758 green (748 existing + 10 new) —
  byte-identical for the portfolio's own 15 themes, confirmed via
  `pnpm contrast:report` / `pnpm hc:audit` (no diff) as well as Jest:
  none of the portfolio's own primitives are off-palette, so these
  branches never fire from its compiled CSS. The new tests exercise
  them directly.

## 2026-07-15 (docs: French filenames anglicized)

### Changed

- Simon's English-only rule covers **filenames** too — the translation
  pass had converted the contents but kept six French document names
  (plus the dyslexia preview pair). Renamed with git history preserved,
  and every cross-reference updated repo-wide (docs, root CHANGELOG,
  source comments in `src/` and the package):
  `GUIDE-extraction-paquet` → `GUIDE-package-extraction`,
  `PLAN-tests-contrastes` → `PLAN-contrast-tests`,
  `PLAN-revue-moteurs` → `PLAN-engine-review`,
  `PLAN-refonte-daltonienne` → `PLAN-colorblind-redesign`,
  `PLAN-migration-fondations` → `PLAN-foundations-migration`,
  `PLAN-hc-mecanique-controles` → `PLAN-hc-mechanics-controls`,
  `previews/generate-preview-dyslexie.py` →
  `generate-preview-dyslexia.py`, `preview-dyslexie.html` →
  `preview-dyslexia.html`. Historical text inside the documents is
  untouched; only names and link targets changed.

## 2026-07-15 (🚀 PUBLISHED — darkmode-plus-a11y 0.1.0 on the public npm registry)

### Added

- **First publication**: `darkmode-plus-a11y@0.1.0`, tag `latest`,
  94 files / 6.7 MB unpacked —
  <https://www.npmjs.com/package/darkmode-plus-a11y>. Beta phase per
  the recorded release strategy (0.x: the API may still move; strict
  semver locks in at 1.0.0). Day-of sequence: name re-verified free
  (404), `private` lock removed + version flipped (`540db5f`),
  `pnpm publish --dry-run` reviewed, then `pnpm publish` run by Simon
  in his interactive terminal (npm's browser 2FA — passkey via Proton
  Pass — cannot happen in a non-TTY shell; the EOTP failure from the
  non-interactive attempt is expected behavior).
- **Full cycle re-proven against the real registry** (not the tarball
  this time): fresh project → `npm install darkmode-plus-a11y` →
  `init` (9 files + fonts) → sass compile → **15 `[data-theme]`
  blocks** → `audit` CLI on the shipped dist (0 active warnings) →
  `require()` of the react/testing dist entries (15 themes, 19 role
  pairs). The GUIDE § E7 exit criterion is met.
- Account/2FA context recorded for future publishes: npm no longer
  offers TOTP enrollment (security keys/passkeys only since
  Sept 2025); Simon's 2FA = passkey in Proton Pass (Firefox) + a
  second device key; publishes therefore require his browser
  validation — by design, no bypass token.

## 2026-07-15 (Sylexiad licensing settled — last open review item besides publication)

### Changed (decision Simon, same day — the package was never affected)

- Reminder of the standing E5 decision, unchanged: Sylexiad is
  **excluded from the package** (proprietary EULA) and only
  recommended; Andika (OFL) is bundled. This item was about the
  **portfolio repo only**: 16 Sylexiad files (`.ttf` + `.woff2`) were
  committed in the public GitHub repo — public redistribution, the
  exact thing the EULA forbids (serving them as webfonts on the site is
  the normal, tolerated use; distributing the files is not).
- Fix, zero site impact: files **untracked + gitignored**
  (`public/fonts/Sylexiad*`) but kept on disk — production deploys via
  `vercel --prod` from the local checkout, so the site still serves
  them; a backup copy lives in `private/fonts-backup/sylexiad/`
  (anti-loss guard, and they remain re-downloadable from sylexiad.com).
  History note: past commits still contain the files (no history
  rewrite — accepted).
- **`public/fonts/README.md`** added (committed): licensing note +
  restore instructions for a fresh checkout (Simon's "warning" idea).
- **Andika promoted to second in every Sylexiad stack** (Simon's
  safety-net idea): `.sylexiad-font` / `.sylexiad-serif-font` classes
  (`$fallback: ("Andika", sans-serif|serif)`) and the dyslexia-mode
  body (`$body-font: ("SylexiadSans", "Andika")`). If Sylexiad is ever
  missing, the dyslexia experience degrades to a dyslexia-friendly OFL
  font instead of a generic one. Intended CSS change, verified in the
  compiled output; 748 tests green.

## 2026-07-15 (E7 executed except npm publication — Simon's mandate "everything but publish")

### Changed (rename, committed separately: `44af307`)

- **`a11y-prefs` → `darkmode-plus-a11y`**, one atomic pass: package
  `name`, `packages/` directory (git renames preserved), every
  portfolio import (SCSS `@use`, TS, Jest mapper, `transpilePackages`,
  workspace dep), CLI `SOURCE_IMPORT` (templates now carry the
  published name; `--pkg` still rewrites aliased installs), package
  AGENTS.md snippets, living sections of the design README. Verified:
  748 tests, tsc, next build, byte-identical audit report, CLI smoke.

### Added

- **`package.json` metadata** for the npm page: real description,
  `keywords`, `repository` (+ `directory`), `homepage`, `bugs`.
  `version 0.0.0` + `private: true` deliberately KEPT — the
  anti-accidental-publish lock until the actual publication.
- **CI workflow** (`.github/workflows/ci.yml`): lint → tsc → Jest
  (includes the contrast gates) → package dist build → HC semantic
  audit in `--strict` mode (with the site waivers) → production build.
  The two risky steps were validated locally first (audit exit 0;
  `next build` green **without** `.env.local`).
- **Prebuilt CommonJS dist** (`dist/`, tsc, `.d.ts` included, built by
  `prepack`/CI, gitignored): `./react`, `./react/*` and `./testing/*`
  exports now point at compiled JS. **Forced by a real-world failure**,
  not a preference: the pack-based full-cycle proof revealed
  `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` — Node refuses to
  type-strip files under `node_modules`, and consumer Jest/Vitest
  default configs don't transform `node_modules` either, so raw TS
  sources broke BOTH the audit CLI and the documented test-suite
  recipe for every real consumer (invisible from the monorepo, where
  the package is not under `node_modules`). CJS chosen over ESM
  because the sources' extensionless relative imports stay valid at
  runtime with zero Node-version requirement — the audit CLI's
  "Node ≥ 22.18" constraint disappears. `run-audit.mts` reverted to
  plain `run-audit.ts` (the type-stripping rationale died);
  `bin/cli.mjs audit` now spawns `dist/testing/run-audit.js` with a
  helpful message on raw checkouts. The portfolio keeps reading the
  **TS sources** via `tsconfig` `paths` (instant preview preserved,
  per the 2026-07-11 decision); `allowImportingTsExtensions` and the
  `**/*.mts` include added on 07-14 became unnecessary and were
  reverted.
- **Full-cycle proof, pack-based** (publication excluded by Simon):
  `pnpm pack` → disposable npm project → install tarball (+ react) →
  `npx darkmode-plus-a11y init` (9 files + 22 fonts) → `sass` compile
  of the scaffolded `theme-example` → **15 `[data-theme]` blocks** →
  `audit` CLI on the compiled dist (**0 active warnings — the shipped
  template wires cleanly**) → `require()` of `testing/pairs`,
  `testing/wcag` and the `react` entry from the dist, all green. To
  re-run against the real npm version at publication.

### Decided

- **Dependency hygiene**: `sass`/`postcss`/`culori` stay regular
  dependencies — they power the verifier and the zero-config `audit`
  CLI; the guarantees are the product, batteries included. Documented
  in the package README ("Dependency weight").
- Consumer docs updated accordingly: README "Good to know" (prebuilt
  dist, no `transpilePackages`, dependency weight) and AGENTS.md
  (verification prerequisites simplified — any Jest/Vitest works
  as-is; audit CLI has no Node requirement).

## 2026-07-14 (E7 prep — package README)

### Added

- **`packages/a11y-prefs/README.md`** — the npm-page / human half of
  the two-document scheme (REVIEW § 2; AGENTS.md is the AI/deterministic
  half). Editorial line as decided: dark-mode-first hook ("you came for
  dark mode, your users leave with 15 accessible themes"), the mission
  up front (assistive quality built into websites, free — vs €2,000
  tools), features (one light theme → 15 themes, mechanical guarantees,
  React runtime, OFL font modules, scaffolded menu), a 5-step quick
  start, the 3-layer contract with the full role list and the semver
  promise, the SCSS-first stance with the Tailwind bridge pointer,
  **pinned scope** (colors + text fonts today; extreme-zoom
  recommendations named as future work, per the 2026-07-14 decision),
  and honest notes (TS sources / `transpilePackages`, FR/EN UI labels,
  `MIT AND OFL-1.1`). Snippets use the final published name
  (`darkmode-plus-a11y`) — unlike the templates, the README is not
  rewritten by `init`.

## 2026-07-14 (E7 prep — HC semantic inspector shipped to consumers, A + B)

### Added (decision: both options from REVIEW § 3, same day)

- **Name-based semantic inspector extracted into the package**
  (`testing/hc-semantic-audit.ts`, portfolio = first consumer — same
  pattern as E6.6): generic engine (`runHcSemanticAudit`,
  `formatHcAuditReport`, `segments`/`familyOf`/`pairBase`,
  `DEFAULT_FAMILIES`, `defaultHcWaivers`, `deriveHcSlots`). The module
  is deliberately **self-contained** (zero relative imports) so it runs
  both in TS test runners and under Node's native type stripping.
  Portfolio side, `src/accessibility/contrast/hc-semantic-audit.ts`
  keeps only the calibration: explicit HC slot mirror + 3 site waivers
  appended to the package defaults. Oracle held:
  `HC-SEMANTIC-AUDIT.md` regenerated **byte-identical** (0 active / 15
  waived), report label parametrized (`commandLabel`).
- **`audit` CLI subcommand** (`npx darkmode-plus-a11y audit --entry
  styles/main.scss --load-path node_modules [--themes a,b] [--waive
  "regex=reason"]… [--out report.md] [--strict]`): zero-config
  auto-detection of `high-contrast*` themes, derived slots by default
  (documented caveat: `--focus-ring` may be wired to the link color —
  the portfolio passes explicit slots for exactness). Runs the
  TypeScript entry `testing/run-audit.mts` through **Node ≥ 22.18
  native type stripping** (verified: extensionless relative imports
  fail, explicit `.ts` extensions work — hence a self-contained engine
  and a CLI-only `.mts` entry consumers never type-check); on older Node
  the CLI prints the two working alternatives (`npx tsx …`, test-suite
  route). Verified on the portfolio: 7 active warnings without site
  waivers (expected consumer default), 0 active with the two `--waive`
  flags, `--strict` exit codes correct.
- AGENTS.md § Verifying your wiring: name-based inspector documented
  (CLI and test-suite forms, waivers, slots precision note) plus a
  failure-modes row. Portfolio `tsconfig`: `allowImportingTsExtensions`
  and `**/*.mts` included so the CLI entry stays type-checked.

## 2026-07-14 (E7 prep — consumer guide fixed and promoted to the package root)

### Fixed (pre-E7 review, bug #1 and #2 of REVIEW-e7-readiness.md § 1)

- **The consumer guide referenced commands that do not exist in a
  consumer project**: `templates/AGENTS.md` told integrators to run
  `pnpm hc:audit` and relied on "the palette conformance test" — both
  live in this portfolio, not in the package. A consumer (human or AI)
  following the guide hit "command not found", and the GUIDE's promise
  ("offer the same guarantee to future consumers") had no documented
  recipe. The guide's verification section is rewritten around a
  **working recipe on `testing/*`** (three files: extraction setup,
  pairs registry, Jest matrix test — plus optional distinguishability
  and high-contrast palette-conformance sketches) with a failure-modes
  table (undefined variable = nonexistent role, missing theme, missing
  token, real defect vs documented waiver). Same phantom reference
  fixed in `templates/scss/theme.config.scss`.
- **Dead reference removed**: "the package provides `themeInitScript` —
  see its docs" → replaced by an inline Next.js snippet + the
  plain-string usage for other stacks.

### Changed

- **`AGENTS.md` promoted from `templates/` to the package root**
  (single source, follows the `AGENTS.md` convention agents look for):
  `init` now copies the root file alongside the templates (CLI
  `scaffoldEntries()`, covered by `init --diff` too), and
  `package.json#files` ships it. Verified end-to-end in a scratch
  project: 9 files written, import name rewritten (19 occurrences,
  zero `a11y-prefs` left), `--diff` clean.
- **The guide is rewritten under the SCSS-first positioning** (decided
  2026-07-14, see REVIEW-e7-readiness.md § 4): mission stated (built-in
  assistive quality, free), current scope pinned (colors + text fonts),
  two integration paths (scaffolded UI / engine-only), and a
  **Tailwind bridge section** — semantic-utilities mapping (v4
  `@theme inline` + v3 `theme.colors`), "replace, don't extend" guard
  (raw palette utilities cease to exist), optional CI grep, UI-as-CSS
  compilation path (`npx sass a11y/scss:a11y/css`), no BEM imposed
  anywhere outside the copied component.

### Added / Changed (branch `feat/e6-6-contrast-verifier`)

Closes audit **gap #2** (§6.2): the `contrast/` tooling was on the site
side. The package now ships the **engine**; the site **consumes** it.

- **`packages/a11y-prefs/testing/`**: `wcag`, `measure`, `cvd-simulation`,
  `gamut`, `extract-themes` (parameterized — `configureThemeExtraction({ entry,
  loadPaths, themes })`, the hardcoded `main.scss` path becomes an
  argument), `pairs` (types + `defaultRolePairs` + `defaultDistinguishability
  Pairs` + `withWaivers`). Export `./testing/*`; culori/postcss/sass deps.
- **The portfolio consumes the engine**: `contrast-pairs.ts` imports the
  package's defaults, applies **its own** waivers as an overlay + adds its
  **layer-3** pairs; `setup.ts` configures the extraction (entry +
  node_modules + THEMES), wired into `jest.setup.js` + the report/audit
  scripts; `moduleNameMapper` a11y-prefs/testing.
- **Theme names → `string`** in the engine (generic, no longer tied to
  the site's `ThemeOption` type).
- **Oracle**: `CONTRAST-REPORT.md` **byte-identical** (aside from the
  generation date), `hc:audit` unchanged (0 active, 15 waived), **748
  tests** green, build + tsc + lint OK.
- The **engine tests** (wcag, gamut, cvd) stay in the site's suite for now
  (they import the package); they'll move into the package's own CI in
  E7.

**BOTH audit-§6.2 gaps are now closed** → the package matches the target
scope. What's left: E7 (publishable dist + npm), and the `redd`→
`red` rename (TODO).

## 2026-07-12 (E6.5 chantier — theme generator into the package)

### Added / Changed (branch `feat/e6-5-theme-generator`)

Closes gap #1 of the §6.2 reconciliation audit: the `[data-theme]`
emitter + the standard theme definitions were still on the site side
while §6.2 places them in the package. Realizes the "I define my light
theme → all themes are generated" vision **on the package side**.

- **`packages/a11y-prefs/scss/_theme-generator.scss`** (package):
  `apply-theme($name)` (15 standard recipes migrated: dark, 4× high
  contrast, 6× color-blind, achromatopsia, 2× anti-glare; generalized dark
  accent swap — derives from the primitives, no more hardcoded amber),
  `emit-role-vars()` (layer 1+2 variables), `generate-all-themes($themes)`
  with `@content($name)` for layer 3, `hc-color-map($name)`, `$default-themes`.
- **The portfolio consumes `generate-all-themes`**: `_theme-system.scss`
  reduced to a single call + `:root`/`@media` (light default / system dark
  default); layer 3 and site rules (HC header/focus, anti-glare
  lang-toggle) injected via `emit-consumer-vars` + `theme-overrides($name)`;
  `emit-layer3-vars` extracted into `_theme-variables`. **The 15 theme
  files removed.**
- **Oracle**: **byte-identical CSS modulo pragmas** (0 rule or variable
  gap; 25 fewer `/** @format */` lines, the ex-noise from the theme
  files). Also verified: 15 themes × 39 roles identical to the site. 748
  tests.
- **E6 example** (`templates/scss/theme-example.scss`) reduced to a
  single `@include generate-all-themes() { @include a11y-ui-theme-vars; }`.

E6.6 (extracting the contrast verifier, gap #2) remains before E7.

## 2026-07-12 (E6 chantier — UI templates + scaffolding CLI)

### Added (branch `feat/e6-cli`; the site doesn't change — byte-identical)

shadcn model: the engine stays on npm (updated via version bumps), the UI
is **copied** into the consumer's project (they own it). The portfolio
does NOT consume the templates (its UI is their ancestor); the chantier
oracle = byte-identical site CSS, held at every phase.

- **React templates** (`packages/a11y-prefs/templates/react/`): trigger,
  card, and `accessibilityPreferences` wiring (via the package's
  `usePreference`, no more zustand store). Generalized: package fonts
  only (Sylexiad removed), no framework dependency (next/link +
  next/image removed; react-icons icon, compliance link as a prop),
  in-flow trigger. Import only the public API. tsc + lint OK.
- **SCSS templates** (`templates/scss/`): a faithful copy of the
  rem-first architecture (menu + trigger, driven by CSS variables),
  `accessibility-features` (font-faces + classes + dyslexia + motion via
  the package's modules), `theme.config` (the UI's layer 3 derived from
  the roles, golden rule documented), `theme-example` (a light + HC
  assembly that compiles). All compile.
- **CLI** (`bin/cli.mjs`, pure Node, package `bin`): `init` copies the
  templates + fonts while rewriting the `a11y-prefs` import → the
  installed name (default `darkmode-plus-a11y`), refuses to overwrite
  without `--force`; `init --diff` compares the local copy against the
  reference (new / modified / identical). Verified in a test project.
- **AI guide** (`templates/AGENTS.md`): layer-3 contract (golden rule +
  list of the 25 verified roles), Tailwind prerequisite, wiring, in-flow
  placement (never fixed), pointers to `hc:audit` + the conformance test.

E7 remains: name `darkmode-plus-a11y` settled, publishable dist + npm
publication (see GUIDE § E7, semver versioning policy).

## 2026-07-11 (hc-mécanique chantier — execution)

### Added (focus as a role + the two controls, branch `feat/hc-mecanique`)

- **Focus promoted to an HC map role**: `focus`/`focus-text` slots in
  `$hc-palette` (engine) and in the consumer mixin's map, which now
  MERGES the passed-in map with the defaults (a variant only declares
  what changes); the `$focus-*` arguments become optional overrides; the
  paper variant carries its focus in its map. **Byte-identical CSS**
  (verified).
- **Value-based control** (`hc-palette-conformance.test.ts`): in an
  `high-contrast*` theme, every emitted color ∈ the theme's palette
  (alpha tolerated if the hue ∈ palette). Calibration: 101/106 compliant
  per theme; `--constant-*` waiver (deliberately athematic constants) +
  anti-zombie guard.
- **Semantic inspector** (`pnpm hc:audit` → `HC-SEMANTIC-AUDIT.md`): the
  original design recycled as a read-only control. Whole-segment
  matching ("context" ≠ "text"), per-family synonyms,
  **per-component bg/text pairing** (a pair's truth lies in the pair — a
  legitimately inverted block triggers nothing; text == background =
  an "invisible" alert), a global name↔slot rule for orphans. Calibration:
  70 → 20 → 8 → **0 active warnings**, 15 justified waivers (including
  `--bg-emphasis-strong` and `--color-collapse-bg-title`, emphasis
  surfaces inverted by design — open to review).

## 2026-07-11

### Docs (HC mechanics — archaeology reconstructed + target architecture decided)

"HC second pass" reflection. Important discovery: the **original
design** (semantic capture via layer-3 names —
`transform-for-high-contrast` + `str-index` on `_bg`/`_text`/`link`/
`focus`…) had been **superseded without a decision** during the chantier
(commit `3195de4`, Claude), then removed as dead code (`f16842d`).
The current mechanism captures at layer 2 (explicit assignments +
wiring + lightness) — identified gap: an unwired layer-3 token silently
escapes HC.

Decisions (details: README § 6.6, plan `PLAN-hc-mechanics-controls.md`):
layer-2 wiring alone decides colors; **focus promoted to a layer-2
role**; two read-only controls in the tooling (by **value**: everything
∈ the HC palette; by **name**: the original semantics recycled as an
inspector); AI-oriented implementation guide (E6/E7); `$accent*` in HC
parked. Also decided today: full-site preview on hovering the variants
**dropped** (misleading for keyboard navigation); the README's document
map resynced (E5 and the HC variants closed out).

## 2026-07-10 (HC chantier — high-contrast variants)

### Added (3 variants + selector, branch `feat/hc-variants`)

Concept inspired by ZoomText (two-color presets + a toggle remembering
the last choice), plan: `PLAN-high-contrast-variants.md`. Scope: **the
mechanism is unchanged, only the colors change** (semantic/technological
redesign = a second pass).

- **3 theme variants**: `high-contrast-green` (green on black,
  "phosphor"), `high-contrast-white` (white on black, action = yellow),
  `high-contrast-paper` (black on white, positive polarity — dark system
  hues: link `#0000cc`, success `#007700`, error `#cc0000`;
  focus and header inverted). `high-contrast` = yellow on black,
  historical value kept (existing localStorage entries stay valid). 15
  themes, contrast report **0 failures**.
- **Engine fix**: in `transform-light-to-high-contrast`, `$hc-palette`
  was reassigned without `!global` → the map passed in config was
  silently ignored (invisible as long as the only consumer passed the
  default map).
- **Parameterized consumer mixin** (`_high-contrast.scss`): map +
  focus/header as arguments, defaults = historical values (yellow
  **byte-identical**, verified).
- **UI**: the "High contrast" button reactivates the **last variant
  used** (persisted as `hc-variant`); a variant selector (react-select,
  the font-selector pattern) visible when the mode is active; FR/EN
  i18n; global reset → the yellow variant. The `html.high-contrast`
  typography class and `getColorVisionMode` cover all 4 variants
  (`startsWith`).

### Fixed (feedback from a smoke test — variant styling + color preview)

- **The menu's HC styling only applied to yellow**: the
  `[data-theme="high-contrast"]` blocks (menu selects, tooltips, floating
  button, portal options) become `[data-theme^="high-contrast"]` and
  their hardcoded colors (#ffff00/#000000/white) become theme variables
  (`--near-black`/`--off-white`/`--link-hover`) — equivalence verified
  in yellow (identical rendering), each variant now picks up its own
  colors. Floating-button icon (a filter, not themable via a variable):
  white by default, historical yellow for the yellow variant, dark for
  paper.
- **The variant selector is replaced by 4 direct buttons** (decision
  after two iterations — a react-select is the worst widget for a
  severely low-vision user on NVDA, and an "Aa" swatch serves no
  purpose): each button = a **mini preview** — the full label ("Green on
  black"…) rendered in its variant's actual colors, same pattern as the
  historical "High contrast" button (hover/focus = inversion of ITS
  pair, active = inversion + ring, Atkinson, full width). Visible only
  when the mode is active; `role="group"` + `aria-pressed`. The "High
  contrast" button stays **always yellow/black** (decision made). A
  future idea noted: full-site preview on hover.

### Changed (HC typography — chantier phase 1)

The `html.high-contrast` typography block replaced with
`@include a11y-font-class("high-contrast", "Atkinson Hyperlegible")`:
`font-size-adjust: 0.56` (size compensation), body ls 0.02→**0.04em**,
ws 0.064→**0.128em** (values calibrated 2026-07-09), headings unchanged.
Atkinson confirmed suitable (designed by the Braille Institute for low
vision). Decided out of scope: a ZoomText-Blue-Dye-style "single hue"
mode (an anti-glare idea, not HC).

## 2026-07-10

### Changed (font selector — same font everywhere + compensation)

Decision: the selector forces **one font everywhere** (headings
included — that's what the user picking it expects); fine-grained
hierarchy remains dyslexia mode's job. Smoke test: the shrinking of
Atkinson/Sylexiad in the selector is fixed.

- **`a11y-font-class` mixin** (package's `a11y-fonts` module): emits a
  complete class — font everywhere + `font-size-adjust` (default
  **0.56**, pass `null` for a naturally large font) + body spacing
  aligned with dyslexia mode's (ls 0.04em, ws 0.128em, lh 1.75); headings
  unchanged (ls 0.02em, lh 1.5, parameterizable). One line per font for
  the consumer.
- The 5 classes regenerated by the mixin: Atkinson/Andika (package),
  Sylexiad ×2 (portfolio, adjust 0.56), **OpenDyslexic with no adjust**
  (naturally large, deliberate; headings ls 0.01em historical). Site
  OpenDyslexic overrides (header, nav) kept separately.
- CSS diff confined to the 5 `html.*-font` classes.

## 2026-07-09

### Changed (E5 phase 4 — deliberate rendering fix, validated)

The only E5 phase **outside the byte-identical oracle**: rendering
changes, calibrated via an interactive slider preview (control Inter /
Sylexiad body / Andika body) — values picked by eye on 2026-07-09.

- **Package's `dyslexia` module** (`scss/modules/_dyslexia.scss`):
  `dyslexia-typography` mixin, configurable across 3 levels — title
  (Lexend Giga), subtitles (Lexend Deca), body (**Andika** by default;
  the portfolio overrides with `$body-font: "SylexiadSans"`). Body:
  **`font-size-adjust: 0.56`** (normalizes x-height → ends paragraph
  shrinking, and targets slightly above Inter ≈ 0.545 so it's never
  smaller than the host site), `line-height: 1.75`, `letter-spacing:
  0.04em`, `word-spacing: 0.128em` (×3.2, BDA/WCAG 1.4.12 ratio). The
  optional `$body-size-scale` enlargement exists but is set to **1**
  (disabled): normalization is enough, decision made. Site-specific
  overrides (header, navigation) stay on the portfolio side.
- **Site in normal mode**: `p { line-height }` 1.6 → **1.5** (decision —
  the font classes' 1.5 and headings' 1.3 unchanged).
- **High-contrast (body)**: `line-height` 1.5 → **1.75** and added
  `word-spacing: 0.064em` (same ratios as dyslexia mode). Headings
  unchanged (1.5); the rest of the HC typography optimization stays in
  the TODO.

Before/after of dyslexia mode's body:

| Property (body)  | Before  | After       |
| ------------------ | ------ | ----------- |
| `font-size-adjust` | —      | **0.56**    |
| `line-height`      | 1.6    | **1.75**    |
| `letter-spacing`   | 0.02em | **0.04em**  |
| `word-spacing`     | —      | **0.128em** |
| enlargement     | —      | 1 (off)     |

### Added (versioned visual preview)

- `docs/theme-system/previews/`: interactive comparator
  `preview-dyslexia.html` (fonts embedded as data-URIs, opens via
  `file://`) + generator `generate-preview-dyslexia.py` + README. Outside
  `public/` → never served in production (Sylexiad, proprietary EULA).

## 2026-07-08

### Docs (E5 plan revised — font decisions + configurable dyslexia mode)

After an in-depth code review (fonts, sizes, spacing), the E5 plan is
revised:

- **Fonts decided**: bundled = OpenDyslexic, Andika, Atkinson, Lexend
  Giga/Deca (OFL); **excluded** = Sylexiad (proprietary),
  **Tiresias** (GPLv3 + absent from the active selector + a signage
  font, not for web reading), **Raleway Dots** (absent from the active
  selector). Default dyslexia-mode body = **Andika**; the portfolio
  overrides with Sylexiad; a "download from sylexiad.com" note for
  consumers.
- **Sizing bugs found and folded into the plan**: dyslexia mode
  **shrinks** paragraphs (a substitute font with a small x-height,
  compensation commented out/lost); the individual selector has the same
  defect. Fix: **`font-size-adjust`** (x-height normalization) + a ~+10%
  body increase + dyslexia spacing (line-height ~1.7, letter-spacing
  ~0.05em, word-spacing ~0.16em, BDA). **Dyslexia mode becomes a
  configurable 3-level module** (title/subtitle/body).
- **Consequence on the oracles**: phases 1-3 = byte-identical relocation;
  **phase 4 = deliberate rendering fix** (dyslexia mode + fonts), so
  **outside the byte-identical oracle, visual validation required**.
- **High-contrast**: verified byte-identical to the `918526f` reference
  (changes the font → Atkinson + letter-spacing, never increased size;
  the chantiers didn't break it). Typography optimization (size,
  spacing, `font-size-adjust`) **noted in the TODO** for after E5.

### Docs (E4 merged; font license audit + E5 plan written)

- **E4 merged into `main`** (`19df328`) after a smoke test.
- **Accessibility font license audit** (blocking before publication,
  until now pending in the TODO) done:
  - **SIL OFL, bundlable**: OpenDyslexic, Andika, Raleway Dots,
    **Atkinson Hyperlegible Next** (confirmed Braille Institute 2025).
  - **Sylexiad Sans/Serif: proprietary EULA (Feb. 2022)** — no public
    redistribution, webfonts required to be "not publicly downloadable"
    → **excluded from the package** (stays with the portfolio via the
    font selector's extension point). A separate question noted (the
    woff2 files served by the site are technically downloadable — out of
    scope for this chantier).
  - **Tiresias Infofont: GPL v3 + an embedding exception (RNIB 2007)** —
    redistributable, but GPL inside an MIT package = **a call to make**
    (include with its license attached, or exclude).
- **[PLAN-extraction-modules.md](./PLAN-extraction-modules.md) created**
  (E5 chantier, 4 phases, branch `feat/e5-modules`): redistributable
  fonts + `LICENSES/` in the package, opt-in SCSS modules
  (`_a11y-fonts.scss`, `_motion.scss`), SSR-safe DOM appliers +
  generic `usePreference` (deferred from E4). The zustand stores
  (`fontSizeStore`, `dyslexicFontStore`) and the motion toggle stay in
  the portfolio and only delegate DOM application — localStorage
  keys/formats unchanged (zero user migration). Oracles: CSS identical
  modulo pragmas, identical behavior, a font-file drift-guard test. Out
  of scope: migrating `useTheme`/the stores, the UI (E6), dist/
  publication (E7).

## 2026-07-07

### Changed (E4 chantier executed — React runtime into the package)

Branch `feat/e4-runtime` (4 commits — **smoke test + review before
merge**). Executed by Claude with sign-off. **No behavior or rendering
change** expected.

- **Phase 1**: package `./react` entry point (TS source, React as a
  peerDependency), Next `transpilePackages`, Jest `moduleNameMapper` —
  resolution proven via a probe across all three channels (Jest, tsc,
  build).
- **Phase 2**: `THEMES`/`ThemeOption`, `useTheme` (`themes` parameter,
  default = the 12), `usePrefersDarkMode` moved into
  `packages/a11y-prefs/react`; `src/config/themes.ts` and the portfolio's
  two hooks become re-export shims (the ~8 importers unchanged).
  **Unexpected issue caught by the Next build and fixed**:
  the Server/Client Components boundary — the barrel was pulling the
  client hook into `layout.tsx` (server) through the shim; resolved with
  `"use client"` on `useTheme` (it didn't carry it and depended on its
  importers), granular `./react/*` exports, a `themes` shim pointing to
  the pure data module.
- **Phase 3**: `themeInitScript(themes = THEMES)` in the package;
  `layout.tsx` consumes the generated string. The generator was produced
  **programmatically from the historical literal**; oracle verified: the
  string is **byte-identical** (648 bytes) to the phase 0 baseline,
  script present in the build's RSC output.
- Global oracles: strictly byte-identical CSS, 589 tests, tsc, lint,
  Next build green at every phase.

### Docs (E3 merged; E4 plan written — extracting the React runtime)

- **E3 merged into `main`** (`812d5d5`) after validation
  (`pnpm dev` works, no visual impact).
- **[PLAN-extraction-runtime.md](./PLAN-extraction-runtime.md) created**
  (E4 chantier, 4 phases, branch `feat/e4-runtime`). Scope:
  `THEMES`/`ThemeOption`, `useTheme`, `usePrefersDarkMode`, and the
  anti-FOUC script (generated by `themeInitScript()`) move into
  `packages/a11y-prefs/react`; the portfolio files become re-exports
  (zero churn for the ~8 importers). Oracles: strictly byte-identical
  CSS, byte-identical anti-FOUC string, unchanged behavior. Tooling:
  `exports ./react` + React peerDependency, `transpilePackages`, Jest
  `moduleNameMapper`. The guide's `usePreference(key, applyFn)`
  generalization is explicitly deferred to E5 (documented staging). Out
  of scope: the UI (E6), modules (E5), dist/publication (E7).

### Changed (E3 chantier executed — pnpm workspace + SCSS extraction)

Branch `feat/e3-monorepo` (6 commits, one per phase — **review before
merge**). Executed by Claude with sign-off. **Zero visual change**: CSS
identical to the baseline, modulo one measured and documented deviation
(see below).

- **Phase 1**: `pnpm-workspace.yaml` + `packages/a11y-prefs/` (working
  name, private, linked via `"a11y-prefs": "workspace:*"`). Resolution
  of `@use "a11y-prefs/scss/…"` proven via a probe across all three
  channels (CLI `--load-path`, Next `sassOptions.includePaths`,
  extract-themes `loadPaths`) **before** any relocation.
- **Phase 2 — dependency inversion**: the 9
  `transform-light-to-*` engines and anti-glare now stop at
  `apply-roles()`; each of the 11 theme files calls
  `apply-theme-variables` itself after its transform (execution order
  unchanged → byte-identical). Purged a dead write found along the way:
  the anti-glare "per-mode adjustments" block was assigning
  `$color-collapse-border`, a token removed in the 2026-07-07 cleanup.
- **Phase 3**: `git mv` of `_base-palette`, `_theme-utils`,
  `_anti-glare-functions` into `packages/a11y-prefs/scss/`; a public
  `_index.scss`; 16 consumers rewired.
- **Phase 4 — splitting state**: `packages/a11y-prefs/scss/_state.scss`
  holds layers 1+2 (rail, aliases, primitives, roles,
  `define-base-colors`, `apply-roles`); the portfolio's
  `_theme-variables.scss` keeps only its ~70 layer-3 tokens +
  `apply-theme-variables`. No more package `@use` pointing into `src/`.
  Purged the achromatopsia engine's 4 dead layer-3 writes
  (`$color-link`, `$color-focus-*` — overwritten by
  apply-theme-variables ever since the foundations).
- **Phase 5 — configuration**: `$gray-family` + `$primitives` map as
  `!default` in the package; `main.scss` carries the portfolio's
  `with()` (the state module's first load). Verified live: an
  alternative config (`slate`) does produce a slate rail.
- **Measured deviation from the byte-identical oracle**: the prettier
  `/** @format */` pragmas placed before a module's `@use`s get
  re-emitted **once per importer** (a rule established empirically via
  probe markers); reorganizing the imports changes their count (80 → 68,
  less spam). Normalized diff (pragmas excluded): **byte-identical** at
  every phase. Zero value or rule change.
- 589 tests, lint, tsc, Next build, and `contrast:report` green at every
  phase.

### Docs (E3 plan written — monorepo extraction)

- **[PLAN-extraction-monorepo.md](./PLAN-extraction-monorepo.md)
  created** (sign-off to kick off the E3→E7 extraction). 6 phases,
  branch `feat/e3-monorepo`, **end-to-end byte-identical CSS oracle** (a
  move, not a redesign). Structuring points: a pnpm workspace + the
  `packages/a11y-prefs` package (working name, final decision in E7);
  a Sass resolution probe before any relocation (Next `includePaths` +
  extract-themes `loadPaths` + CLI); **phase 2 = dependency inversion**
  (engines stop at `apply-roles()`, layer 3 is derived by the consumer's
  theme files); state split (rail/primitives/roles → package, ~70
  layer-3 tokens → portfolio); minimal `with()` configuration
  (`$gray-family` + primitives), the full registry deferred. Out of
  scope: the React runtime (E4), modules (E5), the CLI (E6), publication
  (E7), the contrast suite (stays on the portfolio side).

### Changed (`--success` → emerald-700, contact success toast wired)

Decision ("emerald-700") in response to the open question from the
cleanup: the contact form's success toast should have been green.

- **`--success` role: emerald-600 → emerald-700** (`#047857`, 5.25:1 on
  `bg-base` in light — emerald-600 had been below the text threshold
  from the start, 3.61:1). Per-theme effects: light/tritan 5.25,
  anti-glare-light 4.56, dark 9.75 (shifted pale green), red-green CVD
  anchors unchanged (resolved independently), achromatopsia unchanged
  (same quantized gray, 2.42 — the waiver's only remaining entry),
  high-contrast unchanged.
- **Contact `[data-type="success"]` toast: `color: var(--success)`** —
  the role's first consumer, guaranteed by the `role/success-on-bg-base`
  pair across the 12 themes. **Visual change**: the form's success
  message is now displayed in green (instead of the inherited text
  color).
- The `role/success-on-bg-base` waiver reduced to achromatopsia alone
  (anti-zombie: 4 entries lifted). 589 tests, build/lint/tsc green,
  report regenerated.

### Removed (dead-token + phantom-variable cleanup — audit follow-up)

Branch `chore/theme-token-cleanup`, under an "everything except E3"
mandate. **Rendering strictly unchanged**: only inert declarations and
never-consumed tokens. Verified: CSS diff = 79 removals + 3 equivalent
rewrites (fallbacks), an emitted/consumed re-scan at zero on both sides,
589 tests (the removed hero pair = −12), build/lint/tsc green.

- **5 phantom declarations removed** (they referenced custom properties
  that were never emitted → already had no effect, the inherited color
  applied): `_privacy-policy.scss` (`--color-bg-light`),
  `_accessibility-menu.scss` (`--color-button-bg`, `--color-button-text`,
  `--color-text`), `_contact.scss` (`--color-success` — see the "green
  toast" question in [TODO.md](./TODO.md)), `_skills.scss`
  (`--color-text-secondary`). 3 fallbacks simplified to their effective
  value (`--color-divider`→`--gray-400`, `--color-input-bg`→
  `--off-white`, `--color-text-secondary`→`--gray-700`).
- **5 emitted-but-never-consumed tokens removed** (definitions,
  assignments, emissions): `--color-hero-bg`, `--color-hero-text` (+
  their `site/hero-text-on-hero-bg` registry pair — removed because the
  tokens no longer exist, not to mask a failure; the hero now renders on
  `--color-main-bg`), `--color-collapse-border`,
  `--color-section-even-card-bg`, `--constant-success-color` (to recreate
  if the success toast turns green again).

### Docs (full review after merges + emitted/consumed audit)

- **General review** requested (docs + code) after the role-corrections
  merge (`a97d699`). Code verdict: sound (engines, runtime, suites).
  Stale statuses fixed in the docs:
  - README document map (CVD parts 2/3: merged `5c8dce9`, no longer
    "validation required"); likewise the color-blind plan's headers and
    the guide's § E2 mentions;
  - README § 2: the 12 themes' generation methods updated (status
    anchors, tritan remap, OKLCH anti-glare — the descriptions predated
    the redesigns);
  - README § 3: the `_anti-glare-functions.scss` line (OKLCH, overlay
    removed); the map: CONTRAST-REPORT = 39 WCAG pairs + 5 ΔE;
  - README § 7 "Perceptual quality": 3 ideas marked done (contrast tests
    = E1, exposing `--success`/`--danger`, OKLCH) — `prefers-contrast`/
    `forced-colors` remain.
- **Emitted/consumed audit** (new, a scan of the compiled CSS vs.
  `var()` usage in the code): 5 phantom variables consumed but never
  emitted (color inherited — predating the `918526f` reference) and 5
  emitted-but-never-consumed tokens. Logged in [TODO.md](./TODO.md) (a
  micro-chantier + a decision to make), no code change in this entry.

### Fixed (blog link — restoring the original design)

After two insufficient fixes (rewiring `fg-on-emphasis` = a white link in
light, rejected as "extremely ugly"; then amber-in-light only, still
wrong in dark), the actual intent was clarified and **verified by
compiling the pre-chantiers version** (`4bf78f0`):

- **Important discovery**: the near-white blog-link chip in dark is a
  **defect predating every 2026-07 chantier** — the pre-foundations
  version already compiled `--color-header-blog-link-bg: #fafaf9` in
  dark (the light→dark automation was inverting the chip's gray), the
  `_dark.scss` patch only blackened the text, and this broken rendering
  had shipped to production. The intended design: a **grayed chip +
  amber text in both modes**, as in light.
- **Fix**: `--color-header-blog-link-bg` by luminance —
  the theme's `bg-emphasis` if it's dark (light, color-blind,
  achromatopsia: unchanged), otherwise a constant `stone-700` (dark
  themes: the same gray tone as light); `--color-header-blog-link-text:
  $accent` (amber everywhere, varying per theme: orange-300 in
  tritanopia, etc.). Hover: `--off-white` →
  `--constant-off-white` in `_header.scss` (the rail's inversion would
  have made the hover gray-on-gray in dark). The LostInTab logo gets its
  grayed background back. High-contrast intact (its own overrides).
- **Result**: light and dark identical (`#44403c` + `#fcd34d`, 7.12:1),
  a green pair across the 12 themes (6.09–19.56) with no waiver, no
  patch left. 601 tests, build/lint/tsc green.
- **Subtitle**: kept as a muted gray (validated — consistent with
  light's muted look).
- Lessons: (1) visual decisions must be presented as concrete before/
  after renderings per theme, never in terms of wiring; (2) "the current
  rendering" isn't a reliable reference — the reference design is the
  intended one, to confirm when in doubt (here the deployed rendering
  was itself already broken).

### Changed ("role corrections" chantier — part 2/2, decisions)

Same branch `refactor/theme-role-corrections` (2nd commit). The two
visual decisions were settled: subtitle "muted gray", blog link "follows
its chip".

- **Header subtitle** (`--color-header-text-role`): anchored to a
  **fixed** muted gray chosen by luminance (same logic as
  `fg-on-accent`: dark accent → the theme's `$fg-muted`; light accent →
  the theme's `gray-700` if it's dark, otherwise a constant `stone-700`).
  **Visual change: dark/anti-glare-dark only**, the subtitle goes from
  near-black (a patch) to `stone-700` (muted gray, 7.12:1 on the
  accent). Light, color-blind, achromatopsia (keeps its `neutral-700`),
  high-contrast (its own overrides in `_high-contrast.scss`): unchanged.
- **Blog link** (`--color-header-blog-link-text`): rewired from `$accent`
  to **`$fg-on-emphasis`** — the text follows its chip (`bg-emphasis`),
  and the `fg-on-emphasis`/`bg-emphasis` pair is already guaranteed by
  the suite across the 12 themes. **Visual change: in light and light
  themes**, the link goes from amber to near-white on the dark chip; **in
  dark**, near-black → `#44403c` on the light chip (9.84:1), nearly
  identical to the old patch.
- **Every `.header` patch in `_dark.scss` removed** — the header is
  correct by construction across the 12 themes.
- **The last 2 header waivers lifted** (anti-zombie:
  `site/header-text-role-on-header-bg` 1.38 → 7.12,
  `site/header-blog-link-text-on-bg` 1.38 → 9.84). With part 1/2, the
  chantier removes a total of **4 waivers + the dead-token's pair**; the
  pairs stay in the registry, now compliant with no exception.

### Fixed / Removed ("role corrections" chantier — part 1/2)

Branch `refactor/theme-role-corrections` (not merged — visual validation
required, but **zero visual change** expected). Two of the three
micro-chantier symptoms addressed; two decisions remain (see
[TODO.md](./TODO.md)).

- **Removed — dead token `--color-button-active-outline`**: emitted but
  consumed by no component (`var(--color-button-active-outline)` not
  found anywhere). Removed from the 3 SCSS spots + its emission + its
  `site/button-active-outline-on-panel-bg` contrast pair (which was the
  worst waiver, 1.00:1 in high-contrast). Removed because the token no
  longer exists, not to mask a failure.
- **Fixed — light-on-light header title in dark**: `--fg-on-accent`
  followed the rail (`$gray-950`), which inverts in dark → near-white
  text on the fixed amber accent (~1.15:1), masked by hardcoded
  `.header` patches in `_dark.scss`. Now chosen **by luminance**:
  dark accent (high-contrast) → light ink; light accent → the theme's
  `gray-950` if it's dark (light/color-blind/achromatopsia: unchanged),
  otherwise (dark themes) a constant near-black. `is-dark()` moved into
  `_base-palette.scss` to be reachable from `apply-roles`.
  The `name`/`separator` patches removed; the `role/fg-on-accent-on-accent`
  and `site/header-text-on-header-bg` waivers became obsolete (13.70:1
  in dark) → removed by the anti-zombie check. CSS diff = the dead
  token (12 themes) + `--color-header-text` in dark/anti-glare-dark
  going from near-white to `#0c0a09` (identical to the masked rendering
  → **invisible**). 601 tests, build/lint/tsc green.
- **Remaining (visual decisions)**: the header **subtitle**
  (`--color-header-text-role = fg-muted`, muted gray in light) and the
  **blog link** (`--color-header-blog-link-text = accent` amber) — still
  waived, patches kept. Cf. TODO.md.

## 2026-07-06

### Changed (E2 chantier — color-blind redesign, part 3 executed)

Color-blind engine robustness, branch `refactor/theme-cvd-degradation`
(5 commits, not merged — **visual validation required before
merge**, `tritanomaly` theme). Executed by Claude (Opus).

- **Phase 1 — anti-gamut guard** (`gamut.test.ts`, `gamut.ts`, additive):
  scans every color custom property of the 12 themes (+ `:root`) in the
  compiled CSS and fails if a value falls outside the sRGB gamut (hsl s/l
  outside [0,100], an rgb channel outside [0,255]). Detection on the
  **raw string**: culori clamps these values at parse time, so its
  `inGamut` can't see them. First run = inventory: **11 out-of-gamut
  declarations** in `tritanomaly` (3 root primitives + 8 derived
  tokens), waived (anti-zombie). Byte-identical CSS.
- **Phase 2 — graceful degradation** (`_theme-utils.scss`):
  `resolve-anchor-weight` no longer does an `@error` (hard build
  failure) if no weight reaches the target — it returns the
  highest-contrast step ("best effort") and `@warn`s (a distinct message
  below the legibility floor `$status-legibility-floor`, default 3:1).
  Configurable contrast target (default 4.5). A latent path for the
  portfolio → byte-identical CSS; unit-tested via compiled Sass probes
  (nominal + no hard failure). **Deliberate deviation**: no "color
  computed outside the palette" path — measured as nearly useless
  (contrast is dominated by lightness, the palette already covers
  50→950; if no step passes, the background has mid-range lightness, a
  case where no hue passes either). The real reason to step outside the
  palette (distinguishability) not being computable in Sass, its escape
  hatch remains `special-colors`.
- **Phase 3 — fixing the tritan gamut issue** (`_theme-utils.scss`):
  a `gamut-map-srgb` helper (Dart Sass 1.101's built-in
  `color.to-gamut(..., $method: local-minde)` — standard CSS Color 4
  chroma reduction, hue preserved) applied to the output of the
  `severity` blend and, defensively, to the OKLCH fallback. Short-circuits
  if already in-gamut → **no spurious re-serialization** (other themes'
  valid colors stay identical). The 11 `tritanomaly` values come back
  in-gamut; phase 1's waivers removed (anti-zombie). **Negligible
  perceptual gap**: ΔE 0.15 / 0.92 / 0.41 between the previously clamped
  rendering and the gamut-mapped one. CSS diff confined to
  `[data-theme="tritanomaly"]` (11 properties).
- **Phases 4-5 — verification, docs, wrap-up**: anti-gamut guard at zero
  waivers across the 12 themes; contrast/distinguishability suites
  unchanged; `CONTRAST-REPORT.md` regenerated (slight adjustment of the
  accent-related ratios in `tritanomaly`, ΔE < 1); per-class palette
  policy documented (README § 6.1, guide § E2). Build/lint/test/tsc
  green.

**Point remaining**: visual validation of `tritanomaly` (the color
shift is imperceptible, ΔE < 1 — the browser was already showing the
clamped version); a call on the legibility floor (3:1).

### Docs (design decision — semantic anchors for status roles)

- **Decision made** following the `role/success-on-bg-base` issue
  (1.60:1 in deuter/protanopia, surfaced by the color-blind redesign):
  the **status** roles — `--success` and
  `--danger`, plus `--warning` and `--info` reserved for future API
  extension — form a class of their own in the color-blind engine.
  Since their semantics are near-universal from one project to another,
  the package will embed **hue anchors per CVD type**
  (red-green: success → blue, danger → orange; tritanopia:
  red/green kept), resolved within the project's palette with an
  **auto-computed weight** via the WCAG contrast constraint — the two
  constraints (distinguishability/contrast) are thereby decoupled, where
  the tables' fixed weight shift used to make them clash. The
  distinguishability suite's ΔE thresholds will become **per pair
  class** (`success`/`danger` critical, `link`/status reduced — WCAG
  1.4.1 already covering links via underlining); values to be decided at
  plan time.
- Detailed design:
  [GUIDE-package-extraction.md](./GUIDE-package-extraction.md) § E2;
  summarized in README § 6.1. No code or CSS change —
  a dedicated execution plan to follow.
- Statuses updated in the README (document map) and the guide:
  E2 chantier (engines + color-blind redesign) merged into `main` on
  2026-07-05 (`d12264f`) after visual validation and
  independent review.
- **Execution plan written**:
  [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md)
  restructured into two parts — part 1 (family remap, executed and
  merged) kept for reference; **part 2 "semantic anchors for
  status roles"** added (6 phases, branch
  `refactor/theme-status-anchors`). Starting points measured against
  main's compiled CSS + Machado simulation: `success → violet` (expected
  auto-weight violet-600, 5.46:1, ΔE success/link 18.0 — sky ruled out
  since it's taken by the link, sky-700 would only sit at ΔE 9.4);
  `danger → orange` (expected auto-weight orange-700, 4.96:1). Proposed
  per-pair-class ΔE thresholds (20 critical / 12 link pairs, to decide
  in phase 1); the anomalies' weight resolved on the `severity` blend
  (a lesson from the 2.33 waivers). Tritan themes explicitly unchanged.

### Changed (E2 chantier — color-blind redesign, part 2 executed)

Semantic anchors for status roles implemented on branch
`refactor/theme-status-anchors` (5 commits, not merged — **visual
validation required before merge**). Executed by Claude (Opus),
not the usual execution AI, at Simon's request.

- **Phase 1 — per-pair-class ΔE thresholds** (`contrast-pairs.ts`): the
  two "link" pairs (`link-vs-success`, `link-vs-fg-base`) move to
  ΔE ≥ 12; the critical pairs (`success/danger`, `accent/status`)
  stay at 20. WCAG 2.2 SC 1.4.1 justification: a link is never carried
  by color alone (underlined here). The achromatopsia waiver of
  `link-vs-fg-base` (16.00) becomes moot under 12 and is removed. CSS
  byte-identical.
- **Phase 2 — engine** (`_theme-utils.scss`): added the Sass WCAG
  functions (`wcag-relative-luminance`, `wcag-contrast-ratio`, aligned
  with culori: threshold 0.04045, gamma 2.4) and `resolve-status-color` /
  `resolve-anchor-weight` (picks the first Tailwind step in the anchor
  family that reaches 4.5:1 against the background). The 6 CVD mixins
  route `success`/`danger` through this resolver. Byte-identical CSS (no
  config has an anchor yet).
- **Phase 3 — switching the 4 red-green themes**:
  - -opia (deuteranopia, protanopia): `success → violet-600` (5.46:1),
    `danger → orange-700` (4.96:1). `violet` and not `sky` since
    `--link` already occupies sky-900; violet reads as blue under
    red-green CVD.
  - -omaly (mild deficiency): natural hues kept, weight corrected
    only — `success → emerald-700` (5.25:1),
    `danger → redd-600` (4.62:1).
  - **Measured deviation from the plan**: the plan resolved the
    -omalies' weight on the *severity blend* (the anchor mixed 50% with
    the original). Measured, this OKLCH mix between two nearly
    complementary hues (emerald + violet) **falls outside the sRGB
    gamut** — Sass serialized it as
    `hsl(194, 257%, 19%)`, invalid and off-palette (violating the
    "stay within the palette" constraint). The resolver therefore
    returns a **pure** Tailwind color, with no blend; the -omalies'
    softness comes from the anchor choice (natural emerald/redd
    families) rather than a blend. Every emitted value is a clean,
    in-gamut Tailwind color.
  - CSS diff strictly confined to `--success`/`--danger` of the 4
    red-green blocks; tritan and achromatopsia **byte-identical**
    (verified).
- **Phase 4 — verification**:
  - **Contrast**: `role/success-on-bg-base` loses its 4 red-green
    entries (1.60/2.33 → 5.25–5.46, now compliant); the anti-zombie
    mechanism forced their removal. Still waived: light
    (3.61), anti-glare-light (3.13), tritan (3.61), and achromatopsia
    (2.42), all out of scope. `role/danger-on-bg-base`: every CVD theme
    compliant, only anti-glare-light stays waived (3.94).
  - **Sass/TypeScript consistency**: `wcag-contrast-ratio` (Sass) ratios
    compared against culori — exact match to 4+ decimals (violet-600
    5.4562, orange-700 4.9582, emerald-700 5.2507, redd-600 4.6240).
  - **Distinguishability — ΔE before (part 1) → after (part 2)** under
    Machado simulation:

    | Theme | success/danger | link/success | accent/success |
    | --- | --- | --- | --- |
    | deuteranopia | 53.2 → 62.7 | 49.0 → **18.2** | 50.5 → 74.9 |
    | deuteranomaly | 43.2 → 38.6 | 40.3 → 30.7 | 41.8 → 44.3 |
    | protanopia | 56.4 → 59.4 | 47.1 → **19.0** | 47.6 → 73.5 |
    | protanomaly | 45.7 → 41.3 | 42.1 → 32.3 | 38.2 → 41.0 |

    Every pair stays above its threshold (20 critical,
    12 link). The only one tightening noticeably is `link/success` under
    -opia (≈ 18-19): violet sits closer to the sky-900 link than
    sky-300 did in part 1 — an accepted cost, covered by the 12
    threshold (underlined links, WCAG 1.4.1). `CONTRAST-REPORT.md`
    regenerated.
- **Outcome**: the original defect (`--success` at 1.60:1) is resolved
  by design; status roles are now a class handled by semantic anchors,
  with a ≥ 4.5:1 contrast guarantee by construction.
  609 tests, lint, `tsc`, `build` green.

**Point remaining**: visual validation of the 4 red-green themes
(mainly `--success`'s violet shift under -opia) before merge.
`--success`/`--danger` being consumed by no portfolio component today,
the visual effect mainly shows through the accessibility panel and
future uses; the real benefit is for package consumers, who will wire
up these roles.

### Docs (part 3 of the color-blind plan written)

- [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md) gets a
  **part 3 "robustness"** (6 phases, branch
  `refactor/theme-cvd-degradation`, to execute), stemming from three
  findings from parts 1-2: (1) **warn rather than block** — replace
  `resolve-anchor-weight`'s `@error` with a best effort + `@warn`,
  prioritizing distinguishability above a legibility floor
  (default 3:1, a decision to make); (2) **per-class degradation
  ladder** — -omaly strictly in-palette, -opia allowed one in-gamut
  off-palette color as a fallback (never outside the gamut); (3)
  **mechanical anti-gamut guard** (a test scanning the compiled CSS) +
  **fixing the tritan gamut issue** — measured today: part 1's
  `severity` `amber → orange` blend produces **11 out-of-gamut
  declarations** in `tritanomaly`
  (`--accent` `hsl(38, 100.8%, 69%)` etc.), to bring back in-gamut via
  OKLCH chroma reduction. A design detail written into the plan: the
  Sass engine only drives its degradation by **contrast**
  (computable); **distinguishability** stays verified by the
  TypeScript suite, the collision being fixed via `special-colors`.

## 2026-07-04

### Docs (E2 (color-blind redesign) chantier, phase 5 — wrap-up)

- Phase 5 (last) of
  [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md).
  `pnpm build`/`lint`/`test` (609 tests, 17 suites) green; cumulative
  CSS diff still confined to the 6 color-blind `[data-theme]` blocks.
- **Labeling fix**: the phase 1 to 4 entries of this chantier reference
  "chantier E3" — a mistake on my part, not in the plan.
  [GUIDE-package-extraction.md](./GUIDE-package-extraction.md) only has
  E1/E2/E3(monorepo)/E4-E7; the color-blind redesign is part of
  **E2** ("Anti-glare / color-blind engine review"), the same umbrella
  as [PLAN-engine-review.md](./PLAN-engine-review.md).
  Fixed everywhere (docs and source comments, including in the phase 1
  to 4 entries below) to "E2 (color-blind redesign) chantier" to lift
  the ambiguity with the other plan, also E2 — via a new commit that
  edits the text, without touching the commits already made (no Git
  history rewrite).
- Docs updated: README § 4.3 (both the color-blind and anti-glare
  engines rewritten, `remap-for-cvd()`'s 4-case description), § 5 point
  10 (the color-blind point is no longer implicit — mechanically
  tested), the "document map" (PLAN-colorblind-redesign.md marked
  executed), guide E2 (the redesign's detailed outcome,
  a summary of the key figures).
- **Final report for review**:
  - 5 commits on `refactor/theme-cvd-remap` (code in phases 1-3; phase 4
    and this phase 5 are pure documentation), CSS diff confined to the 6
    color-blind themes.
  - Waivers removed: `role/danger-on-bg-base` (6 → 1 remaining theme,
    only `anti-glare-light` — unrelated to the CVD remap);
    `distinguish/success-vs-danger` (removed entirely).
  - A downgraded waiver, an explicit point to decide:
    `role/success-on-bg-base` regresses in WCAG contrast across 4
    red-green themes (as low as
    1.60:1, vs. 3.13-4.03:1 before) — the `emerald → sky` remap's
    calibration prioritized CVD distinguishability
    (`distinguish/link-vs-success`, which would otherwise have dropped
    to ΔE 4.6) at the expense of this role's already-non-compliant
    contrast. No real user impact today (`--success` unused);
    possible decisions: accept the trade-off as-is,
    introduce a distinct `success-strong` role for future text use,
    or recalibrate a third time with an intermediate weight.
  - A Sass bug documented and fixed (unquoted map keys `orange`/
    `violet` interpreted as colors) — a caution to keep in mind for
    any future family named after a recognized CSS color.
  - Automated visual validation done (headless Chromium screenshots of
    the 6 themes + the accessibility panel); **human visual validation
    required before any merge**, particularly on the header's shift to
    orange in tritanopia/tritanomaly and the links' shift to violet in
    the same themes.

### Docs (E2 (color-blind redesign) chantier, phase 4 — verification and decisions)

- Phase 4 of [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md).
  The plan's first two points (the contrast suite back to green,
  obsolete waivers removed) had to be handled **as early as phase 3** to
  keep `pnpm test` green at every commit (chantier discipline); what's
  left specific to phase 4:
- **Before/after ΔE table** (before = the phase 1 inventory, before any
  switch; after = measured once the 6 themes are wired onto
  `remap-for-cvd`, phase 3 complete):

  | Pair | Theme | Before | After |
  | --- | --- | --- | --- |
  | success/danger | deuteranomaly | 40.01 | 43.17 |
  | success/danger | deuteranopia | 74.28 | 53.18 |
  | success/danger | protanomaly | 41.55 | 45.68 |
  | success/danger | protanopia | 66.05 | 56.41 |
  | success/danger | tritanomaly | 69.10 | 69.10 |
  | success/danger | **tritanopia** | **6.81 ⚠** | **69.66 ✓** |
  | success/danger | achromatopsia | 50.27 | 50.27 |
  | accent/danger | deuteranomaly | 35.84 | 34.61 |
  | accent/danger | deuteranopia | 44.87 | 29.55 |
  | accent/danger | protanomaly | 43.73 | 41.02 |
  | accent/danger | protanopia | 38.39 | 36.36 |
  | accent/danger | tritanomaly | 56.95 | 35.13 |
  | accent/danger | tritanopia | 43.48 | 30.35 |
  | accent/danger | achromatopsia | 83.08 | 83.08 |
  | accent/success | deuteranomaly | 39.85 | 41.85 |
  | accent/success | deuteranopia | 36.18 | 50.53 |
  | accent/success | protanomaly | 37.07 | 38.15 |
  | accent/success | protanopia | 30.49 | 47.59 |
  | accent/success | tritanomaly | 41.77 | 49.67 |
  | accent/success | tritanopia | 39.88 | 59.15 |
  | accent/success | achromatopsia | 16.75 ⚠ | 16.75 ⚠ (unchanged) |
  | link/success | deuteranomaly | 38.38 | 40.28 |
  | link/success | deuteranopia | 22.48 | 49.02 |
  | link/success | protanomaly | 40.44 | 42.08 |
  | link/success | protanopia | 33.40 | 47.08 |
  | link/success | tritanomaly | 45.24 | 38.86 |
  | link/success | tritanopia | 35.90 | 36.86 |
  | link/success | achromatopsia | 38.95 | 38.95 |
  | link/fg-base | (7 CVD themes) | 15.9–29.3 | unchanged (pair unaffected by the remap) |

  Only the `success/danger` case in tritanopia changes status
  (failure → compliant, waiver removed). `accent/success` in
  achromatopsia remains the only remaining distinguishability waiver —
  the achromatopsia mechanism explicitly out of this chantier's scope.
- **Report regenerated**: [CONTRAST-REPORT.md](./CONTRAST-REPORT.md)
  already up to date since the phase 3 commit (no color changed since) —
  re-checked, `report.test.ts` still green.
- **Visual validation**: automated screenshots (headless Chromium) of
  the 6 color-blind themes on the home page, plus the accessibility
  panel open (deuteranomaly) to check buttons/titles/focus. Rendering
  sound everywhere, including tritanopia where the header visibly
  shifts to orange (`amber → orange`) — an expected change, not a
  regression. **Human visual validation required before merge**, as the
  plan requires, particularly on: the header's shift to orange in
  tritanopia/tritanomaly, the links' shift to violet in the same
  themes, and `--success`'s light teal/sky
  across the 4 red-green themes (`role/success-on-bg-base`, unconsumed
  today but visible if a future component uses it).
- **Explicit decision point** (already flagged in phase 3, repeated
  here): `role/success-on-bg-base` regresses in WCAG contrast
  across the 4 red-green themes (as low as 1.60:1) because the
  calibration prioritized CVD distinguishability
  (`distinguish/link-vs-success`) — with no real user impact today
  (`--success` unused), but a future decision (a new `success-strong`
  role? accept the trade-off?) remains open if this role is ever
  consumed.
- Verified: `pnpm build`/`lint`/`test` (609 tests, 17 suites) green,
  cumulative CSS diff still confined to the 6 color-blind themes.

### Changed (E2 (color-blind redesign) chantier, phase 3 — default tables and switching the 6 themes)

- Phase 3 of [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md):
  `_base-palette.scss` extended with two Tailwind families (`orange`,
  `violet`); the 6 `transform-light-to-{deuter,prot,trit}{anopia,anomaly}`
  mixins and the 6 theme files wired onto `remap-for-cvd`. Tables
  chosen:
  - deuteranopia/deuteranomaly/protanopia/protanomaly (red-green
    confusion): `emerald → sky (-3)`, `redd → amber (+1)`.
  - tritanopia/tritanomaly (blue-yellow confusion): `amber → orange (0)`,
    `sky → violet (0)`; emerald/redd unchanged (already safe on this axis).
  - anomalies: same tables as their -opia, `"severity": 0.5`.
  The hardcoded `special-colors` (`#0075ff`, `#ffcc00`, `#0090ff`,
  `#ffd700`, `#ff6600`, `#ff3399`) removed from the defaults everywhere;
  the 6 theme files simplified (no more local config, the mixins' new
  defaults are enough).
- **A Sass bug found and fixed during implementation**: the unquoted map
  keys `orange:`/`violet:` in `_base-palette.scss` are **recognized CSS
  colors** — Sass silently interprets them as `color` values rather
  than strings (a discreet `@warn`: "you
  probably don't mean to use the color value orange…"), which broke
  every string lookup (`analyze-tailwind-color`, `get-color`)
  with `$map: null is not a map`. Fixed by explicitly quoting
  (`"orange":`, `"violet":`) as `redd` already was (named that way
  to avoid the collision with the `red` keyword) — this same bug class
  was already lying in wait for `redd` had it been named `red`.
- **Measured calibration of the `emerald → sky` shift** (the plan calls
  these tables a starting point, not a truth): the proposed `0` shift
  drops `distinguish/link-vs-success` below the ΔE ≥ 20 threshold in
  deuteranomaly/protanomaly (as low as ΔE 4.6) — `--link` already
  occupies `sky-900`, and `--success`'s 0.5-severity blend toward
  `sky-600` ends up perceptually too close. Tried `emerald → violet`:
  worse (violet and sky are perceptually close, ΔE as low as 4.59).
  Tried `sky (-4)` (sky-200, very light): ΔE ≥ 38 everywhere but
  severely degrades `--success`'s already non-compliant WCAG contrast
  (as low as 1.27:1). Chosen: `sky (-3)` (sky-300), which satisfies
  ΔE ≥ 20 with a comfortable margin (≥ 40 on the affected themes)
  without digging into contrast more than necessary.
- **Contrast suite (E1) and distinguishability suite (E2/color-blind
  redesign phase 1) re-run after switching — the plan's expected
  success**:
  - `role/danger-on-bg-base`: goes from 6 waived themes to **1 only**
    (`anti-glare-light`, unrelated to the CVD remap) — the 6 color-blind
    themes now pass ≥ 4.5:1 (the historical worst case, `#ffcc00` at
    1.34:1 in protanopia, resolved by `redd → amber`).
  - `distinguish/success-vs-danger`: waiver **removed entirely** — the
    only failure (tritanopia, ΔE 6.81, due to the old special-colors
    `#ff6600`/`#ff3399` never checked for their distinguishability) is
    resolved simply by removing those special-colors from the defaults
    (emerald/redd stay unchanged in tritanopia, ΔE 69.66).
  - `role/success-on-bg-base` **regresses** in deuteranomaly/
    deuteranopia/protanomaly/protanopia (ratios 2.33/1.60/2.33/1.60,
    vs. 3.61/4.03/3.61/3.13 before): the `sky (-3)` calibration
    prioritizes CVD distinguishability (see above) at the expense of
    this role's already non-compliant WCAG contrast. `--success` remains
    unconsumed by any component to this day (verified via grep) — zero
    real user impact, but a point to explicitly flag
    (see the phase 4/5 report).
  - Full raw output (before/after per theme, contrast and ΔE) in the
    phase report attached to this entry; `CONTRAST-REPORT.md`
    regenerated.
- **CSS diff**: strictly confined to the 6 color-blind `[data-theme]`
  blocks (`deuteranomaly`, `deuteranopia`, `protanomaly`,
  `protanopia`, `tritanomaly`, `tritanopia`) — verified across the whole
  compiled CSS, nothing else moved.
- **Dead-path purge, done at the end of phase 3** (the plan schedules it
  "at the end of phase 4," but its only condition — "once nothing
  references them anymore" — was already met here, and phase 3 itself
  asks for it again in item 4): `adapt-color-for-colorblindness`,
  `adapt-color-for-color-anomaly` and their `brightness`/
  `is-similar-to` helpers removed from `_theme-utils.scss`, confirmed
  with no remaining caller via grep before removal. Compiled CSS
  strictly identical before/after this purge (pure dead-code removal).
- Verified: `pnpm build`/`lint`/`test` (609 tests, 17 suites) green.

### Added (E2 (color-blind redesign) chantier, phase 2 — remap engine)

- Phase 2 of [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md):
  `remap-for-cvd($color, $var-name, $config, $cvd-type)` added to
  `_theme-utils.scss`, a 4-case resolution (the plan distinguishes 3,
  the 4th — "recognized family but absent from the table" — had to be
  made explicit, see the deviation below):
  1. An explicit `special-colors` for the variable → takes priority over
     everything (mechanism kept as-is).
  2. A color recognized as a Tailwind swatch **and** its family present
     in `family-remap` → substitution toward the target family, at the
     shifted weight (an **index** shift within `$tailwind-weights`,
     clamped to [50, 950], `@warn` if clamping applies).
  3. A recognized color whose family is absent from `family-remap` →
     left **unchanged** (already deemed safe for this CVD type — which
     is why, for example, `amber`/`sky` will have no entry in the
     proto/deuteranopia tables of phase 3).
  4. A color outside the Tailwind palette (custom, a future package
     consumer): fallback via OKLCH hue rotation toward a fixed anchor
     for the CVD type, at constant luminance/chroma — a calibration
     point not perceptually validated.
  A `severity` blend (0.5 for anomalies) applied to the output via
  `color.mix(…, $method: oklch)`, whichever case is resolved.
  Verified via an isolated (uncommitted) Sass script: special-colors
  priority, correct remap + weight shift, clamping with
  `@warn`, an unlisted family left untouched, OKLCH rotation with
  L/C preserved (verified: identical to the original color), the
  severity blend strictly between the original and the full remap.
- **Documented deviation: wiring into the 6
  `auto-{deuter,prot,trit}{anopia,anomaly}-transform` mixins is deferred
  to phase 3**, while the plan asked for it as early as phase 2.
  Measured reason: phase 2's oracle ("byte-identical CSS, the engine
  exists but no theme uses it yet") is incompatible with wiring it in
  for real right now. The 6 current theme files define no
  `family-remap` key; under the resolution above, a recognized but
  unlisted family (case 3) must be **left unchanged** — but that's
  already the *correct* final behavior, yet it differs from the *current*
  behavior of the old HSL engine
  (`adapt-color-for-colorblindness`), which does shift `--accent`'s hue
  (amber, hue ≈45°, falls inside its 30–150° green window) in
  proto/deuteranopia. Nothing lets the new engine be wired in without
  changing the CSS before the real tables exist (phase 3) — wiring the
  mixins and setting the tables are therefore done together
  in phase 3, which expects a CSS diff confined to the color-blind
  themes anyway.
- The plan's "3. Otherwise (color outside the palette) → OKLCH fallback"
  item was written as a terminal `else` after the `family-remap` check,
  which would have routed `--accent`/`--link` (recognized but unlisted
  families) through the OKLCH fallback instead of leaving them
  untouched — inconsistent with the tables suggested in phase 3 (which
  don't list these families, precisely because they're already safe).
  Resolution chosen: an explicit case 3 ("recognized family, unlisted →
  unchanged") distinct from case 4 ("unrecognized family → OKLCH").
- Legacy paths (`adapt-color-for-colorblindness`,
  `adapt-color-for-color-anomaly`, `auto-*-transform`, `brightness`,
  `is-similar-to`) fully kept at this stage — still active,
  removal planned for the end of phase 4 only once grep confirms
  they're no longer referenced.
- Verified: `pnpm build`/`lint`/`test` (609 tests, 17 suites) green; the
  compiled CSS strictly identical to the phase 0 baseline.

### Added (E2 (color-blind redesign) chantier, phase 1 — distinguishability tests)

- Phase 1 of [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md)
  (branch `refactor/theme-cvd-remap`, an additive chantier — no
  `src/styles/` file modified, byte-identical compiled CSS).
  - `src/accessibility/contrast/cvd-simulation.ts`: simulates perception
    under color vision deficiency. Dichromacies
    (protanopia/deuteranopia/tritanopia) and anomalies (severity 0.5)
    via the Machado, Oliveira & Fernandes (2009) matrices, applied in
    **linear** RGB (`culori.convertRgbToLrgb`/
    `convertLrgbToRgb` conversion) — each matrix's rows sum to ≈ 1
    (a neutral gray stays a neutral gray, verified in a test).
    Achromatopsia handled separately (not a dichromacy): BT.601 luma on
    gamma RGB (the same weights as the existing
    `adapt-color-for-achromatopsia` in
    `_theme-utils.scss`), to stay consistent with the mechanism already
    in place rather than a different theoretical monochromacy model.
  - **Dependency choice**: the `color-blind` npm package mentioned by
    the plan was ruled out after checking (`license: undefined` on the
    npm registry — shown as "Proprietary," so risky for a project whose
    goal is extraction into an open-source package, § E7). Direct
    implementation of the published matrices instead, as the plan
    allowed as a fallback ("copy the matrices … citing the source").
  - `contrast-pairs.ts`: a new `DistinguishabilityPair` type (a separate
    `distinguishabilityPairs` registry, not merged into `ContrastPair` —
    the two notions only share `id`/`waiver`, no `level` or WCAG
    threshold on the distinguishability side) and the plan's 5 pairs
    (`success`/
    `danger`, `accent`/`danger`, `accent`/`success`, `link`/`success`,
    `link`/`fg-base`), each across the 7 CVD themes (6 color-blind +
    achromatopsia). Starting threshold ΔE ≥ 20 (a calibration point, cf.
    the plan).
  - `measure.ts`: `measureDeltaE(pair, theme)` — resolves both
    colors, simulates the deficiency, measures `culori.differenceCiede2000`
    between the two simulated colors.
  - `__tests__/cvd-simulation.test.ts`: gray invariant at severity 1
    (the 3 dichromacies), a no-op at severity 0, a monotonic blend
    between 0 and
    1, red/green collapse well stronger than the original gap in
    proto/deuteranopia (the best-known manual fact about red-green
    color blindness — used as a "published reference value" for lack of
    an exact RGB triplet verifiable without network access), achromatopsia
    = a strict gray matching the expected luma.
  - `__tests__/distinguishability.test.ts`: registry integrity + a
    pair × theme matrix, with the same anti-zombie mechanism as E1.
  - **First run = inventory** (before the redesign, raw output):

    ```
    distinguish/success-vs-danger   deuteranomaly   deltaE=40.0116  ok
    distinguish/success-vs-danger   deuteranopia    deltaE=74.2821  ok
    distinguish/success-vs-danger   protanomaly     deltaE=41.5478  ok
    distinguish/success-vs-danger   protanopia      deltaE=66.0516  ok
    distinguish/success-vs-danger   tritanomaly     deltaE=69.0999  ok
    distinguish/success-vs-danger   tritanopia      deltaE=6.8121   FAIL
    distinguish/success-vs-danger   achromatopsia   deltaE=50.2749  ok
    distinguish/accent-vs-danger    deuteranomaly   deltaE=35.8373  ok
    distinguish/accent-vs-danger    deuteranopia    deltaE=44.8679  ok
    distinguish/accent-vs-danger    protanomaly     deltaE=43.7267  ok
    distinguish/accent-vs-danger    protanopia      deltaE=38.3857  ok
    distinguish/accent-vs-danger    tritanomaly     deltaE=56.9452  ok
    distinguish/accent-vs-danger    tritanopia      deltaE=43.4750  ok
    distinguish/accent-vs-danger    achromatopsia   deltaE=83.0816  ok
    distinguish/accent-vs-success   deuteranomaly   deltaE=39.8462  ok
    distinguish/accent-vs-success   deuteranopia    deltaE=36.1816  ok
    distinguish/accent-vs-success   protanomaly     deltaE=37.0724  ok
    distinguish/accent-vs-success   protanopia      deltaE=30.4932  ok
    distinguish/accent-vs-success   tritanomaly     deltaE=41.7694  ok
    distinguish/accent-vs-success   tritanopia      deltaE=39.8797  ok
    distinguish/accent-vs-success   achromatopsia   deltaE=16.7522  FAIL
    distinguish/link-vs-success     deuteranomaly   deltaE=38.3770  ok
    distinguish/link-vs-success     deuteranopia    deltaE=22.4811  ok
    distinguish/link-vs-success     protanomaly     deltaE=40.4417  ok
    distinguish/link-vs-success     protanopia      deltaE=33.3957  ok
    distinguish/link-vs-success     tritanomaly     deltaE=45.2418  ok
    distinguish/link-vs-success     tritanopia      deltaE=35.8973  ok
    distinguish/link-vs-success     achromatopsia   deltaE=38.9493  ok
    distinguish/link-vs-fg-base     deuteranomaly   deltaE=24.5366  ok
    distinguish/link-vs-fg-base     deuteranopia    deltaE=24.8620  ok
    distinguish/link-vs-fg-base     protanomaly     deltaE=24.9146  ok
    distinguish/link-vs-fg-base     protanopia      deltaE=25.4625  ok
    distinguish/link-vs-fg-base     tritanomaly     deltaE=23.4640  ok
    distinguish/link-vs-fg-base     tritanopia      deltaE=29.2716  ok
    distinguish/link-vs-fg-base     achromatopsia   deltaE=15.9997  FAIL
    ```

  - 3 failures out of 35, waived `preexisting: true` (no color
    fixed): `success`/`danger` in tritanopia (ΔE 6.81 — both
    carry little blue, tritanopia's blue-yellow confusion leaves
    little to distinguish them by), `accent`/`success` in achromatopsia
    (ΔE 16.75 — close BT.601 luma once desaturated), `link`/`fg-base`
    in achromatopsia (ΔE 16.00 — two very dark colors, close
    luma). These three cases are explicit candidates for phase 3's
    remap tables (except the two achromatopsia cases, whose mechanism
    stays out of this chantier's scope).
  - Verified: `pnpm test` (609 tests, 17 suites), `pnpm lint`,
    `pnpm exec tsc --noEmit` green; compiled CSS strictly identical to
    the phase 0 baseline.

### Fixed (independent review of the E2 chantier)

- Waiver `site/button-active-outline-on-panel-bg`: the `anti-glare-light`
  `measured` value (1.057) dated back to phase 2 and hadn't been
  refreshed after phase 3's OKLCH rewrite — the actual measurement is
  1.307 (recomputed independently from the compiled CSS, matching the
  regenerated [CONTRAST-REPORT.md](./CONTRAST-REPORT.md) matrix).
  Waiver value and text fixed, report regenerated. No effect on the
  tests (the `measured` fields are documentary; the anti-zombie
  safeguard only triggers when the threshold is crossed).

### Docs (E2 chantier — engine review, phase 5 — wrap-up)

- Phase 5 (last) of [PLAN-engine-review.md](./PLAN-engine-review.md):
  final verification and documentation, branch `refactor/theme-engines`
  (4 commits, not merged). `pnpm build`/`lint`/`test` green.
- **Proof by diff**: the plan asks for CSS "byte-identical to
  phase 0" at wrap-up — a phrase copied as-is from the E1/foundations
  plans, but **contradicting this very plan's own content**
  (phases 2, 3, and 4 document and explicitly expect a visual CSS diff
  confined to the anti-glare themes). Interpretation adopted, consistent
  with the spirit of all three plans' CSS oracle: prove that the
  cumulative diff `phase0.css` → final CSS is *exactly* the sum of the
  changes documented phase by phase, nothing accidental elsewhere.
  Verified: the full diff (470 lines) confined to the
  `[data-theme="anti-glare-light"]` and `[data-theme="anti-glare-dark"]`
  blocks only (line ranges identical to those reported in
  phases 2/3/4) — no line changed outside these two themes across the
  full 5350-line compiled CSS.
- Docs updated: README § 5 (point 10, partial anti-glare coverage,
  marked resolved), the "document map" § (E2 executed, merge pending
  visual validation), guide E2 (result summary, documented deviations).
- **Deviations from the plan, documented phase by phase and summarized
  here**:
  1. Phase 1, item 1 (`if()` syntax): not applied as written — the
     proposed "fix" introduces a regression (a new
     `DEPRECATION WARNING`) under Dart Sass 1.101; the existing code is
     actually the official disambiguation syntax against the
     new native CSS `if()`. Code unchanged, a comment added.
  2. Phase 2: the plan's hypothesis ("double attenuation" for the ~22
     previously listed tokens) doesn't hold — they come out
     strictly unchanged. The real bug was only the ~45 forgotten
     tokens going untreated, fixed with no regression on the first 22.
  3. Phase 3: light threshold recalibrated from 92% to 85% (OKLCH) — at
     92%, `stone-300` stayed nearly untouched, something the old HSL
     engine wouldn't have let through. Dark threshold (22%) unchanged,
     its coverage already exactly matches the old HSL threshold (15%).
  4. Phase 5 (this point): the "byte-identical CSS" phrase reinterpreted
     as above.
- **Final report** (see also the end-of-task message): 4 commits on
  `refactor/theme-engines`, cumulative CSS diff strictly confined to
  the anti-glare themes, `CONTRAST-REPORT.md` kept up to date at every
  color-changing phase (no waiver turned zombie), automated visual
  verification done (headless Chromium screenshots) but **human visual
  validation required before any merge** — particularly on: the
  rendering of both anti-glare themes after the single-pass +
  OKLCH recalibration (phases 2-3), and removing the `backdrop-filter`
  overlay (phase 4, independently revertible from the other phases if
  needed).

### Removed (E2 chantier — engine review, phase 4 — backdrop-filter overlay)

- Phase 4 of [PLAN-engine-review.md](./PLAN-engine-review.md): the
  `apply-anti-glare-filter` mixin (`_anti-glare-functions.scss`) and its
  invocation removed — the full-screen `body::before` overlay
  (`backdrop-filter: contrast(98%) brightness(99%)`/`opacity: 0.3` in
  light, `contrast(95%) brightness(102%)`/`opacity: 0.2` in dark,
  `z-index: 9999`) imposed a permanent GPU cost for an effect measured
  as nearly zero.
- **CSS diff**: exactly the two rules `[data-theme="anti-glare-light"]
  body::before` and `[data-theme="anti-glare-dark"] body::before`
  disappear, nothing else (verified via a full diff).
- **Before/after comparison**: automated screenshots
  (headless Chromium, home page) of both anti-glare themes with and
  without the overlay. Pixel-by-pixel diff: ~1.4% of pixels change by
  more than 10/255 on a channel, concentrated on text/icon areas
  (anti-aliasing noise between two distinct Chromium renders, not a
  content change) — no perceptible visual difference attributable to
  the overlay. Confirms the plan's diagnosis ("effect measured as
  nearly zero").
- **Decision**: the removal is kept by default. **The final call belongs
  to whoever reviews it** — if a useful difference is nonetheless
  perceived in real use (beyond what static screenshots show), revert
  this commit only and log the decision here.
- **Check**: `pnpm build`/`lint`/`test` (566 tests, 15 suites) green;
  no side effect on `CONTRAST-REPORT.md` (no color touched).

### Changed (E2 chantier — engine review, phase 3 — anti-glare in OKLCH)

- Phase 3 (decision made 2026-07-03) of
  [PLAN-engine-review.md](./PLAN-engine-review.md): `transform-for-anti-glare`
  (`_anti-glare-functions.scss`) rewritten to work in OKLCH space
  (`color.channel(…, $space: oklch)` / `color.change(…, $space: oklch)` /
  `color.to-space(…, rgb)`) instead of HSL — OKLCH lightness is
  perceptually uniform, unlike HSL where a yellow and a blue with the
  same L don't visually darken identically.
- **Thresholds recalibrated from the plan's starting point** (the plan
  explicitly flags it as a starting point to adjust, not a
  truth):
  - `dark` mode (`L < 22%`): kept as-is. Measurement: on the dark
    theme's shifted rail, only the `gray-400` step (the darkest in the
    dark theme, OKLCH L ≈ 21.6%) falls below this threshold — exactly
    the same coverage as the old HSL threshold `< 15%` (which also only
    covered this same step, at HSL L ≈ 10%). No adjustment needed.
  - `light` mode (`L > 92%` in the plan): **lowered to `L > 85%`**. At
    92%, `stone-300` (OKLCH L ≈ 86.9%) stayed outside the threshold and
    so nearly untouched, whereas the old HSL engine already attenuated
    it (HSL L ≈ 82.9%, above its `75%` threshold). Rendering observed
    before the fix: `--gray-300` in anti-glare-light stayed at `#d6d3d1`
    (original, nearly unchanged) instead of a clearly attenuated tone.
    At 85%, `stone-50`/`100`/`200`/`300` are covered (as before),
    `stone-400` (OKLCH L ≈ 71.6%) stays outside the threshold with a
    wide margin.
- **Comparison table** (HSL engine, phase 2, vs OKLCH engine, phase 3 —
  rounded hex):

  | Token | AGL before | AGL after | AGD before | AGD after |
  | --- | --- | --- | --- | --- |
  | `--gray-950` | `#0c0a09` | `#0c0a09` | `#e7e5e4` | `#ece4e0` |
  | `--gray-900` | `#1c1917` | `#1c1917` | `#e7e5e4` | `#ece4e0` |
  | `--gray-800` | `#292524` | `#292524` | `#f5f5f4` | `#f6f6ee` |
  | `--gray-700` | `#44403c` | `#44403c` | `#fafaf9` | `#fbfbf3` |
  | `--gray-600` | `#57534e` | `#57534f` | `#fafaf9` | `#fbfbf3` |
  | `--gray-500` | `#77716d` | `#77716d` | `#78716c` | `#78716c` |
  | `--gray-400` | `#a8a29f` | `#a8a29f` | `#2a2623` | `#2c2723` |
  | `--gray-300` | `#b8b3b0` | `#d0cdcb` | `#292524` | `#2b2423` |
  | `--gray-200` | `#c6c2c0` | `#d8d4d3` | `#292524` | `#2b2423` |
  | `--gray-100` | `#d2d2ce` | `#e5e5e1` | `#292524` | `#2b2423` |
  | `--gray-50` | `#d8d8d1` | `#eaeae6` | `#44403c` | `#44403b` |
  | `--accent` | `#f3ce56` | `#efca57` | `#f8d151` | `#fad358` |
  | `--accent-strong` | `#e99b17` | `#efa135` | `#ef9d11` | `#f2a026` |
  | `--accent-ink` | `#421b06` | `#431c08` | `#fdf2c8` | `#fdf3c9` |
  | `--accent-soft` | `#f7e18a` | `#ece2bb` | `#652807` | `#441b05` |
  | `--link` | `#114969` | `#174a6a` | `#bce5fb` | `#bce6fb` |
  | `--link-hover` | `#0d577f` | `#195980` | `#e1f2fd` | `#e1f2fd` |
  | `--success` | `#0c8f66` | `#28946b` | `#ecfdf5` | `#edfdf5` |
  | `--danger` | `#d32f2f` | `#d43832` | `#fef2f2` | `#fef2f2` |

  Reading it: `gray-300`/`200`/`100`/`50` are now in the same order of
  magnitude as before (previously `gray-300` alone stayed nearly
  untouched under the plan's 92% threshold); the large flat areas
  (`gray-950` through `gray-500`, `link`, `danger`) are nearly
  unchanged; `accent-soft` moves a bit more than the other primitives
  (a stronger initial chroma). **None of these values are final**: the
  final call on fine-tuning belongs to whoever reviews it, the
  rendering above is only a reasonable starting point.
- **CSS diff**: strictly confined to the `anti-glare-light` and
  `anti-glare-dark` blocks (verified, the same line ranges as phase 2).
- **Side effect handled**: `CONTRAST-REPORT.md` regenerated. 6 waivers
  referencing a pair affected by this color change have their measured
  ratio updated in `contrast-pairs.ts`
  (`role/fg-on-accent-on-accent`, `role/success-on-bg-base`,
  `role/danger-on-bg-base`, `site/header-text-on-header-bg`,
  `site/header-text-role-on-header-bg`,
  `site/header-blog-link-text-on-bg` — all in `anti-glare-light` and/or
  `anti-glare-dark`); all remain non-compliant after the change,
  no waiver turned zombie.
- **Visual check**: automated screenshots (headless
  Chromium, home page) of both recalibrated anti-glare themes —
  rendering sound, consistent with phase 2, no visible regression.
  **Full visual validation required before merge**,
  particularly on the OKLCH thresholds' fine-tuning above.
- **Check**: `pnpm build`/`lint`/`test` (566 tests, 15 suites) green.

### Changed (E2 chantier — engine review, phase 2 — single-pass anti-glare)

- Phase 2 of [PLAN-engine-review.md](./PLAN-engine-review.md):
  `transform-theme-for-anti-glare` (`_anti-glare-functions.scss`)
  rewritten to derive the ~70 layer-3 tokens in a **single pass**
  from the anti-glared roles (`@include apply-theme-variables;` right
  after `apply-roles()`), instead of individually re-transforming a
  hardcoded list of ~22 tokens. Removed: the 3 manual button-token
  resyncs (redundant) and the ~22 individual re-transformation blocks.
- **Bug fixed**: ~45 layer-3 tokens sharing a role with the 22
  previously listed (e.g. `--color-lang-toggle-bg`, `--color-panel-bg`,
  `--color-button-active-outline`, `--color-tooltip-*`, `--color-focus-*`…)
  were **never** attenuated under anti-glare (a raw light value). They
  now get the same attenuation as the rest of their role.
- **Finding while analyzing, not predicted as such by the plan**:
  contrary to the plan's expectation
  ("double attenuation" for the 22 previously listed tokens), the
  measurement shows these 22 come out **strictly unchanged** (an empty
  CSS diff on these properties) — in this pipeline, reassigning them
  individually after capturing their pre-transform light value then
  applying `transform-for-anti-glare` to them once is mathematically
  equivalent
  deriving them from the role once already transformed (a pure function
  applied to the same original argument). The real bug therefore wasn't
  double attenuation but only the ~45 forgotten tokens going completely
  untreated — now fixed. No regression on the 22.
- **CSS diff**: strictly confined to the `[data-theme="anti-glare-light"]`
  and `[data-theme="anti-glare-dark"]` blocks (verified: no line changed
  outside these two ranges). Raw output (diff `phase1.css` →
  `phase2.css`, 228 lines, ~57 properties touched per theme) kept
  in `/tmp/theme-engines/phase2.diff` for review.
- **Expected and handled side effect**: this real color change made
  `docs/theme-system/CONTRAST-REPORT.md` (E1 chantier) stale —
  regenerated via `pnpm contrast:report`. A single waiver recorded in
  `contrast-pairs.ts` references an affected pair
  (`site/button-active-outline-on-panel-bg`, `anti-glare-light` theme,
  which itself was never attenuated before this fix): measured ratio
  updated from 1.38 to 1.06 (still non-compliant, no waiver turned
  zombie). The other waivers concern role pairs or layer-3 token pairs
  unaffected by this fix (checked one by one against the CSS diff).
- **Visual check**: automated screenshots (headless
  Chromium, home page) of both anti-glare themes after the fix —
  header, hero, collapse panels, and footer render normally,
  no invisible or unstyled element. **Full visual validation
  required before merge**, as the plan requires (a before/after
  comparison on the main pages).
- **Check**: `pnpm build`/`lint`/`test` (566 tests, 15 suites) green.

### Fixed (E2 chantier — engine review, phase 1 — API and dead code)

- Phase 1 of [PLAN-engine-review.md](./PLAN-engine-review.md) (branch
  `refactor/theme-engines`), fixes with no visual change:
  - `_anti-glare-functions.scss`: `transform-for-anti-glare`'s
    `$intensity` parameter removed (never passed at any of the ~30
    call sites, verified via grep).
  - `_theme-utils.scss`: the dead `$hue_shift` variable removed in
    `adapt-color-for-color-anomaly` (computed, never read). A hue-window
    overlap fixed in `adapt-color-for-colorblindness`
    (the red window `$h >= 330 or $h <= 30` claimed `h = 30` in
    common with the green window `$h >= 30 and $h <= 150`; changed to
    `$h >= 330 or $h < 30`). The three `-opias`'
    (deuteranopia, protanopia, tritanopia) `enhance-factor` made
    configurable: the `auto-*-opia-transform` functions now read an
    `"enhancer"` config key (same pattern as the anomalies) instead of
    hardcoding `2.5` in the call to `adapt-color-for-colorblindness`;
    the three `transform-light-to-*opia` mixins declare
    `"enhancer": 2.5` in their default config (value unchanged). The
    `_deuteranopia.scss`/`_protanopia.scss`/`_tritanopia.scss` theme
    files weren't modified (none already defined an `"enhancer"` key,
    verified by reading all three files).
- **A deviation found and NOT applied as written (plan item 1, the
  `if()` expression in `transform-for-anti-glare`)**: the plan describes
  `@return if(sass($mode == "light"): #888888; else: #aaaaaa);` as
  broken ("works by accident of if()'s special parsing") and
  asks for it to be replaced with the positional form
  `if($mode == "light", #888888, #aaaaaa)`. Measured before
  applying it: with Dart Sass 1.101.0 (the installed version), it's
  the opposite — compiling the positional form triggers a new
  `DEPRECATION WARNING [if-function]` ("The Sass if() syntax is
  deprecated in favor of the modern CSS syntax"), whose message
  explicitly suggests going back to the `sass(...): …; else: …` form.
  An isolated test (`if($mode == "light", …)` vs `if(sass($mode ==
  "light"): …; else: …)` for `$mode` set to `"light"` then `"dark"`)
  confirms both forms already return the right color — the current
  form isn't buggy, then: it's the official disambiguation syntax
  between Sass's `if()` and the new native CSS `if()`. This branch is
  unreachable in normal operation anyway (it only runs if `$color`
  isn't a valid color, which no call site produces). **Decision**:
  code left as-is (a comment added pointing back to this entry),
  no regression introduced. A second opinion welcome if some context is
  being missed.
- **Check**: compiled CSS strictly byte-identical to the phase 0
  baseline (empty `diff`). `pnpm build`/`lint`/`test` (566 tests, 15
  suites) green.

### Docs (E1 chantier — contrast tests, phase 5 — wrap-up)

- Phase 5 (last) of [PLAN-contrast-tests.md](./PLAN-contrast-tests.md):
  final verification and documentation. `pnpm build`/`lint`/`test` green;
  compiled CSS still strictly byte-identical to the phase 0 baseline
  (empty `diff` on `sass --no-source-map --style=expanded`).
- README updated: document map (E1 marked executed, the
  CONTRAST-REPORT.md line added), § 6.4 (the foundations migration's
  second out-of-scope chantier — contrast tests — is now done).
  The E1→E7 guide updated (E1 marked done with a result summary).
- **Final report** — 7 waived pairs, sorted by
  severity (lowest measured ratio first):

  1. `site/button-active-outline-on-panel-bg` — **1.00:1 in high-contrast**
     (the button's active outline is literally invisible: `--accent`
     and `--bg-base` both resolve to `#000000` in this theme); 1.02
     to 1.38:1 in the 9 other waived themes. **Recommendation**:
     a role adjustment — `--color-button-active-outline` could be
     rewired onto `--accent-strong` (already defined, amber-500) instead
     of `--accent`; to validate, out of this additive chantier's scope.
  2. `role/fg-on-accent-on-accent` — 1.15:1 in `dark`, 1.18:1 in
     `anti-glare-dark`. **Recommendation**: a role-model revision
     (E2 chantier, engine review) — `--fg-on-accent` inverts along with
     the other text roles while `--accent` deliberately stays
     fixed between light/dark themes.
  3. `site/header-text-on-header-bg` — same cause and same ratios as
     `role/fg-on-accent-on-accent` (an identical pair). Same recommendation.
  4. `role/danger-on-bg-base` — 1.34:1 in `protanopia`, 1.45:1 in
     `deuteranopia`, 3.25–3.46:1 in 4 other themes. **Recommendation**:
     [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md) — the
     color-blind engines' substitute colors are chosen for perceptual
     distinguishability, not contrast; `--danger` being consumed by no
     component to this day, no user urgency.
  5. `site/header-text-role-on-header-bg` — 1.38:1 in `dark`, 1.42:1 in
     `anti-glare-dark`. **Recommendation**: E2 chantier (same family as
     #2/#3 — `--fg-muted`/`--accent` on an accent background in a dark theme).
  6. `site/header-blog-link-text-on-bg` — same ratios as #5 (same two
     colors, fg/bg swapped). Same recommendation.
  7. `role/success-on-bg-base` — 2.42:1 in `achromatopsia`, 2.81–4.03:1
     in 8 other themes. **Recommendation**: a role adjustment
     (`emerald-600` → one step darker) if `--success` were to be
     consumed by a component; no urgency, currently unused.

  Full details (factual reasons, verified hex/HSL values, per-theme
  ratios): [contrast-pairs.ts](../../src/accessibility/contrast/contrast-pairs.ts)
  and [CONTRAST-REPORT.md](./CONTRAST-REPORT.md).
- Reminder: a strictly additive chantier from start to finish — no color,
  role, or theme was modified in `src/styles/`. The 7 points above
  are **proposals** for a future corrective chantier; whether and how to
  handle them (and their ordering vs. E2/E3) remains to be decided.

### Added (E1 chantier — contrast tests, phase 4)

- Phase 4 of [PLAN-contrast-tests.md](./PLAN-contrast-tests.md):
  `src/accessibility/contrast/report.ts`, the generator for
  [CONTRAST-REPORT.md](./CONTRAST-REPORT.md) (a `pairs × 12
  themes` matrix, cell = measured ratio + ✓/✗/⚠ symbol, a theme-
  abbreviation legend, a "Waivers" section pulling in the reasons from
  `contrast-pairs.ts`). A `pnpm contrast:report` script (via `tsx`) added
  to `package.json`.
  - A minor refactor along the way: the resolve/measure logic
    (`resolveColor` + `measureRatio`), until now duplicated in
    `contrast.test.ts`, extracted into `src/accessibility/contrast/measure.ts`
    and reused by both `contrast.test.ts` and `report.ts` — no behavior
    change (498 tests still green after the refactor).
  - **Generation date isn't a source of flakiness**: `generateReport()`
    accepts a date parameter; the freshness test
    (`report.test.ts`) extracts the date already present in the
    committed file, regenerates with that same date, then compares the
    full content. So the test only fails if the *data* (colors,
    ratios, waivers) changed without regenerating — never just because
    the date changed from one day to the next.
  - Report generated and committed. Current state: 33 `⚠` cells (the 7
    pairs waived in phase 3), 0 remaining `✗` cell.
  - Verified: `pnpm test` (566 tests, 15 suites) green, `pnpm lint` green,
    `pnpm exec tsc --noEmit` green, compiled CSS strictly identical to
    the phase 0 baseline.

### Added (E1 chantier — contrast tests, phase 3)

- Phase 3 of [PLAN-contrast-tests.md](./PLAN-contrast-tests.md):
  `src/accessibility/contrast/__tests__/contrast.test.ts`, the full Jest
  suite (a pair × theme matrix, 498 tests), plus the
  anti-zombie mechanism (a waiver whose measured ratio becomes
  compliant again fails the test with an explicit message asking for
  its removal).
- First run (inventory, a failure expected by the plan): **33 failures /
  482 tests**, grouped across **7** distinct pairs. Raw output from the
  measurement script (`getVar` + `wcag.ts`, before any waiver):

  ```
  Total failures: 33

  role/fg-on-accent-on-accent            dark               ratio=1.1484  threshold=4.5
  role/fg-on-accent-on-accent            anti-glare-dark    ratio=1.1791  threshold=4.5
  role/success-on-bg-base                light              ratio=3.6079  threshold=4.5
  role/success-on-bg-base                anti-glare-light   ratio=2.8507  threshold=4.5
  role/success-on-bg-base                deuteranomaly      ratio=3.6079  threshold=4.5
  role/success-on-bg-base                deuteranopia       ratio=4.0306  threshold=4.5
  role/success-on-bg-base                protanomaly        ratio=3.6079  threshold=4.5
  role/success-on-bg-base                protanopia         ratio=3.1254  threshold=4.5
  role/success-on-bg-base                tritanomaly        ratio=3.6079  threshold=4.5
  role/success-on-bg-base                tritanopia         ratio=2.8112  threshold=4.5
  role/success-on-bg-base                achromatopsia      ratio=2.4167  threshold=4.5
  role/danger-on-bg-base                 anti-glare-light   ratio=3.4637  threshold=4.5
  role/danger-on-bg-base                 deuteranomaly      ratio=3.3330  threshold=4.5
  role/danger-on-bg-base                 deuteranopia       ratio=1.4477  threshold=4.5
  role/danger-on-bg-base                 protanomaly        ratio=3.2777  threshold=4.5
  role/danger-on-bg-base                 protanopia         ratio=1.3430  threshold=4.5
  role/danger-on-bg-base                 tritanopia         ratio=3.2507  threshold=4.5
  site/header-text-on-header-bg          dark               ratio=1.1484  threshold=4.5
  site/header-text-on-header-bg          anti-glare-dark    ratio=1.1791  threshold=4.5
  site/header-text-role-on-header-bg     dark               ratio=1.3806  threshold=4.5
  site/header-text-role-on-header-bg     anti-glare-dark    ratio=1.4171  threshold=4.5
  site/header-blog-link-text-on-bg       dark               ratio=1.3806  threshold=4.5
  site/header-blog-link-text-on-bg       anti-glare-dark    ratio=1.4171  threshold=4.5
  site/button-active-outline-on-panel-bg light              ratio=1.3806  threshold=3
  site/button-active-outline-on-panel-bg anti-glare-light   ratio=1.3806  threshold=3
  site/button-active-outline-on-panel-bg high-contrast      ratio=1.0000  threshold=3
  site/button-active-outline-on-panel-bg deuteranomaly      ratio=1.1280  threshold=3
  site/button-active-outline-on-panel-bg deuteranopia       ratio=1.1800  threshold=3
  site/button-active-outline-on-panel-bg protanomaly        ratio=1.1280  threshold=3
  site/button-active-outline-on-panel-bg protanopia         ratio=1.1800  threshold=3
  site/button-active-outline-on-panel-bg tritanomaly        ratio=1.0241  threshold=3
  site/button-active-outline-on-panel-bg tritanopia         ratio=1.0579  threshold=3
  site/button-active-outline-on-panel-bg achromatopsia      ratio=1.2069  threshold=3
  ```

- 7 `preexisting: true` waivers added in `contrast-pairs.ts`, each
  with the measured per-theme ratio and a factual reason (hex/HSL
  values verified via `getVar`, no color fixed):
  - **`role/fg-on-accent-on-accent`** and **`site/header-text-on-header-bg`**
    (the same variable pair): `--accent` deliberately stays fixed
    (`#fcd34d`) between the light and dark themes, but `--fg-on-accent`
    inverts along with the other text roles (`#0c0a09` in light,
    `#e7e5e4` in dark) — light text on a background that stayed light
    in `dark`/`anti-glare-dark`.
  - **`site/header-text-role-on-header-bg`** and
    **`site/header-blog-link-text-on-bg`**: the same resolved color
    pair (inverted `--fg-muted` ≈ `#fafaf9` in dark / fixed `--accent`
    `#fcd34d`), fg and bg simply swapped between the two pairs — hence
    the identical ratios.
  - **`role/success-on-bg-base`**: `emerald-600` chosen for its
    semantic recognizability, not its contrast on `--bg-base`;
    `--success` is currently consumed by no component (verified via
    grep, no `var(--success)` in `src/`).
  - **`role/danger-on-bg-base`**: `red-600` passes 4.5:1 on `--bg-base`
    in most themes, but the color-blind engines' substitute colors
    (e.g. `#ffcc00` in deuteranopia/protanopia, chosen for perceptual
    distinguishability, not contrast) fall well
    below it; `--danger` is currently consumed by no component. A
    candidate for
    [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md).
  - **`site/button-active-outline-on-panel-bg`**: in `high-contrast`,
    `--color-button-active-outline` (= `--accent`) and `--color-panel-bg`
    (= `--bg-base`) both resolve to `#000000` — an exact
    1:1 ratio, the outline completely invisible on its background. In
    the other light themes, `--accent` (light amber) on `--bg-base`
    (near-white) is structurally below the 3:1 non-text threshold; dark
    themes pass since `--bg-base` becomes dark there. A more
    contrasted role (`--accent-strong`) already exists but isn't wired
    to this token.
- Full suite re-run after adding the waivers: **498/498 tests
  green** (including the anti-zombie guard). Cleaned up the temporary
  measurement script `__scratch_inventory.ts` (not a deliverable, never
  committed).
- Verified: `pnpm test` (565 tests, 14 suites) green, `pnpm lint` green,
  `pnpm exec tsc --noEmit` green, compiled CSS strictly identical to the
  phase 0 baseline (empty `diff`, aside from the `sourceMappingURL`
  comment absent in both with `--no-source-map`).

### Added (E1 chantier — contrast tests, phase 2)

- Phase 2 of [PLAN-contrast-tests.md](./PLAN-contrast-tests.md):
  `src/accessibility/contrast/contrast-pairs.ts`, the fg/bg pair
  registry (source of truth, extensible, never amputated — a failure
  becomes a waiver in phase 3, not a removal).
  - 19 **role-level** pairs (will move into the package, README § 6.1)
    and 21 **site-level** pairs (layer 3, portfolio-specific), copied
    as-is from the plan's tables. `--color-tooltip-text` declares
    `composeOver: "--bg-base"` (its background carries alpha).
  - `@types/culori` added (missing types for the `culori` package).
  - Verified: `pnpm lint` and `pnpm exec tsc --noEmit` green.

### Added (E1 chantier — contrast tests, phase 1)

- Phase 1 of [PLAN-contrast-tests.md](./PLAN-contrast-tests.md):
  setting up the WCAG contrast testing system's utilities (branch
  `feat/contrast-tests`, an additive chantier — no `src/styles/` file
  modified, byte-identical compiled CSS).
  - Dev dependencies added: `culori` (color parsing/conversion),
    `postcss` (structured parsing of the compiled CSS), `tsx` (running
    the future report generator, phase 4).
  - `src/accessibility/contrast/wcag.ts`: `toRgb()` (an explicit error
    on an invalid color, never a silent fallback), `compositeOver()`
    (standard sRGB alpha compositing), `contrastRatio()` (delegates to
    `culori.wcagContrast`, to call after compositing), `thresholdFor()`
    (WCAG 2.2 thresholds: `text` 4.5, `large-text`/`non-text` 3.0).
  - `src/accessibility/contrast/extract-themes.ts`: compiles
    `src/styles/main.scss` via the `sass` JS API (memoized), parses the
    CSS with `postcss`, extracts the custom properties from each of the
    12 `[data-theme="X"]` blocks (exact selector, not descendants like
    `[data-theme="dark"] .header__title-name`) as well as `:root`. An
    explicit error if a theme from `src/config/themes.ts` (single
    source) is missing from the compiled CSS.
  - **A bug found and fixed while writing the tests**: `:root`
    contains *two* distinct rules in the compiled CSS — the theme
    system's (~94 properties) and another, unrelated one from
    `_scroll-progress.scss` (`--scroll-progress-link-default`). The
    extraction's first version only kept the last one encountered,
    silently losing the theme values. Fixed by merging every `:root`
    rule (as the CSS cascade would), and the consistency test adjusted
    accordingly (checks that `:root`'s theme properties match
    `[data-theme="light"]`, without requiring `:root` to contain
    *only* theme tokens).
  - Unit tests: `wcag.test.ts` (known reference values:
    black/white = 21:1, `#767676`/white ≈ 4.54:1, compositing
    `rgba(0,0,0,0.5)` over white ≈ `#808080`), `extract-themes.test.ts`
    (the 12 themes present, `:root` consistency, explicit errors on an
    unknown theme/property).
  - Verified: `pnpm test` green (83 tests, 13 suites), `pnpm lint` green,
    compiled CSS strictly identical to the phase 0 baseline.

## 2026-07-03

### Docs (color-blind redesign plan + document map)

- Created [PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md):
  constant-weight Tailwind family remap (3-step resolution:
  family table → `special-colors` → OKLCH fallback), anomalies via a
  perceptual `color.mix(…, oklch)` blend with configurable `severity`,
  CVD-simulation distinguishability tests (Machado matrices, CIEDE2000
  ΔE, calibration threshold ≥ 20) shipped **before** switching the
  themes, default tables proposed as calibration points
  (validated via tests), purging the old paths (HSL hue windows).
  Blocking prerequisite: E1 merged; E2 recommended first.
- Added a **document map** at the top of the README (each document's
  role and status, the "one chantier = one plan = one branch = one
  AI-driven execution" principle).

### Docs (contrast testing plan)

- Created [PLAN-contrast-tests.md](./PLAN-contrast-tests.md)
  (E1 chantier, for the execution AI): implementation inside
  `src/accessibility/contrast/`, WCAG utilities (culori, alpha
  compositing), extraction of the compiled CSS's 12 `[data-theme]`
  blocks (postcss), an initial registry of ~40 pairs (roles + the
  site's layer 3), a Jest suite with an anti-zombie waiver mechanism
  (a waiver whose ratio becomes compliant fails the test), a generated
  and committed matrix report
  (`CONTRAST-REPORT.md`) with a freshness test. A purely
  additive chantier: no `src/styles/` file modified, pre-existing
  failures inventoried as waivers for review.

### Docs (color-blind remap safeguards — measurements)

- Question: can the family remap break the 4.5:1 ratio or
  collide with a background? Measured answer: **yes, without
  safeguards**. Tailwind luminance isn't constant across families at
  equal weight (at 600: 0.167 `redd` → 0.280 `amber`;
  `redd-600→amber-600` on a light background: 4.62:1 → 3.05:1).
  Safeguards folded into the mechanism (guide E2): a per-table-entry
  weight shift (`redd→amber(+1)` → 4.81:1) and default tables aware of
  collisions; the final guarantee still comes from the E1 verification.
  A side discovery: the current deuteranopia `special-color` error
  (`#ffcc00`) sits at **1.45:1** on a light background — latent (no
  component consumes `--danger` today), but a certain trap for the
  published package; confirms sequencing E1 first.

### Docs (engine evolutions decided)

- Decisions on the proposed engine evolutions:
  **OKLCH decided** for anti-glare (added to
  [PLAN-engine-review.md](./PLAN-engine-review.md) as phase 3, with a
  calibration procedure on the gray rail; the overlay and wrap-up
  renumbered as phases 4 and 5) **and** for the color-blind engine.
  Color-blind redesign decided in principle and reworded under the
  design constraints (guide E2): the system is **anchored to Tailwind
  palettes** (consumers customize by adopting the 11-weight geometry)
  and the adaptation **must not make things ugly** — hence the chosen
  mechanism: **constant-weight Tailwind family remap** (e.g.
  deuteranopia: `emerald → sky`, `redd → amber`), OKLCH as an
  off-palette fallback, verified by the CVD-simulation distinguishability
  tests (E1 chantier). The color-blind redesign is sequenced after E1
  and will get its own plan.

### Docs (engine fix plan)

- Created [PLAN-engine-review.md](./PLAN-engine-review.md) (E2 chantier,
  for the execution AI): phase 1 with no visual change (malformed
  `if()`, unused `$intensity`, dead `$hue_shift`, configurable
  `enhance-factor` with a 2.5 default, a hue-window boundary fix); phase
  2 anti-glare in a **single, fully-covering pass** (fixes the double
  attenuation of ~25 tokens and the lack of attenuation of ~45 others);
  phase 3 removing the `backdrop-filter` overlay (a visual decision).
  The mechanism evolutions (OKLCH, hue anchors, CVD-simulation
  distinguishability tests) are logged in guide E2 as
  proposals awaiting a decision.

### Docs (extraction guide + engine review)

- Created [GUIDE-package-extraction.md](./GUIDE-package-extraction.md):
  the broad strokes of the transformation into an open-source package
  (chantiers E1→E7: contrast tests first, engine review, pnpm monorepo,
  SCSS then runtime extraction, preference modules, scaffolding CLI,
  public npm publication), with the detailed design of the **contrast
  testing system** (pair registry, compilation → per-`[data-theme]`-block
  extraction → WCAG 2.2 ratio, alpha handling via compositing,
  documented waivers, matrix report, advisory APCA).
- Merged `refactor/theme-foundations` into `main` (`bbc28f0`) after
  visual validation of the restored shadows; branch deleted.
- Engine review (findings, fixes to plan — the guide's E2 chantier):
  **anti-glare**: double transformation of layer-3 tokens
  (rail transformed, roles derived, then ~25 tokens re-transformed —
  tokens sharing the same role render differently, e.g. `main-bg` vs
  `panel-bg`), an unused `$intensity` parameter, a malformed but
  accidentally functional `if()` expression in the error branch, a
  full-screen `body::before` `backdrop-filter` overlay to evaluate (a
  permanent GPU cost for a nearly imperceptible effect: contrast 98% /
  brightness 99%); **color-blind**: `enhance-factor` hardcoded at 2.5
  for the -opias (not configurable, unlike the anomalies), a
  dead `$hue_shift` variable in `adapt-color-for-color-anomaly`,
  hue windows leaving the site's actual palette nearly unchanged
  (the -opia themes ≈ light + success/danger — behavior to confirm as
  intended or to rework).

### Docs (target architecture — decisions)

- Two decisions made, written into README § 6:
  **widening** the exportable component's scope to the full
  accessibility preferences system (new § 6.5: a functional trigger +
  card shipped, opt-in zoom/fonts/animations/dyslexia modules, bundled
  accessibility fonts — licenses to verify before publication,
  `rem`/`reduce-motion` host contracts) and **hybrid distribution**
  (§ 6.3 rewritten: engines via npm for centralized fixes, UI scaffolded
  into the project via an `init` CLI, shadcn/Radix-style). Working
  name: `a11y-prefs`. §6.2 and §6.4 scope updated
  accordingly.

### Fixed (post-review)

- Fixed the dead declaration `var(--color-gray-dark)` (a custom
  property that never existed; also, `rgba(var(--x), a)` is invalid in
  CSS): the box shadows of the portfolio cards, the skills cards, and
  the contact form, as well as a language-selector border, weren't
  showing up. A new token `--color-shadow`
  (`rgba($border-strong, 0.1)`, computed in Sass per theme, on the
  model of `--color-tooltip-bg`) consumed by the 3 `box-shadow`s; the
  border now uses `var(--border-strong)`. **Intended visual change**:
  these shadows and this border become visible (again), across the 12
  themes.

### Docs (phase 8 — wrap-up)

- Phase 8 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  global verification (`pnpm build`/`lint`/`test` green; a visual check
  of the 12 themes via a headless CDP script — screenshots + zero
  console error; `pnpm test:a11y` not runnable in this environment,
  pa11y-ci's Chromium missing — unrelated to the migration). Updated
  [README.md](./README.md): § 3 (purged files marked, `src/config/themes.ts`
  added), § 4 (the three-layer chain, names up to date), § 5 (findings
  #1, 5, 6, 7 marked resolved, #4, 8, 11 partially resolved), § 6
  (trajectory steps 1 and 2 marked done), § 7 ("Cleanup" section marked
  done). A summary entry added to the global
  [CHANGELOG](../../CHANGELOG.md).
  - **Deviations from the original plan**, all identified and
    resolved during execution (see the phase 3, 4, 5, 6 entries below
    for details): two value regressions found and
    fixed during the Sass migration (phase 5: `color.adjust`
    clamping, `color.channel` rounding); one value regression
    found and fixed during the roles introduction (phase 6:
    button tokens not reapplied by the anti-glare engine);
    a second, minor, documented visual change not planned for
    (phase 4: the portfolio tags' text color, until then unresolved
    because of the `bg-texte` typo, actually applies for the first
    time); a harmless counting gap in the plan's text
    (phase 3: 14 actual theme blocks vs. 13 announced).
  - **A point left open**, explicitly flagged by the plan as
    out of scope: `src/styles/pages/_contact.scss` line ~143 (and two
    additional occurrences found along the way,
    `_skills.scss:108` and `_language-selector.scss:15`) reference
    `rgba(var(--color-gray-dark), 0.1)`, a custom property that never
    existed — a dead declaration predating this migration, not fixed
    (a decision to make separately).

### Added (phase 7 — single source of truth, runtime)

- Phase 7 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  eliminating the triple duplication of the 12-theme list (README
  § 5 finding #5). New `src/config/themes.ts` exporting `THEMES`
  (`as const`) and the derived `ThemeOption` type.
  - `useTheme.ts`: removed the local `ThemeOption` type and
    `VALID_THEMES`, imports from `@/config/themes` (a
    `readonly string[]` cast for `.includes()` on an `as const` array).
  - `layout.tsx`: the anti-FOUC script now injects
    `${JSON.stringify(THEMES)}` instead of the hardcoded list — verified
    in the HTML generated by `pnpm build` (the 12 themes are indeed
    present in the inline script).
  - `AccessibilityMenu.tsx`: the inline 12-literal union cast in
    `handleColorVisionChange` replaced with `ThemeOption`.
  - Added a sync comment in `_theme-system.scss`
    pointing to `src/config/themes.ts` (the SCSS `[data-theme]` blocks
    remain to sync manually until the package extraction).
  - No compiled-CSS change (empty diff); `pnpm build`, `pnpm lint`,
    `pnpm test` green.

### Changed (phase 6 — layer 2, role tokens)

- Phase 6 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  introducing layer 2 (roles), see README § 6.1. **The plan's only
  phase with an authorized visual change** (see below).
  - Renamed the semantic primitives: `$primary-color` → `$accent`,
    `$secondary-color` → `$accent-ink`, `$tertiary-color` → `$accent-soft`,
    `$link-color` → `$link`, `$link-color-hover` → `$link-hover`,
    `$success-color` → `$success`, `$error-color` → `$danger` (Sass and
    config keys). A new `$accent-strong` primitive (amber-500),
    transformed in every engine identically to `$accent`.
  - A new `apply-roles()` mixin in `_theme-variables.scss`: derives 15
    role tokens (`$bg-*`, `$fg-*`, `$border-*`, `$focus-ring`) from the
    rail and the primitives, called by every engine (and
    `light-theme-variables()`) between the transform and
    `apply-theme-variables()`.
  - Fully rewired the ~70 layer-3 tokens to derive from the roles
    rather than directly from the rail/primitives (the full table in
    README § 6.3). Fixed along the way: `--color-button-hover-bg`,
    `--color-button-hover-text`, and `--color-button-active-text` each
    had a pre-existing inconsistency (the CSS emission read directly
    from `$link-hover`/`$off-white`/`$near-black`, ignoring the Sass
    variable meant to carry that value) — aligned onto the *effective*
    value, so no emitted-value change in a static theme.
  - `generate-theme-css-vars()`: renamed the 5 primitive properties
    (`--primary-color` → `--accent`, etc.), added 8 primitive/feedback
    properties (`--accent-strong`, `--success`, `--danger`, …) and
    15 role properties (`--bg-base` … `--focus-ring`). 12 component
    consumers updated (`var(--primary-color)` → `var(--accent)` ×7,
    one with a fallback value, `var(--link-color)` → `var(--link)` ×3,
    `var(--link-hover-color)` → `var(--link-hover)` ×2; the rest of the
    occurrences the plan counted were in comments, updated for
    consistency).
  - **A regression found and fixed during the migration**: the
    anti-glare engine (`transform-theme-for-anti-glare`) transforms
    each layer-3 token individually and wasn't recomputing
    `$color-button-hover-bg`/`-text`/`$color-button-active-text`
    afterward — by deriving them from the roles (layer 2) instead of
    reading them directly from the primitives, these three tokens would
    have stayed at their value *before* glare reduction in the
    `anti-glare-light`/`anti-glare-dark` themes. Fixed by re-deriving
    them from the resynced (already anti-glared) roles right after
    `apply-roles()` in this engine.
  - **Visual change** (the only one across the whole migration):
    `--color-accent-hover` goes from `darken(amber-300, 15%)` to
    `amber-500` (`#f59e0b`) — replacing an arbitrary `darken()` with
    a rail step, and its transformed equivalent in the 11 other
    themes. Verified: the compiled CSS diff strictly additive
    everywhere else (roles + primitives + `accent-strong`/`success`/`danger`
    added across the 14 blocks), confirmed via sort + `comm -3`. A visual
    check to do in phase 8.

### Changed (phase 5 — Sass modules)

- Phase 5 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  a full `@import` → `@use`/`@forward` migration across all of
  `src/styles/` (the theme system **and** the other partials loaded by
  `main.scss`, since `@use` requires every file to explicitly declare
  its dependencies — the old global `@import` flattening was hiding
  these dependencies). Final compilation **with zero deprecation
  warning** (`@import`, `darken`/`lighten`, `red`/`green`/`blue`,
  `hue`/`saturation`/`lightness`, `map-get`/`map-has-key`/`map-merge`,
  `index`/`nth`/`length`, `/` division, `if()` syntax).
  - Anti-cycle prerequisite: `get-color()`, `$tailwind-weights`, `$midpoint`
    moved from `_theme-utils.scss` to `_base-palette.scss`.
  - `_theme-variables.scss`: every variable mutated by
    `define-base-colors()`/`apply-theme-variables()` (the 11-step rail,
    semantic colors, ~70 layer-3 tokens) now declared at the module
    root — mandatory for the engines' `!global` reassignments to stay
    valid under `@use`.
  - A cycle found and fixed between `_mixins.scss` and `_placeholders.scss`
    (mutual extend/include): the `word-wrap` mixin (4 declarations) was
    inlined directly into the two placeholders that used it instead
    of being included there, breaking the cycle without changing the
    produced CSS.
  - **Two regressions found and fixed** during the migration (the
    compiled-CSS diff revealed them — the verification protocol
    worked):
    1. `color.adjust($c, $lightness: -15%)` does **not** reproduce
       `darken()`'s clamped behavior: on a color already at 0%
       lightness (e.g. `$primary-color` pushed to pure black by a
       theme), `darken()` caps at 0% while `color.adjust()` produces
       an invalid negative lightness (`hsl(0, 0%, -15%)`). A new
       `adjust-lightness-clamped()` function in `_base-palette.scss`
       explicitly clamps the result between 0% and 100%, used
       everywhere `darken()`/`lighten()` used to be called.
    2. `color.channel($c, "red"/"green"/"blue", $space: rgb)` doesn't
       clamp the result to an integer, unlike the old global functions
       `red()`/`green()`/`blue()` — a gap found on colors
       reconstructed via `hsl()` (e.g. `rgba(67.6, 64, 60.4, 0.7)`
       instead of `rgba(68, 64, 60, 0.7)`). Every affected call
       wrapped in `math.round()`.
  - **Residual gaps in the CSS diff, explained and proven harmless**
    (no value changes, confirmed only via sort + `comm -3`):
    - The `/** @format */` comment headers and `_theme-utils.scss`'s
      documentation block now appear only **once** in the compiled
      CSS (vs. up to 13× before): `@use` only loads each module once,
      while `@import` used to re-inject the whole file at every
      `@import`, including its header comments. No runtime effect
      (these are comments).
    - Reordering of 3 `@extend`-derived selector lists
      (`.sticky-footer__link:hover, …`, `.sticky-footer__fixed-links, …`,
      `.skills__title, .skills__subtitle, …`): the same set of
      selectors, the same rule, a different order — a consequence of
      the new module-loading graph. No effect (same declarations,
      no specificity conflict between these selectors).

### Fixed

- Phase 4 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  fixed the `bg-texte` typo — `$color_portfolio-tag_bg-texte` becomes
  `$color-portfolio-tag-text`, and the emitted custom property
  `--color-portfolio-tag-bg-text` becomes `--color-portfolio-tag-text`. The
  consumer (`_portfolioCard.scss`) already referenced the correct name
  (`var(--color-portfolio-tag-text)`): the portfolio tags' text color,
  until now unresolved (a non-existent variable → inherited from the
  parent), now actually applies. The only visual change not planned for
  by the original plan, distinct from phase 6's accent-hover change — to
  validate visually (phase 8).

### Changed

- Phase 4 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  kebab-case standardization of layer 3 (README § 5.1/§ 6, ~66
  `$color_...` variables → `$color-...`, including
  `$color_button_hover_bg`). No effect on the compiled CSS (Sass treats
  `-`/`_` as interchangeable) — an empty diff after normalization,
  aside from the typo fix below. Removed two double assignments that
  became visible after standardizing
  (`$color-main-bg`/`$color_main-bg`, `$color-main-text`/`$color_main-text`
  — the same variable assigned twice in `apply-theme-variables()`): only
  one kept per variable.

### Added

- Phase 3 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  layer 1 (numeric rail) complete — see README § 6.1. Renamed the
  descriptive gray scale (`$gray-darkest`…`$gray-lightest`, 8 steps)
  into Tailwind coordinates (`$gray-50`…`$gray-950`, 11 steps), adding
  the missing `gray-100` step. `$off-white`/`$near-black` become plain
  resynced aliases (`$off-white: $gray-50`, `$near-black: $gray-950`)
  after every theme transform, instead of being transformed
  independently of the gray scale.
  - Engines updated to transform the 11 steps (instead of 8 + 2
    separate aliases): `transform-light-to-dark`,
    `transform-light-to-high-contrast`, `transform-light-to-achromatopsia`
    (`_theme-utils.scss`), `transform-theme-for-anti-glare`
    (`_anti-glare-functions.scss`). The color-blind engines (-opias/-anomalies)
    don't transform grays — unchanged, by design.
  - Config keys renamed in `_dark.scss` and `_achromatopsia.scss`
    (+ added `"gray-100": 0`, a step not consumed by the derived
    variables). In `_deuteranomaly.scss`, `_protanomaly.scss`,
    `_tritanomaly.scss`: removed the `"gray-*"` keys that were
    dead entries (never consumed by these engines).
  - `generate-theme-css-vars()` now emits `--gray-50`…`--gray-950` (11
    lines, `950`→`50` order kept for a pure-addition diff) instead of
    `--gray-darkest`…`--gray-lightest` (8 lines); `--off-white`/
    `--near-black` unchanged (emitted from the aliases).
  - 5 component consumers updated (`_contact.scss`,
    `_accessibility-menu.scss`): `var(--gray-medium-light)` → `var(--gray-500)`,
    `var(--gray-light)` → `var(--gray-400)`, `var(--gray-dark)` →
    `var(--gray-700)`, `var(--gray-lighter)` → `var(--gray-300)` (×2, one
    inside a commented-out line).
  - Verification: the compiled-CSS diff strictly additive (39 new
    `--gray-50`/`--gray-100`/`--gray-950` lines across 14 blocks — `:root`,
    the `prefers-color-scheme` block, and the 12 `[data-theme]`; note: the
    plan announced 13, the exact arithmetic is 1 + 1 + 12 = 14), proven
    via sort + `comm -3` (42 lines of difference total, 3 per block,
    all additions). Targeted checks passed: `high-contrast` keeps
    `--color-main-bg: #000000` / `--color-main-text: #ffff00`;
    `achromatopsia` stays on the `neutral` family, not `stone`; in
    each block `--off-white == --gray-50` and `--near-black == --gray-950`.

### Changed

- Phase 2 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  `setTheme()` (`src/hooks/useTheme.ts`) reduced to its three useful
  lines (set `data-theme`, write `localStorage`, `setThemeState`).
  Removed debug artifacts: the double forced reflow
  (`offsetWidth`/`offsetHeight`), the temporary `theme-switching` class
  (consumed by no style — verified via grep) with its `setTimeout`, and
  the diagnostic `console.log`s. No compiled-CSS or observable-behavior
  change.

### Removed

- Phase 1 of [PLAN-foundations-migration.md](./PLAN-foundations-migration.md):
  purged the dead code identified in README § 3 and § 5.1, with no
  change to the compiled CSS (byte-identical diff vs. the baseline).
  - Files removed: `src/styles/abstracts/_variables.scss`,
    `src/styles/abstracts/_dark-functions.scss` (not imported).
  - `_theme-utils.scss`: `transform-for-dark()` (referenced maps that no
    longer exist), the old `generate-*-theme()` mixins never included
    (high-contrast, deuteranopia, protanopia, tritanopia, achromatopsia)
    and their now-orphaned getters (`get-deuteranopia-color`,
    `get-protanopia-color`, `get-tritanopia-color`, `get-deuteranomaly-color`,
    `get-protanomaly-color`, `get-tritanomaly-color`, `get-achromatic-color`),
    `transform-for-high-contrast()`, `$hc-colors` (a duplicate of `$hc-palette`),
    `str-replace()`. In `adapt-color-for-colorblindness()`: an LMS
    matrix selection computed but never consumed; removed this
    dead assignment and the `$protanopia-matrix`/`$deuteranopia-matrix`/
    `$tritanopia-matrix` maps, as well as `rgb-to-lms()`/`lms-to-rgb()`
    (uncalled).
  - `_anti-glare-functions.scss`: `safe-hue-for-keratoconus()` (never
    called).
  - Historical commented-out code blocks (old superseded versions) in
    `_theme-utils.scss`, every `themes/_*.scss` file, `main.scss`,
    `_theme-system.scss`, `_theme-variables.scss`, `layout.tsx`,
    `useTheme.ts`, `AccessibilityMenu.tsx`. Stray trailing commas
    (`,,,,,,,,,,`) in `_theme-utils.scss` and the full color-blind
    themes.
  - Deliberately untouched: two commented-out lines in
    `getFontTypeLabel()` (`AccessibilityMenu.tsx`, "tiresias"/
    "ralewaydots" font types still active in the UI) — a topic distinct
    from the dyslexia font, out of this migration's scope; flagged for
    a separate decision.

## 2026-07-02

### Docs

- Created the execution plan
  [PLAN-foundations-migration.md](./PLAN-foundations-migration.md), meant for
  an execution AI: 8 phases (baseline → dead-code purge → runtime
  cleanup → 11-step numeric rail → kebab-case → `@use`/modern Sass API
  migration → layer-2 roles → single source for the theme list →
  wrap-up), with a compiled-CSS-diff verification protocol,
  full rename tables, and an exclusion scope. A single authorized
  visual change: `--color-accent-hover` goes from `darken(amber-300, 15%)`
  to the `amber-500` rail step.
- Added the "Target architecture of the exportable component" section
  (README § 6) following design discussions: a three-layer model
  (11-step numeric rail / ~23 roles as the package's API / component
  tokens outside the package), the future package's included/excluded
  scope, distribution options (pnpm workspace → npm; a "copy" model
  ruled out), and a 4-step trajectory. Decisions made: numeric rail
  naming (`$gray-50`…`$gray-950`), a role-vocabulary baseline (hybrid
  Primer + Material `on-*` pairs), generalized kebab-case. The
  distribution channel is explicitly flagged as a decision *deferrable
  without risk* (§ 6.4).
- Fixed finding #8 (README § 5): the underscore/hyphen mix in the
  derived variables isn't an inconsistency but an intended convention
  (underscore = level separator) — unverifiable, though, since Sass
  treats `-` and `_` as interchangeable in identifiers.
- Created this dedicated documentation (`docs/theme-system/`): the full
  operating principle (Sass compilation chain → custom properties →
  React runtime), file mapping, state of play (dead code, deprecated
  Sass API, duplications), and ideas toward packaging.
  See [README.md](./README.md).

## 2026-07-01

_Entries backfilled from the global changelog (ESLint/Next 16 overhaul)._

### Fixed

- The anti-FOUC script (`src/app/[lang]/layout.tsx`) only recognized 5
  of the 12 themes (`light`, `dark`, `high-contrast`, `deuteranopia`,
  `protanopia`) — a saved `anti-glare-*`, `*-anomaly`, or
  `achromatopsia` theme would cause a flash of the wrong theme on load
  before React corrected it. List synced with `useTheme`'s `VALID_THEMES`.
- `useTheme`: the `useEffect`-based init calling `setTheme()` was
  replaced with a lazy `useState` initializer reading
  `localStorage`/`matchMedia`; the DOM attribute is set in an effect
  with no `setState` (compliant with `react-hooks/set-state-in-effect`).
- `usePrefersDarkMode`: rewritten with `useSyncExternalStore` (a native
  media-query subscription, no more `setState` in the effect body).
- `AccessibilityMenu`: switched to the `useIsMounted()` hook; removed a
  redundant sync effect (dyslexia mode); `reduceMotion`
  lazily initialized and synced to the DOM by a dedicated effect.

## Earlier (summary)

The system was built iteratively across late 2024 – 2025 (full history
in git). Notable milestones:

- Initial hand-written theme generation (`generate-X-theme()` per theme),
  then a redesign toward the current **light + configured transform**
  model (`transform-light-to-X($config)`) — the old versions survive as
  comments in the theme files.
- Added the full color-blind themes (-opias), then the mild forms
  (-anomalies), then achromatopsia.
- Added the anti-glare themes (light/dark) by composing on top of the
  base themes.
- `feat(accessibility)` `cfc23ee`: first packaging attempt
  (`packages/darkmode-plus-a11y`, branch
  `feature/darkmode-plus-a11y-package`, never merged, predating the
  redesigns).
