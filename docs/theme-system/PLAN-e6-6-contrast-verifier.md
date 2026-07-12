<!-- @format -->

# Plan — Chantier E6.6 : extraction du vérificateur de contrastes

Rédigé le 2026-07-12. Comble l'**écart n°2** de l'audit §6.2 : l'outillage
`src/accessibility/contrast/` (vérificateur WCAG, ~1840 lignes) est côté
site alors que le §6.2 le met dans le paquet (« Vérificateur de contrastes
WCAG sur les paires de rôles » + gate CI pour les consommateurs).
Exécution sur branche `feat/e6-6-contrast-verifier`.

## Objectif

Le paquet livre un **moteur de vérification de contrastes** générique + le
**registre des paires de RÔLES** (l'API du paquet). Le consommateur importe
le moteur, y ajoute ses paires de couche 3, et obtient la garantie WCAG +
un rapport, dans ses tests / sa CI.

## La frontière (générique = paquet / spécifique = consommateur)

| Fichier | Rôle | Destination |
| --- | --- | --- |
| `wcag.ts` | math WCAG (ratio, seuils, composite alpha) | **paquet** |
| `measure.ts` | mesure ratio/ΔE d'une paire | **paquet** |
| `cvd-simulation.ts` | simulation daltonienne (culori) | **paquet** |
| `gamut.ts` | garde anti-gamut sRGB | **paquet** |
| `extract-themes.ts` | compile un SCSS → extrait les vars par `[data-theme]` | **paquet** (paramétré : chemin d'entrée + node_modules + liste de thèmes passés par le consommateur) |
| `contrast-pairs.ts` | registre des paires | **scindé** : paires de **rôles** (`--fg-base`/`--bg-base`…) → paquet (défauts) ; paires de **couche 3** (`--color-header-bg`…) → consommateur |
| `report.ts` | génère la matrice markdown | **paquet** (moteur) ; chemins/labels = config consommateur |
| `hc-semantic-audit.ts` | inspecteur sémantique HC | **paquet** (moteur) ; `HC_SLOTS` (cartes HC) = déjà dans le paquet (theme-generator `hc-carte`) → à brancher dessus |

Couplages actuels à défaire :
- `extract-themes.ts` : `MAIN_SCSS` et `NODE_MODULES` **codés en dur** →
  paramètres. `THEMES` vient déjà du paquet (via le shim `config/themes`).
- `contrast-pairs.ts` : importe `ThemeOption` du shim (déjà paquet).
- `hc-semantic-audit.ts` : `HC_SLOTS` recopie les cartes HC → lire
  `hc-carte()` du paquet (source unique).

## Périmètre du paquet (nouveau dossier `testing/`)

```
packages/a11y-prefs/testing/
├── wcag.ts, measure.ts, cvd-simulation.ts, gamut.ts
├── extract-themes.ts        # extractThemes({ entry, loadPaths, themes })
├── role-pairs.ts            # paires de rôles par défaut (API paquet)
├── report.ts                # generateReport(pairs, { out, labels })
└── semantic-audit.ts        # audit HC générique (lit hc-carte)
```
Dépendances du paquet : `culori`, `postcss`, `sass` (déjà présentes au repo,
à déclarer en `dependencies`/`peer` du paquet). Export `./testing/*`.

## Côté consommateur (le portfolio, premier client)

- `src/accessibility/contrast/` se réduit à : sa **config** (chemin
  `main.scss`, node_modules), ses **paires de couche 3** (étendent les
  role-pairs du paquet), l'appel au rapport + à l'audit.
- Les **tests** se scindent : tests du **moteur** (wcag, gamut, cvd,
  distinguishability) → paquet ; tests de **conformité du site**
  (report freshness, hc-palette-conformance, hc-semantic sur les thèmes du
  site, font-drift) → restent côté portfolio.

## Oracle

- `CONTRAST-REPORT.md` **byte-identique** (même matrice).
- `pnpm hc:audit` : sortie inchangée (0 avertissement actif, 15 waivés).
- **748 tests toujours verts** (répartis paquet + site).
- Aucun changement du CSS du site (l'outillage ne touche pas au rendu).

## Phases

### Phase 0 — Préparation
Baseline : `CONTRAST-REPORT.md`, sortie `hc:audit`, suite de tests.

### Phase 1 — Déplacer le moteur générique dans le paquet
wcag/measure/cvd/gamut + `extract-themes` paramétré + `role-pairs` +
`report`/`semantic-audit` moteurs. Le paquet compile/typecheck seul.
**Commit** : `feat(theme): e6.6 phase 1 — contrast verifier engine into package`.

### Phase 2 — Le portfolio consomme le moteur
Réduire `src/accessibility/contrast/` à la config + paires couche 3 + appels.
Scinder les tests (moteur → paquet, conformité site → portfolio).
**Oracle** : rapport + audit + tests byte-identiques / verts.
**Commit** : `refactor(theme): e6.6 phase 2 — portfolio consumes verifier`.

### Phase 3 — Finalisation
`package.json` (export `./testing/*`, deps), README §6.2 item 9 coché,
changelog, GUIDE (E6.6 fait), notice (le consommateur branche le gate CI).
**Commit** : `docs(theme): e6.6 phase 3 — finalisation`.

## Hors périmètre

- Refonte des algos (WCAG/CVD inchangés — extraction pure).
- `forced-colors`/`prefers-contrast` (README §7, plus tard).
- Publication npm (E7).
