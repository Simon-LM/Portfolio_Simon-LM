<!-- @format -->

# Plan de migration — Fondations du système de thèmes (couches 1 & 2)

**Document d'exécution destiné à une IA.** Il est autonome : tout le contexte
nécessaire est ici ou dans les documents référencés. Exécuter les phases
**dans l'ordre**, une par une, avec vérification et commit à chaque phase.

Contexte à lire avant de commencer :

- [README.md](./README.md) — en particulier § 1 (principe), § 4 (chaîne
  détaillée) et **§ 6 (architecture cible : c'est la spécification de ce
  plan)**.
- `AGENTS.md` à la racine — conventions du dépôt (pnpm uniquement, réponses
  en français, **commentaires de code en anglais**, SCSS 7-1, accessibilité
  prioritaire).

Objectif : assainir le système de thèmes et le porter sur l'architecture
cible (rail numérique complet + couche de rôles), **sans aucun changement
visuel** à une exception près, documentée en phase 6. Ce travail précède
l'ajout de fonctionnalités et l'extraction en paquet réutilisable.

---

## Règles générales (à respecter dans toutes les phases)

1. **Branche** : créer `refactor/theme-foundations` depuis `main`. Un commit
   par phase, message `refactor(theme): phase N — <résumé>`. Ne pas merger,
   ne pas pousser en force, ne pas déployer.
2. **Le CSS compilé est l'oracle.** Chaque phase définit son diff attendu
   sur le CSS compilé (voir protocole ci-dessous). Si le diff montre autre
   chose que ce qui est attendu : **s'arrêter, ne pas forcer, faire un
   rapport**. Ne jamais « corriger » une valeur de couleur pour faire passer
   un diff.
3. **Sass traite `-` et `_` comme identiques** dans les identifiants
   (`$color_main-bg` ≡ `$color-main-bg`). Lors des recherches, toujours
   greper les deux formes : `grep -rE 'color[_-]main[_-]bg'`.
4. **Ne pas toucher** : `private/`, `packages/`, `coverage/`, `public/`,
   les dictionnaires i18n, et tout ce qui ne concerne pas le système de
   thèmes, sauf instruction explicite d'une phase.
5. **Changelog** : chaque phase ajoute son entrée dans
   [CHANGELOG.md](./CHANGELOG.md) (section du jour, catégories
   Added/Changed/Fixed/Removed), dans le même commit que la phase.
6. Commentaires de code en anglais. Ne pas ajouter de commentaires du type
   « modified » / « new » : le git diff s'en charge.
7. En cas de doute sur une instruction : s'arrêter et poser la question,
   plutôt qu'interpréter.
8. **Chaque rapport de phase doit inclure la sortie brute des commandes de
   vérification** (le `diff`, pas un résumé). Un diff « propre » affirmé sans
   sa sortie ne vaut rien. Si un diff montre du réordonnancement de lignes,
   le prouver inoffensif par une comparaison insensible à l'ordre
   (`sort` des deux fichiers puis `comm -3`) : aucune *valeur* ne doit
   changer.
9. Les en-têtes `/** @format */` (pragma Prettier) ne sont **pas** des
   commentaires historiques : les conserver dans tous les fichiers.

## Protocole de vérification (utilisé par toutes les phases)

```bash
# Reference snapshot (phase 0), then one snapshot per phase:
mkdir -p /tmp/theme-migration
pnpm exec sass --no-source-map --style=expanded src/styles/main.scss /tmp/theme-migration/phase<N>.css
```

- Les avertissements de dépréciation sur stderr sont normaux jusqu'à la
  phase 5 (API `@import`, `darken()`, `/`…) ; ils n'affectent pas le fichier
  produit.
- Comparaison : `diff /tmp/theme-migration/phase<N-1>.css /tmp/theme-migration/phase<N>.css`.
  Quand une phase renomme des identifiants CSS, normaliser d'abord l'ancien
  snapshot avec les `sed` fournis par la phase, puis diff — le résultat doit
  correspondre **exactement** au diff attendu déclaré par la phase.
- En complément à chaque phase : `pnpm lint` et `pnpm test` doivent passer.
- `pnpm build` : au minimum aux phases 0, 5, 6, 7 et 8.

---

## Phase 0 — Préparation et baseline

1. Vérifier que l'arbre de travail est propre (`git status`) et partir de
   `main` à jour. Créer la branche `refactor/theme-foundations`.
2. Produire le snapshot de référence :
   `/tmp/theme-migration/phase0.css` (commande du protocole).
