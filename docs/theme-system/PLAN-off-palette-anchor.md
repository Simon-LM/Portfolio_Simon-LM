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
  **accepted for v1** (off-spec, no clean-result promise). **Log for
  V2**: instead of substituting the anchor's own dark/CVD color,
  compute the **delta** the anchor undergoes (ΔL, ΔC, ΔH between the
  anchor and its transformed version) and apply that same delta to the
  user's actual color — preserves their hue while inheriting the
  calibrated curve. Candidate for a future custom-palette system, not
  for this net. **Do not build this now.**
- **Thresholds**: Simon delegated to measured recommendations (below).
- **Single entry point**: extend `analyze-tailwind-color()` — every
  engine (dark, CVD) consumes its result, no separate logic per engine.

## Technical design

### The distance metric is Sass-native, NOT the testing layer's CIEDE2000

The projection must happen **at Sass compile time** (inside the
engine, e.g. `auto-dark-transform`, `remap-for-cvd`) — the
`differenceCiede2000()` used by `testing/measure.ts` is TypeScript
(culori), unavailable to the SCSS engine. Full CIEDE2000 needs
`atan2` plus several weighting/rotation terms — verified that Dart
Sass 1.101.0 (this project's version) **does** expose
`math.cos`/`math.sin`/`math.atan2`, but a full CIEDE2000 port in Sass
is significant, unproven-in-this-codebase machinery for a feature that
explicitly makes no cleanliness promise.

**Proposed metric**: Euclidean distance on OKLCH's Cartesian
projection — `a = C·cos(H)`, `b = C·sin(H)` (the same idea as CIELAB's
a\*/b\*, computed directly on OKLCH channels instead of true Lab).
Naturally handles near-zero-chroma colors (a, b → 0 as C → 0,
regardless of H — no special-casing for `hue: none`, e.g.
`oklch(98.5% 0 none)`). Much simpler than CIEDE2000 (no weighting
functions, no rotation term), fully computable in Sass:

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

(Probed directly against this codebase's palette via a throwaway Sass
file — not yet added to the source tree.)

### Measured thresholds (Sass-native metric, real palette values)

| Comparison | `oklch-distance` |
| --- | --- |
| v3 hex `#ea580c` vs v4 `orange-600` (worst sampled v3→v4 drift) | 2.77 |
| v3 hex `#f59e0b` vs v4 `amber-500` | 2.33 |
| v3 hex `#0c4a6e` vs v4 `sky-900` | 0.55 |
| `blue-600` vs `blue-700` (smallest sampled adjacent-weight gap) | 5.84 |
| `red-500` vs `red-600` | 6.11 |
| ArgentBank `#6866e9` vs `blue-600` | 8.91 |
| ArgentBank `#6866e9` vs `indigo-600` | 10.04 |
| ArgentBank `#6866e9` vs `violet-600` (today's only real anchor) | 13.63 |

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

Confirms the real-world case: ArgentBank's actual brand color anchors
correctly to `blue-600` (8.91, nearest) rather than `violet-600`
(13.63, what they'd have gotten before 0.2.0's palette expansion) or
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

1. **`oklch-distance()` + extended `analyze-tailwind-color()`** —
   land the distance helper and the extended return shape in
   `_theme-utils.scss`. No behavior change yet (callers untouched) —
   this phase is purely additive, byte-identical oracle applies.
2. **Threshold calibration** — exhaustive v3-vs-v4 same-swatch and
   adjacent-weight sweep (not the ~5-pair sample above) to lock the
   `$off-palette-same-color-threshold` constant with full confidence.
3. **Wire the two call sites** — `auto-dark-transform`'s "not found"
   branch and `remap-for-cvd`'s "outside the palette" branch switch
   from their current generic fallbacks to the anchor. `@warn` message
   added. Oracle: the portfolio's own 15 themes never hit these
   branches (no off-palette primitive) — still byte-identical here.
4. **Verification** — a Sass-level test probing both branches directly
   with known off-palette colors (mirrors how the 2026-07-15 CVD fix
   was verified: direct probes, not a portfolio-visible change),
   including the ArgentBank color as a real-world case; confirm the
   dark-mode gamut gap is closed (`color.is-in-gamut` on the
   anchored result); full portfolio suite stays green (748 tests).
5. **Docs** — deliberately **NOT** in the public README/AGENTS (stays
   undocumented by design, per Simon). Internal comments in
   `_theme-utils.scss` explain the mechanism for future maintainers.
   CHANGELOG entry (repo-side, internal record — not a "how to use
   this" doc). Log the V2 delta-preserving idea in TODO.md so it isn't
   lost.
6. **Version** — open question, see below.

## Open question: version bump

`0.2.0` is merged to `main` but **not published** — nothing is
publicly committed yet. Two options: (a) fold this into the still-
unpublished `0.2.0` (it's an internal fallback improvement, arguably
close to a bug fix — no new public role/function signature), or
(b) bump further once both chantiers are ready to ship together.
Simon's call when this chantier is ready to merge.

## Test impact

- New: direct Sass probes for `oklch-distance` and the extended
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
