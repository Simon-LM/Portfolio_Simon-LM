<!-- @format -->

# Previews visuelles — chantier thèmes

Outils de validation visuelle **hors production** : rien ici n'est servi par
le site (seul `public/` est déployé).

## preview-dyslexie.html

Comparateur interactif du mode dyslexie (E5, phase 4) : témoin (site en mode
normal) / corps Sylexiad (site) / corps Andika (défaut du paquet), avec
curseurs `font-size-adjust`, agrandissement, line-height, letter-spacing.
Les polices sont embarquées en data-URI → le fichier s'ouvre directement
dans un navigateur (`file://`), aucun serveur requis.

Valeurs actées le 2026-07-09 (validation visuelle Simon) :
`font-size-adjust 0.56` · agrandissement `1` (off) · `line-height 1.75` ·
`letter-spacing 0.04em` · `word-spacing 0.128em`.

## Régénérer / adapter

```bash
python3 docs/theme-system/previews/generate-preview-dyslexie.py
```

Le script lit les polices dans `public/fonts/` et réécrit le HTML ici.

⚠️ Ne jamais copier ces fichiers dans `public/` de façon durable : la preview
embarque Sylexiad (EULA propriétaire) et n'a rien à faire en production.
