<!-- @format -->

# Plan d'exécution — E5 : modules de préférences (zoom, polices, animations)

**Document d'exécution destiné à une IA.** Mêmes règles générales que les
plans précédents : branche dédiée, un commit par phase, sortie brute des
vérifications, arrêt en cas d'imprévu, entrées [CHANGELOG.md](./CHANGELOG.md).
Conception de référence : [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md)
§ E5 et README § 6.5 (modules opt-in).

> **Statut : rédigé le 2026-07-07, révisé le 2026-07-08 (décisions de Simon
> sur les polices, la taille et les espacements du mode dyslexie), à
> exécuter.**

## ⛔ Prérequis bloquants

1. **E3 et E4 mergés** (fait : `812d5d5`, `19df328`).
2. **Audit de licences des polices** (fait) et **décisions de Simon** (ci-dessous)
   actées.

Branche : `feat/e5-modules`.

## Décisions actées (2026-07-08)

- **Polices embarquées dans le paquet** (toutes OFL, redistribuables) :
  **OpenDyslexic, Andika, Atkinson Hyperlegible Next, Lexend Giga, Lexend
  Deca**.
- **Exclues du paquet** :
  - **Sylexiad Sans/Serif** — EULA propriétaire (fév. 2022), pas de
    redistribution publique. Reste au portfolio ; le paquet **recommande
    aux consommateurs de la télécharger sur [sylexiad.com](https://www.sylexiad.com)**
    et de la brancher via le point d'extension.
  - **Tiresias Infofont** — GPL v3 (friction dans un paquet MIT) **et**
    absente du sélecteur actif du portfolio **et** police de signalétique
    (RNIB, étiquettes à 30-100 cm), pas de lecture web. Exclue.
  - **Raleway Dots** — absente du sélecteur actif, police décorative
    pointillée sans place en accessibilité. Exclue.
- **Mode dyslexie optimisé (`.dyslexia-optimized`)** : reconstruit en
  **module configurable à 3 niveaux** — titre (`h1`), sous-titre (`h2-h6`),
  corps (paragraphes + texte courant). Défauts : titre = Lexend Giga,
  sous-titre = Lexend Deca, **corps = Andika** ; le portfolio surcharge le
  corps avec **Sylexiad**. Différentes polices par niveau = choix de
  conception assumé (préserver la hiérarchie, ne pas aplatir).
- **Correction de rendu volontaire** (bug constaté le 2026-07-08) : le mode
  dyslexie **rétrécit** aujourd'hui les paragraphes (police de substitution
  à petite hauteur d'x, aucune compensation ; l'ancienne compensation est
  commentée). Fix propre : **`font-size-adjust`** (normalise la hauteur
  d'x) → le corps garde la bonne taille quelle que soit la police.
  Reco Simon : **compenser + ~+10 %** sur le corps. **Espacements** (British
  Dyslexia Association, points de calibration validés visuellement) :
  line-height **~1.7**, letter-spacing **~0.05em**, word-spacing **~0.16em**.
- **Sélecteur de police individuel** (OpenDyslexic / Atkinson / Andika +
  Sylexiad côté site) : reçoit aussi la compensation `font-size-adjust`
  (même bug de rétrécissement).
- **High-contrast (taille/espacements/`font-size-adjust`)** : hors
  périmètre E5, noté au [TODO.md](./TODO.md) « à optimiser plus tard ».

## Objectif et périmètre

| Va dans le paquet | Reste dans le portfolio |
| --- | --- |
| `fonts/` : OpenDyslexic, Andika, Atkinson, Lexend Giga/Deca + `LICENSES/` | `public/fonts/` inchangé (le site sert SES fichiers, Sylexiad comprise) |
| `scss/modules/_a11y-fonts.scss` : `@font-face` (chemin `$a11y-fonts-path !default`), classes du sélecteur (`.dyslexic-font`, `.atkinson-font`, `.andika-font`) **+ `font-size-adjust`**, et le mixin du **mode dyslexie configurable** (`$dyslexia-fonts`, `$dyslexia-spacing` `!default`) | classes/`@font-face` **Sylexiad**, marque (Inter, Quicksand), surcharges site-spécifiques du mode dyslexie (`.header__title-name`…), config `with(body: Sylexiad)` |
| `scss/modules/_motion.scss` : `@media (prefers-reduced-motion)` générique, classe `.reduce-motion`, mixin `motion-safe` | sélecteurs motion propres au site (`.portfolio__card`…) |
| `react/` : appliers DOM SSR-safe + `usePreference` générique + types | stores zustand (`fontSizeStore`, `dyslexicFontStore`) + toggle motion : **conservés**, délèguent l'application DOM ; clés/formats localStorage inchangés |

## Oracles

- **Phases 1-3 (relocation)** : CSS byte-identique modulo pragmas (règle
  E3) ; comportement identique (clés localStorage `font-size-storage`,
  `reduce-motion`, store dyslexique ; mêmes classes DOM ; bornes de zoom
  75-150). Diff normalisé exigé.
- **Phase 4 (corrections volontaires)** : **le rendu change exprès** pour
  le mode dyslexie et les classes de police (taille compensée + agrandie,
  espacements). L'oracle byte-identique **ne s'applique pas** à ces
  blocs ; il reste exigé partout ailleurs (thèmes, autres composants).
  **Validation visuelle de Simon requise.**
- **Anti-dérive des polices** : test comparant les checksums des fichiers
  `packages/a11y-prefs/fonts/` avec `public/fonts/` (copies identiques
  jusqu'au CLI E6).
- Suite complète + build + lint + tsc verts à chaque phase.

## Phase 0 — Préparation

Arbre propre, branche, baseline CSS (`/tmp/e5-modules/phase0.css`,
`--load-path=node_modules`). Inventaire exact et **capture du rendu
actuel** des blocs qui changeront en phase 4 (`.dyslexia-optimized`, les
classes `.dyslexic-font`/`.atkinson-font`/`.andika-font`) pour comparaison
avant/après. Localiser `@font-face`, classes de police, bloc
`.reduce-motion` et `@media prefers-reduced-motion`.

## Phase 1 — Polices redistribuables + licences dans le paquet

1. Copier (pas déplacer) vers `packages/a11y-prefs/fonts/` : OpenDyslexic,
   Andika, Atkinson Hyperlegible Next, Lexend Giga, Lexend Deca. **Jamais
   Sylexiad, ni Tiresias, ni Raleway Dots.**
2. `packages/a11y-prefs/fonts/LICENSES/` : un fichier OFL par famille
   (copyright propre) + `README.md` récapitulatif de l'audit **incluant la
   recommandation de télécharger Sylexiad sur sylexiad.com** pour qui la
   veut.
3. Test anti-dérive (checksums) dans la suite Jest.
4. `"files"` du package.json du paquet : ajouter `fonts`.

**Oracle** : CSS byte-identique strict (aucun SCSS touché).
**Commit** : `feat(theme): e5 phase 1 — redistributable fonts + licenses into the package`.

## Phase 2 — Modules SCSS opt-in (relocation byte-identique)

Déplacement **sans changement de rendu** (les corrections sont en phase 4) :

1. `scss/modules/_a11y-fonts.scss` : les `@font-face` des familles du
   paquet (chemin `$a11y-fonts-path: "/fonts" !default`) + les classes du
   sélecteur telles quelles (`.dyslexic-font`, `.atkinson-font`,
   `.andika-font`) et le bloc `.dyslexia-optimized` **copié à l'identique**
   (sa refonte configurable est en phase 4).
2. `scss/modules/_motion.scss` : `@media (prefers-reduced-motion)` +
   `.reduce-motion` génériques + mixin `motion-safe`.
3. Portfolio : `_typography.scss` garde marque + **Sylexiad** (classes +
   `@font-face`) ; il `@use` les modules et conserve ses sélecteurs
   site-spécifiques. Les `@font-face`/classes **Tiresias et Raleway Dots
   morts** (fonts non embarquées, absentes du sélecteur actif) sont
   **retirés** — suppression de code mort, aucun élément ne les portait.

**Oracle** : CSS byte-identique modulo pragmas **et** modulo la suppression
des règles mortes Tiresias/Raleway (diff attendu = uniquement ces règles ;
sortie brute au rapport).
**Commit** : `refactor(theme): e5 phase 2 — opt-in scss modules (relocation)`.

## Phase 3 — Appliers DOM + usePreference (react)

1. `react/appliers.ts` : `applyFontSizeFactor(percent)` (`--font-size-factor`,
   formule `size/100`), `applyAccessibilityFont(font, extraClasses?)`
   (retire toutes les classes, pose la bonne — `extraClasses` couvre
   Sylexiad côté portfolio), `applyReduceMotion(enabled)`. SSR-safe.
2. `react/usePreference.ts` : `usePreference<T>(key, { defaultValue,
   serialize?, deserialize?, apply })` — init paresseuse localStorage,
   application DOM, setter persistant. **Tests unitaires** (jsdom).
   `useTheme` n'est PAS migré dessus (zéro churn, itération ultérieure).
3. Portfolio : `fontSizeStore`/`dyslexicFontStore`/toggle motion délèguent
   l'application DOM aux appliers — état, clés, formats inchangés.

**Oracle** : comportement identique (mêmes classes, mêmes clés — tests du
menu + test de non-régression des noms de classes), CSS intact.
**Commit** : `refactor(theme): e5 phase 3 — DOM appliers + generic usePreference`.

## Phase 4 — Corrections de rendu (VISUEL, validé par Simon)

1. **`font-size-adjust`** sur les classes du sélecteur
   (`.dyslexic-font`/`.atkinson-font`/`.andika-font`) et sur le corps du
   mode dyslexie : normalise la hauteur d'x → plus de rétrécissement.
   Valeur cible = calibration (viser l'apparence d'Inter ; `from-font` si
   le support le permet, sinon valeur numérique). **+~10 %** sur le corps
   du mode dyslexie.
2. **Mode dyslexie configurable** : réécrire `.dyslexia-optimized` via un
   mixin piloté par `$dyslexia-fonts` (title/subtitle/body) et
   `$dyslexia-spacing` (line-height ~1.7, letter-spacing ~0.05em,
   word-spacing ~0.16em), ciblant les niveaux **sémantiques**
   (`h1`, `h2-h6`, corps). Défaut corps = **Andika**. Le portfolio passe
   `with (body: Sylexiad)` + garde ses surcharges de classes
   site-spécifiques (`.header__title-name`…).
3. Retirer les traces de compensation commentées obsolètes.
4. **Diff CSS attendu** confiné aux blocs `.dyslexia-optimized` et aux
   classes de police ; sortie brute au rapport ; captures avant/après.

**Oracle** : NON byte-identique (changements voulus) ; reste du CSS
inchangé ; **validation visuelle de Simon** (mode dyslexie : taille des
paragraphes, espacements ; chaque police du sélecteur : taille correcte).
**Commit** : `feat(theme): e5 phase 4 — fix a11y font sizing + configurable dyslexia mode`.

## Phase 5 — Finalisation

1. Suites complètes + build + `contrast:report` (inchangé) ; smoke manuel
   (zoom, chaque police — dont Sylexiad —, mode dyslexie, réduction
   d'animations, persistance au reload).
2. Docs : README § 3 et § 6.5, guide § E5 (fait), TODO (audit coché,
   décisions Tiresias/Raleway/Sylexiad consignées) ; changelog de synthèse
   avec tableau avant/après du mode dyslexie ; rapport final.

**Commit** : `docs(theme): e5 phase 5 — finalization`.

## Hors périmètre (ne PAS faire)

- Migrer `useTheme` sur `usePreference` (itération ultérieure).
- Migrer les stores zustand vers les hooks du paquet (le consommateur
  garde son état ; le paquet fournit les appliers).
- **Optimisation typographique du high-contrast** (taille, espacements,
  `font-size-adjust`) — notée au TODO, après E5.
- L'UI (E6), le dist publiable et la publication + le nom (E7).
- La question Sylexiad-servie-par-le-site (décision Simon, hors chantier).
- Anti-FOUC des préférences non-thème (zoom/police à la réhydratation
  zustand) — amélioration future, pas ici.
