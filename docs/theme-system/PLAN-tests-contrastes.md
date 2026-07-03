<!-- @format -->

# Plan d'exécution — système de tests de contrastes (chantier E1)

**Document d'exécution destiné à une IA.** Mêmes règles générales que
[PLAN-migration-fondations.md](./PLAN-migration-fondations.md) : branche
dédiée, un commit par phase, sortie brute des vérifications dans chaque
rapport, arrêt et rapport en cas d'imprévu, entrée
[CHANGELOG.md](./CHANGELOG.md) à chaque phase. Conception de référence :
[GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md), chapitre
« système de tests de contrastes ».

Branche : `feat/contrast-tests`.

**Règle absolue de ce chantier : il est purement additif.** Aucun fichier de
`src/styles/` ne doit être modifié — on *mesure* les couleurs, on ne les
corrige pas. Les échecs constatés deviennent des *waivers* documentés
(phase 3), jamais des retouches de couleurs. L'oracle est donc trivial : le
CSS compilé doit rester byte-identique du début à la fin.

## Objectif

À chaque `pnpm test`, vérifier mécaniquement que chaque paire
texte/fond déclarée respecte son seuil WCAG 2.2 dans chacun des 12 thèmes,
et produire un rapport matrice lisible. Les échecs préexistants sont
inventoriés comme waivers pour arbitrage par Simon — le système fournit
l'état des lieux, puis empêche toute régression future (« ratchet »).

## Implantation

```
src/accessibility/contrast/
├── wcag.ts               # luminance, ratio, composition alpha
├── extract-themes.ts     # compilation SCSS → map thème → { --var: couleur }
├── contrast-pairs.ts     # registre des paires (source de vérité) + waivers
├── report.ts             # générateur de la matrice markdown
└── __tests__/
    ├── wcag.test.ts
    ├── extract-themes.test.ts
    └── contrast.test.ts  # la suite principale
docs/theme-system/CONTRAST-REPORT.md   # artefact généré (commité)
```

Dépendances dev à ajouter (`pnpm add -D`) : `culori` (parsing de couleurs
hex/rgb()/hsl() et conversion — ne pas réécrire un parseur à la main) et
`postcss` s'il n'est pas déjà résoluble (parsing structuré du CSS compilé —
pas de regex sur le CSS).

## Phase 0 — Préparation

Arbre propre, branche depuis `main`, `pnpm build`/`lint`/`test` verts,
snapshot CSS de référence (`pnpm exec sass --no-source-map --style=expanded
src/styles/main.scss /tmp/contrast-e1/phase0.css`).

## Phase 1 — Utilitaires (`wcag.ts`, `extract-themes.ts`)

### `wcag.ts`

- `toRgb(value: string)` : via culori ; erreur explicite si la valeur n'est
  pas une couleur (ne jamais retourner une couleur par défaut).
- `compositeOver(fg, bg)` : composition alpha standard en sRGB
  (`c = a·c_fg + (1−a)·c_bg` par canal). Utilisée quand l'avant-plan ou le
  fond porte un alpha < 1.
- `contrastRatio(fg, bg)` : formule WCAG 2.x (luminance relative,
  `(L1+0.05)/(L2+0.05)`). culori fournit `wcagContrast` — l'utiliser, mais
  **après** composition alpha éventuelle.
- Seuils : `text` → 4.5, `large-text` → 3.0, `non-text` → 3.0 (SC 1.4.3 et
  1.4.11).

Tests unitaires avec valeurs de référence connues : blanc/noir = 21:1,
`#767676`/blanc = 4.54:1, composition d'un `rgba(0,0,0,0.5)` sur blanc =
`#808080` (à 1 près par canal).

### `extract-themes.ts`

1. Compiler `src/styles/main.scss` via l'API JS de `sass`
   (`compile(...)`) — une seule fois, mémoïsé au niveau module.
2. Parser avec postcss ; pour chaque bloc dont le sélecteur est
   `[data-theme="X"]` (les 12), collecter les déclarations `--*` dans une
   `Map<theme, Map<varName, value>>`. Ignorer `:root` et le bloc
   `prefers-color-scheme` (redondants), mais **vérifier en test** que les
   custom properties de `:root` sont identiques à celles de
   `[data-theme="light"]` (garde-fou de cohérence).
3. Erreur explicite si un thème attendu (liste importée de
   `src/config/themes.ts` — source unique) est absent du CSS.

