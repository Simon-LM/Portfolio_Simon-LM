<!-- @format -->

# Plan — High-contrast mechanics: focus role + tooling controls

Written 2026-07-11, after the "HC second pass" reflection (mechanism
archaeology understood). Executed on branch `feat/hc-mecanique`.

## The archaeology behind these decisions (verified in git)

- **Original design**: capture **by layer-3 names**
  (`transform-for-high-contrast($color, $element-type)`, `str-index` on
  `_bg`/`_text`/`link`/`heading`/`hover`/`focus`/`success`) + a clarity
  safety net. This notably guaranteed focus by its name.
- **Superseded during this extraction chantier** (commit `3195de4`, by
  Claude — not a deliberate decision) by the current mechanism: explicit
  assignment of the ~19 **layer-2** roles in the engine + layer-3
  inheriting **through wiring** + clarity for unassigned values
  (intermediate grays, accents). The original function, having become dead
  code, was removed during the 2026-07-03 cleanup (`f16842d`).
- 3-layer architecture: layer 1 = Tailwind palettes; layer 2 = role
  variables (the package's API); layer 3 = assignment names (consumer
  config).

## Decisions made (2026-07-11)

1. **Color decisions = layer-2 wiring only** (current mechanism kept).
   Name-based capture does NOT come back as a mechanism — technical fact:
   Sass can't read names; the old function required declaring each token
   by hand, the same discipline as wiring (the safety net has the same
   holes as the floor).
2. **Focus is promoted to a layer-2 role** — restores the original
   design's guarantee, for every consumer (until now: plain arguments of
   the local mixin, no engine-level guarantee).
3. **Two read-only controls in the tooling** (they NEVER modify a color;
   warnings at build/test time, invisible to visitors):
   - **By value**: in an HC theme, every emitted color must belong to the
     theme's palette. Catches any unwired token (raw value).
   - **By name** (the original semantics, recycled as an inspector):
     family synonyms (text/fg/ink…, bg/surface…, link/anchor…,
     focus/outline…); if a name suggests a family and the emitted value
     contradicts it (e.g. `*_text` emitting the background color),
     warning. Catches crossed wiring that happens to land inside the
     palette — the blind spot of value-based control. False positive = one
     extra warning, never a wrong color.
4. **AI-oriented implementation guide** (AGENTS.md/llms.txt pattern of the
   package): implementers will mostly be AIs; the contract "layer 3 is
   always derived from a layer-2 role, never a raw value" must be written
   for them. Deliverable attached to E6/E7; the contract written in phase 4
   will be its basis.
5. **Parked ("needs thought, risky")**: the fate of the 4 `$accent*` roles
   in HC (currently overridden for clarity; Simon's header was a manual
   override, accent was never part of his HC design).
6. **Tailwind** prerequisite reaffirmed (11-weight geometry mandatory).

## Phases

### Phase 0 — Preparation

Reference compiled CSS (`main`), normalized diff at each phase.

### Phase 1 — Focus role in layer 2 (identical rendering)

1. `"focus"` slot (+ `"focus-text"` if needed) in `$hc-palette` (engine)
   and in the 4 variant maps.
2. The consumer mixin (portfolio's `_high-contrast.scss`) reads focus from
   the map (the current `$focus-*` arguments become optional overrides,
   default = the map).

**Oracle**: 4 byte-identical variants (values don't change, only the
plumbing).
**Commit**: `feat(theme): hc-mécanique phase 1 — focus promoted to role`.

### Phase 2 — Value-based control

Jest test in the contrast tooling: for each `high-contrast*` theme, every
emitted color custom property ∈ the theme's palette. Waiver mechanism for
documented legitimate cases (to be discovered on first run — the
portfolio's current state serves as calibration).

**Oracle**: no CSS changed; the test describes the existing state (any
gaps found are documented, not silently fixed — decisions).
**Commit**: `feat(theme): hc-mécanique phase 2 — HC palette control`.

### Phase 3 — Name-based control (the semantic inspector)

Audit: synonym families → name/emitted-value inconsistencies in HC themes
→ warnings listed (console + report artifact). Never blocking, never a
modification.

**Commit**: `feat(theme): hc-mécanique phase 3 — semantic inspector`.

### Phase 4 — Docs and wrap-up

Chantier README (§ HC mechanics: the 2 decision/control layers, the
layer-3 contract), writing the contract (basis for the future AI guide),
changelog, TODO (the "second mechanical pass" reflection closed out — the
accent item remains parked), final report.

**Commit**: `docs(theme): hc-mécanique phase 4 — wrap-up`.

## Out of scope (do NOT do)

- Bringing back name-based capture as the decision mechanism.
- The fate of the `$accent*` roles in HC (parked, decision to come).
- Redesigning HC's underlying technology ("second pass" still deferred);
  `forced-colors: active` (noted for the package, later).
- The AI guide itself (E6/E7 deliverable — only its basis is written here).
