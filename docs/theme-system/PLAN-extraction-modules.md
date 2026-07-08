<!-- @format -->

# Plan d'exécution — E5 : modules de préférences (zoom, polices, animations)

**Document d'exécution destiné à une IA.** Mêmes règles générales que les
plans précédents : branche dédiée, un commit par phase, sortie brute des
vérifications, arrêt en cas d'imprévu, entrées [CHANGELOG.md](./CHANGELOG.md).
Conception de référence : [GUIDE-extraction-paquet.md](./GUIDE-extraction-paquet.md)
§ E5 et README § 6.5 (modules opt-in).

> **Statut : rédigé le 2026-07-07, à exécuter.**

## ⛔ Prérequis bloquants

1. **E3 et E4 mergés** (fait : `812d5d5`, `19df328`).
2. **Audit de licences des polices** (fait le 2026-07-07, résultats
   ci-dessous) et **arbitrage Tiresias rendu par Simon**.

Branche : `feat/e5-modules`.

## Audit de licences (2026-07-07) — résultats actés

| Police | Licence | Embarquable dans le paquet ? |
| --- | --- | --- |
| OpenDyslexic | SIL OFL | ✅ oui |
| Andika | SIL OFL | ✅ oui |
| Raleway Dots | SIL OFL | ✅ oui |
| Atkinson Hyperlegible Next (VF) | **SIL OFL** (confirmé, Braille Institute 2025) | ✅ oui |
| Tiresias Infofont | **GPL v3 + exception d'embarquement** (RNIB, 2007) | ⚠️ redistribuable (les distros Linux le font), mais GPL dans un paquet MIT = agrégation à licence distincte — **arbitrage Simon** : inclure avec sa licence jointe, ou exclure |
| Sylexiad Sans / Serif | **EULA propriétaire (fév. 2022)** : pas de redistribution publique, fichiers non téléchargeables publiquement | ❌ **exclue du paquet.** Reste dans `public/fonts` du portfolio (usage site). ⚠️ Question séparée pour Simon : l'EULA demande que les fichiers webfont ne soient « pas téléchargeables publiquement » — les woff2 servis par le site le sont techniquement ; à trancher hors chantier |

Conséquence : le sélecteur de police du paquet expose les familles
embarquées + un **point d'extension** (le consommateur déclare ses
familles supplémentaires — c'est ainsi que le portfolio garde Sylexiad).

## Objectif et périmètre

