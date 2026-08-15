# 234 Duffy — Landscape Studio

A planting and hardscape editor for 234 Duffy, built to be used on an iPad from the
home screen. Static site: no build step, no server, no accounts. Schemes are stored
in the browser on the device.

## Publishing it

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `/ (root)`**.
After a minute the app is at `https://isaacdugdale.github.io/LandscapeDesignApp/`.
On the iPad open that URL in Safari, then **Share → Add to Home Screen**.

The app files must sit at the repository root — `index.html` next to `README.md` —
because Pages only serves from `/` or `/docs`.

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
- Everything is southern hemisphere: 21 December is summer and 21 June is winter, the sun
  sits due north at midday, and the deciduous canopies are modelled bare from 1 June to
  mid-September. The one rough edge is that the September equinox falls a few days after
  the leaves go back on, so the equinox column reads low under the pear and liquidambar.
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
- Selecting anything on the plan floats a bar over the drawing with its name, **Copy**,
  **Rotate 90°** on rectangles, and **Delete**. The inspector carries the same actions
  from the same definition; the bar exists because the inspector is a scroll away in
  normal mode and hidden in focus mode, which is when you are actually moving things.
- The **expand** button on the plan (with the zoom controls) drops the sidebar, header,
  palette and inspector so the drawing has the whole screen. It is for once the palette
  has done its job and you are only moving things around.
- Schemes are per-device: they live in that browser's local storage. **Schemes → Back
  up** writes them to a JSON file through the share sheet and **Restore** reads one
  back, which is how a scheme reaches a second device. Restoring only adds; an
  incoming scheme whose id is already taken arrives under a new one. Live sync
  between devices still needs a database — a later job.
