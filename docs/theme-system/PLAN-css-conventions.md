<!-- @format -->

# Execution plan — SCSS/CSS conventions layer (opt-in)

Opened with Simon on 2026-08-04, right after `darkmode-plus-a11y@0.8.0`
shipped. This chantier starts the long-term entry recorded in
[TODO.md](./TODO.md) — *"Extreme-zoom SCSS/CSS recommendations
module"* — which was deliberately parked until the package publication
(E7) was done and stable. It now is.

**fr** — Ouvert avec Simon le 2026-08-04, juste après la publication de
`darkmode-plus-a11y@0.8.0`. Ce chantier démarre l'entrée long-terme
consignée dans [TODO.md](./TODO.md) — *« module de recommandations
SCSS/CSS pour le zoom extrême »* — délibérément garée tant que la
publication du paquet (E7) n'était pas terminée et stable. Elle l'est.

## Why now

The 0.8.0 work produced, for the first time, a component measured and
corrected at 1000 % page zoom: a floating panel that keeps working when
the viewport is roughly 192x108 CSS pixels. That work produced
arithmetic (a knee formula, a centring floor, an inner-radius
subtraction) and a unit doctrine (px floors inside clamps are correct,
everywhere else rem/em). Right now that knowledge lives as prose
comments inside two template files. It is reusable, and it is not
reusable in that form.

**fr** — Le travail de la 0.8.0 a produit, pour la première fois, un
composant mesuré et corrigé à 1000 % de zoom : un panneau flottant qui
continue de fonctionner quand la fenêtre fait environ 192x108 pixels
CSS. Ce travail a produit de l'arithmétique (formule du coude, plancher
de centrage, soustraction du rayon intérieur) et une doctrine d'unités
(les planchers en px dans un clamp sont corrects, partout ailleurs
rem/em). Aujourd'hui ce savoir vit sous forme de commentaires en prose
dans deux fichiers de template. Il est réutilisable, et il ne l'est pas
sous cette forme.

## Scope

1. A Sass library shipped at `scss/conventions/` — functions, mixins,
   placeholders.
2. A convention document — doctrine and rationale, not an API listing.
3. Tailwind v4 utilities, as an on-ramp for consumers who arrive from
   there.
4. Migrating the portfolio onto the layer, which is both the proof that
   it works and the occasion to clean the portfolio's general CSS.

**fr** — 1. Une bibliothèque Sass livrée dans `scss/conventions/` —
fonctions, mixins, placeholders. 2. Un document de convention —
doctrine et justifications, pas un catalogue d'API. 3. Des utilitaires
Tailwind v4, comme rampe d'accès pour ceux qui arrivent de là. 4. La
migration du portfolio sur cette couche, qui est à la fois la preuve
qu'elle fonctionne et l'occasion de nettoyer son CSS général.

## Non-goals

- **Not mandatory.** Nothing in the package requires it, and nothing
  breaks if a consumer ignores it entirely.
- **Not a layout framework.** It encodes a handful of measured
  patterns, it does not attempt to cover page layout.
- **No JavaScript.** Decided 2026-08-04: Tailwind v4 `@utility` in CSS,
  never a v3 plugin.
- **It does not choose values for the consumer.** The maths are
  universal; the ceilings are one person's calibration and are shipped
  as such.

**fr** — **Non obligatoire** : rien dans le paquet ne l'exige, rien ne
casse si un consommateur l'ignore. **Pas un framework de mise en
page** : la couche encode quelques motifs mesurés, elle ne prétend pas
couvrir la mise en page. **Aucun JavaScript** : décidé le 2026-08-04,
`@utility` Tailwind v4 en CSS, jamais un plugin v3. **Elle ne choisit
pas les valeurs à la place du consommateur** : les maths sont
universelles, les plafonds sont la calibration d'une seule personne et
sont livrés comme tels.

## Working rules, decided 2026-08-04

### R1 — Bilingual comments, English and French

