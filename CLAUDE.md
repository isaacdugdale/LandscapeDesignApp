# Working on this repo

Static site, no build step. `README.md` describes what each file is and how it
publishes; read it first. This file is the part that is easy to get wrong.

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
| `items`, `START` | `[name, x, y, w, h, rot, buildUpMm, buildUpMaterial]` |
| `plants`, `STARTP` | `[plant id or exact name, x, y]` |

`rot` is the one that gets dropped. Leave it as `0` rather than omitting it, or
the build-up depth is read as a rotation and the cost and volume come out `NaN`.
Circles (`Planting mound`, plants) take a radius in `w` and `0` in `h`.
Plant ids are neither unique nor always filled in, so prefer the exact name.

## Before you say it is done

- Bump `CACHE` in `sw.js` for any change to a served file, or devices keep the
  old copy.
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
