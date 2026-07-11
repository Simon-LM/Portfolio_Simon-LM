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

## Carte des documents de ce dossier

| Document | Rôle | Statut |
| --- | --- | --- |
| **README.md** (ce fichier) | Conception : fonctionnement, architecture cible, décisions actées | vivant |
| [CHANGELOG.md](./CHANGELOG.md) | Journal de toutes les modifications de la fonctionnalité | vivant |
| [TODO.md](./TODO.md) | Checklist des travaux et décisions en suspens (fils qui pendent) | vivant |
| [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) | Feuille de route vers le paquet open source (chantiers E1→E7) — c'est **la carte** qui ordonne les plans | vivant |
| [PLAN-migration-fondations.md](./PLAN-migration-fondations.md) | Plan d'exécution : fondations (rail, rôles, `@use`…) | ✅ exécuté le 2026-07-03 |
| [PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md) | Plan d'exécution : chantier E1 — système de tests de contrastes | ✅ exécuté le 2026-07-04 |
| [CONTRAST-REPORT.md](./CONTRAST-REPORT.md) | Artefact généré : matrice de contraste WCAG (39 paires × 15 thèmes) + distinguabilité CVD (5 paires ΔE) | vivant (régénéré par `pnpm contrast:report`) |
| [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) | Plan d'exécution : chantier E2 — corrections moteurs + OKLCH anti-glare | ✅ exécuté le 2026-07-04, mergé le 2026-07-05 |
| [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md) | Plan d'exécution : P1 remap de familles + tests de distinguabilité ; P2 ancres sémantiques des rôles statut ; P3 robustesse (dégradation gracieuse, garde-gamut) | P1 ✅ mergée le 2026-07-05 (`d12264f`) ; P2 ✅ et P3 ✅ mergées le 2026-07-06 (`5c8dce9`) après validation visuelle |
| [PLAN-extraction-monorepo.md](./PLAN-extraction-monorepo.md) | Plan d'exécution : chantier E3 — workspace pnpm + extraction de la face SCSS dans `packages/a11y-prefs` (nom de travail) | ✅ exécuté et mergé le 2026-07-07 (`812d5d5`) |
| [PLAN-extraction-runtime.md](./PLAN-extraction-runtime.md) | Plan d'exécution : chantier E4 — extraction du runtime React (THEMES, useTheme, usePrefersDarkMode, anti-FOUC) | ✅ exécuté et mergé le 2026-07-07 (`19df328`) |
| [PLAN-extraction-modules.md](./PLAN-extraction-modules.md) | Plan d'exécution : chantier E5 — modules opt-in (polices a11y + licences, motion, appliers, usePreference) + correction du dimensionnement des polices et mode dyslexie configurable | ✅ exécuté et mergé le 2026-07-10 (`7bae83f`), validations visuelles Simon |
| [PLAN-high-contrast-variants.md](./PLAN-high-contrast-variants.md) | Plan d'exécution : variantes du fort contraste (jaune/vert/blanc/papier) + typographie HC + boutons-preview | ✅ exécuté et mergé le 2026-07-11 (`5192ee3`), smoke Simon variante par variante |
| [PLAN-hc-mecanique-controles.md](./PLAN-hc-mecanique-controles.md) | Plan d'exécution : mécanique HC — focus promu rôle de couche 2 + contrôles d'outillage (valeur + noms) | rédigé le 2026-07-11 (décisions actées, archéologie comprise), **à exécuter** |

Principe : **un chantier = un plan = une branche = une exécution par IA**,
avec revue avant merge. Le guide donne l'ordre ; chaque plan est autonome.

---

## 1. Principe fondamental

Les **15 thèmes ne sont pas écrits à la main : ils sont dérivés
algorithmiquement du thème `light` à la compilation Sass**. Chaque thème est
le résultat d'une transformation (décalage de poids Tailwind, rotation de
teinte HSL, conversion en luminance…) appliquée aux couleurs du thème de
référence.

Le CSS compilé contient un bloc `[data-theme="…"]` par thème, chacun
définissant ~94 custom properties CSS (rail, primitives, rôles, variables
dérivées de couche 3). Au runtime, le JavaScript ne fait que poser un
attribut `data-theme` sur `<html>` : le changement de thème est un pur
re-render CSS, sans recalcul.

```
COMPILATION (Sass)                          RUNTIME (navigateur)
┌─────────────────────────────┐             ┌─────────────────────────────┐
│ palette Tailwind ($colors)  │             │ script anti-FOUC            │
│   ↓ get-color()             │             │  (localStorage → data-theme)│
│ rail (11) + primitives (8)  │             │        ↓                    │
│   ↓ transform-light-to-X()  │             │ useTheme() (React)          │
│ rail + primitives transformés│            │  setTheme → data-theme +    │
│   ↓ apply-roles()           │             │  localStorage               │
│ ~15 rôles (couche 2)        │             │        ↓                    │
│   ↓ apply-theme-variables() │             │ [data-theme="X"] matche     │
│ ~70 variables de couche 3   │             │  → var(--*) résolues        │
│   ↓ generate-theme-css-vars │             │                             │
│ 12 blocs [data-theme]       │──── CSS ───▶│                             │
└─────────────────────────────┘             └─────────────────────────────┘
```

## 2. Les 15 thèmes (12 + 3 variantes de fort contraste)

