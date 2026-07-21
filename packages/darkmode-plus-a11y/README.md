<!-- @format -->

# darkmode-plus-a11y

You came for dark mode. Your users leave with **15 accessible themes**
— dark, four high-contrast variants, seven color-vision-deficiency
palettes, anti-glare — all **generated from your light theme** at
compile time, with WCAG contrast **enforced mechanically**, not
promised.

## Why this exists

Assistive software of professional quality costs users hundreds to
thousands of euros. The technologies behind it are not exotic — they
just need to be normalized and spread. This package builds that quality
**into your website itself**, free for the end user: the person who
needs yellow-on-black high contrast, a color-blind-safe palette, or a
dyslexia-friendly font gets it from _your_ site, not from a €2,000
license.

## What you get

- **One light theme in, 15 themes out.** Declare your gray family and
  brand primitives once (as Tailwind-geometry `("family", weight)`
  pairs); the engine derives dark, `high-contrast` (yellow, green,
  white, paper), all six chromatic CVD themes plus achromatopsia, and
  two anti-glare themes (OKLCH-based) — as plain CSS custom properties
  per `[data-theme]` block.
- **Guarantees, not intentions.** A contrast suite you run in your own
  CI (WCAG ratio per pair per theme), color-vision distinguishability
  checks (ΔE CIEDE2000 on simulated perception), and a semantic
  inspector (`npx darkmode-plus-a11y audit`) that catches tokens wired
  to the wrong role — the mistake your eyes can't see in 15 themes.
- **React runtime.** `useTheme`, `usePrefersDarkMode`, a generic
  `usePreference`, and an anti-FOUC inline script so the right theme
  paints first.
- **Accessible typography modules** (opt-in). Bundled OFL fonts —
  OpenDyslexic, Andika, Atkinson Hyperlegible Next, Lexend Giga/Deca —
  with `@font-face` emission, font-selector classes with x-height
  compensation (`font-size-adjust`), a configurable dyslexia mode
  (BDA-aligned spacing), and a reduced-motion module.
- **A ready-made accessibility menu**, copied into your project by
  `init` (shadcn model): trigger button + card (theme switcher, font
  selector, text-size control). You own the copy — restyle it, translate
  it, rewire it. `init --diff` shows upstream changes when you want
  them.

## Quick start

```bash
npm install darkmode-plus-a11y
npm install -D sass
npx darkmode-plus-a11y init   # copies the UI into ./a11y + fonts into ./public/fonts
```

1. Declare your brand palette in `a11y/scss/theme-setup.scss` — as
   Tailwind `("family", weight)` pairs (all 26 families are available):

   ```scss
   @use "darkmode-plus-a11y/scss/state" as * with (
   	$gray-family: "stone",
   	$primitives: (
   		"accent": (
   			"amber",
   			300,
   		),
   		"link": (
   			"sky",
   			700,
   		),
   		// …your brand; see theme-setup.scss for the full default set
   	)
   );
   ```

2. Import the copied SCSS from your global stylesheet (adjust the
   relative path):

   ```scss
   @use "./a11y/scss/theme-setup"; // your palette → all 15 themes
   @use "./a11y/scss/accessibility-features"; // fonts + dyslexia + motion
   @use "./a11y/scss/accessibility-trigger";
   @use "./a11y/scss/accessibility-menu";
   ```

