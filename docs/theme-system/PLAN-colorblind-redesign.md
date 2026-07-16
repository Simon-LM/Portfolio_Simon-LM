<!-- @format -->

# Execution plan — color-blind mechanism redesign

**Execution document meant for an AI.** Same general rules as
[PLAN-foundations-migration.md](./PLAN-foundations-migration.md): dedicated
branch, one commit per phase, raw check output in each report, stop on
anything unexpected, entries in [CHANGELOG.md](./CHANGELOG.md).

Three parts, independently executable:

| Part | Content | Status |
| --- | --- | --- |
| [Part 1](#part-1--tailwind-family-remap) | Tailwind family remap + distinguishability tests | ✅ executed 2026-07-04, merged 2026-07-05 (`d12264f`) |
| [Part 2](#part-2--semantic-anchors-for-status-roles) | Semantic anchors for status roles | ✅ executed 2026-07-06, merged 2026-07-06 (`5c8dce9`) after visual validation |
| [Part 3](#part-3--robustness--graceful-degradation-gamut-guard-dev-warning) | Graceful degradation (warning instead of blocking), anti-gamut guard, tritan gamut fix | ✅ executed 2026-07-06, merged 2026-07-06 (`5c8dce9`) after visual validation |

---

## Part 1 — Tailwind family remap

> ✅ **Executed 2026-07-04** (branch `refactor/theme-cvd-remap`,
> 5 commits), **merged 2026-07-05** after visual validation and
> independent review. Kept below for reference — detailed results in
> [CHANGELOG.md](./CHANGELOG.md) and the
> [guide § E2](./GUIDE-package-extraction.md).

Reference design: [GUIDE-package-extraction.md](./GUIDE-package-extraction.md)
§ E2 (mechanism decided 2026-07-03: constant-weight family remap,
measured safeguards) and the contrast-testing chapter.

### ⛔ Blocking prerequisites (part 1)

1. **The E1 chantier ([PLAN-contrast-tests.md](./PLAN-contrast-tests.md))
   must be merged**: this redesign changes the colors of 7 themes; the
   contrast suite is its safety net. Do not start without it.
2. The E2 chantier ([PLAN-engine-review.md](./PLAN-engine-review.md)) is
   **strongly recommended first** (both touch `_theme-utils.scss`;
   running it first avoids conflicts). If it isn't done: flag it in the
   phase 0 report and get sign-off before continuing.

Branch: `refactor/theme-cvd-remap`.

### The target mechanism (design recap, part 1)

For each deficiency type, a **Tailwind family-remap table** with an
optional per-entry weight shift:

```scss
// Deuteranopia config (example — tables are calibration points, see phase 3)
"family-remap": (
  "emerald": ("sky", 0),    // greens become blues, weight preserved
  "redd": ("amber", 1),     // reds become ambers, +1 weight for contrast
),
```

Engine color resolution:

1. `analyze-tailwind-color()` finds (family, weight); if the family is in
   the table → `get-color(target-family, weight + shift)` (clamped to
   weights 50–950).
2. Otherwise, if the variable has an explicit `special-color` → use it
   (mechanism kept, takes priority over everything).
3. Otherwise (out-of-palette color) → **OKLCH fallback**: hue rotation
   toward the CVD type's safe anchor, at constant luminance and chroma
   (`color.change(..., $hue: …, $space: oklch)`).

**Anomalies** (-omalies, mild forms): the final color is a perceptual
blend between the original and the remapped version —
`color.mix(remapped, original, $severity, $method: oklch)` with
`"severity": 50%` by default (configurable). A single mechanism for the
6 non-monochrome color-blind themes, intensity makes the difference.

Achromatopsia is **not** affected (separate mechanism, kept as-is).

### Phase 0 — Preparation

Clean tree, branch, CSS baseline
(`/tmp/cvd-remap/phase0.css`), `pnpm build`/`lint`/`test` green. Check for
the presence of the contrast suite (`src/accessibility/contrast/`) and of
[CONTRAST-REPORT.md](./CONTRAST-REPORT.md) — otherwise, prerequisite 1
isn't met: stop.

### Phase 1 — CVD-simulation distinguishability tests (additive)

Extends the E1 system **before** touching the engines, to have the full
safety net in place. No modification of `src/styles/` in this phase.

1. **Simulation** (`src/accessibility/contrast/cvd-simulation.ts`):
   simulate the perception of each deficiency via the Machado et al. 2009
   matrices (severity 1.0 for the -opias, 0.5 for the -omalies). Don't
   reinvent the coefficients: use a proven library if available
   (`color-blind` on npm) or copy the matrices from the DaltonLens/Machado
   reference, citing the source in a comment. Unit tests: grays stay gray
   (matrix rows sum to ≈ 1), and 2-3 published reference values.
2. **Distinguishability rules**: a new `kind: "distinguishability"` in
   the registry — pairs that must stay *differentiable* under simulation,
   measured in CIEDE2000 ΔE (culori, `differenceCiede2000`):

   | Pair | Themes involved |
   | --- | --- |
   | `--success` / `--danger` | the 7 CVD themes |
   | `--accent` / `--danger` | same |
   | `--accent` / `--success` | same |
   | `--link` / `--success` | same (potential blue collision from the remap) |
   | `--link` / `--fg-base` | same (a link must stand out from text) |

   Starting threshold: **ΔE ≥ 20 under simulation** — a calibration
   point, to be adjusted during validation. Waiver mechanism identical to
   E1.
3. **First run = inventory on the current themes** (before the redesign):
   log the measured ΔE in the phase report — this is the comparison
   baseline that will prove the redesign improves (or not) each pair.

**Oracle**: byte-identical CSS vs phase 0.
**Commit**: `feat(theme): cvd phase 1 — simulation-based distinguishability tests`.

### Phase 2 — The remap engine (Sass)

In `_theme-utils.scss`:

1. New function `remap-for-cvd($color, $var-name, $config)` implementing
   the 3-step resolution above (+ the `severity` blend for anomalies).
   Weight clamped to [50, 950] after the shift, with `@warn` if clamping
   applies.
2. Rewrite the 6 `transform-light-to-{deuter,prot,trit}{anopia,anomaly}`
   mixins to use `remap-for-cvd` on the primitives (`$accent`,
   `$accent-strong`, `$accent-soft`, `$accent-ink`, `$link`, `$link-hover`,
   `$success`, `$danger`) — grays are never touched (behavior kept). Keep
   the existing config structure (`special-colors`, `overrides`); add
   `family-remap` and `severity`.
3. Remove the paths that become dead **only at the end of phase 4** (once
   nothing references them anymore): `adapt-color-for-colorblindness`,
   `adapt-color-for-color-anomaly`, `auto-*-transform`, `brightness`,
   `is-similar-to` (grep-check each name before removing).

**This phase's oracle**: CSS still byte-identical (the engine exists but
no theme uses it yet).
**Commit**: `feat(theme): cvd phase 2 — family-remap engine`.

### Phase 3 — Default tables and switching the 6 themes

1. If needed, **extend the palette** (`_base-palette.scss`) with
   additional Tailwind families (pure data, a risk-free addition:
   `orange`, `violet`, `cyan`…) to give the tables targets that don't
   collide with already-occupied families (`amber` = accent, `sky` =
   links).
2. Propose the default tables per theme. Suggested starting point
   (**calibration — final validation belongs to the tests and to
   review**):
   - deuteranopia / protanopia (red-green confusion):
     `emerald → sky (0)`, `redd → amber (+1)` — and if the measured
     `danger`/`accent` distinguishability is insufficient (two ambers),
     `redd → violet (0)` as a second option;
   - tritanopia (blue-yellow confusion): `sky → cyan`? no — target
     distinguishable families: `amber → orange (0)`, `sky → violet (0)`,
     `emerald` unchanged;
   - anomalies: same tables as their -opia, `severity: 50%`.
3. Wire the 6 theme files onto the new configs. The current
   `special-colors` (`#0075ff`, `#ffcc00`…) are **removed from the
   defaults** (the remap replaces them) — unless a measured ratio is
   better with them; in that case document it.
4. Purge dead paths (cf. phase 2.3).

**Expected CSS diff**: confined to the 6 color-blind `[data-theme]`
blocks; every changed value must be a Tailwind palette color (or an OKLCH
mix for the anomalies). Raw output in the report.
**Commit**: `refactor(theme): cvd phase 3 — default remap tables, switch themes`.

### Phase 4 — Verification and decisions

1. **Contrast suite**: the `preexisting` waivers tied to CVD colors (e.g.
   deuteranopia error `#ffcc00` at 1.45:1) should become *obsolete* — the
   anti-zombie mechanism will force their removal: this is the redesign's
   expected success. Any new waiver introduced by the redesign = a
   decision point to raise.
2. **Distinguishability suite** (phase 1): compare before/after ΔE per
   pair and per theme — table in the report.
3. Regenerate `CONTRAST-REPORT.md`.
4. **Visual validation** across the 6 themes (design requirement:
   "improve contrast without making it ugly") — provide screenshots or
   before/after comparison instructions.

**Commit**: `refactor(theme): cvd phase 4 — verification, waiver cleanup, report`.

### Phase 5 — Wrap-up

`pnpm build`/`lint`/`test`; docs (README § 4.3 and § 6, guide E2: redesign
done); summary changelog entry; final report (raw diffs, before/after ΔE
table, waivers removed/added, pending decisions).

### Out of scope for part 1 (do NOT do)

- The high-contrast engine and achromatopsia.
- The anti-glare engine (E2 chantier, separate plan).
- Any tweak to the light/dark theme or the roles.
- Export/packaging (E3+ chantiers).

---

## Part 2 — semantic anchors for status roles

> ✅ **Executed 2026-07-06** (branch `refactor/theme-status-anchors`,
> 5 commits), **merged 2026-07-06** (`5c8dce9`) after visual validation.
> Reference design:
> [GUIDE-package-extraction.md](./GUIDE-package-extraction.md) § E2 and
> README § 6.1. Two adjustments measured during execution, detailed in
> [CHANGELOG.md](./CHANGELOG.md): (1) the per-pair ΔE threshold field
> already existed (`minDeltaE`), no new `threshold` field to add;
> (2) the `severity` blend planned for the -omalies fell outside the sRGB
> gamut (OKLCH emerald+violet mix) — replaced with a resolution to a pure
> Tailwind color, the -omalies' softness coming from the anchor choice
> instead (natural emerald/redd hues kept).

**Origin.** Part 1 surfaced an issue: `role/success-on-bg-base` regressed
to 1.60:1 in deuter/protanopia, because a fixed weight shift
(`emerald → sky (-3)`) served two constraints at once — CVD
distinguishability *and* WCAG contrast — and sacrificed the second for
the first. Part 2 fixes the flaw by design, for the class of roles where
that's possible: the **status roles**, whose semantics are near-universal
from one project to another (green = OK, red = problem).

### ⛔ Blocking prerequisites (part 2)

1. **Part 1 must be merged** (done 2026-07-05): check for the presence of
   `remap-for-cvd` in `_theme-utils.scss` and of the distinguishability
   suite (`src/accessibility/contrast/cvd-simulation.ts`,
   `__tests__/distinguishability.test.ts`) — otherwise, stop.
2. `pnpm build`/`lint`/`test` green at the start.

Branch: `refactor/theme-status-anchors`.

### The target mechanism (part 2)

**Scope: status roles only** — `--success` and `--danger`.
(`--warning` and `--info` are reserved names for the future API, same
class and same mechanism when the day comes — **no code for them in this
chantier**.) Identity roles (`accent`, `link`, `focus-ring`…) remain
adapted by part 1's `family-remap` tables.

1. **Semantic anchors per CVD type** (domain knowledge shipped by the
   future package, established color-blind design conventions):
   - **red-green** deficiencies (deuteranopia, protanopia and their
     anomalies): `success` → **blue** anchor, `danger` → **orange** anchor
     (the blue/orange pair is the canonical safe duo);
   - **tritanopia/tritanomaly**: red and green stay well perceived — the
     status roles **keep their original families** (no change).

   The anchor points to a *family within the project's palette*
   (per-theme configuration, see phase 3) — never an out-of-palette
   color: design constraints #1 and #2 of the guide apply.

2. **Weight auto-resolved by the contrast constraint.** Hue comes from
   the anchor (distinguishability); weight is **computed**: the first
   step of the target family whose *final* color satisfies the WCAG text
   ratio (≥ 4.5:1) against the theme's `$bg-base`. Algorithm details:
   - light background (luminance > 0.5): walk weights from lightest (50)
     to darkest (950), keep the first compliant one; dark background:
     reverse direction. Explicit `@error` if no step passes;
   - for **anomalies**, the final color is the `severity` blend (part 1's
     mechanism, kept) — weight is resolved on the **blend's result**, not
     on the pure target color, otherwise the blend can drop back below
     the threshold (today's 2.33 waivers in -omalies come from this);
   - requires Sass functions `wcag-relative-luminance()` /
     `wcag-contrast-ratio()` (WCAG 2.x formula, `math.pow` for channel
     linearization). Cross-check in phase 4: ratios computed on the Sass
     side must match those measured by the TypeScript suite (same
     formula on both sides).

3. **ΔE thresholds per pair class** in the distinguishability suite. The
   single threshold (≥ 20) over-constrains the `link`/`success` pair:
   WCAG 1.4.1 already requires links to never rely on color alone
   (underline) — confusing a link's color with a status's isn't a
   failure of the same order as confusing success and danger. It's this
   over-weighting that produced the contrast-destroying `-3` shift in
   part 1.

### Phase 0 — Preparation

Clean tree, branch, CSS baseline (`/tmp/status-anchors/phase0.css`),
`pnpm build`/`lint`/`test` green, prerequisites checked.

### Phase 1 — ΔE thresholds per pair class (tests, additive)

No modification of `src/styles/` in this phase.

1. Add a `threshold?: number` field to the registry's `distinguishability`
   pairs (default: 20, behavior unchanged for unannotated pairs).
2. Proposed defaults (**calibration — final values are a decision**, to
   present in the phase report with the measured ΔE):

   | Pair | Proposed threshold | Justification |
   | --- | --- | --- |
   | `--success` / `--danger` | 20 (unchanged) | critical pair — the major failure |
   | `--accent` / `--danger` | 20 (unchanged) | status vs identity, meaning-carrying |
   | `--accent` / `--success` | 20 (unchanged) | same |
   | `--link` / `--success` | 12 | WCAG 1.4.1: link underlined, never color alone |
   | `--link` / `--fg-base` | 12 | same |

3. Document the WCAG 1.4.1 justification as a registry comment.

**Oracle**: byte-identical CSS vs phase 0.
**Commit**: `feat(theme): status-anchors phase 1 — per-pair-class ΔE thresholds`.

### Phase 2 — The status resolver (Sass)

In `_theme-utils.scss`:

1. `wcag-relative-luminance($color)` and `wcag-contrast-ratio($a, $b)`
   (exact WCAG 2.x formula, reference cited in a comment).
2. `resolve-status-color($color, $var-name, $config, $bg)`: reads the
   `"status-anchors"` config key (map `role → target family`); if the
   role is present → weight auto-resolved per the algorithm above
   (`severity` blend included for anomalies); otherwise → part 1's
   behavior unchanged (`remap-for-cvd`). `special-colors` remain a
   priority over everything (mechanism kept).
3. Wire the `$success`/`$danger` primitive resolution of the 6 CVD mixins
   onto `resolve-status-color` — **with no `status-anchors` key in any
   config at this stage**: the new path exists but nobody takes it yet.

**Oracle**: byte-identical CSS (no config declares an anchor).
**Commit**: `feat(theme): status-anchors phase 2 — status resolver, WCAG math in Sass`.

### Phase 3 — Switching the 4 red-green themes

1. In `_deuteranopia.scss`, `_deuteranomaly.scss`, `_protanopia.scss`,
   `_protanomaly.scss`: **remove the status entries from the
   `family-remap` tables** (`emerald → sky (-3)`, `redd → amber (+1)`)
   and add the anchor config. Starting point **measured 2026-07-06**
   (against main's compiled CSS, Machado simulation — a calibration
   point, final validation belongs to the tests and to review):

   ```scss
   "status-anchors": (
     "success": "violet",  // blue anchor; sky is taken by the link
     "danger": "orange",
   ),
   ```

   - `success` → violet, expected auto-weight **violet-600** (5.46:1 on
     `#fafaf9`; simulated ΔE: success/danger 59.5 (deuter) / 58.0
     (protan), success/link 18.0 / 18.1, success/accent 76.4 / 75.4).
     Why not `sky`, the "natural" blue anchor: the link is already
     sky-900, and sky-700 (the first step ≥ 4.5:1) would sit only at
     **ΔE 9.4** from the link under simulation — below every threshold.
     `violet` reads as blue under red-green CVD: the anchor is honored
     *within* the available palette.
   - `danger` → orange, expected auto-weight **orange-700** (4.96:1; ΔE
     danger/link 48.1 / 40.0, danger/accent 37.0 / 46.4). Alternative if
     the rendering is disliked: `amber` (+ auto-weight → amber-700, 4.81:1
     measured in part 1) — but amber is the accent's family, orange
     avoids the overlap.
   - anomalies: same anchors, `severity` kept — weight resolved on the
     blend (cf. the target mechanism).
2. **Tritanopia/tritanomaly: change nothing.** Explicitly verify that
   both tritan blocks of the compiled CSS are byte-identical to the
   baseline.

**Expected CSS diff**: confined to the 4 red-green `[data-theme]` blocks,
and only to properties derived from `success`/`danger`. Raw output in the
report.
**Commit**: `refactor(theme): status-anchors phase 3 — switch red-green themes`.

### Phase 4 — Verification and decisions

1. **Contrast suite**: the `role/success-on-bg-base` waiver should become
   *obsolete* for deuteranopia/protanopia (1.60:1 → ≥ 4.5:1 expected) —
   the anti-zombie mechanism will force its removal: this is part 2's
   expected success. Also check the -omalies entries (2.33 today). Any
   new waiver = a decision to raise.
2. **Sass/TypeScript consistency**: compare 3-4 ratios computed by
   `wcag-contrast-ratio()` (via `@debug` or a compile report) against the
   ratios measured by the suite — they must match up to rounding.
3. **Distinguishability suite**: before/after ΔE table per pair and per
   theme in the report; the per-class thresholds (phase 1) apply.
4. Regenerate `CONTRAST-REPORT.md`.
5. **Visual validation** across the 4 red-green themes ("improve contrast
   without making it ugly") — screenshots or before/after comparison
   instructions.

**Commit**: `refactor(theme): status-anchors phase 4 — verification, waiver cleanup, report`.

### Phase 5 — Wrap-up

`pnpm build`/`lint`/`test`; docs (README § 4.3 and § 6.1, guide § E2:
evolution implemented); summary changelog entry; final report (raw
diffs, before/after ΔE table, waivers removed/added, pending decisions).

**Commit**: `docs(theme): status-anchors phase 5 — finalization`.

### Out of scope for part 2 (do NOT do)

- `--warning` / `--info`: still reserved names, **no code** (no role, no
  anchor, no test) until the API defines them.
- The `family-remap` tables of identity roles (`accent`, `link`…) — only
  the status entries are removed.
- The tritan themes (statuses unchanged), achromatopsia, high-contrast,
  anti-glare.
- Any tweak to the light/dark theme or to non-CVD role values (light
  `success`'s 3.61:1 is a separate topic, not addressed here).
- Export/packaging (E3+ chantiers).

---

## Part 3 — robustness: graceful degradation, gamut guard, dev warning

> ✅ **Executed 2026-07-06** (branch `refactor/theme-cvd-degradation`),
> **merged 2026-07-06** (`5c8dce9`) after visual validation. Three
> measured deviations, detailed in [CHANGELOG.md](./CHANGELOG.md):
> (1) gamut-mapping uses Dart Sass 1.101's standard built-in
> `color.to-gamut(..., local-minde)` rather than a hand-rolled chroma
> reduction helper; (2) the anti-gamut guard inspects the **raw emitted
> string** (culori clamps at parse time, so it wouldn't detect
> out-of-gamut values); (3) the "color computed outside the palette" path
> (rung 2 of the ladder) was **not** built — measured as nearly useless
> (contrast dominated by lightness, palette already covering the full
> scale), the per-class policy asymmetry being carried by
> `special-colors` + the docs.
>
> **Origin.** Three findings from executing parts 1 and 2, agreed on.
>
> 1. **Warn rather than block.** Today `resolve-anchor-weight` does an
>    `@error` (hard compilation failure) if no weight reaches 4.5:1. For
>    a package consumer, breaking the build is too harsh: **best effort +
>    a warning** is better, letting the dev decide afterward. On CVD
>    themes, confusing `success` and `danger` is worse than `success` at
>    4:1: when contrast and distinguishability conflict, **prioritize
>    distinguishability**, while keeping a legibility floor.
> 2. **Stay within the palette for -omalies, allow stepping outside it
>    for -opias** — but *never* outside the sRGB gamut (an invalid
>    color). "Outside the palette" = a computed OKLCH color, valid and
>    in-gamut, outside the named Tailwind weights. The deficiency's
>    severity justifies the intervention's intensity.
> 3. **Tritanomaly's residual gamut issue.** Measured (2026-07-06): part
>    1's OKLCH `severity` blend `amber → orange` produces **11
>    out-of-gamut declarations** in the `tritanomaly` theme alone
>    (`--accent` = `hsl(38, 100.8%, 69%)`, `--accent-strong` =
>    `hsl(33.6, 103.8%, 48%)`, `--accent-soft` = `hsl(40.5, 103.4%, 90%)`,
>    and 8 layer-3 tokens derived from them). Same bug class as the one
>    eliminated for red-green in part 2, just more discreet (amber and
>    orange are close in hue). The link's `sky → violet` blend, though,
>    stays in-gamut.

Reference design: [GUIDE-package-extraction.md](./GUIDE-package-extraction.md)
§ E2 and README § 4.3 / § 6.1.

### ⛔ Blocking prerequisites (part 3)

1. **Part 2 must be merged**: check for the presence of
   `resolve-status-color` / `resolve-anchor-weight` and the Sass WCAG
   functions in `_theme-utils.scss` — otherwise, stop.
2. `pnpm build`/`lint`/`test` green at the start.

Branch: `refactor/theme-cvd-degradation`.

### The target mechanism (part 3)

**A. The "no out-of-gamut color" guarantee.** No value emitted in the
compiled CSS may fall outside the sRGB gamut (an out-of-gamut color =
invalid CSS, outside the palette, uncontrolled). This guarantee becomes
**mechanical** (test, phase 1) and **enforced** everywhere an OKLCH blend
could fall outside the gamut (phase 3).

**B. Status resolver degradation ladder**, from most desirable to last
resort, **aware of the deficiency class**:

1. **In-palette anchor**: the first Tailwind weight of the anchor family
   that reaches the target ratio (current `resolve-anchor-weight`
   behavior).
2. **-opia only — in-gamut color computed outside the palette**: if no
   in-palette weight reaches the ratio, compute an OKLCH color (hue
   rotation toward the CVD type's safe anchor, smoothed into the gamut,
   legibility weight resolved by luminance). Reserved for -opias: an
   -omaly never steps outside the palette (finding 2).
3. **Last resort — best effort + warning**: if even (1)/(2) don't reach
   the target ratio, return the **highest available contrast** color
   (never a hard failure), and `@warn` with an actionable message. If
   contrast falls **below the legibility floor** (proposed default
   **3:1** — *a decision*), flag it more strongly (a distinct message):
   below it, the color is nearly invisible and no amount of
   distinguishability redeems the illegibility.

**Important implementability note.** The Sass engine can only verify
**contrast** (computable at compile time). **Distinguishability** (does
an anchor collide with `--link` under simulation?) is only measurable
after compilation, by the TypeScript suite (Machado simulation). So:

- Rungs (2) and (3) of the ladder are triggered by **contrast** (what
  Sass can do). For the current palette (light background, step 950
  always reaches high contrast), these rungs **never** trigger — they
  are *latent*, a safety net for constrained consumer palettes, to be
  tested via a resolver unit test (a pathological background), not via a
  portfolio theme.
- The escape hatch for a **distinguishability collision** that in-palette
  anchors don't resolve remains the **`special-colors`** mechanism
  (already in place, priority): an explicit, in-gamut override, which
  **may** be outside the palette for an -opia and **must** stay within
  the palette for an -omaly (to document, phase 4). The distinguishability
  suite flags the collision; the dev (or the calibration) sets the
  `special-colors`.

**C. The warning is primarily carried by the report and the suite**, not
by the Sass `@warn` (which scrolls by in build logs and gets lost): the
`CONTRAST-REPORT.md` already marks below-threshold ratios (⚠) and the
contrast suite tracks shortfalls as documented waivers. The `@warn`
remains a compile-time hint; the source of truth for the dev is the
report + the tests. The "warn and track, don't block" philosophy is
already that of the waiver system — part 3 extends it to the
**compilation side**.

### Phase 0 — Preparation

Clean tree, branch, CSS baseline (`/tmp/cvd-degradation/phase0.css`),
`pnpm build`/`lint`/`test` green, prerequisites checked.

### Phase 1 — Anti-gamut guard (test, additive)

A safety net **before** touching the engines, like part 1's
distinguishability tests. No modification of `src/styles/`.

1. New test (`src/accessibility/contrast/__tests__/gamut.test.ts`,
   `/** @jest-environment node */`): for **every theme** and **every
   color custom property** emitted in the compiled CSS, parse the value
   (culori) and verify it's **within the sRGB gamut** — each RGB channel
   in [0, 1] within an epsilon (culori `inGamut("rgb")` or a direct
   channel comparison). Extend the extraction (`extract-themes.ts`) as
   needed to enumerate every `--x: …` property of a `[data-theme]` block,
   not just the ones in the pair registry.
2. **Waiver mechanism identical to E1** (anti-zombie): a known, documented
   out-of-gamut property is waived; if it comes back in-gamut, the waiver
   becomes obsolete and the test forces its removal.
3. **First run = inventory**: will log the **11 out-of-gamut declarations
   in `tritanomaly`** (3 root primitives — `--accent`, `--accent-strong`,
   `--accent-soft` — from the `amber → orange` blend, + 8 derived layer-3
   tokens). Waive them with `preexisting: true` and the cause (part 1's
   OKLCH blend): the test passes, the inventory is logged.

**Oracle**: byte-identical CSS vs phase 0.
**Commit**: `feat(theme): cvd-degradation phase 1 — sRGB gamut guard test`.

### Phase 2 — Graceful resolver degradation (Sass)

In `_theme-utils.scss`, **without changing the CSS emitted for the
portfolio** (the new rungs are latent, cf. the implementability note):

1. Replace `resolve-anchor-weight`'s `@error` with a **best effort**:
   track, throughout the loop, the weight with the highest ratio; if none
   reaches the target, return that best weight and `@warn` with an
   actionable message (role, family, best ratio obtained, background). If
   that best ratio is **< the legibility floor** (constant
   `$status-legibility-floor`, default 3, *a decision*), `@warn` with a
   distinct "nearly invisible" message.
2. Add the **-opia off-palette in-gamut** rung: a new
   `$allow-off-palette` parameter (true for -opias, false for -omalies,
   set at the call site depending on the theme). If true and no
   in-palette weight reaches the target, compute an OKLCH color via hue
   rotation toward `cvd-safe-anchor-hue($cvd-type)`, **brought back into
   the gamut** (helper `oklch-to-srgb-gamut`, cf. phase 3.1) and with
   luminance adjusted for the target. Document that this path is latent
   today.
3. **Configurable contrast target** (a side finding): pass the target
   (default 4.5) as a resolver parameter instead of hardcoding it, for
   future large-text/non-text uses of status roles. Default unchanged →
   no effect on current CSS.
4. **Resolver unit tests** (node, on the Sass functions via compiling a
   probe file, or CSS regression tests): cover the latent rungs with a
   pathological background (e.g. an anchor family unable to reach the
   target) — verify best effort + no hard failure + in-gamut.

**Oracle**: byte-identical CSS vs phase 0 (latent rungs not triggered).
**Commit**: `feat(theme): cvd-degradation phase 2 — graceful fallback, dev warning`.

### Phase 3 — Fixing the tritan gamut issue (Sass)

1. **`oklch-to-srgb-gamut($color)`** helper: brings a color back into the
   sRGB gamut via **OKLCH chroma reduction** (standard method: hue and
   lightness preserved, chroma reduced until the RGB channels are within
   [0, 255]) — better than a simple channel clamp, which distorts hue.
   Bounded loop in Sass; unit tests (a color already in-gamut is returned
   unchanged; an out-of-gamut color comes back in-gamut, hue preserved
   within a small delta).
2. Apply this helper to **the output of the `severity` blend** in
   `remap-for-cvd` (the only place producing out-of-gamut values today)
   — and, as a defensive consistency measure, to any OKLCH color
   construction in the engine that could fall outside the gamut.
3. Expected effect: the **11 out-of-gamut declarations in
   `tritanomaly`** come back in-gamut → phase 1's waivers become
   **obsolete**, the anti-zombie mechanism forces their removal (expected
   success).

**Expected CSS diff**: confined to the `[data-theme="tritanomaly"]` block
(3 primitives + 8 derived tokens); every value becomes an in-gamut color,
hue nearly unchanged (minor chroma reduction, ~1–4%). Raw output in the
report. **Real color change → visual validation required.**
**Commit**: `refactor(theme): cvd-degradation phase 3 — gamut-map the tritan blend`.

### Phase 4 — Verification and policy documentation

1. **Anti-gamut guard** (phase 1): no more out-of-gamut properties across
   the 12 themes; every phase 1 waiver removed (anti-zombie).
2. **Contrast / distinguishability suites**: unchanged and green; the
   tritan diff must not degrade any ratio or pair (before/after table in
   the report).
3. **Sass/TS consistency** of `oklch-to-srgb-gamut`: compare 2-3 colors
   brought in-gamut on the Sass side vs a reference culori implementation.
4. Regenerate `CONTRAST-REPORT.md`.
5. **Document the per-class palette policy** (README § 6.1 and guide
   § E2): -omaly = strictly in-palette; -opia = in-palette first,
   in-gamut off-palette color as a fallback; `special-colors` = the
   sanctioned escape hatch for distinguishability collisions (in-gamut;
   off-palette tolerated for -opia, not for -omaly).
6. **Visual validation** on `tritanomaly`.

**Commit**: `refactor(theme): cvd-degradation phase 4 — verification, waiver cleanup, docs`.

### Phase 5 — Wrap-up

`pnpm build`/`lint`/`test`; docs (README § 4.3 / § 6.1, guide § E2:
robustness implemented); summary changelog entry (degradation ladder,
gamut guard, tritan fix, legibility floor chosen); final report (raw
diffs, before/after gamut inventory, pending decisions).

**Commit**: `docs(theme): cvd-degradation phase 5 — finalization`.

### Decision points left open

- **Legibility floor** (proposed default 3:1): below it, `@warn` "nearly
  invisible" — value to validate.
- **Off-palette policy for -opias**: allowed (finding 2) — confirm, and
  confirm -omalies stay strictly in-palette.
- **Visual validation** of `tritanomaly` after the gamut fix.

### Out of scope for part 3 (do NOT do)

- **Sass-side distinguishability** (Machado simulation in Sass): out of
  scope — it stays verified by the TypeScript suite; the resolver only
  drives its degradation by contrast.
- `--warning` / `--info`: still reserved names, no code.
- High-contrast, achromatopsia, anti-glare, the light/dark theme.
- The red-green identity-role remap (unchanged) and part 2's red-green
  statuses (already in-palette, not touched).
- Export/packaging (E3+ chantiers).
