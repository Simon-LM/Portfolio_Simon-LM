<!-- @format -->

# Système de thèmes de couleurs accessibles

Documentation du composant de gestion des thèmes de couleurs, conçu pour
s'adapter à différents types de handicap visuel. Le composant est réparti sur
plusieurs fichiers (SCSS + React) et est encore en cours de finalisation.

**Objectif à terme** : en faire un composant réutilisable dans d'autres
projets, packagé (NPM ou autre) pour une intégration simplifiée. Une première
tentative de packaging existe sur la branche
`feature/darkmode-plus-a11y-package` (`packages/darkmode-plus-a11y/`, jamais
mergée : rollup + src, datant d'avant plusieurs refontes du système).

> Les modifications apportées à cette fonctionnalité sont tracées dans
> [CHANGELOG.md](./CHANGELOG.md) (changelog dédié, distinct du changelog
> global du projet).

---

## 1. Principe fondamental

Les **12 thèmes ne sont pas écrits à la main : ils sont dérivés
algorithmiquement du thème `light` à la compilation Sass**. Chaque thème est
le résultat d'une transformation (décalage de poids Tailwind, rotation de
teinte HSL, conversion en luminance…) appliquée aux couleurs du thème de
référence.

Le CSS compilé contient un bloc `[data-theme="…"]` par thème, chacun
définissant ~80 custom properties CSS. Au runtime, le JavaScript ne fait que
poser un attribut `data-theme` sur `<html>` : le changement de thème est un
pur re-render CSS, sans recalcul.

```
COMPILATION (Sass)                          RUNTIME (navigateur)
┌────────────────────────────┐              ┌─────────────────────────────┐
│ palette Tailwind ($colors) │              │ script anti-FOUC            │
│   ↓ get-color()            │              │  (localStorage → data-theme)│
│ 17 couleurs de base (light)│              │        ↓                    │
│   ↓ apply-theme-variables  │              │ useTheme() (React)          │
│ ~70 variables dérivées     │              │  setTheme → data-theme +    │
│   ↓ transform-light-to-X() │              │  localStorage               │
│ 12 jeux de valeurs         │              │        ↓                    │
│   ↓ generate-theme-css-vars│              │ [data-theme="X"] matche     │
│ 12 blocs [data-theme]      │──── CSS ────▶│  → var(--color-*) résolues  │
└────────────────────────────┘              └─────────────────────────────┘
```

## 2. Les 12 thèmes

| Thème              | Public visé                             | Méthode de génération                                              |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------ |
| `light`            | défaut                                  | référence : couleurs définies à la main depuis la palette Tailwind |
| `dark`             | préférence sombre                       | décalage des poids Tailwind en miroir autour du pivot 500          |
| `anti-glare-light` | photophobie, kératocône, DMLA, aniridie | thème light complet → transformation HSL anti-éblouissement        |
| `anti-glare-dark`  | idem, base sombre                       | thème dark complet → transformation HSL anti-éblouissement         |
| `high-contrast`    | fortes pertes de vision                 | réduction à une palette fixe de couleurs pures, choisie par rôle   |
| `deuteranopia`     | daltonisme rouge-vert (complet)         | couleurs spéciales fixes + déplacement de teintes HSL              |
| `protanopia`       | daltonisme rouge (complet)              | idem, teintes cibles différentes                                   |
| `tritanopia`       | daltonisme bleu-jaune (complet)         | idem, teintes cibles différentes                                   |
| `deuteranomaly`    | daltonisme rouge-vert (léger)           | amplification des différences (teinte + saturation)                |
| `protanomaly`      | daltonisme rouge (léger)                | idem                                                               |
| `tritanomaly`      | daltonisme bleu-jaune (léger)           | idem                                                               |
| `achromatopsia`    | vision monochrome                       | conversion en gris `neutral` de luminance équivalente              |

## 3. Cartographie des fichiers

### Côté SCSS (compilation)

