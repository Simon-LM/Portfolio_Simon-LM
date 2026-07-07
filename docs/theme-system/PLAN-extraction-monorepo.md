<!-- @format -->

# Plan d'exécution — E3 : monorepo et extraction de la face SCSS

**Document d'exécution destiné à une IA.** Mêmes règles générales que les
plans précédents : branche dédiée, un commit par phase, sortie brute des
vérifications dans chaque rapport, arrêt en cas d'imprévu, entrées
[CHANGELOG.md](./CHANGELOG.md). Conception de référence :
[GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) § E3 et
README § 6 (architecture 3 couches, § 6.2 périmètre, § 6.3 distribution
hybride).

> **Statut : rédigé le 2026-07-07, à exécuter.**

## ⛔ Prérequis bloquants

1. `main` propre, `pnpm build`/`lint`/`test` verts, suite de contrastes
   présente (elle est l'oracle comportemental de tout le chantier).
2. Aucun autre chantier thèmes en cours sur une branche.

Branche : `feat/e3-monorepo`.

## Objectif et périmètre

Créer un **workspace pnpm** et y extraire la **face SCSS du moteur** — ce
qui, à terme, sera mis à jour de façon centralisée via npm chez les
consommateurs :

| Va dans le paquet (`packages/a11y-prefs/scss/`) | Reste dans le portfolio |
| --- | --- |
| `_base-palette.scss` (palettes, `get-color`, `is-dark`…) | `main.scss`, tous les composants/pages |
| `_theme-utils.scss` (tous les moteurs `transform-light-to-*`, remap CVD, ancres statut, math WCAG, gamut) | les 12 fichiers de thèmes `_light.scss`… (= **configs** du projet) |
| `_anti-glare-functions.scss` | `_theme-system.scss` (assemblage : 12 blocs `[data-theme]`, `:root`, media) |
| la partie **rail + primitives + rôles** de `_theme-variables.scss` (état mutable + `define-base-colors` + `apply-roles`) | la partie **couche 3** de `_theme-variables.scss` (~70 tokens projet + `apply-theme-variables`) |

`a11y-prefs` est un **nom de travail** (dossier + `"name"` npm privé) —
le nom définitif appartient à Simon et sera fixé au plus tard en E7 ;
le renommage est bon marché (dossier + imports).

**Oracle global du chantier : le CSS compilé reste byte-identique du
début à la fin** (aucun changement visuel — c'est un déménagement, pas une
refonte). Chaque phase recompile et compare à la baseline.

## Points techniques imposés

1. **Résolution Sass des imports du paquet.** pnpm symlinke le paquet du
   workspace dans `node_modules/`. Dart Sass ne résout pas les modules
   Node par défaut : ajouter `node_modules` aux chemins de recherche
   partout où l'on compile —
   - `next.config.ts` : `sassOptions: { includePaths: ["node_modules"] }` ;
   - `extract-themes.ts` (suite de contrastes) : `compile(MAIN_SCSS,
     { loadPaths: ["node_modules"] })` ;
   - tests-sondes (`status-resolver.test.ts`) et toute compilation CLI :
     `--load-path=node_modules`.
   Les `@use` du portfolio vers le paquet s'écrivent alors
   `@use "a11y-prefs/scss/theme-utils"`.
2. **État mutable et `!global`.** Le pipeline repose sur la mutation de
   globales déclarées à la racine du module d'état. Ce module (rail,
   primitives, rôles) part **entier** dans le paquet ; les mixins du
   paquet continuent d'y accéder par `@use … as *` (relation inchangée).
   Les ~70 tokens de couche 3 restent déclarés à la racine du module
   **portfolio**, assignés par le mixin portfolio `apply-theme-variables`
   qui lit les rôles du paquet — aucune assignation croisée
   paquet→portfolio ne doit subsister (c'est l'objet de la phase 2).
3. **`@forward` d'API.** Le paquet expose un point d'entrée unique
   `scss/_index.scss` qui `@forward` palette, état/rôles et moteurs — le
   portfolio ne `@use` que des chemins publics du paquet, jamais ses
   fichiers internes.
4. **Windows/`node_modules` et Vercel** : vérifier que le build Vercel
   (`pnpm install` en workspace) produit le même CSS — le rapport de
   phase 6 doit inclure un `pnpm build` complet.

## Phase 0 — Préparation

Arbre propre, branche, baseline `/tmp/e3-monorepo/phase0.css`
(`pnpm exec sass --no-source-map src/styles/main.scss …`),
`pnpm build`/`lint`/`test` verts.

## Phase 1 — Workspace pnpm + sonde de résolution (aucun déplacement)

1. `pnpm-workspace.yaml` (`packages: ["packages/*"]`),
   `packages/a11y-prefs/package.json` minimal (`"name": "a11y-prefs"`,
   `"version": "0.0.0"`, `"private": true`, `"exports": { "./scss/*":
   "./scss/*" }`) et un `scss/_probe.scss` temporaire (une variable).
2. `pnpm install` (crée le lien workspace), ajout des chemins de
   résolution (`next.config.ts` sassOptions, extract-themes loadPaths).
3. **Sonde** : un `@use "a11y-prefs/scss/probe"` temporaire dans un
   fichier de test compilé par les trois canaux (CLI sass, Next build,
   extract-themes) — prouver la résolution avant de déménager quoi que ce
   soit, puis retirer la sonde.

**Oracle** : CSS byte-identique. **Commit** :
`feat(theme): e3 phase 1 — pnpm workspace + package skeleton`.

