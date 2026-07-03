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

### Docs (garde-fous du remap daltonien — mesures)

- Question de Simon : le remap de familles peut-il casser le ratio 4.5:1 ou
  entrer en collision avec un fond ? Réponse mesurée : **oui, sans
  garde-fous**. La luminance Tailwind n'est pas constante entre familles à
  poids égal (à 600 : 0.167 `redd` → 0.280 `amber` ;
  `redd-600→amber-600` sur fond clair : 4.62:1 → 3.05:1). Garde-fous
  intégrés au mécanisme (guide E2) : décalage de poids par entrée de table
  (`redd→amber(+1)` → 4.81:1) et tables par défaut conscientes des
  collisions ; la garantie finale reste portée par la vérification E1.
  Découverte annexe : la `special-color` erreur de la deutéranopie
  actuelle (`#ffcc00`) vaut **1.45:1** sur fond clair — latent (aucun
  composant ne consomme `--danger` aujourd'hui), mais piège certain du
  paquet publié ; confirme le séquencement E1 d'abord.

### Docs (évolutions des moteurs actées)

- Décisions de Simon sur les propositions d'évolution des moteurs :
  **OKLCH acté** pour l'anti-éblouissement (ajouté au
  [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) comme phase 3, avec
  procédure de calibration sur le rail gris ; overlay et finalisation
  renumérotés en phases 4 et 5) **et** pour le daltonien. Refonte
  daltonienne actée dans son principe et reformulée sous les contraintes de
  conception de Simon (guide E2) : le système est **ancré aux palettes
  Tailwind** (les consommateurs personnalisent en adoptant la géométrie 11
  poids) et l'adaptation **ne doit pas enlaidir** — d'où le mécanisme
  retenu : **remap de familles Tailwind à poids constant** (ex.
  deutéranopie : `emerald → sky`, `redd → amber`), OKLCH en repli hors
  palette, vérifié par les tests de distinguabilité par simulation CVD
  (chantier E1). La refonte daltonienne est séquencée après E1 et recevra
  son propre plan.

### Docs (plan de correction des moteurs)

- Création de [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) (chantier E2,
  pour IA exécutante) : phase 1 sans changement visuel (`if()` mal formé,
  `$intensity` inutilisé, `$hue_shift` morte, `enhance-factor` configurable
  avec défaut 2.5, borne de fenêtre de teinte) ; phase 2 anti-glare en
  **passe unique à couverture totale** (corrige la double atténuation de
  ~25 tokens et l'absence d'atténuation de ~45 autres) ; phase 3
  suppression de l'overlay `backdrop-filter` (décision visuelle Simon).
  Les évolutions de mécanisme (OKLCH, ancres de teintes, tests de
  distinguabilité par simulation CVD) sont consignées dans le guide E2
  comme propositions en attente d'arbitrage.

### Docs (guide d'extraction + revue des moteurs)

- Création de [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) :
  grandes lignes de la transformation en paquet open source (chantiers
  E1→E7 : tests de contraste d'abord, revue des moteurs, monorepo pnpm,
  extraction SCSS puis runtime, modules de préférences, CLI de scaffolding,
  publication npm publique), avec la conception détaillée du **système de
  tests de contrastes** (registre de paires, compilation → extraction par
  bloc `[data-theme]` → ratio WCAG 2.2, gestion de l'alpha par composition,
  waivers documentés, rapport matrice, APCA consultatif).
- Merge de `refactor/theme-foundations` dans `main` (`bbc28f0`) après
  validation visuelle des ombres restaurées par Simon ; branche supprimée.
- Revue des moteurs (constats, corrections à planifier — chantier E2 du
  guide) : **anti-glare** : double transformation des tokens de couche 3
  (rail transformé, rôles dérivés, puis ~25 tokens re-transformés — des
  tokens partageant le même rôle rendent différemment, ex. `main-bg` vs
  `panel-bg`), paramètre `$intensity` inutilisé, expression `if()` mal
  formée mais accidentellement fonctionnelle dans la branche d'erreur,
  overlay `body::before` en `backdrop-filter` plein écran à évaluer (coût
  GPU permanent pour un effet quasi imperceptible : contrast 98 % /
  brightness 99 %) ; **daltoniens** : `enhance-factor` codé en dur à 2.5
  pour les -opies (non configurable, contrairement aux anomalies),
  variable `$hue_shift` morte dans `adapt-color-for-color-anomaly`,
  fenêtres de teinte laissant la palette réelle du site quasi inchangée
  (les thèmes -opies ≈ light + success/danger — comportement à confirmer
  comme voulu ou à retravailler).

### Docs (architecture cible — décisions)

