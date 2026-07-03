<!-- @format -->

# Guide d'extraction — du composant in situ au paquet open source

**Document d'orientation destiné à une IA (ou un dev) chargée de
transformer le système de préférences d'accessibilité du portfolio en paquet
réutilisable.** Il donne les grandes lignes, l'ordre des chantiers et les
décisions déjà actées ; chaque chantier devra recevoir son plan d'exécution
détaillé (sur le modèle de
[PLAN-migration-fondations.md](./PLAN-migration-fondations.md)) avant d'être
lancé.

Lecture préalable obligatoire : [README.md](./README.md) § 6 (architecture
cible actée : modèle 3 couches, périmètre § 6.2, distribution hybride § 6.3,
élargissement au système de préférences § 6.5). Conventions du dépôt :
`AGENTS.md`. Toute modification est consignée dans
[CHANGELOG.md](./CHANGELOG.md).

## Principes non négociables

1. **Le CSS compilé du portfolio reste l'oracle** pendant toute
   l'extraction : à chaque étape, le portfolio consommant le paquet doit
   produire un CSS identique (ou au diff explicitement attendu) à celui
   d'avant l'étape.
2. **Le portfolio est le premier consommateur** : chaque API du paquet est
   validée en migrant le portfolio dessus, jamais conçue dans le vide.
3. **Rien ne se publie sans les tests de contraste** (chapitre dédié
   ci-dessous) : ils protègent toutes les réécritures de moteurs.
4. Positionnement public : ce composant est un système de **préférences
   first-party intégrées au site** — ne jamais le présenter avec le
   vocabulaire des « accessibility overlays » (widgets tiers automatiques,
   très mal perçus par la communauté accessibilité, cf. overlayfactsheet.com).

## État de départ (post-fondations, 2026-07-03)

Fondations migrées (rail numérique 11 crans, rôles de couche 2, modules
Sass `@use`, source unique de la liste des thèmes `src/config/themes.ts`).
Restent in situ, à faire **avant** l'extraction :

- **Système de tests de contrastes** (chapitre ci-dessous) — protège tout le
  reste.
- **Revue/optimisation des moteurs anti-glare et daltoniens** (constats du
  2026-07-03 dans le CHANGELOG ; dont : double transformation anti-glare des
  tokens de couche 3, paramètre `$intensity` inutilisé, expression `if()`
  mal formée dans la branche d'erreur, enhance-factor non configurable pour
  les -opies, overlay `backdrop-filter` à évaluer/mesurer).
- La réécriture **déclarative du moteur high-contrast** sur les rôles peut
  attendre l'extraction elle-même (c'est au moment de généraliser les
  moteurs qu'elle devient rentable) — décision Simon 2026-07-03.

## Cible

Monorepo pnpm dans ce dépôt, puis publication npm publique (projet open
source — décision Simon 2026-07-03).

```
pnpm-workspace.yaml
packages/<nom>/                  # nom : décision en cours (a11y-prefs pressenti)
├── package.json                 # exports: ".", "./scss", "./react", "./fonts", "./testing"
├── LICENSE                      # licence du code (MIT recommandée)
├── scss/
│   ├── _palette.scss            # palettes Tailwind + get-color()
│   ├── _rail.scss               # $gray-50…950, géométrie 11 poids
│   ├── _roles.scss              # les ~23 rôles (API publique) + !default
│   ├── engines/                 # dark, high-contrast, daltonismes, anti-glare
│   └── _emit.scss               # generate-theme-css-vars + blocs [data-theme] à la carte
├── react/
│   ├── core.ts                  # cœur préférences : persistance + application DOM + SSR
│   ├── themes.ts                # liste des thèmes (source unique, générée vers SCSS ou vérifiée)
│   ├── anti-fouc.ts             # générateur du script inline
│   └── useTheme.ts, usePreference.ts
├── fonts/                       # @font-face + fichiers (module opt-in)
│   └── LICENSES/                # une licence PAR police (distinctes du code)
├── cli/                         # init (scaffolding UI + config), init --diff
├── templates/                   # AccessibilityMenu (déclencheur + carte) copiés par init
├── testing/                     # runner de tests de contraste (exporté)
└── examples/                    # couche 3 commentée (recettes portfolio)
```

## Les chantiers, dans l'ordre

### E1 — Système de tests de contrastes (in situ, avant tout)

Voir le chapitre dédié en fin de document. Livré d'abord dans le portfolio
(`pnpm test`), déplacé plus tard dans `testing/` du paquet.

### E2 — Revue des moteurs anti-glare / daltoniens (in situ)

Corriger les constats listés plus haut ; toute modification de valeurs est
validée par les tests de contraste (E1) + validation visuelle de Simon.
Sortie : moteurs stables, prêts à être figés dans une API.

### E3 — Monorepo et extraction de la face SCSS

`pnpm-workspace.yaml`, création du paquet, déplacement de
palette/rail/rôles/moteurs/émetteur. Le portfolio consomme :

```scss
@use "<nom>/scss" with (
  $gray-family: "stone",
  $roles: (…),            // les affectations actuelles du portfolio
  $themes: (…)            // les 12, à la carte pour d'autres projets
);
```

Tout ce qui est configurable porte `!default`. Oracle : CSS identique.

### E4 — Extraction du runtime React

Le cœur préférences (persistance localStorage + application DOM + anti-FOUC
+ sécurité SSR) devient générique : `usePreference(key, applyFn)` ;
`useTheme` en est une instance. La liste des thèmes vit dans le paquet ;
le portfolio importe depuis le paquet (supprime `src/config/themes.ts`).
Le script anti-FOUC est *généré* par le paquet à partir de la même liste.

