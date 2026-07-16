<!-- @format -->

# Changelog

Notable changes to this project, grouped by date rather than semantic
version. This is a continuously-deployed personal site — every merge to
`main` ships on the next deploy, so there are no discrete "releases" for
version numbers to track.

## 2026-07-04

### Changed

- Theme engines review (branch `refactor/theme-engines`, 4 phases, one
  commit each, **not yet merged — visual validation by Simon required**):
  fixed dead `$intensity` param and dead `$hue_shift` var, fixed a
  red/green hue-window overlap in the colorblind engine, made the -opia
  enhance-factor configurable; rewrote `transform-theme-for-anti-glare`
  to derive all ~70 layer-3 tokens from the anti-glared roles in a single
  pass instead of a hardcoded ~22-token list (fixes ~45 tokens, e.g.
  `--color-lang-toggle-bg`, that were never attenuated at all); rewrote
  the anti-glare color transform itself in OKLCH for perceptually
  uniform attenuation (HSL lightness isn't perceptually uniform across
  hues), recalibrating the light-mode threshold from the plan's 92%
  starting point down to 85% after measuring a coverage gap against the
  old engine; removed the full-screen `backdrop-filter` overlay (GPU
  cost for a measured near-zero visual effect). CSS diff strictly
  confined to the anti-glare-light/anti-glare-dark theme blocks
  throughout; full detail, including two points where the plan's literal
  instructions were not followed as written (with measurements showing
  why), in
  [docs/theme-system/CHANGELOG.md](docs/theme-system/CHANGELOG.md) and
  the executed plan,
  [docs/theme-system/PLAN-engine-review.md](docs/theme-system/PLAN-engine-review.md).

### Added

- WCAG 2.2 contrast-testing system for the 12-theme color system (branch
  `feat/contrast-tests`, 5 phases, one commit each, purely additive — no
  file under `src/styles/` was touched, compiled CSS stayed byte-identical
  throughout). `src/accessibility/contrast/`: WCAG utilities (`culori`),
  extraction of the 12 `[data-theme]` blocks from the compiled CSS
  (`postcss`), a registry of 40 fg/bg pairs (role-level + site-level),
  a Jest suite (498 tests) checking every pair against its WCAG threshold
  in every applicable theme, and a generated matrix report
  (`docs/theme-system/CONTRAST-REPORT.md`, `pnpm contrast:report`). First
  run surfaced 33 pre-existing failures across 7 pairs; each got a
  documented waiver (measured ratio + factual root cause, no color
  changes) for Simon's future arbitration — full detail, phase by phase,
  in [docs/theme-system/CHANGELOG.md](docs/theme-system/CHANGELOG.md) and
  the executed plan,
  [docs/theme-system/PLAN-contrast-tests.md](docs/theme-system/PLAN-contrast-tests.md).

## 2026-07-03

### Changed

- Theme system foundations migration (branch `refactor/theme-foundations`,
  8 phases, one commit each): purged dead code and legacy commented-out
  code across the theme SCSS files; cleaned debug artifacts (forced reflow,
  `theme-switching` class, `console.log`) out of `useTheme`'s `setTheme()`;
  renamed the gray scale from descriptive names to an 11-step numeric rail
  (`$gray-50`…`$gray-950`, filling a previously missing step); unified
  variable naming to kebab-case and fixed a `bg-texte` typo; migrated all of
  `src/styles/` off the deprecated `@import`/`darken`/`lighten`/etc Sass API
  to the `@use` module system (zero deprecation warnings); introduced a
  role-token layer (`bg-*`, `fg-*`, `border-*`, `focus-ring`, …) between the
  color primitives and the ~70 component-level tokens; added
  `src/config/themes.ts` as the single source of truth for the 12-theme
  list (previously duplicated three ways). Each phase's compiled-CSS diff
  was verified against an explicit expectation before proceeding; the only
  intentional visual change is `--color-accent-hover` moving from a
  computed `darken()` to the `amber-500` rail step. Full detail, phase by
  phase, in [docs/theme-system/CHANGELOG.md](docs/theme-system/CHANGELOG.md)
  and the executed plan,
  [docs/theme-system/PLAN-foundations-migration.md](docs/theme-system/PLAN-foundations-migration.md).

