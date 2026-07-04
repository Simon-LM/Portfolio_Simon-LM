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

## 2026-07-04

### Changed (chantier E2 — revue des moteurs, phase 3 — anti-éblouissement en OKLCH)

- Phase 3 (décision actée par Simon le 2026-07-03) de
  [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) : `transform-for-anti-glare`
  (`_anti-glare-functions.scss`) réécrite pour travailler en espace OKLCH
  (`color.channel(…, $space: oklch)` / `color.change(…, $space: oklch)` /
  `color.to-space(…, rgb)`) au lieu de HSL — la lightness OKLCH est
  perceptuellement uniforme, contrairement à HSL où un jaune et un bleu de
  même L ne s'assombrissent pas visuellement à l'identique.
- **Seuils recalibrés par rapport au point de départ du plan** (le plan le
  signale explicitement comme un point de départ à ajuster, pas une
  vérité) :
  - Mode `dark` (`L < 22%`) : conservé tel quel. Mesure : sur le rail
    décalé du thème dark, seul le cran `gray-400` (le plus sombre du
    thème dark, OKLCH L ≈ 21.6%) passe sous ce seuil — exactement la même
    couverture que l'ancien seuil HSL `< 15%` (qui ne couvrait, lui
    aussi, que ce même cran, à HSL L ≈ 10%). Aucun ajustement nécessaire.
  - Mode `light` (`L > 92%` dans le plan) : **abaissé à `L > 85%`**. Avec
    92%, `stone-300` (OKLCH L ≈ 86.9%) restait en dehors du seuil et donc
    quasiment intact, alors que l'ancien moteur HSL l'atténuait déjà
    (HSL L ≈ 82.9%, au-dessus de son seuil `75%`). Rendu observé avant
    correction : `--gray-300` en anti-glare-light passait de `#d6d3d1`
    (original, quasi inchangé) au lieu d'un ton nettement atténué. Avec
    85%, `stone-50`/`100`/`200`/`300` sont couverts (comme avant),
    `stone-400` (OKLCH L ≈ 71.6%) reste hors seuil avec une marge large.
- **Tableau comparatif** (moteur HSL, phase 2, vs moteur OKLCH, phase 3 —
  hex arrondis) :

  | Token | AGL avant | AGL après | AGD avant | AGD après |
  | --- | --- | --- | --- | --- |
  | `--gray-950` | `#0c0a09` | `#0c0a09` | `#e7e5e4` | `#ece4e0` |
  | `--gray-900` | `#1c1917` | `#1c1917` | `#e7e5e4` | `#ece4e0` |
  | `--gray-800` | `#292524` | `#292524` | `#f5f5f4` | `#f6f6ee` |
  | `--gray-700` | `#44403c` | `#44403c` | `#fafaf9` | `#fbfbf3` |
  | `--gray-600` | `#57534e` | `#57534f` | `#fafaf9` | `#fbfbf3` |
  | `--gray-500` | `#77716d` | `#77716d` | `#78716c` | `#78716c` |
  | `--gray-400` | `#a8a29f` | `#a8a29f` | `#2a2623` | `#2c2723` |
  | `--gray-300` | `#b8b3b0` | `#d0cdcb` | `#292524` | `#2b2423` |
  | `--gray-200` | `#c6c2c0` | `#d8d4d3` | `#292524` | `#2b2423` |
  | `--gray-100` | `#d2d2ce` | `#e5e5e1` | `#292524` | `#2b2423` |
  | `--gray-50` | `#d8d8d1` | `#eaeae6` | `#44403c` | `#44403b` |
  | `--accent` | `#f3ce56` | `#efca57` | `#f8d151` | `#fad358` |
  | `--accent-strong` | `#e99b17` | `#efa135` | `#ef9d11` | `#f2a026` |
  | `--accent-ink` | `#421b06` | `#431c08` | `#fdf2c8` | `#fdf3c9` |
  | `--accent-soft` | `#f7e18a` | `#ece2bb` | `#652807` | `#441b05` |
  | `--link` | `#114969` | `#174a6a` | `#bce5fb` | `#bce6fb` |
  | `--link-hover` | `#0d577f` | `#195980` | `#e1f2fd` | `#e1f2fd` |
  | `--success` | `#0c8f66` | `#28946b` | `#ecfdf5` | `#edfdf5` |
  | `--danger` | `#d32f2f` | `#d43832` | `#fef2f2` | `#fef2f2` |

  Lecture : `gray-300`/`200`/`100`/`50` sont désormais dans le même ordre
  de grandeur qu'avant (auparavant `gray-300` seul restait quasi
  intact avec le seuil 92% du plan) ; les grands aplats (`gray-950`
  à `gray-500`, `link`, `danger`) sont quasi inchangés ; `accent-soft`
  se déplace un peu plus que les autres primitives (chroma initiale plus
  marquée). **Aucune de ces valeurs n'est définitive** : Simon reste seul
  juge du réglage fin, le rendu ci-dessus n'est qu'un point de départ
  raisonnable.