- Deux décisions actées avec Simon, inscrites au README § 6 :
  **élargissement** du composant exportable au système de préférences
  d'accessibilité complet (nouveau § 6.5 : déclencheur + carte livrés
  fonctionnels, modules opt-in zoom/polices/animations/dyslexie, polices
  d'accessibilité embarquées — licences à vérifier avant publication,
  contrats hôte `rem`/`reduce-motion`) et **distribution hybride** (§ 6.3
  réécrit : moteurs via npm pour les correctifs centralisés, UI scaffoldée
  dans le projet via une CLI `init`, à la manière shadcn/Radix). Nom de
  travail : `a11y-prefs`. Périmètre § 6.2 et § 6.4 mis à jour en
  conséquence.

### Fixed (post-revue)

- Résolution de la déclaration morte `var(--color-gray-dark)` (custom
  property jamais définie ; de plus, `rgba(var(--x), a)` est invalide en
  CSS) : les ombres portées des cartes portfolio, des cartes compétences et
  du formulaire de contact, ainsi qu'une bordure du sélecteur de langue, ne
  s'affichaient pas. Nouveau token `--color-shadow`
  (`rgba($border-strong, 0.1)`, calculé en Sass par thème, sur le modèle de
  `--color-tooltip-bg`) consommé par les 3 `box-shadow` ; la bordure passe
  sur `var(--border-strong)`. **Changement visuel voulu** : ces ombres et
  cette bordure (re)deviennent visibles, dans les 12 thèmes.

### Docs (phase 8 — finalisation)

- Phase 8 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  vérification globale (`pnpm build`/`lint`/`test` verts ; contrôle visuel
  des 12 thèmes via un script CDP headless — captures d'écran + zéro erreur
  console ; `pnpm test:a11y` non exécutable dans cet environnement, Chromium
  de pa11y-ci absent — non lié à la migration). Mise à jour de
  [README.md](./README.md) : § 3 (fichiers purgés marqués, `src/config/themes.ts`
  ajouté), § 4 (chaîne à trois couches, noms à jour), § 5 (constats n° 1, 5,
  6, 7 marqués résolus, n° 4, 8, 11 résolus partiellement), § 6 (étapes 1 et
  2 de la trajectoire marquées faites), § 7 (section « Assainissement »
  marquée faite). Entrée de synthèse ajoutée au
  [CHANGELOG](../../CHANGELOG.md) global.
  - **Écarts constatés par rapport au plan initial**, tous identifiés et
    tranchés en cours d'exécution (voir entrées phases 3, 4, 5, 6
    ci-dessous pour le détail) : deux régressions de valeur détectées et
    corrigées pendant la migration Sass (phase 5 : clamping de
    `color.adjust`, arrondi de `color.channel`) ; une régression de valeur
    détectée et corrigée pendant l'introduction des rôles (phase 6 :
    tokens de bouton non réappliqués par le moteur anti-éblouissement) ;
    un deuxième changement visuel non prévu par le plan, mineur et
    documenté (phase 4 : la couleur du texte des tags portfolio, jusque-là
    non résolue à cause de la typo `bg-texte`, s'applique réellement pour
    la première fois) ; un écart de comptage sans conséquence dans le texte
    du plan (phase 3 : 14 blocs de thème réels contre 13 annoncés).
  - **Point laissé en suspens**, signalé explicitement par le plan comme
    hors périmètre : `src/styles/pages/_contact.scss` ligne ~143 (et deux
    occurrences supplémentaires trouvées en cours de route,
    `_skills.scss:108` et `_language-selector.scss:15`) référencent
    `rgba(var(--color-gray-dark), 0.1)`, une custom property qui n'a jamais
    existé — déclaration morte antérieure à cette migration, non corrigée
    (décision à prendre séparément par Simon).

### Added (phase 7 — single source of truth, runtime)

- Phase 7 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  élimination de la triple duplication de la liste des 12 thèmes (README
  § 5 constat n° 5). Nouveau `src/config/themes.ts` exportant `THEMES`
  (`as const`) et le type `ThemeOption` dérivé.
  - `useTheme.ts` : suppression du type `ThemeOption` local et de
    `VALID_THEMES`, import depuis `@/config/themes` (cast
    `readonly string[]` pour `.includes()` sur un tableau `as const`).
  - `layout.tsx` : le script anti-FOUC injecte désormais
    `${JSON.stringify(THEMES)}` au lieu de la liste codée en dur — vérifié
    dans le HTML généré par `pnpm build` (les 12 thèmes sont bien présents
    dans le script inline).
  - `AccessibilityMenu.tsx` : le cast union inline de 12 littéraux dans
    `handleColorVisionChange` remplacé par `ThemeOption`.
  - Ajout d'un commentaire de synchronisation dans `_theme-system.scss`
    pointant vers `src/config/themes.ts` (les blocs `[data-theme]` SCSS
    restent à synchroniser manuellement jusqu'à l'extraction en paquet).
  - Aucun changement de CSS compilé (diff vide) ; `pnpm build`, `pnpm lint`,
    `pnpm test` verts.

