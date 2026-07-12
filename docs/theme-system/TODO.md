<!-- @format -->

# Choses à faire — système de thèmes / futur paquet

Liste unique des travaux et décisions en suspens pour le système de thèmes.
La **feuille de route** d'extraction en paquet (chantiers E3→E7) vit dans
[GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md) ; ce fichier ne
liste que les **fils qui pendent** et les **décisions en attente**, pour ne
rien oublier. Mettre à jour au fil de l'eau (cocher / retirer une fois fait).

## Décisions en attente (arbitrage de Simon)

- [ ] **Plancher de lisibilité du résolveur de statut** — constante
      `$status-legibility-floor` dans `src/styles/abstracts/_theme-utils.scss`
      (défaut **3:1**). En dessous, la dégradation gracieuse émet un `@warn`
      « quasi invisible ». Ne conditionne rien aujourd'hui (chemin latent) ;
      valeur à confirmer ou ajuster. Ajouté partie 3 (2026-07-06).

## À faire AVANT publication (E7)

- [ ] **Renommer la famille de palette `redd` → `red`** (2026-07-12). Simon
      avait mis 2 « d » pour contourner un conflit (VS Code / compilateur qui
      confondait avec le nom Tailwind `red` — probablement la fonction Sass
      `red()` ou le language server CSS). Non urgent, mais **à réparer avant
      d'envoyer** : « redd » exposé dans l'API publique ferait mauvais effet.
      6 fichiers : `packages/a11y-prefs/scss/_base-palette.scss` (déf.),
      `_theme-utils.scss`, `_state.scss`, `templates/scss/theme-example.scss`,
      `src/styles/main.scss`, `src/accessibility/contrast/contrast-pairs.ts`.
      ⚠️ Comprendre d'abord le conflit d'origine pour ne pas le réintroduire ;
      oracle CSS byte-identique. (Impossible de changer juste l'exemple : il
      référence la palette « redd » → casserait la compilation.)

## Micro-chantiers proposés (non planifiés, sous filet des tests)

- [x] **Corrections de rôles** (proposé après E1) — **terminé le 2026-07-07**
      (branche `refactor/theme-role-corrections`, 2 commits, en attente de
      validation visuelle avant merge) :
  - [x] Jeton mort `--color-button-active-outline` **supprimé** (+ sa paire
        de contraste).
  - [x] **Titre** du header corrigé (`--fg-on-accent` par luminance) —
        changement visuel nul.
  - [x] **Sous-titre** ancré à un gris atténué fixe (décision Simon :
        « gris atténué ») — en dark, passe de near-black à `stone-700`.
  - [x] **Lien blog** : design d'origine de Simon restauré — **chip grisé +
        texte amber dans les deux modes** (light et dark identiques :
        `#44403c` + `#fcd34d`). Le chip quasi-blanc en dark était un défaut
        antérieur aux chantiers (inversion automatique du gris, partie en
        prod), pas le design voulu. Sans rustine, paire verte partout.
  - [x] Toutes les rustines `.header` de `_dark.scss` supprimées ; les
        4 waivers header/accent levés (anti-zombie).

## Trouvailles de la relecture du 2026-07-07 (audit émis/consommés)

- [x] **Micro-chantier « variables fantômes »** — fait le 2026-07-07
      (branche `chore/theme-token-cleanup`) : les 5 déclarations inertes
      **retirées** (rendu strictement inchangé — elles ne faisaient rien,
      la couleur héritée s'appliquait déjà) et les 3 fallbacks simplifiés
      (`--color-divider`/`--color-input-bg`/`--color-text-secondary` →
      leur fallback directement).
- [x] **5 jetons émis jamais consommés supprimés** (mandat « tout sauf
      E3 ») : `--color-hero-bg`, `--color-hero-text` (+ leur paire de
      contraste), `--color-collapse-border`, `--color-section-even-card-bg`,
      `--constant-success-color`.
- [x] **Toast de succès du formulaire contact** — décidé et fait le
      2026-07-07 : rôle `--success` passé à **emerald-700** (5.25:1) et le
      toast câblé sur `var(--success)` (vert thématisé dans les 12 thèmes,
      premier consommateur du rôle). Waiver réduit à l'achromatopsie seule.

## À optimiser plus tard (noté, pas urgent)

- [x] **Typographie du high-contrast** — soldé au chantier HC (2026-07-10) :
      `html.high-contrast` passe par `a11y-font-class` (Atkinson partout,
      `font-size-adjust: 0.56`, corps 0.04em/1.75/0.128em). Reste un seul
      micro-arbitrage, non bloquant : l'interligne des TITRES en HC (1.5
      aujourd'hui, cohérent avec les classes de police).

## Écarté (décision fermée — ne pas re-proposer)

- [x] **Préview du site entier au survol des boutons de variantes HC**
      (écarté le 2026-07-11, décision Simon). Raison principale : la
      navigation CLAVIER induirait en erreur — le focus déclencherait la
      préview et l'utilisateur croirait avoir sélectionné. Raisons
      secondaires : flashs plein écran en rafale (photosensibilité, le
      public HC est le plus exposé), hover ≠ intention, inexistant au
      tactile, confusion état réel/préview. Le clic est déjà une préview
      réversible à coût nul.

## Fait (chantier hc-mécanique, 2026-07-11)

- [x] **Mécanique HC — « second temps », volet architecture** : focus
      promu rôle de la carte ; contrôle par valeur (palette) ; inspecteur
      sémantique par noms (`pnpm hc:audit`). Voir README § 6.6. Restent
      ouverts : le sort des `$accent*` en HC (garé, décision Simon) et la
      refonte techno de fond (toujours reportée).

## Reporté explicitement (ne pas toucher sans décision)

- [ ] **Réécriture déclarative du thème high-contrast** — reportée à
      l'extraction du paquet (décision Simon). Le mécanisme actuel (déduction
      du rôle par le nom de variable) a ses raisons ; ne pas y toucher tant
      que ce n'est pas décidé.

