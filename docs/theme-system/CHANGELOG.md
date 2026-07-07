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

## 2026-07-07

### Changed (chantier E3 exécuté — workspace pnpm + extraction SCSS)

Branche `feat/e3-monorepo` (6 commits, un par phase — **revue avant
merge**). Exécuté par Claude sur feu vert de Simon. **Zéro changement
visuel** : CSS identique à la baseline, modulo une déviation mesurée et
documentée (voir plus bas).

- **Phase 1** : `pnpm-workspace.yaml` + `packages/a11y-prefs/` (nom de
  travail, privé, lié via `"a11y-prefs": "workspace:*"`). Résolution
  `@use "a11y-prefs/scss/…"` prouvée par sonde sur les trois canaux
  (CLI `--load-path`, Next `sassOptions.includePaths`, extract-themes
  `loadPaths`) **avant** tout déménagement.
- **Phase 2 — inversion de dépendance** : les 9 moteurs
  `transform-light-to-*` et l'anti-glare s'arrêtent désormais à
  `apply-roles()` ; chacun des 11 fichiers de thèmes appelle
  `apply-theme-variables` lui-même après son transform (ordre d'exécution
  inchangé → byte-identique). Purge d'une écriture morte trouvée au
  passage : le bloc « ajustements par mode » de l'anti-glare assignait
  `$color-collapse-border`, jeton supprimé au nettoyage du 2026-07-07.
- **Phase 3** : `git mv` de `_base-palette`, `_theme-utils`,
  `_anti-glare-functions` vers `packages/a11y-prefs/scss/` ;
  `_index.scss` public ; 16 consommateurs re-câblés.
- **Phase 4 — scission de l'état** : `packages/a11y-prefs/scss/_state.scss`
  possède couches 1+2 (rail, alias, primitives, rôles,
  `define-base-colors`, `apply-roles`) ; le `_theme-variables.scss` du
  portfolio ne garde que ses ~70 tokens de couche 3 +
  `apply-theme-variables`. Plus aucun `@use` du paquet vers `src/`.
  Purge des 4 écritures couche 3 mortes du moteur achromatopsie
  (`$color-link`, `$color-focus-*` — écrasées par apply-theme-variables
  depuis les fondations).
- **Phase 5 — configuration** : `$gray-family` + map `$primitives` en
  `!default` dans le paquet ; `main.scss` porte le `with()` du portfolio
  (premier chargement du module state). Vérifié vivant : une config
  alternative (`slate`) produit bien un rail slate.
- **Déviation mesurée de l'oracle byte-identique** : les pragmas prettier
  `/** @format */` placés avant les `@use` sont ré-émis **une fois par
  importeur** (règle établie empiriquement par marqueurs-sondes) ; la
  réorganisation des imports change leur nombre (80 → 68, moins de spam).
  Diff normalisé (pragmas exclus) : **byte-identique** à chaque phase.
  Zéro changement de valeur ou de règle.
- 589 tests, lint, tsc, build Next et `contrast:report` verts à chaque
  phase.

### Docs (plan E3 rédigé — extraction monorepo)