Every SCSS file belonging to this chantier carries both languages.
Each French line is prefixed `// fr` and lives in a silent `//`
comment, never in a `/* */` one (those are re-emitted into the
compiled CSS). Line-by-line prefixing, never a delimited block: a
missing closing delimiter would swallow English.

This is a deliberate exception to the repository's English-only rule.
Reason: on this chantier the text *is* the deliverable, and a
convention its own author reads imprecisely is a dead convention. A
separate French document sitting away from the code was rejected —
too hard to find at the moment it matters.

**fr** — Chaque fichier SCSS de ce chantier porte les deux langues.
Chaque ligne française est préfixée `// fr` et vit dans un commentaire
silencieux `//`, jamais dans un `/* */` (ceux-là sont réémis dans le CSS
compilé). Préfixe ligne par ligne, jamais un bloc délimité : un
délimiteur de fin manquant avalerait de l'anglais.

C'est une exception délibérée à la règle anglais-uniquement du dépôt.
Raison : sur ce chantier le texte *est* le livrable, et une convention
que son auteur lit imprécisément est une convention morte. Un document
français séparé, à l'écart du code, a été écarté — trop difficile à
retrouver au moment où il compte.

### R2 — French is removed before publishing

`prepack` strips every `// fr` line from `scss/` and `templates/scss/`;
`postpack` restores them from git. The strip refuses to run on a dirty
working tree, which is what makes the restore exact. CI packs a tarball
and asserts it contains zero `// fr`.

The portfolio's own SCSS is never published and keeps its French
permanently, with no tooling.

**fr** — `prepack` retire toute ligne `// fr` de `scss/` et
`templates/scss/` ; `postpack` les restaure depuis git. Le retrait
refuse de tourner sur un arbre git sale, et c'est ce qui rend la
restauration exacte. La CI empaquette un tarball et vérifie qu'il ne
contient aucun `// fr`.

Le SCSS du portfolio n'est jamais publié et garde son français pour
toujours, sans outillage.

### R3 — Importing the layer must cost zero bytes

A file whose only content is `@use` of the conventions, using nothing
from them, must compile to an empty stylesheet. Functions emit nothing
by nature, mixins emit only when called, placeholders only when
extended. A test asserts this.

This is what turns "optional" from a promise into a provable property:
a consumer pays only for what they actually use.

**fr** — Un fichier dont le seul contenu est un `@use` des conventions,
sans rien en utiliser, doit compiler vers une feuille vide. Les
fonctions n'émettent rien par nature, les mixins n'émettent qu'à
l'appel, les placeholders qu'à l'`@extend`. Un test le vérifie.

C'est ce qui transforme « optionnel » d'une promesse en propriété
prouvable : le consommateur ne paie que ce qu'il utilise réellement.

### R4 — Separate the law from the calibration

- **Functions carry the law** — arithmetic true for anyone.
- **Mixins carry the patterns** — the shape, without the numbers.
- **Placeholders carry the opinion** — one set of ceilings, ready to
  extend, easy to decline.

Someone who dislikes the ceilings still gets the maths. This split
exists because the package's referential is its consumers and their
different palettes, never one site's current usage.

**fr** — **Les fonctions portent la loi** — l'arithmétique vraie pour
tout le monde. **Les mixins portent les motifs** — la forme, sans les
chiffres. **Les placeholders portent l'opinion** — un jeu de plafonds,
prêt à étendre, facile à refuser.

Quelqu'un qui n'aime pas les plafonds garde quand même les maths. Ce
découpage existe parce que le référentiel du paquet, ce sont ses
consommateurs et leurs palettes différentes, jamais l'usage actuel d'un
seul site.

### R5 — A stricter form, reserved for a few constructs

Most of the convention document is ordinary guidance: preferences, with
the reasoning that makes them worth following. That is the normal mode
and it covers the majority of what the document says.

A **small number of constructs** get a stricter form, and they qualify
for exactly one reason: their legitimate uses are rare, or there may be
none at all. For those, the document states a **prohibition**, followed
by a **numbered list of the cases where it is lifted**. Nothing outside
that list is allowed. The list grows as legitimate cases are met and
argued, one entry at a time; it may start empty, and an empty list
means an absolute ban.

