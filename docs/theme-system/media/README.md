<!-- @format -->

# Media for the package README

Screenshots and short screen captures referenced by the npm package's
README, by **absolute** `raw.githubusercontent.com` URL (npm does not
resolve relative image paths).

They live here, in the repository's docs — **not** in `public/`, which is
the deployed site's asset folder: a promo asset has no reason to ship
with the site build or add weight to a production deploy. Nothing in
`docs/` is listed in the package's `files` array either, so none of this
reaches the npm tarball.

Animation guidance: keep any looping capture **under 5 seconds** (WCAG
2.2.2 Pause, Stop, Hide — a GIF cannot honor `prefers-reduced-motion`),
or export it non-looping with `-loop -1`.
