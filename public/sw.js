// FORGA Service Worker — auto-update on new deploy
// The CACHE_VERSION is replaced at build time by inject-pwa.js
const CACHE_VERSION = '__BUILD_VERSION__';
const CACHE_NAME = `forga-${CACHE_VERSION}`;

// Assets to pre-cache (shell)
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon.png',
];

// Install: cache shell assets
self.addEventListener('install', (event) => {
  // Skip waiting so new SW activates immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
});

// Activate: clean old caches + take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('forga-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy (always get latest, fallback to cache)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (APIs, CDNs, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(request).then((cached) => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
  );
});
