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

Live build at the time of writing: **v35**.

## Next, in order

Both of the jobs that were here are done.  runs 91 assertions
and handbook
levels
library
schemes
prose
seeding
baseline

all 91 checks passed is the thing to run before shipping. Scheme notes now
carry a `rev`, so a corrected note reaches a device without touching the layout.

What is left is smaller.

1. **The Ask screen brief.** It builds from the layout and the fact sheet, and
   nothing checks that what it claims still matches what the app computes. It is
   the one surface a stale number could hide in.
2. **The four verge mounds.** Now legible as stops, still crossing the front
   boundary into the verge. Either move them or record why they stay.
3. **Sun hours are cached per scheme** in `sunCache`, and nothing invalidates it
   when an item moves. Worth checking it is keyed on more than the scheme id.

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
