<!-- @format -->

# AGENTS.md — Guide for AI assistants

Document intended for **any AI** working on this repository. It is deliberately **self-contained**: no proprietary memory or external knowledge is needed to work on the project.

## 1. The project

Portfolio of **Simon LM**, front-end developer specialized in **web accessibility**.

- Single-page with anchored sections + a blog / accessibility-resources part.
- Bilingual **French / English**, selectable via the interface.
- Deployed on Vercel.

➡️ **Accessibility (WCAG)** and **SEO** are design priorities, not options: they are the site's very subject.

## 2. Tech stack (actual state)

| Area | Choice |
|---|---|
| Framework | **Next.js 16** — App Router, Turbopack |
| UI | **React 19** |
| Language | **TypeScript** |
| Package manager | **pnpm** only (do not use npm/yarn) |
| Styles | **SCSS**, **7-1** architecture (`src/styles/`), **BEM** naming |
| Global state | **Zustand** (`src/store/`) |
| Forms | **react-hook-form** + **Zod** (schema validation) |
| Accessibility | **React Aria** (`@react-aria/*`, `@react-stately/*`) + **Radix UI** |
| i18n | homegrown: `middleware.ts` + `negotiator` + `@formatjs/intl-localematcher`, `app/[lang]/` routes, JSON dictionaries |
| Unit tests | **Jest 30** + **Testing Library** (jsdom environment) |
| a11y tests | **pa11y / pa11y-ci** |
| Misc | framer-motion, react-markdown, feed (RSS), react-icons, Matomo |

## 3. Commands (pnpm)

```bash
pnpm dev              # development (Turbopack) — http://localhost:3000
pnpm build            # production build
pnpm start            # production server
pnpm lint             # ESLint (next lint)
pnpm test             # unit tests (Jest)
pnpm test:watch       # Jest in watch mode
pnpm test:coverage    # test coverage
pnpm test:a11y        # accessibility audit (pa11y-ci) — the app must be running
```

## 4. Directory structure

```
src/
├── app/
│   ├── [lang]/        # localized pages: layout, page, sections, accessibility,
│   │                  #   legal, terms, privacy-policy, sitemap, dictionaries
│   ├── api/           # API routes (contact, dictionary)
│   └── rss.xml/       # RSS feed
├── components/        # header, stickyFooter, bottomFooter, accessibilityMenu,
│                      #   languageSelector, customSelect, navigationSticky, …
├── accessibility/     # accessibility control logic
├── hooks/             # React hooks
├── store/             # Zustand stores
├── styles/            # SCSS 7-1: abstracts, base, components, layout, pages, themes
├── types/             # TS types: common, components, form, localization
└── utils/
middleware.ts          # i18n routing (redirect based on locale)
```

Import alias: `@/*` → `src/*`.

## 5. Code conventions

- **TypeScript** everywhere, strict typing, avoid unjustified `any`.
- **SCSS + BEM**; follow the existing 7-1 architecture; no inline styles.
- Validate incoming data with **Zod** whenever relevant.
- For any interactive element, prefer **React Aria / Radix** over raw HTML (focus, ARIA, keyboard navigation handled correctly).
- **Accessibility**: semantic HTML, sufficient contrast, keyboard navigation, correct ARIA attributes; validate with `pnpm test:a11y`.
- **SEO**: metadata, semantic tags, correct i18n.
- Always **specify the full path and extension** of the files involved.

## 6. Interaction preferences (Simon)

- **Reply to the user in French.** **Write code comments in English.**
- Flag modified code passages with comments.
- Propose the **modified excerpts** first, then the full file if useful — to make changes easy to spot.
- Proactively suggest **accessibility** and **SEO** best practices.
- **All documentation (this file, README, CHANGELOG, plans, etc.) must also be written in English.** Chat replies stay French; anything written to a file does not.

## 7. Good to know

- The `"name"` field in `package.json` stayed as `my-next-project` (the scaffold's name); the repository is called **Portfolio_Simon-LM**. No impact on the build.
- The contact form is migrating from **reCAPTCHA v3** to **Spentria** (Simon's anti-spam solution).
- Notable working branch: `feature/darkmode-plus-a11y-package`.
- The **accessible color theme system** (themes generated at Sass compile time, meant to become a reusable package) is documented in `docs/theme-system/README.md`; any change to this feature must be logged in `docs/theme-system/CHANGELOG.md`.

---

_This file replaces the old `pre-prompt.doc` (startup notes from December 2024, now obsolete)._
