# Where this got to, and what is next

Written at the end of a long session, so work can resume without re-deriving it.
Delete this file once the list is empty.

## Done and live

- Levels are the surveyor's own TIN from layer `SRF-VIEW` of the CAD file, not a
  model fitted to it. 126 points, 196 surveyed faces, 83 Delaunay fill.
- The kerb is seven surveyed levels rather than one constant.
- `STYLE.md` written, with Isaac's worked rewrite of the `s-sumps` notes as the
  calibration. Applied to the handbook, the scheme notes, the Checks messages,
  the printed sheets, the README, `CLAUDE.md` and the code comments.
- Dashes: zero in prose, in both the literal and the `—` escaped form. What
  remains is eight range dashes in handbook tables and one plant name, which
  `STYLE.md` allows.
- Checks severity: a plant on a building footprint is a care saying it can only
  be a pot, the driveway is no longer tested as a building, and every stop and
  care carries its reason in the title.

Live build at the time of writing: **v34**.

## Next, in order

1. **A committed test harness, `tools/check.js`.** There is none. Every check in
   this session was an ad-hoc harness rebuilt in a scratchpad, and it broke each
   time `index.html` changed length. `CLAUDE.md` tells you to put a scheme
   through `checks()`, `issues()`, `water()` and `quantities()` under node before
   shipping and gives you nothing to do it with.

   It needs to: locate the class body by pattern rather than line number, stub
   `DCLogic` and `localStorage`, build every scheme and the base plan, and
   assert. The assertions worth having are the ones that would have caught what
   shipped: the handbook has 13 sections and no `undefined` blocks; every scheme
   builds; `RL()` is exact at all 126 survey points; no prose carries a dash in
   either form; issue counts match a committed baseline so a change has to be
   deliberate.

   The bug it would have caught: a `handbook.js` edit left
   `['note',...]['earth','']`, which is valid JavaScript, evaluates to
   `undefined`, deleted the Earthworks section and crashed Sources. `node
   --check` passed it.

2. **Scheme revisions, so a corrected note reaches the iPad.** `seedStore()`
   keeps a `seeded` list and skips any id already in it, so none of the rewritten
   notes will ever appear on a device that has already opened those schemes.
   Every future correction hits the same wall, and the present workaround is to
   ship a whole new scheme under a new id, which litters the list.

   Give each scheme a `rev`. Re-seed the notes when `rev` increases and leave the
   items alone, so nothing the owner has moved is touched. Bump the rev on the
   schemes whose notes were rewritten this session.

## Open decisions, not work

- The front swale by the east wing sits 2.41 m from the wing, inside the 3 m
  infiltration standoff, and falls 128 mm along its own length against a 100 mm
  limit. Both readings hold on the surveyor's surface. Moving it is a relocation,
  so it is left for the owner. Written up in the `s-gravel-fruit` notes.
- Four planting mounds cross the front boundary into the verge, where the two
  street trees are. Now legible as stops. Pre-existing.
- Three of the four front paths cannot be gravel. The one at 34.1, 14.1 could be,
  if its first 2.3 m is trimmed.
- The handbook says the block falls 2.08 m at 1 in 19. The surveyor's surface
  gives 1.99 m at 1 in 20. A measurement-convention difference, and 1 in 19 is
  quoted across the app, so it was left rather than churned.