| Thème              | Public visé                             | Méthode de génération *(à jour au 2026-07-07)*                                                       |
| ------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `light`            | défaut                                  | référence : couleurs définies à la main depuis la palette Tailwind                                    |
| `dark`             | préférence sombre                       | décalage des poids Tailwind en miroir autour du pivot 500                                             |
| `anti-glare-light` | photophobie, kératocône, DMLA, aniridie | thème light complet → atténuation perceptuelle **OKLCH** (lightness plafonnée, chroma réduite)        |
| `anti-glare-dark`  | idem, base sombre                       | thème dark complet → idem (noirs relevés)                                                             |
| `high-contrast`    | fortes pertes de vision                 | réduction à une palette fixe de couleurs pures, choisie par rôle (variante **jaune sur noir**, défaut) |
| `high-contrast-green` | idem, préférence « phosphore »       | même mécanisme, carte **vert sur noir** (chantier HC, 2026-07-10)                                     |
| `high-contrast-white` | idem, contraste max sans teinte      | même mécanisme, carte **blanc sur noir** (action = jaune)                                             |
| `high-contrast-paper` | idem, polarité positive              | même mécanisme, carte **noir sur blanc** (teintes système foncées, focus/header inversés)             |
| `deuteranopia`     | daltonisme rouge-vert (complet)         | **ancres sémantiques statut** (success→violet, danger→orange, poids auto ≥ 4.5:1) ; gris/accent/liens intacts (déjà sûrs) |
| `protanopia`       | daltonisme rouge (complet)              | idem                                                                                                   |
| `tritanopia`       | daltonisme bleu-jaune (complet)         | **remap de familles Tailwind** (`amber → orange`, `sky → violet`) ; statuts intacts (rouge/vert bien perçus) |
| `deuteranomaly`    | daltonisme rouge-vert (léger)           | ancres statut douces : teintes naturelles corrigées en poids (emerald-700, redd-600)                  |
| `protanomaly`      | daltonisme rouge (léger)                | idem                                                                                                   |
| `tritanomaly`      | daltonisme bleu-jaune (léger)           | tables tritan avec mélange perceptuel OKLCH (`severity: 0.5`), ramené dans le gamut sRGB              |
| `achromatopsia`    | vision monochrome                       | conversion en gris `neutral` de luminance équivalente                                                 |

## 3. Cartographie des fichiers

### Côté SCSS (compilation)

Depuis E3 (2026-07-07), la face SCSS du moteur vit dans le **workspace
pnpm** `packages/a11y-prefs/` (nom de travail — Simon fixera le nom
définitif en E7) et le portfolio la consomme via
`@use "a11y-prefs/scss/…"` (résolution : `sassOptions.includePaths` dans
`next.config.ts`, `loadPaths` dans extract-themes, `--load-path` en CLI).

