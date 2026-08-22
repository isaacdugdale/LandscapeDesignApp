# 234 Duffy: Landscape Studio

A planting and hardscape editor for 234 Duffy, built to be used on an iPad from the
home screen. Static site: no build step, no server, no accounts. Schemes are stored
in the browser on the device.

## Publishing it

The live site is `https://isaacdugdale.github.io/LandscapeDesignApp/`. On the iPad
open that URL in Safari, then **Share, Add to Home Screen**.

**Pages deploys from `main` / `/ (root)`**, set under **Settings, Pages**. Pushing to
`main` publishes. Pushing anywhere else does not, however green the push looks.
Confirm a publish by the `pages build and deployment` run for your commit's own SHA
under **Actions**. A push succeeding is not evidence the site changed. If the source
is ever moved to another branch, rewrite this paragraph in the same change. This
paragraph naming a stale branch is what cost a release once already.

The app files must sit at the repository root, `index.html` next to `README.md`,
because Pages only serves from `/` or `/docs`.

`sw.js` caches the app, so a published change also needs `CACHE` bumped there. See
the last note in this file.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The app: plan editor, checks, stages, the reference sections, ask |
| `site-data.js` | The site: boundaries, contours, the surveyor's 126 ground levels and their triangulation, the seven kerb and gutter levels, buildings, the five protected trees and their zones, fences, drainage, the element library, the 82-plant list |
| `handbook.js` | The reference half: the Site, Works and Risks sections, as blocks the app renders |
| `bloom.js` | Flowering month and flower colour per plant. Horticultural, not survey |
| `printsheet.js` | The printable set: plan, schedules and bloom calendar, drawn in mm at a true scale |
| `support.js` | Rendering runtime the app loads |
| `_ds/organic-…/` | The Organic design system: tokens stylesheet and component bundle |
| `vendor/` | React and the two typefaces, served from here rather than a CDN |
| `sw.js` | Service worker: caches the app so it opens with no signal |
| `manifest.webmanifest`, `apple-touch-icon.png`, `icon-512.png` | Home-screen name and icon |
| `offline/234-duffy-offline.html` | The whole app in one file. AirDrop it and it works with no network. Built by `tools/build-offline.js`, so rebuild it whenever a served file changes |
| `source/` | The original handbook and project data the site file was extracted from |
| `CLAUDE.md` | How to add a scheme, publish, and check it. The parts that are easy to get wrong |
| `STYLE.md` | How the words here should read |
| `tools/build-offline.js` | Rebuilds the offline single-file copy from the current sources |

Sun hours, ground levels, cut and fill, protection-zone rules and costs are computed
in the app from `site-data.js` using the same maths as the handbook. Change a number
there and every screen follows.

## Notes

- The **Ask** screen answers in-app only where a model key is available. On the iPad
  use the **Claude app** button. It assembles the question, the site fact sheet and
  the current layout, and hands the brief to the share sheet.
- **Site**, **Works** and **Risks** are the handbook, carried into the app so it
  stands alone in the garden: levels and soil, sun, how water moves, the tree
  clauses, the drainage and earth shaping, the planting zones, the courtyard, and the
  ten-item risk register. Content is `handbook.js`, written as blocks (`p`, `h`,
  `note`, `ul`, `kv`, `tbl`). The screen that renders them is generic, so adding a
  section means adding data, not markup. Where a figure is also computed by the app,
  the app is what to trust.
- Everything is southern hemisphere. 21 December is summer, 21 June is winter, and
  the sun sits due north at midday. The four deciduous trees each carry their own
  leaf window, set by what the tree is in this climate. The ornamental pear breaks
  bud in late August and holds on into May. The ash runs a month behind it at both
  ends. The two street trees drop earlier and fill out later. The windows live in
  `LEAF` in `site-data.js` as four dates a piece, and the model ramps between them
  rather than switching, because a tree leafing out shades progressively. Full shade
  lands about November to March, which is the rule to plant by. April is still a
  full-canopy month here, and the pear is dense from early October.
- Nothing is fetched from the internet. React and both typefaces are served from
  `vendor/`, and `sw.js` caches the app on first visit, so after that it opens with
  no signal. To change a vendored file, bump `CACHE` in `sw.js` or devices keep the
  old copy. The app also reloads itself once when a newer worker takes over, so a
  published change lands on the first open rather than the second.