Applying this form everywhere would be wrong — most rules have too many
legitimate shapes to enumerate, and a register nobody can complete is a
register nobody respects.

The burden of proof sits on the exception, never on the ban. A rule
written as "prefer rem" is advice and gets ignored under deadline; a
rule written as "px is forbidden except in cases 1, 2 and 3" is
checkable by a human and, later, by a tool.

Each register entry carries: the case, why the ban does not serve the
goal there, and what would break if the ban were applied anyway.

Constructs to govern this way, as identified on 2026-08-04 — the list
itself is open:

- **`px`** — first known exception: the floor of a collapsing clamp. A
  rem floor grows back into a wide band at exactly the zoom levels
  where space is scarcest, which defeats the purpose.
- **`gap`** — exception list to be established from the step 1
  inventory; it may well stay empty.

**fr** — L'essentiel du document de convention est du conseil ordinaire :
des préférences, avec le raisonnement qui les rend suivables. C'est le
mode normal et il couvre la majorité de ce que le document dit.

Un **petit nombre de constructions** reçoit une forme plus stricte, et
elles y ont droit pour une seule raison : leurs usages légitimes sont
rares, voire inexistants. Pour celles-là, le document énonce une
**interdiction**, suivie d'une **liste numérotée des cas où elle est
levée**. Rien en dehors de cette liste n'est autorisé. La liste
s'allonge à mesure qu'on rencontre et qu'on argumente des cas légitimes,
une entrée à la fois ; elle peut démarrer vide, et une liste vide vaut
interdiction absolue.

Appliquer cette forme partout serait une erreur : la plupart des règles
ont trop de formes légitimes pour être énumérées, et un registre que
personne ne peut compléter est un registre que personne ne respecte.

La charge de la preuve est sur l'exception, jamais sur l'interdiction.
Une règle écrite « préférer rem » est un conseil et se fait ignorer dès
qu'on est pressé ; une règle écrite « px interdit sauf cas 1, 2 et 3 »
se vérifie à l'œil, et plus tard par un outil.

Chaque entrée du registre porte : le cas, pourquoi l'interdiction ne
sert pas l'objectif à cet endroit, et ce qui casserait si on
l'appliquait quand même.

Constructions à gouverner ainsi, repérées le 2026-08-04 — la liste
elle-même est ouverte : **`px`**, première exception connue = le
plancher d'un clamp qui s'écrase (un plancher en rem regrossit en bande
large exactement aux niveaux de zoom où la place manque le plus) ; et
**`gap`**, dont la liste d'exceptions reste à établir à partir de
l'inventaire de l'étape 1, et restera peut-être vide.

## Steps

Each step has a gate. No step starts before the previous one is
accepted by Simon.

**fr** — Chaque étape a une porte. Aucune étape ne démarre avant que la
précédente ait été acceptée par Simon.

### Step 0 — This plan

Gate: Simon accepts scope, non-goals and working rules.

### Step 1 — Inventory, before naming anything

Sweep every SCSS file in the portfolio and in the package templates.
Record each `clamp()`, each viewport unit, each `px`, each fixed inset,
each `position`, each hard-coded dimension. Produce a factual table:
which patterns actually recur, how many times, and which are debt.

No convention is named at this step. A convention drawn from a single
component is a generalisation from one measurement — the accessibility
panel is one data point, not a corpus.

Gate: the table is read together, and Simon says which entries are
patterns and which are debt to fix.

**fr** — Balayer chaque fichier SCSS du portfolio et des templates du
paquet. Relever chaque `clamp()`, chaque unité de fenêtre, chaque `px`,
chaque inset figé, chaque `position`, chaque dimension en dur. Produire
un tableau factuel : quels motifs se répètent réellement, combien de
fois, et lesquels sont de la dette.

Aucune convention n'est nommée à cette étape. Une convention tirée d'un
seul composant est une généralisation sur une seule mesure — le panneau
d'accessibilité est un point de mesure, pas un corpus.

