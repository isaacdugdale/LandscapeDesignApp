# Working on this repo

Static site, no build step. `README.md` describes what each file is and how it
publishes; read it first. This file is the part that is easy to get wrong.

## Token usage

Be frugal. This is a small repo and most jobs here are a data edit plus a
paragraph. Read the part of a file you need rather than the whole of it, check a
layout with one node script that prints everything at once rather than a run per
question, and do not re-derive a number you already have. Say what changed and
why in a few lines, not a report.

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
the app — it looks fine in a fresh browser and changes nothing on the iPad. That
mistake has now been made once; do not make it again.

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
means the element *arrives* locked — site fabric does, so a pipe is not nudged
while a bed is being moved — and `sharp` means its run keeps its corners instead
of being splined through them. Both are booleans and both are read as `l[12]`
and `l[13]`, so a row that stops short of them is simply unlocked and smooth.

The ninth column, `pts`, is an array of `[x, y]`, and it makes the item a curved
run: a smooth line through those points, `w` metres wide, with `x`, `y`, `h` and
`rot` ignored. Ask geometry through `area`, `centre`, `samples`, `corners` and
`linLen`, which all know about it; never read `w`/`h` directly to get a length.
Write the first point into `x` and `y` anyway so the row reads honestly, and put
`null` in the two build-up columns where there is no build-up — they have to be
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
- Publish by merging to `main` — Pages serves `main` at the repository root.
  Confirm with the `pages build and deployment` run for your own commit's SHA,
  or by fetching the changed file from the live URL. A green push is not a
  publish.
- Check the layout rather than eyeballing it. `site-data.js`, `handbook.js` and
  the class body of `index.html` all run under node with a stub `DCLogic` and a
  fake `localStorage`, so a scheme can be built with `baseItems()` and put
  through `checks()`, `issues()`, `water()` and `quantities()` before it ships.
  Simulate a device that has already seeded the old id, or the bug above is
  invisible.

## Placing anything on the plan

`x` runs from the reserve boundary (0) to the street (40) and is the fall line,
1 in 19. `y` runs from the east-north-east boundary (0) to the west-south-west
(21.33) and is effectively level, 1 in 132 — so contours, swales and mounds run
in `y`. The constraints that will fail a placement are all computed by the app
and worth running rather than reasoning about: protection zones and structural
root zones, building footprints, the overland flow corridor at `y` 0.5–3.0, the
3 m standoff for anything that infiltrates, and the 100 mm cap on material added
inside a protection zone.
