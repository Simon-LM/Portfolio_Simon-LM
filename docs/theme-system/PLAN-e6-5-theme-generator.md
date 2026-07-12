<!-- @format -->

# Plan — Chantier E6.5 : extraction du générateur de thèmes dans le paquet

Rédigé le 2026-07-12, après l'audit de réconciliation §6.2 (README). Comble
l'écart n°1 : l'**émetteur `[data-theme]` + les définitions de thèmes
standards** sont encore côté site alors que le §6.2 les met dans le paquet.
Exécution sur branche `feat/e6-5-theme-generator`.

## Objectif (la vision de Simon, packagée)

Aujourd'hui, un consommateur devrait réécrire ses 15 blocs `[data-theme]` à
la main. Cible :

```scss
// côté consommateur : il configure son LIGHT une fois…
@use "darkmode-plus-a11y/scss/state" with ($gray-family: …, $primitives: …);

// …liste les thèmes voulus, et le PAQUET les génère tous :
@include generate-all-themes(("light", "dark", "high-contrast", …)) {
	@include emit-layer3-vars;   // sa couche 3 (via @content), dérivée des rôles
}
```

**« Je définis le light → tous les autres thèmes sont générés automatiquement »**
devient vrai côté paquet, pas seulement côté site.

## La coupe (vérifiée dans le code)

`generate-theme-css-vars()` (site, `_theme-system.scss`) se scinde **nettement** :

- **lignes 22-72 = variables du PAQUET** : `--off-white`, `--near-black`,
  `--constant-*`, `--gray-*` (rail), `--accent*`, `--link*`, `--success`,
  `--danger`, tous les rôles `--bg-*`/`--fg-*`/`--border-*`/`--focus-ring`.
- **lignes 74+ = COUCHE 3 du site** : les ~70 `--color-*`.

Les 16 fichiers de thème (753 lignes) sont ~90 % config-moteur + émission
(**product** → paquet) ; le reste = quelques règles site (focus/header dans
high-contrast, 1-2 dans dark/anti-glare → **restent consommateur**).

## Conception

Le paquet gagne un module `theme-generator` fournissant :

1. **`apply-theme($name)`** — aiguille vers le bon transform avec la **config
   standard** du thème : `define-base-colors()` + `apply-roles()` +
   (selon `$name`) `transform-light-to-dark($dark-config)`,
   `transform-light-to-high-contrast($map)` (× 4 variantes),
   remaps daltoniens, anti-glare… Les **configs standards** (le `$dark-config`
   à 11 crans, les 4 cartes HC, les ancres CVD, l'anti-glare) **migrent du
   site vers le paquet** — c'est le cœur du product.
2. **`emit-role-vars()`** — émet les variables du paquet (ex-lignes 22-72).
3. **`generate-all-themes($themes) { @content }`** — pour chaque thème :
   ```scss
   [data-theme="#{$name}"] {
     @include apply-theme($name);   // transform → rôles transformés
     @include emit-role-vars();     // variables paquet
     @content;                      // couche 3 du consommateur (mêmes rôles)
   }
   ```
   Le `@content` lit les rôles **déjà transformés** (le transform a tourné
   avant) → la couche 3 du consommateur sort juste pour chaque thème.
4. **`$default-themes`** — les 15 noms standards (défaut de `generate-all-themes`).

Côté **consommateur** (le portfolio devient client de sa propre API) :
`emit-layer3-vars` = l'ex-bloc lignes 74+, et les **surcharges de règles
site** (header HC, focus, tweaks dark/anti-glare) passent par un **hook par
thème** `@include theme-overrides($name)` inclus dans le `@content`.

## Oracle

**CSS compilé du site byte-identique** (le portfolio bascule sur
`generate-all-themes` mais produit exactement le même CSS). C'est la
garantie que l'extraction ne change rien — même méthode qu'E3/E5. La coupe
paquet-vars (22-72) puis couche-3 (74+) préserve l'ordre d'émission actuel.

## Phases

### Phase 0 — Préparation
Baseline : CSS de référence + build. Recensement exhaustif des configs de
thème à migrer (dark, 4× HC, 6× CVD, 2× anti-glare) et des règles site à
garder.

### Phase 1 — Module `theme-generator` dans le paquet (ajout pur)
`apply-theme($name)` + `emit-role-vars()` + `generate-all-themes()` +
`$default-themes`, avec les configs standards migrées **en défauts du
paquet**. Aucun changement du site encore. Tests unitaires SCSS : chaque
thème standard émis par le paquet == valeurs attendues.
**Commit** : `feat(theme): e6.5 phase 1 — package theme generator`.

### Phase 2 — Le portfolio consomme le générateur
`_theme-system.scss` réduit à `@include generate-all-themes($portfolio-themes) { @include emit-layer3-vars; @include theme-overrides($name); }`.
Les 16 `_*.scss` de thème disparaissent (leur product est dans le paquet ;
leurs surcharges site vont dans `theme-overrides`).
**Oracle** : **CSS byte-identique**. **Commit** : `refactor(theme): e6.5 phase 2 — portfolio consumes generate-all-themes`.

### Phase 3 — Surcharges site par thème
`theme-overrides($name)` regroupe proprement les règles site (header HC,
focus HC, tweaks dark/anti-glare) — vérifié byte-identique.
**Commit** : `refactor(theme): e6.5 phase 3 — per-theme site overrides hook`.

### Phase 4 — Finalisation
- Mettre à jour l'exemple E6 : `theme-example.scss` se réduit à
  `@include generate-all-themes(...) { @include a11y-ui-theme-vars; }`.
- README (§ 6.2 : item 3+5 cochés paquet ; § 1 inchangé), changelog, GUIDE
  (chantier E6.5 dans la feuille de route). Rapport final.
**Commit** : `docs(theme): e6.5 phase 4 — finalisation`.

## Risques / points d'attention

- **Byte-identique sur 15 thèmes × ~94 vars** : le risque est l'ordre
  d'émission et les surcharges site. Diff normalisé à chaque phase (comme
  E3, qui a réussi la même sorte d'extraction).
- **Configuration `with()`** : `generate-all-themes` doit voir la config du
  consommateur (`$gray-family`, `$primitives`) — chargée en premier, comme
  aujourd'hui dans `main.scss`.
- **Enchevêtrement couche 3** : la clé est le `@content` — le paquet n'émet
  QUE ses variables, la couche 3 reste chez le consommateur, injectée par
  thème. Aucune couche 3 ne fuit dans le paquet.

## Hors périmètre

- Extraction du **vérificateur de contrastes** (écart n°2 de l'audit) →
  chantier E6.6 séparé.
- Registre central rôle→cran complet (README § 7) — non requis ici.
- Changement de rendu : zéro. C'est une extraction, pas une refonte.