3. Vérifier que `pnpm build`, `pnpm lint` et `pnpm test` passent **avant**
   toute modification. S'ils échouent déjà : s'arrêter et faire un rapport.

**Critère de sortie** : baseline compilée, build/lint/test verts, branche
créée. (Pas de commit — aucune modification.)

## Phase 1 — Purge du code mort

But : supprimer les strates historiques pour que les phases suivantes
travaillent sur du code vivant uniquement.

1. **Supprimer les fichiers morts** (non importés depuis `main.scss`) :
   - `src/styles/abstracts/_variables.scss`
   - `src/styles/abstracts/_dark-functions.scss`
2. **Supprimer dans `src/styles/abstracts/_theme-utils.scss`** :
   - la fonction `transform-for-dark()` (elle référence des maps
     `$dark-adjustments` / `$tailwind-origins` qui n'existent plus) ;
   - tous les blocs de **code commenté** historiques (anciennes versions de
     fonctions/mixins).
3. **Candidats supplémentaires au code mort** dans `_theme-utils.scss` — à
   vérifier un par un avec
   `grep -rn "<nom>" src/styles src/components src/app` : ne supprimer que
   si la seule occurrence restante est la définition elle-même (attention
   aux appels en chaîne : supprimer en itérant, recompiler entre chaque) :
   `generate-dark-theme`, `generate-high-contrast-theme`,
   `generate-deuteranopia-theme`, `generate-protanopia-theme`,
   `generate-tritanopia-theme`, `generate-achromatopsia-theme`,
   `transform-for-high-contrast`, `$hc-colors` (doublon de `$hc-palette`),
   `rgb-to-lms`, `lms-to-rgb`, `$protanopia-matrix`, `$deuteranopia-matrix`,
   `$tritanopia-matrix` (sélectionnées mais jamais utilisées dans
   `adapt-color-for-colorblindness`), `safe-hue-for-keratoconus`,
   `get-deuteranopia-color`, `get-protanopia-color`, `get-tritanopia-color`,
   `get-deuteranomaly-color`, `get-protanomaly-color`,
   `get-tritanomaly-color`, `get-achromatic-color`, `str-replace`.
4. **Supprimer les blocs de code commenté** (uniquement du *code* commenté —
   conserver les commentaires explicatifs) dans :
   - `src/styles/themes/_dark.scss` (~85 lignes en tête de fichier),
     `_deuteranopia.scss`, `_protanopia.scss`, `_tritanopia.scss`,
     `_deuteranomaly.scss`, `_protanomaly.scss`, `_tritanomaly.scss`,
     `_achromatopsia.scss`, `_anti-glare-light.scss`, `_anti-glare-dark.scss`,
     `_light.scss`, `_high-contrast.scss` ;
   - `src/styles/main.scss` (imports commentés) et
     `src/styles/abstracts/_theme-system.scss` (lignes commentées) ;
   - `src/app/[lang]/layout.tsx` : l'ancien `return` commenté (~lignes
     71–104) ;
   - `src/hooks/useTheme.ts` et
     `src/components/accessibilityMenu/AccessibilityMenu.tsx` : lignes de
     code commenté résiduelles.
5. Nettoyer les virgules parasites en fin de maps Sass
   (`,,,,,,,,,,` dans `_theme-utils.scss` et les fichiers de thèmes).

**Diff CSS attendu** : aucun (byte-identique à phase 0).
**Commit** : `refactor(theme): phase 1 — remove dead code and legacy comments`.

## Phase 2 — Nettoyage du runtime `setTheme()`

Fichier : `src/hooks/useTheme.ts`.

1. Vérifier d'abord qu'aucun style ne dépend de la classe temporaire :
   `grep -rn "theme-switching" src/` — attendu : uniquement dans
   `useTheme.ts`. Si un style l'utilise : s'arrêter et faire un rapport.
2. Dans `setTheme()`, ne conserver que :
   `document.documentElement.setAttribute("data-theme", newTheme)`,
   `localStorage.setItem("theme", newTheme)`, `setThemeState(newTheme)`.
   Supprimer : les deux reflows forcés (`void …offsetWidth/Height`), l'ajout
   et le retrait de la classe `theme-switching`, le `setTimeout` et les
   `console.log`.

**Diff CSS attendu** : aucun. **Vérif** : `pnpm lint`, `pnpm test`.
**Commit** : `refactor(theme): phase 2 — clean debug artifacts from setTheme`.

## Phase 3 — Couche 1 : rail numérique complet

But : renommer l'échelle de gris en coordonnées Tailwind et restaurer le
cran manquant. Spécification : README § 6.1.

