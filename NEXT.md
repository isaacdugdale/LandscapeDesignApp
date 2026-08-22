# Where this got to, and what is next

**The convention.** This file is the handover between sessions. Read it first,
edit it last. It has three parts and no others: what is live now, a numbered
todo in the order worth doing, and the decisions that are the owner's rather
than work. Keep it under about eighty lines. It is not a log: when something is
done it comes out of the todo and turns into one line under what is live, or
disappears if it left no trace worth keeping. Git history is the log.

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

## Todo

Roughly in order. Nothing here is urgent and each is a spare-tokens job.

1. **Commit the survey extraction.** `SPOT` and `TRI` are in `site-data.js`, but
   the code that derived them from layer `SRF-VIEW` of `3891_ZB EXPLODED
   VERSION.dwg` only ever lived in a scratchpad and is gone. That is the
   boundary-corner fit that puts MGA into the app frame, the 3-clique walk that
   rebuilds the surveyor's faces from their edges, the filter that drops a
   triangle containing another vertex, and the Delaunay fill. Rebuilding it is a
   day. Commit it as `tools/survey-extract.js`, with a note that it needs
   LibreDWG built from source and `ezdxf`, and that the DWG is not in the repo.
2. **The Ask screen brief.** It builds from the layout and the fact sheet and
   nothing checks that its claims still match what the app computes. It is the
   one surface a stale number could hide in.
3. **`sunCache`.** Cached per scheme, and it looks like nothing invalidates it
   when an item moves. Read it before trusting that; this came from a glance,
   not a test.
4. **The four verge mounds.** Legible as stops now, still crossing the front
   boundary. Either move them or record why they stay.

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
