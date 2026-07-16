<!-- @format -->

# Execution plan — contrast testing system (E1 chantier)

**Execution document meant for an AI.** Same general rules as
[PLAN-foundations-migration.md](./PLAN-foundations-migration.md): dedicated
branch, one commit per phase, raw check output in each report, stop and
report on anything unexpected, a [CHANGELOG.md](./CHANGELOG.md) entry at
each phase. Reference design:
[GUIDE-package-extraction.md](./GUIDE-package-extraction.md), "contrast
testing system" chapter.

Branch: `feat/contrast-tests`.

**Absolute rule for this chantier: it is purely additive.** No file under
`src/styles/` may be modified — colors are *measured*, not fixed. Failures
found become documented *waivers* (phase 3), never color tweaks. The
oracle is therefore trivial: the compiled CSS must stay byte-identical
from start to finish.

## Goal

On every `pnpm test`, mechanically verify that every declared text/
background pair meets its WCAG 2.2 threshold in each of the 12 themes,
and produce a readable matrix report. Pre-existing failures are inventoried
as waivers for review — the system provides the current state, then
prevents any future regression (a "ratchet").

## Implementation

```
src/accessibility/contrast/
├── wcag.ts               # luminance, ratio, alpha compositing
├── extract-themes.ts     # SCSS compilation → theme map → { --var: color }
├── contrast-pairs.ts     # pair registry (source of truth) + waivers
├── report.ts             # markdown matrix generator
└── __tests__/
    ├── wcag.test.ts
    ├── extract-themes.test.ts
    └── contrast.test.ts  # the main suite
docs/theme-system/CONTRAST-REPORT.md   # generated artifact (committed)
```

