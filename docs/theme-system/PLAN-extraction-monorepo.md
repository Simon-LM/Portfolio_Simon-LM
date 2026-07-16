<!-- @format -->

# Execution plan — E3: monorepo and extracting the SCSS side

**Execution document meant for an AI.** Same general rules as previous
plans: dedicated branch, one commit per phase, raw check output in each
report, stop on anything unexpected, entries in
[CHANGELOG.md](./CHANGELOG.md). Reference design:
[GUIDE-package-extraction.md](./GUIDE-package-extraction.md) § E3 and
README § 6 (3-layer architecture, § 6.2 scope, § 6.3 hybrid distribution).

> **Status: ✅ executed 2026-07-07** (branch `feat/e3-monorepo`,
> 6 commits, one per phase). Measured and documented deviation: the
> "byte-identical" oracle holds **modulo duplicated `/** @format */`
> pragmas** (an empirical rule established via probes: noisy comments
> placed before a module's `@use`s get re-emitted once per importer —
> reorganizing the imports changes their count; the pragma spam actually
> drops from 80 to 68). Zero color-value or CSS-rule change, proven by a
> normalized diff at every phase.

## ⛔ Blocking prerequisites

1. Clean `main`, `pnpm build`/`lint`/`test` green, contrast suite present
   (it's the behavioral oracle for the whole chantier).
2. No other theme chantier in progress on another branch.

Branch: `feat/e3-monorepo`.

## Goal and scope

Create a **pnpm workspace** and extract the **engine's SCSS side** into
it — which, eventually, will be updated centrally via npm for consumers:

| Goes into the package (`packages/a11y-prefs/scss/`) | Stays in the portfolio |
| --- | --- |
| `_base-palette.scss` (palettes, `get-color`, `is-dark`…) | `main.scss`, every component/page |
| `_theme-utils.scss` (every `transform-light-to-*` engine, CVD remap, status anchors, WCAG math, gamut) | the 12 theme files `_light.scss`… (= project **configs**) |
| `_anti-glare-functions.scss` | `_theme-system.scss` (assembly: 12 `[data-theme]` blocks, `:root`, media) |
| the **rail + primitives + roles** part of `_theme-variables.scss` (mutable state + `define-base-colors` + `apply-roles`) | the **layer 3** part of `_theme-variables.scss` (~70 project tokens + `apply-theme-variables`) |

`a11y-prefs` is a **working name** (folder + private npm `"name"`) — the
final name belongs to Simon and will be set at the latest in E7;
renaming is cheap (folder + imports).

**Chantier-wide oracle: the compiled CSS stays byte-identical from start
to finish** (no visual change — this is a move, not a redesign). Every
phase recompiles and compares against the baseline.

## Mandatory technical points

1. **Sass resolution of package imports.** pnpm symlinks the workspace
   package into `node_modules/`. Dart Sass doesn't resolve Node modules
   by default: add `node_modules` to the search paths everywhere
   compilation happens —
   - `next.config.ts`: `sassOptions: { includePaths: ["node_modules"] }`;
   - `extract-themes.ts` (contrast suite): `compile(MAIN_SCSS,
     { loadPaths: ["node_modules"] })`;
   - probe tests (`status-resolver.test.ts`) and any CLI compilation:
     `--load-path=node_modules`.
   The portfolio's `@use`s toward the package are then written
   `@use "a11y-prefs/scss/theme-utils"`.
2. **Mutable state and `!global`.** The pipeline relies on mutating
   globals declared at the root of the state module. This module (rail,
   primitives, roles) moves **whole** into the package; the package's
   mixins keep accessing it via `@use … as *` (unchanged relationship).
   The ~70 layer-3 tokens stay declared at the root of the **portfolio**
   module, assigned by the portfolio's `apply-theme-variables` mixin
   which reads the package's roles — no cross package→portfolio
   assignment should remain (that's phase 2's job).
3. **API `@forward`.** The package exposes a single entry point,
   `scss/_index.scss`, that `@forward`s the palette, state/roles, and
   engines — the portfolio only `@use`s the package's public paths, never
   its internal files.
4. **Windows/`node_modules` and Vercel**: verify that the Vercel build
   (`pnpm install` in workspace mode) produces the same CSS — the phase 6
   report must include a full `pnpm build`.

## Phase 0 — Preparation

Clean tree, branch, baseline `/tmp/e3-monorepo/phase0.css`
(`pnpm exec sass --no-source-map src/styles/main.scss …`),
`pnpm build`/`lint`/`test` green.

## Phase 1 — pnpm workspace + resolution probe (no relocation)

1. `pnpm-workspace.yaml` (`packages: ["packages/*"]`), a minimal
   `packages/a11y-prefs/package.json` (`"name": "a11y-prefs"`,
   `"version": "0.0.0"`, `"private": true`, `"exports": { "./scss/*":
   "./scss/*" }`) and a temporary `scss/_probe.scss` (one variable).
2. `pnpm install` (creates the workspace link), add the resolution paths
   (`next.config.ts` sassOptions, extract-themes loadPaths).
3. **Probe**: a temporary `@use "a11y-prefs/scss/probe"` in a test file
   compiled through all three channels (sass CLI, Next build,
   extract-themes) — prove resolution before moving anything, then remove
   the probe.

**Oracle**: byte-identical CSS. **Commit**:
`feat(theme): e3 phase 1 — pnpm workspace + package skeleton`.

## Phase 2 — Dependency inversion (engines ↛ layer 3)

Today, every `transform-light-to-*` mixin (and anti-glare) ends with
`@include apply-roles()` **then `@include apply-theme-variables`** — but
`apply-theme-variables` is the project's layer 3: a package engine cannot
call a consumer mixin.

1. Remove `@include apply-theme-variables;` from **every** engine mixin
   (`transform-light-to-{dark,high-contrast,deuter/prot/trit
   ×2}`, `transform-theme-for-anti-glare`) — they stop at
   `apply-roles()`.
2. Add `@include apply-theme-variables;` to **each theme file**
   (`_dark.scss`, `_high-contrast.scss`, the 6 color-blind ones, the 2
   anti-glare — and check `_light.scss`/`_achromatopsia.scss`), right
   after the transform call. Execution order is strictly identical →
   byte-identical CSS.
3. Document in the code: "the engine stops at the roles; layer 3 is
   derived by the consumer."

**Oracle**: byte-identical CSS. **Commit**:
`refactor(theme): e3 phase 2 — engines stop at the role layer`.

## Phase 3 — Moving the palette and engines

1. Move `_base-palette.scss`, `_theme-utils.scss`,
   `_anti-glare-functions.scss` into `packages/a11y-prefs/scss/` (with
   `git mv` to preserve history).
2. Create `packages/a11y-prefs/scss/_index.scss` that `@forward`s all
   three.
3. Update every portfolio `@use` (12 theme files,
   `_theme-variables.scss`, `_theme-system.scss`, `main.scss`) to
   `a11y-prefs/scss/…`, and the probe-test paths
   (`status-resolver.test.ts`).
4. Watch out for the package's internal `@use`s (theme-utils ↔
   theme-variables): until state is moved (phase 4), the package
   temporarily `@use`s the portfolio's state file via a relative
   upward-reaching path — ugly but byte-safe, resolved in phase 4; flag
   it in the report.

