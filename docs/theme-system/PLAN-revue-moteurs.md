<!-- @format -->

# Fix plan — anti-glare and color-blind engines (E2 chantier)

**Execution document meant for an AI.** Same general rules and same
verification protocol as
[PLAN-migration-fondations.md](./PLAN-migration-fondations.md) (§ "General
rules" and "Verification protocol": dedicated branch, one commit per
phase, the compiled CSS is the oracle, raw diff output in each report,
stop on an unexpected diff, [CHANGELOG.md](./CHANGELOG.md) entries at each
phase). Context: findings from the 2026-07-03 review (CHANGELOG) and the
E2 chantier of [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md).

Branch: `refactor/theme-engines`. Files involved:
`src/styles/abstracts/_anti-glare-functions.scss`,
`src/styles/abstracts/_theme-utils.scss`,
`src/styles/themes/_anti-glare-light.scss`, `_anti-glare-dark.scss`,
`_deuteranopia.scss`, `_protanopia.scss`, `_tritanopia.scss`.

**Strict scope**: only the fixes listed here. Moving the
**anti-glare engine to OKLCH is decided** (2026-07-03) and is part of this
plan (phase 3). The **color-blind** mechanism redesign (Tailwind family
remap, simulation-based distinguishability tests) is decided in principle
but **sequenced after the E1 chantier** (contrast tests) — do not
implement it here, see guide E2.

---

## Phase 0 — Preparation

Same as the foundations plan: clean tree, branch created from `main`,
reference snapshot `/tmp/theme-engines/phase0.css`, `pnpm build`,
`pnpm lint`, `pnpm test` green before any change.

## Phase 1 — Fixes with zero visual change

In `_anti-glare-functions.scss`:

1. **Malformed `if()` expression** (error branch of
   `transform-for-anti-glare`, ~line 13):

   ```scss
   // BEFORE (works by accident of if()'s special parsing)
   @return if(sass($mode == "light"): #888888; else: #aaaaaa);
   // AFTER
   @return if($mode == "light", #888888, #aaaaaa);
   ```

2. **Unused `$intensity` parameter** of `transform-for-anti-glare`: remove
   it from the signature (grep-check that no call passes it). A
   *configurable* intensity is one of the pending proposals — do not
   implement it here.

In `_theme-utils.scss`:

3. **Dead variable `$hue_shift`** in `adapt-color-for-color-anomaly`
   (computed, never read): remove the line.
4. **Configurable `enhance-factor` for the -opias**: the three
   `auto-{deuter,prot,trit}anopia-transform` hardcode `2.5`. Add an
   `"enhancer"` key to the three `transform-light-to-{…}opia` mixins'
   default configs (default value **2.5**, so nothing changes), and have
   the `auto-*-transform` read that key (same pattern as the anomalies).
   The theme files don't change.
5. **Overlapping hue windows** in `adapt-color-for-colorblindness`:
   `$h >= 30 and $h <= 150` (greens) and `$h >= 330 or $h <= 30` (reds)
   both claim `h = 30`. Fix the red window to `$h >= 330 or $h < 30`. No
   color in the current palette sits at exactly 30° — zero impact expected.

**Expected CSS diff**: byte-identical to phase 0.
**Commit**: `refactor(theme): engines phase 1 — API and dead-code fixes, no visual change`.

## Phase 2 — Single-pass anti-glare (controlled visual change)

### The problem being fixed

`transform-theme-for-anti-glare` currently transforms the rail +
primitives, derives the roles… then re-transforms ~25 layer-3 tokens
individually. Consequences: **double attenuation** for those 25 tokens
(e.g. `--color-main-bg`), and **no attenuation at all** for the ~45 tokens
missing from the list (e.g. `--color-lang-toggle-bg`, which nonetheless
comes from the same `bg-base` role as `main-bg`). Surfaces sharing the
same role render differently.

### The fix

In `transform-theme-for-anti-glare`:

1. Keep: transforming the rail's 11 steps, resyncing the aliases,
   transforming the 8 primitives (`$accent`…`$danger`),
   `@include apply-roles()`.
2. **Add** `@include apply-theme-variables;` right after `apply-roles()`:
   all ~70 layer-3 tokens re-derive from the anti-glared primitives — full
   coverage, a single pass.