| Fichier                                                                                       | Rôle                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/a11y-prefs/scss/_base-palette.scss` **(paquet)**                                    | Palettes Tailwind (`$colors`) : neutral, stone, slate, amber, sky, redd, emerald, orange, violet — 11 poids chacune ; `get-color()` ; `is-dark()` ; `adjust-lightness-clamped()`   |
| `packages/a11y-prefs/scss/_state.scss` **(paquet)**                                           | État mutable couches 1+2 (rail 11 crans, primitives, ~15 rôles) + config consommateur (`$gray-family`, `$primitives` — `!default`, via `with()`) + `define-base-colors()`, `apply-roles()` |
| `packages/a11y-prefs/scss/_theme-utils.scss` **(paquet)**                                     | Le cœur (~1500 lignes) : `get-dark-color`, `analyze-tailwind-color`, moteurs `transform-light-to-*`, remap CVD, ancres statut, math WCAG, gamut-mapping                            |
| `packages/a11y-prefs/scss/_anti-glare-functions.scss` **(paquet)**                            | Transformation anti-éblouissement perceptuelle (OKLCH)                                                                                                                             |
| `packages/a11y-prefs/scss/_index.scss` **(paquet)**                                           | Point d'entrée public (`@forward` des quatre modules)                                                                                                                              |
| `packages/a11y-prefs/scss/modules/_a11y-fonts.scss` **(paquet, E5)**                          | Module opt-in polices d'accessibilité : `a11y-font-faces($path)` (@font-face OpenDyslexic/Andika/Atkinson) + `a11y-font-classes` ; chemin configurable `$a11y-fonts-path`          |
| `packages/a11y-prefs/scss/modules/_motion.scss` **(paquet, E5)**                              | Module opt-in réduction d'animations : `reduce-motion-class` (classe `html.reduce-motion`) + `motion-safe` (contrat hôte `prefers-reduced-motion`)                                 |
| `packages/a11y-prefs/scss/modules/_dyslexia.scss` **(paquet, E5)**                            | Module opt-in mode dyslexie : mixin `dyslexia-typography` 3 niveaux configurable (titre/sous-titre/corps), `font-size-adjust`, espacements BDA — calibré visuellement (2026-07-09) |
| `packages/a11y-prefs/fonts/` **(paquet, E5)**                                                 | Polices OFL embarquées (22 fichiers, 5 familles) + `LICENSES/` (audit, textes à figer en E7)                                                                                       |
| `src/styles/themes/_theme-variables.scss`                                                     | **Couche 3 du portfolio** : ~70 tokens de composants + `apply-theme-variables()` (dérivés des rôles du paquet)                                                                     |
| `src/styles/themes/_light.scss`, `_dark.scss`, `_high-contrast.scss`, `_deuteranopia.scss`, … | Un fichier par thème (= **config du projet**) : reset light → transformation du paquet → `apply-theme-variables` → surcharges manuelles                                            |
| `src/styles/abstracts/_theme-system.scss`                                                     | Point d'assemblage : `generate-theme-css-vars()` (snapshot des globales Sass → custom properties) + les 12 blocs `[data-theme]`, `:root` et `@media (prefers-color-scheme: dark)`  |
| `src/styles/main.scss`                                                                        | Point d'entrée : porte la **configuration `with()`** du paquet (premier chargement du module state), puis `@use` chaque partial                                                    |

### Côté React (runtime)

Depuis E4 (2026-07-07), le runtime vit dans `packages/a11y-prefs/react/`
(consommé en source TS : `transpilePackages` Next, `moduleNameMapper`
Jest, React en peerDependency) ; les fichiers historiques du portfolio
sont des **shims de ré-export** (les imports `@/config/themes`,
`@/hooks/…` n'ont pas bougé).

| Fichier | Rôle |
| --- | --- |
| `packages/a11y-prefs/react/themes.ts` **(paquet)** | Source unique de la liste des 15 thèmes (`THEMES` + type `ThemeOption`) — module de données pur, sûr côté Server Components |
| `packages/a11y-prefs/react/useTheme.ts` **(paquet)** | État React du thème (`"use client"`) : init paresseuse localStorage/matchMedia, `setTheme()`, `MutationObserver` ; paramètre `themes` optionnel (défaut : les 12) |
| `packages/a11y-prefs/react/usePrefersDarkMode.ts` **(paquet)** | Abonnement à `prefers-color-scheme` via `useSyncExternalStore` |
| `packages/a11y-prefs/react/themeInitScript.ts` **(paquet)** | Génère la chaîne du script anti-FOUC (byte-identique au littéral historique) |
| `packages/a11y-prefs/react/appliers.ts` **(paquet, E5)** | Appliers DOM SSR-safe : `applyFontSizeFactor`, `applyAccessibilityFont(font, classMap)`, `applyReduceMotion` — les stores du portfolio leur délèguent |
| `packages/a11y-prefs/react/usePreference.ts` **(paquet, E5)** | Hook générique `usePreference<T>(key, {defaultValue, serialize?, deserialize?, apply})` : localStorage + application DOM (patron § 6.5) — pas encore consommé par le portfolio |
| `src/config/themes.ts`, `src/hooks/useTheme.ts`, `src/hooks/usePrefersDarkMode.ts` | Shims de ré-export du paquet (compatibilité des chemins d'import) |
| `src/app/[lang]/layout.tsx` | Injecte `themeInitScript(THEMES)` en `beforeInteractive` : pose `data-theme` avant le premier paint |
| `src/components/accessibilityMenu/AccessibilityMenu.tsx` | UI de sélection : 3 axes (Mode, Confort, Vision), mémorisation du dernier thème de base (`lastBaseTheme`), reset global — scaffoldée en E6, reste projet |

### Fichiers hérités (code mort, non importés)

*(résolu — voir [CHANGELOG](./CHANGELOG.md) du 2026-07-03, phase 1)*

| Fichier                                         | État                                                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/styles/abstracts/_variables.scss`          | **Purgé le 2026-07-03.** Ancienne définition statique des variables dérivées ; plus importé depuis `main.scss`.                |
| `src/styles/abstracts/_dark-functions.scss`     | **Purgé le 2026-07-03.** Vide (en-tête de commentaire uniquement).                                                             |
| `transform-for-dark()` dans `_theme-utils.scss` | **Purgé le 2026-07-03**, avec plusieurs autres fonctions/mixins jamais appelés (voir CHANGELOG pour la liste complète).        |

## 4. La chaîne en détail

### 4.1 Couches de variables (compilation)

État depuis la migration des fondations (voir § 6 pour l'architecture cible
et le [CHANGELOG](./CHANGELOG.md) du 2026-07-03 pour le détail des phases) :
le modèle à trois couches décrit en § 6.1 est maintenant en place.

1. **Palette brute** — `$colors` : map Sass `famille → poids → hex`,
   accessible via `get-color("amber", 300)` (`_base-palette.scss`).
2. **Couche 1 — le rail** — 11 crans numériques `$gray-50` … `$gray-950`
   (famille `stone`), plus les alias `$off-white`/`$near-black` (= `$gray-50`
   / `$gray-950`, resynchronisés après chaque transformation) ; primitives
   sémantiques `$accent`, `$accent-strong`, `$accent-ink`, `$accent-soft`,
   `$link`, `$link-hover`, `$success`, `$danger`. Toutes tirées de la palette
   via `get-color()` — les transformations retrouvent ensuite ces métadonnées
   (famille + poids) par recherche inverse (`analyze-tailwind-color`).
3. **Couche 2 — les rôles** — `apply-roles()` dérive ~15 tokens
   (`$bg-base`, `$bg-subtle`, `$fg-base`, `$fg-on-emphasis`, `$border-base`,
   `$focus-ring`, …) du rail et des primitives. Appelé par chaque moteur
   entre la transformation et `apply-theme-variables()`.
4. **Couche 3 — variables dérivées** — `apply-theme-variables()` : ~70
   variables (`$color-header-bg`, `$color-portfolio-tag-bg`, …) calculées à
   partir des rôles (pas directement du rail). C'est la couche qui mappe la
   sémantique du design vers les éléments concrets de l'UI, propre au
   portfolio (hors périmètre du futur paquet — voir § 6.1). Ré-invoquer ce
   mixin après mutation des couches 1/2 recalcule toute la cascade.
