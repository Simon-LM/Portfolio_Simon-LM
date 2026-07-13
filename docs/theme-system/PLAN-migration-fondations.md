<!-- @format -->

# Migration plan — Theme system foundations (layers 1 & 2)

**Execution document meant for an AI.** It is self-contained: all
necessary context is here or in the referenced documents. Execute the
phases **in order**, one at a time, with verification and a commit at
each phase.

Context to read before starting:

- [README.md](./README.md) — in particular § 1 (principle), § 4 (detailed
  chain), and **§ 6 (target architecture: this is this plan's spec)**.
- `AGENTS.md` at the repo root — repository conventions (pnpm only,
  replies in French, **code comments in English**, SCSS 7-1,
  accessibility as a priority).

Goal: clean up the theme system and port it onto the target architecture
(full numeric rail + role layer), **with no visual change** with one
exception, documented in phase 6. This work precedes adding features and
extracting into a reusable package.

---

## General rules (apply throughout every phase)

1. **Branch**: create `refactor/theme-foundations` from `main`. One
   commit per phase, message `refactor(theme): phase N — <summary>`. Do
   not merge, do not force-push, do not deploy.
2. **The compiled CSS is the oracle.** Each phase defines its expected
   diff on the compiled CSS (see the protocol below). If the diff shows
   anything other than what's expected: **stop, don't force it, write a
   report**. Never "fix" a color value just to make a diff pass.
3. **Sass treats `-` and `_` as identical** in identifiers
   (`$color_main-bg` ≡ `$color-main-bg`). When searching, always grep
   both forms: `grep -rE 'color[_-]main[_-]bg'`.
4. **Do not touch**: `private/`, `packages/`, `coverage/`, `public/`, the
   i18n dictionaries, and anything unrelated to the theme system, unless
   a phase explicitly instructs otherwise.
5. **Changelog**: each phase adds its entry to
   [CHANGELOG.md](./CHANGELOG.md) (today's section, Added/Changed/Fixed/
   Removed categories), in the same commit as the phase.
6. Code comments in English. Do not add comments like "modified" / "new":
   the git diff already covers that.
7. When in doubt about an instruction: stop and ask, rather than guessing.
8. **Every phase report must include the raw output of the verification
   commands** (the `diff`, not a summary). A "clean" diff claimed without
   its output is worthless. If a diff shows line reordering, prove it's
   harmless via an order-insensitive comparison (`sort` both files then
   `comm -3`): no *value* may change.
9. `/** @format */` headers (Prettier pragma) are **not** historical
   comments: keep them in every file.

## Verification protocol (used by every phase)

```bash
# Reference snapshot (phase 0), then one snapshot per phase:
mkdir -p /tmp/theme-migration
pnpm exec sass --no-source-map --style=expanded src/styles/main.scss /tmp/theme-migration/phase<N>.css
```

- Deprecation warnings on stderr are normal until phase 5 (`@import` API,
  `darken()`, `/`…); they don't affect the produced file.
- Comparison: `diff /tmp/theme-migration/phase<N-1>.css /tmp/theme-migration/phase<N>.css`.
  When a phase renames CSS identifiers, first normalize the old snapshot
  with the `sed` commands the phase provides, then diff — the result must
  match **exactly** the diff the phase declares as expected.
- In addition, at every phase: `pnpm lint` and `pnpm test` must pass.
- `pnpm build`: at minimum at phases 0, 5, 6, 7, and 8.

---

## Phase 0 — Preparation and baseline

1. Check the working tree is clean (`git status`) and start from an
   up-to-date `main`. Create the `refactor/theme-foundations` branch.
2. Produce the reference snapshot:
   `/tmp/theme-migration/phase0.css` (protocol command).
3. Check that `pnpm build`, `pnpm lint`, and `pnpm test` pass **before**
   any modification. If they already fail: stop and write a report.

**Exit criterion**: baseline compiled, build/lint/test green, branch
created. (No commit — no modification.)

## Phase 1 — Dead code purge

Goal: remove historical strata so later phases work only on live code.

1. **Remove dead files** (not imported from `main.scss`):
   - `src/styles/abstracts/_variables.scss`
   - `src/styles/abstracts/_dark-functions.scss`
2. **Remove from `src/styles/abstracts/_theme-utils.scss`**:
   - the `transform-for-dark()` function (it references `$dark-adjustments`
     / `$tailwind-origins` maps that no longer exist);
   - every block of historical **commented-out code** (old versions of
     functions/mixins).
3. **Additional dead-code candidates** in `_theme-utils.scss` — check each
   one individually with
   `grep -rn "<name>" src/styles src/components src/app`: remove only if
   the only remaining occurrence is the definition itself (watch for
   chained calls: remove iteratively, recompiling between each):
   `generate-dark-theme`, `generate-high-contrast-theme`,
   `generate-deuteranopia-theme`, `generate-protanopia-theme`,
   `generate-tritanopia-theme`, `generate-achromatopsia-theme`,
   `transform-for-high-contrast`, `$hc-colors` (a duplicate of
   `$hc-palette`), `rgb-to-lms`, `lms-to-rgb`, `$protanopia-matrix`,
   `$deuteranopia-matrix`, `$tritanopia-matrix` (declared but never used
   in `adapt-color-for-colorblindness`), `safe-hue-for-keratoconus`,
   `get-deuteranopia-color`, `get-protanopia-color`, `get-tritanopia-color`,
   `get-deuteranomaly-color`, `get-protanomaly-color`,
   `get-tritanomaly-color`, `get-achromatic-color`, `str-replace`.
4. **Remove commented-out code blocks** (only commented-out *code* — keep
   explanatory comments) in:
   - `src/styles/themes/_dark.scss` (~85 lines at the top of the file),
     `_deuteranopia.scss`, `_protanopia.scss`, `_tritanopia.scss`,
     `_deuteranomaly.scss`, `_protanomaly.scss`, `_tritanomaly.scss`,
     `_achromatopsia.scss`, `_anti-glare-light.scss`, `_anti-glare-dark.scss`,
     `_light.scss`, `_high-contrast.scss`;
   - `src/styles/main.scss` (commented-out imports) and
     `src/styles/abstracts/_theme-system.scss` (commented-out lines);
   - `src/app/[lang]/layout.tsx`: the old commented-out `return` (~lines
     71–104);
   - `src/hooks/useTheme.ts` and
     `src/components/accessibilityMenu/AccessibilityMenu.tsx`: leftover
     commented-out code lines.
5. Clean up stray trailing commas at the end of Sass maps
   (`,,,,,,,,,,` in `_theme-utils.scss` and the theme files).

**Expected CSS diff**: none (byte-identical to phase 0).
**Commit**: `refactor(theme): phase 1 — remove dead code and legacy comments`.

## Phase 2 — Cleaning up the `setTheme()` runtime

File: `src/hooks/useTheme.ts`.

1. First check that no style depends on the temporary class:
   `grep -rn "theme-switching" src/` — expected: only in `useTheme.ts`. If
   a style uses it: stop and write a report.
2. In `setTheme()`, keep only:
   `document.documentElement.setAttribute("data-theme", newTheme)`,
   `localStorage.setItem("theme", newTheme)`, `setThemeState(newTheme)`.
   Remove: the two forced reflows (`void …offsetWidth/Height`), adding and
   removing the `theme-switching` class, the `setTimeout`, and the
   `console.log`s.

**Expected CSS diff**: none. **Check**: `pnpm lint`, `pnpm test`.
**Commit**: `refactor(theme): phase 2 — clean debug artifacts from setTheme`.

## Phase 3 — Layer 1: full numeric rail

Goal: rename the gray scale to Tailwind coordinates and restore the
missing step. Spec: README § 6.1.

### 3.1 Rename table (Sass variables AND config-key strings)

| Old name | New name |
| --- | --- |
| `$gray-lightest` / `"gray-lightest"` | `$gray-200` / `"gray-200"` |
| `$gray-lighter` / `"gray-lighter"` | `$gray-300` / `"gray-300"` |
| `$gray-light` / `"gray-light"` | `$gray-400` / `"gray-400"` |
| `$gray-medium-light` / `"gray-medium-light"` | `$gray-500` / `"gray-500"` |
| `$gray-medium-dark` / `"gray-medium-dark"` | `$gray-600` / `"gray-600"` |
| `$gray-dark` / `"gray-dark"` | `$gray-700` / `"gray-700"` |
| `$gray-darker` / `"gray-darker"` | `$gray-800` / `"gray-800"` |
| `$gray-darkest` / `"gray-darkest"` | `$gray-900` / `"gray-900"` |
| `"off-white"` (config key) | `"gray-50"` |
| `"near-black"` (config key) | `"gray-950"` |

Watch the order of text replacements: process `gray-lightest` before
`gray-lighter` before `gray-light` (shared prefixes).

### 3.2 Changes

1. **`src/styles/themes/_theme-variables.scss`**, `define-base-colors()`:
   define the 11 steps `$gray-50` … `$gray-950` from
   `get-color("stone", <weight>)` (the weight in the name = the Tailwind
   weight; `$gray-100: get-color("stone", 100)` is **new**). Hex value in
   a comment on each line. Then define the aliases:

   ```scss
   // Semantic aliases for the rail endpoints (kept for the ~35 component
   // call sites; re-synced after every theme transformation)
   $off-white: $gray-50 !global;
   $near-black: $gray-950 !global;
   ```

2. **Transform engines** (`_theme-utils.scss`,
   `_anti-glare-functions.scss`): everywhere an engine currently
   transforms `$off-white`, `$near-black`, and the 8 grays, it now
   transforms all **11** `$gray-50` … `$gray-950` variables (add the
   missing lines for `$gray-50`, `$gray-100`, `$gray-950` following the
   pattern of the existing ones), then **resync the aliases** right
   before `@include apply-theme-variables`:

   ```scss
   $off-white: $gray-50 !global;
   $near-black: $gray-950 !global;
   ```

   Engines involved: `transform-light-to-dark`,
   `transform-light-to-high-contrast`, `transform-light-to-achromatopsia`,
   `transform-theme-for-anti-glare`. (The color-blind engines don't touch
   grays — add nothing there.)
3. **Config keys** in `src/styles/themes/_dark.scss` and
   `_achromatopsia.scss`: rename per table 3.1 and **add**
   `"gray-100": 0` to the `adjustments` maps (new step; it isn't consumed
   by any derived variable, only `--gray-100` depends on it). In
   `_deuteranomaly.scss`, `_protanomaly.scss`, and `_tritanomaly.scss`:
   the `"gray-…"` keys present in the `adjustments` maps are **dead
   entries** (the anomaly engines don't transform grays) — remove them
   rather than renaming.
4. **CSS emission** (`_theme-system.scss`, `generate-theme-css-vars()`):
   replace the 8 `--gray-darkest` … `--gray-lightest` lines with the 11
   `--gray-50: #{$gray-50};` … `--gray-950: #{$gray-950};` lines.
   **Keep** `--off-white` and `--near-black` (emitted from the aliases —
   values unchanged, ~35 consumers).
5. **Component consumers** (5 occurrences): replace
   `var(--gray-lighter)` ×2, `var(--gray-medium-light)` ×1,
   `var(--gray-light)` ×1, `var(--gray-dark)` ×1 per the table (locate
   with `grep -rn "var(--gray-" src/styles src/components`).

### 3.3 Verification

Normalize phase2.css then compare. ⚠️ The order of the `sed` expressions
matters because of shared prefixes: process `lightest`/`lighter` and
`medium-*` **before** `light`, and `darkest`/`darker` **before** `dark`:

```bash
sed -e 's/--gray-lightest/--gray-200/g' -e 's/--gray-lighter/--gray-300/g' \
    -e 's/--gray-medium-light/--gray-500/g' -e 's/--gray-medium-dark/--gray-600/g' \
    -e 's/--gray-light/--gray-400/g' \
    -e 's/--gray-darkest/--gray-900/g' -e 's/--gray-darker/--gray-800/g' \
    -e 's/--gray-dark/--gray-700/g' \
    /tmp/theme-migration/phase2.css > /tmp/theme-migration/phase2-normalized.css
diff /tmp/theme-migration/phase2-normalized.css /tmp/theme-migration/phase3.css
```

**Expected diff**: only **additions** — the `--gray-50`, `--gray-100`,
`--gray-950` lines in each of the 13 theme blocks (`:root`, the
`prefers-color-scheme` block, the 12 `[data-theme]`). No existing value
changed. ⚠️ The added values must be the values **transformed by each
theme**, not the light values: if `--gray-50` equals `#fafaf9` in the
`dark`, `high-contrast`, or `achromatopsia` block, that means the
corresponding engine isn't transforming the new steps (a classic mistake).

**Additional targeted check** (a previous run failed exactly here) —
check in the compiled CSS:

- `[data-theme="high-contrast"]` block: `--color-main-bg: #000000` and
  `--color-main-text: #ffff00`, unchanged;
- `[data-theme="achromatopsia"]` block: values stay in the `neutral`
  family (`#fafafa`, `#0a0a0a`…), not `stone` (`#fafaf9`, `#0c0a09`);
- in every block, consistency between `--off-white` == `--gray-50` and
  `--near-black` == `--gray-950` (the aliases are resynced **after**
  transformation).

**Commit**: `refactor(theme): phase 3 — numeric gray rail (11 steps, adds gray-100)`.

## Phase 4 — Kebab-case and naming fixes (layer 3)

Reminder: `-` ≡ `_` for Sass, so this phase has **no effect** on the
compiled CSS, with one exception (point 3).

1. Across `src/styles/`, rename `$color_…` Sass variables to full
   kebab-case (`$color_header_blog-link_bg` →
   `$color-header-blog-link-bg`, etc.). Also standardize
   `$color_button_hover_bg` and similar ones.
2. Remove the **double assignments** that become visible after
   standardizing (`$color-main-bg`/`$color_main-bg`,
   `$color-main-text`/`$color_main-text`: the same variable assigned
   twice) — keep only one.
3. Fix the `texte` typo: variable `$color_portfolio-tag_bg-texte` →
   `$color-portfolio-tag-text`, **and** the emitted custom property
   `--color-portfolio-tag-bg-text` → `--color-portfolio-tag-text`. Update
   its consumers
   (`grep -rn "portfolio-tag-bg-text" src/`).

**Verification**: normalize phase3.css with
`sed 's/--color-portfolio-tag-bg-text/--color-portfolio-tag-text/g'` →
empty diff.
**Commit**: `refactor(theme): phase 4 — kebab-case layer-3 tokens, fix tag-text typo`.

## Phase 5 — Migrating to the modern Sass API

Goal: eliminate `@import` and deprecated functions. Prerequisite for the
future package's `@use … with ()` consumption mode (README § 6.2).

### 5.1 Anti-cycle prerequisite

Move `get-color()` (and the `$tailwind-weights` list + `$midpoint` if
needed by both files) from `_theme-utils.scss` to `_base-palette.scss`.
Reason: `_theme-variables.scss` needs `get-color()` and `_theme-utils.scss`
needs `_theme-variables.scss`'s state variables — without this move, the
`@use` graph would be circular (forbidden by Sass).

### 5.2 Target module architecture (acyclic)

```
_base-palette.scss      data ($colors) + get-color() — @use's nothing
themes/_theme-variables.scss   @use base-palette; ALL mutable state declared
                               at the module root + define/apply mixins
abstracts/_theme-utils.scss    @use sass:* + base-palette + theme-variables
abstracts/_anti-glare-functions.scss   same
themes/_<theme>.scss           @use theme-utils + theme-variables (+ anti-glare)
abstracts/_theme-system.scss   @use every theme
main.scss                      @use each partial, IN THE CURRENT ORDER of the
                               @import's (CSS emission order = the cascade)
```

Use `@use "…" as *;` everywhere (no namespaces): this phase's goal is a
mechanical migration, not a namespace re-architecture — that will come
with the package extraction.

### 5.3 Critical point: declaring state variables

Under `@use`, a `!global` assignment can no longer **create** a variable:
it must exist at the module root. So in `_theme-variables.scss`, declare
at the root **every** variable assigned by the mixins (the rail's 11
steps, the semantic colors, the aliases, and the ~70 layer-3 variables),
initialized to their light value:

```scss
// Module-level state — single source of mutable theme state.
// Mixins below re-assign these with !global during theme generation.
$gray-50: get-color("stone", 50); // #fafaf9
// … etc.
```

The `define-base-colors` / `apply-theme-variables` mixins keep
reassigning them with `!global` (behavior unchanged: light reset then
transformations).

### 5.4 Mechanical replacements (equivalence table)

Add the required `@use "sass:…"` at the top of the affected files.

| Deprecated | Replacement |
| --- | --- |
| `a / b` (division) | `math.div(a, b)` |
| `darken($c, X%)` | `color.adjust($c, $lightness: -X%)` |
| `lighten($c, X%)` | `color.adjust($c, $lightness: X%)` |
| `red($c)` / `green($c)` / `blue($c)` | `color.channel($c, "red", $space: rgb)` etc. |
| `hue($c)` / `saturation($c)` / `lightness($c)` | `color.channel($c, "hue", $space: hsl)` etc. |
| `map-get` / `map-has-key` / `map-merge` | `map.get` / `map.has-key` / `map.merge` |
| `index(…)` / `nth(…)` / `length(…)` | `list.index` / `list.nth` / `list.length` |
| `str-index` / `str-slice` / `str-length` | `string.index` / `string.slice` / `string.length` |
| `type-of` | `meta.type-of` |
| `max()`/`min()` on ambiguous Sass values | `math.max()`/`math.min()` if the compiler requires it |

### 5.5 Method and verification

Migrate file by file, recompiling often; fix "Undefined
variable/mixin/function" errors by adding the missing `@use`. Final goal:
compilation **with zero deprecation warning**
(`pnpm exec sass … 2>&1 | grep -ci deprecat` → 0).

**Expected CSS diff**: byte-identical to phase 4. (`color.adjust`
reproduces `darken` exactly; if a gap appears, it's a migration mistake.)
**Additional check**: a full `pnpm build`.
**Commit**: `refactor(theme): phase 5 — migrate to Sass module system (@use), drop deprecated APIs`.

## Phase 6 — Layer 2: introducing roles

Spec: README § 6.1 (the 23-role table). This is the only phase with an
authorized visual change (a single one, see 6.6).

### 6.1 Renaming semantic primitives

| Old | New | Also in config keys (`"…"`) and engine `@if` branches |
| --- | --- | --- |
| `$primary-color` | `$accent` | `"primary-color"` → `"accent"` |
| `$secondary-color` | `$accent-ink` | `"secondary-color"` → `"accent-ink"` |
| `$tertiary-color` | `$accent-soft` | `"tertiary-color"` → `"accent-soft"` |
| `$link-color` | `$link` | `"link-color"` → `"link"` |
| `$link-color-hover` | `$link-hover` | `"link-color-hover"` → `"link-hover"` |
| `$success-color` | `$success` | `"success-color"` → `"success"` |
| `$error-color` | `$danger` | `"error-color"` → `"danger"` |

New: `$accent-strong: get-color("amber", 500);` — to be transformed in
the engines exactly like `$accent` (duplicate the matching `@if
not(override)` blocks with the `"accent-strong"` key).

Manual overrides in the theme files must be renamed the same way (e.g.
`_dark.scss`: `$secondary-color: get-color("amber", 100)` becomes
`$accent-ink: get-color("amber", 100)`; likewise `$tertiary-color` →
`$accent-soft`).

### 6.2 Defining the roles

In `_theme-variables.scss`, add an `apply-roles()` mixin called by every
engine **after** the transform and **before**
`apply-theme-variables` (the same spot as the alias resync in phase 3):

```scss
// Layer 2 — role tokens (the future package's public API).
// Pure aliases of rail slots / color primitives: engines transform the
// rail, then roles and layer-3 tokens re-derive from it.
@mixin apply-roles() {
  $bg-base: $gray-50 !global;
  $bg-subtle: $gray-200 !global;
  $bg-container: $gray-300 !global;
  $bg-container-high: $gray-400 !global;
  $bg-emphasis: $gray-700 !global;
  $bg-emphasis-strong: $gray-800 !global;
  $bg-inverse: $gray-950 !global;
  $fg-base: $gray-950 !global;
  $fg-muted: $gray-700 !global;
  $fg-on-emphasis: $gray-50 !global;
  $fg-on-accent: $gray-950 !global;
  $border-subtle: $gray-500 !global;
  $border-base: $gray-600 !global;
  $border-strong: $gray-700 !global;
  $focus-ring: $link !global;
  // accent, accent-strong, accent-soft, accent-ink, link, link-hover,
  // success, danger are primitives transformed directly by the engines.
}
```

(Declare these variables at the module root, cf. phase 5.3. Any
theme-specific role overrides — if any — go between `apply-roles` and
`apply-theme-variables` in the theme's mixin.)

### 6.3 Full layer-3 rewiring (`apply-theme-variables`)

| Variable (kebab-case, phase 4) | New definition |
| --- | --- |
| `$color-main-bg` | `$bg-base` |
| `$color-main-text` | `$fg-base` |
| `$color-pages-title` | `$fg-base` |
| `$color-header-bg` | `$accent` |
| `$color-header-text` | `$fg-on-accent` |
| `$color-header-text-role` | `$fg-muted` |
| `$color-header-blog-link-bg` | `$bg-emphasis` |
| `$color-header-blog-link-text` | `$accent` |
| `$color-lang-toggle-bg` | `$bg-base` |
| `$color-lang-toggle-border` | `$border-strong` |
| `$color-lang-toggle-bg-activated` | `$bg-emphasis` |
| `$color-lang-toggle-text-activated` | `$fg-on-emphasis` |
| `$color-lang-toggle-text-disabled` | `$fg-muted` |
| `$color-lang-toggle-disabled-hover-bg` | `$link` |
| `$color-lang-toggle-disabled-hover-text` | `$fg-on-emphasis` |
| `$color-scroll-progress-line` | `$link` |
| `$color-scroll-progress-indicator` | `$border-base` |
| `$color-scroll-progress-indicator-active` | `$link` |
| `$color-collapse-title` | `$fg-on-emphasis` |
| `$color-collapse-bg` | `$bg-container` |
| `$color-collapse-bg-title` | `$bg-emphasis` |
| `$color-collapse-border` | `$border-strong` |
| `$color-section-bg-even` | `$bg-base` |
| `$color-section-bg-odd` | `$bg-subtle` |
| `$color-section-title` | `$accent-ink` |
| `$color-hero-bg` | `$bg-base` |
| `$color-hero-title` | `$fg-base` |
| `$color-hero-text` | `$fg-base` |
| `$color-about-overlay-bg` | `$bg-inverse` |
| `$color-about-overlay-text` | `$fg-on-emphasis` |
| `$color-about-button-bg` | `$link` |
| `$color-about-button-border` | `$fg-on-emphasis` |
| `$color-about-button-text` | `$fg-on-emphasis` |
| `$color-skills-icon-bg` | `$accent-soft` |
| `$color-skills-icon-text` | `$accent-ink` |
| `$color-skills-presentation-link-hover-bg` | `$link` |
| `$color-skills-presentation-link-hover-text` | `$fg-on-emphasis` |
| `$color-section-card-bg` | `$bg-container` |
| `$color-section-even-card-bg` | `$bg-container` |
| `$color-section-odd-card-bg` | `$bg-container-high` |
| `$color-portfolio-tag-bg` | `$accent-soft` |
| `$color-portfolio-tag-text` | `$accent-ink` |
| `$color-contact-form-bg` | `$bg-container` |
| `$color-contact-modal-bg` | `$bg-subtle` |
| `$color-bottom-footer-bg` | `$bg-emphasis` |
| `$color-bottom-footer-title` | `$accent-soft` |
| `$color-bottom-footer-text` | `$fg-on-emphasis` |
| `$color-bottom-footer-link-bg` | `$bg-base` |
| `$color-bottom-footer-link-text` | `$link` |
| `$color-sticky-footer-bg` | `$bg-emphasis-strong` |
| `$color-sticky-footer-text` | `$fg-on-emphasis` |
| `$color-link` | `$link` |
| `$color-link-hover` | `$link-hover` |
| `$color-link-bg` | `$bg-base` |
| `$color-focus-outline` | `$focus-ring` |
| `$color-focus-bg` | `$focus-ring` |
| `$color-focus-text` | `$fg-on-emphasis` |
| `$color-tooltip-text` | `$fg-on-emphasis` |
| `$color-tooltip-bg` | `rgba($bg-inverse, 0.9)` |
| `$color-panel-bg` | `$bg-base` |
| `$color-panel-border` | `$border-base` |
| `$color-scrollbar-track` | `$bg-base` |
| `$color-scrollbar-thumb` | `$border-subtle` |
| `$color-button-border` | `$border-subtle` |
| `$color-button-hover-bg` | `$link-hover` *(see note below)* |
| `$color-button-hover-text` | `$fg-on-emphasis` |
| `$color-button-active-text` | `$fg-base` |
| `$color-button-active-outline` | `$accent` |
| `$color-border` | `$border-subtle` |
| `$color-accent` | `$accent` |
| `$color-accent-hover` | `$accent-strong` *(the only visual change — cf. 6.6)* |

> **Note on `--color-button-hover-bg`**: pre-existing inconsistency —
> `apply-theme-variables` defines `rgba($primary-color, 0.1)` but the CSS
> emission uses `$link-color-hover` directly (so that's the effective
> value). Align the Sass variable with the **effective** value
> (`$link-hover`) and emit from the variable. Likewise
> `--color-button-hover-text` (effective: off-white → `$fg-on-emphasis`)
> and `--color-button-active-text` (effective: near-black → `$fg-base`).
> Result: zero change to the emitted value, but a single source.

### 6.4 CSS emission

In `generate-theme-css-vars()`:

1. Rename: `--primary-color` → `--accent`, `--secondary-color` →
   `--accent-ink`, `--tertiary-color` → `--accent-soft`, `--link-color` →
   `--link`, `--link-hover-color` → `--link-hover`.
2. Add emission of the remaining roles: `--accent-strong`, `--bg-base`,
   `--bg-subtle`, `--bg-container`, `--bg-container-high`, `--bg-emphasis`,
   `--bg-emphasis-strong`, `--bg-inverse`, `--fg-base`, `--fg-muted`,
   `--fg-on-emphasis`, `--fg-on-accent`, `--border-subtle`, `--border-base`,
   `--border-strong`, `--focus-ring`, `--success`, `--danger`.
   (`--success`/`--danger` are the *themed* values — the existing
   `--constant-success-color`/`--constant-error-color` don't change.)
3. Update the consumers of the renamed variables:
   `var(--primary-color)` ×11, `var(--link-color)` ×6,
   `var(--link-hover-color)` ×4 (locate via grep; no consumer of
   `--secondary-color`/`--tertiary-color`).

### 6.5 Engines

No algorithm change. Only: the renames from 6.1, adding handling for
`$accent-strong`, inserting `@include apply-roles;` between the
transform and `apply-theme-variables` in every engine (and in
`light-theme-variables`).

### 6.6 Verification

Normalizing phase5.css:

```bash
sed -e 's/--primary-color/--accent/g' -e 's/--secondary-color/--accent-ink/g' \
    -e 's/--tertiary-color/--accent-soft/g' -e 's/--link-hover-color/--link-hover/g' \
    -e 's/--link-color/--link/g' \
    /tmp/theme-migration/phase5.css > /tmp/theme-migration/phase5-normalized.css
```

(Order matters: `--link-hover-color` before `--link-color`.)

**Expected diff**:
- additions: the new role custom properties in the 13 blocks;
- **a single value change**: `--color-accent-hover` goes from
  `darken(amber-300, 15%)` to `amber-500` (`#f59e0b`) and its transformed
  equivalents in the other themes. This is the deliberate replacement of
  an arbitrary `darken()` with a rail step (README § 6.1). Any **other**
  value difference = a mistake, stop.

**Additional check**: `pnpm build` + a visual check (see phase 8).
**Commit**: `refactor(theme): phase 6 — introduce layer-2 role tokens`.

## Phase 7 — Single source of truth for the theme list (runtime)

Goal: eliminate the triple duplication of the 12-theme list.

1. Create `src/config/themes.ts`:

   ```ts
   /** @format */
   // Single source of truth for the theme list.
   // NOTE: the SCSS [data-theme] blocks in src/styles/abstracts/_theme-system.scss
   // must stay in sync manually until the system is extracted as a package.
   export const THEMES = [
     "light",
     "dark",
     "anti-glare-light",
     "anti-glare-dark",
     "high-contrast",
     "deuteranomaly",
     "deuteranopia",
     "protanomaly",
     "protanopia",
     "tritanomaly",
     "tritanopia",
     "achromatopsia",
   ] as const;

   export type ThemeOption = (typeof THEMES)[number];
   ```

2. `src/hooks/useTheme.ts`: remove the local type and `VALID_THEMES`,
   import `THEMES`/`ThemeOption` (adapt the `includes` calls with a
   `readonly string[]` cast if needed).
3. `src/app/[lang]/layout.tsx`: in the anti-FOUC script, replace the
   hardcoded list with an injection:
   `if (savedTheme && ${JSON.stringify(THEMES)}.includes(savedTheme))`
   (import `THEMES` at the top of the file — a server component, fine).
4. `AccessibilityMenu.tsx`: replace the inline cast union in
   `handleColorVisionChange` with `ThemeOption`.
5. Add a sync comment at the top of the `[data-theme]` block list in
   `_theme-system.scss` pointing to `src/config/themes.ts`.

**Expected CSS diff**: none. **Check**: `pnpm build`, `pnpm lint`,
`pnpm test`; check in the generated HTML (or in dev) that the inline
script does contain the 12 themes.
**Commit**: `refactor(theme): phase 7 — single source of truth for theme list`.

## Phase 8 — Wrap-up

1. **Global verification**: `pnpm build`, `pnpm lint`, `pnpm test`.
   Visual check: `pnpm dev`, open the site, cycle through all **12
   themes** via the accessibility menu and check for no glaring anomaly
   (the only expected difference: the accent hover, phase 6.6). If
   `pa11y` can be run (app running): `pnpm test:a11y`.
2. **Documentation** — update `docs/theme-system/README.md`:
   - § 3: remove the deleted files from the "dead code" table (mark
     "purged on <date>"); add `src/config/themes.ts` to the runtime
     table;
   - § 4: update the names (`$gray-50…950`, roles, `apply-roles`) and the
     § 1 diagram if needed;
   - § 5: mark the resolved findings (#1, #4 partially, #5, #6, #7, #8,
     #11 partially) with "*(resolved — see the <date> CHANGELOG)*"
     without deleting them;
   - § 6.4: note that trajectory steps 1–2 are done.
3. **Changelogs**: check that every phase has its entry in
   `docs/theme-system/CHANGELOG.md`; add a summary entry to the global
   `CHANGELOG.md` (at the root).
4. **Final report**: phases completed, CSS diffs observed phase by phase,
   any deviations from the plan, points left open.

**Commit**: `docs(theme): phase 8 — update documentation after foundations migration`.

---

## Out of scope (do NOT do in this migration)

- Declarative rewrite of the high-contrast engine onto roles (next
  chantier — needs human visual validation).
- Automated WCAG contrast tests on role pairs (next chantier).
- Extraction into a pnpm workspace / packaging (trajectory step 3).
- Any "opportunistic" tweak outside the theme system (components, i18n,
  SEO…).
- Renaming the palette's `redd` family (the double d avoids the collision
  with the CSS keyword `red` — choice kept).
- Fixing `src/styles/pages/_contact.scss` line ~143:
  `rgba(var(--color-gray-dark), 0.1)` references a custom property that
  **never** existed (and the `rgba(var(--hex), a)` syntax would be
  invalid anyway) — a dead declaration predating this migration. **Do not
  fix it**; mention it in the final report (a decision to make
  separately).
