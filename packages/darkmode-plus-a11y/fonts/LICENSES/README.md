<!-- @format -->

# Bundled accessibility fonts — licenses

All fonts shipped in `packages/darkmode-plus-a11y/fonts/files/` are under the
**SIL Open Font License 1.1** (OFL), which allows embedding and
redistribution (including commercial) as long as the font is not sold on
its own and the license accompanies the files.

Audit performed on 2026-07-08. **Canonical texts frozen on 2026-07-13**
(E7 preparation): each `*.txt` file in this folder IS the canonical OFL 1.1
text, downloaded verbatim from the font project's official source
(copyright header + full OFL body). Actual copyright holders as declared
in these texts:

| Family | File | Copyright (verbatim OFL) | Official source |
| --- | --- | --- | --- |
| OpenDyslexic | `OpenDyslexic.txt` | Abbie Gonzalez | github.com/antijingoist/opendyslexic |
| Andika | `Andika.txt` | SIL Global | github.com/silnrsi/font-andika |
| Atkinson Hyperlegible Next | `AtkinsonHyperlegibleNext.txt` | The Atkinson Hyperlegible Next Project Authors | github.com/googlefonts/atkinson-hyperlegible-next |
| Lexend Giga + Deca | `Lexend.txt` | The Lexend Project Authors | github.com/googlefonts/lexend |

## Recommended but NOT bundled font: Sylexiad

**Sylexiad Sans** (Dr Robert Hillier) is the **recommended** body font for
this package's dyslexia mode — light, elegant, designed for adult
dyslexic readers. It is under a **proprietary EULA** (Feb. 2022) that
prohibits public redistribution: **it is therefore not shipped with the
package**.

To use it: download it from **<https://www.sylexiad.com>** and wire it
through the font module's extension point (`$dyslexia-fonts` on the SCSS
side + `extraClasses` on the runtime side). Without it, dyslexia mode
falls back to **Andika** (the bundled OFL default), which works with
nothing to install.

## Fonts excluded

- **Tiresias Infofont** (RNIB): GPL v3 — friction with the package's MIT
  license; designed for signage (labels read at 30-100 cm), not web
  reading. Not bundled.
- **Raleway Dots**: a decorative dotted font, with no relevant
  accessibility use case. Not bundled.