### 3.1 Table de renommage (variables Sass ET clés de configuration en chaînes)

| Ancien nom | Nouveau nom |
| --- | --- |
| `$gray-lightest` / `"gray-lightest"` | `$gray-200` / `"gray-200"` |
| `$gray-lighter` / `"gray-lighter"` | `$gray-300` / `"gray-300"` |
| `$gray-light` / `"gray-light"` | `$gray-400` / `"gray-400"` |
| `$gray-medium-light` / `"gray-medium-light"` | `$gray-500` / `"gray-500"` |
| `$gray-medium-dark` / `"gray-medium-dark"` | `$gray-600` / `"gray-600"` |
| `$gray-dark` / `"gray-dark"` | `$gray-700` / `"gray-700"` |
| `$gray-darker` / `"gray-darker"` | `$gray-800` / `"gray-800"` |
| `$gray-darkest` / `"gray-darkest"` | `$gray-900` / `"gray-900"` |
| `"off-white"` (clé de config) | `"gray-50"` |
| `"near-black"` (clé de config) | `"gray-950"` |

Attention à l'ordre des remplacements textuels : traiter `gray-lightest`
avant `gray-lighter` avant `gray-light` (préfixes communs).

### 3.2 Modifications

1. **`src/styles/themes/_theme-variables.scss`**, `define-base-colors()` :
   définir les 11 crans `$gray-50` … `$gray-950` depuis
   `get-color("stone", <poids>)` (le poids du nom = le poids Tailwind ;
   `$gray-100: get-color("stone", 100)` est **nouveau**). Hex en
   commentaire sur chaque ligne. Puis définir les alias :

   ```scss
   // Semantic aliases for the rail endpoints (kept for the ~35 component
   // call sites; re-synced after every theme transformation)
   $off-white: $gray-50 !global;
   $near-black: $gray-950 !global;
   ```

2. **Moteurs de transformation** (`_theme-utils.scss`,
   `_anti-glare-functions.scss`) : partout où un moteur transforme
   aujourd'hui `$off-white`, `$near-black` et les 8 gris, il transforme
   désormais les **11** variables `$gray-50` … `$gray-950` (ajouter les
   lignes manquantes pour `$gray-50`, `$gray-100`, `$gray-950` sur le modèle
   des existantes), puis **re-synchronise les alias** juste avant
   `@include apply-theme-variables` :

   ```scss
   $off-white: $gray-50 !global;
   $near-black: $gray-950 !global;
   ```

   Moteurs concernés : `transform-light-to-dark`,
   `transform-light-to-high-contrast`, `transform-light-to-achromatopsia`,
   `transform-theme-for-anti-glare`. (Les moteurs daltoniens ne touchent pas
   les gris — ne rien y ajouter.)
3. **Clés de configuration** dans `src/styles/themes/_dark.scss` et
   `_achromatopsia.scss` : renommer selon la table 3.1 et **ajouter**
   `"gray-100": 0` dans les maps `adjustments` (nouveau cran ; il n'est
   consommé par aucune variable dérivée, seul `--gray-100` en dépend).
   Dans `_deuteranomaly.scss`, `_protanomaly.scss` et `_tritanomaly.scss` :
   les clés `"gray-…"` présentes dans les maps `adjustments` sont des
   **entrées mortes** (les moteurs d'anomalies ne transforment pas les
   gris) — les supprimer plutôt que les renommer.
4. **Émission CSS** (`_theme-system.scss`, `generate-theme-css-vars()`) :
   remplacer les 8 lignes `--gray-darkest` … `--gray-lightest` par les 11
   lignes `--gray-50: #{$gray-50};` … `--gray-950: #{$gray-950};`.
   **Conserver** `--off-white` et `--near-black` (émises depuis les alias —
   valeurs inchangées, ~35 consommateurs).
5. **Consommateurs composants** (5 occurrences) : remplacer
   `var(--gray-lighter)` ×2, `var(--gray-medium-light)` ×1,
   `var(--gray-light)` ×1, `var(--gray-dark)` ×1 selon la table
   (localiser par `grep -rn "var(--gray-" src/styles src/components`).

### 3.3 Vérification

Normaliser phase2.css puis comparer. ⚠️ L'ordre des expressions `sed` est
important à cause des préfixes communs : traiter `lightest`/`lighter` et
`medium-*` **avant** `light`, et `darkest`/`darker` **avant** `dark` :

