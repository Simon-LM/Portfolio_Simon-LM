<!-- @format -->

# darkmode-plus-a11y — notice d'implémentation

Notice destinée aux **IA et développeurs** qui intègrent ce composant
d'accessibilité dans un projet. Lisez-la **avant** de câbler.

## Ce que vous venez de copier

`init` a copié dans votre projet (vous le **possédez**, modifiez-le) :

- `react/AccessibilityControl.tsx` — le déclencheur (bouton).
- `react/AccessibilityMenu.tsx` — la carte d'accessibilité.
- `react/accessibilityPreferences.ts` — état via le hook `usePreference`.
- `scss/accessibility-menu.scss`, `-trigger.scss` — styles de l'UI.
- `scss/accessibility-features.scss` — @font-face + classes + dyslexie + motion.
- `scss/theme.config.scss` — **couche 3** de l'UI (à câbler, voir plus bas).
- `scss/theme-example.scss` — assemblage de thèmes minimal (light + HC).

Le **moteur** (transformations de couleurs, hooks, garanties de contraste)
reste dans le paquet npm et se met à jour par version. L'**UI copiée** ne se
met PAS à jour toute seule : `darkmode-plus-a11y init --diff` montre les
évolutions de référence, à reporter à la main.

## Prérequis

- **Palettes Tailwind** : le système est ancré à la géométrie 11 poids de
  Tailwind (c'est ce qui garantit des couleurs bien espacées). Vos
  primitives de marque se déclarent comme `("famille", poids)`.
- Dépendances UI du projet : `react-select`, `react-icons`, et le paquet
  `darkmode-plus-a11y`.

## RÈGLE D'OR (couche 3)

Le système a **3 couches** : (1) palettes Tailwind, (2) **rôles** = l'API du
paquet, (3) vos **tokens** d'assignation.

> **Chaque token de couche 3 se définit À PARTIR D'UN RÔLE de couche 2,
> jamais une valeur brute** (`#hex`, une couleur Tailwind en dur…).

C'est ce qui fait que le fort contraste et les thèmes daltoniens
s'appliquent correctement : le moteur transforme les **rôles**, vos tokens
en héritent. Un token câblé en dur **échappe** aux thèmes (texte resté
coloré en plein fort contraste, etc.).

Rôles de couche 2 disponibles (à utiliser dans `theme.config.scss`) :

- Fonds : `$bg-base`, `$bg-subtle`, `$bg-container`, `$bg-container-high`,
  `$bg-emphasis`, `$bg-emphasis-strong`, `$bg-inverse`
- Textes : `$fg-base`, `$fg-muted`, `$fg-on-accent`, `$fg-on-emphasis`
- Marque : `$accent`, `$accent-strong`, `$accent-ink`, `$accent-soft`
- Liens / focus : `$link`, `$link-hover`, `$focus-ring`
- Bordures : `$border-base`, `$border-subtle`, `$border-strong`
- Statut : `$success`, `$danger`
- Rail : `$gray-50` … `$gray-950`, `$off-white`, `$near-black`

## Câblage minimal

1. **SCSS** : importez `theme-example.scss` (l'assemblage), puis
   `accessibility-menu.scss`, `accessibility-trigger.scss`,
   `accessibility-features.scss`. Étendez `theme-example` avec vos autres
   thèmes (dark, daltoniens, variantes HC) sur le même patron.
2. **Polices** : `init` a copié les fichiers dans `public/fonts` (chemin
   `$a11y-fonts-path`, défaut `/fonts`).
3. **Anti-FOUC** : posez `data-theme` sur `<html>` avant le premier paint
   (le paquet fournit `themeInitScript` — voir sa doc).
4. **UI** : rendez `<AccessibilityControl language="fr" />`
   **DANS LE FLUX** (typiquement votre header).
   - ⚠️ **JAMAIS `position: fixed` flottant** : ça chevauche le contenu aux
     grands zooms (faute d'accessibilité). Si aucun emplacement évident,
     utilisez une **bande pré-header** (bandeau au-dessus du header, icône à
     droite).
   - Props : `language` ("fr"|"en"), `position?`, `icon?`, `complianceUrl?`.

## Vérifier votre câblage

- `pnpm hc:audit` — inspecteur sémantique : signale un token dont le nom
  contredit la valeur émise en fort contraste (ex. `*-text` qui émet la
  couleur de fond → branchement à revoir).
- Le test de conformité de palette échoue si un token n'appartient pas à la
  palette du fort contraste (token non branché sur un rôle).

Ces contrôles sont en **lecture seule** : ils avertissent, ne modifient rien.
