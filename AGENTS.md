<!-- @format -->

# AGENTS.md — Guide pour les assistants IA

Document destiné à **toute IA** intervenant sur ce dépôt. Il est volontairement **autonome** : aucune mémoire propriétaire ni connaissance externe n'est nécessaire pour travailler sur le projet.

## 1. Le projet

Portfolio de **Simon LM**, développeur front-end spécialisé en **accessibilité web**.

- Single-page avec sections ancrées + une partie blog / ressources sur l'accessibilité.
- Bilingue **français / anglais**, sélectionnable via l'interface.
- Déployé sur Vercel.

➡️ L'**accessibilité (WCAG)** et le **SEO** sont des priorités de conception, pas des options : c'est le sujet même du site.

## 2. Stack technique (état réel)

| Domaine | Choix |
|---|---|
| Framework | **Next.js 16** — App Router, Turbopack |
| UI | **React 19** |
| Langage | **TypeScript** |
| Paquets | **pnpm** uniquement (ne pas utiliser npm/yarn) |
| Styles | **SCSS**, architecture **7-1** (`src/styles/`), nommage **BEM** |
| État global | **Zustand** (`src/store/`) |
| Formulaires | **react-hook-form** + **Zod** (validation de schéma) |
| Accessibilité | **React Aria** (`@react-aria/*`, `@react-stately/*`) + **Radix UI** |
| i18n | maison : `middleware.ts` + `negotiator` + `@formatjs/intl-localematcher`, routes `app/[lang]/`, dictionnaires JSON |
| Tests unitaires | **Jest 30** + **Testing Library** (environnement jsdom) |
| Tests a11y | **pa11y / pa11y-ci** |
| Divers | framer-motion, react-markdown, feed (RSS), react-icons, Matomo |

## 3. Commandes (pnpm)

```bash
pnpm dev              # développement (Turbopack) — http://localhost:3000
pnpm build            # build de production
pnpm start            # serveur de production
pnpm lint             # ESLint (next lint)
pnpm test             # tests unitaires (Jest)
pnpm test:watch       # Jest en mode watch
pnpm test:coverage    # couverture de tests
pnpm test:a11y        # audit accessibilité (pa11y-ci) — l'app doit tourner
```

## 4. Arborescence

```
src/
├── app/
│   ├── [lang]/        # pages localisées : layout, page, sections, accessibility,
│   │                  #   legal, terms, privacy-policy, sitemap, dictionaries
│   ├── api/           # routes API (contact, dictionary)
│   └── rss.xml/       # flux RSS
├── components/        # header, stickyFooter, bottomFooter, accessibilityMenu,
│                      #   languageSelector, customSelect, navigationSticky, …
├── accessibility/     # logique de contrôle d'accessibilité
├── hooks/             # hooks React
├── store/             # stores Zustand
├── styles/            # SCSS 7-1 : abstracts, base, components, layout, pages, themes
├── types/             # types TS : common, components, form, localization
└── utils/
middleware.ts          # routage i18n (redirection selon la locale)
```

Alias d'import : `@/*` → `src/*`.

## 5. Conventions de code

- **TypeScript** partout, typage strict, éviter `any` non justifié.
- **SCSS + BEM** ; respecter l'architecture 7-1 existante ; pas de style inline.
- Valider les données entrantes avec **Zod** dès que pertinent.
- Pour tout élément interactif, privilégier **React Aria / Radix** au HTML brut (focus, ARIA, navigation clavier gérés correctement).
- **Accessibilité** : HTML sémantique, contrastes suffisants, navigation clavier, attributs ARIA corrects ; valider avec `pnpm test:a11y`.
- **SEO** : métadonnées, balises sémantiques, i18n correcte.
- Toujours **préciser le chemin complet et l'extension** des fichiers concernés.

## 6. Préférences d'interaction (Simon)

- **Répondre à l'utilisateur en français.** **Écrire les commentaires de code en anglais.**
- Signaler par des commentaires les passages de code modifiés.
- Proposer d'abord les **extraits modifiés**, puis le fichier complet si utile — pour repérer facilement les changements.
- Proposer de façon proactive les bonnes pratiques d'**accessibilité** et de **SEO**.

## 7. Bon à savoir

- Le champ `"name"` de `package.json` est resté `my-next-project` (nom du scaffold) ; le dépôt s'appelle **Portfolio_Simon-LM**. Sans incidence sur le build.
- Le formulaire de contact migre de **reCAPTCHA v3** vers **Spentria** (solution anti-spam de Simon).
- Branche de travail notable : `feature/darkmode-plus-a11y-package`.

---

_Ce fichier remplace l'ancien `pre-prompt.doc` (notes de démarrage de décembre 2024, devenues obsolètes)._
