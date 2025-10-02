/* Simple PWA service worker: cache core assets + offline fallback */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `peds-calc-${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/',                // home (calculator)
  '/offline',         // offline fallback route
  '/favicon.ico',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

/* Install: precache core assets (ignore failures for missing assets) */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      CORE_ASSETS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res && res.ok) {
            await cache.put(url, res.clone());
          }
        } catch {
          // Ignore individual failures so install still succeeds
        }
      })
    );
  })());
  self.skipWaiting();
});

/* Activate: clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)))
    )
  );
  self.clients.claim();
});

/* Fetch:
   - Navigations: Network-first → cache → /offline
   - Static assets: Cache-first → network
*/
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        return cached || cache.match('/offline');
      }
    })());
    return;
  }

  if (
    req.method === 'GET' &&
    /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })());
  }
});
