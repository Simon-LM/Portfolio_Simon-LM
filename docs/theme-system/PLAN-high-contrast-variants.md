<!-- @format -->

# Plan — Variantes du mode fort contraste + typographie HC

Rédigé le 2026-07-10 (après merge E5 `7bae83f`). Exécution sur branche
`feat/hc-variants`. Réflexion inspirée de ZoomText (Colour Enhancements :
presets deux-couleurs + toggle mémorisant le dernier choix), adaptée à
l'architecture de thèmes existante.

## Décisions actées (Simon, 2026-07-10)

- **4 variantes** (liste que Simon avait prévue) :
  1. **Jaune sur noir** — l'actuel, rendu inchangé, reste le défaut
  2. **Vert sur noir** — le classique « phosphore » des télé-agrandisseurs
  3. **Blanc sur noir** — contraste maximal sans teinte
  4. **Noir sur blanc** — polarité positive (préférée par certaines basses
     visions : cataracte vs DMLA)
- **UI** : un seul contrôle « Fort contraste » dans le menu (pas 4 boutons
  de thème). Le bouton actuel reste un **toggle clair** qui active le
  contraste maximal ; en dessous (ou intégré en *split button*), un
  **sélecteur de variante**. Forme exacte tranchée par Simon en voyant les
  deux ; reco : toggle + sélecteur visible quand actif (plus robuste
  lecteur d'écran / mobile que le split button).
- Le toggle réactive la **dernière variante utilisée** (patron ZoomText /
  `lastBaseTheme` généralisé).
- **Typo HC** : `font-size-adjust: 0.56`, corps ls `0.04em` / ws `0.128em`
  (valeurs déjà calibrées et validées visuellement par Simon le
  2026-07-09) ; interligne corps 1.75 déjà en place ; titres inchangés
  (0.02em / 1.5). **Atkinson confirmée** : conçue par le Braille Institute
  pour la basse vision — c'est son cas d'usage premier.
- **Pas de preview dédiée** : les variantes sont de vrais thèmes, Simon
  teste directement sur le site en dev.
- **Hors périmètre** : mode « teinte unique » façon ZoomText Blue Dye
  (c'est un besoin de confort lumineux → évolution éventuelle de l'axe
  anti-éblouissement, pas du HC) ; réécriture déclarative du HC (toujours
  reportée — on paramètre le mécanisme actuel, on ne le réécrit pas).

## Architecture

Chaque variante = **un vrai thème** `data-theme` (moteur, rapport de
contrastes, anti-FOUC, persistance gratuits). En interne :
`high-contrast` (jaune, valeur historique conservée pour les localStorage
existants), `high-contrast-green`, `high-contrast-white`,
`high-contrast-paper` (noir sur blanc — nom à confirmer par Simon).

Le fichier actuel `_high-contrast.scss` n'est pas monolithique : c'est une
**carte sémantique** (background/text/link/highlight/action/success/error)
passée à `transform-light-to-high-contrast` + surcharges focus/header.
Variante = même mixin avec une autre carte + surcharges paramétrées.

Point d'attention « noir sur blanc » : les surcharges focus actuelles
supposent un fond sombre (outline blanc) → paramétrer aussi les couleurs
de focus et les surcharges header par variante.

Chaque variante a besoin de **toute sa carte** (pas juste texte/fond) :
je propose des cartes complètes, le système de contrastes les vérifie
(seuils AAA comme l'actuel), Simon valide le rendu à l'écran.

## Phases

### Phase 0 — Préparation

Oracle : CSS compilé de référence (`main`), diff normalisé à chaque phase.

### Phase 1 — Typographie HC (changement visuel pré-validé)

Remplacer le bloc typo `html.high-contrast` de `_typography.scss` par
`@include a11y-font-class("high-contrast", "Atkinson Hyperlegible")` — le
mixin E5 émet exactement la structure voulue : police partout +
`font-size-adjust: 0.56` + corps 0.04em/1.75/0.128em + titres 0.02em/1.5.
Diff CSS attendu : confiné au bloc `html.high-contrast` (ls corps
0.02→0.04, ws 0.064→0.128, adjust ajouté).

**Commit** : `feat(theme): hc phase 1 — typographie (a11y-font-class, adjust 0.56)`.

### Phase 2 — Les 3 variantes SCSS (MINIMALE — technologie inchangée)

Cadrage réaffirmé par Simon (2026-07-10) : **la fonctionnalité existe, on
change les couleurs**. Pas de refonte sémantique ni technologique (les
deux = « second temps » explicitement reporté). Le mécanisme actuel
(`transform-light-to-high-contrast` + surcharges) est conservé tel quel ;
le mixin prend simplement la carte de couleurs en argument (défaut = la
carte actuelle → **jaune byte-identique**).

Palettes actées (proposées par moi, validées comme point de départ —
Simon juge chaque variante à l'écran) :

| Rôle | Jaune/noir (actuel) | Vert/noir | Blanc/noir | Noir/blanc |
| --- | --- | --- | --- | --- |
| Texte | `#ffff00` | `#00ff00` | `#ffffff` | `#000000` |
| Liens | `#00ffff` | `#00ffff` | `#00ffff` | `#0000cc` |
| Header (fond) | `#bfff00` | `#99ff99` | `#e0e0e0` | `#000000` (texte header blanc) |
| Action | `#ffffff` | `#ffffff` | `#ffff00` | `#000000` |
| Succès | `#00ff00` | `#00ff00` | `#00ff00` | `#007700` |
| Erreur | `#ff0000` | `#ff0000` | `#ff0000` | `#cc0000` |
| Focus | blanc | blanc | blanc | noir (rempli inversé) |

Philosophie : sur fond noir, les rôles « système » (liens/action/statut/
focus) restent communs ; seuls texte + header changent. Écarts imposés par
les collisions : action jaune en blanc/noir (sinon interactifs invisibles
dans la masse blanche) ; noir/blanc = miroir assombri complet (physique du
contraste : cyan/blanc/verts purs illisibles sur blanc).

1. Mixin paramétré (carte en argument, défauts actuels) + surcharges
   focus/header paramétrées **uniquement** pour les besoins de la variante
   papier (polarité inversée).
2. 3 fichiers de thème (green/white/paper) portant leur carte.
3. Blocs `[data-theme]` + 3 entrées THEMES/anti-FOUC (le rapport de
   contrastes et la garde anti-gamut couvrent les nouveaux thèmes
   automatiquement — rien à étendre). ⚠️ le test « script anti-FOUC
   byte-identique au littéral historique » (E4) devra être mis à jour :
   la liste des thèmes change, c'est voulu.

**Oracle** : thème jaune byte-identique ; nouveaux blocs = seuls ajouts.
**Commit** : `feat(theme): hc phase 2 — variantes green/white/paper`.

### Phase 3 — UI et runtime

1. `html.high-contrast` (classe typo) posée pour TOUTE variante
   (`theme.startsWith("high-contrast")`) ; `getColorVisionMode` mis à jour.
2. Mémoire de la dernière variante (persistée) ; le toggle l'active.
3. Sélecteur de variante sous le bouton (les 2 formes montrées à Simon :
   toggle+sélecteur vs split button — il tranche à l'écran) ; i18n FR/EN.

**Commit** : `feat(theme): hc phase 3 — toggle + sélecteur de variante`.

### Phase 4 — Finalisation

Suites + build + `contrast:report` (15 thèmes) ; docs (README § thèmes,
TODO : item « typo HC » soldé) ; changelog ; **smoke Simon variante par
variante** avant merge.

**Commit** : `docs(theme): hc phase 4 — finalisation`.

## Hors périmètre (ne PAS faire)

- Réécriture déclarative du mécanisme HC (reporté, décision antérieure).
- Mode teinte unique (Dye) — noté comme piste anti-éblouissement.
- Combinaisons HC × dyslexie : comportement actuel conservé (les classes
  coexistent, la police du sélecteur garde le dernier mot via l'ordre CSS).
