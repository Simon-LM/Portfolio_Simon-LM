<!-- @format -->

# Plan — E6.5: extracting the theme generator into the package

Written 2026-07-12, after the §6.2 reconciliation audit (README). Closes
gap #1: the **`[data-theme]` emitter + standard theme definitions** are
still on the site side while §6.2 places them in the package. Executed on
branch `feat/e6-5-theme-generator`.

## Goal (Simon's vision, packaged)

Today, a consumer would have to rewrite their 15 `[data-theme]` blocks by
hand. Target:

```scss
// consumer side: configure LIGHT once…
@use "darkmode-plus-a11y/scss/state" with ($gray-family: …, $primitives: …);

// …list the themes wanted, and the PACKAGE generates them all:
@include generate-all-themes(("light", "dark", "high-contrast", …)) {
	@include emit-layer3-vars;   // their layer 3 (via @content), derived from the roles
}
```

**"I define light → every other theme is generated automatically"**
becomes true on the package side, not just on the site side.

## The cut (verified in the code)

`generate-theme-css-vars()` (site, `_theme-system.scss`) splits **cleanly**:

- **lines 22-72 = PACKAGE variables**: `--off-white`, `--near-black`,
  `--constant-*`, `--gray-*` (rail), `--accent*`, `--link*`, `--success`,
  `--danger`, every `--bg-*`/`--fg-*`/`--border-*`/`--focus-ring` role.
- **lines 74+ = site LAYER 3**: the ~70 `--color-*`.

The 16 theme files (753 lines) are ~90% engine config + emission
(**product** → package); the rest = a few site rules (focus/header in
high-contrast, 1-2 in dark/anti-glare → **stay with the consumer**).

## Design

The package gains a `theme-generator` module providing:

1. **`apply-theme($name)`** — dispatches to the right transform with the
   theme's **standard config**: `define-base-colors()` + `apply-roles()` +
   (depending on `$name`) `transform-light-to-dark($dark-config)`,
   `transform-light-to-high-contrast($map)` (× 4 variants), color-blind
   remaps, anti-glare… The **standard configs** (the 11-step `$dark-config`,
   the 4 HC maps, the CVD anchors, anti-glare) **migrate from the site to
   the package** — this is the heart of the product.
2. **`emit-role-vars()`** — emits the package's variables (ex-lines 22-72).
3. **`generate-all-themes($themes) { @content }`** — for each theme:
   ```scss
   [data-theme="#{$name}"] {
     @include apply-theme($name);   // transform → transformed roles
     @include emit-role-vars();     // package variables
     @content;                      // consumer's layer 3 (same roles)
   }
   ```
   The `@content` reads the **already-transformed** roles (the transform
   has already run) → the consumer's layer 3 simply comes out for each
   theme.
4. **`$default-themes`** — the 15 standard names (default for
   `generate-all-themes`).

On the **consumer** side (the portfolio becomes a client of its own API):
`emit-layer3-vars` = the ex-lines-74+ block, and the **site rule
overrides** (HC header, focus, dark/anti-glare tweaks) go through a
**per-theme hook** `@include theme-overrides($name)` included inside the
`@content`.

## Oracle

**Byte-identical compiled site CSS** (the portfolio switches to
`generate-all-themes` but produces exactly the same CSS). This is the
guarantee that the extraction changes nothing — same method as E3/E5. The
package-vars (22-72) then layer-3 (74+) cut preserves the current emission
order.

## Phases

### Phase 0 — Preparation
Baseline: reference CSS + build. Exhaustive inventory of the theme configs
to migrate (dark, 4× HC, 6× CVD, 2× anti-glare) and the site rules to keep.

### Phase 1 — `theme-generator` module in the package (pure addition)
`apply-theme($name)` + `emit-role-vars()` + `generate-all-themes()` +
`$default-themes`, with the standard configs migrated **as package
defaults**. No site change yet. SCSS unit tests: each standard theme
emitted by the package == expected values.
**Commit**: `feat(theme): e6.5 phase 1 — package theme generator`.

### Phase 2 — The portfolio consumes the generator
`_theme-system.scss` reduced to `@include generate-all-themes($portfolio-themes) { @include emit-layer3-vars; @include theme-overrides($name); }`.
The 16 theme `_*.scss` files disappear (their product is in the package;
their site overrides go into `theme-overrides`).
**Oracle**: **byte-identical CSS**. **Commit**: `refactor(theme): e6.5 phase 2 — portfolio consumes generate-all-themes`.

### Phase 3 — Per-theme site overrides
`theme-overrides($name)` cleanly groups the site rules (HC header, HC
focus, dark/anti-glare tweaks) — verified byte-identical.
**Commit**: `refactor(theme): e6.5 phase 3 — per-theme site overrides hook`.

### Phase 4 — Wrap-up
- Update the E6 example: `theme-example.scss` reduces to
  `@include generate-all-themes(...) { @include a11y-ui-theme-vars; }`.
- README (§ 6.2: items 3+5 checked off for the package; § 1 unchanged),
  changelog, GUIDE (E6.5 in the roadmap). Final report.
**Commit**: `docs(theme): e6.5 phase 4 — wrap-up`.

## Risks / points of attention

- **Byte-identical across 15 themes × ~94 vars**: the risk is emission
  order and site overrides. Normalized diff at each phase (like E3, which
  pulled off the same kind of extraction).
- **`with()` configuration**: `generate-all-themes` must see the
  consumer's config (`$gray-family`, `$primitives`) — loaded first, as is
  already the case in `main.scss`.
- **Layer-3 entanglement**: the key is `@content` — the package emits ONLY
  its own variables, layer 3 stays with the consumer, injected per theme.
  No layer 3 leaks into the package.

## Out of scope

- Extracting the **contrast verifier** (audit gap #2) → separate E6.6 chantier.
- Full central role→step registry (README § 7) — not required here.
- Rendering change: zero. This is an extraction, not a redesign.
