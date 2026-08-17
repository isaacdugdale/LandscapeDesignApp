# 234 Duffy — Landscape Studio

A planting and hardscape editor for 234 Duffy, built to be used on an iPad from the
home screen. Static site: no build step, no server, no accounts. Schemes are stored
in the browser on the device.

## Publishing it

The live site is `https://isaacdugdale.github.io/LandscapeDesignApp/`. On the iPad
open that URL in Safari, then **Share → Add to Home Screen**.

**Pages deploys from `main` / `/ (root)`**, set under **Settings → Pages**. Pushing
to `main` publishes; pushing anywhere else does not, however green the push looks.
Confirm a publish by the `pages build and deployment` run for your commit's own SHA
under **Actions** — a push succeeding is not evidence the site changed. If the
source is ever moved to another branch, rewrite this paragraph in the same change:
this naming a stale branch is what cost a release once already.

The app files must sit at the repository root — `index.html` next to `README.md` —
because Pages only serves from `/` or `/docs`.

`sw.js` caches the app, so a published change also needs `CACHE` bumped there or
devices keep serving the old copy from disk. See the last note in this file.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The app — plan editor, checks, stages, the reference sections, ask |
| `site-data.js` | The site: boundaries, contours, buildings, the five protected trees and their zones, fences, drainage, the element library, the 82-plant list |
| `handbook.js` | The reference half: the Site, Works and Risks sections, as blocks the app renders |
| `bloom.js` | Flowering month and flower colour per plant — horticultural, not survey |
| `printsheet.js` | The printable set: plan, schedules and bloom calendar, drawn in mm at a true scale |
| `support.js` | Rendering runtime the app loads |
| `_ds/organic-…/` | The Organic design system: tokens stylesheet and component bundle |
| `vendor/` | React and the two typefaces, served from here rather than a CDN |
| `sw.js` | Service worker: caches the app so it opens with no signal |
| `manifest.webmanifest`, `apple-touch-icon.png`, `icon-512.png` | Home-screen name and icon |
| `offline/234-duffy-offline.html` | The whole app inlined into one file — AirDrop it and it works with no network |
| `source/` | The original handbook and project data the site file was extracted from |
| `CLAUDE.md` | How to add a scheme, publish, and check it — the parts that are easy to get wrong |

Sun hours, ground levels, cut and fill, protection-zone rules and costs are computed
in the app from `site-data.js` using the same maths as the handbook. Change a number
there and every screen follows.

## Notes

- The **Ask** screen answers in-app only where a model key is available. On the iPad
  use the **Claude app** button: it assembles the question, the site fact sheet and the
  current layout, and hands the brief to the share sheet.
- **Site**, **Works** and **Risks** are the handbook, carried into the app so it stands
  alone in the garden: levels and soil, sun, how water moves, the tree clauses, the
  drainage and earth shaping, the planting zones, the courtyard, and the ten-item risk
  register. Content is `handbook.js`, written as blocks (`p`, `h`, `note`, `ul`, `kv`,
  `tbl`); the screen that renders them is generic, so adding a section means adding data,
  not markup. Where a figure is also computed by the app, the app is what to trust.
- Everything is southern hemisphere: 21 December is summer and 21 June is winter, and the
  sun sits due north at midday. The four deciduous trees each carry their own leaf window,
  set by what the tree is in this climate — the ornamental pear breaks bud in late August
  and holds on into May, the ash a month behind it at both ends, the two street trees
  earlier to drop and later to fill out. The windows live in `LEAF` in `site-data.js` as
  four dates a piece, and the model ramps between them rather than switching, because a
  tree leafing out shades progressively. Full shade lands about November to March, which
  is the rule to plant by, except that April is still a full-canopy month here and the
  pear is dense from early October.
- Nothing is fetched from the internet. React and both typefaces are served from
  `vendor/`, and `sw.js` caches the app on first visit, so after that it opens with
  no signal. To change a vendored file, bump `CACHE` in `sw.js` or devices keep the
  old copy — the app also reloads itself once when a newer worker takes over, so a
  published change lands on the first open rather than the second.
- **Print** builds a three-sheet set from the current scheme — the plan at a true,
  stated scale with numbered keys and a title block, the schedules those numbers refer
  to, and the bloom calendar — then hands it to the browser's print dialog, where iOS
  offers *Save to Files* as a PDF. A4 and A3, both landscape; the plan takes the largest
  standard scale that fits (1:125 on A3, 1:200 on A4) and says which. The drawing is
  vector, so it stays sharp at any size and a ruler on the paper reads true.
