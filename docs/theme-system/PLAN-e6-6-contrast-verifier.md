<!-- @format -->

# Plan — E6.6: extracting the contrast verifier

Written 2026-07-12. Closes **gap #2** of the §6.2 audit: the
`src/accessibility/contrast/` tooling (WCAG verifier, ~1840 lines) lives on
the site side while §6.2 places it in the package ("WCAG contrast verifier
on role pairs" + CI gate for consumers). Executed on branch
`feat/e6-6-contrast-verifier`.

## Goal

The package ships a generic **contrast verification engine** + the
**ROLE pairs registry** (the package's API). The consumer imports the
engine, adds their layer-3 pairs, and gets the WCAG guarantee + a report,
in their tests / CI.

## The boundary (generic = package / specific = consumer)

| File | Role | Destination |
| --- | --- | --- |
| `wcag.ts` | WCAG math (ratio, thresholds, alpha compositing) | **package** |
| `measure.ts` | measures a pair's ratio/ΔE | **package** |
| `cvd-simulation.ts` | color-blind simulation (culori) | **package** |
| `gamut.ts` | anti-gamut sRGB guard | **package** |
| `extract-themes.ts` | compiles SCSS → extracts vars per `[data-theme]` | **package** (parameterized: entry path + node_modules + theme list passed by the consumer) |
| `contrast-pairs.ts` | pair registry | **split**: **role** pairs (`--fg-base`/`--bg-base`…) → package (defaults); **layer-3** pairs (`--color-header-bg`…) → consumer |
| `report.ts` | generates the markdown matrix | **package** (engine); paths/labels = consumer config |
| `hc-semantic-audit.ts` | HC semantic inspector | **package** (engine); `HC_SLOTS` (HC maps) already in the package (theme-generator `hc-color-map`) → wire onto it |

Current couplings to undo:
- `extract-themes.ts`: `MAIN_SCSS` and `NODE_MODULES` **hardcoded** →
  parameters. `THEMES` already comes from the package (via the
  `config/themes` shim).
- `contrast-pairs.ts`: imports `ThemeOption` from the shim (already package).
- `hc-semantic-audit.ts`: `HC_SLOTS` duplicates the HC maps → read the
  package's `hc-color-map()` (single source).

## Package scope (new `testing/` folder)

```
packages/a11y-prefs/testing/
├── wcag.ts, measure.ts, cvd-simulation.ts, gamut.ts
├── extract-themes.ts        # extractThemes({ entry, loadPaths, themes })
├── role-pairs.ts            # default role pairs (package API)
├── report.ts                # generateReport(pairs, { out, labels })
└── semantic-audit.ts        # generic HC audit (reads hc-color-map)
```
Package dependencies: `culori`, `postcss`, `sass` (already present in the
repo, to be declared as `dependencies`/`peer` of the package). Export
`./testing/*`.

## Consumer side (the portfolio, first client)

- `src/accessibility/contrast/` shrinks down to: its **config** (`main.scss`
  path, node_modules), its **layer-3 pairs** (extending the package's
  role-pairs), the calls to the report + the audit.
- **Tests** split: **engine** tests (wcag, gamut, cvd, distinguishability)
  → package; **site conformance** tests (report freshness,
  hc-palette-conformance, hc-semantic on the site's themes, font-drift) →
  stay on the portfolio side.

## Oracle

- `CONTRAST-REPORT.md` **byte-identical** (same matrix).
- `pnpm hc:audit`: unchanged output (0 active warning, 15 waived).
- **748 tests still green** (split across package + site).
- No change to the site's CSS (the tooling doesn't touch rendering).

## Phases

### Phase 0 — Preparation
Baseline: `CONTRAST-REPORT.md`, `hc:audit` output, test suite.

### Phase 1 — Move the generic engine into the package
wcag/measure/cvd/gamut + parameterized `extract-themes` + `role-pairs` +
`report`/`semantic-audit` engines. The package compiles/typechecks on its own.
**Commit**: `feat(theme): e6.6 phase 1 — contrast verifier engine into package`.

### Phase 2 — The portfolio consumes the engine
Reduce `src/accessibility/contrast/` to config + layer-3 pairs + calls.
Split the tests (engine → package, site conformance → portfolio).
**Oracle**: report + audit + tests byte-identical / green.
**Commit**: `refactor(theme): e6.6 phase 2 — portfolio consumes verifier`.

### Phase 3 — Wrap-up
`package.json` (export `./testing/*`, deps), README §6.2 item 9 checked off,
changelog, GUIDE (E6.6 done), guide (the consumer wires up the CI gate).
**Commit**: `docs(theme): e6.6 phase 3 — wrap-up`.

## Out of scope

- Algorithm redesign (WCAG/CVD unchanged — pure extraction).
- `forced-colors`/`prefers-contrast` (README §7, later).
- npm publication (E7).
