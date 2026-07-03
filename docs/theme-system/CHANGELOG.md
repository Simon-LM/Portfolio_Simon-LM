<!-- @format -->

# Changelog — Système de thèmes de couleurs

Suivi des modifications apportées à la gestion des thèmes de couleurs
(SCSS `abstracts/` + `themes/`, `useTheme`, script anti-FOUC,
`AccessibilityMenu`). Complète le [CHANGELOG](../../CHANGELOG.md) global du
projet : toute évolution du système de thèmes doit être consignée **ici**,
avec le niveau de détail utile à la future extraction en paquet réutilisable.

Format : groupé par date (le projet est déployé en continu, pas de versions).
Sections : `Added` / `Changed` / `Fixed` / `Removed` / `Docs`.

---

## 2026-07-03

### Added

- Phase 3 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  couche 1 (rail numérique) complète — voir README § 6.1. Renommage de
  l'échelle de gris descriptive (`$gray-darkest`…`$gray-lightest`, 8 crans)
  en coordonnées Tailwind (`$gray-50`…`$gray-950`, 11 crans), avec ajout du
  cran manquant `gray-100`. `$off-white`/`$near-black` deviennent de simples
  alias resynchronisés (`$off-white: $gray-50`, `$near-black: $gray-950`)
  après chaque transformation de thème, au lieu d'être transformés
  indépendamment de l'échelle de gris.
  - Moteurs mis à jour pour transformer les 11 crans (au lieu de 8 + 2
    alias séparés) : `transform-light-to-dark`,
    `transform-light-to-high-contrast`, `transform-light-to-achromatopsia`
    (`_theme-utils.scss`), `transform-theme-for-anti-glare`
    (`_anti-glare-functions.scss`). Les moteurs daltoniens (-opies/-anomalies)
    ne transforment pas les gris — inchangés, par conception.
  - Clés de configuration renommées dans `_dark.scss` et `_achromatopsia.scss`
    (+ ajout de `"gray-100": 0`, cran non consommé par les variables
    dérivées). Dans `_deuteranomaly.scss`, `_protanomaly.scss`,
    `_tritanomaly.scss` : suppression des clés `"gray-*"` qui étaient des
    entrées mortes (jamais consommées par ces moteurs).
  - `generate-theme-css-vars()` émet désormais `--gray-50`…`--gray-950` (11
    lignes, ordre `950`→`50` conservé pour un diff d'ajout pur) au lieu de
    `--gray-darkest`…`--gray-lightest` (8 lignes) ; `--off-white`/
    `--near-black` inchangées (émises depuis les alias).
  - 5 consommateurs composants mis à jour (`_contact.scss`,
    `_accessibility-menu.scss`) : `var(--gray-medium-light)` → `var(--gray-500)`,
    `var(--gray-light)` → `var(--gray-400)`, `var(--gray-dark)` →
    `var(--gray-700)`, `var(--gray-lighter)` → `var(--gray-300)` (×2, dont un
    dans une ligne commentée).
  - Vérification : diff du CSS compilé strictement additif (39 nouvelles
    lignes `--gray-50`/`--gray-100`/`--gray-950` sur 14 blocs — `:root`, le
    bloc `prefers-color-scheme`, et les 12 `[data-theme]` ; note : le plan
    en annonçait 13, l'arithmétique exacte est 1 + 1 + 12 = 14), prouvé par
    tri + `comm -3` (42 lignes de différence au total, dont 3 par bloc,
    toutes des ajouts). Contrôles ciblés passés : `high-contrast` conserve
    `--color-main-bg: #000000` / `--color-main-text: #ffff00` ;
    `achromatopsia` reste sur la famille `neutral` et non `stone` ; dans
    chaque bloc `--off-white == --gray-50` et `--near-black == --gray-950`.

### Changed

- Phase 2 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  `setTheme()` (`src/hooks/useTheme.ts`) réduit à ses trois lignes utiles
  (poser `data-theme`, écrire `localStorage`, `setThemeState`). Suppression
  des artefacts de débogage : double reflow forcé
  (`offsetWidth`/`offsetHeight`), classe temporaire `theme-switching` (non
  consommée par aucun style — vérifié par grep) avec son `setTimeout`, et les
  `console.log` de diagnostic. Aucun changement de CSS compilé ni de
  comportement observable.

### Removed

- Phase 1 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  purge du code mort identifié en README § 3 et § 5.1, sans aucun changement
  du CSS compilé (diff byte-identique à la baseline).
  - Fichiers supprimés : `src/styles/abstracts/_variables.scss`,
    `src/styles/abstracts/_dark-functions.scss` (non importés).
  - `_theme-utils.scss` : `transform-for-dark()` (référençait des maps
    disparues), les anciens mixins `generate-*-theme()` jamais inclus
    (high-contrast, deuteranopia, protanopia, tritanopia, achromatopsia) et
    leurs getters devenus orphelins (`get-deuteranopia-color`,
    `get-protanopia-color`, `get-tritanopia-color`, `get-deuteranomaly-color`,
    `get-protanomaly-color`, `get-tritanomaly-color`, `get-achromatic-color`),
    `transform-for-high-contrast()`, `$hc-colors` (doublon de `$hc-palette`),
    `str-replace()`. Dans `adapt-color-for-colorblindness()` : sélection de
    matrice LMS calculée mais jamais consommée ; suppression de cette
    affectation morte et des maps `$protanopia-matrix`/`$deuteranopia-matrix`/
    `$tritanopia-matrix`, ainsi que `rgb-to-lms()`/`lms-to-rgb()` (non
    appelées).
  - `_anti-glare-functions.scss` : `safe-hue-for-keratoconus()` (jamais
    appelée).
  - Blocs de code commenté historiques (anciennes versions superseded) dans
    `_theme-utils.scss`, tous les fichiers `themes/_*.scss`, `main.scss`,
    `_theme-system.scss`, `_theme-variables.scss`, `layout.tsx`,
    `useTheme.ts`, `AccessibilityMenu.tsx`. Virgules parasites en fin de
    commentaire (`,,,,,,,,,,`) dans `_theme-utils.scss` et les thèmes
    daltoniens complets.
  - Non touché volontairement : deux lignes commentées dans
    `getFontTypeLabel()` (`AccessibilityMenu.tsx`, types de police
    "tiresias"/"ralewaydots" encore actifs dans l'UI) — sujet distinct de la
    police dyslexique, hors périmètre de cette migration ; signalé pour
    décision séparée.

## 2026-07-02

### Docs

- Création du plan d'exécution
  [PLAN-migration-fondations.md](./PLAN-migration-fondations.md), destiné à
  une IA exécutante : 8 phases (baseline → purge du code mort → nettoyage
  runtime → rail numérique 11 crans → kebab-case → migration `@use`/API Sass
  moderne → couche 2 des rôles → source unique de la liste des thèmes →
  finalisation), avec protocole de vérification par diff du CSS compilé,
  tables de renommage complètes et périmètre d'exclusion. Un seul changement
  visuel autorisé : `--color-accent-hover` passe de `darken(amber-300, 15%)`
  au cran de rail `amber-500`.
- Ajout de la section « Architecture cible du composant exportable »
  (README § 6) suite aux discussions de conception : modèle à trois couches
  (rail numérique 11 crans / ~23 rôles comme API du paquet / tokens de
  composants hors paquet), périmètre inclus/exclu du futur paquet, options
  de distribution (workspace pnpm → npm ; modèle « copie » écarté) et
  trajectoire en 4 étapes. Décisions actées : nommage numérique du rail
  (`$gray-50`…`$gray-950`), base du vocabulaire des rôles (hybride
  Primer + paires `on-*` de Material), kebab-case généralisé. Le canal de
  distribution est explicitement identifié comme décision *reportable sans
  risque* (§ 6.4).
- Correction du constat n° 8 (README § 5) : le mélange underscore/tiret des
  variables dérivées n'est pas une incohérence mais une convention voulue
  (underscore = séparateur de niveaux) — invérifiable toutefois, car Sass
  traite `-` et `_` comme interchangeables dans les identifiants.
- Création de cette documentation dédiée (`docs/theme-system/`) : principe de
  fonctionnement complet (chaîne compilation Sass → custom properties →
  runtime React), cartographie des fichiers, état des lieux (code mort, API
  Sass dépréciée, duplications) et pistes d'amélioration en vue du packaging.
  Voir [README.md](./README.md).

## 2026-07-01

_Entrées rétro-remplies depuis le changelog global (refonte ESLint/Next 16)._

### Fixed

- Le script anti-FOUC (`src/app/[lang]/layout.tsx`) ne reconnaissait que 5
  des 12 thèmes (`light`, `dark`, `high-contrast`, `deuteranopia`,
  `protanopia`) — un thème sauvegardé `anti-glare-*`, `*-anomaly` ou
  `achromatopsia` provoquait un flash du mauvais thème au chargement avant
  correction par React. Liste synchronisée avec `VALID_THEMES` de `useTheme`.
- `useTheme` : l'initialisation par `useEffect` appelant `setTheme()` a été
  remplacée par un initialiseur paresseux de `useState` lisant
  `localStorage`/`matchMedia` ; l'attribut DOM est posé dans un effet sans
  `setState` (conformité `react-hooks/set-state-in-effect`).
- `usePrefersDarkMode` : réécrit avec `useSyncExternalStore` (abonnement
  natif à la media query, plus de `setState` dans le corps d'effet).
- `AccessibilityMenu` : passage au hook `useIsMounted()` ; suppression d'un
  effet de synchronisation redondant (mode dyslexie) ; `reduceMotion`
  initialisé paresseusement et synchronisé vers le DOM par un effet dédié.

## Antérieur (résumé)

Le système a été construit itérativement fin 2024 – 2025 (historique complet
dans git). Jalons notables :

- Génération initiale des thèmes à la main (`generate-X-theme()` par thème),
  puis refonte vers le modèle actuel **light + transformation configurée**
  (`transform-light-to-X($config)`) — les anciennes versions subsistent en
  commentaires dans les fichiers de thèmes.
- Ajout des thèmes daltoniens complets (-opies), puis des formes légères
  (-anomalies), puis de l'achromatopsie.
- Ajout des thèmes anti-éblouissement (light/dark) par composition au-dessus
  des thèmes de base.
- `feat(accessibility)` `cfc23ee` : première tentative de packaging
  (`packages/darkmode-plus-a11y`, branche
  `feature/darkmode-plus-a11y-package`, non mergée, antérieure aux refontes).