- **Swales and mounds** are a level trough on the contour with the spoil laid along its
  downhill side, and on this block almost none of them are dug: protection zones cover
  half the back garden and nearly all the front, so the trough is formed by raising its
  shoulders in 100 mm of coarse woodchip. Only the rear pocket is clear enough for soil.
  The gravel paths are part of the same system — laid level on 150 mm of aggregate they
  hold about 50 litres a square metre — which is why they run across the slope and why
  the back path now stops 3 m short of the addition. **Works → Drainage** adds up what
  every trough, path, bed and mound on the current plan holds against the design storm,
  and the Checks screen stops any of them that infiltrates within 3 m of a wall or that
  is turned down the fall line instead of across it.
- **Works → Earthworks** is the first thing this design needs in the real world: a
  setout drawing with the no-dig zones loud, existing levels on a 4 m grid and every
  excavation keyed and colour-coded by what may touch it, then a schedule of volumes,
  depths and method, the rules that bind the machine, and what to confirm before it
  arrives. A button at the foot of it prints the same content as two sheets to hand
  over; **Print → Earthworks only** is the same thing from the print dialog. The screen
  and the sheets are built from one set of functions, so they cannot quote different
  numbers, and method comes from the same protection-zone test the Checks screen runs.
  Levels are indicative — the fitted surface has an RMS of 129 mm — and that is a red
  strip at the top, not fine print.
- The bloom calendar plots mature height against month, the bar's thickness being the
  plant's mature spread and its colour the flower's own. Flowering months and colours
  live in `bloom.js` and are the one part of the app that is judgement rather than
  survey — correct anything you disagree with. Plants grown for foliage are named under
  the chart rather than silently dropped. It is on **Works → Planting** as well as the
  printed set, so you can look at it without going near the print dialog.
- **On a laptop** the window fills rather than sitting inside a drawing of an iPad,
  and the trackpad behaves the way a trackpad should: two fingers slide the plan,
  a pinch zooms it, and a mouse wheel still zooms in notches. With something
  selected the arrow keys nudge it 50 mm, shift makes that 500 mm, Backspace
  deletes it, Escape drops the selection, and ⌘Z undoes — none of which fire
  while you are typing in the notes or the ask box.
- **Curved runs.** Select a path, swale, edge or wall and **Curve it** turns it into
  a run: a smooth line through draggable points, a fixed width, and h no longer
  meaning anything. Drag a point to move it, drag the small handle between two
  points and it becomes a point, double-tap a point to take it out, and the blue
  handle on the edge sets the width. **Straighten** puts it back in a box. Length,
  area, cost, the protection-zone tests, the level check and both printed sheets
  all read the curve rather than the rectangle around it — a bent trough is
  checked for level along the whole of itself, not just end to end.
- Selecting anything on the plan floats a bar over the drawing with its name, **Copy**,
  **Rotate 90°** on rectangles, and **Delete**. The inspector carries the same actions
  from the same definition; the bar exists because the inspector is a scroll away in
  normal mode and hidden in focus mode, which is when you are actually moving things.
- The **expand** button on the plan (with the zoom controls) drops the sidebar, header,
  palette and inspector so the drawing has the whole screen. It is for once the palette
  has done its job and you are only moving things around.
- A named scheme is seeded onto a device once, by its id, and never again — so a
  change to one already on the device does not reach it. Ship the changed version
  under a new id and it arrives as a new scheme in the list, leaving whatever the
  device had alone. This is also why the base plan, `START`, has to carry anything
  meant to be in **New from base plan**: a new scheme is built from that, not from
  the named schemes. `CLAUDE.md` has the full recipe.
- **Notes** under the plan are per-scheme, saved with it and carried into the Ask
  brief, so a scheme arrives explaining itself. **Schemes → Push to gist** sends the
  schemes to a private GitHub gist as one small file each plus an `index.json`,
  which the file backup does not do — a single blob is rendered truncated and the
  newest scheme is the part that gets cut. That gist is how the iPad's schemes are
  read on a laptop: open <https://gist.github.com/isaacdugdale> signed in as
  yourself and it is the one titled **234 Duffy Schemes**, holding `index.json`
  and one file per scheme. Do not write its URL down here or anywhere else public.
  A gist pushed as private is unlisted rather than access-controlled — it does not
  appear on that page to anyone but you, but the URL is the whole of the lock, so
  in a repository this public it would be the same as making the schemes public.
  It uses a fine-grained token
  with gist write scope that you paste once and that stays in the browser's local
  storage. It is the only thing in the app that talks to the internet and it only
  does so on that tap; revoke the token on GitHub and everything else still works.
- Schemes are per-device: they live in that browser's local storage. **Schemes → Back
  up** writes them to a JSON file through the share sheet and **Restore** reads one
  back, which is how a scheme reaches a second device. Restoring only adds; an
  incoming scheme whose id is already taken arrives under a new one. Live sync
  between devices still needs a database — a later job.