5. **Custom properties CSS** — `generate-theme-css-vars()` photographie
   l'état courant des globales Sass en `--*` (rail, primitives, rôles,
   variables dérivées). S'y ajoutent des constantes inter-thèmes :
   `--constant-off-white`, `--constant-near-black`, `--constant-error-color`,
   `--constant-success-color`.

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
  // ^ internally: transform rail + primitives → apply-roles() → apply-theme-variables()

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
- **Daltonismes (les 6 thèmes non-achromatopsie)**
  (`transform-light-to-{deuter,prot,trit}{anopia,anomaly}`) — deux
  mécanismes, selon la classe de rôle :
  - **Rôles identitaires** (`accent`, `link`…) via `remap-for-cvd()`
    (chantier E2/refonte daltonienne partie 1, 2026-07-04) : cascade —
    (1) `special-colors` explicite (prioritaire, vide par défaut),
    (2) famille Tailwind reconnue **et** présente dans la table
    `family-remap` du thème → substitution à poids décalé (tritanopie :
    `amber → orange (0)`, `sky → violet (0)` ; les tables rouge-vertes ne
    remappent aucun rôle identitaire, `accent`/`link` étant déjà sûrs),
    (3) famille reconnue mais absente → inchangée, (4) hors palette → repli
    par rotation de teinte OKLCH. Anomalies : mélange perceptuel OKLCH
    (`severity: 0.5`) entre original et remappé (n'agit plus que sur les
    tritan, seuls thèmes gardant un `family-remap` non vide), **ramené dans
    le gamut sRGB** par réduction de chroma (`gamut-map-srgb`, partie 3) —
    un mélange OKLCH entre teintes éloignées peut sortir du gamut, que le
    navigateur clamperait sinon silencieusement.
  - **Rôles statut** (`success`, `danger`) via `resolve-status-color()`
    (partie 2, 2026-07-06) : ancre sémantique par type de CVD, poids
    auto-résolu pour garantir 4.5:1 sur le fond — déficience rouge-verte
    -opie : `success → violet-600`, `danger → orange-700` ; -omalie
    (légère) : teintes naturelles corrigées en poids, `success → emerald-700`,
    `danger → redd-600` ; tritanopie : inchangés (rouge/vert bien perçus).
    Priorité `special-colors` conservée. Voir § 6.1 (« rôles statut, une
    classe à part »).
  L'ancien mécanisme à fenêtres de teinte HSL
  (`adapt-color-for-colorblindness`/`adapt-color-for-color-anomaly`) est
  purgé (plus aucun appelant, confirmé par grep). Garanties vérifiées
  mécaniquement par le système de tests de contrastes (§ 6, chantier E1) :
  ratio WCAG (aussi calculé côté Sass par `wcag-contrast-ratio()`, aligné
  culori) **et** distinguabilité ΔE CIEDE2000 sous simulation CVD
  (`src/accessibility/contrast/cvd-simulation.ts`, matrices de Machado et
  al. 2009), **et** appartenance au gamut sRGB (partie 3, `gamut.test.ts` :
  aucune couleur émise ne sort du gamut, sur les 15 thèmes). Robustesse
  (partie 3) : le résolveur de statut n'échoue jamais en dur — s'il ne peut
  atteindre la cible de contraste, il renvoie le meilleur effort et `@warn`.
- **Achromatopsie** (`transform-light-to-achromatopsia`) : conversion des
  familles de gris vers `neutral` (`convert-to-neutral-gray`), et des
  couleurs vers un gris de luminance équivalente (`get-adjusted-gray`, qui
  requantifie la luminance sur les 11 poids Tailwind). Mécanisme séparé,
  volontairement non touché par la refonte daltonienne ci-dessus (elle ne
  couvre que les 6 thèmes dichromates/anomaux).
