<!-- @format -->

# darkmode-plus-a11y — integration guide

Guide for **AI agents and developers** integrating this package. The
instructions are deterministic: exact imports, exact commands, explicit
failure modes. Read it **before** wiring anything. `init` copies this
file into your project so it stays available next to the code you own.

> ⚠️ Snippets use the published package name (`darkmode-plus-a11y`).
> Installed it under a different name? `init --pkg <name>` rewrites the
> copied files accordingly; align hand-copied snippets yourself.

## Why this package exists

Assistive tools of professional quality cost users hundreds to
thousands of euros. This package exists to build that quality **into
websites themselves** — free for the end user. Its current scope is
**colors (accessible theme system) and text fonts** (plus small opt-in
modules: dyslexia typography, reduced motion). The package is
**SCSS-first by design**: the guarantees it gives (a mistyped role
fails the build; every theme derives mechanically from one light
theme) live at compile time. Tailwind projects are welcome — see
[Tailwind projects](#tailwind-projects) for a bridge that requires no
BEM and no rewrite — but the engine itself speaks SCSS.

## Architecture in 30 seconds

Three layers:

1. **Palettes** (layer 1) — Tailwind color geometry (11 weights per
   family). Your brand primitives are declared as `("family", weight)`
   pairs. This anchoring is what keeps generated colors well spaced.
2. **Roles** (layer 2) — the package API: `$bg-base`, `$accent`,
   `$link`… The engines (dark, high-contrast variants, color-vision
   deficiency, anti-glare) transform **these**.
3. **Your tokens** (layer 3) — your component variables, each defined
   **from a role**, emitted as CSS custom properties per
   `[data-theme="…"]` block.

Hybrid distribution: the **engine** (SCSS + React hooks + testing
primitives) is imported from npm and updates by semver; the **UI**
(trigger button + accessibility card) is **copied into your project**
by `init` (shadcn model) — you own it, it never auto-updates, and
`init --diff` shows upstream changes for you to port by hand.

## Choose your path

- **Path A — scaffolded UI**: you want the ready-made accessibility
  button + card. Run `init`, then follow [Path A](#path-a--scaffolded-ui).
- **Path B — engine only**: you have your own UI; you want the themes,
  hooks, and guarantees. Follow [Path B](#path-b--engine-only).
- Using Tailwind? Both paths work — read
  [Tailwind projects](#tailwind-projects) on top.

## Prerequisites

- Brand colors expressed on **Tailwind palette geometry** —
  `("family", weight)` pairs, e.g. `("amber", 300)`.
- Path A UI dependencies: `react`, `react-select`, `react-icons`.
- A Sass compiler for the theme build (`sass` as a devDependency, or
  any bundler with SCSS support). It compiles separately from the rest
  of your pipeline and does not constrain it.

## THE GOLDEN RULE (layer 3)

> **Every layer-3 token is defined FROM A LAYER-2 ROLE** (`$bg-base`,
> `$accent`, `$link`…) — never from a raw value (`#hex`, a hardcoded
> Tailwind color).

This is the whole mechanism: the engines transform the **roles**, your
tokens inherit the transform. A hardcoded token **escapes** theming —
e.g. text that stays colored in full high-contrast mode. The
[verification suite](#verifying-your-wiring) catches this mechanically.

Available layer-2 roles (use these in `theme.config.scss` or your own
layer 3):

- Backgrounds: `$bg-base`, `$bg-subtle`, `$bg-container`,
  `$bg-container-high`, `$bg-emphasis`, `$bg-emphasis-strong`,
  `$bg-inverse`
- Foregrounds: `$fg-base`, `$fg-muted`, `$fg-on-accent`,
  `$fg-on-emphasis`
- Brand: `$accent`, `$accent-strong`, `$accent-ink`, `$accent-soft`
- Links / focus: `$link`, `$link-hover`, `$focus-ring`
- Borders: `$border-base`, `$border-subtle`, `$border-strong`
- Status: `$success`, `$danger`
- Rail: `$gray-50` … `$gray-950`, `$off-white`, `$near-black`

Every role is also emitted as a CSS custom property (`--bg-base`,
`--accent`…) in each theme block — that is what the verification suite
and the [Tailwind mapping](#tailwind-projects) consume.

## Path A — scaffolded UI

```bash
npx darkmode-plus-a11y init          # copies UI into ./a11y + fonts into ./public/fonts
npx darkmode-plus-a11y init --diff   # later: compare your copy against the reference
# Options: --dir <path> --pkg <import-name> --fonts <path> --force
```

What you now own (edit freely):

- `react/AccessibilityControl.tsx` — the trigger (button).
- `react/AccessibilityMenu.tsx` — the accessibility card.
- `react/accessibilityPreferences.ts` — state via the package's
  `usePreference` hook.
- `scss/accessibility-menu.scss`, `scss/accessibility-trigger.scss` —
  the UI styles (plain CSS with nesting — no Sass feature used).
- `scss/accessibility-features.scss` — @font-face + font classes +
  dyslexia + motion (needs Sass: it includes package mixins).
- `scss/theme.config.scss` — the UI's **layer 3** (the golden rule
  applies here).
- `scss/theme-example.scss` — the theme assembly: configure your light
  theme once, the package generates every theme from it.
- `AGENTS.md` — this guide.

Wiring steps:

1. **SCSS** — import, in this order, from your global stylesheet:

   ```scss
   @use "../a11y/scss/theme-example"; // themes: roles + your layer 3
   @use "../a11y/scss/accessibility-features"; // fonts + dyslexia + motion
   @use "../a11y/scss/accessibility-trigger";
   @use "../a11y/scss/accessibility-menu";
   ```

   Extend `theme-example.scss` with your palette and your own layer-3
   tokens; the golden rule applies to every line you add.

2. **Fonts** — `init` copied the font files to `public/fonts`
   (configurable: `--fonts`, and `$a11y-fonts-path` in
   `accessibility-features.scss`).

3. **Anti-FOUC** — set `data-theme` on `<html>` **before first
   paint**, otherwise users on a non-default theme get a flash. The
   package generates the inline script:

   ```tsx
   // Next.js App Router — app/layout.tsx
   import { themeInitScript, THEMES } from "darkmode-plus-a11y/react";

   export default function RootLayout({ children }) {
   	return (
   		<html suppressHydrationWarning>
   			<head>
   				<script dangerouslySetInnerHTML={{ __html: themeInitScript(THEMES) }} />
   			</head>
   			<body>{children}</body>
   		</html>
   	);
   }
   ```

   `themeInitScript(themes)` returns a plain string: on any other
   stack, inline it in a `<script>` in `<head>`. It reads
   `localStorage.theme` (validated against your list), falls back to
   `prefers-color-scheme`, and sets the attribute.

4. **UI placement** — render the trigger **IN THE DOCUMENT FLOW**,
   typically in your header:

   ```tsx
   import AccessibilityControl from "@/a11y/react/AccessibilityControl";

   <AccessibilityControl language="en" />;
   ```

   - ⚠️ **NEVER a floating `position: fixed` button**: it overlaps
     content at high zoom — an accessibility defect. No obvious spot?
     Use a **pre-header band** (a strip above the header, icon on the
     right).
   - Props: `language` (`"fr" | "en"`), `position?`, `icon?`,
     `complianceUrl?`. Labels are FR/EN today; for another language,
     edit the copied component — you own it.

5. **Verify** — set up the [contrast suite](#verifying-your-wiring).

## Path B — engine only

One SCSS entry generates every theme from your light configuration:

```scss
@use "darkmode-plus-a11y/scss/state" as * with (
	$gray-family: "stone",
	$primitives: (
		"accent": ("amber", 300),
		"accent-strong": ("amber", 500),
		"link": ("sky", 700),
		// …your brand, as Tailwind ("family", weight) pairs
	)
);
@use "darkmode-plus-a11y/scss/theme-generator" as *;

@include generate-all-themes() using ($name) {
	// The package has already emitted the role variables (--bg-base,
	// --accent, …) for this theme. Add YOUR layer 3 here, derived from
	// the TRANSFORMED roles — the golden rule applies:
	--color-main-bg: #{$bg-base};
	--color-main-text: #{$fg-base};
	--color-card-bg: #{$bg-container};
}
```

`generate-all-themes($themes: (...))` accepts a subset for a lighter
CSS bundle. Runtime side:

```tsx
import { useTheme, THEMES, type ThemeOption } from "darkmode-plus-a11y/react";

const { theme, setTheme } = useTheme(); // + isDark, isHighContrast, …
```

Anti-FOUC: same as Path A step 3. Optional font modules:

```scss
@use "darkmode-plus-a11y/scss/modules/a11y-fonts" as * with ($a11y-fonts-path: "/fonts");
@include a11y-font-faces(); // @font-face for the bundled OFL fonts
@include a11y-font-classes; // .atkinson-font / .andika-font / …
```

## Tailwind projects

The package is SCSS-first, but the bridge is short: the engine's
output is **plain CSS custom properties per `[data-theme]` block** —
the same consumption pattern as shadcn/ui tokens. Your markup keeps
using Tailwind utilities; they just point at themed variables. **No
BEM anywhere in your code.**

Map the tokens as your **only** color theme — replace, don't extend,
so raw palette utilities (`bg-blue-500`) cease to exist and cannot
bypass theming:

```css
/* Tailwind v4 (CSS-first config) */
@import "tailwindcss";

@theme {
	--color-*: initial; /* drop Tailwind's raw palettes */
}
@theme inline {
	--color-base: var(--bg-base);
	--color-surface: var(--bg-container);
	--color-ink: var(--fg-base);
	--color-muted: var(--fg-muted);
	--color-accent: var(--accent);
	--color-link: var(--link);
	/* …map every role you use */
}
```

```js
// Tailwind v3 — tailwind.config.js. `colors` (NOT `extend.colors`):
module.exports = {
	theme: {
		colors: {
			transparent: "transparent",
			current: "currentColor",
			base: "var(--bg-base)",
			surface: "var(--bg-container)",
			ink: "var(--fg-base)",
			muted: "var(--fg-muted)",
			accent: "var(--accent)",
			link: "var(--link)",
			// …map every role you use
		},
	},
};
```

Then `bg-base text-ink hover:text-link` is themed across **every**
generated theme — dark, the four high-contrast variants, color-vision
deficiency, anti-glare. Delete your `dark:` color variants: one
semantic utility replaces `bg-white dark:bg-gray-900` and scales to
all themes with WCAG guarantees.

Rules on themed surfaces:

- Only mapped semantic utilities — never palette utilities
  (impossible if you replaced the theme) and never arbitrary values
  (`bg-[#3b82f6]`), which escape theming exactly like a raw hex in
  CSS. Optional CI guard (adapt the family list to taste):

  ```bash
  grep -rnE '(bg|text|border)-(red|blue|green|amber|stone|zinc|sky|violet)-[0-9]' src/ && exit 1
  ```

- The theme build stays a separate, one-file Sass step (see Path B);
  it does not touch your Tailwind pipeline.
- The scaffolded UI ships as SCSS. Its classes are **encapsulated in
  the copied component** — nothing leaks into your codebase. Either
  keep `sass` as a devDependency for those files, or compile them once
  to plain CSS you then own:

  ```bash
  npx sass a11y/scss:a11y/css --no-source-map
  ```

  Restyling the copied TSX with your own utilities is legitimate — you
  own it. Keep the ARIA attributes, the focus states, and the in-flow
  placement.

## Verifying your wiring

The package ships the verifier as importable primitives
(`darkmode-plus-a11y/testing/*`) — the same engine this repo runs on its 15
themes in CI. Three files and it runs in your project. Requirements: a
TypeScript-capable test runner (Jest shown; Vitest works the same) in
a **node** environment — the suite compiles your SCSS at test time.

**1. Configure the extraction** (once, before any measurement):

```ts
// a11y/contrast/setup.ts
import path from "node:path";
import { configureThemeExtraction } from "darkmode-plus-a11y/testing/extract-themes";

export const THEMES = ["light", "dark", "high-contrast"] as const; // your list

configureThemeExtraction({
	entry: path.resolve(__dirname, "../../styles/main.scss"), // emits the [data-theme] blocks
	loadPaths: [path.resolve(__dirname, "../../../node_modules")],
	themes: THEMES,
});
```

**2. Declare your pairs** — the package provides the role pairs (its
API surface); you add one pair per text/background combination your
components create:

```ts
// a11y/contrast/pairs.ts
import {
	defaultRolePairs,
	withWaivers,
	type ContrastPair,
} from "darkmode-plus-a11y/testing/pairs";

const sitePairs: ContrastPair[] = [
	{ id: "site/main-text-on-main-bg", fg: "--color-main-text", bg: "--color-main-bg", level: "text" },
	// level: "text" (4.5:1) | "large-text" (3:1) | "non-text" (3:1)
];

export const contrastPairs = [
	...withWaivers(defaultRolePairs, {
		// documented exceptions keyed by pair id — start with none
	}),
	...sitePairs,
];
```

**3. The test** — full matrix, every pair in every theme:

```ts
/** @jest-environment node */
import "./setup";
import { THEMES } from "./setup";
import { thresholdFor } from "darkmode-plus-a11y/testing/wcag";
import { measureRatio } from "darkmode-plus-a11y/testing/measure";
import { contrastPairs } from "./pairs";

describe("WCAG contrast — pair × theme matrix", () => {
	for (const pair of contrastPairs) {
		for (const theme of pair.themes ?? THEMES) {
			it(`${pair.id} meets its ${pair.level} threshold in "${theme}"`, () => {
				if (pair.waiver?.measured?.[theme] !== undefined) return; // documented failure
				expect(measureRatio(pair, theme)).toBeGreaterThanOrEqual(
					thresholdFor(pair.level),
				);
			});
		}
	}
});
```

**Optional — color-vision distinguishability** (ΔE CIEDE2000 between
simulated perceptions, for CVD themes):

```ts
import { defaultDistinguishabilityPairs } from "darkmode-plus-a11y/testing/pairs";
import { measureDeltaE } from "darkmode-plus-a11y/testing/measure";

for (const pair of defaultDistinguishabilityPairs) {
	for (const theme of pair.themes) {
		it(`${pair.id} stays distinguishable in "${theme}"`, () => {
			expect(measureDeltaE(pair, theme)).toBeGreaterThanOrEqual(pair.minDeltaE);
		});
	}
}
```

**Optional — high-contrast palette conformance** (the mechanical form
of the golden rule: in a high-contrast theme, every emitted color must
belong to the theme's palette — a raw value sticks out immediately).
Sketch, tune the role list to your HC palette:

```ts
import { getThemeVars } from "darkmode-plus-a11y/testing/extract-themes";

it("high-contrast emits only palette colors", () => {
	const vars = getThemeVars().get("high-contrast")!;
	const palette = new Set(
		["--bg-base", "--fg-base", "--accent", "--link", "--link-hover", "--focus-ring"].map(
			(role) => vars.get(role),
		),
	);
	for (const [name, value] of vars) {
		if (name.startsWith("--constant-")) continue; // declared athematic
		if (/^#|^rgb/.test(value)) expect(palette).toContain(value);
	}
});
```

**Optional — name-based semantic inspector** (complements the
value-based check above; catches its blind spot: crossed wiring that
lands **inside** the palette, e.g. `--color-menu-text` accidentally
wired to `$bg-base` — the value is in the palette, but the text is
invisible). Token names decide no color; they **monitor**: a name that
says "text" while the emitted value is the background color raises a
warning. Never blocking; legitimate contradictions get documented
waivers (e.g. `--fg-on-emphasis`: ink sitting on a colored block).

Quickest form — the CLI (needs Node ≥ 22.18 for native TypeScript; on
older Node, run the same file through `npx tsx`, or use the test-suite
form below):

```bash
npx darkmode-plus-a11y audit --entry styles/main.scss --load-path node_modules
# add --waive "^--my-inverted-chip=deliberately inverted block" per exception
# add --strict to exit 1 on active warnings (CI gate)
# add --out hc-audit.md for a markdown report
```

Test-suite form (same engine, plus your waivers and exact slots):

```ts
import { getThemeVars } from "darkmode-plus-a11y/testing/extract-themes";
import {
	runHcSemanticAudit,
	defaultHcWaivers,
} from "darkmode-plus-a11y/testing/hc-semantic-audit";
import { THEMES } from "./setup";

it("token names do not contradict their emitted colors", () => {
	const findings = runHcSemanticAudit({
		themes: THEMES.filter((t) => t.startsWith("high-contrast")),
		varsFor: (t) => getThemeVars().get(t),
		waivers: [
			...defaultHcWaivers,
			// { pattern: /^--my-inverted-chip/, reason: "deliberately inverted" },
		],
	});
	expect(findings.filter((f) => !f.waived)).toEqual([]);
});
```

By default the palette slots are derived from the emitted role
variables (best effort — `--focus-ring` may be wired to the link
color); pass `slotsFor` with the exact values of your HC color map for
precision.

### Failure modes (what each error means)

| Symptom | Meaning | Fix |
| --- | --- | --- |
| Sass build: `Undefined variable $…` | Layer 3 references a role that doesn't exist (typo, or removed at a major version) | Check the [role list](#the-golden-rule-layer-3); read the package changelog on majors |
| `extract-themes: theme "x" was not found` | Your `themes` list and your generated themes disagree | Align the list passed to `configureThemeExtraction` with `generate-all-themes` |
| `getVar: custom property "--x" is not defined` | A pair references a token you never emit | Fix the pair id/name, or emit the token |
| Ratio below threshold | Real contrast defect in that theme | Rewire the token to a stronger role; only if justified, document a waiver via `withWaivers` |
| A color survives high-contrast unchanged | Raw value in layer 3 (golden rule violation) | Derive the token from a role |
| `audit` warns "named X but emits Y" | The token's name contradicts its emitted color — usually wired to the wrong role | Fix the wiring; if the contradiction is deliberate (inverted block), add a justified waiver |

## Updating

- **Engine** (npm): strict semver. Adding a role/option = minor;
  removing/renaming = major, always with a deprecation path (`@warn`)
  first. A removed role fails your build **loudly** — never silently.
- **Copied UI**: never auto-updates. `npx darkmode-plus-a11y init --diff`
  lists what changed in the reference; port what you want by hand.
