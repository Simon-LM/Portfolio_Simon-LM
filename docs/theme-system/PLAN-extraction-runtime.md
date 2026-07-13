<!-- @format -->

# Execution plan — E4: extracting the React runtime

**Execution document meant for an AI.** Same general rules as previous
plans: dedicated branch, one commit per phase, raw check output in each
report, stop on anything unexpected, entries in
[CHANGELOG.md](./CHANGELOG.md). Reference design:
[GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) § E4 and
README § 4.6 (runtime).

> **Status: ✅ executed 2026-07-07** (branch `feat/e4-runtime`,
> 4 commits). Oracles held: strictly byte-identical CSS, byte-identical
> anti-FOUC string (648 bytes, generator produced programmatically from
> the historical literal), 589 tests/tsc/lint/build green. Unexpected
> issue caught by the build and fixed in phase 2: the Server/Client
> Components boundary — the barrel was pulling the (client) hook into
> `layout.tsx` (server) through the shim; resolved with `"use client"` on
> `useTheme`, granular `./react/*` exports, and a `themes` shim pointing
> to the pure data module.

## ⛔ Blocking prerequisites

1. **E3 merged** (pnpm workspace + `packages/a11y-prefs` present) — done
   2026-07-07 (`812d5d5`).
2. `pnpm build`/`lint`/`test` green.

Branch: `feat/e4-runtime`.

## Goal and scope

Extract the system's **runtime side** into the package — letting consumers
get the hook, persistence, and anti-FOUC without rewriting them:

| Goes into the package (`packages/a11y-prefs/react/`) | Stays in the portfolio |
| --- | --- |
| `THEMES` (the 12) + `ThemeOption` type (package defaults) | `src/config/themes.ts` → plain re-export (the `@/config/themes` imports don't move) |
| `useTheme()` (lazy localStorage/matchMedia init, `setTheme`, MutationObserver) | `src/hooks/useTheme.ts` → re-export |
| `usePrefersDarkMode()` | `src/hooks/usePrefersDarkMode.ts` → re-export |
| `themeInitScript(themes?)`: generates the anti-FOUC JS string | `layout.tsx` (the inline `<Script>` stays, its content comes from the package) |
| — | `AccessibilityMenu` (scaffolded UI, E6 chantier) |

**Chantier oracles**:

1. **Strictly byte-identical CSS** (no SCSS touched — not even E3's
   pragma tolerance).
2. **Byte-identical anti-FOUC string**: extract the generated string
   before/after (a small Node script that imports `themeInitScript` and
   compares it to `layout.tsx`'s current literal) — the rendered HTML must
   not change.
3. Full test suite green (589 tests) + `pnpm build` + manual smoke test of
   theme switching in dev.

## Mandatory technical points

1. **TypeScript sources consumed without building the package** (a
   publishable dist is an E7 topic):
   - `packages/a11y-prefs/package.json`: add
     `"./react": "./react/index.ts"` to `exports`, and `react` as a
     **peerDependency** (not a dependency);
   - `next.config.ts`: `transpilePackages: ["a11y-prefs"]`;
   - Jest (config in `package.json`): `moduleNameMapper`
     `"^a11y-prefs/react$": "<rootDir>/packages/a11y-prefs/react/index.ts"`
     (works around `transformIgnorePatterns` on node_modules);
   - `tsconfig.json`: check resolution (add a `paths` entry
     `"a11y-prefs/react": ["./packages/a11y-prefs/react/index.ts"]` if the
     resolution mode doesn't read `exports`).
2. **Minimal genericity, identical behavior.** `useTheme` and
   `themeInitScript` take an optional `themes: readonly string[]`
   parameter, **default = the package's 12**; the convenience booleans
   (`isDark`, `isTritanopia`…) are kept as-is (they operate on the
   package's 12 default themes). No logic change: relocation +
   parameterization of the literal.
3. **Zero churn for consumers**: the portfolio files
   (`src/config/themes.ts`, `src/hooks/useTheme.ts`,
   `src/hooks/usePrefersDarkMode.ts`) become **re-exports** of the
   package — the ~8 existing importers (`@/config/themes`,
   `@/hooks/useTheme`…) don't change. The contrast suite keeps importing
   `@/config/themes` (unchanged `ThemeOption` type, `as const` preserved
   for literal inference).

## Phase 0 — Preparation

Clean tree, branch, baselines: compiled CSS
(`/tmp/e4-runtime/phase0.css`, `--load-path=node_modules`) + a copy of the
current anti-FOUC literal (the `dangerouslySetInnerHTML` block from
`layout.tsx`) for oracle #2. `pnpm build`/`lint`/`test` green.

## Phase 1 — Package react skeleton + tooling wiring

1. `packages/a11y-prefs/react/`: `index.ts` (empty exports for now),
   probe `themes.ts`.
2. `exports`/peerDependencies in the package's package.json;
   `transpilePackages` in next.config.ts; Jest `moduleNameMapper`;
   tsconfig `paths` if needed.
3. **Probe**: a minimal Jest test imports `a11y-prefs/react` and reads the
   probe; a temporary component is NOT needed — verify Next's resolution
   via `pnpm build` with a temporary import in `layout.tsx`, removed
   afterward.

**Oracles**: byte-identical CSS, green suite.
**Commit**: `feat(theme): e4 phase 1 — package react entry + tooling wiring`.

## Phase 2 — Theme list and hooks

1. `packages/a11y-prefs/react/themes.ts`: `THEMES` (the 12, `as const`)
   and `ThemeOption` — content moved from `src/config/themes.ts`.
2. `packages/a11y-prefs/react/useTheme.ts` and `usePrefersDarkMode.ts`:
   code moved as-is, internal imports adjusted; `useTheme` accepts an
   optional `themes` (default `THEMES`).
3. Portfolio side: `src/config/themes.ts`, `src/hooks/useTheme.ts`,
   `src/hooks/usePrefersDarkMode.ts` become re-exports
   (`export { THEMES, type ThemeOption } from "a11y-prefs/react"` etc.).
4. Check that `tsc --noEmit` sees the same types (the `ThemeOption` union
   literals intact) and that the 589 tests pass unmodified.

**Oracles**: byte-identical CSS, green suite, green tsc.
**Commit**: `refactor(theme): e4 phase 2 — themes list and hooks into the package`.

## Phase 3 — Anti-FOUC

1. `packages/a11y-prefs/react/themeInitScript.ts`:
   `themeInitScript(themes = THEMES): string` returning **exactly** the
   current `layout.tsx` string (same whitespace/newlines — the oracle is
   byte-for-byte), with `JSON.stringify(themes)` at its current spot.
2. `layout.tsx`: `__html: themeInitScript()` instead of the literal.
3. **Oracle #2**: a Node comparison script, old string (phase 0 baseline)
   vs `themeInitScript()` — byte-for-byte identical.

**Oracles**: identical string, byte-identical CSS, green Next build.
**Commit**: `refactor(theme): e4 phase 3 — anti-FOUC script from the package`.

## Phase 4 — Wrap-up

1. Full `pnpm build`/`lint`/`test`/`tsc` + `pnpm contrast:report`
   (unchanged expected) + **manual smoke test**: `pnpm dev`, switch theme
   via the menu, reload (persistence), verify no FOUC.
2. Docs: README § 3 (runtime → package mapping) and § 4.6, guide § E4
   (done), TODO; summary changelog entry; final report.

**Commit**: `docs(theme): e4 phase 4 — finalization`.

## Out of scope (do NOT do)

- `AccessibilityMenu` and the whole UI (E6 chantier, scaffolded).
- The preference **modules** (zoom, fonts, animations, dyslexia) — E5; the
  font-size store (`fontSizeStore`) stays in the portfolio.
- The package's **publishable build/dist**, publication, and name — E7.
- The 3-axis `{base, contrast, vision}` model (README § 7 idea).
- Any observable behavior change (initial theme, persistence, order of
  localStorage/matchMedia checks).
