<!-- @format -->

# Extraction guide — from in-situ component to open-source package

**Orientation document for an AI (or a dev) tasked with turning the
portfolio's accessibility preferences system into a reusable package.**
It gives the broad strokes, the chantier order, and decisions already
made; each chantier must get its own detailed execution plan (following
the model of
[PLAN-foundations-migration.md](./PLAN-foundations-migration.md)) before it
starts.

Required reading beforehand: [README.md](./README.md) § 6 (target
architecture decided: 3-layer model, scope § 6.2, hybrid distribution
§ 6.3, expansion to the preferences system § 6.5). Repo conventions:
`AGENTS.md`. Every change is logged in [CHANGELOG.md](./CHANGELOG.md).

## Non-negotiable principles

1. **The portfolio's compiled CSS stays the oracle** throughout the
   extraction: at every step, the portfolio consuming the package must
   produce CSS identical (or with the explicitly expected diff) to before
   the step.
2. **The portfolio is the first consumer**: every package API is
   validated by migrating the portfolio onto it, never designed in a
   vacuum.
3. **Nothing gets published without the contrast tests** (dedicated
   chapter below): they protect every engine rewrite.
4. Public positioning: this component is a **first-party preferences
   system built into the site** — never present it with "accessibility
   overlay" language (automatic third-party widgets, very poorly regarded
   by the accessibility community, cf. overlayfactsheet.com).

## Starting point (post-foundations, 2026-07-03)

Foundations migrated (11-step numeric rail, layer-2 roles, `@use` Sass
modules, single source for the theme list `src/config/themes.ts`).
Still in-place, to do **before** the extraction:

- **Contrast testing system** (chapter below) — protects everything else.
- **Review/optimization of the anti-glare and color-blind engines**
  (findings from 2026-07-03 in the CHANGELOG; including: double
  anti-glare transformation of layer-3 tokens, unused `$intensity`
  parameter, malformed `if()` expression in the error branch,
  non-configurable enhance-factor for the -opias, `backdrop-filter`
  overlay to evaluate/measure).
- The **declarative rewrite of the high-contrast engine** onto roles can
  wait until the extraction itself (it's only worth doing once the
  engines are generalized) — decision 2026-07-03.

## Target

pnpm monorepo inside this repo, then public npm publication (open-source
project — decision 2026-07-03).

```
pnpm-workspace.yaml
packages/<name>/                  # name: decision in progress (a11y-prefs planned)
├── package.json                 # exports: ".", "./scss", "./react", "./fonts", "./testing"
├── LICENSE                      # code license (MIT recommended)
├── scss/
│   ├── _palette.scss            # Tailwind palettes + get-color()
│   ├── _rail.scss               # $gray-50…950, 11-weight geometry
│   ├── _roles.scss              # the ~23 roles (public API) + !default
│   ├── engines/                 # dark, high-contrast, color-blind, anti-glare
│   └── _emit.scss               # generate-theme-css-vars + à-la-carte [data-theme] blocks
├── react/
│   ├── core.ts                  # preferences core: persistence + DOM application + SSR
│   ├── themes.ts                # theme list (single source, generated toward SCSS or checked)
│   ├── anti-fouc.ts             # inline script generator
│   └── useTheme.ts, usePreference.ts
├── fonts/                       # @font-face + files (opt-in module)
│   └── LICENSES/                # one license PER font (distinct from the code's)
├── cli/                         # init (UI + config scaffolding), init --diff
├── templates/                   # AccessibilityMenu (trigger + card) copied by init
├── testing/                     # contrast test runner (exported)
└── examples/                    # commented layer 3 (portfolio recipes)
```

## The chantiers, in order

### E1 — Contrast testing system (in-situ, before anything else) — ✅ done 2026-07-04

Execution plan: [PLAN-contrast-tests.md](./PLAN-contrast-tests.md).
Design: dedicated chapter at the end of this document. Shipped first
inside the portfolio (`pnpm test`), moved later into the package's
`testing/`. **Purely additive** chantier: pre-existing failures become
documented waivers for review, no color is fixed.

