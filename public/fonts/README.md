<!-- @format -->

# Fonts — licensing note

Most fonts in this folder are freely redistributable (OFL or similar):
Inter, Lexend Giga/Deca, Quicksand, and the accessibility fonts also
bundled by the `darkmode-plus-a11y` package (OpenDyslexic, Andika,
Atkinson Hyperlegible Next — license texts in
`packages/darkmode-plus-a11y/fonts/LICENSES/`).

**The Sylexiad fonts (`SylexiadSans*`, `SylexiadSerif*`) are NOT part of
this repository.** Their EULA forbids public redistribution (webfonts
must not be publicly downloadable), so the files are gitignored: they
exist locally and in production (deployed from the local checkout), but
must never be committed.

To restore them in a fresh checkout: download the Sylexiad Sans and
Sylexiad Serif families from <https://www.sylexiad.com> (free for
personal use — read and accept their EULA yourself) and place the
`.woff2`/`.ttf` files in this folder. The dyslexia mode falls back to
**Andika** (OFL, bundled) whenever Sylexiad is missing, so the site
stays fully functional without them.
