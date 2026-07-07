<!-- @format -->

# Plan d'exécution — E4 : extraction du runtime React

**Document d'exécution destiné à une IA.** Mêmes règles générales que les
plans précédents : branche dédiée, un commit par phase, sortie brute des
vérifications dans chaque rapport, arrêt en cas d'imprévu, entrées
[CHANGELOG.md](./CHANGELOG.md). Conception de référence :
[GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) § E4 et
README § 4.6 (runtime).

> **Statut : rédigé le 2026-07-07, à exécuter.**

## ⛔ Prérequis bloquants

1. **E3 mergé** (workspace pnpm + `packages/a11y-prefs` présents) — fait
   le 2026-07-07 (`812d5d5`).
2. `pnpm build`/`lint`/`test` verts.

Branche : `feat/e4-runtime`.

## Objectif et périmètre

Extraire la **face runtime** du système dans le paquet — ce qui permettra
aux consommateurs d'avoir le hook, la persistance et l'anti-FOUC sans les
réécrire :

| Va dans le paquet (`packages/a11y-prefs/react/`) | Reste dans le portfolio |
| --- | --- |
| `THEMES` (les 12) + type `ThemeOption` (défauts du paquet) | `src/config/themes.ts` → simple ré-export (les imports `@/config/themes` ne bougent pas) |
| `useTheme()` (init paresseuse localStorage/matchMedia, `setTheme`, MutationObserver) | `src/hooks/useTheme.ts` → ré-export |
| `usePrefersDarkMode()` | `src/hooks/usePrefersDarkMode.ts` → ré-export |
| `themeInitScript(themes?)` : génère la chaîne JS anti-FOUC | `layout.tsx` (l'inline `<Script>` reste, son contenu vient du paquet) |
| — | `AccessibilityMenu` (UI scaffoldée, chantier E6) |

**Oracles du chantier** :

1. **CSS byte-identique strict** (aucun SCSS touché — pas même la
   tolérance pragmas d'E3).
2. **Chaîne anti-FOUC byte-identique** : extraire la chaîne générée
   avant/après (petit script Node qui importe `themeInitScript` et la
   compare au littéral actuel de `layout.tsx`) — le HTML rendu ne doit
   pas changer.
3. Suite complète verte (589 tests) + `pnpm build` + smoke manuel du
   changement de thème en dev.

## Points techniques imposés

1. **Sources TypeScript consommées sans build du paquet** (le dist
   publiable est un sujet E7) :
   - `packages/a11y-prefs/package.json` : ajouter
     `"./react": "./react/index.ts"` aux `exports`, et `react` en
     **peerDependency** (pas dependency) ;
   - `next.config.ts` : `transpilePackages: ["a11y-prefs"]` ;
   - Jest (config dans `package.json`) : `moduleNameMapper`
     `"^a11y-prefs/react$": "<rootDir>/packages/a11y-prefs/react/index.ts"`
     (contourne `transformIgnorePatterns` sur node_modules) ;
   - `tsconfig.json` : vérifier la résolution (ajouter un `paths`
     `"a11y-prefs/react": ["./packages/a11y-prefs/react/index.ts"]` si le
     mode de résolution ne lit pas les `exports`).
2. **Généricité minimale, comportement identique.** `useTheme` et
   `themeInitScript` prennent un paramètre optionnel
   `themes: readonly string[]` **défaut = les 12 du paquet** ; les
   booléens de confort (`isDark`, `isTritanopia`…) sont conservés tels
   quels (ils portent sur les 12 thèmes par défaut du paquet). Aucune
   modification de logique : déplacement + paramétrisation du littéral.
3. **Zéro churn chez les consommateurs** : les fichiers portfolio
   (`src/config/themes.ts`, `src/hooks/useTheme.ts`,
   `src/hooks/usePrefersDarkMode.ts`) deviennent des **ré-exports** du
   paquet — les ~8 importeurs existants (`@/config/themes`,
   `@/hooks/useTheme`…) ne changent pas. La suite de contrastes continue
   d'importer `@/config/themes` (type `ThemeOption` inchangé, `as const`
   préservé pour l'inférence littérale).

## Phase 0 — Préparation

Arbre propre, branche, baselines : CSS compilé
(`/tmp/e4-runtime/phase0.css`, `--load-path=node_modules`) + copie du
littéral anti-FOUC actuel (bloc `dangerouslySetInnerHTML` de
`layout.tsx`) pour l'oracle n° 2. `pnpm build`/`lint`/`test` verts.

## Phase 1 — Squelette react du paquet + câblage outillage

1. `packages/a11y-prefs/react/` : `index.ts` (exports vides pour
   l'instant), `themes.ts` sonde.
2. `exports`/peerDependencies dans le package.json du paquet ;
   `transpilePackages` dans next.config.ts ; `moduleNameMapper` Jest ;
   `paths` tsconfig si nécessaire.
3. **Sonde** : un test Jest minimal importe `a11y-prefs/react` et lit la
   sonde ; un composant temporaire n'est PAS nécessaire — vérifier la
   résolution Next par `pnpm build` avec un import temporaire dans
   `layout.tsx`, retiré ensuite.

**Oracles** : CSS byte-identique, suite verte.
**Commit** : `feat(theme): e4 phase 1 — package react entry + tooling wiring`.

## Phase 2 — Liste des thèmes et hooks

1. `packages/a11y-prefs/react/themes.ts` : `THEMES` (les 12, `as const`)
   + `ThemeOption` — contenu déplacé depuis `src/config/themes.ts`.
2. `packages/a11y-prefs/react/useTheme.ts` et `usePrefersDarkMode.ts` :
   code déplacé tel quel, imports internes ajustés ; `useTheme` accepte
   `themes` optionnel (défaut `THEMES`).
3. Côté portfolio : `src/config/themes.ts`, `src/hooks/useTheme.ts`,
   `src/hooks/usePrefersDarkMode.ts` deviennent des ré-exports
   (`export { THEMES, type ThemeOption } from "a11y-prefs/react"` etc.).
4. Vérifier que `tsc --noEmit` voit les mêmes types (littéraux du union
   `ThemeOption` intacts) et que les 589 tests passent sans modification.

**Oracles** : CSS byte-identique, suite verte, tsc vert.
**Commit** : `refactor(theme): e4 phase 2 — themes list and hooks into the package`.

## Phase 3 — Anti-FOUC

1. `packages/a11y-prefs/react/themeInitScript.ts` :
   `themeInitScript(themes = THEMES): string` retournant **exactement** la
   chaîne actuelle de `layout.tsx` (mêmes espaces/retours — l'oracle est
   byte-à-byte), avec `JSON.stringify(themes)` à l'emplacement actuel.
2. `layout.tsx` : `__html: themeInitScript()` à la place du littéral.
3. **Oracle n° 2** : script Node de comparaison ancienne chaîne (baseline
   phase 0) vs `themeInitScript()` — identiques byte à byte.

**Oracles** : chaîne identique, CSS byte-identique, build Next vert.
**Commit** : `refactor(theme): e4 phase 3 — anti-FOUC script from the package`.

## Phase 4 — Finalisation

1. `pnpm build`/`lint`/`test`/`tsc` complets + `pnpm contrast:report`
   (inchangé attendu) + **smoke manuel** : `pnpm dev`, changer de thème
   via le menu, recharger (persistance), vérifier l'absence de FOUC.
2. Docs : README § 3 (cartographie runtime → paquet) et § 4.6, guide § E4
   (fait), TODO ; changelog de synthèse ; rapport final.

**Commit** : `docs(theme): e4 phase 4 — finalization`.

## Hors périmètre (ne PAS faire)

- `AccessibilityMenu` et toute l'UI (chantier E6, scaffoldée).
- Les **modules** de préférences (zoom, polices, animations, dyslexie) —
  E5 ; le store de taille de police (`fontSizeStore`) reste portfolio.
- Le **build/dist publiable** du paquet, la publication et le nom — E7.
- Le modèle 3 axes `{base, contraste, vision}` (piste README § 7).
- Tout changement de comportement observable (thème initial, persistance,
  ordre des vérifications localStorage/matchMedia).
