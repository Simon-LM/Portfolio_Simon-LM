<!-- @format -->

# Inventory — step 1 of the SCSS/CSS conventions chantier

Produced 2026-08-06 on branch `feat/css-conventions`, per step 1 of
[PLAN-css-conventions.md](./PLAN-css-conventions.md): sweep everything
first, name nothing yet.

Scope: `src/styles/**/*.scss` (portfolio, marked **P**) and
`packages/darkmode-plus-a11y/templates/scss/*.scss` (shipped templates,
marked **T**). Comment-only lines and trailing comments are excluded
from every count, which is why some figures are lower than a naive grep
suggests.

**fr** — Produit le 2026-08-06 sur la branche `feat/css-conventions`,
selon l'étape 1 du plan : balayer d'abord, ne rien nommer encore.

Périmètre : le SCSS du portfolio (**P**) et les templates expédiés
(**T**). Les lignes de commentaire et les commentaires de fin de ligne
sont exclus de tous les comptes, d'où des chiffres plus bas qu'un grep
naïf.

---

## 1. Clamp idioms — five dialects, not one

Twenty-four `clamp()` declarations, and they do not speak the same
language. Sorted by what they are for.

**fr** — Vingt-quatre déclarations `clamp()`, et elles ne parlent pas la
même langue. Triées par usage.

### Dialect A — fluid type, pure slope (12 occurrences)

```scss
font-size: clamp(1.5rem, 3vw, 3em);   // ×5
font-size: clamp(1rem,   2vw, 1.5rem); // ×3
font-size: clamp(2.5rem, 5vw, 3rem);
```

Floor in `rem`, slope passing through the origin, ceiling mixing `rem`
and `em` inconsistently (`3em` versus `3rem` for the same role).

**fr** — Plancher en `rem`, pente passant par l'origine, plafond qui
mélange `rem` et `em` de façon incohérente (`3em` contre `3rem` pour le
même rôle).

### Dialect B — fluid type with a redundant inner floor (3 occurrences)

```scss
font-size: clamp(1.25rem,  max(1.25rem,  2vw),   1.5rem);
font-size: clamp(0.75rem,  max(0.875rem, 1vw),   0.95rem);
font-size: clamp(1rem,     max(1.125rem, 1.2vw), 1.25rem);
```

**All three carry dead code.** `clamp(MIN, VALUE, MAX)` already floors
at `MIN`, so an inner `max()` floor is either a no-op or it silently
overrides the declared minimum:

| written | effectively |
| --- | --- |
| `clamp(1.25rem, max(1.25rem, 2vw), 1.5rem)` | `clamp(1.25rem, 2vw, 1.5rem)` — inner `max` is a no-op |
| `clamp(0.75rem, max(0.875rem, 1vw), 0.95rem)` | `clamp(0.875rem, 1vw, 0.95rem)` — the declared `0.75rem` is unreachable |
| `clamp(1rem, max(1.125rem, 1.2vw), 1.25rem)` | `clamp(1.125rem, 1.2vw, 1.25rem)` — the declared `1rem` is unreachable |

The second and third are the dangerous shape: someone reading the file
believes the text can shrink to `0.75rem`, and it cannot.

**fr** — **Les trois portent du code mort.** `clamp(MIN, VALEUR, MAX)`
applique déjà `MIN`, donc un `max()` intérieur est soit sans effet, soit
il écrase silencieusement le minimum déclaré. Les deuxième et troisième
sont la forme dangereuse : qui lit le fichier croit que le texte peut
descendre à `0.75rem`, et c'est faux.

### Dialect C — collapsing space, offset slope, px floor (6)

```scss
--panel-gap: clamp(1px, calc(1.5vw - 5px), 1rem);
--panel-pad: clamp(1px, calc(1vw  - 2px),  0.75rem);
padding:     clamp(1px, calc(0.5vw - 1px), 0.5rem);
```

The 0.8.0 work, present identically in **P** and **T**. This is the only
dialect that actually collapses at extreme zoom, and the only one whose
knee was computed rather than guessed.

