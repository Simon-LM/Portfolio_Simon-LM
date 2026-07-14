<!-- @format -->

# Pre-E7 readiness review — findings and recommendations

Snapshot review of the package (`packages/a11y-prefs`, publish name
`darkmode-plus-a11y`) done on 2026-07-14, before writing the E7 execution
plan. Everything actionable found during the review is recorded here so
nothing gets lost; items are processed **one at a time** (Simon's
instruction) and checked off as they land. The future `PLAN-e7-*.md`
should absorb whatever is still open when it gets written.

Legend: 🐛 confirmed bug · ✅ decision made · 📋 pending task · 💡 proposal
(needs Simon's call).

## 1. Bugs (confirmed, to fix)

- [ ] 🐛 **`templates/AGENTS.md` tells consumers to run portfolio-only
      commands.** Its "Verifying your wiring" section says to run
      `pnpm hc:audit` and mentions "the palette conformance test" — but
      both live in the **portfolio** (`package.json` script +
      `src/accessibility/contrast/__tests__/`), not in the package and
      not in the consumer's project. A consumer (human or AI) following
      the guide hits "command not found". The package ships the
      primitives (`testing/`: `wcag`, `measure`, `pairs`,
      `extract-themes`, `cvd-simulation`, `gamut`) but **no documented
      recipe** to actually assemble a contrast suite — despite the
      GUIDE's promise ("offer the same guarantee to future package
      consumers"). Fix (as part of the AGENTS.md rewrite, see § 2):
      - Write a working, copy-paste recipe: a consumer-side
        `contrast.test.ts` built on `darkmode-plus-a11y/testing/*`
        (compile their SCSS entry, extract `[data-theme]` blocks, run
        the default role pairs + their layer-3 pairs).
      - Decide whether the HC semantic audit should also ship as a
        runnable (CLI subcommand or exported runner) instead of being
        referenced by a script name that only exists in this repo.
- [ ] 🐛 **Dead reference in `templates/AGENTS.md`**: "the package
      provides `themeInitScript` — see its docs" — no such docs exist
      beyond source comments. Replace with an inline usage snippet.

## 2. Decisions made (2026-07-14)

- [x] ✅ **Two-document scheme at the package root**:
  - `README.md` — for **humans** and the npm page: pitch
    (dark-mode-first + accessibility positioning), install, 5-step
    quick start, role table, links to AGENTS.md and the repo. Short and
    scannable; explains the *why*.
  - `AGENTS.md` — for **AI agents** (follows the emerging `AGENTS.md`
    convention): deterministic and exhaustive. Layer-3 contract, full
    role list, exact commands **that work in the consumer's project**,
    failure modes ("undefined variable at compile time = nonexistent
    role → check the list"), both integration paths (copied UI via
    `init` / engine-only), non-negotiables (no raw values in layer 3,
    no floating `position: fixed` trigger).
  - **Single source**: promote the current `templates/AGENTS.md` to the
    package root and have `init` copy that same file — no duplicate to
    maintain.

## 3. Pre-publication tasks (E7 backlog)

- [ ] 📋 **`package.json` metadata refresh**: `description` still says
      "working name — final name to be chosen" (name was settled
      2026-07-12) and points to a repo-internal doc path; add
      `repository`, `homepage`, `keywords`; `version`/`private` flip at
      publication.
- [ ] 📋 **Rename `a11y-prefs` → `darkmode-plus-a11y`**: breaks every
      `a11y-prefs/...` import in the portfolio (SCSS `@use`, TS imports,
      Jest `moduleNameMapper`, `transpilePackages`, workspace deps) —
      sequence it as its own phase with the test suite as the net.
- [ ] 📋 **Publishable dist decision** (GUIDE § E7, still open): exports
      currently point at raw `.ts` sources — fine for Next.js
      (`transpilePackages`), hostile to plain Vite/CRA consumers. Either
      build a dist (tsup/tsc) or explicitly document the TS-source
      requirement.
- [ ] 📋 **Dependency hygiene**: `sass`, `postcss`, `culori` are hard
      `dependencies`, but `postcss`/`culori` only serve `testing/`, and
      consumers typically bring their own `sass`. Consider
      peer/optional placement, or at minimum document the weight.
- [ ] 📋 **Sylexiad EULA question** (carried from TODO.md, blocking):
      the EULA requires webfonts that are "not publicly downloadable";
      the portfolio's woff2 files technically are. To settle before
      open-sourcing the repo. (The font itself is already excluded from
      the package.)
- [ ] 📋 **CI gates**: build + unit tests + contrast tests (blocking) +
      lint on every PR (GUIDE § E7).
- [ ] 📋 **Full-cycle proof**: install the published version in a
      disposable project and run it — never on the portfolio (decision
      2026-07-11: the portfolio stays on the workspace link).

## 4. Tailwind compatibility (question raised 2026-07-14)

**Verdict: the runtime core is fully Tailwind-compatible; the build-time
story and the copied UI are not yet, and neither is documented.**

What works today, unchanged:

- The engine's **output** is plain CSS: one `[data-theme="…"]` block of
  custom properties per theme + the `data-theme` attribute on `<html>`
  (React hooks + anti-FOUC script). That is exactly the pattern
  Tailwind consumers already know from shadcn/ui.
- Tailwind v3: map tokens in `theme.extend.colors`
  (`"main-bg": "var(--color-main-bg)"`) → `bg-main-bg` utilities.
- Tailwind v4: same idea via `@theme inline`
  (`--color-main-bg: var(--color-main-bg);`) → utilities generated from
  CSS variables, no JS config at all.

Real friction points:

1. **Sass stays required at build time** to generate the themes
   (palettes, engines, `generate-all-themes` are SCSS). A pure
   PostCSS/Tailwind project must add a Sass step for one entry file.
   Acceptable — the theme SCSS compiles **separately** from the
   Tailwind pipeline (no Sass/Tailwind mixing in one file) — but it is
   an extra step and a real adoption barrier for Tailwind-only teams.
2. **The copied UI (`templates/`) is SCSS + BEM.** A Tailwind project
   won't want those stylesheets. Tailwind variants of the templates
   would be a sizeable chantier (out of scope for E7; note it as a
   possible E8).
3. **Discipline conflict to document**: Tailwind culture encourages raw
   color utilities (`bg-blue-500`) — exactly what the layer-3 GOLDEN
   RULE forbids on themed surfaces (raw values escape theming). The
   AGENTS.md must state: on themed surfaces, only utilities mapped to
   the package's tokens.

Recommendations (in order of value/effort):

- [ ] 💡 **Document the Tailwind path** in the package README +
      AGENTS.md (v3 `theme.extend.colors` mapping + v4 `@theme inline`
      mapping, with copy-paste snippets). Cheap, unlocks the main
      audience.
- [ ] 💡 **Ship precompiled default themes** (`dist/themes.css`, the 12
      default themes): a Tailwind-only consumer imports one CSS file and
      maps variables — zero Sass in their build. They lose custom brand
      palettes (which require recompiling), which leads to:
- [ ] 💡 **Theme-build CLI** (`darkmode-plus-a11y build
      --config theme.config.scss`): the package already depends on
      `sass` — its JS API can compile the consumer's config into a
      themes CSS file without the consumer touching Sass tooling.
      Bigger piece; candidate for a post-E7 chantier.

## 5. Minor notes (documented limitations, no action required yet)

- The scaffolded UI's labels are FR/EN only (`language: "fr" | "en"`).
  State it honestly in the README; a labels-override prop is a possible
  later improvement.
- The status resolver's legibility floor (3:1 default) is still an open
  decision — already tracked in TODO.md.
- The design docs (`docs/theme-system/`) stay repo-side; the package
  ships only README + AGENTS.md. The package will need its own
  CHANGELOG at publication (changesets, per the GUIDE's semver policy).
