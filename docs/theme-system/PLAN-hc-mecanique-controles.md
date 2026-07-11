<!-- @format -->

# Plan — Mécanique du fort contraste : rôle focus + contrôles d'outillage

Rédigé le 2026-07-11, après la réflexion « second temps HC » menée avec
Simon (archéologie du mécanisme comprise). Exécution sur branche
`feat/hc-mecanique`.

## L'archéologie qui fonde les décisions (vérifiée dans git)

- **Design d'origine de Simon** : capture **par les noms de couche 3**
  (`transform-for-high-contrast($color, $element-type)`, `str-index` sur
  `_bg`/`_text`/`link`/`heading`/`hover`/`focus`/`success`) + clarté en
  filet. Garantissait notamment le focus par son nom.
- **Supplanté pendant ce chantier d'extraction** (commit `3195de4`, par
  Claude — pas une décision) par le mécanisme actuel : assignations
  explicites des ~19 rôles de **couche 2** dans le moteur + héritage de la
  couche 3 **par branchement** + clarté pour les non-assignés (gris
  intermédiaires, accents). La fonction d'origine, devenue code mort, a
  été supprimée au nettoyage du 2026-07-03 (`f16842d`).
- Architecture 3 couches (vocabulaire de Simon) : couche 1 = palettes
  Tailwind ; couche 2 = variables de rôle (API du paquet) ; couche 3 =
  noms d'assignation (config du consommateur).

## Décisions actées (Simon, 2026-07-11)

1. **Décision des couleurs = branchement couche 2 seul** (mécanisme actuel
   conservé). La capture par noms ne revient PAS comme mécanisme — fait
   technique : Sass ne sait pas lire les noms ; l'ancienne fonction
   exigeait de déclarer chaque token à la main, soit la même discipline
   que le branchement (le filet a les mêmes trous que le sol).
2. **Le focus est promu rôle de couche 2** — restaure la garantie du
   design d'origine, pour tous les consommateurs (aujourd'hui : simples
   arguments du mixin local, aucune garantie moteur).
3. **Deux contrôles en lecture seule dans l'outillage** (ne modifient
   JAMAIS une couleur ; warnings au build/test, invisibles aux visiteurs) :
   - **Par valeur** : en thème HC, toute couleur émise doit appartenir à
     la palette du thème. Attrape tout token non branché (valeur brute).
   - **Par noms** (la sémantique de Simon, recyclée en inspecteur) :
     synonymes par famille (text/fg/ink…, bg/surface…, link/anchor…,
     focus/outline…) ; si le nom suggère une famille et que la valeur
     émise la contredit (ex. `*_text` qui émet la couleur de fond),
     warning. Attrape les branchements DE TRAVERS qui tombent dans la
     palette — l'angle mort du contrôle par valeur. Faux positif = un
     avertissement de trop, jamais une couleur fausse.
4. **Notice d'implémentation orientée IA** (pattern AGENTS.md/llms.txt du
   paquet) : les implémenteurs seront surtout des IA ; le contrat
   « couche 3 = toujours dérivée d'un rôle de couche 2, jamais de valeur
   brute » doit leur être écrit. Livrable rattaché à E6/E7 ; le contrat
   rédigé en phase 4 en sera la base.
5. **Garé (« à réfléchir, risqué »)** : le sort des 4 rôles `$accent*` en
   HC (aujourd'hui écrasés par clarté ; le header de Simon était une
   surcharge manuelle, l'accent n'a jamais fait partie de son design HC).
6. Prérequis **Tailwind** réaffirmé (géométrie 11 poids obligatoire).

## Phases

### Phase 0 — Préparation

CSS compilé de référence (`main`), diff normalisé à chaque phase.

### Phase 1 — Rôle focus en couche 2 (rendu identique)

1. Slot `"focus"` (+ `"focus-text"` si nécessaire) dans `$hc-palette`
   (moteur) et dans les cartes des 4 variantes.
2. Le mixin consommateur (`_high-contrast.scss` du portfolio) lit le
   focus depuis la carte (les arguments `$focus-*` actuels deviennent
   des surcharges optionnelles, défaut = la carte).

**Oracle** : 4 variantes byte-identiques (les valeurs ne changent pas,
seule la tuyauterie).
**Commit** : `feat(theme): hc-mécanique phase 1 — focus promu rôle`.

### Phase 2 — Contrôle par valeur

Test Jest dans l'outillage contraste : pour chaque thème `high-contrast*`,
chaque custom property de couleur émise ∈ palette du thème. Mécanique de
waivers pour les cas légitimes documentés (à découvrir à la première
exécution — l'état actuel du portfolio sert de calibration).

**Oracle** : aucun CSS modifié ; le test décrit l'existant (les écarts
trouvés sont documentés, pas corrigés en douce — arbitrages Simon).
**Commit** : `feat(theme): hc-mécanique phase 2 — contrôle palette HC`.

### Phase 3 — Contrôle par noms (l'inspecteur sémantique)

Audit : familles de synonymes → incohérences nom/valeur émise dans les
thèmes HC → warnings listés (console + artefact de rapport). Jamais
bloquant, jamais de modification.

**Commit** : `feat(theme): hc-mécanique phase 3 — inspecteur sémantique`.

### Phase 4 — Docs et finalisation

README chantier (§ mécanique HC : les 2 étages décision/contrôle, le
contrat couche 3), rédaction du contrat (base de la future notice IA),
changelog, TODO (réflexion « second temps mécanique » soldée — reste
l'item accent garé), rapport final.

**Commit** : `docs(theme): hc-mécanique phase 4 — finalisation`.

## Hors périmètre (ne PAS faire)

- Retour de la capture par noms comme mécanisme de décision.
- Le sort des rôles `$accent*` en HC (garé, décision Simon à venir).
- Refonte de la technologie de fond du HC (« second temps » toujours
  reporté) ; `forced-colors: active` (noté pour le paquet, plus tard).
- La notice IA elle-même (livrable E6/E7 — seule sa base est rédigée ici).