Porte : le tableau se lit à deux, et Simon dit quelles entrées sont des
motifs et lesquelles sont de la dette à corriger.

### Step 1b — Word breaking under extreme zoom

Added 2026-08-04 at Simon's request, and it earns its own sub-step
because the first look already found defects rather than a blank page.

At a ~192 CSS px viewport a single long word can force horizontal
scrolling, which WCAG 1.4.10 forbids. **Two independent mechanisms**
address that, and they must not be discussed as one — the current
`word-wrap` mixin declares both, which is what makes them look related.

**A. Breaking mid-word, no hyphen shown.** `overflow-wrap` and
`word-break`. Purely geometric, **the document language is irrelevant**
here. The distinction that matters:

- `overflow-wrap: break-word` introduces wrap opportunities **without
  affecting the min-content size**, so a flex or grid item can still be
  forced wider than its container by one long word;
- `overflow-wrap: anywhere` **does** affect min-content size, which is
  what actually lets the item shrink.

**B. Hyphenation at syllable boundaries, hyphen shown.** `hyphens:
auto`. This one needs a **hyphenation dictionary**, which the browser
selects from the element's language — so it does nothing useful without
a correct `lang`. It also needs `-webkit-hyphens` for Safari.

A is what saves the layout at extreme zoom. B is typographic polish and
degrades to nothing when unavailable.

To settle in this sub-step: which declarations enter the convention,
whether hyphenation should be suppressed in dyslexia mode (splitting
words across lines works against the readers that mode exists for), and
— separately from the convention itself — how the language reaches the
document in time for B to work at all.

**fr** — Sur une fenêtre d'environ 192 px CSS, un seul mot long peut
forcer un défilement horizontal, ce que WCAG 1.4.10 interdit. **Deux
mécanismes indépendants** répondent à ça, et il ne faut pas les traiter
comme un seul — le mixin `word-wrap` actuel déclare les deux, c'est ce
qui les fait paraître liés.

**A. Couper au milieu d'un mot, sans tiret.** `overflow-wrap` et
`word-break`. Purement géométrique, **la langue du document n'y change
rien**. La distinction qui compte : `break-word` crée des points de
coupure **sans toucher à la taille min-content**, donc un élément flex
peut encore être élargi de force par un mot long ; `anywhere` touche
bien la taille min-content, et c'est ce qui permet réellement à
l'élément de rétrécir.

**B. Césure aux frontières de syllabes, avec tiret.** `hyphens: auto`.
Celui-là a besoin d'un **dictionnaire de césure**, que le navigateur
choisit d'après la langue de l'élément — il ne fait donc rien d'utile
sans un `lang` correct. Il lui faut aussi `-webkit-hyphens` pour Safari.

A sauve la mise en page au zoom extrême. B est du confort typographique
et se dégrade en rien quand il n'est pas disponible.

À trancher dans ce sous-pas : quelles déclarations entrent dans la
convention, faut-il supprimer la césure en mode dyslexie (couper les
mots en fin de ligne travaille contre les lecteurs pour qui ce mode
existe), et — séparément de la convention elle-même — comment la langue
atteint le document à temps pour que B fonctionne.

### Step 2 — Name the vocabulary, in the document, before any code

Write the convention document first. Names are what 1.0.0 locks; the
implementation behind a name can be rewritten at any time, the name
cannot.

Gate: the names are agreed. Renaming after this point costs a
deprecation path.

**fr** — Écrire le document de convention d'abord. Les noms sont ce que
la 1.0.0 verrouille ; l'implémentation derrière un nom peut être
réécrite à tout moment, le nom non.

Porte : les noms sont actés. Renommer après ce point coûte un chemin de
dépréciation.

### Step 3 — Functions

Pure arithmetic, no CSS output, unit-tested against the values measured
during the 0.8.0 work.

### Step 4 — Mixins

Patterns expressed in terms of the functions. No new arithmetic.

### Step 5 — Placeholders

