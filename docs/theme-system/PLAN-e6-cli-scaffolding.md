<!-- @format -->

# Plan — E6: UI templates + scaffolding CLI

Written 2026-07-12 (after the hc-mécanique merge `dc9bef0`). Executed on
branch `feat/e6-cli`. Reference: GUIDE-package-extraction.md § E6 —
**shadcn** model (decision 2026-07-03: devs own and modify their UI, it is
not in npm; only the engines are).

## What the consumer gets in the end

```
pnpm dlx darkmode-plus-a11y init    # final name settled on 2026-07-12
```

copies into their project: the **trigger** (the icon) + the full
**accessibility card** (React + SCSS), `theme.config.scss` (their
commented layer-3 config) and examples. `init --diff` then compares their
local UI against the package's reference (shadcn-style updates: the dev
sees what changed and ports over what they want).

### ⚠️ Trigger placement — absolutely NO fixed position (decision 2026-07-12)

The portfolio's trigger is an element **in the flow** (rendered in the
header, no `position: fixed`): it grows and repositions with zoom, never
overlapping content. A floating `position: fixed` button would be an
**accessibility defect** (near-certain overlap at high zoom). So: the
template exposes an **in-flow** component, the dev places it wherever they
want (ideally their header). If a turnkey default is required, it will be
a **pre-header band** (a strip above the main header, icon on the right) —
not pretty but accessibility-correct — **never** a fixed floating element.

## State of play (as of 2026-07-12)

- Trigger: `src/accessibility/accessibilityControl/AccessibilityControl.tsx`.
- Card: `AccessibilityMenu.tsx` (972 lines) + `_accessibility-menu.scss`
  (1179 lines) + parts of `_a11y.scss` (237 lines).
- Coupling to generalize: 17 mentions of Sylexiad (the site's font, not
  redistributable); `next/link` (1 occurrence, link to the accessibility
  policy); the portfolio's zustand stores (fontSize, dyslexicFont);
  `react-select` + `react-icons` (UI dependencies); inline FR/EN i18n
  labels (a sound pattern, kept).

## Decisions already made / recommendations to settle

1. **The portfolio doesn't move**: its UI stays as-is (it's the templates'
   ancestor, not their consumer). Chantier oracle: **zero site change**.
   Migrating the portfolio to the scaffolded templates is a separate
   decision, post-E7 if desired.
2. **Templates = your menu, generalized**: same design, same patterns
   (HC preview buttons, selectors, i18n via a `language` prop), but:
   package fonts only (OpenDyslexic/Atkinson/Andika) + a **documented
   extension point** for custom fonts (the Sylexiad pattern); `next/link`
   replaced with an `<a>` (or a render prop); the "accessibility policy"
   link made configurable.
3. **DECIDED (2026-07-12) — state in the templates = the package's
   `usePreference`** (not zustand): zero state dependency for the
   consumer, and it exercises the hook under real use. The portfolio
   keeps its stores.
4. **Recommendation to settle — templates' UI dependencies**: keep
   `react-select` (color-blindness/font selectors, your SCSS covers them)
   and `react-icons` (trigger icon) as dependencies **of the consumer
   project** (the CLI flags them at init if not found). Alternative:
   native select + inline SVG (zero dependency, but drifts from your
   proven UI).
5. **Minimal CLI, no framework**: pure Node script (package `bin`), two
   commands — `init [--dir <path>] [--force]` (copy, refuses to overwrite
   without `--force`) and `init --diff` (per-file status: identical /
   locally modified / new in the reference).
6. The **AI guide** (layer-3 contract, roles, examples — AGENTS.md/llms.txt
   pattern): its first version ships with the templates (the CLI copies it
   too), polished in E7.

## Phases

### Phase 0 — Preparation

Oracle: reference compiled CSS + build of the site; NO site file may
change throughout the chantier (verified at each phase).

### Phase 1 — React templates (`packages/a11y-prefs/templates/react/`)

Trigger + card, derived from the portfolio's components, generalized
(decisions 2-4). Import ONLY the package's public API. Compilable outside
the portfolio (verified by a dedicated tsc in phase 4).

**Commit**: `feat(theme): e6 phase 1 — react templates (trigger + card)`.

### Phase 2 — SCSS templates + config

`templates/scss/`: the generalized menu SCSS (rem-first, zoom-robust —
copy of Simon's architecture, not a rewrite); `theme.config.scss` =
commented layer-3 config (roles → tokens, examples); example
`[data-theme]` blocks.

**Commit**: `feat(theme): e6 phase 2 — scss templates + theme.config`.

### Phase 3 — The CLI

`packages/a11y-prefs/bin/cli.mjs` (pure Node): `init` + `init --diff`
(decision 5), clear messages, detection of missing UI dependencies.

**Commit**: `feat(theme): e6 phase 3 — cli init + diff`.

### Phase 4 — Verification and docs

1. Tests: running the CLI in a temp directory (files created, overwrite
   refusal, diff); template-compilability tsc; the site's full test suites
   unchanged.
2. Docs: chantier README, AI guide v1 (`templates/AGENTS.md`), changelog,
   final report.

**Commit**: `docs(theme): e6 phase 4 — wrap-up`.

## Out of scope (do NOT do)

- Migrating the portfolio to consume the templates (post-E7, decision to come).
- npm publication, final name, dist build (E7).
- Translations beyond FR/EN (the i18n pattern stays Simon's).