| Fichier                                                                                       | Rôle                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/abstracts/_base-palette.scss`                                                     | Palettes Tailwind (`$colors`) : neutral, stone, slate, amber, sky, redd, emerald — 11 poids chacune (50→950)                                                                      |
| `src/styles/themes/_theme-variables.scss`                                                     | `define-base-colors()` (17 couleurs de base du light) + `apply-theme-variables()` (~70 variables dérivées par composant)                                                          |
| `src/styles/abstracts/_theme-utils.scss`                                                      | Le cœur (~1900 lignes) : fonctions d'accès (`get-color`), analyse inverse (`analyze-tailwind-color`), et tous les moteurs de transformation par thème                             |
| `src/styles/abstracts/_anti-glare-functions.scss`                                             | Transformation anti-éblouissement (HSL) + overlay `body::before` en `backdrop-filter`                                                                                             |
| `src/styles/themes/_light.scss`, `_dark.scss`, `_high-contrast.scss`, `_deuteranopia.scss`, … | Un fichier par thème : mixin `X-theme-variables()` = reset light → transformation configurée → surcharges manuelles                                                               |
| `src/styles/abstracts/_theme-system.scss`                                                     | Point d'assemblage : `generate-theme-css-vars()` (snapshot des globales Sass → custom properties) + les 12 blocs `[data-theme]`, `:root` et `@media (prefers-color-scheme: dark)` |
| `src/styles/main.scss`                                                                        | Point d'entrée : importe `base-palette`, `theme-utils`, `theme-system` avant tout le reste                                                                                        |

### Côté React (runtime)

| Fichier                                                  | Rôle                                                                                                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[lang]/layout.tsx`                              | Script inline `beforeInteractive` anti-FOUC : lit `localStorage.theme` (fallback `prefers-color-scheme`) et pose `data-theme` avant le premier paint                   |
| `src/hooks/useTheme.ts`                                  | État React du thème : init paresseuse depuis localStorage/matchMedia, `setTheme()` (attribut + localStorage), `MutationObserver` de resynchronisation                  |
| `src/components/accessibilityMenu/AccessibilityMenu.tsx` | UI de sélection : 3 axes (Mode light/dark, Confort high-contrast/anti-glare, Vision daltonisme), mémorisation du dernier thème de base (`lastBaseTheme`), reset global |
| `src/hooks/usePrefersDarkMode.ts`                        | Abonnement à `prefers-color-scheme` via `useSyncExternalStore`                                                                                                         |

### Fichiers hérités (code mort, non importés)