| Va dans le paquet | Reste dans le portfolio |
| --- | --- |
| `fonts/` : jeux redistribuables + `LICENSES/` (un fichier par police) | `public/fonts/` inchangé (le site continue de servir SES fichiers, Sylexiad comprise) |
| `scss/modules/_a11y-fonts.scss` : `@font-face` (chemin configurable `$a11y-fonts-path !default`) + classes `.dyslexic-font`… | `_typography.scss` : polices de marque (Inter, Quicksand, Lexend…) + `@font-face` Sylexiad + classes Sylexiad |
| `scss/modules/_motion.scss` : bloc `prefers-reduced-motion`, classe `.reduce-motion`, mixin `motion-safe` | les sélecteurs *spécifiques au site* du bloc motion (`.portfolio__card`…) restent portfolio |
| `react/` : appliers DOM SSR-safe (`applyFontSizeFactor`, `applyAccessibilityFont`, `applyReduceMotion`) + `usePreference(key, options)` générique (E4 l'avait reporté ici) + types (`AccessibilityFont`) | stores zustand (`fontSizeStore`, `dyslexicFontStore`) et l'état `reduceMotion` du menu : **conservés tels quels**, ils délèguent seulement l'application DOM aux appliers du paquet — clés/formats localStorage inchangés (zéro migration de données utilisateur) |

**Oracles** :

1. CSS byte-identique modulo pragmas (même règle qu'E3 — le déplacement
   des `@font-face` peut réordonner des commentaires, pas des règles ;
   diff normalisé exigé).
2. **Comportement identique** : clés localStorage (`font-size-storage`,
   `reduce-motion`, celle du store dyslexique) et formats (JSON zustand)
   inchangés ; mêmes classes DOM posées ; mêmes bornes de zoom (75–150,
   pas de 10).
3. **Anti-dérive des polices** : test comparant les checksums des fichiers
   de `packages/a11y-prefs/fonts/` avec leurs homologues de
   `public/fonts/` (les deux copies doivent rester identiques jusqu'à ce
   que le CLI E6 prenne le relais de l'installation).
4. Suite complète + build + lint + tsc verts à chaque phase.

## Phase 0 — Préparation

Arbre propre, branche, baseline CSS (`/tmp/e5-modules/phase0.css`,
`--load-path=node_modules`), inventaire exact : localisation des
`@font-face` a11y, des classes de police, du CSS `.reduce-motion` (le
bloc média est dans `_motion.scss` ; vérifier où vivent les styles de la
classe) et des usages `motion`/`transition` couverts.

## Phase 1 — Polices + licences dans le paquet

1. Copier (pas déplacer : `public/fonts` continue de servir le site) les
   jeux **redistribuables** vers `packages/a11y-prefs/fonts/` : OpenDyslexic,
   Andika, Raleway Dots, Atkinson Hyperlegible Next (+ Tiresias si
   l'arbitrage de Simon est « inclure »). **Jamais Sylexiad.**
2. `packages/a11y-prefs/fonts/LICENSES/` : un fichier par famille (texte
   OFL avec copyright propre à chaque police ; GPL v3 + exception pour
   Tiresias le cas échéant), + un `README.md` récapitulatif de l'audit.
3. Test anti-dérive (oracle n° 3) dans la suite Jest.
4. `"files"` du package.json du paquet : ajouter `fonts`.

**Oracle** : CSS byte-identique strict (aucun SCSS touché).
**Commit** : `feat(theme): e5 phase 1 — redistributable fonts + licenses into the package`.

## Phase 2 — Modules SCSS opt-in

1. `scss/modules/_a11y-fonts.scss` : les `@font-face` des familles du
   paquet, chemin des assets configurable
   (`$a11y-fonts-path: "/fonts" !default` — le portfolio garde sa valeur
   actuelle), + les classes d'application (`.dyslexic-font`,
   `.atkinson-font`, `.andika-font`, `.tiresias-font`,
   `.ralewaydots-font`) extraites de `_typography.scss`.
2. `scss/modules/_motion.scss` : le bloc `@media (prefers-reduced-motion)`
   générique (sélecteurs universels), la classe `.reduce-motion`
   équivalente, et un mixin `motion-safe` documenté (contrat hôte). Les
   sélecteurs propres au site (`.portfolio__card`, `.skills__…`) restent
   dans le fichier portfolio, qui `@use` le module et ajoute les siens.
3. Le portfolio bascule : `_typography.scss` garde marque + Sylexiad ;
   `_motion.scss` portfolio devient consommation du module + sélecteurs
   site. Modules **opt-in** : chargés uniquement si le consommateur les
   `@use` (le portfolio les charge).

**Oracle** : CSS byte-identique modulo pragmas (diff normalisé : zéro
règle/valeur changée, ordre des règles inchangé).
**Commit** : `refactor(theme): e5 phase 2 — opt-in scss modules (a11y fonts, motion)`.

## Phase 3 — Appliers DOM + usePreference (react)

1. `react/appliers.ts` : `applyFontSizeFactor(percent)` (pose
   `--font-size-factor`, même formule `size/100`),
   `applyAccessibilityFont(font)` (retire toutes les classes, pose la
   bonne — y compris les familles d'extension déclarées par le
   consommateur : signature `applyAccessibilityFont(font, extraClasses?)`
   pour couvrir Sylexiad côté portfolio), `applyReduceMotion(enabled)`.
   SSR-safe (no-op sans `document`).
2. `react/usePreference.ts` : hook générique
   `usePreference<T>(key, { defaultValue, serialize?, deserialize?, apply })`
   — init paresseuse localStorage, application DOM, setter persistant.
   **Tests unitaires dédiés** (jsdom). `useTheme` n'est PAS migré dessus
   dans ce chantier (zéro churn — la migration est une itération
   ultérieure documentée).
3. Portfolio : `fontSizeStore`/`dyslexicFontStore`/le toggle motion du
   menu remplacent leur code d'application DOM par les appliers du paquet
   — état, clés et formats localStorage strictement inchangés.

**Oracle** : comportement identique (mêmes classes posées, mêmes clés —
vérifié par les tests existants du menu + un test de non-régression des
noms de classes), CSS intact.
**Commit** : `refactor(theme): e5 phase 3 — DOM appliers + generic usePreference`.

## Phase 4 — Finalisation

1. Suites complètes + build + `contrast:report` (inchangé) ; smoke manuel
   (zoom, changement de police — dont Sylexiad —, réduction d'animations,
   persistance au reload).
2. Docs : README § 3 et § 6.5 (modules : fait), guide § E5, TODO (audit
   licences : coché) ; changelog de synthèse ; rapport final.

**Commit** : `docs(theme): e5 phase 4 — finalization`.

## Hors périmètre (ne PAS faire)

- Migrer `useTheme` sur `usePreference` (itération ultérieure).
- Migrer les stores zustand vers les hooks du paquet (le consommateur
  garde son gestionnaire d'état ; le paquet fournit les appliers).
- Le « mode dyslexie optimisé » (espacements/interlignage) : n'existe pas
  dans le portfolio, ne pas l'inventer ici.
- L'UI (E6), le dist publiable et la publication (E7).
- Corriger la question Sylexiad-servie-par-le-site (décision Simon, hors
  chantier).
- Anti-FOUC des préférences non-thème (zoom/police appliqués à la
  réhydratation zustand, comme aujourd'hui) — amélioration future notée,
  pas dans ce chantier.
