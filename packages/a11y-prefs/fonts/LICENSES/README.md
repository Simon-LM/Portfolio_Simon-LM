<!-- @format -->

# Polices d'accessibilité embarquées — licences

Toutes les polices livrées dans `packages/a11y-prefs/fonts/files/` sont sous
**SIL Open Font License 1.1** (OFL), qui autorise l'embarquement et la
redistribution (y compris commerciale) tant que la police n'est pas vendue
seule et que la licence accompagne les fichiers.

Audit réalisé le 2026-07-08. **Textes canoniques figés le 2026-07-13**
(préparation E7) : chaque fichier `*.txt` de ce dossier EST le texte OFL 1.1
canonique, téléchargé verbatim depuis la source officielle du projet de
police (en-tête de copyright + corps OFL intégral). Copyrights réels tels
que déclarés dans ces textes :

| Famille | Fichier | Copyright (verbatim OFL) | Source officielle |
| --- | --- | --- | --- |
| OpenDyslexic | `OpenDyslexic.txt` | Abbie Gonzalez | github.com/antijingoist/opendyslexic |
| Andika | `Andika.txt` | SIL Global | github.com/silnrsi/font-andika |
| Atkinson Hyperlegible Next | `AtkinsonHyperlegibleNext.txt` | The Atkinson Hyperlegible Next Project Authors | github.com/googlefonts/atkinson-hyperlegible-next |
| Lexend Giga + Deca | `Lexend.txt` | The Lexend Project Authors | github.com/googlefonts/lexend |

## Police recommandée mais NON embarquée : Sylexiad

**Sylexiad Sans** (Dr Robert Hillier) est la police de corps **recommandée**
pour le mode dyslexie de ce paquet — légère, élégante, conçue pour les
lecteurs dyslexiques adultes. Elle est **sous EULA propriétaire** (fév.
2022) qui interdit la redistribution publique : **elle n'est donc pas
livrée avec le paquet**.

➡️ Pour l'utiliser : téléchargez-la sur **https://www.sylexiad.com** et
branchez-la via le point d'extension du module de polices
(`$dyslexia-fonts` côté SCSS + `extraClasses` côté runtime). Sans cela, le
mode dyslexie utilise **Andika** (défaut OFL livré), qui fonctionne sans
rien installer.

## Polices écartées

- **Tiresias Infofont** (RNIB) : GPL v3 — friction avec la licence MIT du
  paquet ; conçue pour la signalétique (étiquettes à 30-100 cm), pas la
  lecture web. Non embarquée.
- **Raleway Dots** : police décorative pointillée, sans usage
  d'accessibilité pertinent. Non embarquée.