Dev dependencies to add (`pnpm add -D`): `culori` (hex/rgb()/hsl() color
parsing and conversion — don't hand-roll a parser) and `postcss` if not
already resolvable (structured parsing of the compiled CSS — no regex on
CSS).

## Phase 0 — Preparation

Clean tree, branch from `main`, `pnpm build`/`lint`/`test` green,
reference CSS snapshot (`pnpm exec sass --no-source-map --style=expanded
src/styles/main.scss /tmp/contrast-e1/phase0.css`).

## Phase 1 — Utilities (`wcag.ts`, `extract-themes.ts`)

### `wcag.ts`

- `toRgb(value: string)`: via culori; an explicit error if the value isn't
  a color (never return a default color).
- `compositeOver(fg, bg)`: standard sRGB alpha compositing
  (`c = a·c_fg + (1−a)·c_bg` per channel). Used when the foreground or
  background carries alpha < 1.
- `contrastRatio(fg, bg)`: the WCAG 2.x formula (relative luminance,
  `(L1+0.05)/(L2+0.05)`). culori provides `wcagContrast` — use it, but
  **after** any alpha compositing.
- Thresholds: `text` → 4.5, `large-text` → 3.0, `non-text` → 3.0 (SC 1.4.3
  and 1.4.11).

Unit tests with known reference values: white/black = 21:1,
`#767676`/white = 4.54:1, compositing `rgba(0,0,0,0.5)` over white =
`#808080` (within 1 per channel).

### `extract-themes.ts`

1. Compile `src/styles/main.scss` via the `sass` JS API
   (`compile(...)`) — once, memoized at module level.
2. Parse with postcss; for every block whose selector is
   `[data-theme="X"]` (the 12), collect the `--*` declarations into a
   `Map<theme, Map<varName, value>>`. Ignore `:root` and the
   `prefers-color-scheme` block (redundant), but **verify in a test**
   that `:root`'s custom properties match `[data-theme="light"]`'s
   (consistency safeguard).
3. Explicit error if an expected theme (list imported from
   `src/config/themes.ts` — single source) is missing from the CSS.

⚠️ The main test compiles Sass and reads the filesystem: the test file
must carry the `/** @jest-environment node */` docblock (the project's
default environment is jsdom).

**Check**: `pnpm test` green, byte-identical CSS vs phase 0.
**Commit**: `feat(theme): contrast phase 1 — WCAG utils and theme extraction`.

## Phase 2 — The pair registry (`contrast-pairs.ts`)

Structure:

```ts
export type ContrastLevel = "text" | "large-text" | "non-text";

export type ContrastPair = {
  id: string;                     // stable, e.g. "role/fg-base-on-bg-base"
  fg: string;                     // custom property name, e.g. "--fg-base"
  bg: string;
  level: ContrastLevel;
  composeOver?: string;           // compositing background if fg/bg carries alpha
  themes?: readonly ThemeOption[]; // default: the 12
  waiver?: {
    reason: string;
    preexisting: boolean;         // true = found when the system was introduced
    measured?: Record<string, number>; // theme → measured ratio
  };
};
```

Initial registry — **role level** (will move into the package in E7):

| fg | bg | level |
| --- | --- | --- |
| `--fg-base` | `--bg-base` | text |
| `--fg-base` | `--bg-subtle` | text |
| `--fg-base` | `--bg-container` | text |
| `--fg-muted` | `--bg-base` | text |
| `--fg-on-emphasis` | `--bg-emphasis` | text |
| `--fg-on-emphasis` | `--bg-emphasis-strong` | text |
| `--fg-on-emphasis` | `--bg-inverse` | text |
| `--fg-on-accent` | `--accent` | text |
| `--accent-ink` | `--accent-soft` | text |
| `--accent-ink` | `--bg-base` | text |
| `--accent-ink` | `--bg-subtle` | text |
| `--link` | `--bg-base` | text |
| `--link` | `--bg-subtle` | text |
| `--link` | `--bg-container` | text |
| `--link-hover` | `--bg-base` | text |
| `--success` | `--bg-base` | text |
| `--danger` | `--bg-base` | text |
| `--focus-ring` | `--bg-base` | non-text |
| `--border-strong` | `--bg-base` | non-text |

Initial registry — **site level** (portfolio layer 3):

| fg | bg | level | note |
| --- | --- | --- | --- |
| `--color-main-text` | `--color-main-bg` | text | |
| `--color-hero-text` | `--color-hero-bg` | text | |
| `--color-header-text` | `--color-header-bg` | text | |
| `--color-header-text-role` | `--color-header-bg` | text | fg-muted on accent — sensitive pair |
| `--color-header-blog-link-text` | `--color-header-blog-link-bg` | text | |
| `--color-lang-toggle-text-activated` | `--color-lang-toggle-bg-activated` | text | |
| `--color-lang-toggle-text-disabled` | `--color-lang-toggle-bg` | text | |
| `--color-collapse-title` | `--color-collapse-bg-title` | text | |
| `--color-section-title` | `--color-section-bg-odd` | text | |
| `--color-portfolio-tag-text` | `--color-portfolio-tag-bg` | text | |
| `--color-bottom-footer-title` | `--color-bottom-footer-bg` | text | |
| `--color-bottom-footer-text` | `--color-bottom-footer-bg` | text | |
| `--color-bottom-footer-link-text` | `--color-bottom-footer-link-bg` | text | |
| `--color-sticky-footer-text` | `--color-sticky-footer-bg` | text | |
| `--color-about-overlay-text` | `--color-about-overlay-bg` | text | |
| `--color-about-button-text` | `--color-about-button-bg` | text | |
| `--color-skills-icon-text` | `--color-skills-icon-bg` | text | |
| `--color-focus-text` | `--color-focus-bg` | text | |
| `--color-tooltip-text` | `--color-tooltip-bg` | text | `composeOver: "--bg-base"` (alpha) |
| `--color-scroll-progress-indicator` | `--bg-base` | non-text | |
| `--color-button-active-outline` | `--color-panel-bg` | non-text | |

The registry is **extensible, never amputated**: a problematic pair gets
a waiver, it is not deleted.

**Check**: lint + typecheck. **Commit**:
`feat(theme): contrast phase 2 — pair registry`.

## Phase 3 — The test suite + failure inventory

1. `contrast.test.ts`: for every pair × every applicable theme, resolve
   both colors (alpha compositing if `composeOver`), compute the ratio,
   compare to the threshold. A waived pair: the test is marked
   passing-with-waiver, **but** if the measured ratio becomes *compliant*,
   the test fails with the message "waiver obsolete, remove it" (waivers
   can't turn into zombies).
2. **First run = inventory.** It *will* fail — that's expected (we already
   know: `--success` emerald-600 on a light background ≈ 3.61:1 in light;
   deuteranopia error `#ffcc00` ≈ 1.45:1…). For every failure: add a
   `preexisting: true` waiver with the measured ratio and a factual reason
   (e.g. "functional color not consumed by the site as of today; will be
   revisited by the color-blind redesign"). **Do not fix any color.**
3. End of phase: `pnpm test` fully green, and the complete waiver list
   appears in the phase report (raw output) — this is the main
   deliverable for review.

**Commit**: `feat(theme): contrast phase 3 — full suite with pre-existing waivers inventory`.

## Phase 4 — The matrix report

1. `report.ts`: generates `docs/theme-system/CONTRAST-REPORT.md` — a
   matrix of pairs × 12 themes, each cell = measured ratio, marked ✓
   (compliant), ✗ (failure — must no longer exist after phase 3), ⚠
   (waiver, with a link back to the reason). Header: generation date and
   regeneration command.
2. `package.json` script: `"contrast:report": ...` (run via `tsx` or
   `ts-node`, whichever is already resolvable; otherwise compile on the
   fly with the same transform as Jest).
3. Generate and **commit** the report. The report is a regenerable
   artifact: the main test verifies it's up to date (regenerate it in
   memory and compare — fails if a dev changed colors without
   regenerating the report).

**Commit**: `feat(theme): contrast phase 4 — generated contrast matrix report`.

## Phase 5 — Wrap-up

1. `pnpm build`, `pnpm lint`, `pnpm test` green; CSS still byte-identical
   to phase 0 (prove it with a diff).
2. Docs: README § 6.4 and guide E1 (chantier done); a summary changelog
   entry.
3. Final report: CONTRAST-REPORT.md, the list of `preexisting` waivers
   sorted by severity (lowest ratio first), and treatment recommendations
   (which fall under the color-blind redesign, which under a role
   adjustment).

**Commit**: `docs(theme): contrast phase 5 — documentation and waiver inventory`.

## Out of scope (do NOT do)

- Fixing colors, roles, or themes (no modification of `src/styles/`) —
  failures become waivers, the call belongs to review.
- **Distinguishability** tests via CVD simulation (Brettel/Viénot
  matrices, ΔE): planned alongside the color-blind redesign — but design
  the registry to be extensible (the `level` field could later be joined
  by a `kind: "distinguishability"`).
- APCA column: later, advisory only.
- GitHub Actions CI integration: out of scope until the project has a CI
  workflow (the gate is `pnpm test` locally).
