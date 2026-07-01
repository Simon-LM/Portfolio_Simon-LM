<!-- @format -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## [Unreleased]

## [0.1.3] - 2026-07-01

### Fixed

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

### Added

- New `src/hooks/useIsMounted.ts` hook using `useSyncExternalStore` as a drop-in SSR-safe replacement for the `useState(false)` + `useEffect(setMounted)` pattern.

## [0.1.2] - 2026-07-01

### Fixed

- Migrated `images.domains` to `images.remotePatterns` in `next.config.ts` (deprecated API removed in Next.js 16).
- Replaced `next lint` script with `eslint src` (`next lint` command removed in Next.js 16).
- Rewrote `eslint.config.mjs` to use `eslint-config-next` v16 flat config natively (removed `FlatCompat` bridge).
- Fixed corrupted `pnpm-lock.yaml` entry: `minimatch@3` was resolving `brace-expansion@4.x` instead of `^1.x` — corrected via `pnpm.overrides`.
- Added `.npmrc` with `public-hoist-pattern` to hoist `@babel/runtime` so `babel-jest` can resolve it in Jest tests.

### Changed

- Updated `eslint-config-next` from `15.1.4` to `^16.0.0` to match Next.js 16.
- Updated `eslint` from `9.20.1` to `^9.20.1` (resolved to `9.39.4`).

## [0.1.1] - 2026-03-25

### Changed

- Relaxed markdownlint rules for documentation-heavy Markdown files to reduce non-critical style warnings.
