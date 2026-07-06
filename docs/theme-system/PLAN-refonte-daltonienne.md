<!-- @format -->

# Plan d'exécution — refonte du mécanisme daltonien

**Document d'exécution destiné à une IA.** Mêmes règles générales que
[PLAN-migration-fondations.md](./PLAN-migration-fondations.md) : branche
dédiée, un commit par phase, sortie brute des vérifications dans chaque
rapport, arrêt en cas d'imprévu, entrées [CHANGELOG.md](./CHANGELOG.md).

Deux parties, exécutables indépendamment :

| Partie | Contenu | Statut |
| --- | --- | --- |
| [Partie 1](#partie-1--remap-de-familles-tailwind) | Remap de familles Tailwind + tests de distinguabilité | ✅ exécutée le 2026-07-04, mergée le 2026-07-05 (`d12264f`) |
| [Partie 2](#partie-2--ancres-sémantiques-pour-les-rôles-statut) | Ancres sémantiques pour les rôles statut | actée le 2026-07-06, à exécuter |

---

## Partie 1 — remap de familles Tailwind

> ✅ **Exécutée le 2026-07-04** (branche `refactor/theme-cvd-remap`,
> 5 commits), **mergée le 2026-07-05** après validation visuelle de Simon
> et revue indépendante. Conservée ci-dessous pour référence — résultats
> détaillés dans le [CHANGELOG.md](./CHANGELOG.md) et le
> [guide § E2](./GUIDE-extraction-paquet.md).

Conception de référence : [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md)
§ E2 (mécanisme acté le 2026-07-03 : remap de familles à poids constant,
garde-fous mesurés) et chapitre tests de contrastes.

### ⛔ Prérequis bloquants (partie 1)

1. **Le chantier E1 ([PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md))
   doit être mergé** : cette refonte modifie les couleurs de 7 thèmes ; la
   suite de contrastes est son filet de sécurité. Ne pas commencer sans.
2. Le chantier E2 ([PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md)) est
   **fortement recommandé avant** (les deux touchent `_theme-utils.scss` ;
   l'exécuter après évite les conflits). S'il n'est pas fait : le signaler
   dans le rapport de phase 0 et obtenir l'accord de Simon avant de
   continuer.

Branche : `refactor/theme-cvd-remap`.

### Le mécanisme cible (rappel de conception, partie 1)

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

### Phase 0 — Préparation

Arbre propre, branche, baseline CSS
(`/tmp/cvd-remap/phase0.css`), `pnpm build`/`lint`/`test` verts. Vérifier
la présence de la suite de contrastes (`src/accessibility/contrast/`) et du
[CONTRAST-REPORT.md](./CONTRAST-REPORT.md) — sinon, prérequis 1 non rempli :
arrêt.

### Phase 1 — Tests de distinguabilité par simulation CVD (additif)

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

### Phase 2 — Le moteur de remap (Sass)

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

### Phase 3 — Tables par défaut et bascule des 6 thèmes

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

### Phase 4 — Vérifications et arbitrages

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

### Phase 5 — Finalisation

`pnpm build`/`lint`/`test` ; docs (README § 4.3 et § 6, guide E2 : refonte
faite) ; changelog de synthèse ; rapport final (diffs bruts, tableau ΔE
avant/après, waivers retirés/ajoutés, décisions en attente).

### Hors périmètre de la partie 1 (ne PAS faire)

- Le moteur high-contrast et l'achromatopsie.
- Le moteur anti-éblouissement (chantier E2, plan séparé).
- Toute retouche du thème light/dark ou des rôles.
- L'export/packaging (chantiers E3+).

---

## Partie 2 — ancres sémantiques pour les rôles statut

> **Actée le 2026-07-06, à exécuter.** Conception de référence :
> [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) § E2
> (évolution « ancres sémantiques », actée le 2026-07-06) et README § 6.1.

**Origine.** La partie 1 a remonté un arbitrage : `role/success-on-bg-base`
régressé jusqu'à 1.60:1 en deutér/protanopie, parce qu'un décalage de poids
fixe (`emerald → sky (-3)`) servait deux contraintes à la fois — la
distinguabilité CVD *et* le contraste WCAG — et a sacrifié la seconde à la
première. La partie 2 corrige le défaut par conception, pour la classe de
rôles où c'est possible : les **rôles statut**, dont la sémantique est
quasi universelle d'un projet à l'autre (vert = OK, rouge = problème).

### ⛔ Prérequis bloquants (partie 2)

1. **La partie 1 doit être mergée** (fait le 2026-07-05) : vérifier la
   présence de `remap-for-cvd` dans `_theme-utils.scss` et de la suite de
   distinguabilité (`src/accessibility/contrast/cvd-simulation.ts`,
   `__tests__/distinguishability.test.ts`) — sinon, arrêt.
2. `pnpm build`/`lint`/`test` verts au départ.

Branche : `refactor/theme-status-anchors`.

### Le mécanisme cible (partie 2)

**Périmètre : les rôles statut uniquement** — `--success` et `--danger`.
(`--warning` et `--info` sont des noms réservés de la future API, même
classe et même mécanisme le jour venu — **aucun code pour eux dans ce
chantier**.) Les rôles identitaires (`accent`, `link`, `focus-ring`…)
restent adaptés par les tables `family-remap` de la partie 1.

1. **Ancres sémantiques par type de CVD** (connaissance de domaine livrée
   par le futur paquet, conventions établies de conception daltonienne) :
   - déficiences **rouge-vertes** (deutéranopie, protanopie et leurs
     anomalies) : `success` → ancre **bleue**, `danger` → ancre **orange**
     (la paire bleu/orange est le duo sûr canonique) ;
   - **tritanopie/tritanomalie** : rouge et vert restent bien perçus — les
     statuts **gardent leurs familles d'origine** (aucun changement).

   L'ancre désigne une *famille de la palette du projet* (configuration
   par thème, voir phase 3) — jamais une couleur hors palette : les
   contraintes de conception n° 1 et n° 2 du guide s'appliquent.

2. **Poids auto-résolu par la contrainte de contraste.** La teinte vient de
   l'ancre (distinguabilité) ; le poids est **calculé** : le premier cran
   de la famille cible dont la couleur *finale* satisfait le ratio WCAG
   texte (≥ 4.5:1) contre le `$bg-base` du thème. Précisions d'algorithme :
   - fond clair (luminance > 0.5) : parcourir les poids du plus clair
     (50) au plus foncé (950), retenir le premier conforme ; fond sombre :
     sens inverse. `@error` explicite si aucun cran ne passe ;
   - pour les **anomalies**, la couleur finale est le mélange `severity`
     (mécanisme de la partie 1, conservé) — le poids est résolu sur le
     **résultat du mélange**, pas sur la couleur cible pure, sinon le
     mélange peut repasser sous le seuil (les waivers actuels à 2.33 en
     -omalies viennent de là) ;
   - nécessite des fonctions Sass `wcag-relative-luminance()` /
     `wcag-contrast-ratio()` (formule WCAG 2.x, `math.pow` pour la
     linéarisation des canaux). Vérification croisée en phase 4 : les
     ratios calculés côté Sass doivent correspondre à ceux mesurés par la
     suite TypeScript (même formule des deux côtés).

3. **Seuils ΔE par classe de paire** dans la suite de distinguabilité. Le
   seuil unique (≥ 20) sur-contraint la paire `link`/`success` : WCAG 1.4.1
   impose déjà que les liens ne reposent jamais sur la couleur seule
   (soulignement) — confondre la couleur d'un lien et celle d'un statut
   n'est pas un échec du même ordre que confondre succès et danger. C'est
   ce sur-poids qui avait produit le décalage `-3` destructeur de
   contraste en partie 1.

### Phase 0 — Préparation

Arbre propre, branche, baseline CSS (`/tmp/status-anchors/phase0.css`),
`pnpm build`/`lint`/`test` verts, prérequis vérifiés.

### Phase 1 — Seuils ΔE par classe de paire (tests, additif)

Aucune modification de `src/styles/` dans cette phase.

1. Ajouter un champ `threshold?: number` aux paires `distinguishability`
   du registre (défaut : 20, comportement inchangé pour les paires non
   annotées).
2. Défauts proposés (**calibration — les valeurs finales sont l'arbitrage
   de Simon**, à lui présenter dans le rapport de phase avec les ΔE
   mesurés) :

   | Paire | Seuil proposé | Justification |
   | --- | --- | --- |
   | `--success` / `--danger` | 20 (inchangé) | paire critique — l'échec majeur |
   | `--accent` / `--danger` | 20 (inchangé) | statut vs identité, porteur de sens |
   | `--accent` / `--success` | 20 (inchangé) | idem |
   | `--link` / `--success` | 12 | WCAG 1.4.1 : lien souligné, jamais couleur seule |
   | `--link` / `--fg-base` | 12 | idem |

3. Documenter la justification WCAG 1.4.1 en commentaire du registre.

**Oracle** : CSS byte-identique à phase 0.
**Commit** : `feat(theme): status-anchors phase 1 — per-pair-class ΔE thresholds`.

### Phase 2 — Le résolveur de statut (Sass)

Dans `_theme-utils.scss` :

1. `wcag-relative-luminance($color)` et `wcag-contrast-ratio($a, $b)`
   (formule WCAG 2.x exacte, en commentaire la référence).
2. `resolve-status-color($color, $var-name, $config, $bg)` : lit la clé de
   config `"status-anchors"` (map `rôle → famille cible`) ; si le rôle y
   figure → poids auto-résolu selon l'algorithme ci-dessus (mélange
   `severity` inclus pour les anomalies) ; sinon → comportement partie 1
   inchangé (`remap-for-cvd`). Les `special-colors` restent prioritaires
   sur tout (mécanisme conservé).
3. Brancher la résolution des primitives `$success`/`$danger` des 6 mixins
   CVD sur `resolve-status-color` — **sans aucune clé `status-anchors`
   dans les configs à ce stade** : le chemin nouveau existe mais n'est
   emprunté par personne.

**Oracle** : CSS byte-identique (aucune config ne déclare d'ancre).
**Commit** : `feat(theme): status-anchors phase 2 — status resolver, WCAG math in Sass`.

### Phase 3 — Bascule des 4 thèmes rouge-verts

1. Dans `_deuteranopia.scss`, `_deuteranomaly.scss`, `_protanopia.scss`,
   `_protanomaly.scss` : **retirer les entrées statut des tables
   `family-remap`** (`emerald → sky (-3)`, `redd → amber (+1)`) et ajouter
   la config d'ancres. Point de départ **mesuré le 2026-07-06** (contre le
   CSS compilé de main, simulation Machado — calibration, la validation
   finale appartient à Simon et aux tests) :

   ```scss
   "status-anchors": (
     "success": "violet",  // ancre bleue ; sky est occupé par le lien
     "danger": "orange",
   ),
   ```

   - `success` → violet, poids auto attendu **violet-600** (5.46:1 sur
     `#fafaf9` ; ΔE simulés : success/danger 59.5 (deutér) / 58.0
     (protan), success/link 18.0 / 18.1, success/accent 76.4 / 75.4).
     Pourquoi pas `sky`, l'ancre bleue « naturelle » : le lien est déjà
     sky-900, et sky-700 (premier cran ≥ 4.5:1) ne serait qu'à **ΔE 9.4**
     du lien sous simulation — sous tous les seuils. `violet` est perçu
     bleu sous CVD rouge-verte : l'ancre est respectée *dans* la palette
     disponible.
   - `danger` → orange, poids auto attendu **orange-700** (4.96:1 ; ΔE
     danger/link 48.1 / 40.0, danger/accent 37.0 / 46.4). Alternative si
     le rendu déplaît : `amber` (+ poids auto → amber-700, 4.81:1 mesuré
     en partie 1) — mais amber est la famille de l'accent, orange évite
     le partage.
   - anomalies : mêmes ancres, `severity` conservée — poids résolu sur le
     mélange (cf. mécanisme cible).
2. **Tritanopie/tritanomalie : ne rien changer.** Vérifier explicitement
   que les deux blocs tritan du CSS compilé sont byte-identiques à la
   baseline.

**Diff CSS attendu** : confiné aux 4 blocs `[data-theme]` rouge-verts, et
aux seules propriétés dérivées de `success`/`danger`. Sortie brute au
rapport.
**Commit** : `refactor(theme): status-anchors phase 3 — switch red-green themes`.

### Phase 4 — Vérifications et arbitrages

1. **Suite de contrastes** : le waiver `role/success-on-bg-base` doit
   devenir *obsolète* pour deutéranopie/protanopie (1.60:1 → ≥ 4.5:1
   attendu) — le mécanisme anti-zombie forcera son retrait : c'est le
   succès attendu de la partie 2. Vérifier aussi les entrées -omalies
   (2.33 aujourd'hui). Tout nouveau waiver = arbitrage à remonter à Simon.
2. **Cohérence Sass/TypeScript** : comparer 3-4 ratios calculés par
   `wcag-contrast-ratio()` (via `@debug` ou rapport de compilation) aux
   ratios mesurés par la suite — ils doivent coïncider à l'arrondi près.
3. **Suite de distinguabilité** : tableau ΔE avant/après par paire et par
   thème au rapport ; les seuils par classe (phase 1) s'appliquent.
4. Régénérer `CONTRAST-REPORT.md`.
5. **Validation visuelle de Simon** sur les 4 thèmes rouge-verts
   (« améliorer les contrastes sans enlaidir ») — captures ou instructions
   de comparaison avant/après.

**Commit** : `refactor(theme): status-anchors phase 4 — verification, waiver cleanup, report`.

### Phase 5 — Finalisation

`pnpm build`/`lint`/`test` ; docs (README § 4.3 et § 6.1, guide § E2 :
évolution implémentée) ; changelog de synthèse ; rapport final (diffs
bruts, tableau ΔE avant/après, waivers retirés/ajoutés, décisions en
attente).

**Commit** : `docs(theme): status-anchors phase 5 — finalization`.

### Hors périmètre de la partie 2 (ne PAS faire)

- `--warning` / `--info` : noms réservés, **aucun code** (ni rôle, ni
  ancre, ni test) tant que l'API ne les définit pas.
- Les tables `family-remap` des rôles identitaires (`accent`, `link`…) —
  seules les entrées statut sont retirées.
- Les thèmes tritan (statuts inchangés), l'achromatopsie, le
  high-contrast, l'anti-éblouissement.
- Toute retouche du thème light/dark ou des valeurs de rôles hors CVD
  (le 3.61:1 de `success` en light est un sujet séparé, non traité ici).
- L'export/packaging (chantiers E3+).