Result: `src/accessibility/contrast/` (WCAG utilities, extraction of the
12 `[data-theme]` blocks, a 40-pair registry, a Jest suite, a report
generator), [CONTRAST-REPORT.md](./CONTRAST-REPORT.md) generated and
committed. 33 failures measured on the first run, grouped into 7 waived
pairs (`preexisting: true`, measured ratio + factual reason) — awaiting
review (see the CHANGELOG phase 5 for the list sorted by severity).
Compiled CSS stayed strictly byte-identical from start to finish.

### E2 — Anti-glare / color-blind engine review (in-situ) — ✅ done (merged 2026-07-05)

Execution plan: [PLAN-engine-review.md](./PLAN-engine-review.md)
(mechanical fixes: single-pass full-coverage anti-glare, configurable
`enhance-factor`, cruft). Every value change is validated by the contrast
tests (E1, ideally shipped first) + visual validation. Output: stable
engines, ready to be frozen into an API.

Result (branch `refactor/theme-engines`, merged): phase 1 (API/dead-code
fixes, byte-identical CSS — one plan item, the `if()` syntax, was NOT
applied as written since it introduced a regression with Dart Sass 1.101,
see CHANGELOG); phase 2 (single-pass anti-glare, coverage of the ~45
tokens previously never attenuated); phase 3 (anti-glare engine rewritten
in OKLCH, light threshold recalibrated from 92% to 85% to stay close to
the previous HSL rendering, dark threshold unchanged); phase 4
(`backdrop-filter` overlay removed, effect measured as negligible).
Cumulative CSS diff strictly confined to the `anti-glare-light`/
`anti-glare-dark` blocks, `CONTRAST-REPORT.md` kept up to date at every
color-changing phase. Visual validation done, branch merged into main.

**Mechanism evolutions — decided 2026-07-03**, with the design
constraints below, which take priority:

- **Constraint #1 — the system is anchored to Tailwind palettes.** The
  component's visual coherence relies on Tailwind-geometry palettes
  (11 well-spaced weights, well-separated families). Consumers who
  customize **must adopt this palette mechanism** (contract already
  written into README § 6.1). "Too similar" colors are therefore avoided
  *by construction*, upstream of the engines.
- **Constraint #2 — the adaptation must not make things ugly.** The goal
  of the color-blind themes is to improve perceived contrast **without
  making the site ugly**: stay as much as possible *within* the palettes
  (the historical mechanism's hue grouping was partly intentional, to
  lighten the visual weight).

Evolutions decided, reworded under these constraints:

1. **OKLCH instead of HSL** for the transforms (anti-glare: folded into
   [PLAN-engine-review.md](./PLAN-engine-review.md), phase 3;
   color-blind: in the redesign below). HSL "lightness" isn't perceptual;
   OKLCH allows adapting hue **at constant luminance**, so without
   degrading WCAG contrast ratios.