### Changed (phase 6 — layer 2, role tokens)

- Phase 6 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  introduction de la couche 2 (rôles), voir README § 6.1. **Seule phase du
  plan avec un changement visuel autorisé** (voir plus bas).
  - Renommage des primitives sémantiques : `$primary-color` → `$accent`,
    `$secondary-color` → `$accent-ink`, `$tertiary-color` → `$accent-soft`,
    `$link-color` → `$link`, `$link-color-hover` → `$link-hover`,
    `$success-color` → `$success`, `$error-color` → `$danger` (Sass et clés
    de configuration). Nouvelle primitive `$accent-strong` (amber-500),
    transformée dans chaque moteur à l'identique de `$accent`.
  - Nouveau mixin `apply-roles()` dans `_theme-variables.scss` : dérive 15
    tokens de rôle (`$bg-*`, `$fg-*`, `$border-*`, `$focus-ring`) depuis le
    rail et les primitives, appelé par chaque moteur (et
    `light-theme-variables()`) entre la transformation et
    `apply-theme-variables()`.
  - Recâblage complet des ~70 tokens de couche 3 pour dériver des rôles
    plutôt que directement du rail/des primitives (table complète en
    README § 6.3). Corrigé au passage : `--color-button-hover-bg`,
    `--color-button-hover-text` et `--color-button-active-text` avaient
    chacun une incohérence préexistante (l'émission CSS lisait directement
    `$link-hover`/`$off-white`/`$near-black`, en ignorant la variable Sass
    censée porter cette valeur) — alignées sur la valeur *effective*, donc
    aucun changement de valeur émise en thème statique.
  - `generate-theme-css-vars()` : renommage des 5 propriétés de primitives
    (`--primary-color` → `--accent`, etc.), ajout de 8 propriétés de
    primitives/feedback (`--accent-strong`, `--success`, `--danger`, …) et
    15 propriétés de rôles (`--bg-base` … `--focus-ring`). 12 consommateurs
    composants mis à jour (`var(--primary-color)` → `var(--accent)` ×7 dont
    un avec valeur de repli, `var(--link-color)` → `var(--link)` ×3,
    `var(--link-hover-color)` → `var(--link-hover)` ×2 ; le reste des
    occurrences comptées par le plan était dans des commentaires, mis à
    jour par cohérence).
  - **Régression détectée et corrigée pendant la migration** : le moteur
    anti-éblouissement (`transform-theme-for-anti-glare`) transforme
    chaque token de couche 3 individuellement et ne recalculait pas
    `$color-button-hover-bg`/`-text`/`$color-button-active-text` après
    coup — en les faisant dériver des rôles (couche 2) au lieu de les lire
    depuis les primitives directement, ces trois tokens seraient restés
    sur leur valeur *avant* réduction d'éblouissement dans les thèmes
    `anti-glare-light`/`anti-glare-dark`. Corrigé en les rederivant des
    rôles resynchronisés (déjà anti-éblouis) juste après `apply-roles()`
    dans ce moteur.
  - **Changement visuel** (seul de toute la migration) :
    `--color-accent-hover` passe de `darken(amber-300, 15%)` à
    `amber-500` (`#f59e0b`) — remplacement d'un `darken()` arbitraire par
    un cran du rail, et son équivalent transformé dans les 11 autres
    thèmes. Vérifié : diff du CSS compilé strictement additif partout
    ailleurs (rôles + primitives + `accent-strong`/`success`/`danger`
    ajoutés dans les 14 blocs), confirmé par tri + `comm -3`. Contrôle
    visuel à faire en phase 8.

### Changed (phase 5 — Sass modules)