```bash
sed -e 's/--gray-lightest/--gray-200/g' -e 's/--gray-lighter/--gray-300/g' \
    -e 's/--gray-medium-light/--gray-500/g' -e 's/--gray-medium-dark/--gray-600/g' \
    -e 's/--gray-light/--gray-400/g' \
    -e 's/--gray-darkest/--gray-900/g' -e 's/--gray-darker/--gray-800/g' \
    -e 's/--gray-dark/--gray-700/g' \
    /tmp/theme-migration/phase2.css > /tmp/theme-migration/phase2-normalized.css
diff /tmp/theme-migration/phase2-normalized.css /tmp/theme-migration/phase3.css
```

**Diff attendu** : uniquement des **ajouts** — les lignes `--gray-50`,
`--gray-100`, `--gray-950` dans chacun des 13 blocs de thème (`:root`, le
bloc `prefers-color-scheme`, les 12 `[data-theme]`). Aucune valeur existante
modifiée. ⚠️ Les valeurs ajoutées doivent être les valeurs **transformées
par chaque thème**, pas les valeurs light : si `--gray-50` vaut `#fafaf9`
dans le bloc `dark`, `high-contrast` ou `achromatopsia`, c'est que le moteur
correspondant ne transforme pas les nouveaux crans (erreur classique).

**Contrôle ciblé supplémentaire** (une exécution précédente a échoué
exactement ici) — vérifier dans le CSS compilé :

- bloc `[data-theme="high-contrast"]` : `--color-main-bg: #000000` et
  `--color-main-text: #ffff00`, inchangés ;
- bloc `[data-theme="achromatopsia"]` : les valeurs restent sur la famille
  `neutral` (`#fafafa`, `#0a0a0a`…), pas `stone` (`#fafaf9`, `#0c0a09`) ;
- dans chaque bloc, cohérence `--off-white` == `--gray-50` et
  `--near-black` == `--gray-950` (les alias sont resynchronisés **après**
  transformation).

**Commit** : `refactor(theme): phase 3 — numeric gray rail (11 steps, adds gray-100)`.

## Phase 4 — Kebab-case et corrections de nommage (couche 3)

Rappel : `-` ≡ `_` pour Sass, donc cette phase est **sans effet** sur le CSS
compilé, à une exception près (point 3).

1. Dans tout `src/styles/`, renommer les variables Sass `$color_…` en
   kebab-case intégral (`$color_header_blog-link_bg` →
   `$color-header-blog-link-bg`, etc.). Uniformiser aussi
   `$color_button_hover_bg` et similaires.
2. Supprimer les **doubles assignations** devenues visibles après
   uniformisation (`$color-main-bg`/`$color_main-bg`,
   `$color-main-text`/`$color_main-text` : même variable assignée deux
   fois) — n'en garder qu'une.
3. Corriger la typo `texte` : variable `$color_portfolio-tag_bg-texte` →
   `$color-portfolio-tag-text`, **et** la custom property émise
   `--color-portfolio-tag-bg-text` → `--color-portfolio-tag-text`. Mettre à
   jour ses consommateurs
   (`grep -rn "portfolio-tag-bg-text" src/`).

**Vérification** : normaliser phase3.css avec
`sed 's/--color-portfolio-tag-bg-text/--color-portfolio-tag-text/g'` →
diff vide.
**Commit** : `refactor(theme): phase 4 — kebab-case layer-3 tokens, fix tag-text typo`.

## Phase 5 — Migration vers l'API Sass moderne

But : éliminer `@import` et les fonctions dépréciées. Prérequis du futur
mode de consommation `@use … with ()` du paquet (README § 6.2).

### 5.1 Préalable anti-cycle

Déplacer `get-color()` (et la liste `$tailwind-weights` + `$midpoint` si
nécessaire aux deux fichiers) de `_theme-utils.scss` vers
`_base-palette.scss`. Raison : `_theme-variables.scss` a besoin de
`get-color()` et `_theme-utils.scss` a besoin des variables d'état de
`_theme-variables.scss` — sans ce déplacement, le graphe `@use` serait
circulaire (interdit par Sass).

### 5.2 Architecture de modules cible (acyclique)

```
_base-palette.scss      données ($colors) + get-color() — ne @use rien
themes/_theme-variables.scss   @use base-palette ; TOUT l'état mutable déclaré
                               à la racine du module + mixins define/apply
abstracts/_theme-utils.scss    @use sass:* + base-palette + theme-variables
abstracts/_anti-glare-functions.scss   idem
themes/_<theme>.scss           @use theme-utils + theme-variables (+ anti-glare)
abstracts/_theme-system.scss   @use tous les thèmes
main.scss                      @use chaque partial, DANS L'ORDRE ACTUEL des
                               @import (l'ordre d'émission CSS = la cascade)
```

