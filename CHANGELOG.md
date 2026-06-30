<!-- @format -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## [Unreleased]

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