| Fichier                                         | État                                                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/styles/abstracts/_variables.scss`          | Ancienne définition statique des variables dérivées ; plus importé depuis `main.scss` (duplique `apply-theme-variables()`)     |
| `src/styles/abstracts/_dark-functions.scss`     | Vide (en-tête de commentaire uniquement)                                                                                       |
| `transform-for-dark()` dans `_theme-utils.scss` | Référence des maps `$dark-adjustments` / `$tailwind-origins` qui n'existent plus ; jamais appelée (planterait si elle l'était) |

## 4. La chaîne en détail

### 4.1 Couches de variables (compilation)

1. **Palette brute** — `$colors` : map Sass `famille → poids → hex`,
   accessible via `get-color("amber", 300)`.
2. **Couleurs de base** — 17 variables Sass globales, en trois niveaux
   sémantiques :
   - fondamentales : `$off-white`, `$near-black` ;
   - échelle de gris : `$gray-darkest` … `$gray-lightest` (8 niveaux) ;
   - sémantiques : `$primary-color`, `$secondary-color`, `$tertiary-color`,
     `$link-color`, `$link-color-hover`, `$success-color`, `$error-color`.

   Toutes sont tirées de la palette via `get-color()` — point crucial : les
   transformations retrouvent ensuite ces métadonnées (famille + poids) par
   recherche inverse.

3. **Variables dérivées** — `apply-theme-variables()` : ~70 variables
   (`$color_header_bg`, `$color_portfolio-tag_bg`, …) calculées à partir des
   17 couleurs de base. C'est la couche qui mappe la sémantique du design
   vers les éléments concrets de l'UI. Ré-invoquer ce mixin après mutation
   des couleurs de base recalcule toute la cascade.
4. **Custom properties CSS** — `generate-theme-css-vars()` photographie
   l'état courant des globales Sass en `--color-*`. S'y ajoutent des
   constantes inter-thèmes : `--constant-off-white`, `--constant-near-black`,
   `--constant-error-color`, `--constant-success-color`.

### 4.2 Le patron d'un fichier de thème

Chaque `_X.scss` de `src/styles/themes/` suit le même schéma en 3 temps :

```scss
@mixin x-theme-variables() {
  // 1. Reset: re-apply the full light theme (restores the reference state,
  //    since Sass globals are mutated sequentially during compilation)
  @include light-theme-variables();

  // 2. Declarative config + algorithmic transformation
  $x-config: (
    "steps": 7,             // dark: weight shift
    "enhancer": 1.2,        // anomalies: amplification factor
    "special-colors": (…),  // -opias: fixed replacement colors
    "adjustments": (…),     // per-variable deviations
    "overrides": (…),       // variables excluded from transformation
  );
  @include transform-light-to-x($x-config);

  // 3. Manual overrides (Sass globals with !global, or even nested CSS
  //    rules that compile inside the [data-theme="x"] block)
  .header { … }
}
```

Cas particulier : les thèmes anti-glare se **composent** —
`anti-glare-dark` = light → dark → transformation anti-éblouissement.

### 4.3 Les moteurs de transformation

- **Dark** (`transform-light-to-dark`) : `analyze-tailwind-color()` retrouve
  famille + poids d'une couleur par recherche inverse dans `$colors`, puis
  `get-dark-color()` décale le poids de N crans (`steps: 7` par défaut) en
  miroir autour du pivot 500 : les clairs foncent, les foncés
  s'éclaircissent. Ajustements par variable (`adjustments`) et exclusions
  (`overrides`). Fallback `darken()`/`lighten()` pour les couleurs hors
  palette.
- **High contrast** (`transform-light-to-high-contrast`) : palette fixe de
  couleurs pures (`#000`/`#ff0`/`#0ff`/…) choisie par **rôle**, déduit du nom
  de la variable (`_bg`, `_text`, `link`, `title`, `hover`…) ou, à défaut, de
  la luminance (`is-dark()`).
- **Daltonismes complets** (`transform-light-to-{deuter,prot,trit}anopia`) :
  les couleurs fonctionnelles indistinguables (succès/erreur) sont remplacées
  par des `special-colors` fixes (ex. deutéranopie : vert → `#0075ff`,
  rouge → `#ffcc00`) ; les autres passent par
  `adapt-color-for-colorblindness()` qui déplace les teintes HSL vers des
  zones perceptibles (matrices LMS présentes mais le chemin effectif est le
  déplacement HSL).
- **Daltonismes légers** (`transform-light-to-{…}anomaly`) :
  `adapt-color-for-color-anomaly()` amplifie seulement les différences —
  décalage de teinte et boost de saturation proportionnels au facteur
  `enhancer` (1.2 par défaut).
- **Achromatopsie** (`transform-light-to-achromatopsia`) : conversion des
  familles de gris vers `neutral` (`convert-to-neutral-gray`), et des
  couleurs vers un gris de luminance équivalente (`get-adjusted-gray`, qui
  requantifie la luminance sur les 11 poids Tailwind).
- **Anti-éblouissement** (`transform-theme-for-anti-glare`) : en mode light,
  plafonne la luminosité des couleurs très claires (pas de blanc pur) et
  désature légèrement ; en mode dark, relève les noirs profonds. Ajoute un
  overlay plein écran `body::before` avec `backdrop-filter`
  (contraste/luminosité) — seul thème qui injecte un pseudo-élément global.

### 4.4 L'assemblage CSS