Utiliser `@use "…" as *;` partout (pas de namespaces) : le but de cette
phase est la migration mécanique, pas la re-architecture des espaces de
noms — celle-ci viendra avec l'extraction du paquet.

### 5.3 Point critique : déclaration des variables d'état

Sous `@use`, une assignation `!global` ne peut plus **créer** une variable :
elle doit exister à la racine du module. Donc dans `_theme-variables.scss`,
déclarer à la racine **toutes** les variables assignées par les mixins (les
11 crans du rail, les couleurs sémantiques, les alias, et les ~70 variables
de couche 3), initialisées à leur valeur light :

```scss
// Module-level state — single source of mutable theme state.
// Mixins below re-assign these with !global during theme generation.
$gray-50: get-color("stone", 50); // #fafaf9
// … etc.
```

Les mixins `define-base-colors` / `apply-theme-variables` continuent de les
réassigner avec `!global` (comportement inchangé : reset light puis
transformations).

### 5.4 Remplacements mécaniques (table d'équivalences)

Ajouter les `@use "sass:…"` requis en tête des fichiers concernés.

| Déprécié | Remplacement |
| --- | --- |
| `a / b` (division) | `math.div(a, b)` |
| `darken($c, X%)` | `color.adjust($c, $lightness: -X%)` |
| `lighten($c, X%)` | `color.adjust($c, $lightness: X%)` |
| `red($c)` / `green($c)` / `blue($c)` | `color.channel($c, "red", $space: rgb)` etc. |
| `hue($c)` / `saturation($c)` / `lightness($c)` | `color.channel($c, "hue", $space: hsl)` etc. |
| `map-get` / `map-has-key` / `map-merge` | `map.get` / `map.has-key` / `map.merge` |
| `index(…)` / `nth(…)` / `length(…)` | `list.index` / `list.nth` / `list.length` |
| `str-index` / `str-slice` / `str-length` | `string.index` / `string.slice` / `string.length` |
| `type-of` | `meta.type-of` |
| `max()`/`min()` sur valeurs Sass ambiguës | `math.max()`/`math.min()` si le compilateur l'exige |

### 5.5 Méthode et vérification

Migrer fichier par fichier en recompilant souvent ; corriger les erreurs
« Undefined variable/mixin/function » en ajoutant le `@use` manquant.
Objectif final : compilation **sans aucun avertissement de dépréciation**
(`pnpm exec sass … 2>&1 | grep -ci deprecat` → 0).

