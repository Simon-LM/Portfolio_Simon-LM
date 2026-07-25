<!-- @format -->

# darkmode-plus-a11y — integration guide

Guide for **AI agents and developers** integrating this package. The
instructions are deterministic: exact imports, exact commands, explicit
failure modes. A few points, though, are flagged **"surface this to your
human"** — choices (usually aesthetic, with an accessibility angle) an
agent should raise with the person it's building for instead of settling
them silently. Read it **before** wiring anything. `init` copies this
file into your project so it stays available next to the code you own.

> ⚠️ Snippets use the published package name (`darkmode-plus-a11y`).
> Installed it under a different name? `init --pkg <name>` rewrites the
> copied files accordingly; align hand-copied snippets yourself.
>
> ⚠️ **Every `0.x` release is a beta release** — the whole line, not just
> early ones. A breaking change can land in a **minor** release until
> `1.0.0`, where strict semver takes over. So when you bump a minor on a
> project you maintain, read the README's "Upgrading" section instead of
> assuming the build result is unchanged: the 0.5.0 adjustment-sign
> change, for one, alters colors **without failing the build**.
>
> Beta also means the API can still move for a good reason. If you hit a
> missing role, a theme that comes out wrong on this palette, or a step
> here that does not survive the codebase you are working in — **surface
> it to your human** and point them at the README's "Feedback wanted"
> section. A report now is worth more than a workaround.

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
  `("family", weight)` pairs, e.g. `("amber", 300)`. All **26 Tailwind
  families** are available, every weight (`50`…`950`):
  - Chromatic (17): `red`, `orange`, `amber`, `yellow`, `lime`, `green`,
    `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`,
    `purple`, `fuchsia`, `pink`, `rose`.
  - Neutral grays (5): `slate`, `gray`, `zinc`, `neutral`, `stone`.
  - Tinted neutrals (4): `taupe`, `mauve`, `mist`, `olive`.
- Path A UI dependencies: `react`, `react-select`, `react-icons`.
- A Sass compiler for the theme build (`sass` as a devDependency, or
  any bundler with SCSS support). It compiles separately from the rest
  of your pipeline and does not constrain it.
  **Declare it in the consuming project even though this package lists
  `sass` among its own dependencies** — that copy serves the `audit` CLI
  and the contrast suite, not the consumer's build. Under npm's flat
  `node_modules` the transitive copy is reachable, so omitting it seems
  to work; under pnpm it is not reachable and the build fails. Do not
  "optimize" this line away.

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

## Migrating an existing codebase

**This package is best adopted at the start of a project.** Greenfield is
easy: you pick a role as you write each rule, and the themes follow.
Retrofitting a site that already has **hundreds of hardcoded colors**
works — that is what this section is for — but it is the harder and
riskier path.

> ⚠️ **Surface this to your human before you start.** "Add dark mode to
> this site" sounds like an install and is a **refactor** of every
> stylesheet that names a color. Say so, and say why the cost is real:
> the mapping decisions below need judgement a tool cannot supply, the
> change touches a large number of files at
> once, and a wrong role choice is invisible in the light theme while
> breaking only some of the other fourteen. The verification suite checks
> the *result*, not the mapping choices that got you there. Let them
> decide whether to spend that, rather than discovering it mid-diff.

**No codemod ships, on purpose.** Mapping colors to roles needs
judgment (see below), so a blind find-and-replace would produce wrong
results. A capable coding agent refactors this reliably file by file —
lean on that, guided by the steps below, rather than a mechanical tool.

### 1. Find every hardcoded color

List them before you touch anything:

```bash
# raw hex (and, if you use them, rgb()/hsl() and Tailwind utility colors)
grep -rnE '#[0-9a-fA-F]{3,8}\b' src/
grep -rnE '\b(rgb|hsl)a?\(' src/
```

Group the results by **actual value**, not by file — you're about to
map values to roles, and two identical values must land on the same
role.

### 2. Map by VALUE, not by what the element "is"