**Oracle**: byte-identical CSS; full `pnpm test` (the suite recompiles
everything). **Commit**: `refactor(theme): e3 phase 3 — move palette and engines
into the package`.

## Phase 4 — Splitting state: roles (package) / layer 3 (portfolio)

1. Create `packages/a11y-prefs/scss/_state.scss`: the 11-step rail,
   primitives (`$accent`…), ~15 roles, aliases (`$off-white`,
   `$near-black`), `define-base-colors()`, `apply-roles()` — cut-and-paste
   from `_theme-variables.scss`, root declarations included.
2. `src/styles/themes/_theme-variables.scss` (portfolio) keeps only layer
   3: ~70 root declarations + `apply-theme-variables()` — and
   `@use "a11y-prefs/scss/state" as *` to read roles and primitives.
3. Resolve phase 3's temporary path (the package no longer references
   anything on the portfolio side — verify via grep that no package
   `@use` reaches back up into `src/`).

**Oracle**: byte-identical CSS. **Commit**:
`refactor(theme): e3 phase 4 — split state: roles in package, layer 3 in app`.

## Phase 5 — Minimal `with (…)` configuration

Make what's cheap configurable, without a redesign:

1. In `_state.scss`: `$gray-family: "stone" !default;` (the rail is
   derived from this family) and a `!default` `$primitives` map
   (`accent: (amber, 300), link: (sky, 900), success: (emerald, 700),
   danger: (redd, 600)`, etc.) consumed by `define-base-colors()`.
2. The portfolio consumes it: `@use "a11y-prefs/scss/state" as * with
   ($gray-family: "stone", $primitives: (…));` — same values as today →
   byte-identical.
3. **Deliberately out of scope**: the role→step wiring of `apply-roles()`
   stays hardcoded in the package (the full "central registry" is a later
   chantier, cf. README § 7); likewise the theme list.

**Oracle**: byte-identical CSS. **Commit**:
`feat(theme): e3 phase 5 — minimal package configuration (with)`.

## Phase 6 — Wrap-up

1. Full `pnpm build`/`lint`/`test` + **`pnpm contrast:report`** (unchanged
   report expected) + a local Vercel-style build.
2. Docs: README § 3 (file → new-path mapping), guide § E3 (done), TODO;
   summary changelog entry; final report (byte-identical diff proven,
   package tree).

**Commit**: `docs(theme): e3 phase 6 — finalization`.

## Out of scope (do NOT do)

- The **React runtime** (`useTheme`, anti-FOUC, menu) — E4 chantier.
- The preference **modules** (zoom, fonts, animations) — E5.
- The **scaffolding CLI** — E6; **npm publication and the name** — E7
  (decision).
- The **contrast suite** stays on the portfolio side (it compiles
  `src/styles/main.scss`); extracting it as a package tool = E7.
- The **central registry** of the ~70 tokens and generating the
  `[data-theme]` blocks from `themes.ts`.
- Any **color-value** change (byte-identical oracle).