3. **Remove**: the 3 manual button-token resyncs (now redundant) and
   **all** individual `$color-*` token re-transformations (~25 blocks,
   from "derived UI variable transformation" through the footers).
4. Keep at the end (after `apply-theme-variables`): the special
   `$color-collapse-border` override (softened rgba) and
   `@include apply-anti-glare-filter($mode)` (handled in phase 3).

### Verification

- CSS diff: changes must be **confined to the
  `[data-theme="anti-glare-light"]` and `[data-theme="anti-glare-dark"]`
  blocks** (no other block may move). Inside them, two expected and
  explainable directions: tokens that were previously double-transformed
  become slightly less attenuated; tokens that were previously missed
  become attenuated. Attach the raw diff output to the report.
- **Visual validation required before merge**: both anti-glare themes,
  main pages, before/after comparison.

**Commit**: `refactor(theme): engines phase 2 — single-pass anti-glare, full token coverage`.

## Phase 3 — `transform-for-anti-glare` in OKLCH (decided improvement)

Motivation: HSL "lightness" isn't perceptual — the current attenuation
doesn't darken a yellow and a blue of the same L equally. In OKLCH
(natively supported by the project's Sass), glare reduction becomes
perceptually uniform. Decision made on 2026-07-03.

Rewrite the body of `transform-for-anti-glare`:

1. Read the perceptual channels:
   `color.channel($color, "lightness", $space: oklch)` (in %) and
   `color.channel($color, "chroma", $space: oklch)`.
2. `light` mode: if `L > 92%` → `L: max(85%, L - 5%)` and
   `C: max(0.005, C)` (avoid pure white); then `C: C * 0.9` globally.
   `dark` mode: if `L < 22%` → `L: min(30%, L + 6%)`; then
   `C: max(0.01, C * 0.95)`.
3. Rebuild in RGB to keep stable CSS emission:
   `color.to-space(color.change($color, $lightness: …, $chroma: …, $space: oklch), rgb)`.

⚠️ The constants in point 2 are a **calibration starting point**, not a
truth: adjust them so `anti-glare-light`'s gray rail stays close to the
current rendering (compare the `--gray-*` before/after), then **visual
validation** — that's the final call on the thresholds.

**Expected CSS diff**: confined to the `anti-glare-*` blocks. Report: a
before/after table of the 11 `--gray-*` and the 8 primitives in both
themes.
**Commit**: `refactor(theme): engines phase 3 — perceptual OKLCH anti-glare transform`.

## Phase 4 — `backdrop-filter` overlay (visual decision)

The full-screen `body::before` overlay (`backdrop-filter: contrast(98%)
brightness(99%)`, `opacity: 0.3`, `z-index: 9999`) imposes a permanent GPU
cost for a measured near-zero effect, and its `opacity`/`backdrop-filter`
interaction has an uncertain effect across browsers.

1. Remove `apply-anti-glare-filter` and its invocation.
2. Prepare a before/after comparison (two screenshots per anti-glare
   theme): **the final call belongs to whoever reviews it**. If a useful
   difference is perceived, revert this phase only (revert the commit)
   and log the decision in the changelog.

**Expected CSS diff**: the two `body::before` rules disappear from the
anti-glare blocks, nothing else.
**Commit**: `refactor(theme): engines phase 4 — drop full-screen backdrop-filter overlay`.

## Phase 5 — Wrap-up

`pnpm build`, `pnpm lint`, `pnpm test`; full changelog entries; final
report with raw diff output from every phase and the list of values
changed in phases 2 and 3 (for visual validation); update README § 5
(findings resolved) and the guide (E2: fixes done; color-blind redesign
still sequenced after E1).

---

## Out of scope (do NOT do)

- **Color-blind** mechanism redesign (constant-weight Tailwind family
  remap, simulation-based distinguishability tests): decided in principle
  but sequenced **after the E1 chantier** — dedicated plan to come
  (guide E2).
- Any tweak to the high-contrast engine (decision: revisit only later).
- Tweaking the hue windows beyond phase 1's boundary fix (they'll be
  replaced by the redesign above).