Dans `_theme-system.scss`, pour chaque thème : invocation du mixin du thème
(mutation des globales Sass) puis `generate-theme-css-vars()` (snapshot).
Résolution en cascade :

1. `:root` → thème light (défaut) ;
2. `@media (prefers-color-scheme: dark)` + `:root:not([data-theme])` → dark
   automatique si aucun choix explicite ;
3. `[data-theme="…"]` → choix explicite de l'utilisateur (12 blocs).

### 4.5 La consommation

Les composants SCSS consomment **exclusivement** `var(--color-…)` (les
usages directs de variables Sass dans les composants sont tous commentés).
Aucun composant ne connaît les thèmes : ils ne référencent que la couche
sémantique.

### 4.6 Le runtime React

1. **Anti-FOUC** : script inline `beforeInteractive`
   (`src/app/[lang]/layout.tsx`) — la liste des thèmes valides y est
   dupliquée en dur (à garder synchronisée avec `VALID_THEMES`, cf. bug
   corrigé le 2026-07-01).
2. **`useTheme()`** : source de vérité côté React. Init paresseuse
   (localStorage → matchMedia → `"light"`), `setTheme()` écrit l'attribut et
   localStorage, un `MutationObserver` resynchronise l'état si `data-theme`
   est modifié par un autre acteur.
3. **`AccessibilityMenu`** : présente les 12 thèmes en 3 axes orthogonaux
   pour l'utilisateur (Mode, Contraste/Confort, Vision) alors que le modèle
   sous-jacent est plat (un seul `data-theme`). Une ref `lastBaseTheme`
   mémorise le dernier light/dark pour que « anti-glare » ou « retour à
   vision normale » retombe sur la bonne variante.

## 5. Points relevés (état des lieux, 2026-07-02)

Constats factuels issus de l'analyse du code, sans hiérarchie :

1. **Code mort et strates historiques** : `_variables.scss` et
   `_dark-functions.scss` ne sont plus importés ; `transform-for-dark()`
   référence des maps disparues ; de nombreuses anciennes versions vivent en
   commentaires dans les fichiers de thèmes (parfois plus longues que le code
   actif, ex. `_dark.scss` : 85 lignes de commentaires pour 70 de code).
2. **Mutation séquentielle de globales Sass** : le pipeline fonctionne parce
   que chaque bloc de thème repart d'un reset `light-theme-variables()`.
   L'ordre d'exécution est porteur de sens — fragile si on réorganise les
   imports ou les blocs.
3. **Duplication massive du patron `@if not(override) { transform }`** :
   chaque mixin `transform-light-to-X` répète ce bloc pour chaque variable
   (~8 fois × 8 thèmes). Ajouter une couleur de base impose de toucher tous
   les mixins.
4. **La liste des variables existe en plusieurs exemplaires** à garder
   synchronisés manuellement : `apply-theme-variables()`,
   `generate-theme-css-vars()`, et chaque mixin de transformation.
