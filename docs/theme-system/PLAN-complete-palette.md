<!-- @format -->

# Execution plan — complete the Tailwind palette (0.2.0)

First post-publication chantier of `darkmode-plus-a11y`, prompted by the
first real external consumer (ArgentBank): the package ships only **9**
of Tailwind's **26** color families, so a brand primitive that has no
close family (e.g. ArgentBank's bluish indigo `#6866e9`) has no good
anchor — `violet` is the nearest and reads too pink. Goal: ship the
**full 26-family Tailwind palette** so any brand color maps onto the
Tailwind geometry the whole system is anchored to.

Target version: **0.2.0** (additive → MINOR under the recorded semver
policy; the 0.x line still allows API motion, but this change breaks
nothing).

## Current state (verified in `scss/_base-palette.scss`)

9 families in `$colors`:

- Grays (3/5): `neutral`, `stone`, `slate` (unquoted keys).
- Chromatic (6/17): `amber`, `sky`, `emerald` (unquoted), `"red"`,
  `"orange"`, `"violet"` (quoted — added for the CVD engine, and quoted
  because they collide with CSS named colors).

## Target: 26 families

| Group | Families | Status |
| --- | --- | --- |
| Grays (5) | slate, gray, zinc, neutral, stone | add **gray, zinc** |
| Chromatic (17) | red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose | add **yellow, lime, green, teal, cyan, blue, indigo, purple, fuchsia, pink, rose** |
| New (4) | taupe, mauve, mist, olive | add all 4 |

**17 families to add** (9 → 26). Source of truth for hex values:
<https://tailwindcss.com/docs/colors>, all 11 weights (50…950) each.
The 4 new families (taupe, mauve, mist, olive) post-date the engine's
knowledge and **must be provided/confirmed by Simon** by copy-paste from
the Tailwind docs; the 11 standard chromatic + 2 gray families use the
canonical Tailwind values (cross-checked against the docs at execution
time).

## ABSOLUTE RULE #1 — purely additive, byte-identical oracle

No existing family's values change, and **no role is rewired** to a new
family. Therefore all **15 currently generated themes must compile
byte-identically** (modulo the `/** @format */` pragma quirk). That
compiled-CSS diff is the safety net, same as every prior chantier. The
new families are inert until a consumer wires a primitive to one.

## ABSOLUTE RULE #2 — every key is quoted

This is the `redd → red` bug (TODO.md, fixed 2026-07-13) generalized.
An **unquoted** map key that happens to be a CSS named color is parsed
by Sass as a *color value*, not a string — it then silently fails every
string lookup (`get-color`, `analyze-tailwind-color`, …). Among the 17
families to add, these collide with CSS named colors and **must** be
quoted: `gray, yellow, lime, green, teal, cyan, blue, indigo, purple,
fuchsia, pink, olive`. `zinc, rose, taupe, mauve, mist` don't collide,
but are quoted anyway for uniformity.

**Decided (Simon, 2026-07-17)**: retro-quote the 6 existing unquoted keys
(`neutral, stone, slate, amber, sky, emerald`) in the same pass so all
26 keys are quoted. They were never broken (none collide with a CSS
named color, so they worked unquoted) — this is byte-identical output,
purely for uniformity and to close the bug class for good.

## Color-vision (CVD) behavior — measured, not assumed

Reminder of the engine (from PLAN-colorblind-redesign.md, phases 2-3):
per-family remap tables were **replaced** by (a) semantic anchors for
status roles (`success`/`danger` → a target family, weight auto-resolved
for ≥ 4.5:1) and (b) the OKLCH safe-hue fallback for identity roles
(`accent`/`link`). A **recognized family absent from any table is
handled by the fallback** — so a new family is already CVD-safe by
construction for the red-green types (its hue is nudged toward the safe
axis only where needed).

Consequence: the "remap decisions" for this chantier are mostly
**verification, not new tables**. For each new chromatic family, the
plan is to **measure** its behavior, not presume it:

1. Simulate each new chromatic family (a representative weight, e.g.
   600/700 as used for `accent`/`link`) under the 6 CVD types with the
   existing `testing/cvd-simulation.ts` + `measure.ts` (ΔE CIEDE2000 +
   WCAG ratio).
2. Default decision per family: **rely on the OKLCH fallback** (no new
   remap entry). Record ΔE / legibility.
3. Add an explicit anchor or remap entry **only** where a measurement
   shows a real failure (a family collapsing onto another under a CVD
   type, or dropping below the legibility floor). Each exception gets a
   one-line justification.
4. Produce a small decision table (in this plan or a generated report)
   so the choices are auditable — the same discipline as the contrast
   suite.

Special attention to the ArgentBank case: **blue** and **indigo** are
the immediate unblock. Blue/indigo sit on the safe axis for red-green
CVD (kept) and are handled by the fallback under tritan — spot-check
that blue-700 and indigo-700 stay distinguishable from `--link` (sky)
and legible.

## Phases

1. **Data** — ✅ done (`10388b3`): 26 families in OKLCH, extracted
   verbatim from `tailwindcss@4.3.3`, every key quoted (including the 6
   retro-quoted originals).
2. **Oracle** — ✅ done: recompiled, full Jest suite green, visually
   validated by Simon. The byte-identical rule was superseded by the
   OKLCH v4 migration decision (see § "ABSOLUTE RULE #1" note above) —
   two real gamut-mapping bugs were found and fixed along the way
   (anti-glare, CVD off-palette branch), unrelated to the palette data
   itself.
3. **CVD measurement** — ✅ done, **methodology corrected mid-flight**
   (2026-07-17): the original plan ("simulate each family, compare
   against existing roles, build a remap decision table") produced 345
   findings that were mostly noise — comparing families against roles
   they would never coexist with in a real UI (e.g. the `gray`/`zinc`
   rail candidates against `link`), and testing weight 600 uniformly
   even for hues (yellow/lime/green) that are naturally low-contrast at
   that weight regardless of CVD. Reframed with Simon: the package's
   **real** safety net for a consumer's actual role choice is their own
   contrast/distinguishability suite (AGENTS.md § Verifying your
   wiring) — this phase is a **data sanity check**, not a
   pre-validation of every hypothetical combination. Final test: the 11
   new chromatic families at weight 600, simulated under the 7 CVD
   types (6 dichromacy + achromatopsia), checked for broken/anomalous
   output (NaN, non-finite ratio) — **zero anomalies**; contrast-ratio
   ranges vs `bg-base` stayed plausible and stable for every family
   (e.g. blue 4.25–6.65:1, indigo 5.38–7.10:1 — solid across the board,
   directly answering the ArgentBank case). `yellow`'s low end
   (2.60:1) is a normal-vision weight-600 characteristic of that hue,
   not a CVD-specific defect — noted for the docs, no engine change
   needed. No remap/anchor entries added: the existing fallback
   (unmapped family → left unchanged for red-green; OKLCH hue-nudge for
   off-palette colors) is sufficient, same as for the original 9
   families.
   - **Pairwise family-vs-family test explicitly NOT built**: would
     mostly re-confirm that visually-similar families (e.g.
     teal/cyan) are visually similar — not new information, and the
     engine can't pre-solve every future consumer's role combination
     anyway (only a consumer's own suite, testing the pairs they
     actually chose, can).
4. **Docs + version** — ✅ done: README "Palettes" bullet and AGENTS.md
   "Prerequisites" now enumerate all 26 families (previously
   undocumented at any count); CHANGELOG entry written; `package.json`
   bumped to `0.2.0`. 748/748 tests, lint, and markdownlint all clean
   after the change.
5. **Publish + prove** — **ON HOLD, explicitly not now** (Simon,
   2026-07-17): more changes are coming that haven't been specified
   yet. Do not publish without an explicit go-ahead.

## Test impact

- **Palette conformance / contrast / distinguishability suites**: green
  and unchanged — they test the site's roles, none of which move.
- **New coverage (decided in 0.2.0, Simon 2026-07-17)**: a "palette CVD
  smoke" that asserts each new chromatic family stays legible and
  distinguishable from its nearest neighbor under the 6 CVD types. Part
  of this chantier, not deferred.

## Branch

`feat/complete-palette` (Simon, 2026-07-17): the whole chantier lands on
the branch, merged to `main` after validation.

## Decisions (Simon, 2026-07-17)

1. **Hex values of taupe/mauve/mist/olive** — Simon provides them
   in-session (post-cutoff for the engine); the 13 standard families use
   the canonical Tailwind values.
2. **Retro-quote the 6 existing keys** — yes (byte-identical, uniformity).
3. **Palette CVD smoke test** — in 0.2.0.
4. **Branch** — yes, `feat/complete-palette`, merge after validation.
