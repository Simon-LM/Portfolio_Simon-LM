<!-- @format -->

# Execution plan — off-palette color anchor (silent safety net)

Second post-publication-prep chantier of `darkmode-plus-a11y`, designed
together with Simon on 2026-07-17 right after
[PLAN-complete-palette.md](./PLAN-complete-palette.md) (26-family
OKLCH palette) merged to `main`.

## The idea (Simon's, 2026-07-17)

The package is designed to work with primitives chosen **from the
Tailwind color palettes** — that is the documented, supported path
(see `resolved-primitive()` in `_state.scss`). A consumer who bypasses
it (hand-assigns a role to a color outside the palette) is off-spec,
and the package does not promise a clean result for that.

But today's fallback for that case is crude and inconsistent between
engines (dark mode: a generic ±30-40% HSL lightness shift with **no
gamut guard** — a confirmed, currently-parked bug, see
`project_theme_system_workstream` memory / TODO.md; CVD: an OKLCH hue
rotation toward a safe anchor). Simon's proposal: **detect the nearest
Tailwind palette entry (family + weight) to the given color, and use
that anchor's family/weight to drive derivations** (the dark mirror,
the CVD family classification) — without replacing the user's actual
light-mode color, which stays exactly what they gave (upgraded to
OKLCH if it wasn't already, per the existing 2026-07-15 fix in
`remap-for-cvd`).

**This is not a documented feature.** It stays out of the README/AGENTS
guides on purpose, so it doesn't invite off-spec usage — it is a
**silent safety net**: if someone does it anyway, the result is bounded
by palette quality (imperceptibly good to plausible) instead of
undefined/broken, and a `@warn` at compile time tells them so.

## Why this is worth doing (recap of the design discussion)

1. **Coherent with the engine's own logic.** Everything already
   reasons in Tailwind geometry (family, weight): the dark mirror
   shifts weight around 500, CVD classifies by family, status anchors
   resolve a weight within a family. Anchoring projects an unknown
   color onto that same geometry — the nearest point on the 26×11
   grid. Every derivation then runs through the **existing, calibrated**
   machinery — no parallel path to build or maintain.
2. **Strictly better than today's fallbacks.** It also happens to fix,
   as a side effect, the dark-mode gamut gap found and parked on
   2026-07-17 (`adjust-lightness-clamped` has no gamut guard at all,
   confirmed: `oklch(39% 0.164 32.9deg)`, `in-gamut: false`) — an
   anchored result is a real palette color, in-gamut by construction.
3. **A real, measured bonus**: a consumer who pastes a **Tailwind v3
   hex value** (very common — design tools export hex, and v3's hex
   values are all over the web) lands extremely close to its v4 OKLCH
   counterpart (measured below) and gets silently, correctly
   recognized — instead of being treated as a stranger.

## Decisions (Simon, 2026-07-17)

- **Light-mode discontinuity between the anchor and derived themes**:
  **accepted for v1** (off-spec, no clean-result promise). The V2 idea
  (apply the anchor's transformation *delta* to the user's color
  instead of substituting the anchor) is **not built here** — logged
  durably in [TODO.md](./TODO.md) instead of this plan, since a plan is
  provisional (closed once executed) and TODO.md is the "don't forget"
  list.
- **Thresholds**: Simon delegated to measured recommendations (below).
- **Single entry point**: extend `analyze-tailwind-color()` — every
  engine (dark, CVD) consumes its result, no separate logic per engine.

## Technical design

### The distance metric is SCSS-native, NOT the testing layer's CIEDE2000

