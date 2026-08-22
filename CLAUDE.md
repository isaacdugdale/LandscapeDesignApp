# Working on this repo

Static site, no build step. `README.md` describes what each file is and how it
publishes; read it first. This file is the part that is easy to get wrong.

## Token usage

Be frugal. This is a small repo and most jobs here are a data edit plus a
paragraph. Read the part of a file you need rather than the whole of it, check a
layout with one node script that prints everything at once rather than a run per
question, and do not re-derive a number you already have. Say what changed and
why in a few lines, not a report.

## Ask the app rather than reading it

`index.html` is 190 kB in one file. Grepping it to answer a question about a
scheme costs more than asking:

```
node tools/ask.js schemes                       every scheme, at a glance
node tools/ask.js issues s-sumps stop           just the stops
node tools/ask.js item s-sumps "Yard sump"      position, area, RL, check level
node tools/ask.js rl 12 4                       ground level at x, y
node tools/ask.js data                          what site-data.js holds
node tools/ask.js eval s-sumps "a.water().held" a is the app, b is the scheme
```

`tools/load.js` is the loader behind it. Require that instead of writing a new
harness: it finds the class body by pattern, because line numbers move under
every edit and every harness written against them has broken.

## Editing a file with a script

Two markdown files have been truncated by a scripted edit that sliced on an
anchor, found nothing, and wrote everything up to the end of the string. Both
times it went unnoticed until later. If you edit with python or sed, assert the
anchor was found, and check `wc -l` before and after. `tools/check.js` now
asserts the headings each document should still have.

## Things about this environment worth not rediscovering

- The schemes gist can be read by `git clone https://gist.github.com/<id>.git`.
  `gist.githubusercontent.com` and the gists API are both blocked by the proxy,
  so a raw fetch fails and the API returns a repository-scope error.
- The survey DWGs are AC1018. Nothing in the image reads them. LibreDWG builds
  from source in about ten minutes (`sh autogen.sh && ./configure
  --disable-bindings --disable-shared && make`), and `dwg2dxf` plus `pip install
  ezdxf` then gets you entities. The levels are already extracted into `SPOT`
  and `TRI`, so this is only needed to go back to the source.
- The survey plan PDF is vector with every glyph outlined, so it has no text to
  extract. Render it and read the image instead.

## Adding or changing a scheme

A scheme is a named starting layout offered to the device. They live in
`SCHEMES` in `site-data.js`:

```js
{id:'s-sand-water', name:'Sandstone edge, pear zone · water shaping',
 items:[ ... ], plants:[ ... ]}
```

**Seeding happens once per id, and never again.** `seedStore()` in `index.html`
keeps a `seeded` list in the device's local storage and skips any id already in
it. So editing an existing scheme in place reaches nobody who has already opened
the app. It looks fine in a fresh browser and changes nothing on the iPad. That
mistake has now been made once; do not make it again.

**Notes are the exception, through `rev`.** A scheme carries a `rev`, and a
higher one than the device holds replaces the notes, leaving the layout alone.
So a corrected note no longer needs a whole new scheme. Bump `rev` when you
change a scheme's notes. If the owner has written in the box themselves the
correction is skipped and their words are kept, which the app knows by hashing
the note as seeded. Items still never change under an existing id.

When a scheme's content changes, **ship it under a new id** with a name that
tells it apart in the list. It arrives as a new entry, and whatever the device
already had is left alone for the owner to keep or delete. Say in your reply
which entry to open and that the old one can be deleted.

**Anything meant to be in "New from base plan" goes in `START` and `STARTP`
as well.** A new scheme is built from those, not from the named schemes, so work
that only lands in a scheme makes "New from base plan" look like the old design.
Both were needed for the swales and mounds; assume both are needed again.

Row shapes, which are positional and easy to shift by one:

| Array | Row |
| --- | --- |
| `items`, `START` | `[name, x, y, w, h, rot, buildUpMm, buildUpMaterial, pts]` |
| `plants`, `STARTP` | `[plant id or exact name, x, y]` |
| `LIB` | `[name, shape, cat, w, h, cost, unit, fill, stroke, stage, buildUpMm, buildUpMaterial, locked, sharp]` |

`LIB` is the element library and the palette is built straight off it, so adding
an element is adding a row plus a `HARDCOL` entry for its plan colours. `locked`
means the element *arrives* locked. Site fabric does, so a pipe is not nudged
while a bed is being moved. `sharp` means its run keeps its corners instead
of being splined through them. Both are booleans and both are read as `l[12]`
and `l[13]`, so a row that stops short of them is simply unlocked and smooth.

The ninth column, `pts`, is an array of `[x, y]`, and it makes the item a curved
run: a smooth line through those points, `w` metres wide, with `x`, `y`, `h` and
`rot` ignored. Ask geometry through `area`, `centre`, `samples`, `corners` and
`linLen`, which all know about it; never read `w`/`h` directly to get a length.
Write the first point into `x` and `y` anyway so the row reads honestly, and put
`null` in the two build-up columns where there is no build-up. They have to be
filled for `pts` to land in the ninth slot at all. A trough or a path is a bent
line on the ground, so prefer a run over a box for one; the swales in `START`
and in `s-contour-swales` are the worked example.

`rot` is the one that gets dropped. Leave it as `0` rather than omitting it, or
the build-up depth is read as a rotation and the cost and volume come out `NaN`.
Circles (`Planting mound`, plants) take a radius in `w` and `0` in `h`.
Plant ids are neither unique nor always filled in, so prefer the exact name.

## Writing

`STYLE.md` is how the words here should read, and it applies to scheme notes,
the handbook, Checks messages, this file and commit messages. Shorter than your
first draft, no em dashes, no line built to land, and every number saying where
it came from.

## Notes on a scheme

Every scheme carries a `notes` string, shown in the Notes card under the plan and
carried into the brief the Ask screen builds. When you ship a scheme, write its
notes: what it is for, what you changed and why, and what is left to decide. The
owner writes in the same box, so keep to plain sentences and do not treat it as
yours alone.

## Before you say it is done

- Bump `CACHE` in `sw.js` and `BUILD` in `index.html` together for any change to
  a served file, or devices keep the old copy. `BUILD` shows on the Schemes sheet,
  so ask what it reads before believing a device has the change.
- Rebuild the offline copy with `node tools/build-offline.js` when a served file
  changes, or `offline/234-duffy-offline.html` goes stale. It checks its own work
  and refuses to write a file that still points at anything beside it.
- Publish by merging to `main`. Pages serves `main` at the repository root.
  Confirm with the `pages build and deployment` run for your own commit's SHA,
  or by fetching the changed file from the live URL. A green push is not a
  publish.
- Run `node tools/check.js` before you say anything is done. It builds every
  scheme and the base plan under node, and asserts the things a change must not
  break: the handbook's 13 sections with no `undefined` blocks, `RL()` exact at
  all 126 surveyed points, a numeric `rot` on every item row, no dash in prose,
  an edited scheme on a device left alone by seeding, and issue counts against
  `tools/baseline.json`. `--update` rewrites the baseline, which you do only
  when a count moved on purpose.

## Placing anything on the plan

`x` runs from the reserve boundary (0) to the street (40) and is the fall line,
1 in 19. `y` runs from the east-north-east boundary (0) to the west-south-west
(21.33) and is effectively level, 1 in 132, so contours, swales and mounds run
in `y`. The constraints that will fail a placement are all computed by the app
and worth running rather than reasoning about: protection zones and structural
root zones, building footprints, the overland flow corridor at `y` 0.5 to 3.0, the
3 m standoff for anything that infiltrates, and the 100 mm cap on material added
inside a protection zone.