## Phase 2 — Inversion de dépendance (moteurs ↛ couche 3)

Aujourd'hui, chaque mixin `transform-light-to-*` (et l'anti-glare) se
termine par `@include apply-roles()` **puis `@include
apply-theme-variables`** — or `apply-theme-variables` est la couche 3 du
projet : un moteur de paquet ne peut pas appeler un mixin du consommateur.

1. Retirer `@include apply-theme-variables;` de **tous** les mixins
   moteurs (`transform-light-to-{dark,high-contrast,deuter/prot/trit
   ×2}`, `transform-theme-for-anti-glare`) — ils s'arrêtent à
   `apply-roles()`.
2. Ajouter `@include apply-theme-variables;` dans **chaque fichier de
   thème** (`_dark.scss`, `_high-contrast.scss`, les 6 daltoniens, les 2
   anti-glare — et vérifier `_light.scss`/`_achromatopsia.scss`), juste
   après l'appel du transform. L'ordre d'exécution est strictement
   identique → CSS byte-identique.
3. Documenter dans le code : « le moteur s'arrête aux rôles ; la couche 3
   est dérivée par le consommateur ».

**Oracle** : CSS byte-identique. **Commit** :
`refactor(theme): e3 phase 2 — engines stop at the role layer`.

## Phase 3 — Déménagement de la palette et des moteurs

1. Déplacer `_base-palette.scss`, `_theme-utils.scss`,
   `_anti-glare-functions.scss` vers `packages/a11y-prefs/scss/` (avec
   `git mv` pour préserver l'historique).
2. Créer `packages/a11y-prefs/scss/_index.scss` qui `@forward` les trois.
3. Mettre à jour tous les `@use` du portfolio (12 fichiers de thèmes,
   `_theme-variables.scss`, `_theme-system.scss`, `main.scss`) vers
   `a11y-prefs/scss/…`, et les chemins des tests-sondes
   (`status-resolver.test.ts`).
4. Attention aux `@use` internes du paquet (theme-utils ↔
   theme-variables) : tant que l'état n'est pas déménagé (phase 4), le
   paquet `@use` temporairement le fichier d'état du portfolio par chemin
   relatif remontant — laid mais byte-safe, résorbé en phase 4 ; le
   signaler dans le rapport.

**Oracle** : CSS byte-identique ; `pnpm test` complet (la suite recompile
tout). **Commit** : `refactor(theme): e3 phase 3 — move palette and engines
into the package`.

## Phase 4 — Scission de l'état : rôles (paquet) / couche 3 (portfolio)

1. Créer `packages/a11y-prefs/scss/_state.scss` : rail 11 crans,
   primitives (`$accent`…), ~15 rôles, alias (`$off-white`,
   `$near-black`), `define-base-colors()`, `apply-roles()` — coupé-collé
   depuis `_theme-variables.scss`, déclarations racine comprises.
2. `src/styles/themes/_theme-variables.scss` (portfolio) ne garde que la
   couche 3 : ~70 déclarations racine + `apply-theme-variables()` — et
   `@use "a11y-prefs/scss/state" as *` pour lire rôles et primitives.
3. Résorber le chemin temporaire de la phase 3 (le paquet ne référence
   plus rien côté portfolio — vérifier par grep qu'aucun `@use` du paquet
   ne remonte vers `src/`).

**Oracle** : CSS byte-identique. **Commit** :
`refactor(theme): e3 phase 4 — split state: roles in package, layer 3 in app`.

## Phase 5 — Configuration minimale `with (…)`

Rendre configurable ce qui est bon marché, sans refonte :

1. Dans `_state.scss` : `$gray-family: "stone" !default;` (le rail est
   dérivé de cette famille) et une map `$primitives` `!default`
   (`accent: (amber, 300), link: (sky, 900), success: (emerald, 700),
   danger: (redd, 600)`, etc.) consommée par `define-base-colors()`.
2. Le portfolio consomme : `@use "a11y-prefs/scss/state" as * with
   ($gray-family: "stone", $primitives: (…));` — valeurs identiques aux
   actuelles → byte-identique.
3. **Hors périmètre assumé** : le câblage rôle→cran de `apply-roles()`
   reste codé en dur dans le paquet (le « registre central » complet est
   un chantier ultérieur, cf. README § 7) ; idem la liste des thèmes.

**Oracle** : CSS byte-identique. **Commit** :
`feat(theme): e3 phase 5 — minimal package configuration (with)`.

## Phase 6 — Finalisation

1. `pnpm build`/`lint`/`test` complets + **`pnpm contrast:report`**
   (rapport inchangé attendu) + build local type Vercel.
2. Docs : README § 3 (cartographie des fichiers → nouveaux chemins),
   guide § E3 (fait), TODO ; changelog de synthèse ; rapport final (diff
   byte-identique prouvé, arborescence du paquet).

**Commit** : `docs(theme): e3 phase 6 — finalization`.

## Hors périmètre (ne PAS faire)

- Le **runtime React** (`useTheme`, anti-FOUC, menu) — chantier E4.
- Les **modules** de préférences (zoom, polices, animations) — E5.
- Le **CLI de scaffolding** — E6 ; la **publication npm et le nom** — E7
  (décision de Simon).
- La **suite de contrastes** reste côté portfolio (elle compile
  `src/styles/main.scss`) ; son extraction en outil du paquet = E7.
- Le **registre central** des ~70 tokens et la génération des blocs
  `[data-theme]` depuis `themes.ts`.
- Tout changement de **valeur de couleur** (oracle byte-identique).