- **Print** builds a three-sheet set from the current scheme: the plan at a true,
  stated scale with numbered keys and a title block, the schedules those numbers
  refer to, and the bloom calendar. It hands the set to the browser's print dialog,
  where iOS offers *Save to Files* as a PDF. A4 and A3, both landscape. The plan
  takes the largest standard scale that fits, 1:125 on A3 and 1:200 on A4, and says
  which. The drawing is vector, so it stays sharp at any size and a ruler on the
  paper reads true.
- **Swales and mounds** are a level trough on the contour with the spoil laid along
  its downhill side. They arrive as curved runs rather than rectangles, each
  following the surveyed contour it sits on, because that is the shape a level trough
  has on the ground. The base plan and the **Contour swales** scheme both ship them
  that way. On this block almost none are dug: protection zones cover half the back
  garden and nearly all the front, so the trough is formed by raising its shoulders
  in 100 mm of coarse woodchip. Only the rear pocket is clear enough for soil. The
  gravel paths are part of the same system. Laid level on 150 mm of aggregate they
  hold about 50 litres a square metre, which is why they run across the slope and why
  the back path now stops 3 m short of the addition. **Works, Drainage** adds up what
  every trough, path, bed and mound on the current plan holds against the design
  storm. The Checks screen stops any that infiltrates within 3 m of a wall, or that
  is turned down the fall line instead of across it.
- **Works, Levels** is the sheet to hand a builder who asks for the levels.
  Earthworks says what may be dug. This says what each surface finishes at: one
  string line along each thing, a level at each end of it, the grade between them,
  and the cut and fill that takes. A platform is eased toward the grade it wants,
  1 in 40 for a lawn and 1 in 80 for paving. A path is not, because how steep a path
  is comes from where it runs, and easing one moves the ends it was drawn to meet.
  Only a surface at least 60 per cent clear of a protection zone carries set-out
  levels. Inside a zone the finished surface is the existing surface, so the rest
  print as found. The tree plan allows hand and hydro digging only, in the approved
  scope, and caps added material at 100 mm of coarse woodchip, which is not something
  grass grows in. Grading the clear part of a surface and leaving the rest builds a
  step, so a surface mostly in a zone is left alone whole. Two printed sheets, and
  **Levels only** in the print dialog. The Drainage total deducts ground counted
  twice, because a gravel path laid along a trough is one gravel-filled trench rather
  than two things stacked.
- **Works, Earthworks** is the first thing this design needs in the real world. A
  setout drawing with the no-dig zones loud, existing levels on a 4 m grid, and every
  excavation keyed and colour-coded by what may touch it. Then a schedule of volumes,
  depths and method, the rules that bind the machine, and what to confirm before it
  arrives. A button at the foot of it prints the same content as two sheets to hand
  over, and **Print, Earthworks only** is the same thing from the print dialog. The
  screen and the sheets are built from one set of functions, so they cannot quote
  different numbers, and method comes from the same protection-zone test the Checks
  screen runs. Levels are indicative, exact where the surveyor measured and
  interpolated between. That is a red strip at the top, not fine print. The strip
  names the datum and carries the survey's own warning that no underground services
  have been located.
- **Ground level is the surveyor's own surface.** Not a model fitted to the survey,
  and not the survey read off its printed labels. The CAD file carries Brian
  Milburn's triangulation on layer `SRF-VIEW`. That is 126 measured ground points
  with true coordinates, and the 196 faces drawn between them. `SPOT` and `TRI` hold
  exactly that. Placing it in this frame is a fit to the four boundary corners, which
  land within 8 mm of the surveyed dimensions and give 806.9 m² against the plan's
  807 m². Surveyed faces are listed first, so one answers wherever it exists. 83
  Delaunay triangles fill the rest, which is mostly the house footprint, where no
  levels were taken. So `RL` is exact at every surveyed point. Between them it sits
  within 5 mm of the surveyor's surface, and that 5 mm is the cost of storing levels
  to the centimetre the survey quotes. `tools/survey-extract.js` is the derivation,
  and `--check` reads the DWG and says whether the app still holds what the surveyor
  drew. Past the last measured point the older fitted
  surface still answers, because an edge extrapolates better from a smooth surface
  than from the nearest triangle's slope. None of it is set-out. That comes off the
  survey plan, datum A.H.D., origin SR585 at RL 608.442, and the plan records that no
  underground services have been located.
