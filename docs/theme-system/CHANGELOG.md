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