5. **La liste des thèmes existe en 3 exemplaires** : `VALID_THEMES`
   (useTheme), le script inline anti-FOUC, et les blocs `[data-theme]` SCSS
   (+ le type `ThemeOption` et les handlers de l'AccessibilityMenu).
6. **API Sass dépréciée** : `@import` (au lieu de `@use`/`@forward`),
   `darken()`/`lighten()`, division `/` — tout cela disparaît dans les
   versions récentes de Dart Sass. Bloquant pour un packaging pérenne.
7. **Artefacts de débogage dans `setTheme()`** : reflow forcé, classe
   `theme-switching` ajoutée/retirée, `console.log` en production.
8. **Nommage : une convention voulue mais invérifiable.** Le mélange
   underscore/tiret des variables dérivées suit une convention délibérée de
   Simon : underscore = séparateur de niveaux (façon BEM :
   `$color_header_blog-link_bg` = color / header / blog-link / bg), tiret =
   séparateur de mots à l'intérieur d'un niveau. Limite technique : **Sass
   traite `-` et `_` comme interchangeables dans les identifiants** —
   `$color_a-b_c` et `$color_a_b-c` sont la même variable pour le
   compilateur. La hiérarchie n'existe donc que pour l'œil, ne peut pas être
   vérifiée, et les « doublons » apparents (`$color-main-bg` /
   `$color_main-bg`) sont en réalité une même variable assignée deux fois.
   Décision (cf. § 6) : kebab-case partout, la hiérarchie sera portée par le
   futur registre (maps), pas par la typographie des noms. Divers : typo
   `bg-texte`, famille `redd` (double d pour éviter la collision avec le
   mot-clé CSS `red`).
9. **Poids CSS** : 12 blocs × ~80 custom properties + règles imbriquées
   dupliquées dans certains thèmes ; tout est embarqué même si l'utilisateur
   n'utilise qu'un thème.
10. **Certaines transformations ne couvrent pas toutes les variables** :
    `transform-theme-for-anti-glare` transforme une sous-liste explicite des
    variables dérivées (les autres restent héritées du thème de base) ; les
    thèmes daltoniens ne touchent que les couleurs sémantiques (gris
    intacts, ce qui est voulu, mais implicite).
11. **`--success-color`/`--error-color` ne sont pas exposées en CSS** (lignes
    commentées dans `generate-theme-css-vars()`) ; à la place, deux
    constantes `--constant-error-color`/`--constant-success-color` codées en
    dur — les adaptations daltoniennes de `$success-color`/`$error-color`
    calculées en Sass ne sont donc jamais visibles côté CSS.

## 6. Architecture cible du composant exportable (décisions actées)

État de la réflexion au 2026-07-02, issue des discussions de conception avec
Simon. Ces décisions orientent toutes les migrations à venir. Statut : le
modèle à trois couches, le périmètre du paquet et la trajectoire sont
**actés** ; le vocabulaire précis de la couche 2 est **accepté comme base**,
affinable avant son introduction.

### 6.1 Le modèle à trois couches

```
Couche 1 — RAIL        $gray-50 … $gray-950 (+ familles Tailwind)
  (primitives)         coordonnées numériques ; les moteurs de thèmes
                       font leur arithmétique de décalage ICI
        │
Couche 2 — RÔLES       ~23 tokens : bg-*, fg-*, border-*, accent*, link*,
  (API du paquet)      focus-ring, success, danger — noms parlants, stables
        │              à travers les 12 thèmes
Couche 3 — COMPOSANTS  ~70 $color_* : câblage fin propre au projet,
  (hors paquet)        jamais transformé par les moteurs
```

**Couche 1 — le rail (primitives).**

- 11 crans numériques `$gray-50` … `$gray-950`, le poids Tailwind de
  référence du thème light dans le nom. Aujourd'hui le cran 100 manque et
  les noms sont descriptifs (`gray-medium-light`…) — c'est l'objet de la
  première migration.
- Les noms sont **volontairement non parlants** : ce sont des coordonnées
  sur lesquelles les moteurs font de l'arithmétique de décalage. Personne
  (humain ou IA) n'est censé les choisir au quotidien — on choisit un rôle
  (couche 2). Les hex sont commentés au point de définition.
- Dans les thèmes non-light, `$gray-XXX` contient la valeur _décalée_ : le
  nom désigne le cran de référence light (un « slot »), pas une valeur fixe.
- La famille qui joue le rail gris est une **configuration projet** (`stone`
  ici, `slate`/`zinc` ailleurs). Contrat : toute palette fournie doit
  respecter la géométrie des 11 poids, dont dépendent les moteurs.
- Justification du choix numérique (vs les anciens adjectifs) : ordre total
  évident, correspondance directe avec les configs (`"gray-400": -2` se lit
  seul), vocabulaire pré-connu des IA et des devs (Tailwind), et surtout les
  adjectifs _s'inversent_ en dark (`gray-lightest` y contient un gris
  foncé) alors qu'un numéro de slot reste honnête.