The projection must happen **at SCSS compile time** (inside the
engine, e.g. `auto-dark-transform`, `remap-for-cvd`) — the
`differenceCiede2000()` used by `testing/measure.ts` is TypeScript
(culori), unavailable to the SCSS engine. Full CIEDE2000 needs
`atan2` plus several weighting/rotation terms — verified that Dart
Sass 1.101.0 (this project's version) **does** expose
`math.cos`/`math.sin`/`math.atan2`, but a full CIEDE2000 port in SCSS
is significant, unproven-in-this-codebase machinery for a feature that
explicitly makes no cleanliness promise.

**Proposed metric**: Euclidean distance on OKLCH's Cartesian
projection — `a = C·cos(H)`, `b = C·sin(H)` (the same idea as CIELAB's
a\*/b\*, computed directly on OKLCH channels instead of true Lab).
Naturally handles near-zero-chroma colors (a, b → 0 as C → 0,
regardless of H — no special-casing for `hue: none`, e.g.
`oklch(98.5% 0 none)`). Much simpler than CIEDE2000 (no weighting
functions, no rotation term), fully computable in SCSS:

```scss
@function oklch-distance($c1, $c2) {
	$l1: math.div(color.channel($c1, "lightness", $space: oklch), 1%);
	$c1c: color.channel($c1, "chroma", $space: oklch);
	$h1: color.channel($c1, "hue", $space: oklch);
	$l2: math.div(color.channel($c2, "lightness", $space: oklch), 1%);
	$c2c: color.channel($c2, "chroma", $space: oklch);
	$h2: color.channel($c2, "hue", $space: oklch);
	@if meta.type-of($h1) != "number" { $h1: 0deg; }
	@if meta.type-of($h2) != "number" { $h2: 0deg; }
	$a1: $c1c * math.cos($h1);
	$b1: $c1c * math.sin($h1);
	$a2: $c2c * math.cos($h2);
	$b2: $c2c * math.sin($h2);
	@return math.sqrt(
		math.pow($l1 - $l2, 2) + math.pow(($a1 - $a2) * 100, 2) +
			math.pow(($b1 - $b2) * 100, 2)
	);
}
```

(Probed directly against this codebase's palette via a throwaway SCSS
file — not yet added to the source tree.)

### Measured thresholds (SCSS-native metric, real palette values)

| Comparison | `oklch-distance` |
| --- | --- |
| v3 hex `#ea580c` vs v4 `orange-600` (worst sampled v3→v4 drift) | 2.77 |
| v3 hex `#f59e0b` vs v4 `amber-500` | 2.33 |
| v3 hex `#0c4a6e` vs v4 `sky-900` | 0.55 |
| `blue-600` vs `blue-700` (smallest sampled adjacent-weight gap) | 5.84 |
| `red-500` vs `red-600` | 6.11 |
| Custom brand blue `#6866e9` vs `blue-600` | 8.91 |
| Custom brand blue `#6866e9` vs `indigo-600` | 10.04 |
| Custom brand blue `#6866e9` vs `violet-600` (today's only real anchor) | 13.63 |

There is a clean separation between "same color across Tailwind
versions" (≤ 2.77 in this sample) and "genuinely one weight over"
(≥ 5.84) — wider, proportionally, than the same comparison measured in
CIEDE2000 (2026-07-17 exploration: 0.59–6.1 vs 7.13–14.49), which is
reassuring but was on a **small sample** (3 v3-pairs, 2 adjacent-weight
pairs). **Recommended starting threshold: `oklch-distance ≤ 4`** for
"same color, silent" — roughly centered in the gap, comfortable margin
both directions. **Phase 1 of execution should compute this
exhaustively** (every family/weight that exists in both a known v3
hex set and the current v4 palette; every adjacent-weight pair across
all 26 families) before locking the constant, rather than trusting
this sample alone.

Confirms the real-world case: the sampled custom brand color anchors
correctly to `blue-600` (8.91, nearest) rather than `violet-600`
(13.63, what it would have gotten before 0.2.0's palette expansion) or
`indigo-600` (10.04) — directly validating both this chantier and the
value of 0.2.0's family expansion.

### `analyze-tailwind-color()` — extended, single choke point

Currently: exact-match walk over `$colors`, returns
`("family", "weight", "found")`. Extend to always track the nearest
entry during that same walk (no second pass):

```scss
@function analyze-tailwind-color($color) {
	$nearest-family: null;
	$nearest-weight: null;
	$nearest-distance: null;

	@each $family-name, $family-map in $colors {
		@each $weight, $value in $family-map {
			@if $color == $value {
				@return (
					"family": $family-name, "weight": $weight,
					"found": true, "distance": 0,
				);
			}
			$d: oklch-distance($color, $value);
			@if $nearest-distance == null or $d < $nearest-distance {
				$nearest-distance: $d;
				$nearest-family: $family-name;
				$nearest-weight: $weight;
			}
		}
	}

	@return (
		"family": null, "weight": null, "found": false,
		"nearest-family": $nearest-family,
		"nearest-weight": $nearest-weight,
		"distance": $nearest-distance,
	);
}
```

Callers (`auto-dark-transform`'s "not found" branch,
`remap-for-cvd`'s "outside the palette" branch) then decide, from
`distance`:

- `distance <= $off-palette-same-color-threshold` (proposed constant,
  starting value `4`, see above): treat exactly like `found: true`
  using `nearest-family`/`nearest-weight` — **silent**, no warning
  (this is the "pasted a v3 hex" / "trivial rounding" case).
- `distance > threshold`: **anchor** — derive from
  `nearest-family`/`nearest-weight` (dark mirror weight-shift, CVD
  family classification) instead of the current generic fallbacks, and
  emit **one `@warn` per token** (not per theme — would be noisy):
  `"«name»: off-palette color, anchored to «nearest-family»-«nearest-weight» for derived themes (distance «distance») — result not guaranteed, prefer a Tailwind primitive."`
- The **light-mode value itself is untouched** beyond the existing
  `color.to-space($color, oklch)` upgrade (2026-07-15 fix) — only
  `auto-dark-transform`/`remap-for-cvd` (i.e. **derived** themes) read
  the anchor.

### Tie-breaking (deterministic, for the rare exact-tie case)

Real ties are vanishingly unlikely (floating-point distances), but the
walk order must still be deterministic for a reproducible build.
Simplest rule, consistent with the `@each` map iteration already used
everywhere in this file: **first entry encountered wins** — the
existing family declaration order in `$colors` (chromatic → grays →
tinted neutrals, `_base-palette.scss`'s own order) times ascending
weight `50…950`. No extra code needed: `@if $d < $nearest-distance`
(strict `<`) already keeps the first-seen minimum on ties.

### What this fixes as a side effect

`auto-dark-transform`'s current "not found" branch
(`adjust-lightness-clamped`, ±30-40% HSL lightness, **no gamut
guard** — confirmed broken: `in-gamut: false` on a saturated custom
OKLCH color, 2026-07-17) gets replaced by the anchor-based derivation,
which reuses `get-dark-color($family, $weight, …)` — the same
calibrated, gamut-safe path every recognized Tailwind color already
takes. The dark-mode gamut gap noted and explicitly parked on
2026-07-17 is resolved by this chantier, not separately.

## Phases

1. **`oklch-distance()` + extended `analyze-tailwind-color()`** — ✅
   done: both land in `_theme-utils.scss`, purely additive (existing
   callers of `analyze-tailwind-color` only read `found`) — 748/748
   tests unchanged before wiring.
2. **Threshold calibration** — ✅ done, exhaustively (242 same-color +
   260 adjacent-weight pairs, real `tailwindcss@3.4.17` hex vs this
   file's v4 OKLCH). Locked `$off-palette-same-color-threshold: 3.75`
   — see the constant's own comment in `_theme-utils.scss` for the
   full measured justification, including why a handful of near-white
   adjacent-weight pairs (50→100, and two 100→200 outliers) can't be
   cleanly separated from version-drift noise by any threshold, and
   why that's inconsequential (never a wrong family, never the
   light-mode value).
3. **Wire the two call sites** — ✅ done: `auto-dark-transform`'s "not
   found" branch and `remap-for-cvd`'s "outside the palette" branch
   both resolve `family`/`weight` from the anchor and run through the
   same calibrated, gamut-safe machinery every recognized color
   already uses. `@warn` added, one per token, only above the
   threshold. Byte-identical for the portfolio's own 15 themes,
   confirmed via `pnpm contrast:report` / `pnpm hc:audit` (no diff) —
   they never hit these branches. `cvd-safe-anchor-hue()` (the old
   OKLCH-hue-rotation fallback it fed) had zero remaining call sites
   after the wiring and was removed.
4. **Verification** — ✅ done: 10 new direct SCSS-level probe tests in
   `src/accessibility/contrast/__tests__/off-palette-anchor.test.ts`
   (`oklch-distance` sanity, the exact-match regression guard, the
   v3-hex-paste silent case and a real custom brand color as the
   warn case for both engines, and a dark-mode gamut check). That
   color's (`#6866e9`) true nearest entry, found by the exhaustive walk, is
   **indigo-500** at distance 4.12 — closer than the plan's own
   preliminary 3-candidate estimate (blue-600, 8.91), which only
   spot-checked weight 600 across 3 families rather than the full
   26×11 grid. Full suite: 758/758 (748 existing + 10 new) green.
5. **Docs** — ✅ done: deliberately **NOT** in the public README/AGENTS
   (stays undocumented by design, per Simon). Internal comments in
   `_theme-utils.scss` explain the mechanism; CHANGELOG entry written.
6. **Version** — joins the still-unpublished `0.2.0` (see below).

## Version

Decided (Simon, 2026-07-17): this chantier joins the still-unpublished
`0.2.0` — no separate bump. `0.2.0` is merged to `main` but not yet
published; this mechanism ships as part of that same release.

## Test impact

- New: direct SCSS probes for `oklch-distance` and the extended
  `analyze-tailwind-color` (unit-level, in the spirit of
  `status-resolver.test.ts`'s `compileString` probes).
- New: a dark-mode gamut check for an off-palette custom color
  (closes the parked 2026-07-17 gap).
- Existing suites (contrast, distinguishability, gamut, HC audit):
  green and unchanged — no role in the portfolio's own themes is
  off-palette, so these branches stay untouched for the portfolio
  itself.

## Branch

`feat/off-palette-anchor` (off `main`, post-merge of
`feat/complete-palette`).
