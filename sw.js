/* Makes the app open with no network once it has been visited once.

   Bump CACHE when any file below changes: the new worker precaches the new
   copies, then drops every older cache on activate. Navigations are
   network-first so a published change is picked up as soon as there is signal;
   everything else is cache-first so the app opens instantly and offline. */

const CACHE = '234-duffy-v6';

const ASSETS = [
  '.',
  'index.html',
  'site-data.js',
  'handbook.js',
  'bloom.js',
  'printsheet.js',
  'support.js',
  'manifest.webmanifest',
  'apple-touch-icon.png',
  'icon-512.png',
  'vendor/react.production.min.js',
  'vendor/react-dom.production.min.js',
  'vendor/fonts.css',
  'vendor/fonts/caprasimo-874cbd0a.woff2',
  'vendor/fonts/caprasimo-5eabf4fd.woff2',
  'vendor/fonts/figtree-7471c0c2.woff2',
  'vendor/fonts/figtree-f96cbbc0.woff2',
  '_ds/organic-5b8b3e51-8cff-4491-83cb-b7a2b943dfea/styles.css',
  '_ds/organic-5b8b3e51-8cff-4491-83cb-b7a2b943dfea/_ds_bundle.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      /* One miss must not fail the whole install, or the app never caches. */
      .then(c => Promise.all(ASSETS.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html').then(r => r || caches.match('.')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
