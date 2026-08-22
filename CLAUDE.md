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
it. So changing a scheme's *items* in place reaches nobody who has already
opened the app. It looks fine in a fresh browser and changes nothing on the
iPad. That mistake has now been made once; do not make it again.

**Notes are the exception, through `rev`.** A scheme carries a `rev`, and a
higher one than the device holds replaces the notes, leaving the layout alone.
So a corrected note no longer needs a whole new scheme. Bump `rev` when you
change a scheme's notes. If the owner has written in the box themselves the
correction is skipped and their words are kept, which the app knows by hashing
the note as seeded. Items still never change under an existing id.