**Diff CSS attendu** : byte-identique à phase 4. (`color.adjust` reproduit
exactement `darken` ; si un écart apparaît, c'est une erreur de migration.)
**Vérif supplémentaire** : `pnpm build` complet.
**Commit** : `refactor(theme): phase 5 — migrate to Sass module system (@use), drop deprecated APIs`.

## Phase 6 — Couche 2 : introduction des rôles

Spécification : README § 6.1 (table des 23 rôles). C'est la seule phase avec
un changement visuel autorisé (un seul, voir 6.6).

### 6.1 Renommage des primitives sémantiques

| Ancien | Nouveau | Aussi dans les clés de config (`"…"`) et les branches `@if` des moteurs |
| --- | --- | --- |
| `$primary-color` | `$accent` | `"primary-color"` → `"accent"` |
| `$secondary-color` | `$accent-ink` | `"secondary-color"` → `"accent-ink"` |
| `$tertiary-color` | `$accent-soft` | `"tertiary-color"` → `"accent-soft"` |
| `$link-color` | `$link` | `"link-color"` → `"link"` |
| `$link-color-hover` | `$link-hover` | `"link-color-hover"` → `"link-hover"` |
| `$success-color` | `$success` | `"success-color"` → `"success"` |
| `$error-color` | `$danger` | `"error-color"` → `"danger"` |

Nouveau : `$accent-strong: get-color("amber", 500);` — à transformer dans
les moteurs exactement comme `$accent` (dupliquer les blocs `@if
not(override)` correspondants avec la clé `"accent-strong"`).

Surcharges manuelles des fichiers de thèmes à renommer de même (ex.
`_dark.scss` : `$secondary-color: get-color("amber", 100)` devient
`$accent-ink: get-color("amber", 100)` ; idem `$tertiary-color` →
`$accent-soft`).

### 6.2 Définition des rôles

Dans `_theme-variables.scss`, ajouter un mixin `apply-roles()` appelé par
chaque moteur **après** transformation et **avant**
`apply-theme-variables` (même place que la resynchronisation des alias de
la phase 3) :

```scss
// Layer 2 — role tokens (the future package's public API).
// Pure aliases of rail slots / color primitives: engines transform the
// rail, then roles and layer-3 tokens re-derive from it.
@mixin apply-roles() {
  $bg-base: $gray-50 !global;
  $bg-subtle: $gray-200 !global;
  $bg-container: $gray-300 !global;
  $bg-container-high: $gray-400 !global;
  $bg-emphasis: $gray-700 !global;
  $bg-emphasis-strong: $gray-800 !global;
  $bg-inverse: $gray-950 !global;
  $fg-base: $gray-950 !global;
  $fg-muted: $gray-700 !global;
  $fg-on-emphasis: $gray-50 !global;
  $fg-on-accent: $gray-950 !global;
  $border-subtle: $gray-500 !global;
  $border-base: $gray-600 !global;
  $border-strong: $gray-700 !global;
  $focus-ring: $link !global;
  // accent, accent-strong, accent-soft, accent-ink, link, link-hover,
  // success, danger are primitives transformed directly by the engines.
}
```

(Déclarer ces variables à la racine du module, cf. phase 5.3. Les
surcharges de rôles propres à un thème — s'il y en a — se placent entre
`apply-roles` et `apply-theme-variables` dans le mixin du thème.)

### 6.3 Recâblage complet de la couche 3 (`apply-theme-variables`)

| Variable (kebab-case, phase 4) | Nouvelle définition |
| --- | --- |
| `$color-main-bg` | `$bg-base` |
| `$color-main-text` | `$fg-base` |
| `$color-pages-title` | `$fg-base` |
| `$color-header-bg` | `$accent` |
| `$color-header-text` | `$fg-on-accent` |
| `$color-header-text-role` | `$fg-muted` |
| `$color-header-blog-link-bg` | `$bg-emphasis` |
| `$color-header-blog-link-text` | `$accent` |
| `$color-lang-toggle-bg` | `$bg-base` |
| `$color-lang-toggle-border` | `$border-strong` |
| `$color-lang-toggle-bg-activated` | `$bg-emphasis` |
| `$color-lang-toggle-text-activated` | `$fg-on-emphasis` |
| `$color-lang-toggle-text-disabled` | `$fg-muted` |
| `$color-lang-toggle-disabled-hover-bg` | `$link` |
| `$color-lang-toggle-disabled-hover-text` | `$fg-on-emphasis` |
| `$color-scroll-progress-line` | `$link` |
| `$color-scroll-progress-indicator` | `$border-base` |
| `$color-scroll-progress-indicator-active` | `$link` |
| `$color-collapse-title` | `$fg-on-emphasis` |
| `$color-collapse-bg` | `$bg-container` |
| `$color-collapse-bg-title` | `$bg-emphasis` |
| `$color-collapse-border` | `$border-strong` |
| `$color-section-bg-even` | `$bg-base` |
| `$color-section-bg-odd` | `$bg-subtle` |
| `$color-section-title` | `$accent-ink` |
| `$color-hero-bg` | `$bg-base` |
| `$color-hero-title` | `$fg-base` |
| `$color-hero-text` | `$fg-base` |
| `$color-about-overlay-bg` | `$bg-inverse` |
| `$color-about-overlay-text` | `$fg-on-emphasis` |
| `$color-about-button-bg` | `$link` |
| `$color-about-button-border` | `$fg-on-emphasis` |
| `$color-about-button-text` | `$fg-on-emphasis` |
| `$color-skills-icon-bg` | `$accent-soft` |
| `$color-skills-icon-text` | `$accent-ink` |
| `$color-skills-presentation-link-hover-bg` | `$link` |
| `$color-skills-presentation-link-hover-text` | `$fg-on-emphasis` |
| `$color-section-card-bg` | `$bg-container` |
| `$color-section-even-card-bg` | `$bg-container` |
| `$color-section-odd-card-bg` | `$bg-container-high` |
| `$color-portfolio-tag-bg` | `$accent-soft` |
| `$color-portfolio-tag-text` | `$accent-ink` |
| `$color-contact-form-bg` | `$bg-container` |
| `$color-contact-modal-bg` | `$bg-subtle` |
| `$color-bottom-footer-bg` | `$bg-emphasis` |
| `$color-bottom-footer-title` | `$accent-soft` |
| `$color-bottom-footer-text` | `$fg-on-emphasis` |
| `$color-bottom-footer-link-bg` | `$bg-base` |
| `$color-bottom-footer-link-text` | `$link` |
| `$color-sticky-footer-bg` | `$bg-emphasis-strong` |
| `$color-sticky-footer-text` | `$fg-on-emphasis` |
| `$color-link` | `$link` |
| `$color-link-hover` | `$link-hover` |
| `$color-link-bg` | `$bg-base` |
| `$color-focus-outline` | `$focus-ring` |
| `$color-focus-bg` | `$focus-ring` |
| `$color-focus-text` | `$fg-on-emphasis` |
| `$color-tooltip-text` | `$fg-on-emphasis` |
| `$color-tooltip-bg` | `rgba($bg-inverse, 0.9)` |
| `$color-panel-bg` | `$bg-base` |
| `$color-panel-border` | `$border-base` |
| `$color-scrollbar-track` | `$bg-base` |
| `$color-scrollbar-thumb` | `$border-subtle` |
| `$color-button-border` | `$border-subtle` |
| `$color-button-hover-bg` | `$link-hover` *(cf. note ci-dessous)* |
| `$color-button-hover-text` | `$fg-on-emphasis` |
| `$color-button-active-text` | `$fg-base` |
| `$color-button-active-outline` | `$accent` |
| `$color-border` | `$border-subtle` |
| `$color-accent` | `$accent` |
| `$color-accent-hover` | `$accent-strong` *(seul changement visuel — cf. 6.6)* |

> **Note `--color-button-hover-bg`** : incohérence préexistante —
> `apply-theme-variables` définit `rgba($primary-color, 0.1)` mais
> l'émission CSS utilise directement `$link-color-hover` (c'est donc la
> valeur effective). Aligner la variable Sass sur la valeur **effective**
> (`$link-hover`) et émettre depuis la variable. Idem
> `--color-button-hover-text` (effectif : off-white → `$fg-on-emphasis`) et
> `--color-button-active-text` (effectif : near-black → `$fg-base`).
> Résultat : zéro changement de valeur émise, mais une seule source.

