<!-- @format -->

# Polices d'accessibilité embarquées — licences

Toutes les polices livrées dans `packages/a11y-prefs/fonts/files/` sont sous
**SIL Open Font License 1.1** (OFL), qui autorise l'embarquement et la
redistribution (y compris commerciale) tant que la police n'est pas vendue
seule et que la licence accompagne les fichiers.

Audit réalisé le 2026-07-08. **Chaque texte de licence canonique doit être
récupéré depuis la source officielle et figé ici avant publication npm
(chantier E7)** — les fichiers `*.txt` de ce dossier documentent la
licence et la source ; ils ne se substituent pas au texte OFL canonique.

| Famille | Licence | Détenteur du copyright | Source officielle |
| --- | --- | --- | --- |
| OpenDyslexic | SIL OFL 1.1 | Abelardo Gonzalez | https://opendyslexic.org |
| Andika | SIL OFL 1.1 | SIL International | https://software.sil.org/andika/ |
| Atkinson Hyperlegible Next | SIL OFL 1.1 | Braille Institute of America, Inc. | https://github.com/googlefonts/atkinson-hyperlegible |
| Lexend Giga | SIL OFL 1.1 | The Lexend Project Authors | https://github.com/googlefonts/lexend |
| Lexend Deca | SIL OFL 1.1 | The Lexend Project Authors | https://github.com/googlefonts/lexend |

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
