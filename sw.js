// Ridh Finance Service Worker
// Cache version bump forces clients to refresh cached assets.
const CACHE = 'rf-v18';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function canCacheResponse(res) {
  // Cache successful responses and opaque (cross-origin) responses.
  return res && (res.ok || res.type === 'opaque');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isNav = req.mode === 'navigate' || req.destination === 'document';

  // Network-first for navigations (keeps app fresh).
  if (isNav) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Update cached shell.
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Cache-first for other requests (assets).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (canCacheResponse(res)) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
``