### 6.4 Émission CSS

Dans `generate-theme-css-vars()` :

1. Renommer : `--primary-color` → `--accent`, `--secondary-color` →
   `--accent-ink`, `--tertiary-color` → `--accent-soft`, `--link-color` →
   `--link`, `--link-hover-color` → `--link-hover`.
2. Ajouter l'émission des rôles restants : `--accent-strong`, `--bg-base`,
   `--bg-subtle`, `--bg-container`, `--bg-container-high`, `--bg-emphasis`,
   `--bg-emphasis-strong`, `--bg-inverse`, `--fg-base`, `--fg-muted`,
   `--fg-on-emphasis`, `--fg-on-accent`, `--border-subtle`, `--border-base`,
   `--border-strong`, `--focus-ring`, `--success`, `--danger`.
   (`--success`/`--danger` sont les valeurs *thématisées* — les
   `--constant-success-color`/`--constant-error-color` existantes ne
   changent pas.)
3. Mettre à jour les consommateurs des variables renommées :
   `var(--primary-color)` ×11, `var(--link-color)` ×6,
   `var(--link-hover-color)` ×4 (localiser par grep ; aucun consommateur de
   `--secondary-color`/`--tertiary-color`).

### 6.5 Moteurs

Aucun changement d'algorithme. Seulement : renommages de 6.1, ajout du
traitement d'`$accent-strong`, insertion de `@include apply-roles;` entre la
transformation et `apply-theme-variables` dans chaque moteur (et dans
`light-theme-variables`).

### 6.6 Vérification

Normalisation de phase5.css :

```bash
sed -e 's/--primary-color/--accent/g' -e 's/--secondary-color/--accent-ink/g' \
    -e 's/--tertiary-color/--accent-soft/g' -e 's/--link-hover-color/--link-hover/g' \
    -e 's/--link-color/--link/g' \
    /tmp/theme-migration/phase5.css > /tmp/theme-migration/phase5-normalized.css
```

(Ordre important : `--link-hover-color` avant `--link-color`.)

**Diff attendu** :
- ajouts : les nouvelles custom properties de rôles dans les 13 blocs ;
- **une seule modification de valeur** : `--color-accent-hover` passe de
  `darken(amber-300, 15%)` à `amber-500` (`#f59e0b`) et ses équivalents
  transformés dans les autres thèmes. C'est le remplacement voulu d'un
  `darken()` arbitraire par un cran du rail (README § 6.1). Toute **autre**
  différence de valeur = erreur, s'arrêter.

**Vérif supplémentaire** : `pnpm build` + contrôle visuel (voir phase 8).
**Commit** : `refactor(theme): phase 6 — introduce layer-2 role tokens`.