- **The kerb is not one level.** It drops 330 mm along this frontage, 609.82 at
  the north end to 609.49 at the south, so a sump's fall to the street depends on
  which end its line reaches. The app used a single 609.85, which is above every
  surveyed kerb point and 320 mm above the gutter the spine discharges to, and it
  told the five sumps on the spine they had a third of a metre less fall than they
  have. `KERBP` in `site-data.js` is the seven surveyed kerb and gutter levels and
  the sump note quotes the nearest. The handbook had this right before the app did:
  its drainage table already gave the two outlets different kerbs.

- The bloom calendar plots mature height against month. The bar's thickness is the
  plant's mature spread and its colour is the flower's own. Flowering months and
  colours live in `bloom.js` and are the one part of the app that is judgement rather
  than survey, so correct anything you disagree with. Plants grown for foliage are
  named under the chart rather than silently dropped. It is on **Works, Planting** as
  well as the printed set, so you can look at it without going near the print dialog.
- **On a laptop** the window fills rather than sitting inside a drawing of an iPad,
  and the trackpad behaves the way a trackpad should. Two fingers slide the plan, a
  pinch zooms it, and a mouse wheel still zooms in notches. With something selected,
  the arrow keys nudge it 50 mm, shift makes that 500 mm, Backspace deletes it,
  Escape drops the selection, and ⌘Z undoes. None of those fire while you are typing
  in the notes or the ask box.
- **Curved runs.** Select a path, swale, edge or wall and **Curve it** turns it into
  a run: a smooth line through draggable points, a fixed width, and h no longer
  meaning anything. Drag a point to move it. Drag the small handle between two points
  and it becomes a point. Double-tap a point to take it out. The blue handle on the
  edge sets the width. **Straighten** puts it back in a box. Length, area, cost, the
  protection-zone tests, the level check and both printed sheets all read the curve
  rather than the rectangle around it, so a bent trough is checked for level along
  the whole of itself rather than end to end. A starting layout can say so too. The
  ninth column of an `items` or `START` row is the point list, so a scheme arrives
  already bent instead of waiting to be bent by hand.
- **The site fabric is editable, and arrives locked.** The berm behind the addition
  and the stormwater lines were drawn out of `DRAIN` in `site-data.js`: visible,
  untouchable, and absent from the elements list, because there was nothing in the
  library they could be. **Diversion berm** and **Stormwater line** are those things
  now. Same tan, same blue, same alignments, but selectable, movable, costed and
  checked. Because nobody wants to nudge a pipe while moving a bed, they arrive
  **locked**. A locked item selects and reads normally, shows a dashed outline
  instead of grab handles, and ignores drags, arrow keys and Backspace. The only
  action offered is **Unlock**. Unlocked, it behaves like anything else, and **Lock**
  is there to put it back. Every element carries the switch, not just these two, so a
  terrace you have settled can be locked out of the way of your own elbows. The
  library's thirteenth column is what *arrives* locked. The item carries whether it
  *is*, so both choices save with the scheme.
- **The pits are elements now too.** Eight of them: `S0` to `S3` down the DN150 spine
  in the side strip, `D1` on its branch, `P0` at the foot of the corner swale, `P1`
  at the head of the sleeve under the garage, and `P3` at the driveway. They were
  dots drawn out of `DRAIN.pits`, readable and untouchable. **Yard sump** is that
  thing as an element: selectable, costed at $180 each, and checked. It arrives
  locked like the rest of the site fabric. It is deliberately *not* in `SOAK`. A sump
  and a soak pit are opposite answers, one handing water to a pipe and the other
  putting it in the ground and keeping 3 m off every wall, so sumps add nothing to
  what the shaping holds on the Drainage page. Unlike a `Stormwater line` a sump is
  *not* buried. Its grate is the ground surface, so one inside a building footprint
  is a real clash rather than a sleeve. The Checks screen asks whether it reaches a
  line, whether it is one of the two taking runoff off the reserve and so needs a
  silt trap, and it inverts the overland-flow rule, because a pit draining that
  corridor belongs there so long as its lid sits flush. Depth stays off the
  earthworks schedule. It is set by the invert of the line the sump joins, which is
  the stormwater contractor's number, not this app's.
