#!/usr/bin/env node
/* Builds offline/234-duffy-offline.html: the whole app in one file, openable
   from a file:// path with no network and no server.

   The old offline file was output from a bundler nobody here can run, so it
   went stale on 14 August 2026 and stayed that way through the curved runs,
   the locks, the sumps and the survey levels. This script replaces it. It
   reads the same files the browser reads and inlines them, so the offline copy
   is whatever index.html is on the day you run it.

   Run: node tools/build-offline.js
   Then check the BUILD it reports matches index.html. */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'offline', '234-duffy-offline.html');
const DS = '_ds/organic-5b8b3e51-8cff-4491-83cb-b7a2b943dfea';

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const readB64 = p => fs.readFileSync(path.join(ROOT, p)).toString('base64');

/* A script element ends at the first </script in the text, wherever it sits,
   including inside a string. Nothing in this repo has one, but a scheme note
   could gain one and the failure would be a blank page. */
const safe = js => js.replace(/<\/script/gi, '<\\/script');
const dataJs = js => 'data:text/javascript;base64,' + Buffer.from(js, 'utf8').toString('base64');

let html = read('index.html');
const before = html.length;
const build = (html.match(/const BUILD='([^']+)'/) || [])[1] || '?';

/* React. support.js maps these two URLs through window.__resources before it
   reaches for a CDN, so pointing them at data: URIs keeps its own loading path
   and needs no change there. */
const reactMap = {
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js':
    dataJs(read('vendor/react.production.min.js')),
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js':
    dataJs(read('vendor/react-dom.production.min.js'))
};
html = html.replace(/window\.__resources=\{[\s\S]*?\};/,
  'window.__resources=' + JSON.stringify(reactMap) + ';');

/* Fonts, into the stylesheet that asks for them. */
let fontCss = read('vendor/fonts.css');
for (const f of fs.readdirSync(path.join(ROOT, 'vendor', 'fonts'))) {
  fontCss = fontCss.split('url(fonts/' + f + ')')
    .join('url(data:font/woff2;base64,' + readB64('vendor/fonts/' + f) + ')');
}

const icon = 'data:image/png;base64,' + readB64('apple-touch-icon.png');

const dataCss = css => 'data:text/css;base64,' + Buffer.from(css, 'utf8').toString('base64');

/* Everything inside <helmet> keeps its original tag type and gains a data:
   URI, rather than becoming an inline <style> or <script>. support.js lifts
   helmet children into <head> and only knows how to move SCRIPT, LINK and
   META, so an inline <style> would be dropped on the floor and a rebuilt
   inline <script> throws on the way in. A src or href it just copies. */
const swaps = [
  ['<link rel="apple-touch-icon" href="apple-touch-icon.png">',
   '<link rel="apple-touch-icon" href="' + icon + '">'],
  ['<link rel="icon" href="apple-touch-icon.png">',
   '<link rel="icon" href="' + icon + '">'],
  /* No manifest and no service worker off a file:// path. Both fail quietly,
     and the file is meant to be one file. */
  ['<link rel="manifest" href="manifest.webmanifest">', ''],
  /* support.js sits in <head>, outside the helmet, so it can be inlined. */
  ['<script src="./support.js"></script>',
   '<script>' + safe(read('support.js')) + '</script>'],
  ['<link rel="stylesheet" href="' + DS + '/styles.css">',
   '<link rel="stylesheet" href="' + dataCss(read(DS + '/styles.css')) + '">'],
  ['<script src="' + DS + '/_ds_bundle.js"></script>',
   '<script src="' + dataJs(read(DS + '/_ds_bundle.js')) + '"></script>'],
  ['<link rel="stylesheet" href="vendor/fonts.css">',
   '<link rel="stylesheet" href="' + dataCss(fontCss) + '">'],
  ['<script src="site-data.js"></script>',
   '<script src="' + dataJs(read('site-data.js')) + '"></script>'],
  ['<script src="handbook.js"></script>',
   '<script src="' + dataJs(read('handbook.js')) + '"></script>'],
  ['<script src="bloom.js"></script>',
   '<script src="' + dataJs(read('bloom.js')) + '"></script>'],
  ['<script src="printsheet.js"></script>',
   '<script src="' + dataJs(read('printsheet.js')) + '"></script>']
];

for (const [from, to] of swaps) {
  if (!html.includes(from)) {
    console.error('build-offline: index.html no longer contains:\n  ' + from);
    console.error('Nothing written. Fix the swap list in tools/build-offline.js.');
    process.exit(1);
  }
  html = html.split(from).join(to);
}

/* Strip the service worker registration: it cannot run from file:// and its
   failure path writes to the console on every open. */
html = html.replace(/if\('serviceWorker' in navigator\)\{[\s\S]*?\n\}\n<\/script>/,
  '/* Service worker omitted: this copy is a single file. */\n</script>');

/* Nothing may still point at a file beside it. */
const left = [...html.matchAll(/(?:src|href)="(?!data:|https?:|#)([^"]+)"/g)].map(m => m[1]);
if (left.length) {
  console.error('build-offline: still referencing files: ' + [...new Set(left)].join(', '));
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log('offline/234-duffy-offline.html written for BUILD ' + build);
console.log('  index.html ' + (before / 1024).toFixed(0) + ' kB in, ' +
  (html.length / 1024 / 1024).toFixed(2) + ' MB out');
