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
- Site has a section, Shape, drawing the block as a solid of earth as surveyed
  and as built. Turn left and turn right walk it round a quarter at a time.
  Each surface is drawn at its own level rather than sampled off the grid, so
  paving set level with the floor meets it. Reserve boundary near left, street away to the right, driveway
  top right, which is the plan's own framing. The surveyed half leaves the new
  work out, so the additions appear between the two panels. `finRL` in `index.html` is the finished surface and `isoView` in
  `printsheet.js` draws it. The house stands at its finished floor in it.
- The outdoor kitchen is priced as one item at $2,500, not by the square metre,
  so it never double counted the paving under it. It no longer carries a GRADE
  entry either, because grading it as well graded the same ground twice.
- Platforms rather than graded slopes. `datum` in `GRADE` makes a surface a level
  plane. Paving within 2 m of a building takes the finished floor, 611.65, so a
  sliding door opens onto it with no step. The lawn takes one 500 mm course above
  that, which is what sets the terrace.
- Tree protection zones no longer stop a surface being graded. The owner set that
  aside. Checks carries the conflict per surface, with the cut and the fill that
  lands inside a zone.
- The architect's levels are in `source/project-data.json`, and `tools/check.js`
  asserts the app agrees with them. The drawing set does not need reading again.
- `tools/survey-extract.js` is that derivation, in the repo rather than in a
  scratchpad. `--check` reads the DWG and says whether the app still holds what
  the surveyor drew. It found eleven levels a centimetre out and they are fixed;
  the survey plan's own printed labels confirm two of them.
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

Live build at the time of writing: **v40**.

## Todo

Roughly in order. Nothing here is urgent and each is a spare-tokens job.

1. **The Ask screen brief.** It builds from the layout and the fact sheet and
   nothing checks that its claims still match what the app computes. It is the
   one surface a stale number could hide in.
2. **`sunCache`.** Cached per scheme, and it looks like nothing invalidates it
   when an item moves. Read it before trusting that; this came from a glance,
   not a test.
3. **The four verge mounds.** Legible as stops now, still crossing the front
   boundary. Either move them or record why they stay.

4. **The seam at the reserve boundary.** `RL` answers from the surveyed TIN
   where there is one and from the older fitted surface past it. The two
   disagree by up to 261 mm where they meet, at x 3, y 0. It is 6.5 per cent of
   the block, almost all of it the strip along the reserve boundary where the
   surveyor stopped. The Shape view now mutes that ground so it is not read as
   survey, but a few items sit in the strip and take their levels from the
   fitted surface. Clamping the fallback to the nearest triangle edge would
   remove the step; it would also change levels, so it is a decision rather
   than a fix.
5. **The kitchen addition and link roof heights.** `BOXH` gives them a ridge of
   614.00 and 613.90, both below the finished ceiling at 614.165. Every other
   building agrees with the architect's set. It changes the sun map and nothing
   else. Recorded under `floor_levels_m_AHD._unresolved`.

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
