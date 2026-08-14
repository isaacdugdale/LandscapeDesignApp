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
- Schemes are per-device: they live in that browser's local storage. **Schemes → Back
  up** writes them to a JSON file through the share sheet and **Restore** reads one
  back, which is how a scheme reaches a second device. Restoring only adds; an
  incoming scheme whose id is already taken arrives under a new one. Live sync
  between devices still needs a database — a later job.