- Phase 5 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  migration complète `@import` → `@use`/`@forward` sur l'ensemble de
  `src/styles/` (système de thèmes **et** les autres partials chargés par
  `main.scss`, puisque `@use` exige que chaque fichier déclare explicitement
  ses dépendances — l'ancien flattening global de `@import` masquait ces
  dépendances). Compilation finale **sans aucun avertissement de
  dépréciation** (`@import`, `darken`/`lighten`, `red`/`green`/`blue`,
  `hue`/`saturation`/`lightness`, `map-get`/`map-has-key`/`map-merge`,
  `index`/`nth`/`length`, division `/`, syntaxe `if()`).
  - Préalable anti-cycle : `get-color()`, `$tailwind-weights`, `$midpoint`
    déplacés de `_theme-utils.scss` vers `_base-palette.scss`.
  - `_theme-variables.scss` : toutes les variables mutées par
    `define-base-colors()`/`apply-theme-variables()` (rail 11 crans,
    couleurs sémantiques, ~70 tokens de couche 3) désormais déclarées à la
    racine du module — obligatoire pour que les réaffectations `!global`
    des moteurs restent valides sous `@use`.
  - Cycle détecté et corrigé entre `_mixins.scss` et `_placeholders.scss`
    (extend/include mutuels) : le mixin `word-wrap` (4 déclarations) a été
    intégré directement dans les deux placeholders qui l'utilisaient plutôt
    que d'y être inclus, cassant le cycle sans changer le CSS produit.
  - **Deux régressions détectées et corrigées** pendant la migration (le
    diff du CSS compilé les a révélées — protocole de vérification
    fonctionnel) :
    1. `color.adjust($c, $lightness: -15%)` ne reproduit **pas** le
       comportement borné de `darken()` : sur une couleur déjà à 0 % de
       luminosité (ex. `$primary-color` viré au noir pur par un thème),
       `darken()` plafonne à 0 % alors que `color.adjust()` produit une
       lightness négative invalide (`hsl(0, 0%, -15%)`). Nouvelle fonction
       `adjust-lightness-clamped()` dans `_base-palette.scss` qui borne
       explicitement le résultat entre 0 % et 100 %, utilisée partout où
       `darken()`/`lighten()` étaient appelés.
    2. `color.channel($c, "red"/"green"/"blue", $space: rgb)` ne borne pas
       le résultat à un entier, contrairement aux anciennes fonctions
       globales `red()`/`green()`/`blue()` — écart constaté sur des couleurs
       reconstruites via `hsl()` (ex. `rgba(67.6, 64, 60.4, 0.7)` au lieu de
       `rgba(68, 64, 60, 0.7)`). Tous les appels concernés enveloppés dans
       `math.round()`.
  - **Écarts résiduels dans le diff CSS, expliqués et prouvés inoffensifs**
    (aucune valeur ne change, uniquement confirmé par tri + `comm -3`) :
    - Les en-têtes de commentaires `/** @format */` et le bloc de
      documentation de `_theme-utils.scss` n'apparaissent plus qu'**une
      seule fois** dans le CSS compilé (contre jusqu'à 13× avant) : `@use`
      ne charge chaque module qu'une fois, alors que `@import` réinjectait
      tout le fichier à chaque `@import`, y compris ses commentaires de
      tête. Sans effet sur le runtime (ce sont des commentaires).
    - Réordonnancement de 3 listes de sélecteurs issues de `@extend`
      (`.sticky-footer__link:hover, …`, `.sticky-footer__fixed-links, …`,
      `.skills__title, .skills__subtitle, …`) : même ensemble de
      sélecteurs, même règle, ordre différent — conséquence du nouveau
      graphe de chargement des modules. Sans effet (mêmes déclarations,
      pas de conflit de spécificité entre ces sélecteurs).

### Fixed

- Phase 4 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  typo `bg-texte` corrigée — `$color_portfolio-tag_bg-texte` devient
  `$color-portfolio-tag-text`, et la custom property émise
  `--color-portfolio-tag-bg-text` devient `--color-portfolio-tag-text`. Le
  consommateur (`_portfolioCard.scss`) référençait déjà le nom correct
  (`var(--color-portfolio-tag-text)`) : la couleur du texte des tags
  portfolio, jusqu'ici non résolue (variable inexistante → héritage du
  parent), s'applique désormais réellement. Seul écart visuel non prévu par
  le plan initial, distinct du changement d'accent-hover de la phase 6 — à
  valider visuellement (phase 8).

### Changed

- Phase 4 de [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) :
  uniformisation kebab-case de la couche 3 (README § 5.1/§ 6, ~66 variables
  `$color_...` → `$color-...`, dont `$color_button_hover_bg`). Sans effet sur
  le CSS compilé (Sass traite `-`/`_` comme interchangeables) — diff vide
  après normalisation, hormis la correction de typo ci-dessous. Suppression
  de deux doubles assignations devenues visibles après uniformisation
  (`$color-main-bg`/`$color_main-bg`, `$color-main-text`/`$color_main-text`
  — même variable assignée deux fois dans `apply-theme-variables()`) : une
  seule conservée par variable.

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