## 2026-07-02

### Fixed

- `favicon.ico` requests returned `500` instead of a real icon or a clean `404`. Root cause: `src/app/favicon.ico` (the Next.js App Router convention file) was deleted in this project's very first commit and never replaced, while `layout.tsx`'s metadata still references `/favicon.ico`. With no static file to intercept the request, it fell through to the `[lang]` dynamic route, which treated `"favicon.ico"` as a language code and crashed on `metadata[langKey].title` (undefined). Restored the original file (recovered from git history) to `public/favicon.ico`, where it's served as a static asset and never reaches the `[lang]` route. Note: this is the generic Next.js scaffold icon, not a branded one — a real favicon is still a follow-up.
- Dev server accessed via a LAN IP (e.g. `http://192.168.0.174:3000`) rendered `Header` and `AccessibilityMenu` stuck on their skeleton fallback (`useIsMounted()` never resolving to `true`), even though `localhost` and production worked fine. Cause: Next.js's dev server rejects the HMR WebSocket handshake for origins it doesn't recognize (`ws://192.168.x.x/_next/webpack-hmr` → `ERR_INVALID_HTTP_RESPONSE`), which disrupted hydration completion for `useSyncExternalStore`-based components. Added `allowedDevOrigins: ["192.168.0.174"]` to `next.config.ts` (dev-only, no effect on `next build`/production).

## 2026-07-01

### Fixed

- Production build (and, it turned out, a from-scratch local build too) failed with `Module not found: Can't resolve '@babel/runtime/helpers/esm/*'` from `react-select`/`@emotion`. Real root cause: `pnpm.overrides` pinned `@babel/runtime`/`@babel/helpers` to `>=7.26.10` with **no upper bound** (originally a security-patch override) — once `@babel/runtime@8.0.0` was published, that open-ended range resolved to it instead of the latest 7.x, silently overriding `react-select`'s own `"@babel/runtime": "^7.12.0"` constraint. `@babel/runtime@8`'s `exports` map dropped direct `./helpers/esm/*` subpath imports (only `./helpers/*` with internal conditional resolution remains), which `react-select`'s build still imports directly. Bounded both overrides to `>=7.26.10 <8`. The pnpm-9-vs-10 and stale-build-cache theories tried first (see below) were both ruled out by reproducing the exact same failure on a from-scratch local install/build — this was never Vercel-specific.
- Production deploy failed with `Module not found: Can't resolve '@babel/runtime/helpers/esm/createClass'` (thrown from `react-select`/`@emotion`). Root cause: Vercel picks the pnpm major version from the project's *creation date* unless told otherwise, and was installing with pnpm 9 while every local change in this session (including the dependency audit) was done with pnpm 10 — the two hoist `@babel/runtime` differently under the `.npmrc` `public-hoist-pattern`, so the module tree Vercel built didn't expose the `esm/*` helper paths. Added `"packageManager": "pnpm@10.4.0"` to `package.json` so Vercel's Corepack picks the same pnpm version as local dev.
- `themeColor` was set in `metadata` (`layout.tsx`) and `generateMetadata` (`[lang]/layout.tsx`) — unsupported there since Next.js 14, silently ignored by Next.js 16. The tag that actually rendered was a hand-written `<meta name="theme-color">` added as a workaround. Moved `themeColor` to a single `export const viewport: Viewport` in the root layout and removed the now-redundant manual tag and the two dead `metadata` fields. Verified the generated HTML emits the exact same `<meta name="theme-color" content="#fcd34d"/>` as before.
- Anti-FOUC theme-init script (`layout.tsx`) recognised only 5 of the 12 themes (`light`, `dark`, `high-contrast`, `deuteranopia`, `protanopia`) — a saved `anti-glare-*`, `*-anomaly`, or `achromatopsia` theme flashed the wrong theme on load before React corrected it. Synced the script's list with `useTheme`'s `VALID_THEMES` (also fixed in the commented-out legacy version of the script).
- Eliminated all 11 pre-existing ESLint violations (`react-hooks/set-state-in-effect`, `react-hooks/refs`, `@next/next/no-before-interactive-script-outside-document`, unused `eslint-disable` directive).
- `usePrefersDarkMode`: rewrote with `useSyncExternalStore` — no more `setState` in effect body, media-query subscription handled natively.
- `useTheme`: replaced init `useEffect` calling `setTheme()` with a lazy `useState` initializer reading from `localStorage`/`matchMedia`; DOM attribute applied in effect without `setState`.
- `Header`, `AccessibilityMenu`: replaced `useState(false)` + `useEffect(setMounted, [])` pattern with new `useIsMounted()` hook (no `setState` in effect, same two-render SSR behavior).
- `AccessibilityMenu` (`setIsDyslexicMode`): removed redundant synchronisation effect — the Select `onChange` handler already resets `isDyslexicMode` when a font is selected.
- `AccessibilityMenu` (`setReduceMotion`): replaced init effect with lazy `useState` initializer; DOM class now synced via a dedicated `useEffect([reduceMotion])`.
- `MatomoAnalytics`: removed `isMounted` state and `setIsMounted(true)` in effect; page tracking now guarded by `window._paq` check. Changed inline init script from `beforeInteractive` to `afterInteractive`.
- `LazyContact`: removed `shouldLoad` state and its associated `useEffect`; replaced `showContact || shouldLoad` condition with `showContact || inView` (using `triggerOnce: true`).
- `LanguageSync`: added targeted `eslint-disable-next-line react-hooks/refs` comment explaining the intentional per-instance initialisation guard.
- `route.test.ts`: removed orphaned `eslint-disable` directive for `@typescript-eslint/no-require-imports`.
- Migrated `images.domains` to `images.remotePatterns` in `next.config.ts` (deprecated API removed in Next.js 16).
- Replaced `next lint` script with `eslint src` (`next lint` command removed in Next.js 16).
- Rewrote `eslint.config.mjs` to use `eslint-config-next` v16 flat config natively (removed `FlatCompat` bridge).
- Fixed corrupted `pnpm-lock.yaml` entry: `minimatch@3` was resolving `brace-expansion@4.x` instead of `^1.x` — corrected via `pnpm.overrides`.
- Added `.npmrc` with `public-hoist-pattern` to hoist `@babel/runtime` so `babel-jest` can resolve it in Jest tests.
- `next` was pinned to `16.1.1` while `eslint-config-next` was already on `16.2.9` — bumped `next` to match.
- `@types/jest` was capped at `^29.x` while the installed `jest` runtime was already v30 — bumped to `^30.x` to match.
- Deleted `src/components/customSelect/CustomSelect.tsx`: orphaned since the March 2025 migration to `react-select` (zero imports anywhere), and its `@react-aria`/`@react-stately` typings no longer matched after the dependency audit below — removing it was simpler than patching a dead component.