2. **Constant-weight Tailwind family remap** rather than free hue
   anchors: for each CVD type, a configurable `family → family` table
   (e.g. deuteranopia: `emerald → sky`, `redd → amber`), with **weight
   preserved**. This is the synthesis of the constraints and the need for
   distinguishability: we stay within the palettes (beautiful by
   construction, consistent with the rail's philosophy), Tailwind
   luminance at equal weight is *close* from one family to another (but
   not constant — see the safeguards below), and a family's internal
   distinctions survive (two greens of different weights become two
   blues of different weights — where hue windows used to crush them
   down to a single value). OKLCH is only used as a **fallback** for
   out-of-palette colors.

   ⚠️ The constant-weight remap does **not** guarantee ratios on its own:
   Tailwind luminance is *not* constant across families at equal weight
   (measured 2026-07-03: at weight 600, luminance 0.167 for `redd` →
   0.280 for `amber`; `redd-600→amber-600` on a light background drops
   the ratio from 4.62:1 to **3.05:1**). Two safeguards are part of the
   mechanism: (a) **per-table-entry weight shift**, like dark's
   `adjustments` (e.g. `redd → amber(+1)`: amber-700 → 4.81:1); (b)
   **default tables aware of collisions** — don't remap onto a family
   already occupied by another role at a nearby weight (e.g. deuteranopia
   `emerald → sky` renders success blue like `link`: to be settled by a
   weight shift or by picking a different target family). The final
   guarantee **never** comes from the generator: it comes from the E1
   verification (WCAG ratios + simulated distinguishability). Note: the
   current `special-colors` have the same problem lying dormant
   (deuteranopia: error `#ffcc00` = **1.45:1** on a light background —
   harmless today since `--danger` is consumed nowhere, but the first
   trap for the published package).
3. **CVD-simulation distinguishability tests** in the E1 system: besides
   WCAG ratios, simulate each deficiency (Brettel/Viénot matrices — the
   ones removed as dead code during the foundations belonged *here*, on
   the test side) on the themes' final colors, and verify that
   meaning-carrying pairs (`success`/`danger`, `accent`/`link`…) stay
   above a perceived-difference threshold (ΔE). This is what makes the
   mechanism *demonstrable* for any consumer palette: generation can stay
   heuristic as long as verification is systematic.

**Sequencing**: the mechanical fixes and the OKLCH anti-glare work are
covered by [PLAN-engine-review.md](./PLAN-engine-review.md), executable
right away; the color-blind redesign (points 2 and 3) waits for the E1
chantier (the distinguishability tests are its safety net) and will get
its own plan.

**Color-blind redesign — executed 2026-07-04, merged 2026-07-05
(`d12264f`) after visual validation and independent review** (branch
`refactor/theme-cvd-remap`, plan
[PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md), 5 phases,
one commit each): `remap-for-cvd()` implements exactly the mechanism
described above (weight-shifted family-remap, OKLCH fallback, weight and
collision safeguards measured rather than guessed); CVD-simulation
distinguishability tests (Machado et al. 2009 matrices, not
Brettel/Viénot as considered earlier — equivalent in spirit, published
measurements simpler to source without network access) shipped in phase
1, before any color switch, as planned. Result summary: the historical
worst case (`#ffcc00` at 1.34:1 in protanopia) is resolved,
`role/danger-on-bg-base` goes from 6 waived color-blind themes to 0;
`distinguish/success-vs-danger` (the only distinguishability failure in
the phase-1 inventory, tritanopia ΔE 6.81) is resolved at ΔE 69.66. The
issue surfaced during execution —
`role/success-on-bg-base` regressed in WCAG contrast across 4 themes (as
low as 1.60:1), the calibration having prioritized CVD distinguishability
— led to the "semantic anchors" decision below, which resolves it by
design. Full details, before/after tables and raw diffs:
see [CHANGELOG.md](./CHANGELOG.md).

**Semantic anchors for status roles — decided 2026-07-06,
✅ implemented and merged 2026-07-06 (`5c8dce9`)** (plan
[PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md) part 2,
branch `refactor/theme-status-anchors`, visual validation done;
`resolve-status-color` resolver in
`_theme-utils.scss`, -opias → violet-600/orange-700, -omalies →
emerald-700/redd-600, all ≥ 4.5:1). The `success` case at 1.60:1
revealed a design flaw in the remap for a specific class of roles: a
fixed weight shift serves two constraints at once (CVD distinguishability
*and* WCAG contrast), and ends up sacrificing one for the other. The
decision made exploits a property that was pointed out: **status** roles
— `--success` and `--danger` today, `--warning` and `--info` reserved for
future API extension, same class, same mechanism — carry near-universal
semantics (green = OK, red = problem, comparable "temperatures" from one
project to another). The package can therefore embed real domain
knowledge for them, where it has no such legitimacy on identity roles
(`accent`, `link`…):

1. **Hue anchors per CVD type, shipped by the package** — established
   color-blind design conventions: under red-green deficiency
   (deuter/protanopia and anomalies), `success` migrates to a **blue**
   anchor and `danger` to an **orange** anchor (the blue/orange pair is
   the canonical safe duo); under tritanopia, red and green stay well
   perceived — the status roles keep their families, it's the blue/yellow
   pair that needs splitting apart (already covered by the tables).
   Resolution stays **within the project's palette**: the anchor points
   to the consumer's closest family (configurable), never an
   out-of-palette color — constraints #1 and #2 respected.
2. **Weight auto-resolved by the contrast constraint**: hue is chosen by
   the anchor (distinguishability), weight is computed — the first step
   of the target family that reaches the required WCAG ratio against the
   theme's background (relative luminance computable in Sass at compile
   time). The two constraints are decoupled: a status role can no longer
   fall below the threshold by construction.
