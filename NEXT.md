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
- `Terrace fill` is an element: a soft surface that grades level to one block
  course above the finished floor, so the block edge retains one platform along
  its whole length instead of only where the lawn reaches. In `START` too.
- Works, Earthworks carries a setting-out grid: 2 m squares over the whole
  block, the level each square is now and the level it finishes at, on two
  sheets. Sheet one is the levels alone, sheet two marks where a protection zone
  or the 400 mm fill and 500 mm cut limits bite. `gridView` in `printsheet.js`.
- A platform edge with no wall behind it battens down at 1 in 10 instead of
  standing as a vertical face of earth. `RAMPN` and the `held` test per edge in
  `finParts`. The lawn's two open ends ramp; its walled edge does not.
- A surface has to reach 50 mm inside a building footprint before Checks calls
  it an overlap. Paving is meant to run up to the house, and drawn to the wall
  its edge samples land exactly on the footprint line.
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
- The house is the architect's IFC model, not six boxes traced off the PDF.
  `source/house.json` is the extract, `tools/house-extract.js` puts it on the
  block, `house-data.js` is what the app reads. The IFC is 54.7 MB and stays out
  of the repo, as the survey DWG does. The fit is the building's own grid angle
  and lands inside the app's building envelope to 20 mm.
- Interior is a screen: the plan of what is built, and a section cut through it,
  sharing one scale. The cut steps in half metres.
- The massing comes off the roofs. Five of the six boxes moved more than 100 mm,
  and the sun map fell 2.0 per cent. That grid total is in `tools/baseline.json`
  under `_sun`, because nothing else was watching it.
- Floor levels confirmed throughout. FFL 611.650 and the sunken lounge 611.070
  match the architect exactly. The garage floor at 611.535 and its apron at
  611.575 are new to the app.
- Doors are drawn by what they do. Eight of the fifteen slide, so only the
  seven hinged ones carry a swing. Type and nominal leaf come off the family
  name, because the reported width is the pocket: the 1060 cavity sliders
  report 2.196 m. Checked against the floor plan A2.02, which calls up the two
  full height cavity sliders, the 820 square set and the three track slider.
- The site plan draws the model's outline, one path per building, as built.
  It does not tint new work: Shape still does, from the flag in BOXH. The
  footprint is 245.0 m² against the 284.4 m² the boxes claimed.
- A floor counts as house if it is inside one of the six building extents. Under
  a roof was tried and drew the paved terrace as building, the terrace sitting
  under a transparent canopy.

Live build at the time of writing: **v48**.

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
5. **Two roofs are half there, and the fix needs the IFC.** `top_face` in
   `tools/ifc/extract.py` kept the largest upward face, and both slopes of a
   gable point up, so both tile roofs came across as one pitch. The extractor
   now takes every upward face and `tools/house-extract.js` reads them, but the
   data cannot be regenerated here: the IFC is on Isaac's machine. Run
   `python3 tools/ifc/extract.py '<file>.ifc' source/house.json`, push
   `source/house.json`, then `node tools/house-extract.js > house-data.js` and
   `node tools/check.js --update`. The `_roofs.partial` baseline goes from 2 to
   0. Ridge and eave are unaffected, so only the section changes.
6. **Checks still tests footprints as six boxes.** `BLDR` is built from `BOXH`,
   and the model's outline is 19.0 m² smaller. Moving Checks onto it would free
   ground along the walls and move every scheme's issue count, so it wants its
   own pass and a baseline update.
7. **The sun ray-casts against box mid-heights.** `blockTop` is eave plus half
   the rise. The roof planes are in `house-data.js` now, so a ray could be cast
   against the roof itself. It would change the sun map again.
8. **The DJ return.** `source/dj-return.html` is the interior joinery study:
   deck recess, record storage, the Mill kitchen, the dining table, parametric
   with presets. It is not in the app yet. It draws in three.js from a CDN, and
   the app has to work with no signal, so r128 wants vendoring into `vendor/`
   first: 603 kB, 149 kB gzipped, and about 600 kB onto the offline copy.

- The block is the 1000 x 400 x 400 the Canberra yards stock, so `BLOCKH` is
  0.40 and everything behind the wall finishes 400 mm above the paving. About
  368 kg a block. Sizes, the yards checked and the caveat are in
  `source/project-data.json`. The $250 a metre rate was set for the 500 course
  and wants re-quoting.
- Leaving the front yard out saves almost nothing: 3.8 m³ of 61.6. The fill is
  the terrace, the lawn and the terrace fill, all between x 8 and x 20.
- The fill does not balance. The scheme imports 50.1 m³ and takes 2.2 m³ off.
  Levelling under the new build yields 1.8 m³, because the link and the kitchen
  addition already sit below slab level, and topsoil off all three footprints is
  5.5 m³ at the 100 mm the borehole logs record. About 49 m³ has to be bought.

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