## Bloquant avant publication open source

- [x] **Audit des licences des polices d'accessibilité** — fait le
      2026-07-08. Décisions actées : **embarquées** (OFL) = OpenDyslexic,
      Andika, Atkinson, Lexend Giga/Deca ; **exclues** = Sylexiad (EULA
      propriétaire), **Tiresias** (GPLv3 + inutilisée + police de
      signalétique), **Raleway Dots** (inutilisée). Détail :
      [PLAN-extraction-modules.md](./PLAN-extraction-modules.md).
- [ ] **Question Simon — Sylexiad servie par le site** : l'EULA exige des
      webfonts « non téléchargeables publiquement » ; les woff2 du
      portfolio le sont techniquement. À trancher (hors chantier E5).

## Corrections de rôles — détail

Les deux défauts partagent une même racine : **`--accent` est
volontairement figé** (amber-300 clair) dans les 12 thèmes — il ne s'inverse
pas en dark, c'est un choix de marque. Mais des jetons qui reposent dessus,
eux, suivent l'inversion générale → clair-sur-clair.

### 1. Contour de bouton actif invisible

- `--color-button-active-outline` = `$accent` (amber-300 clair). Posé sur
  `--color-panel-bg` = `$bg-base` (quasi blanc en thème clair) → sous le
  seuil non-texte 3:1. En **high-contrast**, `$accent` et `$bg-base` valent
  tous deux `#000000` → **1.00:1**, le contour est littéralement invisible.
- **Correctif** : recâbler le jeton vers un rôle plus contrasté déjà
  existant — `$accent-strong` (amber-500) ou un rôle de bordure. Une ligne
  dans `_theme-variables.scss` (déf. + mixin), à valider par la suite +
  visuellement.

### 2. Texte du header clair-sur-clair en dark (masqué par des hacks)

- Le header a pour fond `--color-header-bg` = `$accent` (amber clair,
  **figé**). Son texte `--color-header-text` = `$fg-on-accent`, et
  `--color-header-text-role` = `$fg-muted`. Or `$fg-on-accent` = `$gray-950`
  et `$fg-muted` = `$gray-700` : dans les thèmes basés sur le dark, le rail
  gris **s'inverse**, donc ces jetons deviennent **clairs** → texte clair
  sur amber clair (~1.15:1).
- Aujourd'hui **invisible à l'œil** parce que `_dark.scss` (lignes ~57-72)
  contient des surcharges `.header` codées en dur qui reforcent le texte en
  `var(--constant-near-black)` (dont un `!important`). Ce sont des
  **rustines** qui compensent le mauvais modèle de rôle.
- **Correctif** : puisque l'accent est figé, son encre doit l'être aussi.
  Lier `fg-on-accent` (et le rôle du texte header) à une encre **stable**
  (near-black constant / `accent-ink`) plutôt qu'au rail qui s'inverse. Le
  header devient correct par construction dans les 12 thèmes, et les
  surcharges `.header` de `_dark.scss` **peuvent alors être supprimées**
  (elles ne compensent plus rien). Les waivers `fg-on-accent` /
  header-* deviennent obsolètes → retirés par l'anti-zombie.
- Contrainte : ce changement touche le **modèle de rôle** (couche 2, API du
  futur paquet) — donc à faire proprement, avec un mini-plan, la suite de
  contrastes comme filet, et validation visuelle du header en dark.