**fr** — Le travail de la 0.8.0, présent à l'identique dans **P** et
**T**. C'est le seul dialecte qui s'écrase réellement au zoom extrême, et
le seul dont le coude a été calculé plutôt que deviné.

### Dialect D — collapsing space, pure slope, rem floor (1)

```scss
padding: 2rem clamp(0.25rem, 2vw, 2rem);   // %section-base
```

Same intent as C, different arithmetic and a floor that never collapses
below `0.25rem` (4 px). Reconciling C and D is the first real decision
of this chantier.

**fr** — Même intention que C, arithmétique différente et un plancher qui
ne descend jamais sous `0.25rem` (4 px). Réconcilier C et D est la
première vraie décision de ce chantier.

### Dialect E — fixed value bounded by percentages (4)

```scss
top:  max(clamp(10%, 22rem, 45%), calc(var(--panel-h) / 2 + var(--panel-gap)));
left: clamp(50%, calc(100% - 13rem), calc(100% - 4rem));
```

The middle term is not fluid at all: a fixed `22rem` bounded between
10 % and 45 % of the viewport. A distinct idiom — "a constant, kept
inside relative limits" — worth naming separately so it is not confused
with fluid sizing.

**fr** — Le terme du milieu n'est pas fluide : un `22rem` fixe, borné
entre 10 % et 45 % de la fenêtre. Un idiome distinct — « une constante,
tenue dans des limites relatives » — à nommer à part pour ne pas le
confondre avec du dimensionnement fluide.

---

## 2. Defects at extreme zoom

Two places carry the exact bug that was diagnosed and fixed on the
accessibility panel during 0.8.0: **a fixed `rem` subtracted from a
viewport unit**. Below a certain viewport the result goes negative, and
a negative `calc()` result clamps to zero.

**fr** — Deux endroits portent exactement le bug diagnostiqué et corrigé
sur le panneau d'accessibilité en 0.8.0 : **un `rem` fixe soustrait d'une
unité de fenêtre**. Sous une certaine taille de fenêtre le résultat
devient négatif, et un `calc()` négatif se clampe à zéro.

### 2.1 The navigation dropdown disappears — `_navigation-sticky.scss:90`

```scss
.navigation-menu {
	min-width: 200px;
	max-height: calc(100vh - 16rem);
	overflow-y: auto;
}
```

Broken twice over at a ~192×108 px viewport:

- `max-height` reaches zero at a 256 px viewport height, so **the menu
  renders with no height at all** — the same failure the accessibility
  panel had;
- `min-width: 200px` is wider than the whole viewport, forcing
  horizontal scrolling, which WCAG 1.4.10 forbids.

This is the site's main navigation. It ranks above everything else in
this document.

**fr** — Cassé deux fois sur une fenêtre d'environ 192×108 px : le
`max-height` atteint zéro dès 256 px de hauteur de fenêtre, donc **le
menu s'affiche sans aucune hauteur** — l'échec qu'avait le panneau
d'accessibilité ; et `min-width: 200px` est plus large que la fenêtre
entière, ce qui force un défilement horizontal interdit par WCAG 1.4.10.
C'est la navigation principale du site : ce point passe avant tout le
reste de ce document.

### 2.2 The sticky footer text collapses to an ellipsis — `_stickyFooter.scss:86`

```scss
&-text {
	white-space: nowrap;
	text-overflow: ellipsis;
	max-width: calc(100vw - 10.5rem);
}
```

`10.5rem` is 168 px, so the available width reaches zero at a 168 px
viewport and is already down to 24 px at 192 px. Combined with
`white-space: nowrap`, the text becomes an ellipsis and nothing else
well before the layout formally breaks.

**fr** — `10.5rem` vaut 168 px, donc la largeur disponible atteint zéro
à 168 px de fenêtre et n'est déjà plus que 24 px à 192 px. Avec
`white-space: nowrap`, le texte se réduit à des points de suspension
bien avant que la mise en page ne casse formellement.

