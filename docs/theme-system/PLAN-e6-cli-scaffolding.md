<!-- @format -->

# Plan — Chantier E6 : templates UI + CLI de scaffolding

Rédigé le 2026-07-12 (après merge hc-mécanique `dc9bef0`). Exécution sur
branche `feat/e6-cli`. Référence : GUIDE-extraction-paquet.md § E6 —
modèle **shadcn** (décision Simon 2026-07-03 : les devs possèdent et
modifient leur UI, elle n'est pas dans npm ; seuls les moteurs le sont).

## Ce que le consommateur obtient à la fin

```
pnpm dlx a11y-prefs init        # nom de travail — définitif en E7
```

copie dans son projet : le **déclencheur** (bouton flottant) + la **carte
d'accessibilité** complète (React + SCSS), `theme.config.scss` (sa config
couche 3 commentée) et des exemples. `init --diff` compare ensuite son UI
locale à la référence du paquet (mises à jour à la shadcn : le dev voit ce
qui a changé et reporte ce qu'il veut).

## État des lieux (relevé du 2026-07-12)

- Déclencheur : `src/accessibility/accessibilityControl/AccessibilityControl.tsx`.
- Carte : `AccessibilityMenu.tsx` (972 lignes) + `_accessibility-menu.scss`
  (1179 lignes) + parties de `_a11y.scss` (237 lignes).
- Adhérences à généraliser : 17 mentions Sylexiad (police du site, non
  distribuable) ; `next/link` (1 occurrence, lien vers la politique
  d'accessibilité) ; stores zustand du portfolio (fontSize, dyslexicFont) ;
  `react-select` + `react-icons` (dépendances UI) ; labels i18n FR/EN
  inline (patron sain, conservé).

## Décisions déjà actées / recommandations à arbitrer

1. **Le portfolio ne bouge pas** : son UI reste telle quelle (elle est
   l'ancêtre des templates, pas leur consommatrice). Oracle du chantier :
   **zéro changement du site**. Le passage du portfolio aux templates
   scaffoldés est une décision séparée, post-E7 si souhaitée.
2. **Templates = ton menu, généralisé** : même design, mêmes patrons
   (boutons-preview HC, sélecteurs, i18n par prop `language`), mais :
   polices du paquet uniquement (OpenDyslexic/Atkinson/Andika) + **point
   d'extension documenté** pour les polices maison (le patron Sylexiad) ;
   `next/link` remplacé par un `<a>` (ou prop de rendu) ; lien « politique
   d'accessibilité » paramétrable.
3. **Reco à arbitrer — l'état dans les templates** : remplacer les stores
   zustand par le hook `usePreference` du paquet (zéro dépendance d'état
   pour le consommateur, et ça fait ses preuves au vrai usage). Le
   portfolio garde ses stores.
4. **Reco à arbitrer — dépendances UI des templates** : garder
   `react-select` (sélecteurs daltonisme/polices, ton SCSS les couvre) et
   `react-icons` (icône du déclencheur) comme dépendances **du projet
   consommateur** (le CLI les signale à l'init s'il ne les trouve pas).
   Alternative : select natif + SVG inline (zéro dépendance, mais on
   s'éloigne de ton UI éprouvée).
5. **CLI minimal, sans framework** : script Node pur (`bin` du paquet),
   deux commandes — `init [--dir <chemin>] [--force]` (copie, refuse
   d'écraser sans `--force`) et `init --diff` (statut par fichier :
   identique / modifié localement / nouveau dans la référence).
6. La **notice IA** (contrat couche 3, rôles, exemples — pattern
   AGENTS.md/llms.txt) : sa première version est livrée avec les templates
   (le CLI la copie aussi), peaufinée en E7.

## Phases

### Phase 0 — Préparation

Oracle : CSS compilé + build du site de référence ; AUCUN fichier du site
ne doit changer pendant tout le chantier (vérifié à chaque phase).

### Phase 1 — Templates React (`packages/a11y-prefs/templates/react/`)

Déclencheur + carte, dérivés des composants du portfolio, généralisés
(décisions 2-4). N'importent QUE l'API publique du paquet. Compilables
hors du portfolio (vérifié par un tsc dédié en phase 4).

**Commit** : `feat(theme): e6 phase 1 — templates react (déclencheur + carte)`.

### Phase 2 — Templates SCSS + config

`templates/scss/` : le SCSS du menu généralisé (rem-first, zoom-robuste —
copie de l'architecture de Simon, pas de réécriture) ; `theme.config.scss`
= config couche 3 commentée (rôles → tokens, exemples) ; blocs
`[data-theme]` d'exemple.

**Commit** : `feat(theme): e6 phase 2 — templates scss + theme.config`.

### Phase 3 — Le CLI

`packages/a11y-prefs/bin/cli.mjs` (Node pur) : `init` + `init --diff`
(décision 5), messages clairs, détection des dépendances UI manquantes.

**Commit** : `feat(theme): e6 phase 3 — cli init + diff`.

### Phase 4 — Vérification et docs

1. Tests : exécution du CLI dans un répertoire temporaire (fichiers créés,
   refus d'écrasement, diff) ; tsc de compilabilité des templates ;
   suites complètes du site inchangées.
2. Docs : README chantier, notice IA v1 (`templates/AGENTS.md`),
   changelog, rapport final.

**Commit** : `docs(theme): e6 phase 4 — finalisation`.

## Hors périmètre (ne PAS faire)

- Faire consommer les templates par le portfolio (post-E7, décision Simon).
- Publication npm, nom définitif, dist (E7).
- Traductions au-delà de FR/EN (le patron i18n reste celui de Simon).