The opinionated default set, expressed in terms of the mixins. No new
patterns.

Each of steps 3-5 depends only on the one before it. Gate on each: it
compiles, the zero-byte rule (R3) still holds, and the portfolio's
compiled CSS is unchanged, since nothing consumes the layer yet.

**fr** — Chacune des étapes 3 à 5 ne dépend que de la précédente. Porte
à chaque fois : ça compile, la règle du zéro octet (R3) tient toujours,
et le CSS compilé du portfolio est inchangé, puisque rien ne consomme
encore la couche.

### Step 6 — Tailwind v4 utilities

Two distinct things, to keep separate:

- **the token bridge** — expose the package's emitted role variables so
  theme-aware utilities exist;
- **the zoom-safe utilities** — a small named set encoding the
  collapsing clamps.

Tailwind's own spacing scale is a fixed rem ladder; the whole point
here is values that collapse. So this is a small named set, not a
generated scale, and the document must say so rather than imply
parity.

Constraint carried over from the pre-1.0.0 review: there is no Tailwind
project available to prove any of it. Either a throwaway one is built
at step 7, or the utilities ship marked as untested. They will not be
described as verified.

**fr** — Deux choses distinctes, à garder séparées : **le pont de
jetons**, qui expose les variables de rôle émises par le paquet pour
que des utilitaires suivant le thème existent ; et **les utilitaires
résistants au zoom**, un petit ensemble nommé encodant les clamps qui
s'écrasent.

L'échelle d'espacement de Tailwind est une échelle rem figée ; tout
l'intérêt ici, ce sont des valeurs qui s'écrasent. Donc c'est un petit
ensemble nommé, pas une échelle générée, et le document doit le dire au
lieu de laisser croire à une parité.

Contrainte héritée de la revue pré-1.0.0 : aucun projet Tailwind n'est
disponible pour prouver quoi que ce soit. Soit on en monte un jetable à
l'étape 7, soit les utilitaires sortent marqués comme non éprouvés. Ils
ne seront pas décrits comme vérifiés.

### Step 7 — Migrate the portfolio onto the layer

This is the proof and the cleanup at once. The oracle is the compiled
CSS: migrating a rule that already followed the convention must produce
byte-identical output. Where output changes, it is because the rule was
debt — and every such change is listed and shown to Simon before it is
kept.

Gate: visual validation, as on every previous chantier.

**fr** — C'est à la fois la preuve et le nettoyage. L'oracle est le CSS
compilé : migrer une règle qui suivait déjà la convention doit produire
une sortie octet pour octet identique. Là où la sortie change, c'est que
la règle était de la dette — et chacun de ces changements est listé et
montré à Simon avant d'être conservé.

Porte : validation visuelle, comme sur tous les chantiers précédents.

### Step 8 — Documentation and release

Convention document finalised, README section, AGENTS section, entry in
[CHANGELOG.md](./CHANGELOG.md), minor version bump. Purely additive, so
a minor — and cheap while the package is still in 0.x.

## First-pass findings (2026-08-04)

A first sweep of the portfolio's own SCSS, run the day the chantier
opened. **This is not the step 1 inventory** — it is a sample, taken to
check whether the plan was aiming at anything real. It was: the sweep
returned defects, not a blank page. Recorded here so the reasoning is
not lost between sessions.

**fr** — Premier balayage du SCSS du portfolio, fait le jour de
l'ouverture du chantier. **Ce n'est PAS l'inventaire de l'étape 1** —
c'est un échantillon, pris pour vérifier que le plan visait quelque
chose de réel. C'était le cas : le balayage a rendu des défauts, pas une
page blanche. Consigné ici pour que le raisonnement ne se perde pas
entre deux séances.

### Functions

One function exists, `rem($value_px)`, with **zero call sites**. It is
kept and promoted — see the note under *Candidate primitives* for why,
and for the string-versus-number correction it needs.

**fr** — Une seule fonction existe, `rem($value_px)`, avec **zéro site
d'appel**. Elle est conservée et promue — voir la note sous *Candidate
primitives* pour la raison, et pour la correction chaîne/nombre.