### 2.3 Same shape, harmless — three `min-height` cases

```scss
min-height: calc(100vh - 10rem);   // _globale.scss:62
min-height: calc(100vh - 14rem);   // _hero.scss:9
```

Identical arithmetic, but on `min-height` a zero result simply removes
the constraint. Listed so the convention can say **why** they are
acceptable while 2.1 and 2.2 are not: the property decides the
consequence, not the expression.

**fr** — Arithmétique identique, mais sur `min-height` un résultat nul
retire simplement la contrainte. Listés pour que la convention puisse
dire **pourquoi** ils sont acceptables alors que 2.1 et 2.2 ne le sont
pas : c'est la propriété qui décide de la conséquence, pas l'expression.

---

## 3. Bugs found in passing

Not the subject of the chantier, found by the sweep, recorded so they
are not lost.

**fr** — Hors sujet du chantier, trouvés par le balayage, consignés pour
ne pas les perdre.

| Where | What |
| --- | --- |
| `_portfolioCard.scss:14` | `box-sizing: 1px;` — invalid; the property takes a keyword, so the declaration is dropped by every browser. The neighbouring `border-color` / `border-style` with no `border-width` suggests `border-width: 1px` was meant, leaving the card on the initial `medium` width instead |
| `_globale.scss:4` | `$breakpoints` map defined with seven px values, **zero call sites**. Dead, and it is a px-based breakpoint ladder sitting where the next developer will find it |
| three files | the visually-hidden pattern is implemented **three times**: `abstracts/_mixins.scss` (`sr-only`), `pages/_contact.scss`, `accessibility/_screen-reader.scss` |
| `_about.scss:47-52` | video close button positioned in raw px (`top: 10px; right: 10px; padding: 8px 16px`) with a hard-coded `color: white` on `rgba(0,0,0,.5)` — a control, so the offsets not scaling with text matters |

---

## 4. Fixed dimensions in px

Six genuine cases, once the visually-hidden `1px` clips and the
deliberate clamp floors are set aside.

```text
min-height: 180px    _privacy-policy.scss:23
min-width:  200px    _bottomFooter.scss:21
min-width:  200px    _navigation-sticky.scss:90   (see 2.1)
max-width:  800px    _skills.scss:137
max-width:  800px    _skills.scss:147
max-width: 1920px    _globale.scss:55
```

The `min-width` pair is the harmful shape: a minimum cannot be satisfied
on a small viewport, so it forces overflow. A `max-width` degrades
quietly.

**fr** — Six cas réels, une fois écartés les `1px` du motif
visually-hidden et les planchers de clamp délibérés. La paire
`min-width` est la forme nuisible : un minimum ne peut pas être satisfait
sur une petite fenêtre, donc il force le débordement. Un `max-width` se
dégrade sans bruit.

---

## 5. Material for the `gap` register

Forty-one `gap` declarations, all in `rem`, none in a collapsing
expression. Range: `0.25rem` to `6rem`.

The extreme case is `_bottomFooter.scss:12`, `gap: 2rem 6rem` — 96 px of
column gap, half a 192 px viewport, on a footer whose columns have
already wrapped by then.

Two observations for the register:

- a `gap` cannot be overridden by the child, unlike a margin, so a
  `gap` that does not collapse cannot be rescued locally;
- the only `gap` in the codebase that does collapse is `--panel-gap`,
  and it is not a `gap` property at all — it is a custom property
  feeding `padding` and `calc()`.

**fr** — Quarante et une déclarations `gap`, toutes en `rem`, aucune dans
une expression qui s'écrase. Le cas extrême est `gap: 2rem 6rem` — 96 px
d'écart de colonne, la moitié d'une fenêtre de 192 px. Deux observations
pour le registre : un `gap` ne peut pas être surchargé par l'enfant,
contrairement à une marge, donc un `gap` qui ne s'écrase pas ne peut pas
être rattrapé localement ; et le seul « gap » du dépôt qui s'écrase n'est
pas une propriété `gap`, c'est une custom property.