3. **ΔE thresholds per pair class** in the distinguishability suite:
   `success`/`danger` is the critical pair (confusing the two is the
   major accessibility failure) and keeps a high threshold; `link`/status
   can carry a reduced threshold — WCAG 1.4.1 already requires links to
   never rely on color alone (underline), so link/status confusion isn't
   a failure of the same order. It's this over-weighting of
   `link`/`success` that had pushed the calibration toward the
   contrast-destroying shift. Threshold values: decided at plan time.

The status entries of the `family-remap` tables (e.g. `emerald → sky
(-3)`) will disappear in favor of this mechanism; the tables remain for
identity roles, and the E1 + ΔE suite remains the final guarantee on each
consumer's actual palette.

**Robustness — ✅ implemented and merged 2026-07-06 (`5c8dce9`)** (plan
[PLAN-colorblind-redesign.md](./PLAN-colorblind-redesign.md) part 3,
branch `refactor/theme-cvd-degradation`, visual validation done): three
guarantees stemming from parts 1-2.

1. **Mechanical anti-gamut guard** (`gamut.test.ts`): no emitted color
   falls outside the sRGB gamut, across the 12 themes. It found and fixed
   **11 out-of-gamut declarations** in `tritanomaly` (part 1's OKLCH
   `amber → orange` mix), brought back in-gamut via standard chroma
   reduction (`gamut-map-srgb` → `color.to-gamut(..., local-minde)`),
   negligible perceptual gap (ΔE < 1).
2. **Graceful degradation**: `resolve-anchor-weight` no longer breaks the
   build (`@error` → best effort + `@warn`), with a legibility floor
   (default 3:1). A latent path for the portfolio, robustness for
   consumer palettes.
3. **Per-class palette policy** (README § 6.1): -omaly strictly
   in-palette; -opia allowed one in-gamut out-of-palette color;
   `special-colors` = the sanctioned escape hatch for distinguishability
   collisions (not computable in Sass). Measured, accepted deviation: the
   automatic "color computed outside the palette" path was **not** built
   (with contrast dominated by lightness and the palette already covering
   the full scale, it would be nearly useless).

### E3 — Monorepo and extracting the SCSS side — ✅ executed 2026-07-07

**Plan: [PLAN-extraction-monorepo.md](./PLAN-extraction-monorepo.md)**
(6 phases, branch `feat/e3-monorepo`, reviewed before merge). Result: the
pnpm workspace exists, `packages/a11y-prefs/scss/` holds the palette,
state (layers 1+2, configurable via `with($gray-family, $primitives)`),
engines, and anti-glare; the portfolio keeps only its layer 3, its 12
theme files (= configs), and the assembly. Dependency inversion achieved:
the engines stop at the roles. CSS identical (modulo duplicated
`/** @format */` pragmas, documented). The full `$roles`/`$themes`
registry remains for a later iteration, as planned.

`pnpm-workspace.yaml`, creating the package, moving
palette/rail/roles/engines/emitter. The portfolio consumes it:

```scss
@use "<name>/scss" with (
  $gray-family: "stone",
  $roles: (…),            // the portfolio's current assignments
  $themes: (…)            // the 12, à la carte for other projects
);
```

Everything configurable carries `!default`. Oracle: identical CSS.

### E4 — Extracting the React runtime — ✅ executed 2026-07-07

**Plan: [PLAN-extraction-runtime.md](./PLAN-extraction-runtime.md)**
(4 phases, branch `feat/e4-runtime`, smoke test + review before merge).
Result: `packages/a11y-prefs/react` exposes `THEMES`/`ThemeOption`,
`useTheme` (parameterizable, default = the 12), `usePrefersDarkMode`, and
`themeInitScript()` (anti-FOUC string byte-identical to the historical
literal); the portfolio files are re-export shims (zero churn). Execution
lesson: the RSC boundary — the hook now carries `"use client"` and the
package exposes granular `./react/*` exports so data modules remain
importable server-side. The **`usePreference(key, applyFn)`
generalization** below stays deferred to E5, where the other preferences
will need it.

The preferences core (localStorage persistence, DOM application,
anti-FOUC, SSR safety) becomes generic: `usePreference(key, applyFn)`;
`useTheme` is one instance of it. The theme list lives in the package;
the portfolio imports from the package (removes
`src/config/themes.ts`). The anti-FOUC script is *generated* by the
package from the same list.