## Phase 7 — Source unique de la liste des thèmes (runtime)

But : éliminer la triple duplication de la liste des 12 thèmes.

1. Créer `src/config/themes.ts` :

   ```ts
   /** @format */
   // Single source of truth for the theme list.
   // NOTE: the SCSS [data-theme] blocks in src/styles/abstracts/_theme-system.scss
   // must stay in sync manually until the system is extracted as a package.
   export const THEMES = [
     "light",
     "dark",
     "anti-glare-light",
     "anti-glare-dark",
     "high-contrast",
     "deuteranomaly",
     "deuteranopia",
     "protanomaly",
     "protanopia",
     "tritanomaly",
     "tritanopia",
     "achromatopsia",
   ] as const;

   export type ThemeOption = (typeof THEMES)[number];
   ```

2. `src/hooks/useTheme.ts` : supprimer le type local et `VALID_THEMES`,
   importer `THEMES`/`ThemeOption` (adapter les `includes` avec un cast
   `readonly string[]` si nécessaire).
3. `src/app/[lang]/layout.tsx` : dans le script anti-FOUC, remplacer la
   liste en dur par une injection :
   `if (savedTheme && ${JSON.stringify(THEMES)}.includes(savedTheme))`
   (import de `THEMES` en haut du fichier — composant serveur, OK).
4. `AccessibilityMenu.tsx` : remplacer l'union inline du cast dans
   `handleColorVisionChange` par `ThemeOption`.
5. Ajouter un commentaire de synchronisation en tête de la liste des blocs
   `[data-theme]` dans `_theme-system.scss` pointant vers
   `src/config/themes.ts`.

**Diff CSS attendu** : aucun. **Vérif** : `pnpm build`, `pnpm lint`,
`pnpm test` ; vérifier dans le HTML généré (ou en dev) que le script inline
contient bien les 12 thèmes.
**Commit** : `refactor(theme): phase 7 — single source of truth for theme list`.

## Phase 8 — Finalisation

1. **Vérification globale** : `pnpm build`, `pnpm lint`, `pnpm test`.
   Contrôle visuel : `pnpm dev`, ouvrir le site, passer les **12 thèmes** via
   le menu d'accessibilité et vérifier l'absence d'anomalie flagrante
   (seul écart attendu : le hover de l'accent, phase 6.6). Si `pa11y` est
   utilisable (app lancée) : `pnpm test:a11y`.
2. **Documentation** — mettre à jour `docs/theme-system/README.md` :
   - § 3 : retirer les fichiers supprimés du tableau « code mort » (indiquer
     « purgé le <date> ») ; ajouter `src/config/themes.ts` au tableau
     runtime ;
   - § 4 : actualiser les noms (`$gray-50…950`, rôles, `apply-roles`) et le
     schéma du § 1 si besoin ;
   - § 5 : marquer les constats résolus (n° 1, 4 partiellement, 5, 6, 7, 8,
     11 partiellement) par « *(résolu — voir CHANGELOG du <date>)* » sans
     les supprimer ;
   - § 6.4 : noter que les étapes 1–2 de la trajectoire sont faites.
3. **Changelogs** : vérifier que chaque phase a son entrée dans
   `docs/theme-system/CHANGELOG.md` ; ajouter une entrée de synthèse dans le
   `CHANGELOG.md` global (à la racine).
4. **Rapport final** à l'utilisateur : phases réalisées, diffs CSS constatés
   phase par phase, écarts éventuels par rapport au plan, points laissés en
   suspens.

**Commit** : `docs(theme): phase 8 — update documentation after foundations migration`.

---

## Hors périmètre (ne PAS faire dans cette migration)

- Réécriture déclarative du moteur high-contrast sur les rôles (chantier
  suivant — nécessite une validation visuelle humaine).
- Tests automatiques de contraste WCAG sur les paires de rôles (chantier
  suivant).
- Extraction en workspace pnpm / packaging (étape 3 de la trajectoire).
- Toute retouche « d'opportunité » hors système de thèmes (composants,
  i18n, SEO…).
- Renommage de la famille `redd` de la palette (le double d évite la
  collision avec le mot-clé CSS `red` — choix conservé).
- Correction de `src/styles/pages/_contact.scss` ligne ~143 :
  `rgba(var(--color-gray-dark), 0.1)` référence une custom property qui n'a
  **jamais** existé (et la syntaxe `rgba(var(--hex), a)` serait invalide de
  toute façon) — déclaration morte antérieure à cette migration. **Ne pas
  corriger** ; la mentionner dans le rapport final (décision à prendre
  séparément).
