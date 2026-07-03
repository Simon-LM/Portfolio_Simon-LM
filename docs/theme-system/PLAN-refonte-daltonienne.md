<!-- @format -->

# Plan d'exécution — refonte du mécanisme daltonien (remap de familles Tailwind)

**Document d'exécution destiné à une IA.** Mêmes règles générales que
[PLAN-migration-fondations.md](./PLAN-migration-fondations.md) : branche
dédiée, un commit par phase, sortie brute des vérifications dans chaque
rapport, arrêt en cas d'imprévu, entrées [CHANGELOG.md](./CHANGELOG.md).
Conception de référence : [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md)
§ E2 (mécanisme acté le 2026-07-03 : remap de familles à poids constant,
garde-fous mesurés) et chapitre tests de contrastes.

## ⛔ Prérequis bloquants

1. **Le chantier E1 ([PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md))
   doit être mergé** : cette refonte modifie les couleurs de 7 thèmes ; la
   suite de contrastes est son filet de sécurité. Ne pas commencer sans.
2. Le chantier E2 ([PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md)) est
   **fortement recommandé avant** (les deux touchent `_theme-utils.scss` ;
   l'exécuter après évite les conflits). S'il n'est pas fait : le signaler
   dans le rapport de phase 0 et obtenir l'accord de Simon avant de
   continuer.

Branche : `refactor/theme-cvd-remap`.

## Le mécanisme cible (rappel de conception)

Pour chaque type de déficience, une **table de remap de familles Tailwind**
avec décalage de poids optionnel par entrée :

```scss
// Deuteranopia config (example — tables are calibration points, see phase 3)
"family-remap": (
  "emerald": ("sky", 0),    // greens become blues, weight preserved
  "redd": ("amber", 1),     // reds become ambers, +1 weight for contrast
),
```

Résolution d'une couleur par le moteur :

1. `analyze-tailwind-color()` retrouve (famille, poids) ; si la famille est
   dans la table → `get-color(famille-cible, poids + décalage)` (borné aux
   poids 50–950).
2. Sinon, si la variable a une `special-color` explicite → l'utiliser
   (mécanisme conservé, prioritaire sur tout).
3. Sinon (couleur hors palette) → **repli OKLCH** : rotation de teinte vers
   l'ancre sûre du type de CVD, à luminance et chroma constants
   (`color.change(..., $hue: …, $space: oklch)`).

**Anomalies** (-omalies, formes légères) : la couleur finale est un mélange
perceptuel entre l'originale et la version remappée —
`color.mix(remapped, original, $severity, $method: oklch)` avec
`"severity": 50%` par défaut (configurable). Un seul mécanisme pour les 6
thèmes daltoniens non monochromes, l'intensité fait la différence.

L'achromatopsie n'est **pas** concernée (mécanisme séparé, conservé).

## Phase 0 — Préparation

Arbre propre, branche, baseline CSS
(`/tmp/cvd-remap/phase0.css`), `pnpm build`/`lint`/`test` verts. Vérifier
la présence de la suite de contrastes (`src/accessibility/contrast/`) et du
[CONTRAST-REPORT.md](./CONTRAST-REPORT.md) — sinon, prérequis 1 non rempli :
arrêt.

## Phase 1 — Tests de distinguabilité par simulation CVD (additif)

Étend le système E1 **avant** de toucher aux moteurs, pour disposer du
filet complet. Aucune modification de `src/styles/` dans cette phase.

1. **Simulation** (`src/accessibility/contrast/cvd-simulation.ts`) :
   simuler la perception de chaque déficience via les matrices de
   Machado et al. 2009 (sévérité 1.0 pour les -opies, 0.5 pour les
   -omalies). Ne pas réinventer les coefficients : utiliser une
   bibliothèque éprouvée si disponible (`color-blind` sur npm) ou
   recopier les matrices depuis la référence DaltonLens/Machado en citant
   la source en commentaire. Tests unitaires : les gris restent des gris
   (les lignes de la matrice somment à ≈ 1), et 2-3 valeurs de référence
   publiées.
2. **Règles de distinguabilité** : nouveau `kind: "distinguishability"`
   dans le registre — paires qui doivent rester *différenciables* sous
   simulation, mesurées en ΔE CIEDE2000 (culori,
   `differenceCiede2000`) :

   | Paire | Thèmes concernés |
   | --- | --- |
   | `--success` / `--danger` | les 7 thèmes CVD |
   | `--accent` / `--danger` | idem |
   | `--accent` / `--success` | idem |
   | `--link` / `--success` | idem (collision bleue potentielle du remap) |
   | `--link` / `--fg-base` | idem (un lien doit se distinguer du texte) |

   Seuil de départ : **ΔE ≥ 20 sous simulation** — point de calibration,
   à ajuster avec Simon lors de la validation. Mécanisme de waivers
   identique à E1.
3. **Premier run = inventaire sur les thèmes actuels** (avant refonte) :
   consigner les ΔE mesurés dans le rapport de phase — c'est la base de
   comparaison qui prouvera que la refonte améliore (ou non) chaque paire.

**Oracle** : CSS byte-identique à phase 0.
**Commit** : `feat(theme): cvd phase 1 — simulation-based distinguishability tests`.

## Phase 2 — Le moteur de remap (Sass)

Dans `_theme-utils.scss` :

1. Nouvelle fonction `remap-for-cvd($color, $var-name, $config)`
   implémentant la résolution en 3 étapes ci-dessus (+ le mélange
   `severity` pour les anomalies). Poids borné à [50, 950] après décalage,
   avec `@warn` si le bornage s'applique.
2. Réécrire les 6 mixins `transform-light-to-{deuter,prot,trit}{anopia,anomaly}`
   pour utiliser `remap-for-cvd` sur les primitives (`$accent`,
   `$accent-strong`, `$accent-soft`, `$accent-ink`, `$link`, `$link-hover`,
   `$success`, `$danger`) — les gris ne sont jamais touchés (comportement
   conservé). Conserver la structure config (`special-colors`, `overrides`)
   existante ; ajouter `family-remap` et `severity`.
3. Supprimer les chemins devenus morts **uniquement en fin de phase 4**
   (quand plus rien ne les référence) : `adapt-color-for-colorblindness`,
   `adapt-color-for-color-anomaly`, `auto-*-transform`, `brightness`,
   `is-similar-to` (vérifier chaque nom par grep avant suppression).

**Oracle de cette phase** : CSS encore byte-identique (le moteur existe
mais aucun thème ne l'utilise encore).
**Commit** : `feat(theme): cvd phase 2 — family-remap engine`.

## Phase 3 — Tables par défaut et bascule des 6 thèmes

1. Si nécessaire, **étendre la palette** (`_base-palette.scss`) avec des
   familles Tailwind supplémentaires (données pures, addition sans risque :
   `orange`, `violet`, `cyan`…) pour donner aux tables des cibles qui ne
   collisionnent pas avec les familles déjà occupées (`amber` = accent,
   `sky` = liens).
2. Proposer les tables par défaut par thème. Point de départ suggéré
   (**calibration — la validation finale appartient à Simon et aux
   tests**) :
   - deutéranopie / protanopie (confusion rouge-vert) :
     `emerald → sky (0)`, `redd → amber (+1)` — et si la distinguabilité
     `danger`/`accent` mesurée est insuffisante (deux ambres),
     `redd → violet (0)` en seconde option ;
   - tritanopie (confusion bleu-jaune) : `sky → cyan`? non — cibler des
     familles distinguables : `amber → orange (0)`, `sky → violet (0)`,
     `emerald` inchangé ;
   - anomalies : mêmes tables que leur -opie, `severity: 50%`.
3. Brancher les 6 fichiers de thèmes sur les nouvelles configs. Les
   `special-colors` actuelles (`#0075ff`, `#ffcc00`…) sont **retirées des
   défauts** (le remap les remplace) — sauf si un ratio mesuré est
   meilleur avec ; en ce cas le documenter.
4. Purge des chemins morts (cf. phase 2.3).

**Diff CSS attendu** : confiné aux 6 blocs `[data-theme]` daltoniens ;
chaque valeur changée doit être une couleur de palette Tailwind (ou un
mélange OKLCH pour les anomalies). Sortie brute au rapport.
**Commit** : `refactor(theme): cvd phase 3 — default remap tables, switch themes`.

## Phase 4 — Vérifications et arbitrages

1. **Suite de contrastes** : les waivers `preexisting` liés aux couleurs
   CVD (ex. erreur deutéranopie `#ffcc00` à 1.45:1) doivent devenir
   *obsolètes* — le mécanisme anti-zombie forcera leur retrait : c'est le
   succès attendu de la refonte. Tout nouveau waiver introduit par la
   refonte = point d'arbitrage à remonter à Simon.
2. **Suite de distinguabilité** (phase 1) : comparer les ΔE avant/après par
   paire et par thème — tableau au rapport.
3. Régénérer `CONTRAST-REPORT.md`.
4. **Validation visuelle de Simon** sur les 6 thèmes (exigence de
   conception : « améliorer les contrastes sans enlaidir ») — fournir
   captures ou instructions de comparaison avant/après.

**Commit** : `refactor(theme): cvd phase 4 — verification, waiver cleanup, report`.

## Phase 5 — Finalisation

`pnpm build`/`lint`/`test` ; docs (README § 4.3 et § 6, guide E2 : refonte
faite) ; changelog de synthèse ; rapport final (diffs bruts, tableau ΔE
avant/après, waivers retirés/ajoutés, décisions en attente).

## Hors périmètre (ne PAS faire)

- Le moteur high-contrast et l'achromatopsie.
- Le moteur anti-éblouissement (chantier E2, plan séparé).
- Toute retouche du thème light/dark ou des rôles.
- L'export/packaging (chantiers E3+).