- **Anti-éblouissement** (`transform-theme-for-anti-glare`) — réécrit
  chantier E2/revue des moteurs, 2026-07-04 : dérive désormais les ~70
  tokens de couche 3 en une seule passe depuis les rôles anti-éblouis
  (couverture totale, au lieu d'une liste explicite d'une vingtaine de
  tokens) ; la transformation perceptuelle (`transform-for-anti-glare`) 
  travaille en OKLCH (lightness/chroma) plutôt qu'en HSL, pour une
  atténuation perceptuellement uniforme quelle que soit la teinte. En mode
  light, plafonne la luminosité des couleurs très claires (pas de blanc
  pur) et réduit légèrement la chroma ; en mode dark, relève les noirs
  profonds. L'overlay plein écran `body::before` (`backdrop-filter`) a été
  supprimé (coût GPU permanent pour un effet mesuré comme négligeable).

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
   (`src/app/[lang]/layout.tsx`) — injecte désormais `THEMES` depuis
   `src/config/themes.ts` (source unique, voir § 3 ; résolu en phase 7 de la
   migration des fondations, cf. bug de désynchronisation corrigé le
   2026-07-01 avant que la source unique n'existe).
2. **`useTheme()`** : source de vérité côté React. Init paresseuse
   (localStorage → matchMedia → `"light"`), `setTheme()` écrit l'attribut et
   localStorage, un `MutationObserver` resynchronise l'état si `data-theme`
   est modifié par un autre acteur.
3. **`AccessibilityMenu`** : présente les 15 thèmes en 3 axes orthogonaux (les variantes HC via un sélecteur dédié)
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
   *(résolu — voir CHANGELOG du 2026-07-03, phase 1)*
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
   *(résolu partiellement — voir CHANGELOG du 2026-07-03, phase 6 : les
   moteurs ne transforment plus que le rail + ~19 primitives/rôles au lieu
   des ~70 variables de couche 3 directement ; la couche 3 elle-même reste
   listée séparément dans `apply-theme-variables()` et
   `generate-theme-css-vars()` — un registre central unifiant les trois
   reste une piste future, § 7)*
5. **La liste des thèmes existe en 3 exemplaires** : `VALID_THEMES`
   (useTheme), le script inline anti-FOUC, et les blocs `[data-theme]` SCSS
   (+ le type `ThemeOption` et les handlers de l'AccessibilityMenu).
   *(résolu — voir CHANGELOG du 2026-07-03, phase 7 : source unique
   `src/config/themes.ts` pour le runtime ; les blocs SCSS restent à
   synchroniser manuellement jusqu'à l'extraction en paquet)*
6. **API Sass dépréciée** : `@import` (au lieu de `@use`/`@forward`),
   `darken()`/`lighten()`, division `/` — tout cela disparaît dans les
   versions récentes de Dart Sass. Bloquant pour un packaging pérenne.
   *(résolu — voir CHANGELOG du 2026-07-03, phase 5 : migration complète,
   compilation sans avertissement de dépréciation)*
7. **Artefacts de débogage dans `setTheme()`** : reflow forcé, classe
   `theme-switching` ajoutée/retirée, `console.log` en production.
   *(résolu — voir CHANGELOG du 2026-07-03, phase 2)*
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
   *(résolu partiellement — voir CHANGELOG du 2026-07-03, phase 4 :
   kebab-case généralisé, doublons dédupliqués, typo `bg-texte` corrigée ;
   le registre central portant la hiérarchie reste une piste future, § 7)*
9. **Poids CSS** : 12 blocs × ~80 custom properties + règles imbriquées
   dupliquées dans certains thèmes ; tout est embarqué même si l'utilisateur
   n'utilise qu'un thème.
10. **Certaines transformations ne couvrent pas toutes les variables** :
    `transform-theme-for-anti-glare` transforme une sous-liste explicite des
    variables dérivées (les autres restent héritées du thème de base) ; les
    thèmes daltoniens ne touchent que les couleurs sémantiques (gris
    intacts, ce qui est voulu, mais implicite).
    *(résolu pour l'anti-éblouissement — voir CHANGELOG du 2026-07-04,
    chantier E2/revue des moteurs phase 2 : `transform-theme-for-anti-glare`
    rederive désormais les ~70 tokens de couche 3 en une seule passe depuis
    les rôles anti-éblouis (`apply-theme-variables`), couverture totale au
    lieu d'une liste explicite de ~22 tokens. Le point daltonien reste
    voulu tel quel — seules les 8 primitives sémantiques (`accent`,
    `link`, `success`, `danger`…) sont remappées, les gris ne le sont
    jamais — mais n'est plus *implicite* : voir CHANGELOG du 2026-07-04,
    chantier E2/refonte daltonienne, qui documente et teste
    mécaniquement ce périmètre (`remap-for-cvd` ne s'applique qu'aux
    primitives passées explicitement par les 6 mixins de thème))*
11. **`--success-color`/`--error-color` ne sont pas exposées en CSS** (lignes
    commentées dans `generate-theme-css-vars()`) ; à la place, deux
    constantes `--constant-error-color`/`--constant-success-color` codées en
    dur — les adaptations daltoniennes de `$success-color`/`$error-color`
    calculées en Sass ne sont donc jamais visibles côté CSS.
    *(résolu partiellement — voir CHANGELOG du 2026-07-03, phase 6 :
    `--success`/`--danger` (renommés, § 6.1) sont désormais émises avec les
    valeurs thématisées ; les constantes `--constant-success-color`/
    `--constant-error-color` sont conservées telles quelles, à dessein)*

## 6. Architecture cible du composant exportable (décisions actées)

État de la réflexion au 2026-07-02, issue des discussions de conception avec
Simon. Ces décisions orientent toutes les migrations à venir. Statut : le
modèle à trois couches, le périmètre du paquet et la trajectoire sont
**actés** ; le vocabulaire précis de la couche 2 est **accepté comme base**,
affinable avant son introduction. Complété le **2026-07-03** par deux
décisions actées : élargissement du périmètre au **système de préférences
d'accessibilité complet** (§ 6.5) et **distribution hybride** npm +
scaffolding (§ 6.3).

### 6.1 Le modèle à trois couches

```
Couche 1 — RAIL        $gray-50 … $gray-950 (+ familles Tailwind)
  (primitives)         coordonnées numériques ; les moteurs de thèmes
                       font leur arithmétique de décalage ICI
        │
Couche 2 — RÔLES       ~23 tokens : bg-*, fg-*, border-*, accent*, link*,
  (API du paquet)      focus-ring, success, danger — noms parlants, stables
        │              à travers les 12 thèmes
Couche 3 — COMPOSANTS  ~70 $color-* : câblage fin propre au projet,
  (hors paquet)        jamais transformé par les moteurs
```

**Couche 1 — le rail (primitives).** *(migré le 2026-07-03, voir
[CHANGELOG](./CHANGELOG.md) phase 3)*

- 11 crans numériques `$gray-50` … `$gray-950`, le poids Tailwind de
  référence du thème light dans le nom.
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

**Couche 2 — les rôles (l'API publique du paquet).** *(migré le 2026-07-03,
voir [CHANGELOG](./CHANGELOG.md) phase 6)*

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
| `success`            | emerald-700  | validations (toast succès du contact) — 700 depuis le 2026-07-07, ≥ 4.5:1 |
| `danger`             | redd-600     | erreurs                                             |

**Les rôles statut, une classe à part (acté et implémenté le
2026-07-06).** `success` et `danger` — et, réservés pour l'extension
future de l'API, `warning` et `info` — se distinguent des rôles
identitaires (`accent`, `link`…) : leur sémantique est une convention
quasi universelle (vert = OK, rouge = problème), identique d'un projet à
l'autre. Le paquet embarque donc pour eux des **ancres sémantiques par
type de daltonisme** (déficience rouge-verte : `success` → ancre bleue,
`danger` → ancre orange — la paire sûre canonique ; tritanopie :
rouge/vert conservés), résolues dans la palette du projet avec un
**poids auto-calculé** pour satisfaire le ratio WCAG sur le fond du
thème. Les rôles identitaires, eux, restent adaptés par les tables de
remap configurables par projet. Implémenté dans le résolveur Sass
`resolve-status-color` (voir § 4.3) ; les -opies vont à l'ancre pleine
(ex. `violet-600`, `orange-700` dans ce portfolio), les -omalies gardent
la teinte naturelle corrigée en poids (`emerald-700`, `redd-600`).
Mécanisme détaillé et arbitrages restants :
[GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) § E2.

**Politique de palette par classe de déficience (partie 3).** La sévérité
justifie l'intensité de l'intervention : une **-omalie** (déficience
légère) reste **strictement dans la palette** (couleur Tailwind pure) ; une
**-opie** (déficience complète) peut, si besoin, employer une couleur
**in-gamut hors palette** — jamais hors gamut sRGB, qui serait du CSS
invalide clampé par le navigateur (garanti par `gamut.test.ts`). En
pratique, le moteur ne pilote sa dégradation que par le **contraste**
(calculable en Sass) ; le vrai motif pour sortir de la palette — une
**collision de distinguabilité** (teinte trop proche d'un autre rôle sous
simulation) — n'étant vérifiable qu'après compilation (suite TypeScript),
son recours sanctionné est une **`special-colors`** explicite : in-gamut,
tolérée hors palette en -opie, à garder dans la palette en -omalie.

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
| Runtime : cœur des préférences (persistance, application DOM, anti-FOUC), `useTheme`                  | Rôles additionnels éventuels (extension, pas renommage)      |
| UI **scaffoldée** : déclencheur (icône) + carte d'accessibilité complète, copiées dans le projet (§ 6.3) | Personnalisation libre de l'UI copiée (libellés, styles, modules) |
| Polices d'accessibilité **embarquées** (module opt-in — licences à vérifier avant publication, § 6.5) | Polices de base du site (inchangées)                         |
| Vérificateur de contrastes WCAG sur les paires de rôles                                                | Respect des contrats hôte (§ 6.5 : tailles en `rem`, animations soumises à `reduce-motion`) |
| Exemples de couche 3 commentés                                                                         | —                                                            |

Esquisse de structure et de consommation :

```
@lostintab/a11y-prefs             (nom à décider)
├── scss/       palettes, rail, rôles, moteurs, émetteur [data-theme]
├── react/      cœur des préférences, useTheme, script anti-FOUC
├── fonts/      polices d'accessibilité embarquées (@font-face, opt-in)
├── cli/        init (scaffolding de l'UI + config), init --diff
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

### 6.3 Distribution : modèle hybride (acté le 2026-07-03)

**Décision** : distribution **hybride**, découpée selon la nature de chaque
partie — c'est l'anatomie de shadcn/ui lui-même (couche stylée copiée chez le
dev, primitives critiques via npm/Radix) :

| Partie | Nature | Canal |
| --- | --- | --- |
| Les **moteurs** (transformations, cœur des préférences, anti-FOUC, garanties et tests de contraste) | doit rester correct, correctifs centralisés | **npm** — un fix d'accessibilité se déploie partout par bump de version |
| L'**UI** (déclencheur + carte) + config + exemples de couche 3 | chaque projet la restyle, la traduit, la réorganise | **copiée dans le projet** via une CLI de scaffolding — le dev la possède |

Expérience dev cible :

```bash
pnpm add @lostintab/a11y-prefs        # moteurs (mis à jour par versions)
pnpm dlx @lostintab/a11y-prefs init   # copie l'UI + theme.config.scss +
                                      # exemples dans le projet
pnpm dlx @lostintab/a11y-prefs init --diff   # voir les évolutions de l'UI
                                             # de référence, à reporter ou non
```

Points ayant motivé la décision (discussion du 2026-07-03) : un paquet npm
livre de toute façon le SCSS/TS **en source lisible** (pas une boîte noire) ;
`pnpm patch` reste l'échappatoire pour modifier proprement la partie moteur ;
la copie intégrale (shadcn pur) a été écartée comme modèle *unique* car elle
prive les sites des correctifs d'accessibilité centralisés.

Historique des options étudiées avant décision : (1) workspace pnpm seul,
(2) npm seul, (3) copie shadcn seule. Le workspace pnpm reste le **point de
départ** de l'extraction (étape 3 de la trajectoire) ; le modèle hybride
décrit la forme **publiée** (étape 4).

Trajectoire décidée (faire mûrir l'API dans un vrai site avant de la
graver — extraire d'abord serait l'anti-pattern) :

1. ✅ **Migration du rail** (couche 1) dans le portfolio — **faite le
   2026-07-03**, voir [PLAN-migration-fondations.md](./PLAN-migration-fondations.md)
   (phase 3) et le [CHANGELOG](./CHANGELOG.md).
2. ✅ **Introduction de la couche 2** in situ — **faite le 2026-07-03**
   (même plan, phase 6) ; validation des rôles contre le site réel encore à
   faire dans la durée (usage quotidien), mais le câblage complet des ~70
   tokens de couche 3 vers les rôles est en place.
3. **Extraction en workspace pnpm** — le portfolio consomme le paquet. *(pas
   commencé — chantier suivant, cf. mémoire de suivi du projet)*
4. **Publication npm** quand un deuxième projet arrive.

### 6.4 Quelles décisions bloquent quelles étapes

À trancher **avant** les migrations (fait) : nommage du rail (acté),
base des rôles (acceptée, vocabulaire affinable jusqu'à l'étape 2),
convention kebab-case + hiérarchie portée par le registre (actée).

Étapes 1 et 2 de la trajectoire (§ 6.3) exécutées le 2026-07-03. Avant
l'étape 3 (extraction), deux chantiers explicitement hors périmètre de
cette migration restaient à faire in situ (cf. « Hors périmètre » du
plan) : réécriture déclarative du moteur high-contrast sur les rôles
(reste à faire, chantier E2), et tests automatiques de contraste WCAG sur
les paires de rôles — **fait le 2026-07-04** (chantier E1, voir
[PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md) et
[CONTRAST-REPORT.md](./CONTRAST-REPORT.md) ; 7 paires waivées comme
échecs préexistants, en attente d'arbitrage — aucune couleur retouchée,
chantier purement additif).

Le canal de distribution, initialement identifié comme reportable, a été
**acté le 2026-07-03** (modèle hybride, § 6.3). Restent reportables sans
risque : le nom définitif du paquet, et le choix registre npm public vs
privé.

### 6.5 Élargissement : du système de thèmes au système de préférences d'accessibilité (acté le 2026-07-03)

Le composant exportable ne couvre pas seulement les thèmes de couleurs :
c'est l'**ensemble du menu d'accessibilité actuel** (retour à la vision
d'origine de `darkmode-plus-a11y`). Le livrable visible : le site hôte
installe le **déclencheur** (l'icône d'accessibilité) et obtient au clic une
**carte d'accessibilité complète et fonctionnelle**, personnalisable puisque
scaffoldée dans son projet (§ 6.3).

Toutes les fonctionnalités partagent le même patron, qui constitue le cœur
du paquet :

```
préférence utilisateur → persistance (localStorage) → application au DOM
(attribut, classe ou variable CSS sur <html>) → le CSS du site y répond
```

Modules (chacun **opt-in** — un projet peut ne prendre que les thèmes) :

| Module | Mécanisme DOM | Difficulté | Point d'attention |
| --- | --- | --- | --- |
| Thèmes de couleurs | `data-theme` | fait (fondations 2026-07-03) | — |
| Taille de texte (zoom) | `--font-size-factor` | **fait (E5, 2026-07-09)** — applier `applyFontSizeFactor` | **contrat hôte** : tailles en `rem`/`em` sensibles au facteur |
| Réduction des animations | classe `reduce-motion` | **fait (E5)** — module `motion` (mixins `reduce-motion-class`, `motion-safe`) + applier | **contrat hôte** : les animations doivent s'y soumettre (mixin fourni) |
| Polices d'accessibilité | classes de police | **fait (E5)** — module `a11y-fonts` (@font-face + classes) + applier `applyAccessibilityFont` | licences auditées (2026-07-08) : **embarquées** = OpenDyslexic, Andika, Atkinson Next, Lexend Giga/Deca (OFL) ; **exclues** = Sylexiad (EULA propriétaire — recommandée aux consommateurs via sylexiad.com), Tiresias (GPLv3, non utilisée), Raleway Dots (non utilisée). N'affecte pas les polices de base du site hôte |
| Mode dyslexie optimisé | classe `dyslexia-optimized` | **fait (E5 phase 4)** — mixin `dyslexia-typography` 3 niveaux (titre/sous-titre/corps), `font-size-adjust: 0.56`, espacements BDA ; corps défaut = Andika, portfolio = Sylexiad | valeurs calibrées visuellement par Simon (2026-07-09, preview versionnée dans `docs/theme-system/previews/`) |
| UI (déclencheur + carte) | — | moyen | scaffoldée, pas dans npm (§ 6.3) |

Conséquence sur le nom et le concept : « système de thèmes » devient un
module — le paquet est un **système de préférences d'accessibilité**
(`a11y-prefs` comme nom de travail).

### 6.6 Mécanique du fort contraste : histoire et architecture cible (acté le 2026-07-11)

Rappel du vocabulaire des **trois couches** (celui de Simon) : couche 1 =
palettes Tailwind ; couche 2 = variables de **rôle** (~19, l'API du
paquet : `$link`, `$accent`, `$gray-50`…) ; couche 3 = noms
d'**assignation** (la config du consommateur : `$color-header-bg`…).

**Le design d'origine de Simon** capturait la sémantique **par les noms de
couche 3** : `transform-for-high-contrast($color, $element-type)` lisait
les mots des noms (`str-index`) et attribuait la couleur HC :

| Mot dans le nom | Couleur HC |
| --- | --- |
| `_bg`, `background` | fond (noir) |
| `_text`, `text` | texte (jaune) |
| `link` | cyan |
| `heading`, `title` | vert-jaune |
| `hover`, `focus` | blanc |
| `success` | vert |
| _aucun_ | selon la clarté (foncé → texte, clair → fond) |

Ce mécanisme garantissait notamment le **focus par son nom**. Il a été
**supplanté sans décision** pendant le chantier d'extraction (commit
`3195de4`, Claude) par le mécanisme actuel, puis supprimé en tant que code
mort au nettoyage du 2026-07-03 (`f16842d`). Archéologie reconstituée le
2026-07-11 — cette section existe pour que l'information ne se reperde
plus.

**Le mécanisme actuel** : les ~19 rôles de couche 2 reçoivent leur couleur
HC par assignation **explicite** dans le moteur (`$link` → slot `"link"`…) ;
les non-assignés (gris intermédiaires, `$accent*`) passent par la clarté
(`is-dark()`) ; la couche 3 hérite **par branchement** (`$color-main-text:
$fg-base`) — le nom du token n'a plus aucun rôle. **Trou identifié** : une
assignation de couche 3 NON branchée (valeur brute) échappe silencieusement
au mode HC — risque principal pour un paquet implémenté surtout par des IA.

**L'architecture cible** (décisions du 2026-07-11, plan
`PLAN-hc-mecanique-controles.md`) :

1. **Décision des couleurs = branchement couche 2 seul.** La capture par
   noms ne revient pas comme mécanisme : Sass ne sait pas lire les noms —
   l'ancienne fonction exigeait de lui passer chaque nom à la main, soit
   la même discipline que le branchement (le filet a les mêmes trous que
   le sol).
2. **Le focus devient un rôle de couche 2** (restaure la garantie du
   design d'origine, pour tous les consommateurs).
3. **Deux contrôles en lecture seule** dans l'outillage (warnings au
   build/test, ne modifient jamais une couleur) : **par valeur** (en HC,
   toute couleur émise ∈ palette du thème → attrape les tokens non
   branchés) et **par noms** (la sémantique d'origine recyclée en
   inspecteur : nom `*_text` qui émet la couleur de fond → warning →
   attrape les branchements de travers, angle mort du contrôle par
   valeur). Complémentaires, pas concurrents.
4. **Notice d'implémentation orientée IA** (livrable E6/E7, pattern
   AGENTS.md/llms.txt du paquet) : le contrat « couche 3 = toujours
   dérivée d'un rôle de couche 2, jamais une valeur brute » écrit pour
   les implémenteurs.
5. **Garé, à réfléchir** : le sort des 4 rôles `$accent*` en HC
   (aujourd'hui écrasés par clarté ; le header de Simon était une
   surcharge manuelle — l'accent n'a jamais fait partie de son design HC).

## 7. Pistes d'amélioration envisagées

Non planifiées, par ordre de valeur estimée. Certaines sont devenues des
décisions actées — voir § 6 ; elles restent listées ici pour la traçabilité.
Chaque chantier entamé devra être tracé dans le
[CHANGELOG.md](./CHANGELOG.md) dédié.

### Assainissement (préalable au packaging)

*(faite — voir [PLAN-migration-fondations.md](./PLAN-migration-fondations.md)
et le [CHANGELOG](./CHANGELOG.md) du 2026-07-03, phases 1 à 7)*

- **Purger le code mort** : `_variables.scss`, `_dark-functions.scss`,
  `transform-for-dark()`, et les blocs commentés historiques (l'historique
  git suffit). *(fait, phase 1)*
- **Nettoyer `setTheme()`** : retirer reflow forcé, classe `theme-switching`
  et `console.log` (ou les conditionner à un mode debug). *(fait, phase 2)*
- **Unifier le nommage** des variables (une seule convention, supprimer les
  doublons underscore/tiret). *(fait, phase 4)*
- **Migrer vers l'API Sass moderne** : `@use`/`@forward`, `math.div`,
  `color.adjust`/`color.scale`. Condition nécessaire pour publier un paquet
  utilisable durablement. *(fait, phase 5)*

### Architecture

- **Registre central des variables de thème** : décrire les ~17 couleurs de
  base (et idéalement les ~70 dérivées) dans **une seule map Sass**
  (`nom → (famille, poids, rôle)`), puis générer par boucles :
  `define-base-colors`, `apply-theme-variables`, `generate-theme-css-vars`
  et les transformations. Élimine les duplications n° 3 et 4, et supprime le
  besoin de `analyze-tailwind-color()` (recherche inverse) puisque les
  métadonnées famille/poids seraient portées par le registre.
- **Source de vérité unique pour la liste des thèmes** : *(fait côté
  runtime, phase 7 — `src/config/themes.ts` dont dérivent `ThemeOption`,
  le script anti-FOUC et l'AccessibilityMenu)*. Reste : dériver aussi les
  blocs `[data-theme]` SCSS de la même source (nécessiterait une boucle
  Sass ou une génération de code — pas de mécanisme simple sous `@use`
  sans un pas de build dédié).
- **Modéliser les 3 axes de l'UI dans l'état** : le menu présente
  Mode/Confort/Vision comme indépendants mais le modèle est un thème plat —
  d'où la ref `lastBaseTheme` et l'impossibilité de combiner (ex. dark +
  deutéranopie). À terme, un état composite `{base, contrast, vision}` avec
  résolution vers un thème effectif serait plus juste.

### Qualité perceptive et conformité

- **Vérification automatique des contrastes** *(fait — chantier E1,
  2026-07-04 : suite WCAG + distinguabilité ΔE sous simulation CVD + garde
  anti-gamut, `src/accessibility/contrast/`)*.
- **Exposer `--success-color`/`--error-color` thématisées** *(fait —
  fondations phase 6 : `--success`/`--danger` émis thématisés ; les
  constantes conservées à dessein)*.
- **Support de `prefers-contrast` et `forced-colors`** : respecter les
  préférences système au même titre que `prefers-color-scheme`. *(reste à
  faire)*
- Espaces colorimétriques perceptuels (**OKLCH**) *(fait — E2 2026-07-04 :
  anti-glare réécrit en OKLCH ; repli OKLCH du moteur daltonien ;
  gamut-mapping `local-minde`. Le décalage de poids du dark reste en
  géométrie Tailwind, à dessein)*.

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