### E5 — Modules de préférences additionnels

Un module = préférence + application DOM + CSS/contrat hôte, opt-in :

- **Taille de texte** : `--font-size-factor` ; contrat hôte documenté
  (tailles en `rem`/`em`) + mixin d'aide.
- **Réduction des animations** : classe `reduce-motion` + mixin
  `motion-safe` fourni ; contrat hôte documenté.
- **Polices d'accessibilité** : embarquées (décision Simon) dans `fonts/`
  avec `@font-face` prêts. ⚠️ **Audit de licences bloquant avant
  publication** : OpenDyslexic/Andika/Raleway Dots = OFL (ok) ; Sylexiad,
  Tiresias, Atkinson Hyperlegible : vérifier et consigner dans
  `fonts/LICENSES/`. Une police non redistribuable = retirée du paquet
  (l'hôte pourra brancher la sienne).
- **Mode dyslexie optimisé** : dépend du module polices.

### E6 — CLI de scaffolding (l'UI)

`pnpm dlx <nom> init` copie dans le projet hôte : le déclencheur (icône) +
la carte d'accessibilité (depuis `templates/`), `theme.config.scss`, et les
exemples de couche 3. `init --diff` compare l'UI locale à la référence du
paquet (modèle shadcn). L'UI copiée n'importe **que** l'API publique du
paquet (core, hooks, tokens) — jamais ses internes.

### E7 — Open source et publication

- Licence code : MIT recommandée (simple, adoption maximale) — décision
  Simon à acter. Licences polices séparées (E5).
- README du paquet **en anglais** (adoption), doc de ce dépôt reste la
  référence de conception.
- Versionnage semver + changesets (ou équivalent) ; le
  [CHANGELOG](./CHANGELOG.md) dédié du portfolio continue de tracer
  l'intégration côté site.
- CI : build + tests unitaires + **tests de contraste** (gate bloquant) +
  lint, sur chaque PR.
- Publication : registre npm **public** (+ provenance npm si CI GitHub).
- Étape finale : le portfolio épingle une version publiée (plus le
  workspace), prouvant le cycle complet.

---

## Chapitre : système de tests de contrastes (conception)

Objectif : garantir mécaniquement que **chaque paire texte/fond connue
respecte WCAG 2.2 dans les 12 thèmes**, à chaque commit — et offrir la même
garantie aux futurs consommateurs du paquet qui redéfinissent les rôles.

### Architecture

```
contrast-pairs.ts (registre, source de vérité)
        │
compilation SCSS (API JS de sass, même entrée que le site)
        │
extraction des custom properties par bloc [data-theme] (postcss)
        │
résolution des paires → calcul du ratio WCAG → assertions Jest
        │
rapport matrice (markdown généré, artefact de CI)
```

### Le registre des paires

Un fichier TypeScript déclaratif, versionné, à deux niveaux :

```ts
type ContrastRule = {
  fg: string;                  // ex. "--fg-on-emphasis"
  bg: string;                  // ex. "--bg-emphasis"
  level: "text" | "large-text" | "non-text"; // seuils 4.5 / 3 / 3 (WCAG 2.2)
  themes?: ThemeOption[];      // défaut : les 12
  waiver?: { reason: string; issue?: string }; // exception documentée
};
```

- **Niveau rôles** (livré par le paquet) : `fg-base`/`bg-base`,
  `fg-base`/`bg-subtle`, `fg-base`/`bg-container`, `fg-muted`/`bg-base`,
  `fg-on-emphasis`/`bg-emphasis` (+`-strong`, `bg-inverse`, `focus-ring`),
  `fg-on-accent`/`accent`, `accent-ink`/`accent-soft`,
  `accent-ink`/`bg-base`, `link`/`bg-base` (+`bg-subtle`, `bg-container`),
  `link-hover`/`bg-base`, `success`/`bg-base`, `danger`/`bg-base`,
  `focus-ring`/`bg-base` en `non-text` (3:1, critère 1.4.11).
- **Niveau site** (propre au portfolio, extensible par tout consommateur) :
  les paires de couche 3 critiques — header, footers, tags, boutons,
  tooltip, formulaire.

### Points techniques imposés

- **Calcul** : luminance relative et ratio selon la formule WCAG 2.x —
  ~20 lignes de TS, zéro dépendance (`culori` acceptable si besoin de
  parsing de couleurs exotiques).
- **Couleurs à alpha** (`--color-tooltip-bg`, `--color-shadow`) : composer
  l'avant-plan sur son fond déclaré **avant** le calcul du ratio ; une paire
  avec alpha doit toujours déclarer son fond de composition.
- **Waivers** : une paire qui échoue *volontairement* dans un thème donné
  n'est jamais supprimée du registre — elle porte un `waiver` motivé,
  visible dans le rapport. Zéro échec silencieux.
- **Rapport** : générer une matrice thèmes × paires (markdown) comme
  artefact — c'est aussi un argument de transparence pour l'open source.
- **Intégration** : suite Jest dédiée dans `pnpm test` (bloquant) ; en E7,
  le runner part dans `testing/` avec les paires de rôles par défaut, et
  chaque consommateur y ajoute ses paires de couche 3.
- **Évolution** : colonne APCA (WCAG 3 pressenti) **consultative** dans le
  rapport, jamais bloquante tant que la norme n'est pas stabilisée.

### Ce que ce système change pour le high-contrast et les moteurs

C'est lui qui rend les optimisations de moteurs (E2) sûres : toute dérive
de contraste introduite par une simplification est détectée immédiatement,
thème par thème, paire par paire — le pendant « perceptif » de l'oracle
« CSS identique » utilisé pendant les fondations.