### E5 — Additional preference modules

**Plan written 2026-07-07:
[PLAN-extraction-modules.md](./PLAN-extraction-modules.md)** (4 phases,
branch `feat/e5-modules`, **font license audit done and folded in** —
see the plan). Scope: redistributable fonts + `LICENSES/` in the package,
opt-in SCSS modules (a11y-fonts, motion), SSR-safe DOM appliers +
generic `usePreference` (which E4 had deferred to here); the portfolio's
zustand stores stay, only delegating DOM application (localStorage
keys/formats unchanged). Audit result: OFL for OpenDyslexic/Andika/
Raleway Dots/**Atkinson** → bundled; **Sylexiad = proprietary EULA →
excluded** (stays with the portfolio via the extension point);
**Tiresias = GPLv3+exception → call needed** (include with the license
attached, or exclude).

A module = preference + DOM application + CSS/host contract, opt-in:

- **Text size**: `--font-size-factor`; documented host contract (sizes in
  `rem`/`em`) + a helper mixin.
- **Motion reduction**: `reduce-motion` class + a supplied `motion-safe`
  mixin; documented host contract.
- **Accessibility fonts**: bundled (decision) in `fonts/` with
  `@font-face` ready. ⚠️ **Blocking license audit before publication**:
  OpenDyslexic/Andika/Raleway Dots = OFL (ok); Sylexiad, Tiresias,
  Atkinson Hyperlegible: verify and log in `fonts/LICENSES/`. A
  non-redistributable font = removed from the package (the host can wire
  in their own).
- **Optimized dyslexia mode**: depends on the fonts module.

### E6 — Scaffolding CLI (the UI)

`pnpm dlx <name> init` copies into the host project: the trigger (icon) +
the accessibility card (from `templates/`), `theme.config.scss`, and the
layer-3 examples. `init --diff` compares the local UI against the
package's reference (shadcn model). The copied UI imports **only** the
package's public API (core, hooks, tokens) — never its internals.

### E6.5 — Extracting the theme generator — ✅ done 2026-07-12

Surfaced by the §6.2 reconciliation audit (README): the `[data-theme]`
emitter and the standard theme definitions had stayed on the site side
(deferred by E3, parked in README §7 instead of being a numbered
chantier). `_theme-generator.scss` in the package: `apply-theme`,
`emit-role-vars`, `generate-all-themes($themes)`. The consumer configures
their light theme + lists their themes → all generated. Byte-identical
oracle modulo pragmas. Plan: `PLAN-e6-5-theme-generator.md`.

### E6.6 — Extracting the contrast verifier — ✅ done 2026-07-12

Audit gap #2 (§6.2) closed: the engine (`wcag`/`measure`/`cvd`/`gamut`/
parameterized `extract-themes`/`pairs`) lives in
`packages/a11y-prefs/testing/`; the portfolio consumes it (config +
layer-3 pairs + waivers as an overlay). Byte-identical oracle. Plan:
`PLAN-e6-6-contrast-verifier.md`. CI gate: the consumer runs the
verifier's tests on their pairs × themes.

### E7 — Open source and publication

- **Package name settled (2026-07-12)**: `darkmode-plus-a11y`
  (dark-mode-first positioning, deliberately). Free on npm — to
  re-verify right before the first publication.
- Code license: MIT recommended (simple, maximum adoption) — decision to
  finalize. Font licenses separate (E5).
- Package README **in English** (adoption), this repo's doc remains the
  design reference.
- CI: build + unit tests + **contrast tests** (blocking gate) + lint, on
  every PR.
- Publication: **public** npm registry (+ npm provenance if CI runs on
  GitHub).
- Final step: **prove the full cycle** (install the published version
  from npm and run it) in a **disposable test project** — NOT on the
  portfolio. Decision 2026-07-11: the portfolio **stays on the local
  source code** (workspace link) for development, to keep the instant
  preview in `pnpm dev`; it never pins the npm version.

#### Versioning policy (semver — decided 2026-07-12)

`MAJOR.MINOR.PATCH` numbering (e.g. `2.4.1`), strict semver, +
changesets (or equivalent). Rules, **to apply starting with the first
publication**:

| Change | Version bump | Consumer impact |
| --- | --- | --- |
| **Adding** a role (layer 2), an option, a module | MINOR (`2.4`→`2.5`) | nothing breaks — **safe** |
| **Fixing** without touching the API (a value, a bug) | PATCH (`2.4.0`→`2.4.1`) | transparent |
| **Removing / renaming** a role, changing a signature | **MAJOR** (`2.x`→`3.0`) | **breaking** |

- **Avoid** removing/renaming a role. If necessary: a **deprecation**
  path — keep the role functional with a `@warn`, provide a **migration
  note** ("`$X` → `$Y`"), remove it **only** at the next MAJOR version.
  Never an abrupt removal.
- **A missing-role failure is LOUD**: in SCSS, a layer 3 that references
  a removed role makes **the compilation fail at build time**
  ("undefined variable"), never a silent bug in prod. Since development
  happens in the monorepo (the portfolio reads the source code), **the
  site breaks at build time the moment the role is removed** → immediate
  detection, before publication.
- **Front-end (UI) shipped by COPY** (§ 6.3): it does **not** auto-update
  on a version bump. The consumer picks up reference-UI changes via
  `init --diff` (they port over what they want). Semver therefore mostly
  applies to the **engine** (shipped via import).

---

## Chapter: contrast testing system (design)

Goal: mechanically guarantee that **every known text/background pair
meets WCAG 2.2 across the 12 themes**, on every commit — and offer the
same guarantee to future package consumers who redefine roles.

### Architecture

```
contrast-pairs.ts (registry, source of truth)
        │
SCSS compilation (sass JS API, same entry as the site)
        │
custom-property extraction per [data-theme] block (postcss)
        │
pair resolution → WCAG ratio computation → Jest assertions
        │
matrix report (generated markdown, CI artifact)
```

### The pair registry

A declarative, versioned TypeScript file, at two levels:

```ts
type ContrastRule = {
  fg: string;                  // e.g. "--fg-on-emphasis"
  bg: string;                  // e.g. "--bg-emphasis"
  level: "text" | "large-text" | "non-text"; // thresholds 4.5 / 3 / 3 (WCAG 2.2)
  themes?: ThemeOption[];      // default: the 12
  waiver?: { reason: string; issue?: string }; // documented exception
};
```

- **Role level** (shipped by the package): `fg-base`/`bg-base`,
  `fg-base`/`bg-subtle`, `fg-base`/`bg-container`, `fg-muted`/`bg-base`,
  `fg-on-emphasis`/`bg-emphasis` (+`-strong`, `bg-inverse`, `focus-ring`),
  `fg-on-accent`/`accent`, `accent-ink`/`accent-soft`,
  `accent-ink`/`bg-base`, `link`/`bg-base` (+`bg-subtle`, `bg-container`),
  `link-hover`/`bg-base`, `success`/`bg-base`, `danger`/`bg-base`,
  `focus-ring`/`bg-base` as `non-text` (3:1, criterion 1.4.11).
- **Site level** (portfolio-specific, extensible by any consumer): the
  critical layer-3 pairs — header, footers, tags, buttons, tooltip, form.

### Mandatory technical points

- **Computation**: relative luminance and ratio per the WCAG 2.x formula
  — ~20 lines of TS, zero dependency (`culori` acceptable if exotic
  color parsing is needed).
- **Colors with alpha** (`--color-tooltip-bg`, `--color-shadow`):
  composite the foreground over its declared background **before**
  computing the ratio; a pair with alpha must always declare its
  compositing background.
- **Waivers**: a pair that *deliberately* fails in a given theme is never
  removed from the registry — it carries a justified `waiver`, visible in
  the report. Zero silent failure.
- **Report**: generate a themes × pairs matrix (markdown) as an artifact
  — it's also a transparency argument for the open source project.
- **Integration**: a dedicated Jest suite inside `pnpm test` (blocking);
  in E7, the runner moves into `testing/` with the default role pairs,
  and each consumer adds their layer-3 pairs there.
- **Evolution**: an APCA column (expected WCAG 3) **advisory** in the
  report, never blocking until the standard stabilizes.

### What this system changes for high-contrast and the engines

It's what makes the engine optimizations (E2) safe: any contrast drift
introduced by a simplification is detected immediately, theme by theme,
pair by pair — the "perceptual" counterpart to the "identical CSS" oracle
used during the foundations.
