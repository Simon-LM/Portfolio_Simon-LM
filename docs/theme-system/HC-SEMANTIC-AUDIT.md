<!-- @format -->

# Audit sémantique du fort contraste

Artefact généré par `pnpm hc:audit` — ne pas éditer à la main.
Contrôle en LECTURE SEULE : les noms de variables ne décident d'aucune
couleur (le branchement couche 2 décide) ; ils servent d'inspecteurs.
Un avertissement = « le nom suggère une famille, la valeur émise la
contredit » — à vérifier, jamais bloquant.

## Avertissements actifs : 0

Aucun. Tous les noms sémantiques sont cohérents avec les
valeurs émises (ou couverts par un waiver argumenté).

## Waivers (contradictions légitimes) : 15

- `--bg-emphasis-strong` — surface d'emphase forte = bloc inversé par conception (texte posé dessus : --fg-on-emphasis)
- `--bg-inverse` — bloc volontairement INVERSÉ — l'inversion est déclarée dans le nom
- `--color-header-text-role` — texte du header, posé sur la bande colorée (highlight) : encre sombre légitime
- `--color-collapse-bg-title` — barre de titre des collapses = bloc d'emphase inversé (texte posé dessus en encre sombre)