The role names are a **"how visually distinct should this be" ladder**,
not a "what kind of element is this" catalog. `$bg-base` (page),
`$bg-subtle`, `$bg-container`, `$bg-container-high`, `$bg-emphasis`… are
each a *different* rail weight, by design, so a surface that should
read as raised looks raised.

The trap: picking a role from what an element **structurally is**
instead of what its color **was**.

- A "card" that was the **same** color as the page background in your
  original design must map to **the same role as the page** (usually
  `$bg-base`) — even though it's structurally a "card." Giving it
  `$bg-container` because "it's a card" invents a shade difference that
  wasn't there, and it can surface only in some themes (a card and page
  that match in light can drift apart — or collide — in dark, once each
  role's weight shift is applied).
- **Rule:** before mapping a color, compare it against the colors you've
  **already mapped**. Same original value → same role. Different value →
  the role whose lightness step matches how different it actually was.

An agent doing the refactor can't infer this from the code — the code
only shows the roles as configured, never the pre-migration design
intent. State it explicitly when you delegate the work.

### 3. Guiding the family choice (a conversation, not a lookup)

Every color you migrate becomes a Tailwind `("family", weight)` pair, so
the mechanical step is finding each color's nearest family and weight. But
that nearest match is a **starting point, not the verdict**. When you
guide a client, your job is to find it, surface what it will do across the
15 themes, offer alternatives, and let the client choose — not to pick for
them. And you don't know their colors up front — you read them off the
site — so keep every suggestion conditional on what you actually find.

