<!-- @format -->

# darkmode-plus-a11y — implementation guide

Guide for **AI agents and developers** integrating this accessibility
component into a project. Read it **before** wiring anything.

## What you just copied

`init` copied into your project (you **own** it, edit freely):

- `react/AccessibilityControl.tsx` — the trigger (button).
- `react/AccessibilityMenu.tsx` — the accessibility card.
- `react/accessibilityPreferences.ts` — state via the `usePreference` hook.
- `scss/accessibility-menu.scss`, `-trigger.scss` — the UI styles.
- `scss/accessibility-features.scss` — @font-face + classes + dyslexia + motion.
- `scss/theme.config.scss` — the UI's **layer 3** (to wire, see below).
- `scss/theme-example.scss` — a minimal theme assembly (light + high-contrast).

The **engine** (color transforms, hooks, contrast guarantees) stays in the
npm package and updates per version. The **copied UI** does NOT auto-update:
`darkmode-plus-a11y init --diff` shows the upstream reference changes for you
to port by hand.

## Prerequisites

- **Tailwind palettes**: the system is anchored to Tailwind's 11-weight
  geometry (this is what guarantees well-spaced colors). Your brand
  primitives are declared as `("family", weight)`.
- Project UI dependencies: `react-select`, `react-icons`, and the
  `darkmode-plus-a11y` package.

## GOLDEN RULE (layer 3)

The system has **3 layers**: (1) Tailwind palettes, (2) **roles** = the
package API, (3) your **assignment tokens**.

> **Every layer-3 token is defined FROM A LAYER-2 ROLE** (`$bg-base`,
> `$accent`, `$link`…), never a raw value (`#hex`, a hardcoded Tailwind color).

This is what makes high-contrast and color-blind themes apply correctly: the
engine transforms the **roles**, your tokens inherit from them. A hardcoded
token **escapes** theming (text staying colored in full high-contrast, etc.).

Available layer-2 roles (use these in `theme.config.scss`):

- Backgrounds: `$bg-base`, `$bg-subtle`, `$bg-container`, `$bg-container-high`,
  `$bg-emphasis`, `$bg-emphasis-strong`, `$bg-inverse`
- Foregrounds: `$fg-base`, `$fg-muted`, `$fg-on-accent`, `$fg-on-emphasis`
- Brand: `$accent`, `$accent-strong`, `$accent-ink`, `$accent-soft`
- Links / focus: `$link`, `$link-hover`, `$focus-ring`
- Borders: `$border-base`, `$border-subtle`, `$border-strong`
- Status: `$success`, `$danger`
- Rail: `$gray-50` … `$gray-950`, `$off-white`, `$near-black`

## Minimal wiring

1. **SCSS**: import `theme-example.scss` (the assembly), then
   `accessibility-menu.scss`, `accessibility-trigger.scss`,
   `accessibility-features.scss`. Extend `theme-example` with your other
   themes (dark, color-blind, HC variants) following the same pattern.
2. **Fonts**: `init` copied the files to `public/fonts` (path
   `$a11y-fonts-path`, default `/fonts`).
3. **Anti-FOUC**: set `data-theme` on `<html>` before first paint (the
   package provides `themeInitScript` — see its docs).
4. **UI**: render `<AccessibilityControl language="fr" />`
   **IN THE DOCUMENT FLOW** (typically your header).
   - ⚠️ **NEVER a floating `position: fixed`**: it overlaps content at high
     zoom (an accessibility defect). If there is no obvious spot, use a
     **pre-header band** (a strip above the header, icon on the right).
   - Props: `language` ("fr"|"en"), `position?`, `icon?`, `complianceUrl?`.

## Verifying your wiring

- `pnpm hc:audit` — semantic inspector: flags a token whose name contradicts
  the value it emits in high-contrast (e.g. `*-text` emitting the background
  color → wiring to review).
- The palette conformance test fails if a token is not part of the
  high-contrast palette (a token not wired to a role).

These checks are **read-only**: they warn, they never modify anything.
