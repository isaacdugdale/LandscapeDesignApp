# 234 Duffy — Landscape Studio

A planting and hardscape editor for 234 Duffy, built to be used on an iPad from the
home screen. Static site: no build step, no server, no accounts. Schemes are stored
in the browser on the device.

## Publishing it

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `/ (root)`**.
After a minute the app is at `https://isaacdugdale.github.io/landscapedesign/`.
On the iPad open that URL in Safari, then **Share → Add to Home Screen**.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The app — plan editor, checks, stages, ask |
| `site-data.js` | The site: boundaries, contours, buildings, the five protected trees and their zones, fences, drainage, the element library, the 82-plant list |
| `support.js` | Rendering runtime the app loads |
| `_ds/organic-…/` | The Organic design system: tokens stylesheet and component bundle |
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
- Schemes are per-device. Sharing schemes between devices needs a small database — a
  later job.