For the **neutral rail** (the background's `$gray-family`), contrast holds
whatever they choose — the engine derives every text/surface pair from it
— so that family is a **look** choice, never right vs. wrong. **That is
not true for a color that will itself carry a contrast requirement** — a
status color, text set in a brand color, or the trigger icon that recolors
to a brand color on hover (UI placement). There the
*weight* IS the contrast: the declared light value is used as-is (only the
dark themes shift it), so a shade picked only for "closest to the brand
hex" can land below 4.5:1. For those roles, **fold the ratio into the
pick**: among the nearest family's weights, choose the nearest one that
already **meets 4.5:1** — not the nearest outright, checked after. If the
closest passing weight visibly departs from the brand color, that's a real
trade-off (accept the shift, or adjust the background it sits on) —
**surface it to your human**. Use the
[contrast suite](#verifying-your-wiring) *while* choosing, not only after.

The family choice matters most for the **background**, because the
background's family becomes the whole neutral rail (`$gray-family`), and
the dark themes are built by shifting that rail to its dark end, which
keeps the family's hue. So the family behind the background **tints the
entire dark mode**, far beyond that one surface.

The trade-off to lay out for the client, from a plain-gray dark to a
boldly colored one:

- Stays gray in dark: `neutral` (hueless), `zinc` (barely cool), `stone`
  (barely warm), then `gray` and `slate` (cooler; `slate` clearly blue).
- A gentle wash of color that still works in dark: `taupe` (warm brown),
  `mauve` (purple), `mist` (cyan), `olive` (green).
- Strongly its own color in dark: any chromatic family (`red`, `blue`,
  `emerald`…). A bold look some clients want and others find too much; if
  they want it, a `+2` weight shift toward `900`/`950` keeps the dark end
  dark enough to carry text.

For example, if the nearest match to a client's background turned out to
be a chromatic family, guiding them might sound like:

> "Your background's closest Tailwind match is `amber-50`. `amber` is a
> chromatic family, and the background's family becomes your whole neutral
> rail — so if we used it, your dark mode would come out strongly amber.
> Some people want that; if you'd rather a neutral dark, `neutral`,
> `zinc` or `stone` stay gray, and `taupe` keeps a hint of warmth without
> the strong color. Want to compare a few in the contrast suite?"

Same shape for any color that isn't an obvious match: name the nearest
one, say what it costs in the themes that matter, offer options, let the
client decide. If a family looks right in light but too colored in dark,
a `+1`/`+2` weight shift or a more neutral family are both on the table —
then measure with the [suite](#verifying-your-wiring).

## Path A — scaffolded UI

```bash
npx darkmode-plus-a11y init          # copies UI into ./a11y + fonts into ./public/fonts
npx darkmode-plus-a11y init --diff   # later: compare your copy against the reference
# Options: --dir <path> --pkg <import-name> --fonts <path> --force
```

**Re-running `init` is safe.** A file that already exists at the target
path is **skipped** (logged `skip (exists …)`), never overwritten —
same for the font files. It never errors on collisions. To pull a fresh
reference copy over your edited one, pass `--force` (or inspect first
with `init --diff`, which changes nothing and just lists what differs).

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
- `scss/theme-setup.scss` — where you configure your light theme once;
  the package generates every theme from it. **Permanent production
  code, not a throwaway sample** (it drives every theme on your site).
  Keep the filename: `init --diff` tracks upstream changes by exact
  path, so renaming your local copy silently drops it from that tracking.
- `AGENTS.md` — this guide.

Wiring steps:

1. **SCSS** — import, in this order, from your global stylesheet:

   ```scss
   @use "../a11y/scss/theme-setup"; // themes: roles + your layer 3
   @use "../a11y/scss/accessibility-features"; // fonts + dyslexia + motion
   @use "../a11y/scss/accessibility-trigger";
   @use "../a11y/scss/accessibility-menu";
   ```

   `theme-setup.scss` is where you declare your brand palette — as
   Tailwind `("family", weight)` pairs, in the `state` configuration at
   the top of the file (this is the same `@use … with (…)` shown under
   [Path B](#path-b--engine-only)):

   ```scss
   @use "darkmode-plus-a11y/scss/state" as * with (
   	$gray-family: "stone",
   	$primitives: (
   		"accent": ("amber", 300),
   		"link": ("sky", 700),
   		// …your brand; the file ships a full default set to edit
   	)
   );
   ```

   Then add your own layer-3 tokens; the golden rule applies to every
   line you add. Migrating an existing site? Read
   [Migrating an existing codebase](#migrating-an-existing-codebase)
   before choosing your primitive families.

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

   **Static HTML / Vite / any non-SSR SPA** — there's no server render
   to call the function per request, so pick one:

   - **Precompute once** (simplest): run the function once at build time
     and paste the returned string literally into your `index.html`
     `<head>`. It only changes if your theme *list* changes, so it's
     safe to hardcode:

     ```js
     // scripts/print-theme-script.mjs — run once, paste the output
     import { themeInitScript, THEMES } from "darkmode-plus-a11y/react";
     console.log(`<script>${themeInitScript(THEMES)}</script>`);
     ```

     ```html
     <!-- index.html <head>, before any stylesheet -->
     <script>
     	/* paste the printed string here */
     </script>
     ```

   - **Inject at build time** (stays in sync automatically): emit it
     from a Vite plugin so a theme-list change never goes stale:

     ```js
     // vite.config.js
     import { themeInitScript, THEMES } from "darkmode-plus-a11y/react";
     export default {
     	plugins: [
     		{
     			name: "a11y-anti-fouc",
     			transformIndexHtml: (html) =>
     				html.replace("</head>", `<script>${themeInitScript(THEMES)}</script></head>`),
     		},
     	],
     };
     ```

   Either way the script must run **before your first stylesheet** so
   the attribute is set before first paint.

4. **UI placement** — render the trigger **IN THE DOCUMENT FLOW**,
   typically in your header:

   ```tsx
   import AccessibilityControl from "@/a11y/react/AccessibilityControl";

   <AccessibilityControl language="en" />;
   ```

   - ⚠️ **NEVER a floating `position: fixed` button**: it overlaps
     content at high zoom — an accessibility defect. No obvious spot?
     Use a **pre-header band** — a full-width strip in normal flow,
     above the header, with the trigger at the end:

     ```tsx
     <div className="a11y-band">
     	<AccessibilityControl language="en" />
     </div>
     ```

     ```scss
     .a11y-band {
     	display: flex;
     	justify-content: flex-end;
     	// rem/em only — no fixed px, so it reflows under zoom
     	padding: 0.25rem 1rem;
     	// it's in the flow: it pushes content down, never overlaps it
     }
     ```

     Being in the flow (not `fixed`) is the whole point: at high zoom it
     reflows and pushes the page down instead of covering it.
   - **Hover / focus — surface this to your human** (don't silently keep
     the bare default). At its interactive states the trigger has one
     rule: **the icon and its background stay a contrast-safe pair**. What
     *moves* to signal the state is a design choice — raise it with your
     human. Three shapes:
     - **invert both** (the shipped default): background and icon swap
       (`--fg-base` ⇄ `--bg-base`) — safe on all 15 themes, no checks.
     - **move the background**: let a site-wide `button:hover, a:hover`
       fill the button with the interaction color (e.g. `--link-hover`);
       the icon follows to stay readable. To do this, delete the trigger's
       own hover/focus background & color (keep the focus outline) so the
       global rule takes over.
     - **move the icon**: keep the background, recolor the icon on hover
       (e.g. a light header where the surface must not change). The icon
       color is then a foreground on the button, so its **weight must pass
       4.5:1** on that background — the
       same rule as [§ Guiding the family choice](#3-guiding-the-family-choice-a-conversation-not-a-lookup).

     Whichever shape, the icon is recolored **explicitly**: the inline
     SVG's `fill=currentColor` doesn't follow the hover on its own, so the
     shipped `…button:hover svg g { fill: … }` line drives it — set it to
     whatever keeps the pair readable. High-contrast keeps its own
     inversion. Verify the hover pair on the themes you ship (dark and
     anti-glare especially).
   - Props:
     - `language` — `"fr" | "en"` (required). Labels are FR/EN today;
       for another language, edit the copied component (you own it).
     - `position?` — `"top-right" | "top-left" | "bottom-right" |
       "bottom-left"` (default `"top-right"`): the corner the panel
       opens toward, **not** the button's page position (you place the
       button yourself, in the flow).
     - `icon?` — a `ReactNode` rendered inside the button (default: the
       package's accessibility pictogram). Pass any element:
       `icon={<MyIcon />}`.
     - `complianceUrl?` — `string`; when set, the menu shows a link to
       your accessibility-statement page.

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
	// Emit the package's role variables (--bg-base, --accent, …) for
	// this theme — the contrast suite reads them, and your runtime CSS
	// can use them via var().
	@include emit-role-vars();
	// Then add YOUR layer 3, derived from the TRANSFORMED roles — the
	// golden rule applies:
	--color-main-bg: #{$bg-base};
	--color-main-text: #{$fg-base};
	--color-card-bg: #{$bg-container};
}
```

`generate-all-themes($themes: (...))` accepts a subset for a lighter
CSS bundle.

### Per-theme engine overrides (`$configs`)

Each generated theme runs its engine with a default config. Pass
`$configs` (theme name → **partial** config) to adjust one without
redefining the rest — the partial map is **deep-merged** over that
theme's defaults, so e.g. one extra `family-remap` entry extends the
default table instead of replacing it:

```scss
@include generate-all-themes(
	$configs: (
		// Your accent family collides under tritanopia? Add ONE remap
		// entry; the default amber/sky entries are kept.
		"tritanopia": ("family-remap": ("indigo": ("sky", 0))),
		// Nudge the dark-mode link one weight toward the dark end
		// (-1 would move it toward the light end — see below):
		"dark": ("adjustments": ("link": 1)),
	)
) using ($name) { /* … */ }
```

**How to know whether you need one:** a family ABSENT from a CVD
theme's `family-remap` table is left unchanged — the default tables
only cover the default primitives' families. Whether YOUR families
stay distinguishable under a given deficiency is a property of your
palette's role pairs, not of a family in isolation: run the
distinguishability suite (§ Verifying your wiring) and add a remap
entry only if a pair fails there.

#### Dark `adjustments`: what the sign means

The dark engine moves every weight **away from its own end** of the
11-step rail: a light weight darkens, a dark weight lightens, and `500`
— the pivot — stays put. Those two directions are what makes the theme
flip (a foreground declared dark for a light surface has to come back
light over a dark one), so they are structural, not a setting.

`adjustments` is the per-role knob on top of that shift, and its sign is
**absolute** — it does not follow the shift's direction:

- `+N` → **toward the dark end** (`950`)
- `-N` → **toward the light end** (`50`)

This reads the same on both sides of the pivot, so a config can be
understood without knowing which side a role's light value sits on.

Two behaviors to know before reaching for it:

- **The rail ends saturate; they do not wrap.** A role pushed past `50`
  or `950` stops there. That is deliberate: it parks the color on the end
  it was traveling toward, which is the readable one for that theme.
  Wrapping would drop a foreground back onto a dark weight over a dark
  surface — unreadable, and with nothing to signal it. So if an
  adjustment appears to do nothing, the role is already parked on that
  end: move it the other way, or change the light-theme weight it starts
  from.
- **`link` and `link-hover` are shifted as a pair.** Two neighboring
  weights of one family can both overshoot the same end; clamped
  separately they would collapse into one color, leaving a hover state
  identical to the link. The pair is slid back onto the rail together
  instead, so the gap the light theme declared survives. You should not
  need an adjustment to keep a hover distinct from its link — and roles
  from different families are left alone, since the hue already
  separates them.

A collapsed pair is worth understanding because **the contrast suite
cannot catch it**: both values are perfectly readable, and only the
difference between them is gone. Distinguishability is what covers it.

Runtime side:

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
themes in CI. The subpaths resolve to a **prebuilt CommonJS dist with
type declarations**: no transform config needed for `node_modules`, any
Jest or Vitest setup works as-is. Three files and it runs in your
project — in a **node** environment (the suite compiles your SCSS at
test time).

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

`entry` is compiled by **Sass directly**, not by your bundler — so it
must be resolvable without bundler-only magic:

- **`@use`/`@import` paths must resolve via `loadPaths`**, not via a
  bundler alias (Vite's `@styles/…`, a `tsconfig` path, webpack
  `resolve.alias`). Sass never sees those. Add the directories they
  point to as extra `loadPaths` entries instead.
- **`entry` should be a minimal file that only assembles your theme
  setup** (`theme-setup.scss` + your layer-3 partials) and emits the
  `[data-theme]` blocks — not your whole global stylesheet. Pulling in
  unrelated component styles just slows the compile and risks alias
  imports Sass can't follow. If your real global stylesheet uses
  aliases, point `entry` at a small alias-free file built for this.

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

Quickest form — the CLI (runs the prebuilt dist, no Node version
requirement):

```bash
npx darkmode-plus-a11y audit --entry styles/main.scss --load-path node_modules
# add --waive "^--my-inverted-chip=deliberately inverted block" per exception
# add --strict to exit 1 on active warnings (CI gate)
# add --out hc-audit.md for a markdown report
```

`--waive` grammar — `"<regex>=<reason>"`:

- The **first `=`** is the separator. Everything before it is a
  **JavaScript regular expression** matched against custom-property
  names (`^--foo$` for one exact token, `^--chip-` for a family); the
  match is not anchored unless you anchor it. Everything after the first
  `=` is the free-text reason and **may itself contain `=`**.
- Property names never contain `=`, so the left side won't need a
  literal one. Repeat `--waive` once per exception.
- **Always quote the whole argument** in your shell — regexes use `^`,
  `$`, `|`, `(`, `)`, which the shell would otherwise interpret. Single
  quotes are safest in CI: `--waive '^--x$=reason'`.

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

- **Engine** (npm): strict semver **from `1.0.0`** — adding a
  role/option = minor; removing/renaming = major, always with a
  deprecation path (`@warn`) first. **The package is currently in `0.x`,
  where a breaking change can land in a minor release**; check the
  README's "Upgrading" section when you bump a minor. Either way, a
  removed role fails your build **loudly** — never silently.
- **Copied UI**: never auto-updates. `npx darkmode-plus-a11y init --diff`
  lists what changed in the reference; port what you want by hand.