### Mixins — three carry debt

- `sr-only` uses the deprecated `clip: rect(0, 0, 0, 0)`, and is
  **re-typed by hand** in `_contact.scss` instead of being included.
- `focus-visible` hard-codes `rgba(white, 0.75)` as its glow — not
  theme-aware, so it is invisible on a light surface. The same block is
  copied into `_header.scss`.
- `page-container` carries a fixed `margin-top: -4rem` and
  `padding: 2rem`.

**fr** — `sr-only` utilise `clip: rect(0, 0, 0, 0)`, déprécié, et il est
**retapé à la main** dans `_contact.scss` au lieu d'être inclus.
`focus-visible` code en dur `rgba(white, 0.75)` comme halo — non
thématisé, donc invisible sur une surface claire ; le même bloc est
recopié dans `_header.scss`. `page-container` porte un `margin-top:
-4rem` et un `padding: 2rem` figés.

### Placeholders — one real defect, one duplication

- `%link-hover-base` sets `height: 2rem` **on a link**. A fixed height
  on text is precisely what breaks first under zoom.
- `%section-title` and `%section-subtitle` re-type the four
  declarations of the `word-wrap` mixin instead of including it — three
  places to edit when the rule changes.
- `%flex-center-group` carries `gap: 0.5rem`, the first candidate entry
  for the gap register.

**fr** — `%link-hover-base` pose `height: 2rem` **sur un lien** : une
hauteur fixe sur du texte est exactement ce qui casse en premier au
zoom. `%section-title` et `%section-subtitle` retapent les quatre
déclarations du mixin `word-wrap` au lieu de l'inclure — trois endroits
à corriger quand la règle changera. `%flex-center-group` porte un `gap:
0.5rem`, première entrée candidate au registre des gaps.

### Two clamp dialects coexist

```text
%section-base    clamp(0.25rem, 2vw, 2rem)
                 pure slope through the origin, rem floor

panel            clamp(1px, calc(1.5vw - 5px), 1rem)
                 offset slope, px floor
```

Not the same arithmetic and not the same intent. Reconciling these two
is the concrete job of step 1.

**fr** — Ni la même arithmétique ni la même intention. Réconcilier ces
deux dialectes est le travail concret de l'étape 1.

### Raw counts, to be refined at step 1

| What | Count |
| --- | --- |
| `px` occurrences in `src/styles` | 86 |
| — fixed dimensions (`min-height: 180px`, `max-width: 800px`…) | ~20 |
| — borders and outlines | ~26 |
| — box shadows | ~16 |
| — media queries | 4 |
| — `sr-only`, `clip`, `translateY` | ~9 |
| media queries in `px` | 6 |
| media queries in `em` | 6 |

The six `px` media queries do not respond to a browser font-size
increase. That is the project's own stated doctrine, already written in
[TODO.md](./TODO.md), contradicted by half its own media queries.

**fr** — Les six media queries en `px` ne répondent pas à
l'agrandissement de police du navigateur. C'est la doctrine du projet
lui-même, déjà écrite dans [TODO.md](./TODO.md), contredite par la
moitié de ses propres media queries.

### Word breaking — measured state

- `-webkit-hyphens` is **absent everywhere**: zero occurrences, so
  Safari performs no hyphenation at all.
- The `word-wrap` mixin declares four properties where two modern ones
  suffice: `word-break: break-word` is deprecated, and `word-wrap` is
  the legacy alias of `overflow-wrap`.
- It uses `break-word`, not `anywhere` — see step 1b for why that
  distinction decides whether a flex item can shrink.
- The `lang` attribute is absent from the delivered HTML: `<html>` is
  rendered without it and a script sets it with `strategy=
  "afterInteractive"`, so it lands **after hydration**. This affects
  **only** hyphenation (B), never `overflow-wrap` (A). It is a defect
  in its own right — WCAG 3.1.1, and a screen reader picks its voice at
  load — but it belongs to the site, not to this convention.

