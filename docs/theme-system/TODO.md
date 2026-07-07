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

- [ ] **Micro-chantier « variables fantômes »** — 5 `var(--x)` consommés
      mais jamais émis (la couleur tombe en héritage ; tous antérieurs à la
      référence `918526f`) : `--color-bg-light`
      (`_privacy-policy.scss:28`), `--color-button-bg` +
      `--color-button-text` (`_accessibility-menu.scss:58-59`),
      `--color-success` (`_contact.scss:311` — message de succès du
      formulaire ; le câbler sur `--success` rendrait enfin le rôle
      consommé), `--color-text` (`_accessibility-menu.scss:301`),
      `--color-text-secondary` (`_skills.scss:141`). À câbler sur les rôles
      existants, sous protection de la suite de contrastes. (3 autres ont un
      fallback et fonctionnent : `--color-divider`, `--color-input-bg`,
      `--color-text-secondary` côté menu — nettoyage cosmétique.)
- [ ] **Arbitrage Simon — 5 jetons émis mais jamais consommés** (même cas
      que feu `--color-button-active-outline`) : `--color-hero-bg`,
      `--color-hero-text` (leur paire est pourtant testée), 
      `--color-collapse-border`, `--color-section-even-card-bg`,
      `--constant-success-color`. Supprimer, ou garder si usage prévu.

## Reporté explicitement (ne pas toucher sans décision)

- [ ] **Réécriture déclarative du thème high-contrast** — reportée à
      l'extraction du paquet (décision Simon). Le mécanisme actuel (déduction
      du rôle par le nom de variable) a ses raisons ; ne pas y toucher tant
      que ce n'est pas décidé.

## Bloquant avant publication open source

- [ ] **Audit des licences des polices d'accessibilité** embarquées
      (Sylexiad, Tiresias, Atkinson Hyperlegible…) — à vérifier
      impérativement avant toute publication du paquet.

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
