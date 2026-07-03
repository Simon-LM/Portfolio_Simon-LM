<!-- @format -->

# Plan de correction — moteurs anti-éblouissement et daltoniens (chantier E2)

**Document d'exécution destiné à une IA.** Mêmes règles générales et même
protocole de vérification que
[PLAN-migration-fondations.md](./PLAN-migration-fondations.md) (§ « Règles
générales » et « Protocole de vérification » : branche dédiée, un commit par
phase, le CSS compilé est l'oracle, sortie brute des diffs dans chaque
rapport, arrêt en cas de diff inattendu, entrées
[CHANGELOG.md](./CHANGELOG.md) à chaque phase). Contexte : constats de la
revue du 2026-07-03 (CHANGELOG) et chantier E2 de
[GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md).

Branche : `refactor/theme-engines`. Fichiers concernés :
`src/styles/abstracts/_anti-glare-functions.scss`,
`src/styles/abstracts/_theme-utils.scss`,
`src/styles/themes/_anti-glare-light.scss`, `_anti-glare-dark.scss`,
`_deuteranopia.scss`, `_protanopia.scss`, `_tritanopia.scss`.

**Périmètre strict** : corrections listées ici uniquement. Les évolutions de
*mécanisme* (espace OKLCH, ancres de teintes, tests de distinguabilité par
simulation) sont des propositions **en attente d'arbitrage de Simon** —
listées dans le guide E2, ne pas les implémenter.

---

## Phase 0 — Préparation

Comme le plan des fondations : arbre propre, branche créée depuis `main`,
snapshot de référence `/tmp/theme-engines/phase0.css`, `pnpm build`,
`pnpm lint`, `pnpm test` verts avant toute modification.

## Phase 1 — Corrections sans aucun changement visuel

Dans `_anti-glare-functions.scss` :

1. **Expression `if()` mal formée** (branche d'erreur de
   `transform-for-anti-glare`, ~ligne 13) :

   ```scss
   // AVANT (fonctionne par accident du parsing spécial de if())
   @return if(sass($mode == "light"): #888888; else: #aaaaaa);
   // APRÈS
   @return if($mode == "light", #888888, #aaaaaa);
   ```

2. **Paramètre `$intensity` inutilisé** de `transform-for-anti-glare` : le
   supprimer de la signature (vérifier par grep qu'aucun appel ne le passe).
   Une intensité *configurable* est une des propositions en attente — ne pas
   l'implémenter ici.

Dans `_theme-utils.scss` :

3. **Variable morte `$hue_shift`** dans `adapt-color-for-color-anomaly`
   (calculée, jamais lue) : supprimer la ligne.
4. **`enhance-factor` configurable pour les -opies** : les trois
   `auto-{deuter,prot,trit}anopia-transform` codent `2.5` en dur. Ajouter
   une clé `"enhancer"` aux configs par défaut des trois mixins
   `transform-light-to-{…}opia` (valeur par défaut **2.5**, pour ne rien
   changer), et faire lire cette clé par les `auto-*-transform` (même
   patron que les anomalies). Les fichiers de thèmes ne changent pas.
5. **Chevauchement de fenêtres de teinte** dans
   `adapt-color-for-colorblindness` : `$h >= 30 and $h <= 150` (verts) et
   `$h >= 330 or $h <= 30` (rouges) revendiquent tous deux `h = 30`.
   Corriger la fenêtre rouge en `$h >= 330 or $h < 30`. Aucune couleur de
   la palette actuelle n'est à exactement 30° — zéro impact attendu.

**Diff CSS attendu** : byte-identique à phase 0.
**Commit** : `refactor(theme): engines phase 1 — API and dead-code fixes, no visual change`.

## Phase 2 — Anti-éblouissement en passe unique (changement visuel contrôlé)

### Le problème corrigé

`transform-theme-for-anti-glare` transforme aujourd'hui le rail + les
primitives, dérive les rôles… puis re-transforme individuellement ~25
tokens de couche 3. Conséquences : **double atténuation** pour ces 25
tokens (ex. `--color-main-bg`), et **aucune atténuation** pour les ~45
tokens absents de la liste (ex. `--color-lang-toggle-bg`, pourtant issu du
même rôle `bg-base` que `main-bg`). Des surfaces au même rôle rendent
différemment.

### La correction

Dans `transform-theme-for-anti-glare` :

1. Conserver : transformation des 11 crans du rail, resynchronisation des
   alias, transformation des 8 primitives (`$accent`…`$danger`),
   `@include apply-roles()`.
2. **Ajouter** `@include apply-theme-variables;` juste après
   `apply-roles()` : les ~70 tokens de couche 3 se rederivent tous des
   primitives anti-éblouies — couverture totale, une seule passe.
3. **Supprimer** : les 3 resynchronisations manuelles de tokens de boutons
   (devenues redondantes) et **toutes** les re-transformations
   individuelles de tokens `$color-*` (~25 blocs, des « Transformation des
   variables dérivées UI » jusqu'aux footers inclus).
4. Conserver en dernier (après `apply-theme-variables`) : la surcharge
   spéciale `$color-collapse-border` (rgba adouci) et
   `@include apply-anti-glare-filter($mode)` (traité en phase 3).

### Vérification

- Diff CSS : les changements doivent être **confinés aux blocs
  `[data-theme="anti-glare-light"]` et `[data-theme="anti-glare-dark"]`**
  (aucun autre bloc ne doit bouger). À l'intérieur, deux directions
  attendues et explicables : les tokens auparavant doublement transformés
  deviennent légèrement moins atténués ; les tokens auparavant oubliés
  deviennent atténués. Joindre la sortie brute du diff au rapport.
- **Validation visuelle par Simon requise avant merge** : les deux thèmes
  anti-glare, pages principales, comparaison avant/après.

**Commit** : `refactor(theme): engines phase 2 — single-pass anti-glare, full token coverage`.

## Phase 3 — Overlay `backdrop-filter` (décision visuelle)

L'overlay plein écran `body::before` (`backdrop-filter: contrast(98%)
brightness(99%)`, `opacity: 0.3`, `z-index: 9999`) impose un coût GPU
permanent pour un effet mesuré quasi nul, et son interaction
`opacity`/`backdrop-filter` est d'un effet incertain selon les navigateurs.

1. Supprimer `apply-anti-glare-filter` et son invocation.
2. Préparer pour Simon une comparaison avant/après (deux captures par thème
   anti-glare) : **c'est lui qui tranche**. S'il perçoit une différence
   utile, revenir en arrière sur cette phase uniquement (revert du commit)
   et consigner la décision au changelog.

**Diff CSS attendu** : disparition des deux règles `body::before` des blocs
anti-glare, rien d'autre.
**Commit** : `refactor(theme): engines phase 3 — drop full-screen backdrop-filter overlay`.

## Phase 4 — Finalisation

`pnpm build`, `pnpm lint`, `pnpm test` ; entrées changelog complètes ;
rapport final avec sorties brutes des diffs des trois phases et la liste
des valeurs modifiées en phase 2 (pour la validation visuelle de Simon) ;
mise à jour du README § 5 (constats résolus) et du guide (E2 : corrections
faites, propositions de mécanisme toujours en attente d'arbitrage).

---

## Hors périmètre (ne PAS faire)

- Migration des transformations vers OKLCH, ancres de teintes daltoniennes,
  tests de distinguabilité par simulation CVD — propositions en attente
  d'arbitrage (guide E2).
- Toute retouche du moteur high-contrast (décision Simon : on n'y revient
  que plus tard).
- Retouche des fenêtres de teinte au-delà de la correction de borne de la
  phase 1.