- A scheme saved before those elements existed still has to show the pipes, so the
  site version of a line is drawn only while nothing in the layout stands in for it.
  `owns()` decides, by element name, in the app and on both printed sheets. The
  sleeve highlights and the overland corridor are annotation rather than objects and
  are drawn either way.
- **A run can keep its corners.** A `pts` run is normally a smooth Catmull-Rom line,
  which is what a trough, a path or an edge is, and is not what a pipe is. Splining
  the spine's surveyed dogleg moved it 871 mm, enough to shift a line placed to stay
  clear of a protection zone. Evenly spaced control points needed 76 of them to get
  that under 100 mm. So the library's fourteenth column marks an element *sharp*. Its
  centreline is the polyline itself, densified every 500 mm so the zone tests still
  get a sample per half metre, with handles on the surveyed corners rather than fifty
  points approximating them.
- **Diversion berm** is deliberately not a `Mound, built up`, because the two carry
  opposite instructions. A trough or a mound on the contour is judged on being level.
  A berm is judged on *not* being. The Checks screen asks it two questions. Does the
  ground fall along it, so water leaves past an end rather than gathering at a low
  point a foot from the wall? And does it stand across the whole of the wall it
  protects, or does water walk round the end of it? **Stormwater line** is checked on
  its route rather than its level. Clause 6.5.2 rules out a new service through a
  protection zone unless the tree plan says so. It is the one element in the library
  that is *buried*, so passing under the garage slab is the design rather than a
  clash, and its metres are counted as drainage rather than as walls and edges.
- Making the berm an element made visible something that was always true. In the base
  plan the back path runs along the same strip, so the two draw over each other, 6.2 m²
  of it. Both are built up 100 mm over that ground, so the chip and the cost are
  counted twice and the berm ends up the section the path was built to rather than the
  ridge it has to be. The Checks screen says so now. Overlap is tested where it changes
  what gets built: a graded surface lying on a swale, and one lying on a berm. Nothing
  else on the plan is tested for it. **Contour swales** has the path further uphill and
  does not have the problem.
- Selecting anything on the plan floats a bar over the drawing with its name,
  **Copy**, **Rotate 90°** on rectangles, **Lock**, and **Delete**. The inspector
  carries the same actions from the same definition. The bar exists because the
  inspector is a scroll away in normal mode and hidden in focus mode, which is when
  you are actually moving things.
- The **expand** button on the plan, with the zoom controls, drops the sidebar,
  header, palette and inspector so the drawing has the whole screen. It is for once
  the palette has done its job and you are only moving things around.
- A named scheme is seeded onto a device once, by its id, and never again. A change
  to one already on the device does not reach it. Ship the changed version under a
  new id and it arrives as a new scheme in the list, leaving whatever the device had
  alone. This is also why the base plan, `START`, has to carry anything meant to be
  in **New from base plan**: a new scheme is built from that, not from the named
  schemes. `CLAUDE.md` has the full recipe.
- **Notes** under the plan are per-scheme, saved with it and carried into the Ask
  brief, so a scheme arrives explaining itself. **Schemes, Push to gist** sends the
  schemes to a private GitHub gist as one small file each plus an `index.json`. The
  file backup does not do this, and a single blob is rendered truncated with the
  newest scheme the part that gets cut. That gist is how the iPad's schemes are read
  on a laptop. Open <https://gist.github.com/isaacdugdale> signed in as yourself and
  it is the one titled **234 Duffy Schemes**, holding `index.json` and one file per
  scheme. Do not write its URL down here or anywhere else public. A gist pushed as
  private is unlisted rather than access-controlled. It does not appear on that page
  to anyone but you, but the URL is the whole of the lock, so in a repository this
  public it would be the same as making the schemes public. It uses a fine-grained
  token with gist write scope that you paste once and that stays in the browser's
  local storage. It is the only thing in the app that talks to the internet, and it
  only does so on that tap. Revoke the token on GitHub and everything else still
  works.
- Schemes are per-device. They live in that browser's local storage. **Schemes, Back
  up** writes them to a JSON file through the share sheet and **Restore** reads one
  back, which is how a scheme reaches a second device. Restoring only adds. An
  incoming scheme whose id is already taken arrives under a new one. Live sync
  between devices still needs a database, which is a later job.
