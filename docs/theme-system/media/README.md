<!-- @format -->

# Media for the package README

Assets referenced by the npm package's README, by **absolute**
`raw.githubusercontent.com` URL — npm does not resolve relative image
paths, and it renders neither `<video>` nor raw HTML. An animated GIF is
therefore the only moving format available.

They live here, in the repository's docs — **not** in `public/`, which is
the deployed site's asset folder: a promo asset has no reason to ship
with the site build or add weight to a production deploy. Nothing under
`docs/` is listed in the package's `files` array either, so none of this
reaches the npm tarball.

⚠️ The README URLs point at `main`. **Moving or renaming a file here
breaks the image on every already-published npm version**, because each
version's README is frozen at publish time. Pin a commit SHA in the URL
instead if that ever matters more than convenience.

## Files

| File                | Used in                       | Notes                                     |
| ------------------- | ----------------------------- | ----------------------------------------- |
| `themes-grid.png`   | README, near the top          | 6 themes, 3×2, labelled                   |
| `dyslexia-mode.png` | README, typography section    | Standard vs dyslexia mode, side by side   |
| `theme-switch.gif`  | social posts (not the README) | 6 frames, 4.8 s, **non-looping**          |
| `For_Gif_Demo_…/`   | sources                       | Full-resolution captures, kept to rebuild |

## Animation policy

`theme-switch.gif` is exported **non-looping** and under 5 seconds on
purpose. A GIF cannot honor `prefers-reduced-motion` and offers no pause
control, so an indefinitely looping one would fail **WCAG 2.2.2 (Pause,
Stop, Hide)** — not something an accessibility package should ship in its
own promotional material. The README uses the static grid for the same
reason; the GIF is for posts, where it plays once and stops.

## Rebuilding

The source captures differ slightly in size (the viewport was not
identical between shots), so every frame is cropped to the smallest
common area, `2522×1592`, anchored top-left — the page content is already
aligned there, so nothing shifts between frames.

```bash
# One labelled cell per theme (identical dimensions)
ffmpeg -i "<capture>.png" -vf "crop=2522:1592:0:0,scale=640:-2:flags=lanczos,\
pad=iw:ih+56:0:0:color=0x17171a,\
drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:\
text='Light':fontcolor=0xffffff:fontsize=30:x=16:y=h-42" -y cell.png

# 3x2 grid
ffmpeg -i 01.png -i 02.png -i 03.png -i 04.png -i 05.png -i 06.png \
  -filter_complex "[0][1][2]hstack=inputs=3[t];[3][4][5]hstack=inputs=3[b];\
[t][b]vstack=inputs=2,pad=iw+20:ih+20:10:10:color=0x17171a" -y themes-grid.png

# Non-looping GIF: 1.25 fps = 0.8 s per frame, 6 frames = 4.8 s
ffmpeg -framerate 1.25 -pattern_type glob -i 'norm/*.png' \
  -vf "scale=880:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];\
[b][p]paletteuse=dither=bayer:bayer_scale=3" -loop -1 -y theme-switch.gif
```

Two-pass palette generation is not optional here: a single-pass GIF bands
badly on the large flat color areas these themes are made of.