- **Diff CSS** : strictement confiné aux blocs `anti-glare-light` et
  `anti-glare-dark` (vérifié, mêmes plages de lignes qu'en phase 2).
- **Effet de bord traité** : `CONTRAST-REPORT.md` régénéré. 6 waivers
  référençant une paire affectée par ce changement de couleurs ont leur
  ratio mesuré mis à jour dans `contrast-pairs.ts`
  (`role/fg-on-accent-on-accent`, `role/success-on-bg-base`,
  `role/danger-on-bg-base`, `site/header-text-on-header-bg`,
  `site/header-text-role-on-header-bg`,
  `site/header-blog-link-text-on-bg` — tous en `anti-glare-light` et/ou
  `anti-glare-dark`) ; tous restent non conformes après le changement,
  aucun waiver devenu zombie.
- **Vérification visuelle** : capture d'écran automatisée (Chromium
  headless, page d'accueil) des deux thèmes anti-glare recalibrés —
  rendu sain, cohérent avec la phase 2, aucune régression visible.
  **Validation visuelle complète par Simon requise avant merge**,
  en particulier sur le réglage fin des seuils OKLCH ci-dessus.
- **Vérif** : `pnpm build`/`lint`/`test` (566 tests, 15 suites) verts.

### Changed (chantier E2 — revue des moteurs, phase 2 — anti-éblouissement en passe unique)

- Phase 2 de [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) :
  `transform-theme-for-anti-glare` (`_anti-glare-functions.scss`)
  réécrite pour dériver les ~70 tokens de couche 3 en **une seule passe**
  depuis les rôles anti-éblouis (`@include apply-theme-variables;` juste
  après `apply-roles()`), au lieu de re-transformer individuellement une
  liste de ~22 tokens codée en dur. Supprimés : les 3 resynchronisations
  manuelles de tokens de boutons (redondantes) et les ~22 blocs de
  re-transformation individuelle.
- **Bug corrigé** : ~45 tokens de couche 3 partageant un rôle avec les 22
  auparavant listés (ex. `--color-lang-toggle-bg`, `--color-panel-bg`,
  `--color-button-active-outline`, `--color-tooltip-*`, `--color-focus-*`…)
  n'étaient **jamais** atténués en anti-éblouissement (valeur clair brute).
  Ils reçoivent maintenant la même atténuation que le reste de leur rôle.
- **Constat en cours d'analyse, non prédit tel quel par le plan** : contrairement à l'attente du plan
  (« double atténuation » pour les 22 tokens auparavant listés), la mesure
  montre que ces 22 restent **strictement inchangés** (diff CSS vide sur
  ces propriétés) — dans ce pipeline, les réassigner individuellement
  après capture de leur valeur claire pré-transformation puis leur
  appliquer `transform-for-anti-glare` une fois équivaut mathématiquement
  à les dériver du rôle déjà transformé une fois (fonction pure appliquée
  au même argument d'origine). Le bug réel n'était donc pas la double
  atténuation mais uniquement l'absence totale de traitement des ~45
  tokens oubliés — désormais corrigée. Aucune régression sur les 22.
- **Diff CSS** : strictement confiné aux blocs `[data-theme="anti-glare-light"]`
  et `[data-theme="anti-glare-dark"]` (vérifié : aucune ligne changée en
  dehors de ces deux plages). Sortie brute (diff `phase1.css` →
  `phase2.css`, 228 lignes, ~57 propriétés touchées par thème) conservée
  dans `/tmp/theme-engines/phase2.diff` pour la revue de Simon.
- **Effet de bord attendu et traité** : ce changement de couleurs réelles
  a rendu `docs/theme-system/CONTRAST-REPORT.md` (chantier E1) périmé —
  régénéré via `pnpm contrast:report`. Un seul waiver enregistré dans
  `contrast-pairs.ts` référence une paire affectée
  (`site/button-active-outline-on-panel-bg`, thème `anti-glare-light`,
  qui n'était lui-même jamais atténué avant ce correctif) : ratio mesuré
  mis à jour de 1.38 à 1.06 (toujours non conforme, aucun waiver devenu
  zombie). Les autres waivers concernent des paires de rôles ou des
  couples de tokens de couche 3 non affectés par ce correctif (vérifié
  un par un contre le diff CSS).
- **Vérification visuelle** : capture d'écran automatisée (Chromium
  headless, page d'accueil) des deux thèmes anti-glare après correctif —
  header, hero, panneaux collapse et footer s'affichent normalement,
  aucun élément invisible ou non stylé. **Validation visuelle complète
  par Simon requise avant merge**, comme l'exige le plan (comparaison
  avant/après sur les pages principales).
- **Vérif** : `pnpm build`/`lint`/`test` (566 tests, 15 suites) verts.

### Fixed (chantier E2 — revue des moteurs, phase 1 — API et dead-code)

- Phase 1 de [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) (branche
  `refactor/theme-engines`), corrections sans changement visuel :
  - `_anti-glare-functions.scss` : paramètre `$intensity` de
    `transform-for-anti-glare` supprimé (jamais passé à aucun des ~30
    sites d'appel, vérifié par grep).
  - `_theme-utils.scss` : variable morte `$hue_shift` supprimée dans
    `adapt-color-for-color-anomaly` (calculée, jamais lue). Chevauchement
    de fenêtre de teinte corrigé dans `adapt-color-for-colorblindness`
    (la fenêtre rouge `$h >= 330 or $h <= 30` revendiquait `h = 30` en
    commun avec la fenêtre verte `$h >= 30 and $h <= 150` ; changée en
    `$h >= 330 or $h < 30`). `enhance-factor` des trois `-opies`
    (deutéranopie, protanopie, tritanopie) rendu configurable : les
    `auto-*-opia-transform` lisent désormais une clé `"enhancer"` du
    config (même patron que les anomalies) au lieu de coder `2.5` en dur
    dans l'appel à `adapt-color-for-colorblindness` ; les trois mixins
    `transform-light-to-*opia` déclarent `"enhancer": 2.5` dans leur
    config par défaut (valeur inchangée). Les fichiers de thèmes
    `_deuteranopia.scss`/`_protanopia.scss`/`_tritanopia.scss` n'ont pas
    été modifiés (aucun ne définissait déjà de clé `"enhancer"`, vérifié
    par lecture des trois fichiers).
- **Divergence constatée et non appliquée telle quelle (item 1 du plan,
  l'expression `if()` de `transform-for-anti-glare`)** : le plan décrit
  `@return if(sass($mode == "light"): #888888; else: #aaaaaa);` comme
  cassée (« fonctionne par accident du parsing spécial de if() ») et
  demande de la remplacer par la forme positionnelle
  `if($mode == "light", #888888, #aaaaaa)`. Mesure faite avant
  d'appliquer : avec Dart Sass 1.101.0 (version installée), c'est
  l'inverse — compiler la forme positionnelle déclenche un nouveau
  `DEPRECATION WARNING [if-function]` (« The Sass if() syntax is
  deprecated in favor of the modern CSS syntax »), dont le message
  suggère explicitement de revenir à la forme `sass(...): …; else: …`.
  Un test isolé (`if($mode == "light", …)` vs `if(sass($mode ==
  "light"): …; else: …)` pour `$mode` valant `"light"` puis `"dark"`)
  confirme que les deux formes retournent déjà la bonne couleur — la
  forme actuelle n'est donc pas buggée, c'est la syntaxe de
  désambiguïsation officielle entre le `if()` Sass et le nouveau `if()`
  CSS natif. Cette branche est de toute façon inatteignable en
  fonctionnement normal (elle ne s'exécute que si `$color` n'est pas une
  couleur valide, ce qu'aucun site d'appel ne produit). **Décision** :
  code laissé tel quel (commentaire ajouté renvoyant à cette entrée),
  aucune régression introduite. Arbitrage de Simon bienvenu si un
  contexte m'échappe.
- **Vérif** : CSS compilé strictement byte-identique à la baseline de
  phase 0 (`diff` vide). `pnpm build`/`lint`/`test` (566 tests, 15
  suites) verts.

### Docs (chantier E1 — tests de contrastes, phase 5 — finalisation)

- Phase 5 (dernière) de [PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md) :
  vérification finale et documentation. `pnpm build`/`lint`/`test` verts ;
  CSS compilé toujours strictement byte-identique à la baseline de phase 0
  (`diff` vide sur `sass --no-source-map --style=expanded`).
- README mis à jour : carte des documents (E1 marqué exécuté, ajout de la
  ligne CONTRAST-REPORT.md), § 6.4 (le second chantier hors périmètre de la
  migration fondations — les tests de contraste — est maintenant fait).
  Guide E1→E7 mis à jour (E1 marqué fait avec résumé du résultat).
- **Rapport final pour arbitrage de Simon** — 7 paires waivées, triées par
  gravité (ratio mesuré le plus bas d'abord) :

  1. `site/button-active-outline-on-panel-bg` — **1.00:1 en high-contrast**
     (le contour actif du bouton est littéralement invisible : `--accent`
     et `--bg-base` résolvent tous deux à `#000000` dans ce thème) ; 1.02
     à 1.38:1 dans les 9 autres thèmes waivés. **Recommandation** :
     ajustement de rôle — `--color-button-active-outline` pourrait être
     recâblé sur `--accent-strong` (déjà défini, amber-500) plutôt que
     `--accent` ; à valider par Simon, hors périmètre de ce chantier
     additif.
  2. `role/fg-on-accent-on-accent` — 1.15:1 en `dark`, 1.18:1 en
     `anti-glare-dark`. **Recommandation** : révision du modèle de rôles
     (chantier E2, revue des moteurs) — `--fg-on-accent` s'inverse avec
     les autres rôles de texte alors que `--accent` reste volontairement
     fixe entre thèmes clair/sombre.
  3. `site/header-text-on-header-bg` — même cause et mêmes ratios que
     `role/fg-on-accent-on-accent` (paire identique). Même recommandation.
  4. `role/danger-on-bg-base` — 1.34:1 en `protanopia`, 1.45:1 en
     `deuteranopia`, 3.25–3.46:1 dans 4 autres thèmes. **Recommandation** :
     [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md) — les
     couleurs de substitution des moteurs daltoniens sont choisies pour la
     distinguabilité perceptuelle, pas le contraste ; `--danger` n'étant
     consommé par aucun composant à ce jour, aucune urgence utilisateur.
  5. `site/header-text-role-on-header-bg` — 1.38:1 en `dark`, 1.42:1 en
     `anti-glare-dark`. **Recommandation** : chantier E2 (même famille que
     #2/#3 — `--fg-muted`/`--accent` sur fond accent en thème sombre).
  6. `site/header-blog-link-text-on-bg` — mêmes ratios que #5 (mêmes deux
     couleurs, fg/bg échangés). Même recommandation.
  7. `role/success-on-bg-base` — 2.42:1 en `achromatopsia`, 2.81–4.03:1
     dans 8 autres thèmes. **Recommandation** : ajustement de rôle
     (`emerald-600` → un cran plus soutenu) si `--success` venait à être
     consommé par un composant ; aucune urgence, actuellement inutilisé.

  Détail complet (raisons factuelles, valeurs hex/HSL vérifiées, ratios par
  thème) : [contrast-pairs.ts](../../src/accessibility/contrast/contrast-pairs.ts)
  et [CONTRAST-REPORT.md](./CONTRAST-REPORT.md).
- Rappel : chantier strictement additif du début à la fin — aucune couleur,
  rôle ou thème n'a été modifié dans `src/styles/`. Les 7 points ci-dessus
  sont des **propositions** pour un futur chantier corrective ; leur
  traitement (et son ordonnancement vs E2/E3) reste à l'arbitrage de Simon.

### Added (chantier E1 — tests de contrastes, phase 4)

- Phase 4 de [PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md) :
  `src/accessibility/contrast/report.ts`, générateur de
  [CONTRAST-REPORT.md](./CONTRAST-REPORT.md) (matrice `pairs × 12
  thèmes`, cellule = ratio mesuré + symbole ✓/✗/⚠, légende des
  abréviations de thème, section « Waivers » reprenant les raisons de
  `contrast-pairs.ts`). Script `pnpm contrast:report` (via `tsx`) ajouté
  à `package.json`.
  - Refactor mineur au passage : la logique de résolution/mesure
    (`resolveColor` + `measureRatio`), jusque-là dupliquée dans
    `contrast.test.ts`, extraite dans `src/accessibility/contrast/measure.ts`
    et réutilisée par `contrast.test.ts` et `report.ts` — aucun changement
    de comportement (498 tests toujours verts après le refactor).
  - **Date de génération non source de flakiness** : `generateReport()`
    accepte une date en paramètre ; le test de fraîcheur
    (`report.test.ts`) extrait la date déjà présente dans le fichier
    commité, régénère avec cette même date, puis compare le contenu
    intégral. Ainsi le test échoue uniquement si les *données* (couleurs,
    ratios, waivers) ont changé sans régénération — jamais à cause du
    changement de date d'un jour sur l'autre.
  - Rapport généré et commité. État actuel : 33 cellules `⚠` (les 7 paires
    waivées en phase 3), 0 cellule `✗` restante.
  - Vérifié : `pnpm test` (566 tests, 15 suites) vert, `pnpm lint` vert,
    `pnpm exec tsc --noEmit` vert, CSS compilé strictement identique à la
    baseline de phase 0.

### Added (chantier E1 — tests de contrastes, phase 3)

- Phase 3 de [PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md) :
  `src/accessibility/contrast/__tests__/contrast.test.ts`, la suite Jest
  complète (matrice paire × thème, 498 tests), plus le mécanisme
  anti-zombie (un waiver dont le ratio mesuré redevient conforme fait
  échouer le test avec un message explicite demandant sa suppression).
- Premier run (inventaire, échec attendu par le plan) : **33 échecs / 482
  tests**, regroupés sur **7 paires** distinctes. Sortie brute du script de
  mesure (`getVar` + `wcag.ts`, avant tout waiver) :

  ```
  Total failures: 33

  role/fg-on-accent-on-accent            dark               ratio=1.1484  threshold=4.5
  role/fg-on-accent-on-accent            anti-glare-dark    ratio=1.1791  threshold=4.5
  role/success-on-bg-base                light              ratio=3.6079  threshold=4.5
  role/success-on-bg-base                anti-glare-light   ratio=2.8507  threshold=4.5
  role/success-on-bg-base                deuteranomaly      ratio=3.6079  threshold=4.5
  role/success-on-bg-base                deuteranopia       ratio=4.0306  threshold=4.5
  role/success-on-bg-base                protanomaly        ratio=3.6079  threshold=4.5
  role/success-on-bg-base                protanopia         ratio=3.1254  threshold=4.5
  role/success-on-bg-base                tritanomaly        ratio=3.6079  threshold=4.5
  role/success-on-bg-base                tritanopia         ratio=2.8112  threshold=4.5
  role/success-on-bg-base                achromatopsia      ratio=2.4167  threshold=4.5
  role/danger-on-bg-base                 anti-glare-light   ratio=3.4637  threshold=4.5
  role/danger-on-bg-base                 deuteranomaly      ratio=3.3330  threshold=4.5
  role/danger-on-bg-base                 deuteranopia       ratio=1.4477  threshold=4.5
  role/danger-on-bg-base                 protanomaly        ratio=3.2777  threshold=4.5
  role/danger-on-bg-base                 protanopia         ratio=1.3430  threshold=4.5
  role/danger-on-bg-base                 tritanopia         ratio=3.2507  threshold=4.5
  site/header-text-on-header-bg          dark               ratio=1.1484  threshold=4.5
  site/header-text-on-header-bg          anti-glare-dark    ratio=1.1791  threshold=4.5
  site/header-text-role-on-header-bg     dark               ratio=1.3806  threshold=4.5
  site/header-text-role-on-header-bg     anti-glare-dark    ratio=1.4171  threshold=4.5
  site/header-blog-link-text-on-bg       dark               ratio=1.3806  threshold=4.5
  site/header-blog-link-text-on-bg       anti-glare-dark    ratio=1.4171  threshold=4.5
  site/button-active-outline-on-panel-bg light              ratio=1.3806  threshold=3
  site/button-active-outline-on-panel-bg anti-glare-light   ratio=1.3806  threshold=3
  site/button-active-outline-on-panel-bg high-contrast      ratio=1.0000  threshold=3
  site/button-active-outline-on-panel-bg deuteranomaly      ratio=1.1280  threshold=3
  site/button-active-outline-on-panel-bg deuteranopia       ratio=1.1800  threshold=3
  site/button-active-outline-on-panel-bg protanomaly        ratio=1.1280  threshold=3
  site/button-active-outline-on-panel-bg protanopia         ratio=1.1800  threshold=3
  site/button-active-outline-on-panel-bg tritanomaly        ratio=1.0241  threshold=3
  site/button-active-outline-on-panel-bg tritanopia         ratio=1.0579  threshold=3
  site/button-active-outline-on-panel-bg achromatopsia      ratio=1.2069  threshold=3
  ```

- 7 waivers `preexisting: true` ajoutés dans `contrast-pairs.ts`, chacun
  avec le ratio mesuré par thème et une raison factuelle (valeurs
  hexadécimales/HSL vérifiées via `getVar`, aucune couleur corrigée) :
  - **`role/fg-on-accent-on-accent`** et **`site/header-text-on-header-bg`**
    (même paire de variables) : `--accent` reste volontairement fixe
    (`#fcd34d`) entre les thèmes clair et sombre, mais `--fg-on-accent`
    s'inverse avec le reste des rôles de texte (`#0c0a09` en clair,
    `#e7e5e4` en sombre) — texte clair sur fond resté clair en
    `dark`/`anti-glare-dark`.
  - **`site/header-text-role-on-header-bg`** et
    **`site/header-blog-link-text-on-bg`** : même paire de couleurs
    résolues (`--fg-muted` inversé ≈ `#fafaf9` en sombre / `--accent`
    fixe `#fcd34d`), fg et bg simplement échangés entre les deux paires —
    d'où les ratios identiques.
  - **`role/success-on-bg-base`** : `emerald-600` choisi pour sa
    reconnaissabilité sémantique, pas pour son contraste sur `--bg-base` ;
    `--success` n'est consommé par aucun composant actuellement (vérifié
    par grep, aucun `var(--success)` dans `src/`).
  - **`role/danger-on-bg-base`** : `red-600` passe 4.5:1 sur `--bg-base`
    dans la plupart des thèmes, mais les couleurs de substitution des
    moteurs daltoniens (ex. `#ffcc00` en deutéranopie/protanopie, choisies
    pour la distinguabilité perceptuelle, pas le contraste) tombent bien
    en dessous ; `--danger` n'est consommé par aucun composant
    actuellement. Candidat pour
    [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md).
  - **`site/button-active-outline-on-panel-bg`** : en `high-contrast`,
    `--color-button-active-outline` (= `--accent`) et `--color-panel-bg`
    (= `--bg-base`) résolvent tous deux à `#000000` — ratio exactement
    1:1, contour totalement invisible sur son fond. Dans les autres
    thèmes clairs, `--accent` (ambre clair) sur `--bg-base` (quasi blanc)
    est structurellement sous le seuil non-texte de 3:1 ; les thèmes
    sombres passent car `--bg-base` y devient sombre. Un rôle plus
    contrasté (`--accent-strong`) existe déjà mais n'est pas câblé sur ce
    token.
- Suite complète re-exécutée après ajout des waivers : **498/498 tests
  verts** (incluant la garde anti-zombie). Nettoyage du script de mesure
  temporaire `__scratch_inventory.ts` (non livrable, jamais commité).
- Vérifié : `pnpm test` (565 tests, 14 suites) vert, `pnpm lint` vert,
  `pnpm exec tsc --noEmit` vert, CSS compilé strictement identique à la
  baseline de phase 0 (`diff` vide, hors commentaire `sourceMappingURL`
  absent dans les deux avec `--no-source-map`).

### Added (chantier E1 — tests de contrastes, phase 2)

- Phase 2 de [PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md) :
  `src/accessibility/contrast/contrast-pairs.ts`, le registre des paires
  fg/bg (source de vérité, extensible, jamais amputé — un échec devient un
  waiver en phase 3, pas une suppression).
  - 19 paires **niveau rôles** (partiront dans le paquet, README § 6.1) et
    21 paires **niveau site** (couche 3, propre au portfolio), reprises
    telles quelles des tables du plan. `--color-tooltip-text` déclare
    `composeOver: "--bg-base"` (son fond porte un alpha).
  - `@types/culori` ajouté (types manquants du paquet `culori`).
  - Vérifié : `pnpm lint` et `pnpm exec tsc --noEmit` verts.

### Added (chantier E1 — tests de contrastes, phase 1)

- Phase 1 de [PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md) : mise en
  place des utilitaires du système de tests de contrastes WCAG (branche
  `feat/contrast-tests`, chantier additif — aucun fichier de `src/styles/`
  modifié, CSS compilé byte-identique).
  - Dépendances dev ajoutées : `culori` (parsing/conversion de couleurs),
    `postcss` (parsing structuré du CSS compilé), `tsx` (exécution du futur
    générateur de rapport, phase 4).
  - `src/accessibility/contrast/wcag.ts` : `toRgb()` (erreur explicite sur
    couleur invalide, jamais de repli silencieux), `compositeOver()`
    (composition alpha standard sRGB), `contrastRatio()` (délègue à
    `culori.wcagContrast`, à appeler après composition), `thresholdFor()`
    (seuils WCAG 2.2 : `text` 4.5, `large-text`/`non-text` 3.0).
  - `src/accessibility/contrast/extract-themes.ts` : compile
    `src/styles/main.scss` via l'API JS de `sass` (mémoïsé), parse le CSS
    avec `postcss`, extrait les custom properties de chacun des 12 blocs
    `[data-theme="X"]` (sélecteur exact, pas les descendants comme
    `[data-theme="dark"] .header__title-name`) ainsi que de `:root`. Erreur
    explicite si un thème de `src/config/themes.ts` (source unique) est
    absent du CSS compilé.
  - **Bug détecté et corrigé pendant l'écriture des tests** : `:root`
    contient *deux* règles distinctes dans le CSS compilé — celle du
    système de thèmes (~94 propriétés) et une autre, sans rapport, de
    `_scroll-progress.scss` (`--scroll-progress-link-default`). La première
    version de l'extraction ne gardait que la dernière rencontrée, perdant
    silencieusement les valeurs de thème. Corrigé en fusionnant toutes les
    règles `:root` (comme le ferait la cascade CSS), et le test de
    cohérence adapté en conséquence (vérifie que les propriétés de thème de
    `:root` concordent avec `[data-theme="light"]`, sans exiger que `:root`
    ne contienne *que* des tokens de thème).
  - Tests unitaires : `wcag.test.ts` (valeurs de référence connues :
    noir/blanc = 21:1, `#767676`/blanc ≈ 4.54:1, composition
    `rgba(0,0,0,0.5)` sur blanc ≈ `#808080`), `extract-themes.test.ts` (les
    12 thèmes présents, cohérence `:root`, erreurs explicites sur
    thème/propriété inconnus).
  - Vérifié : `pnpm test` vert (83 tests, 13 suites), `pnpm lint` vert, CSS
    compilé strictement identique à la baseline de phase 0.

## 2026-07-03

### Docs (plan de la refonte daltonienne + carte des documents)

- Création de [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md) :
  remap de familles Tailwind à poids constant (résolution en 3 étapes :
  table de familles → `special-colors` → repli OKLCH), anomalies par
  mélange perceptuel `color.mix(…, oklch)` avec `severity` configurable,
  tests de distinguabilité par simulation CVD (matrices Machado, ΔE
  CIEDE2000, seuil de calibration ≥ 20) livrés **avant** la bascule des
  thèmes, tables par défaut proposées comme points de calibration
  (validation Simon + tests), purge des anciens chemins (fenêtres de
  teinte HSL). Prérequis bloquant : E1 mergé ; E2 recommandé avant.
- Ajout d'une **carte des documents** en tête du README (rôle et statut de
  chaque document, principe « un chantier = un plan = une branche = une
  exécution par IA »).

### Docs (plan des tests de contrastes)

- Création de [PLAN-tests-contrastes.md](./PLAN-tests-contrastes.md)
  (chantier E1, pour IA exécutante) : implantation dans
  `src/accessibility/contrast/`, utilitaires WCAG (culori, composition
  alpha), extraction des 12 blocs `[data-theme]` du CSS compilé (postcss),
  registre initial de ~40 paires (rôles + couche 3 du site), suite Jest
  avec mécanisme de waivers anti-zombies (un waiver dont le ratio devient
  conforme fait échouer le test), rapport matrice généré et commité
  (`CONTRAST-REPORT.md`) avec test de fraîcheur. Chantier purement
  additif : aucun fichier de `src/styles/` modifié, les échecs
  préexistants sont inventoriés en waivers pour arbitrage de Simon.

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