---

## 6. Media queries

Nine dimensional queries, in two units. The three feature queries
(`prefers-reduced-motion`, `prefers-color-scheme`, `pointer`) are out of
scope here.

| Unit | Count | Where |
| --- | --- | --- |
| `px` | 4 | `max-width: 480px` ×3, `max-width: 960px` |
| `rem` | 5 | `max-width: 54rem`, `45rem`; `max-height: 40rem`, `34rem`, `32rem` |

Correction to an earlier estimate: a rough count gave 6 and 6. The exact
figures are 4 and 5; the earlier one included commented-out lines.

In a media query `rem` and `em` both resolve against the browser's
initial font size, so the five `rem` queries respond to a user's
font-size setting and the four `px` ones do not. All four px queries
govern *width*, which is where a font-size increase matters most.

**fr** — Correction d'une estimation antérieure : un comptage grossier
donnait 6 et 6 ; les chiffres exacts sont 4 et 5, le premier comptait des
lignes commentées. Dans une media query, `rem` et `em` se résolvent tous
deux sur la taille de police initiale du navigateur, donc les cinq
requêtes en `rem` répondent au réglage de l'utilisateur et les quatre en
`px` non. Les quatre requêtes en px gouvernent la *largeur*, là où un
agrandissement de police compte le plus.

---

## 7. Counts

| Measure | Value |
| --- | --- |
| `px` occurrences, comments excluded | 92 |
| — deliberate clamp floors | 6 |
| — visually-hidden `1px` pattern | 15 |
| — box shadows | 16 |
| — media queries | 4 |
| — micro offsets (`translate`) | 5 |
| — genuine fixed dimensions | 6 |
| `clamp()` declarations | 24, in 5 dialects |
| `gap` declarations | 41, none collapsing |
| dimensional media queries | 9 (4 px, 5 rem) |
| Sass functions defined | 1 (`rem()`, zero call sites) |
| mixins defined | 14 |
| placeholders defined | 7 |

---

## 8. Questions for Simon — the gate on step 1

1. **Dialects C and D** both mean "space that collapses". Which
   arithmetic wins, and does the survivor keep a px floor or a rem one?
   This is the decision the whole layer rests on.
2. **Dialect B's dead floors** — fix silently while migrating, or treat
   as a visual change to be shown first? Two of the three change the
   effective minimum font size once corrected.
3. **2.1, the navigation dropdown.** It is a real accessibility defect
   on the site's main navigation, and it is not a convention question.
   Fix now as its own commit, or fold it into step 7?
4. **The `gap` register.** Nothing in section 5 looks like a legitimate
   exception to me, which would mean an empty list and an absolute ban
   with a collapsing alternative offered. Do you see a case I am
   missing?
5. **Section 3's bugs** — separate commit on this branch, or a separate
   branch so this one stays a conventions chantier?

**fr** — 1. Les dialectes C et D veulent tous deux dire « espace qui
s'écrase » : quelle arithmétique gagne, et le survivant garde-t-il un
plancher en px ou en rem ? C'est la décision sur laquelle repose toute la
couche. 2. Les planchers morts du dialecte B : corriger en silence pendant
la migration, ou traiter comme un changement visuel à montrer d'abord ?
Deux des trois changent le minimum effectif une fois corrigés. 3. Le menu
de navigation (2.1) est un vrai défaut d'accessibilité sur la navigation
principale, et ce n'est pas une question de convention : corriger
maintenant dans son propre commit, ou l'intégrer à l'étape 7 ? 4. Le
registre des `gap` : rien dans la section 5 ne me semble être une
exception légitime, ce qui donnerait une liste vide et une interdiction
absolue assortie d'une alternative qui s'écrase — vois-tu un cas qui
m'échappe ? 5. Les bugs de la section 3 : commit séparé sur cette branche,
ou branche séparée pour que celle-ci reste un chantier de conventions ?
