/** @format */
// Package re-export (E4): the single source for the theme list now lives
// in packages/a11y-prefs/react/themes.ts. This shim preserves the
// existing import paths (@/config/themes) — zero churn.
// Granular import (a pure data module, no hook): this shim is also
// consumed by Server Components (layout.tsx) — going through the
// ./react barrel would pull client hooks into the server graph.
export { THEMES, type ThemeOption } from "a11y-prefs/react/themes";