**fr** — `-webkit-hyphens` est **absent partout** : zéro occurrence,
donc Safari ne fait aucune césure. Le mixin `word-wrap` déclare quatre
propriétés là où deux modernes suffisent : `word-break: break-word` est
déprécié, et `word-wrap` est l'alias hérité de `overflow-wrap`. Il
utilise `break-word`, pas `anywhere` — voir l'étape 1b pour pourquoi
cette distinction décide si un élément flex peut rétrécir.

L'attribut `lang` est absent du HTML livré : `<html>` est rendu sans
lui et un script le pose en `strategy="afterInteractive"`, donc **après
l'hydratation**. Cela ne touche **que** la césure (B), jamais
`overflow-wrap` (A). C'est un défaut en soi — WCAG 3.1.1, et un lecteur
d'écran choisit sa voix au chargement — mais il appartient au site, pas
à cette convention.

## Candidate primitives

Drawn from work already measured, not invented. This is a starting
list for step 1 to confirm or contradict, not a specification.

**fr** — Tirés d'un travail déjà mesuré, non inventés. C'est une liste
de départ que l'étape 1 confirmera ou contredira, pas une
spécification.

| Kind | What it does |
| --- | --- |
| function | px reference in, rem out — the designer bridge |
| function | collapsing space clamp, from a ceiling and a knee |
| function | knee resolution: `100 x (ceiling + offset) / slope` |
| function | inner radius = outer radius - border - padding |
| mixin | centred floating panel with an anti-overflow floor |
| mixin | equal-width button row that still wraps |
| placeholder | flex scroll region (`min-height: 0`) |
| placeholder | reserved slot for a state glyph |

The px-to-rem function deserves a note, because it looks like it
contradicts R5 and does the opposite. Designers hand over references in
pixels, and the package serves many kinds of developer and project, not
one. A function that takes a px reference and returns rem is the ramp
that lets those people land inside the convention instead of bouncing
off it — the ban is on px **in the output**, not on px as a unit of
conversation.

One thing to fix while promoting it: the portfolio's current version
returns a **string**, so its result cannot take part in further Sass
arithmetic and cannot be composed inside the clamp helpers. Returning a
real number (`math.div($px, $ref) * 1rem`) produces the same CSS and
composes.

**fr** — La fonction px→rem mérite une note, parce qu'elle a l'air de
contredire R5 alors qu'elle fait l'inverse. Les designers livrent des
références en pixels, et le paquet sert des profils de développeurs et
des projets variés, pas un seul. Une fonction qui prend une référence en
px et rend des rem est la rampe qui permet à ces gens d'atterrir dans la
convention au lieu de rebondir dessus — l'interdiction porte sur les px
**en sortie**, pas sur le px comme unité de conversation.

Une chose à corriger en la promouvant : la version actuelle du portfolio
retourne une **chaîne**, donc son résultat ne peut pas participer à une
arithmétique Sass ni se composer dans les aides à clamp. Retourner un
vrai nombre (`math.div($px, $ref) * 1rem`) produit le même CSS et se
compose.

## Open questions

- Does the convention document live inside the package (shipped,
  English) with the French kept in this repository, or does it ship
  bilingual? R1 and R2 answer this for code; the document itself is not
  yet decided.
- Does the token bridge belong to this chantier or to a separate
  Tailwind one? Step 1 may show they have nothing in common but the
  audience.
- Throwaway Tailwind project: now, at step 7, or never before 1.0.0?

**fr** — Le document de convention vit-il dans le paquet (expédié, en
anglais) avec le français gardé dans ce dépôt, ou part-il bilingue ? R1
et R2 répondent pour le code ; le document lui-même n'est pas tranché.

Le pont de jetons appartient-il à ce chantier ou à un chantier Tailwind
séparé ? L'étape 1 montrera peut-être qu'ils n'ont en commun que le
public.

Projet Tailwind jetable : maintenant, à l'étape 7, ou jamais avant la
1.0.0 ?
