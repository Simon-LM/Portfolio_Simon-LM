<!-- @format -->

# Visual previews — theme chantier

Visual validation tools, **outside production**: nothing here is served by
the site (only `public/` is deployed).

## preview-dyslexie.html

Interactive comparator for dyslexia mode (E5, phase 4): control (site in
normal mode) / Sylexiad body (site) / Andika body (package default), with
sliders for `font-size-adjust`, enlargement, line-height, letter-spacing.
Fonts are embedded as data-URIs → the file opens directly in a browser
(`file://`), no server required.

Values decided on 2026-07-09 (visual validation):
`font-size-adjust 0.56` · enlargement `1` (off) · `line-height 1.75` ·
`letter-spacing 0.04em` · `word-spacing 0.128em`.

## Regenerate / adapt

```bash
python3 docs/theme-system/previews/generate-preview-dyslexie.py
```

The script reads the fonts from `public/fonts/` and rewrites the HTML here.

⚠️ Never copy these files into `public/` permanently: the preview embeds
Sylexiad (proprietary EULA) and has no business being in production.