⚠️ Le test principal compile du Sass et lit le système de fichiers : le
fichier de test doit porter le docblock `/** @jest-environment node */`
(l'environnement par défaut du projet est jsdom).

**Vérif** : `pnpm test` vert, CSS byte-identique à phase 0.
**Commit** : `feat(theme): contrast phase 1 — WCAG utils and theme extraction`.

## Phase 2 — Le registre des paires (`contrast-pairs.ts`)

Structure :

```ts
export type ContrastLevel = "text" | "large-text" | "non-text";

export type ContrastPair = {
  id: string;                     // stable, ex. "role/fg-base-on-bg-base"
  fg: string;                     // nom de custom property, ex. "--fg-base"
  bg: string;
  level: ContrastLevel;
  composeOver?: string;           // fond de composition si fg/bg porte un alpha
  themes?: readonly ThemeOption[]; // défaut : les 12
  waiver?: {
    reason: string;
    preexisting: boolean;         // true = constaté à l'introduction du système
    measured?: Record<string, number>; // thème → ratio mesuré
  };
};
```

Registre initial — **niveau rôles** (partira dans le paquet en E7) :

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

Registre initial — **niveau site** (couche 3 du portfolio) :

| fg | bg | level | note |
| --- | --- | --- | --- |
| `--color-main-text` | `--color-main-bg` | text | |
| `--color-hero-text` | `--color-hero-bg` | text | |
| `--color-header-text` | `--color-header-bg` | text | |
| `--color-header-text-role` | `--color-header-bg` | text | fg-muted sur accent — paire sensible |
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

Le registre est **extensible, jamais amputé** : une paire problématique
reçoit un waiver, elle n'est pas supprimée.

**Vérif** : lint + typecheck. **Commit** :
`feat(theme): contrast phase 2 — pair registry`.

## Phase 3 — La suite de tests + inventaire des échecs

1. `contrast.test.ts` : pour chaque paire × chaque thème applicable,
   résoudre les deux couleurs (composition alpha si `composeOver`), calculer
   le ratio, comparer au seuil. Paire waivée : le test est marqué
   passant-avec-waiver, **mais** si le ratio mesuré devient *conforme*, le
   test échoue avec le message « waiver obsolète, le retirer » (les waivers
   ne peuvent pas devenir des zombies).
2. **Premier run = inventaire.** Il *va* échouer — c'est attendu (on sait
   déjà : `--success` emerald-600 sur fond clair ≈ 3.61:1 en light ;
   erreur deutéranopie `#ffcc00` ≈ 1.45:1…). Pour chaque échec : ajouter un
   waiver `preexisting: true` avec le ratio mesuré et une raison factuelle
   (ex. « couleur fonctionnelle non consommée par le site à ce jour ;
   sera retraitée par la refonte daltonienne »). **Ne corriger aucune
   couleur.**
3. Fin de phase : `pnpm test` intégralement vert, et la liste complète des
   waivers figure dans le rapport de phase (sortie brute) — c'est le
   livrable principal pour l'arbitrage de Simon.

**Commit** : `feat(theme): contrast phase 3 — full suite with pre-existing waivers inventory`.

## Phase 4 — Le rapport matrice

1. `report.ts` : génère `docs/theme-system/CONTRAST-REPORT.md` — une matrice
   paires × 12 thèmes, chaque cellule = ratio mesuré, marquée ✓ (conforme),
   ✗ (échec — ne doit plus exister après phase 3), ⚠ (waiver, avec renvoi
   vers la raison). En tête : date de génération et commande de
   régénération.
2. Script `package.json` : `"contrast:report": ...` (exécution via `tsx` ou
   `ts-node` selon ce qui est déjà résoluble ; sinon compiler à la volée
   avec le même transform que Jest).
3. Générer et **committer** le rapport. Le rapport est un artefact
   régénérable : le test principal vérifie qu'il est à jour (le régénérer
   en mémoire et comparer — échec si un dev a changé des couleurs sans
   régénérer le rapport).

**Commit** : `feat(theme): contrast phase 4 — generated contrast matrix report`.

## Phase 5 — Finalisation

1. `pnpm build`, `pnpm lint`, `pnpm test` verts ; CSS toujours
   byte-identique à phase 0 (prouver par diff).
2. Docs : README § 6.4 et guide E1 (chantier réalisé) ; entrée changelog de
   synthèse.
3. Rapport final à Simon : le CONTRAST-REPORT.md, la liste des waivers
   `preexisting` triée par gravité (ratio le plus bas d'abord), et les
   recommandations de traitement (lesquels relèvent de la refonte
   daltonienne, lesquels d'un ajustement de rôle).

**Commit** : `docs(theme): contrast phase 5 — documentation and waiver inventory`.

## Hors périmètre (ne PAS faire)

- Corriger des couleurs, des rôles ou des thèmes (aucune modification de
  `src/styles/`) — les échecs deviennent des waivers, l'arbitrage revient à
  Simon.
- Tests de **distinguabilité** par simulation CVD (matrices Brettel/Viénot,
  ΔE) : prévus avec la refonte daltonienne — mais concevoir le registre de
  façon extensible (le champ `level` pourra être rejoint par un
  `kind: "distinguishability"` plus tard).
- Colonne APCA : plus tard, consultative uniquement.
- Intégration CI GitHub Actions : hors périmètre tant que le projet n'a pas
  de workflow CI (le gate est `pnpm test` en local).