- **[PLAN-extraction-monorepo.md](./PLAN-extraction-monorepo.md) créé**
  (feu vert de Simon pour lancer l'extraction E3→E7). 6 phases, branche
  `feat/e3-monorepo`, **oracle CSS byte-identique de bout en bout** (un
  déménagement, pas une refonte). Points structurants : workspace pnpm +
  paquet `packages/a11y-prefs` (nom de travail, décision finale = Simon en
  E7) ; sonde de résolution Sass avant tout déplacement (`includePaths`
  Next + `loadPaths` extract-themes + CLI) ; **phase 2 = inversion de
  dépendance** (les moteurs s'arrêtent à `apply-roles()`, la couche 3 est
  dérivée par les fichiers de thèmes du consommateur) ; scission de l'état
  (rail/primitives/rôles → paquet, ~70 tokens couche 3 → portfolio) ;
  configuration `with()` minimale (`$gray-family` + primitives), registre
  complet reporté. Hors périmètre : runtime React (E4), modules (E5), CLI
  (E6), publication (E7), suite de contrastes (reste côté portfolio).

### Changed (`--success` → emerald-700, toast de succès du contact câblé)

Décision de Simon (« emerald-700 ») en réponse à la question ouverte du
nettoyage : le toast de succès du formulaire contact devait être vert.

- **Rôle `--success` : emerald-600 → emerald-700** (`#047857`, 5.25:1 sur
  `bg-base` en light — emerald-600 était sous le seuil texte depuis
  l'origine, 3.61:1). Effets par thème : light/tritan 5.25, anti-glare-light
  4.56, dark 9.75 (vert pâle décalé), ancres CVD rouge-vertes inchangées
  (résolues indépendamment), achromatopsie inchangée (même gris quantifié,
  2.42 — seule entrée restante du waiver), high-contrast inchangé.
- **Toast `[data-type="success"]` du contact : `color: var(--success)`** —
  premier consommateur du rôle, garanti par la paire
  `role/success-on-bg-base` dans les 12 thèmes. **Changement visuel** : le
  message de succès du formulaire s'affiche désormais en vert (au lieu de
  la couleur de texte héritée).
- Waiver `role/success-on-bg-base` réduit à la seule achromatopsie
  (anti-zombie : 4 entrées levées). 589 tests, build/lint/tsc verts,
  rapport régénéré.

### Removed (nettoyage jetons morts + variables fantômes — suites de l'audit)

Branche `chore/theme-token-cleanup`, mandat de Simon (« tout sauf E3 »).
**Rendu strictement inchangé** : uniquement des déclarations inertes et des
jetons jamais consommés. Vérifié : diff CSS = 79 suppressions + 3
réécritures équivalentes (fallbacks), re-scan émis/consommés à zéro des
deux côtés, 589 tests (la paire hero retirée = −12), build/lint/tsc verts.

- **5 déclarations fantômes retirées** (elles référençaient des custom
  properties jamais émises → déjà sans effet, la couleur héritée
  s'appliquait) : `_privacy-policy.scss` (`--color-bg-light`),
  `_accessibility-menu.scss` (`--color-button-bg`, `--color-button-text`,
  `--color-text`), `_contact.scss` (`--color-success` — voir la question
  « toast vert » au [TODO.md](./TODO.md)), `_skills.scss`
  (`--color-text-secondary`). 3 fallbacks simplifiés en leur valeur
  effective (`--color-divider`→`--gray-400`, `--color-input-bg`→
  `--off-white`, `--color-text-secondary`→`--gray-700`).
- **5 jetons émis jamais consommés supprimés** (défs, assignations,
  émissions) : `--color-hero-bg`, `--color-hero-text` (+ leur paire
  `site/hero-text-on-hero-bg` du registre — retirée parce que les jetons
  n'existent plus, pas pour masquer un échec ; le héros s'affiche sur
  `--color-main-bg`), `--color-collapse-border`,
  `--color-section-even-card-bg`, `--constant-success-color` (à recréer si
  le toast de succès redevient vert).

### Docs (relecture complète post-merges + audit émis/consommés)

- **Relecture générale** demandée par Simon (docs + code) après le merge de
  role-corrections (`a97d699`). Verdict code : sain (moteurs, runtime,
  suites). Statuts périmés corrigés dans les docs :
  - carte des documents du README (P2/P3 daltoniennes : mergées `5c8dce9`,
    plus « validation requise ») ; idem en-têtes du plan daltonien et
    mentions du guide § E2 ;
  - README § 2 : méthodes de génération des 12 thèmes mises à jour
    (ancres statut, remap tritan, OKLCH anti-glare — les descriptions
    dataient d'avant les refontes) ;
  - README § 3 : ligne `_anti-glare-functions.scss` (OKLCH, overlay
    supprimé) ; carte : CONTRAST-REPORT = 39 paires WCAG + 5 ΔE ;
  - README § 7 « Qualité perceptive » : 3 pistes marquées faites (tests de
    contrastes = E1, exposition `--success`/`--danger`, OKLCH) — reste
    `prefers-contrast`/`forced-colors`.
- **Audit émis/consommés** (nouveau, scan du CSS compilé vs `var()` du
  code) : 5 variables fantômes consommées mais jamais émises (couleur en
  héritage — antérieures à la référence `918526f`) et 5 jetons émis jamais
  consommés. Consignés dans [TODO.md](./TODO.md) (micro-chantier + arbitrage
  Simon), aucun changement de code dans cette entrée.

### Fixed (lien blog — restauration du design d'origine de Simon)

Après deux corrections insuffisantes (recâblage `fg-on-emphasis` = lien
blanc en light, rejeté « extrêmement moche » ; puis amber-en-light seulement,
toujours faux en dark), l'intention réelle a été clarifiée par Simon et
**vérifiée par compilation de la version pré-chantiers** (`4bf78f0`) :

- **Découverte importante** : le chip quasi-blanc du lien blog en dark est
  un **défaut antérieur à tous les chantiers 2026-07** — la version
  pré-fondations compilait déjà `--color-header-blog-link-bg: #fafaf9` en
  dark (l'automatisation light→dark inversait le gris du chip), la rustine
  `_dark.scss` ne noircissait que le texte, et ce rendu erroné est parti en
  production. Le design voulu : **chip grisé + texte amber dans les deux
  modes**, comme en light.
- **Correctif** : `--color-header-blog-link-bg` par luminance —
  `bg-emphasis` du thème s'il est sombre (light, daltoniens, achromatopsie :
  inchangés), sinon `stone-700` constant (thèmes dark : même grisé qu'en
  light) ; `--color-header-blog-link-text: $accent` (amber partout, décliné
  par thème : orange-300 en tritanopie, etc.). Hover : `--off-white` →
  `--constant-off-white` dans `_header.scss` (l'inversion du rail aurait
  rendu le hover gris-sur-gris en dark). Le logo LostInTab retrouve son
  fond grisé. High-contrast intact (surcharges propres).
- **Résultat** : light et dark identiques (`#44403c` + `#fcd34d`, 7.12:1),
  paire verte dans les 12 thèmes (6.09–19.56) sans waiver, aucune rustine.
  601 tests, build/lint/tsc verts.
- **Sous-titre** : conservé en gris atténué (validé par Simon — cohérent
  avec l'aspect atténué du light).
- Leçons : (1) les arbitrages visuels doivent être présentés en rendu
  concret avant/après par thème, jamais en termes de câblage ; (2) « le
  rendu actuel » n'est pas une référence fiable — le design de référence est
  celui de Simon, à lui faire confirmer quand un doute existe (ici le rendu
  déployé était lui-même déjà cassé).

### Changed (chantier « corrections de rôles » — partie 2/2, décisions de Simon)

Même branche `refactor/theme-role-corrections` (2ᵉ commit). Les deux
décisions visuelles ont été tranchées par Simon : sous-titre « gris
atténué », lien blog « suit son chip ».

- **Sous-titre du header** (`--color-header-text-role`) : ancré à un gris
  atténué **fixe** choisi par luminance (même logique que `fg-on-accent` :
  accent sombre → `$fg-muted` du thème ; accent clair → le `gray-700` du
  thème s'il est sombre, sinon `stone-700` constant). **Changement visuel :
  en dark/anti-glare-dark uniquement**, le sous-titre passe de near-black
  (rustine) à `stone-700` (gris atténué, 7.12:1 sur l'accent). Light,
  daltoniens, achromatopsie (garde son `neutral-700`), high-contrast
  (surcharges propres dans `_high-contrast.scss`) : inchangés.
- **Lien blog** (`--color-header-blog-link-text`) : recâblé de `$accent`
  vers **`$fg-on-emphasis`** — le texte suit son chip (`bg-emphasis`), et la
  paire `fg-on-emphasis`/`bg-emphasis` est déjà garantie par la suite dans
  les 12 thèmes. **Changement visuel : en light et thèmes clairs**, le lien
  passe d'amber à near-white sur le chip sombre ; **en dark**, near-black →
  `#44403c` sur chip clair (9.84:1), quasi identique à l'ancienne rustine.
- **Toutes les rustines `.header` de `_dark.scss` supprimées** — le header
  est correct par construction dans les 12 thèmes.
- **Les 2 derniers waivers header levés** (anti-zombie :
  `site/header-text-role-on-header-bg` 1.38 → 7.12,
  `site/header-blog-link-text-on-bg` 1.38 → 9.84). Avec la partie 1/2, le
  chantier supprime au total **4 waivers + la paire du jeton mort** ; les
  paires restent dans le registre, désormais conformes sans exception.

### Fixed / Removed (chantier « corrections de rôles » — partie 1/2)

Branche `refactor/theme-role-corrections` (non mergée — validation visuelle
de Simon requise, mais **changement visuel nul** attendu). Deux des trois
symptômes du micro-chantier traités ; deux décisions restent (voir
[TODO.md](./TODO.md)).

- **Removed — jeton mort `--color-button-active-outline`** : émis mais
  consommé par aucun composant (`var(--color-button-active-outline)`
  introuvable). Retiré des 3 points SCSS + de son émission + de sa paire de
  contraste `site/button-active-outline-on-panel-bg` (qui était le pire
  waiver, 1.00:1 en high-contrast). Suppression parce que le jeton n'existe
  plus, pas pour masquer un échec.
- **Fixed — titre du header clair-sur-clair en dark** : `--fg-on-accent`
  suivait le rail (`$gray-950`), qui s'inverse en dark → texte quasi-blanc
  sur l'accent amber figé (~1.15:1), masqué par des rustines `.header`
  codées en dur dans `_dark.scss`. Désormais choisi **par luminance** :
  accent sombre (high-contrast) → encre claire ; accent clair → le
  `gray-950` du thème s'il est sombre (light/daltoniens/achromatopsie :
  inchangés), sinon (thèmes dark) une near-black constante. `is-dark()`
  déplacée dans `_base-palette.scss` pour être accessible à `apply-roles`.
  Rustines `name`/`separator` retirées ; waivers `role/fg-on-accent-on-accent`
  et `site/header-text-on-header-bg` obsolètes (13.70:1 en dark) → retirés
  par l'anti-zombie. Diff CSS = jeton mort (12 thèmes) + `--color-header-text`
  dark/anti-glare-dark passant de near-blanc à `#0c0a09` (identique au rendu
  masqué → **invisible**). 601 tests, build/lint/tsc verts.
- **Restant (décisions visuelles)** : le **sous-titre** du header
  (`--color-header-text-role = fg-muted`, gris atténué en light) et le
  **lien blog** (`--color-header-blog-link-text = accent` amber) — toujours
  waivés, rustines conservées. Cf. TODO.md.

## 2026-07-06

### Changed (chantier E2 — refonte daltonienne, partie 3 exécutée)

Robustesse du moteur daltonien, branche `refactor/theme-cvd-degradation`
(5 commits, non mergée — **validation visuelle de Simon requise avant
merge**, thème `tritanomaly`). Exécutée par Claude (Opus).

- **Phase 1 — garde anti-gamut** (`gamut.test.ts`, `gamut.ts`, additif) :
  scanne chaque custom property de couleur des 12 thèmes (+ `:root`) dans le
  CSS compilé et échoue si une valeur sort du gamut sRGB (hsl s/l hors
  [0,100], canal rgb hors [0,255]). Détection sur la **chaîne brute** :
  culori clampe ces valeurs au parsing, donc son `inGamut` ne les voit pas.
  Premier run = inventaire : **11 déclarations hors gamut** en `tritanomaly`
  (3 primitives racines + 8 tokens dérivés), waivées (anti-zombie). CSS
  byte-identique.
- **Phase 2 — dégradation gracieuse** (`_theme-utils.scss`) :
  `resolve-anchor-weight` ne fait plus d'`@error` (échec dur du build) si
  aucun poids n'atteint la cible — il renvoie le cran au plus fort contraste
  (« meilleur effort ») et `@warn` (message distinct sous le plancher de
  lisibilité `$status-legibility-floor`, défaut 3:1). Cible de contraste
  paramétrable (défaut 4.5). Chemin latent pour le portfolio → CSS
  byte-identique ; test unitaire via sondes Sass compilées (nominal +
  absence d'échec dur). **Déviation assumée** : pas de chemin « couleur
  calculée hors palette » — mesuré quasi inutile (le contraste est dominé
  par la lightness, la palette couvre déjà 50→950 ; si aucun cran ne passe,
  le fond est de lightness moyenne, cas où aucune teinte ne passe non plus).
  Le motif réel pour sortir de la palette (distinguabilité) n'étant pas
  calculable en Sass, son recours reste `special-colors`.
- **Phase 3 — correction du gamut tritan** (`_theme-utils.scss`) : helper
  `gamut-map-srgb` (built-in Dart Sass 1.101 `color.to-gamut(..., $method:
  local-minde)` — réduction de chroma standard CSS Color 4, teinte
  préservée) appliqué à la sortie du mélange `severity` et, défensivement,
  au repli OKLCH. Court-circuit si déjà in-gamut → **pas de re-sérialisation
  parasite** (les couleurs valides des autres thèmes restent identiques).
  Les 11 valeurs `tritanomaly` repassent in-gamut ; waivers de phase 1
  retirés (anti-zombie). **Écart perceptuel négligeable** : ΔE 0.15 / 0.92 /
  0.41 entre le rendu clampé d'avant et le gamut-mapping. Diff CSS confiné à
  `[data-theme="tritanomaly"]` (11 propriétés).
- **Phases 4-5 — vérifications, docs, finalisation** : garde anti-gamut à
  zéro waiver sur les 12 thèmes ; suites contraste/distinguabilité
  inchangées ; `CONTRAST-REPORT.md` régénéré (léger ajustement des ratios
  liés à l'accent en `tritanomaly`, ΔE < 1) ; politique de palette par
  classe documentée (README § 6.1, guide § E2). Build/lint/test/tsc verts.

**Point restant pour Simon** : validation visuelle de `tritanomaly` (le
virage de couleur est imperceptible, ΔE < 1 — le navigateur affichait déjà
la version clampée) ; arbitrage du plancher de lisibilité (3:1).

### Docs (décision de conception — ancres sémantiques pour les rôles statut)

- **Décision actée par Simon** à la suite de l'arbitrage
  `role/success-on-bg-base` (1.60:1 en deutér/protanopie, remonté par la
  refonte daltonienne) : les rôles **statut** — `--success` et
  `--danger`, plus `--warning` et `--info` réservés pour l'extension
  future de l'API — forment une classe à part dans le moteur daltonien.
  Leur sémantique étant quasi universelle d'un projet à l'autre, le
  paquet embarquera des **ancres de teinte par type de CVD**
  (rouge-vert : success → bleu, danger → orange ; tritanopie :
  rouge/vert conservés), résolues dans la palette du projet avec un
  **poids auto-calculé** par la contrainte de contraste WCAG — les deux
  contraintes (distinguabilité/contraste) sont ainsi découplées, là où
  le décalage de poids fixe des tables les faisait s'affronter. Les
  seuils ΔE de la suite de distinguabilité deviendront **par classe de
  paire** (`success`/`danger` critique, `link`/statut réduit — WCAG
  1.4.1 couvrant déjà les liens par le soulignement) ; valeurs à
  arbitrer par Simon au moment du plan d'exécution.
- Conception détaillée :
  [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) § E2 ;
  résumé dans le README § 6.1. Aucun changement de code ni de CSS —
  futur plan d'exécution dédié.
- Statuts mis à jour dans le README (carte des documents) et le guide :
  chantier E2 (moteurs + refonte daltonienne) mergé dans `main` le
  2026-07-05 (`d12264f`) après validation visuelle de Simon et revue
  indépendante.
- **Plan d'exécution rédigé** :
  [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md)
  restructuré en deux parties — partie 1 (remap de familles, exécutée et
  mergée) conservée pour référence ; **partie 2 « ancres sémantiques pour
  les rôles statut »** ajoutée (6 phases, branche
  `refactor/theme-status-anchors`). Points de départ mesurés contre le
  CSS compilé de main + simulation Machado : `success → violet` (poids
  auto attendu violet-600, 5.46:1, ΔE success/link 18.0 — sky écarté car
  occupé par le lien, sky-700 ne serait qu'à ΔE 9.4) ; `danger → orange`
  (poids auto attendu orange-700, 4.96:1). Seuils ΔE par classe de paire
  proposés (20 critiques / 12 paires lien, arbitrage Simon en phase 1) ;
  poids des anomalies résolu sur le mélange `severity` (leçon des
  waivers à 2.33). Thèmes tritan explicitement inchangés.

### Changed (chantier E2 — refonte daltonienne, partie 2 exécutée)

Ancres sémantiques pour les rôles statut implémentées sur la branche
`refactor/theme-status-anchors` (5 commits, non mergée — **validation
visuelle de Simon requise avant merge**). Exécutée par Claude (Opus),
pas par l'IA d'exécution habituelle, à la demande de Simon.

- **Phase 1 — seuils ΔE par classe de paire** (`contrast-pairs.ts`) : les
  deux paires « lien » (`link-vs-success`, `link-vs-fg-base`) passent à
  ΔE ≥ 12 ; les paires critiques (`success/danger`, `accent/statut`)
  restent à 20. Justification WCAG 2.2 SC 1.4.1 : un lien n'est jamais
  porté par la couleur seule (souligné ici). Le waiver achromatopsie de
  `link-vs-fg-base` (16.00) devient caduc sous 12 et est retiré. CSS
  byte-identique.
- **Phase 2 — moteur** (`_theme-utils.scss`) : ajout des fonctions WCAG
  Sass (`wcag-relative-luminance`, `wcag-contrast-ratio`, alignées culori :
  seuil 0.04045, gamma 2.4) et de `resolve-status-color` /
  `resolve-anchor-weight` (choisit dans la famille d'ancre le premier cran
  Tailwind atteignant 4.5:1 sur le fond). Les 6 mixins CVD routent
  `success`/`danger` par ce résolveur. CSS byte-identique (aucune config
  n'a encore d'ancre).
- **Phase 3 — bascule des 4 thèmes rouge-verts** :
  - -opie (deutéranopie, protanopie) : `success → violet-600` (5.46:1),
    `danger → orange-700` (4.96:1). `violet` et non `sky` car `--link`
    occupe déjà sky-900 ; violet est perçu bleu sous CVD rouge-verte.
  - -omalie (déficience légère) : teintes naturelles conservées, poids
    corrigé seulement — `success → emerald-700` (5.25:1),
    `danger → redd-600` (4.62:1).
  - **Déviation mesurée du plan** : le plan résolvait le poids des -omalies
    sur le *mélange severity* (ancre mixée à 50 % avec l'origine). Mesuré,
    ce mélange OKLCH entre deux teintes quasi complémentaires (emerald +
    violet) **sort du gamut sRGB** — Sass l'a sérialisé
    `hsl(194, 257%, 19%)`, invalide et hors palette (viole la contrainte
    « rester dans la palette »). Le résolveur renvoie donc une couleur
    Tailwind **pure**, sans mélange ; la douceur des -omalies vient du
    choix d'ancre (familles naturelles emerald/redd) et non d'un mélange.
    Toutes les valeurs émises sont des couleurs Tailwind propres, in-gamut.
  - Diff CSS strictement confiné à `--success`/`--danger` des 4 blocs
    rouge-verts ; tritan et achromatopsie **byte-identiques** (vérifié).
- **Phase 4 — vérifications** :
  - **Contraste** : `role/success-on-bg-base` perd ses 4 entries
    rouge-vertes (1.60/2.33 → 5.25–5.46, désormais conformes) ; le
    mécanisme anti-zombie a forcé leur retrait. Restent waivés : light
    (3.61), anti-glare-light (3.13), tritan (3.61) et achromatopsie (2.42),
    tous hors périmètre. `role/danger-on-bg-base` : tous les thèmes CVD
    conformes, seul anti-glare-light reste waivé (3.94).
  - **Cohérence Sass/TypeScript** : ratios de `wcag-contrast-ratio` (Sass)
    comparés à culori — correspondance exacte à 4+ décimales (violet-600
    5.4562, orange-700 4.9582, emerald-700 5.2507, redd-600 4.6240).
  - **Distinguabilité — ΔE avant (partie 1) → après (partie 2)** sous
    simulation Machado :

    | Thème | success/danger | link/success | accent/success |
    | --- | --- | --- | --- |
    | deutéranopie | 53.2 → 62.7 | 49.0 → **18.2** | 50.5 → 74.9 |
    | deutéranomalie | 43.2 → 38.6 | 40.3 → 30.7 | 41.8 → 44.3 |
    | protanopie | 56.4 → 59.4 | 47.1 → **19.0** | 47.6 → 73.5 |
    | protanomalie | 45.7 → 41.3 | 42.1 → 32.3 | 38.2 → 41.0 |

    Toutes les paires restent au-dessus de leur seuil (20 critiques,
    12 lien). La seule qui se resserre nettement est `link/success` en
    -opie (≈ 18-19) : violet est plus proche du lien sky-900 que ne
    l'était sky-300 en partie 1 — coût assumé, couvert par le seuil 12
    (liens soulignés, WCAG 1.4.1). `CONTRAST-REPORT.md` régénéré.
- **Bilan** : le défaut d'origine (`--success` à 1.60:1) est résolu par
  conception ; les rôles statut sont désormais une classe traitée par
  ancres sémantiques, garantie de contraste ≥ 4.5:1 par construction.
  609 tests, lint, `tsc`, `build` verts.

**Point restant pour Simon** : validation visuelle des 4 thèmes
rouge-verts (virage violet de `--success` en -opie surtout) avant merge.
`--success`/`--danger` n'étant consommés par aucun composant du portfolio
aujourd'hui, l'effet visuel se voit surtout via le panneau d'accessibilité
et les futurs usages ; le vrai bénéfice est pour les consommateurs du
paquet qui, eux, câbleront ces rôles.

### Docs (partie 3 du plan daltonien rédigée)

- [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md) reçoit une
  **partie 3 « robustesse »** (6 phases, branche
  `refactor/theme-cvd-degradation`, à exécuter), issue de trois constats
  des parties 1-2 : (1) **alerter plutôt que bloquer** — remplacer le
  `@error` de `resolve-anchor-weight` par un meilleur effort + `@warn`,
  prioriser la distinguabilité au-dessus d'un plancher de lisibilité
  (défaut 3:1, arbitrage Simon) ; (2) **échelle de dégradation par classe**
  — -omalie strictement in-palette, -opie autorisée à une couleur in-gamut
  hors palette en recours (jamais hors gamut) ; (3) **garde anti-gamut
  mécanique** (test scannant le CSS compilé) + **correction du gamut
  tritan** — mesuré ce jour : le blend `severity` `amber → orange` de la
  partie 1 produit **11 déclarations hors gamut** dans `tritanomaly`
  (`--accent` `hsl(38, 100.8%, 69%)` etc.), à ramener in-gamut par
  réduction de chroma OKLCH. Précision de conception inscrite au plan : le
  moteur Sass ne pilote sa dégradation que par le **contraste**
  (calculable) ; la **distinguabilité** reste vérifiée par la suite
  TypeScript, la collision se corrigeant via `special-colors`.

## 2026-07-04

### Docs (chantier E2 (refonte daltonienne), phase 5 — finalisation)

- Phase 5 (dernière) de
  [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md).
  `pnpm build`/`lint`/`test` (609 tests, 17 suites) verts ; diff CSS
  cumulé toujours confiné aux 6 blocs `[data-theme]` daltoniens.
- **Correction d'étiquetage** : les entrées de phases 1 à 4 de ce
  chantier référencent « chantier E3 » — une erreur de ma part, pas du
  plan. [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) n'a
  que E1/E2/E3(monorepo)/E4-E7 ; la refonte daltonienne fait partie
  d'**E2** (« Revue des moteurs anti-glare / daltoniens »), la même
  ombrelle que [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md).
  Corrigé partout (docs et commentaires source, y compris dans les
  entrées de phases 1 à 4 ci-dessous) en « chantier E2 (refonte
  daltonienne) » pour lever l'ambiguïté avec l'autre plan, également
  E2 — par un nouveau commit qui modifie le texte, sans toucher aux
  commits déjà faits (aucune réécriture d'historique Git).
- Docs mises à jour : README § 4.3 (moteurs daltoniens et
  anti-éblouissement tous deux réécrits, description de
  `remap-for-cvd()` à 4 cas), § 5 point 10 (le point daltonien n'est
  plus implicite — testé mécaniquement), « Carte des documents »
  (PLAN-refonte-daltonienne.md marqué exécuté), guide E2 (résultat
  détaillé de la refonte,
  résumé des chiffres clés).
- **Rapport final pour arbitrage de Simon** :
  - 5 commits sur `refactor/theme-cvd-remap` (code aux phases 1-3 ; la
    4 et cette phase 5 sont documentation pure), diff CSS confiné aux 6
    thèmes daltoniens.
  - Waivers retirés : `role/danger-on-bg-base` (6 → 1 thème restant,
    seul `anti-glare-light` — sans rapport avec le remap CVD) ;
    `distinguish/success-vs-danger` (retiré entièrement).
  - Waiver dégradé, point d'arbitrage explicite : `role/success-on-bg-base`
    régresse en contraste WCAG dans 4 thèmes rouge-vert (jusqu'à
    1.60:1, contre 3.13-4.03:1 avant) — la calibration du remap
    `emerald → sky` a priorisé la distinguabilité CVD
    (`distinguish/link-vs-success`, qui aurait autrement chuté jusqu'à
    ΔE 4.6) au détriment du contraste déjà non conforme de ce rôle.
    Aucun impact utilisateur réel aujourd'hui (`--success` inutilisé) ;
    décisions possibles pour Simon : accepter le compromis tel quel,
    introduire un rôle `success-strong` distinct pour un futur usage en
    texte, ou recalibrer une troisième fois avec un poids intermédiaire.
  - Bug Sass documenté et corrigé (clés de map non quotées `orange`/
    `violet` interprétées comme couleurs) — vigilance à garder pour
    toute future famille nommée d'après une couleur CSS reconnue.
  - Validation visuelle automatisée faite (captures Chromium headless
    des 6 thèmes + panneau d'accessibilité) ; **validation visuelle
    humaine de Simon requise avant tout merge**, en particulier sur le
    virage orange du header en tritanopie/tritanomalie et le virage
    violet des liens dans les mêmes thèmes.

### Docs (chantier E2 (refonte daltonienne), phase 4 — vérifications et arbitrages)

- Phase 4 de [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md).
  Les deux premiers points du plan (suite de contrastes redevenue verte,
  waivers obsolètes retirés) ont dû être traités **dès la phase 3** pour
  garder `pnpm test` vert à chaque commit (discipline du chantier) ; ce
  qui reste propre à la phase 4 :
- **Tableau ΔE avant/après** (avant = inventaire de la phase 1, avant
  toute bascule ; après = mesuré une fois les 6 thèmes branchés sur
  `remap-for-cvd`, phase 3 complète) :

  | Paire | Thème | Avant | Après |
  | --- | --- | --- | --- |
  | success/danger | deuteranomaly | 40.01 | 43.17 |
  | success/danger | deuteranopia | 74.28 | 53.18 |
  | success/danger | protanomaly | 41.55 | 45.68 |
  | success/danger | protanopia | 66.05 | 56.41 |
  | success/danger | tritanomaly | 69.10 | 69.10 |
  | success/danger | **tritanopia** | **6.81 ⚠** | **69.66 ✓** |
  | success/danger | achromatopsia | 50.27 | 50.27 |
  | accent/danger | deuteranomaly | 35.84 | 34.61 |
  | accent/danger | deuteranopia | 44.87 | 29.55 |
  | accent/danger | protanomaly | 43.73 | 41.02 |
  | accent/danger | protanopia | 38.39 | 36.36 |
  | accent/danger | tritanomaly | 56.95 | 35.13 |
  | accent/danger | tritanopia | 43.48 | 30.35 |
  | accent/danger | achromatopsia | 83.08 | 83.08 |
  | accent/success | deuteranomaly | 39.85 | 41.85 |
  | accent/success | deuteranopia | 36.18 | 50.53 |
  | accent/success | protanomaly | 37.07 | 38.15 |
  | accent/success | protanopia | 30.49 | 47.59 |
  | accent/success | tritanomaly | 41.77 | 49.67 |
  | accent/success | tritanopia | 39.88 | 59.15 |
  | accent/success | achromatopsia | 16.75 ⚠ | 16.75 ⚠ (inchangé) |
  | link/success | deuteranomaly | 38.38 | 40.28 |
  | link/success | deuteranopia | 22.48 | 49.02 |
  | link/success | protanomaly | 40.44 | 42.08 |
  | link/success | protanopia | 33.40 | 47.08 |
  | link/success | tritanomaly | 45.24 | 38.86 |
  | link/success | tritanopia | 35.90 | 36.86 |
  | link/success | achromatopsia | 38.95 | 38.95 |
  | link/fg-base | (7 thèmes CVD) | 15.9–29.3 | inchangé (paire non affectée par le remap) |

  Seul le cas `success/danger` en tritanopie change de statut
  (échec → conforme, waiver retiré). `accent/success` en achromatopsie
  reste le seul waiver de distinguabilité restant — mécanisme
  achromatopsie explicitement hors périmètre de ce chantier.
- **Rapport regénéré** : [CONTRAST-REPORT.md](./CONTRAST-REPORT.md) déjà
  à jour depuis le commit de phase 3 (aucune couleur modifiée depuis) —
  revérifié, `report.test.ts` toujours vert.
- **Validation visuelle** : capture d'écran automatisée (Chromium
  headless) des 6 thèmes daltoniens sur la page d'accueil, plus le
  panneau d'accessibilité ouvert (deutéranomalie) pour vérifier les
  boutons/titres/focus. Rendu sain partout, y compris tritanopie où le
  header passe visiblement à l'orange (`amber → orange`) — changement
  attendu, pas une régression. **Validation visuelle humaine de Simon
  requise avant merge**, comme l'exige le plan, en particulier sur : le
  virage orange du header en tritanopie/tritanomalie, le virage violet
  des liens dans les mêmes thèmes, et le teal/sky clair de `--success`
  dans les 4 thèmes rouge-vert (`role/success-on-bg-base`, non consommé
  aujourd'hui mais visible si un futur composant l'utilise).
- **Point d'arbitrage explicite pour Simon** (déjà signalé en phase 3,
  rappelé ici) : `role/success-on-bg-base` régresse en contraste WCAG
  dans les 4 thèmes rouge-vert (jusqu'à 1.60:1) parce que la calibration
  a priorisé la distinguabilité CVD (`distinguish/link-vs-success`) —
  sans impact utilisateur réel aujourd'hui (`--success` inutilisé), mais
  un arbitrage futur (nouveau rôle `success-strong` ? accepter le
  compromis ?) reste à trancher si ce rôle est un jour consommé.
- Vérifié : `pnpm build`/`lint`/`test` (609 tests, 17 suites) verts,
  diff CSS cumulé toujours confiné aux 6 thèmes daltoniens.

### Changed (chantier E2 (refonte daltonienne), phase 3 — tables par défaut et bascule des 6 thèmes)

- Phase 3 de [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md) :
  `_base-palette.scss` étendue avec deux familles Tailwind (`orange`,
  `violet`) ; les 6 mixins `transform-light-to-{deuter,prot,trit}{anopia,anomaly}`
  et les 6 fichiers de thèmes branchés sur `remap-for-cvd`. Tables
  retenues :
  - deutéranopie/deutéranomalie/protanopie/protanomalie (confusion
    rouge-vert) : `emerald → sky (-3)`, `redd → amber (+1)`.
  - tritanopie/tritanomalie (confusion bleu-jaune) : `amber → orange (0)`,
    `sky → violet (0)` ; emerald/redd inchangées (déjà sûres pour cet axe).
  - anomalies : mêmes tables que leur -opie, `"severity": 0.5`.
  Les `special-colors` codées en dur (`#0075ff`, `#ffcc00`, `#0090ff`,
  `#ffd700`, `#ff6600`, `#ff3399`) retirées des défauts partout ; les 6
  fichiers de thèmes simplifiés (plus de config locale, les nouveaux
  défauts des mixins suffisent).
- **Bug Sass trouvé et corrigé pendant l'implémentation** : les clés de
  map non quotées `orange:`/`violet:` dans `_base-palette.scss` sont des
  **couleurs CSS reconnues** — Sass les interprète silencieusement comme
  des valeurs `color` plutôt que des chaînes (`@warn` discret : « you
  probably don't mean to use the color value orange… »), ce qui cassait
  toute recherche par chaîne (`analyze-tailwind-color`, `get-color`)
  avec `$map: null is not a map`. Corrigé en quotant explicitement
  (`"orange":`, `"violet":`) comme le sont déjà `redd` (nommée ainsi
  pour éviter la collision avec le mot-clé `red`) — cette même classe de
  bug guettait déjà `redd` si elle avait été nommée `red`.
- **Calibration mesurée du décalage `emerald → sky`** (le plan qualifie
  ces tables de point de départ, pas une vérité) : le shift `0` proposé
  fait chuter `distinguish/link-vs-success` sous le seuil ΔE ≥ 20 en
  deutéranomalie/protanomalie (jusqu'à ΔE 4.6) — `--link` occupe déjà
  `sky-900`, et le mélange de sévérité 0.5 de `--success` vers `sky-600`
  finit perceptuellement trop proche. Essai `emerald → violet` : pire
  (violet et sky sont perceptuellement voisins, ΔE jusqu'à 4.59). Essai
  `sky (-4)` (sky-200, très clair) : ΔE ≥ 38 partout mais dégrade
  fortement le contraste WCAG déjà non conforme de `--success` (jusqu'à
  1.27:1). Retenu : `sky (-3)` (sky-300), qui satisfait ΔE ≥ 20 avec une
  marge confortable (≥ 40 sur les thèmes affectés) sans creuser le
  contraste plus que nécessaire.
- **Suite de contrastes (E1) et de distinguabilité (E2/refonte daltonienne phase 1)
  re-exécutées après bascule — succès attendu du plan** :
  - `role/danger-on-bg-base` : passe de 6 thèmes waivés à **1 seul**
    (`anti-glare-light`, non lié au remap CVD) — les 6 thèmes daltoniens
    passent désormais ≥ 4.5:1 (le pire cas historique, `#ffcc00` à
    1.34:1 en protanopie, est résolu par `redd → amber`).
  - `distinguish/success-vs-danger` : waiver **retiré entièrement** — le
    seul échec (tritanopie, ΔE 6.81, dû aux anciennes special-colors
    `#ff6600`/`#ff3399` jamais vérifiées pour leur distinguabilité) est
    résolu du simple fait de retirer ces special-colors par défaut
    (emerald/redd restent inchangées en tritanopie, ΔE 69.66).
  - `role/success-on-bg-base` **régresse** en deutéranomalie/
    deutéranopie/protanomalie/protanopie (ratios 2.33/1.60/2.33/1.60,
    contre 3.61/4.03/3.61/3.13 avant) : la calibration `sky (-3)`
    priorise la distinguabilité CVD (voir ci-dessus) au détriment du
    contraste WCAG déjà non conforme de ce rôle. `--success` reste
    consommé par aucun composant à ce jour (vérifié par grep) — impact
    utilisateur réel nul, mais point à signaler explicitement à Simon
    (voir rapport de phase 4/5).
  - Sortie brute complète (avant/après par thème, contraste et ΔE) dans
    le rapport de phase joint à cette entrée ; `CONTRAST-REPORT.md`
    régénéré.
- **Diff CSS** : strictement confiné aux 6 blocs `[data-theme]`
  daltoniens (`deuteranomaly`, `deuteranopia`, `protanomaly`,
  `protanopia`, `tritanomaly`, `tritanopia`) — vérifié sur l'ensemble du
  CSS compilé, rien d'autre n'a bougé.
- **Purge des chemins morts, faite en fin de phase 3** (le plan la prévoit
  « en fin de phase 4 », mais son unique condition — « quand plus rien ne
  les référence » — était déjà remplie ici, et la phase 3 la redemande
  elle-même en item 4) : `adapt-color-for-colorblindness`,
  `adapt-color-for-color-anomaly` et leurs auxiliaires `brightness`/
  `is-similar-to` supprimées de `_theme-utils.scss`, confirmé sans
  appelant restant par grep avant suppression. CSS compilé strictement
  identique avant/après cette purge (suppression de code mort pur).
- Vérifié : `pnpm build`/`lint`/`test` (609 tests, 17 suites) verts.

### Added (chantier E2 (refonte daltonienne), phase 2 — moteur de remap)

- Phase 2 de [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md) :
  `remap-for-cvd($color, $var-name, $config, $cvd-type)` ajoutée à
  `_theme-utils.scss`, résolution en 4 cas (le plan en distingue 3, le
  4ᵉ — « famille reconnue mais absente de la table » — a dû être rendu
  explicite, voir divergence ci-dessous) :
  1. `special-colors` explicite pour la variable → prioritaire sur tout
     (mécanisme conservé tel quel).
  2. Couleur reconnue comme swatch Tailwind **et** sa famille présente
     dans `family-remap` → substitution vers la famille cible, au poids
     décalé (décalage d'**index** dans `$tailwind-weights`, borné à
     [50, 950], `@warn` si le bornage s'applique).
  3. Couleur reconnue mais famille absente de `family-remap` → laissée
     **inchangée** (déjà jugée sûre pour ce type de CVD — c'est
     pourquoi, par exemple, `amber`/`sky` n'auront pas d'entrée dans les
     tables proto/deutéranopie de la phase 3).
  4. Couleur hors palette Tailwind (custom, futur consommateur du
     paquet) : repli par rotation de teinte OKLCH vers une ancre fixe du
     type de CVD, à luminance/chroma constants — point de calibration
     non validé perceptuellement.
  Mélange `severity` (0.5 pour les anomalies) appliqué en sortie via
  `color.mix(…, $method: oklch)`, quel que soit le cas résolu.
  Vérifié par un script Sass isolé (non commité) : priorité des
  special-colors, remap + décalage de poids correct, bornage avec
  `@warn`, famille non listée laissée intacte, rotation OKLCH avec
  L/C préservés (vérifié : identiques à la couleur d'origine), mélange
  de sévérité strictement compris entre original et remap complet.
- **Divergence documentée : le branchement dans les 6 mixins
  `auto-{deuter,prot,trit}{anopia,anomaly}-transform` est repoussé à la
  phase 3**, alors que le plan demande de le faire dès la phase 2. Raison
  mesurée : l'oracle « CSS byte-identique, le moteur existe mais aucun
  thème ne l'utilise encore » de la phase 2 est incompatible avec un
  branchement réel maintenant. Les 6 fichiers de thèmes actuels ne
  définissent aucune clé `family-remap` ; sous la résolution ci-dessus,
  une famille reconnue non listée (cas 3) doit être **laissée
  inchangée** — or c'est déjà le comportement *correct* final, mais il
  diffère du comportement *actuel* de l'ancien moteur HSL
  (`adapt-color-for-colorblindness`), qui décale bel et bien la teinte de
  `--accent` (ambre, teinte ≈45°, tombe dans sa fenêtre verte 30–150°) en
  proto/deutéranopie. Rien ne permet de brancher le nouveau moteur sans
  changer le CSS avant que les vraies tables existent (phase 3) — le
  branchement des mixins et la pose des tables sont donc faits ensemble
  en phase 3, qui attend de toute façon un diff CSS confiné aux thèmes
  daltoniens.
- Le champ « 3. Sinon (couleur hors palette) → repli OKLCH » du plan
  était rédigé comme un `else` terminal après le test de `family-remap`,
  ce qui aurait fait passer `--accent`/`--link` (familles reconnues mais
  non listées) par le repli OKLCH plutôt que de les laisser intacts —
  incohérent avec les tables suggérées en phase 3 (qui ne listent pas
  ces familles, précisément parce qu'elles sont déjà sûres). Résolution
  retenue : un cas 3 explicite (« famille reconnue, non listée →
  inchangée ») distinct du cas 4 (« famille non reconnue → OKLCH »).
- Chemins hérités (`adapt-color-for-colorblindness`,
  `adapt-color-for-color-anomaly`, `auto-*-transform`, `brightness`,
  `is-similar-to`) intégralement conservés à ce stade — toujours actifs,
  suppression prévue en fin de phase 4 seulement si le grep confirme
  qu'ils ne sont plus référencés.
- Vérifié : `pnpm build`/`lint`/`test` (609 tests, 17 suites) verts ; CSS
  compilé strictement identique à la baseline de phase 0.

### Added (chantier E2 (refonte daltonienne), phase 1 — tests de distinguabilité)

- Phase 1 de [PLAN-refonte-daltonienne.md](./PLAN-refonte-daltonienne.md)
  (branche `refactor/theme-cvd-remap`, chantier additif — aucun fichier de
  `src/styles/` modifié, CSS compilé byte-identique).
  - `src/accessibility/contrast/cvd-simulation.ts` : simulation de la
    perception sous déficience de vision des couleurs. Dichromacies
    (protanopie/deutéranopie/tritanopie) et anomalies (sévérité 0.5) via
    les matrices de Machado, Oliveira & Fernandes (2009), appliquées en
    RVB **linéaire** (conversion `culori.convertRgbToLrgb`/
    `convertLrgbToRgb`) — les lignes de chaque matrice somment à ≈ 1
    (un gris neutre reste un gris neutre, vérifié en test). Achromatopsie
    traitée à part (pas une dichromatie) : luma BT.601 sur RVB gamma
    (mêmes poids que `adapt-color-for-achromatopsia` existant dans
    `_theme-utils.scss`), pour rester cohérent avec le mécanisme déjà en
    place plutôt qu'un modèle de monochromacie théorique différent.
  - **Choix de dépendance** : le paquet npm `color-blind` évoqué par le
    plan a été écarté après vérification (`license: undefined` sur le
    registre npm — affiché « Proprietary », donc risqué pour un projet
    dont l'objectif est l'extraction en paquet open source, § E7).
    Implémentation directe des matrices publiées, comme le permettait le
    plan en repli (« recopier les matrices … en citant la source »).
  - `contrast-pairs.ts` : nouveau type `DistinguishabilityPair` (registre
    séparé `distinguishabilityPairs`, pas fondu dans `ContrastPair`— les
    deux notions ne partagent que `id`/`waiver`, pas de `level` ni de
    seuil WCAG côté distinguabilité) et 5 paires du plan (`success`/
    `danger`, `accent`/`danger`, `accent`/`success`, `link`/`success`,
    `link`/`fg-base`), chacune sur les 7 thèmes CVD (6 daltoniens +
    achromatopsie). Seuil de départ ΔE ≥ 20 (calibration, § plan).
  - `measure.ts` : `measureDeltaE(pair, theme)` — résout les deux
    couleurs, simule la déficience, mesure `culori.differenceCiede2000`
    entre les deux couleurs simulées.
  - `__tests__/cvd-simulation.test.ts` : gris invariant à sévérité 1
    (les 3 dichromaties), no-op à sévérité 0, mélange monotone entre 0 et
    1, collapse rouge/vert bien plus fort que l'écart d'origine en
    proto/deutéranopie (fait manuel le plus connu du daltonisme
    rouge-vert — utilisé comme « valeur de référence publiée » faute de
    triplet RVB exact vérifiable sans accès réseau), achromatopsie =
    gris strict correspondant au luma attendu.
  - `__tests__/distinguishability.test.ts` : intégrité du registre +
    matrice paire × thème avec le même mécanisme anti-zombie que E1.
  - **Premier run = inventaire** (avant refonte, sortie brute) :

    ```
    distinguish/success-vs-danger   deuteranomaly   deltaE=40.0116  ok
    distinguish/success-vs-danger   deuteranopia    deltaE=74.2821  ok
    distinguish/success-vs-danger   protanomaly     deltaE=41.5478  ok
    distinguish/success-vs-danger   protanopia      deltaE=66.0516  ok
    distinguish/success-vs-danger   tritanomaly     deltaE=69.0999  ok
    distinguish/success-vs-danger   tritanopia      deltaE=6.8121   FAIL
    distinguish/success-vs-danger   achromatopsia   deltaE=50.2749  ok
    distinguish/accent-vs-danger    deuteranomaly   deltaE=35.8373  ok
    distinguish/accent-vs-danger    deuteranopia    deltaE=44.8679  ok
    distinguish/accent-vs-danger    protanomaly     deltaE=43.7267  ok
    distinguish/accent-vs-danger    protanopia      deltaE=38.3857  ok
    distinguish/accent-vs-danger    tritanomaly     deltaE=56.9452  ok
    distinguish/accent-vs-danger    tritanopia      deltaE=43.4750  ok
    distinguish/accent-vs-danger    achromatopsia   deltaE=83.0816  ok
    distinguish/accent-vs-success   deuteranomaly   deltaE=39.8462  ok
    distinguish/accent-vs-success   deuteranopia    deltaE=36.1816  ok
    distinguish/accent-vs-success   protanomaly     deltaE=37.0724  ok
    distinguish/accent-vs-success   protanopia      deltaE=30.4932  ok
    distinguish/accent-vs-success   tritanomaly     deltaE=41.7694  ok
    distinguish/accent-vs-success   tritanopia      deltaE=39.8797  ok
    distinguish/accent-vs-success   achromatopsia   deltaE=16.7522  FAIL
    distinguish/link-vs-success     deuteranomaly   deltaE=38.3770  ok
    distinguish/link-vs-success     deuteranopia    deltaE=22.4811  ok
    distinguish/link-vs-success     protanomaly     deltaE=40.4417  ok
    distinguish/link-vs-success     protanopia      deltaE=33.3957  ok
    distinguish/link-vs-success     tritanomaly     deltaE=45.2418  ok
    distinguish/link-vs-success     tritanopia      deltaE=35.8973  ok
    distinguish/link-vs-success     achromatopsia   deltaE=38.9493  ok
    distinguish/link-vs-fg-base     deuteranomaly   deltaE=24.5366  ok
    distinguish/link-vs-fg-base     deuteranopia    deltaE=24.8620  ok
    distinguish/link-vs-fg-base     protanomaly     deltaE=24.9146  ok
    distinguish/link-vs-fg-base     protanopia      deltaE=25.4625  ok
    distinguish/link-vs-fg-base     tritanomaly     deltaE=23.4640  ok
    distinguish/link-vs-fg-base     tritanopia      deltaE=29.2716  ok
    distinguish/link-vs-fg-base     achromatopsia   deltaE=15.9997  FAIL
    ```

  - 3 échecs sur 35, waivés `preexisting: true` (aucune couleur
    corrigée) : `success`/`danger` en tritanopie (ΔE 6.81 — les deux
    portent peu de bleu, la confusion bleu-jaune de la tritanopie laisse
    peu de quoi les distinguer), `accent`/`success` en achromatopsie
    (ΔE 16.75 — luma BT.601 proche une fois désaturés), `link`/`fg-base`
    en achromatopsie (ΔE 16.00 — deux couleurs très sombres, luma
    proche). Ces trois cas sont des candidats explicites pour les tables
    de remap de la phase 3 (sauf les deux cas achromatopsie, dont le
    mécanisme reste hors périmètre de ce chantier).
  - Vérifié : `pnpm test` (609 tests, 17 suites), `pnpm lint`,
    `pnpm exec tsc --noEmit` verts ; CSS compilé strictement identique à
    la baseline de phase 0.

### Fixed (revue indépendante du chantier E2)

- Waiver `site/button-active-outline-on-panel-bg` : la valeur `measured`
  de `anti-glare-light` (1.057) datait de la phase 2 et n'avait pas été
  rafraîchie après la réécriture OKLCH de la phase 3 — la mesure réelle
  est 1.307 (recalcul indépendant depuis le CSS compilé, concordant avec
  la matrice régénérée du [CONTRAST-REPORT.md](./CONTRAST-REPORT.md)).
  Valeur et texte du waiver corrigés, rapport régénéré. Sans effet sur
  les tests (les cartes `measured` sont documentaires ; le garde-fou
  anti-zombie ne se déclenche qu'au passage du seuil).

### Docs (chantier E2 — revue des moteurs, phase 5 — finalisation)

- Phase 5 (dernière) de [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) :
  vérification finale et documentation, branche `refactor/theme-engines`
  (4 commits, non mergée). `pnpm build`/`lint`/`test` verts.
- **Preuve par diff** : le plan demande un CSS « byte-identique à
  phase 0 » en finalisation — formule reprise telle quelle des plans E1/
  fondations, mais **contradictoire avec le contenu même de ce plan**
  (les phases 2, 3 et 4 documentent et attendent explicitement un diff
  CSS visuel confiné aux thèmes anti-glare). Interprétation retenue,
  cohérente avec l'esprit de l'oracle CSS des trois plans : prouver que
  le diff cumulé `phase0.css` → CSS final est *exactement* la somme des
  changements documentés phase par phase, rien d'accidentel ailleurs.
  Vérifié : diff complet (470 lignes) confiné aux blocs
  `[data-theme="anti-glare-light"]` et `[data-theme="anti-glare-dark"]`
  uniquement (plages de lignes identiques à celles rapportées en
  phases 2/3/4) — aucune ligne changée en dehors de ces deux thèmes sur
  l'ensemble des 5350 lignes du CSS compilé.
- Docs mises à jour : README § 5 (point 10, couverture anti-glare
  partielle, marqué résolu), § « Carte des documents » (E2 exécuté,
  merge en attente de validation visuelle), guide E2 (résumé du
  résultat, divergences documentées).
- **Divergences par rapport au plan, documentées phase par phase et
  résumées ici** :
  1. Phase 1, item 1 (syntaxe `if()`) : non appliqué tel quel — la
     « correction » proposée introduit une régression (nouveau
     `DEPRECATION WARNING`) avec Dart Sass 1.101 ; le code existant est
     en réalité la syntaxe de désambiguïsation officielle contre le
     nouveau `if()` CSS natif. Code inchangé, commenté.
  2. Phase 2 : l'hypothèse du plan (« double atténuation » pour les ~22
     tokens auparavant listés) ne se vérifie pas — ils ressortent
     strictement inchangés. Le bug réel était uniquement l'absence de
     traitement des ~45 tokens oubliés, corrigée sans régression sur les
     22 premiers.
  3. Phase 3 : seuil clair recalibré de 92% à 85% (OKLCH) — à 92%,
     `stone-300` restait quasiment intact, ce que l'ancien moteur HSL
     n'aurait pas laissé passer. Seuil sombre (22%) inchangé, sa
     couverture correspond déjà exactement à l'ancien seuil HSL (15%).
  4. Phase 5 (ce point) : la formule « CSS byte-identique » réinterprétée
     comme ci-dessus.
- **Rapport final pour arbitrage de Simon** (voir aussi le message de
  fin de tâche) : 4 commits sur `refactor/theme-engines`, diff CSS
  cumulé strictement confiné aux thèmes anti-glare, `CONTRAST-REPORT.md`
  tenu à jour à chaque phase colorée (aucun waiver devenu zombie),
  vérification visuelle automatisée faite (captures Chromium headless)
  mais **validation visuelle humaine de Simon requise avant tout merge** —
  en particulier sur : le rendu des deux thèmes anti-glare après passe
  unique + recalibration OKLCH (phases 2-3), et la suppression de
  l'overlay `backdrop-filter` (phase 4, réversible indépendamment des
  autres phases si besoin).

### Removed (chantier E2 — revue des moteurs, phase 4 — overlay backdrop-filter)

- Phase 4 de [PLAN-revue-moteurs.md](./PLAN-revue-moteurs.md) : mixin
  `apply-anti-glare-filter` (`_anti-glare-functions.scss`) et son
  invocation supprimés — l'overlay plein écran `body::before`
  (`backdrop-filter: contrast(98%) brightness(99%)`/`opacity: 0.3` en
  light, `contrast(95%) brightness(102%)`/`opacity: 0.2` en dark,
  `z-index: 9999`) imposait un coût GPU permanent pour un effet mesuré
  quasi nul.
- **Diff CSS** : exactement les deux règles `[data-theme="anti-glare-light"]
  body::before` et `[data-theme="anti-glare-dark"] body::before`
  disparaissent, rien d'autre (vérifié par diff complet).
- **Comparaison avant/après pour Simon** : capture d'écran automatisée
  (Chromium headless, page d'accueil) des deux thèmes anti-glare avec et
  sans l'overlay. Diff pixel par pixel : ~1.4 % des pixels changent de
  plus de 10/255 sur un canal, concentrés sur les zones de texte/icônes
  (bruit d'anti-aliasing entre deux rendus Chromium distincts, pas un
  changement de contenu) — aucune différence visuelle perceptible
  attribuable à l'overlay. Confirme le diagnostic du plan (« effet mesuré
  quasi nul »).
- **Décision** : suppression conservée par défaut. **C'est Simon qui
  tranche** — s'il perçoit malgré tout une différence utile à l'usage
  réel (au-delà de ce que montrent des captures statiques), revenir en
  arrière sur ce commit uniquement et consigner la décision ici.
- **Vérif** : `pnpm build`/`lint`/`test` (566 tests, 15 suites) verts ;
  aucun effet de bord sur `CONTRAST-REPORT.md` (aucune couleur touchée).

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