3. Set the theme **before first paint** (anti-FOUC), e.g. Next.js App
   Router:

   ```tsx
   import { themeInitScript, THEMES } from "darkmode-plus-a11y/react";

   <head>
   	<script dangerouslySetInnerHTML={{ __html: themeInitScript(THEMES) }} />
   </head>;
   ```

   Not on Next.js? `themeInitScript(THEMES)` is a plain string — inline
   it in a `<script>` in `<head>` however your stack allows (static
   `index.html`, Vite plugin…). See
   [AGENTS.md § Path A](./AGENTS.md#path-a--scaffolded-ui), step 3, for a
   static-HTML worked example.

4. Render the trigger **in your header, in the document flow** — never
   a floating `position: fixed` button (it overlaps content at high
   zoom):

   ```tsx
   import AccessibilityControl from "@/a11y/react/AccessibilityControl";

   <AccessibilityControl language="en" />;
   ```

5. Wire your own tokens in `a11y/scss/theme.config.scss` — **every
   token derives from a role** (`$bg-base`, `$accent`, `$link`…), never
   a raw `#hex`. That single rule is what makes all 15 themes correct.
   Migrating an existing site? Read
   [Migrating an existing site](#migrating-an-existing-site) below first
   — picking a role from what an element _looks like_ instead of what
   its original color _was_ is the most common migration mistake.

6. Verify mechanically:

   ```bash
   npx darkmode-plus-a11y audit --entry styles/main.scss --load-path node_modules
   ```

   …and add the contrast suite to your tests — the full recipe lives in
   [AGENTS.md](./AGENTS.md#verifying-your-wiring).

Prefer your own UI? Skip `init` and use the engine directly
([AGENTS.md § Path B](./AGENTS.md#path-b--engine-only)) — one
`generate-all-themes()` call. Every theme's engine config can be
tuned per theme through its `$configs` parameter (partial maps,
deep-merged over the defaults — see
[AGENTS.md § Per-theme engine overrides](./AGENTS.md#per-theme-engine-overrides-configs)).

## The API: 3 layers, one rule

1. **Palettes** — Tailwind color geometry (your brand as
   `("family", weight)` pairs), all **26 Tailwind families** (every
   weight, 50…950): the 17 chromatic hues (`red`, `orange`, `amber`,
   `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`,
   `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`), the 5
   neutral grays (`slate`, `gray`, `zinc`, `neutral`, `stone`), and the
   4 tinted neutrals (`taupe`, `mauve`, `mist`, `olive`). Your gray
   family tints the whole dark theme, so it's a look choice worth
   weighing — see [Migrating an existing site](#migrating-an-existing-site)
   below.
2. **Roles** — the package API the engines transform per theme:
   backgrounds (`$bg-base`, `$bg-subtle`, `$bg-container`,
   `$bg-container-high`, `$bg-emphasis`, `$bg-emphasis-strong`,
   `$bg-inverse`), foregrounds (`$fg-base`, `$fg-muted`,
   `$fg-on-accent`, `$fg-on-emphasis`), brand (`$accent`,
   `$accent-strong`, `$accent-ink`, `$accent-soft`), links & focus
   (`$link`, `$link-hover`, `$focus-ring`), borders (`$border-base`,
   `$border-subtle`, `$border-strong`), status (`$success`, `$danger`),
   and the neutral rail (`$gray-50`…`$gray-950`, `$off-white`,
   `$near-black`).
3. **Your tokens** — each defined **from a role**, emitted per theme as
   CSS custom properties.

Roles follow strict semver: adding is a minor, removing or renaming is
a major with a deprecation path — and a removed role fails your Sass
build loudly, never silently in production.

## Migrating an existing site

Retrofitting a site that already has hardcoded colors? Two things trip
people up most — both covered in full, with grep recipes, in
[AGENTS.md § Migrating an existing codebase](./AGENTS.md#migrating-an-existing-codebase):

- **Map a color by its VALUE, not by what the element is.** The roles
  are a "how visually distinct should this be" ladder (`$bg-base` <
  `$bg-container` < `$bg-emphasis`…), not an element catalog. A "card"
  that was the **same** color as your page background should map to the
  **same role** as the page (usually `$bg-base`) — giving it
  `$bg-container` "because it's a card" invents a shade difference that
  wasn't there and can surface in only some themes. Rule of thumb: two
  elements that were the same hex → the same role.

- **A color's nearest family is a starting point, not the verdict —
  weigh the dark-mode look you want.** Contrast holds whatever you pick,
  so this is a look choice, not a correctness one. It matters most for
  your **background**, whose family becomes the whole neutral rail and
  tints every dark theme (the dark themes come from the rail's dark end,
  which keeps the family's hue). Along the spectrum: `neutral`/`zinc`/
  `stone` stay gray, `gray`/`slate` go cooler (`slate` clearly blue),
  the tinted neutrals `taupe`/`mauve`/`mist`/`olive` add a gentle wash
  that still works in dark, and a chromatic family (`blue`, `emerald`…)
  gives a boldly colored dark (a `+2` toward `900`/`950` keeps it
  usable). Find the nearest match to a real color on your site, then move
  along that spectrum to the look you want — the nearest match may itself
  be a colored family, which is fine if that's what you're after. Check
  with the contrast suite.

## SCSS-first — and a real bridge for Tailwind projects

This package is **SCSS-first by conviction**: the guarantees live at
compile time (a mistyped role is a build failure, not a shipped bug),
and the discipline it encodes — relative units, roles over raw colors —
is what deep accessibility requires.

Using Tailwind? The bridge is short and honest: the engine's output is
plain CSS variables, so you map them once as **semantic utilities**
(the shadcn pattern) and keep writing Tailwind. One `bg-base` replaces
`bg-white dark:bg-gray-900` — and scales to all 15 themes. See
[AGENTS.md § Tailwind projects](./AGENTS.md#tailwind-projects) for the
v3/v4 snippets and the guard that makes raw palette utilities
impossible.

## Scope and direction

Today this package covers **colors (the theme system) and text fonts**
(plus the dyslexia-typography and reduced-motion modules). The
long-term direction is broader — coding recommendations for layouts
that survive extreme magnification, far beyond WCAG's 400 % reflow —
but that is future work, not a shipped feature.

## Good to know

- **Prebuilt dist.** `react/` and `testing/` are consumed as compiled
  CommonJS with type declarations (`dist/`, built at pack time): no
  transpile step, no `transpilePackages`, no Node version requirement —
  any bundler and any test runner just works. The TypeScript sources
  ship alongside for reading and debugging.
- **Dependency weight.** `sass`, `postcss`, and `culori` are regular
  dependencies on purpose: they power the verification suite and the
  zero-config `audit` CLI — the guarantees are the product, so the
  batteries come included.
- **UI languages.** The copied menu ships FR/EN labels; for another
  language, edit your copy — you own it.
- **Fonts licensing.** Bundled fonts are OFL 1.1 (license texts in
  `fonts/LICENSES/`); the package code is MIT. SPDX:
  `MIT AND OFL-1.1`.
- **For AI agents** (and humans who want the deterministic version):
  [AGENTS.md](./AGENTS.md) is the integration contract — exact
  commands, failure modes, both integration paths. `init` copies it
  next to the code.

---

Made by [Simon LM](https://www.simon-lm.dev) (LostInTab) — web
accessibility specialist. The engine runs in production on his
portfolio, which is also the reference consumer for every guarantee
this package ships.