### Added

- New `src/hooks/useIsMounted.ts` hook using `useSyncExternalStore` as a drop-in SSR-safe replacement for the `useState(false)` + `useEffect(setMounted)` pattern.

### Removed

- `@types/testing-library__jest-dom`: deprecated, `@testing-library/jest-dom` v6 ships its own types.
- `vitest`, `@vitejs/plugin-react`: unused — no script ran them, the test runner is `jest`.

### Changed

- Updated `eslint-config-next` from `15.1.4` to `^16.0.0` to match Next.js 16.
- Updated `eslint` from `9.20.1` to `^9.20.1` (resolved to `9.39.4`).
- Dependency audit (`pnpm outdated`): bumped everything that fit inside its already-declared semver range (`react-dom`, `react-hook-form`, `react-hot-toast`, `react-icons`, `react-select`, `zustand`, `sass`, `zod` (still 3.x), `typescript` (still 5.x), `@testing-library/*`, `@types/react*`, `jest`, `jest-environment-jsdom`, `pa11y-ci`, and a few more). Left every major-version jump untouched (`zod` 4, `@hookform/resolvers` 5, `typescript` 6, `eslint` 10, `framer-motion` 12, `react-intersection-observer` 10, `react-markdown` 10, `pa11y` 9, `jsdom` 29, `@types/node` 26, `feed` 5) — each has a history of breaking changes and deserves its own deliberate migration rather than a batch bump.

## 2026-03-25

### Changed

- Relaxed markdownlint rules for documentation-heavy Markdown files to reduce non-critical style warnings.
