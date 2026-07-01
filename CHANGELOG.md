<!-- @format -->

# Changelog

Notable changes to this project, grouped by date rather than semantic
version. This is a continuously-deployed personal site — every merge to
`main` ships on the next deploy, so there are no discrete "releases" for
version numbers to track.

## 2026-07-01

### Fixed

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