**Couche 2 — les rôles (l'API publique du paquet).**

- Les **noms** des rôles appartiennent au paquet (ils sont le contrat sur
  lequel s'appuient moteurs, garanties de contraste et thème high-contrast) ;
  les **valeurs** (rôle → cran de rail) sont de la configuration projet.
- Vocabulaire hybride : catégories façon Primer (`bg-`/`fg-`/`border-`) +
  paires de contraste façon Material (`fg-on-emphasis`, `fg-on-accent`) là
  où le contraste est critique — chaque paire `X`/`on-X` devient un contrat
  de contraste testable mécaniquement dans les 12 thèmes.
- Test décisif d'un bon nom de rôle : **il doit rester vrai dans les 12
  thèmes** (« bg-emphasis » reste le fond appuyé, qu'il soit sombre ou
  clair).
- `primary/secondary/tertiary-color` (noms vagues) se dissolvent dans
  `accent`/`accent-ink`/`accent-soft` ; `accent-strong` remplace
  `darken($primary-color, 15%)` par un cran de rail (amber-500).
- Point d'extension : un projet peut **ajouter** des rôles, mais ne renomme
  pas le noyau (sinon il casse garanties et tests).
- Ordre de grandeur sain : 12–20 rôles (23 proposés ci-dessous, léger
  dépassement assumé). En dessous, les composants retournent piocher dans le
  rail ; au-dessus, on a recréé une couche 3 déguisée.

Base proposée (valeurs light du portfolio — vocabulaire affinable) :

| Rôle                 | Rail (light) | Couvre notamment                                    |
| -------------------- | ------------ | --------------------------------------------------- |
| `bg-base`            | gray-50      | fond principal, hero, sections paires, panneau a11y |
| `bg-subtle`          | gray-200     | sections impaires, modale contact                   |
| `bg-container`       | gray-300     | cartes, collapse, formulaire contact                |
| `bg-container-high`  | gray-400     | cartes des sections impaires                        |
| `bg-emphasis`        | gray-700     | footer, titres de collapse, lang-toggle actif       |
| `bg-emphasis-strong` | gray-800     | sticky footer                                       |
| `bg-inverse`         | gray-950     | overlay À propos, base du tooltip                   |
| `fg-base`            | gray-950     | texte courant, titres de pages                      |
| `fg-muted`           | gray-700     | texte secondaire, désactivé                         |
| `fg-on-emphasis`     | gray-50      | texte sur bg-emphasis/inverse/focus                 |
| `fg-on-accent`       | gray-950     | texte du header (sur accent)                        |
| `border-subtle`      | gray-500     | bordures boutons, scrollbar, curseur                |
| `border-base`        | gray-600     | bordure panneau, indicateurs scroll                 |
| `border-strong`      | gray-700     | bordures collapse, lang-toggle                      |
| `accent`             | amber-300    | fond header, accent du curseur                      |
| `accent-strong`      | amber-500    | hover de l'accent                                   |
| `accent-soft`        | amber-100    | tags portfolio, icônes skills                       |
| `accent-ink`         | amber-950    | titres de sections, texte des tags                  |
| `link`               | sky-900      | liens, bouton À propos                              |
| `link-hover`         | sky-800      | hover des liens                                     |
| `focus-ring`         | sky-900      | outline et fond de focus                            |
| `success`            | emerald-600  | validations                                         |
| `danger`             | redd-600     | erreurs                                             |

**Couche 3 — les tokens de composants (hors paquet).**

- Les ~70 `$color_*` : câblage fin, personnel à chaque projet, jamais
  transformé par les moteurs. Recâblés vers les rôles
  (`$color_collapse_bg: $bg-container;`).
- Livrés dans le paquet uniquement comme **exemples commentés** (recettes
  issues du portfolio).
- Les custom properties émises (`--color-*`) ne changent pas : les fichiers
  de composants SCSS existants restent intacts.

Gains systémiques attendus : les moteurs transforment ~19 tokens (rail +
accent/link/feedback) au lieu de raisonner sur 70 ; le high-contrast devient
déclaratif (`bg-* → noir`, `fg-* → jaune`…) au lieu de deviner le rôle en
cherchant `_bg`/`_text` dans les noms ; chaque paire `X`/`on-X` est testable
WCAG dans les 12 thèmes ; styler un nouveau composant = choisir un `bg`, un
`fg`, une `border` — zéro travail de thème.

### 6.2 Périmètre du paquet

| Inclus dans le paquet                                                                                  | Fourni par chaque projet                                     |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Moteurs de transformation (dark, high-contrast, daltonismes, anti-glare)                               | Choix des familles de palette + famille du rail gris         |
| **Noms** des rôles de la couche 2 (+ valeurs par défaut)                                               | **Valeurs** des rôles (affectations rôle → rail)             |
| Liste des thèmes — source unique dont dérivent type TS, `VALID_THEMES`, script anti-FOUC et blocs SCSS | Sous-ensemble de thèmes émis (à la carte, pour un CSS léger) |
| Palettes Tailwind embarquées (maps statiques)                                                          | Palettes maison éventuelles (contrat : 11 poids)             |
| Émetteur des blocs `[data-theme]`                                                                      | Couche 3 (tokens de composants)                              |
| Runtime : `useTheme`, script anti-FOUC généré, `<AccessibilityMenu>` en opt-in                         | Rôles additionnels éventuels (extension, pas renommage)      |
| Vérificateur de contrastes WCAG sur les paires de rôles                                                | —                                                            |
| Exemples de couche 3 commentés                                                                         | —                                                            |

Esquisse de structure et de consommation :

```
@lostintab/a11y-themes            (nom à décider)
├── scss/       palettes, rail, rôles, moteurs, émetteur [data-theme]
├── react/      useTheme, script anti-FOUC, <AccessibilityMenu> (opt-in)
├── testing/    vérificateur de contrastes WCAG
└── examples/   couche 3 commentée (recettes du portfolio)
```

```scss
// theme.config.scss — the project's ONLY theming decisions
@use "@lostintab/a11y-themes" with (
	$gray-family: "slate",
	$roles: (
		"accent": (
			"family": "violet",
			"weight": 300,
		),
	),
	$themes: (
		"light",
		"dark",
		"anti-glare-light",
		"high-contrast",
	)
);
```

Prérequis technique : la migration `@import` → `@use`/`@forward` — le modèle
de configuration `@use … with ()` n'existe pas avec `@import`.

### 6.3 Distribution : options et trajectoire

Options envisagées :

1. **Workspace pnpm dans ce dépôt** (`packages/`) — point de départ obligé :
   zéro infrastructure, le portfolio devient le premier consommateur et le
   banc d'essai de l'API.
2. **Publication npm** (publique ou privée) quand l'API est stable — la
   cible, cohérente avec l'objectif multi-domaines : un correctif de
   contraste dans le paquet se déploie partout par bump de version.
3. **Copie dans le projet** (modèle shadcn/ui) — écarté comme modèle
   principal (perte de la centralisation des correctifs, contraire à la
   logique de garanties d'accessibilité partagées) ; option de secours pour
   un projet très divergent.

Trajectoire décidée (faire mûrir l'API dans un vrai site avant de la
graver — extraire d'abord serait l'anti-pattern) :

1. **Migration du rail** (couche 1) dans le portfolio — plan dédié pour une
   IA exécutante.
2. **Introduction de la couche 2** in situ — validation des rôles contre un
   site réel.
3. **Extraction en workspace pnpm** — le portfolio consomme le paquet.
4. **Publication npm** quand un deuxième projet arrive.

### 6.4 Quelles décisions bloquent quelles étapes

À trancher **avant** les migrations (fait) : nommage du rail (acté),
base des rôles (acceptée, vocabulaire affinable jusqu'à l'étape 2),
convention kebab-case + hiérarchie portée par le registre (actée).

Reportable **sans risque** : le canal de distribution (workspace vs npm vs
copie). Il n'influence pas le code des couches, seulement l'endroit où il
vivra au moment de l'extraction (étape 3) — les migrations des étapes 1 et 2
sont des refactorings internes au portfolio, valides quel que soit le mode
d'export retenu.

## 7. Pistes d'amélioration envisagées

Non planifiées, par ordre de valeur estimée. Certaines sont devenues des
décisions actées — voir § 6 ; elles restent listées ici pour la traçabilité.
Chaque chantier entamé devra être tracé dans le
[CHANGELOG.md](./CHANGELOG.md) dédié.

### Assainissement (préalable au packaging)

- **Purger le code mort** : `_variables.scss`, `_dark-functions.scss`,
  `transform-for-dark()`, et les blocs commentés historiques (l'historique
  git suffit).
- **Nettoyer `setTheme()`** : retirer reflow forcé, classe `theme-switching`
  et `console.log` (ou les conditionner à un mode debug).
- **Unifier le nommage** des variables (une seule convention, supprimer les
  doublons underscore/tiret).
- **Migrer vers l'API Sass moderne** : `@use`/`@forward`, `math.div`,
  `color.adjust`/`color.scale`. Condition nécessaire pour publier un paquet
  utilisable durablement.

### Architecture

- **Registre central des variables de thème** : décrire les ~17 couleurs de
  base (et idéalement les ~70 dérivées) dans **une seule map Sass**
  (`nom → (famille, poids, rôle)`), puis générer par boucles :
  `define-base-colors`, `apply-theme-variables`, `generate-theme-css-vars`
  et les transformations. Élimine les duplications n° 3 et 4, et supprime le
  besoin de `analyze-tailwind-color()` (recherche inverse) puisque les
  métadonnées famille/poids seraient portées par le registre.
- **Source de vérité unique pour la liste des thèmes** : un JSON (ou map)
  unique dont dériveraient le type TS `ThemeOption`, `VALID_THEMES`, le
  script anti-FOUC et, via une boucle SCSS, les blocs `[data-theme]`.
- **Modéliser les 3 axes de l'UI dans l'état** : le menu présente
  Mode/Confort/Vision comme indépendants mais le modèle est un thème plat —
  d'où la ref `lastBaseTheme` et l'impossibilité de combiner (ex. dark +
  deutéranopie). À terme, un état composite `{base, contrast, vision}` avec
  résolution vers un thème effectif serait plus juste.

### Qualité perceptive et conformité

- **Vérification automatique des contrastes** : les thèmes étant générés,
  rien ne garantit aujourd'hui que chaque paire texte/fond issue d'une
  transformation respecte WCAG. Un test (unitaire ou script de build) qui
  parcourt les paires connues des 12 thèmes et vérifie les ratios serait le
  meilleur filet de sécurité du projet.
- **Exposer `--success-color`/`--error-color` thématisées** (point n° 11) ou
  documenter explicitement le choix des constantes.
- **Support de `prefers-contrast` et `forced-colors`** : respecter les
  préférences système au même titre que `prefers-color-scheme`.
- Étudier des espaces colorimétriques perceptuels (**OKLCH** via
  `color.oklch` de Sass ou CSS natif) pour des transformations dark /
  anti-glare plus fiables que les décalages de poids et le HSL.

### Packaging (objectif final)

- Extraire en **workspace pnpm** (`packages/`), en repartant de zéro plutôt
  que de la branche `feature/darkmode-plus-a11y-package` (antérieure aux
  refontes).
- API de configuration : le consommateur fournit sa palette et son registre
  de variables ; le paquet fournit les moteurs de transformation, le hook,
  le script anti-FOUC et (optionnellement) le composant de menu.
- Livrer les thèmes en **fichiers CSS séparés ou en build à la carte** pour
  ne pas imposer les 12 thèmes à tous les projets.

## 8. Historique

Voir le [CHANGELOG.md](./CHANGELOG.md) dédié à cette fonctionnalité.
