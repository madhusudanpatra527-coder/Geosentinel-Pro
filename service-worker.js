/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Service Worker
   Cache-first strategy for the app shell, enabling fully offline
   use once the site has been loaded once (PWA "installable" mode).
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'geosentinel-pro-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/data.js',
  './js/siren.js',
  './js/alarm.js',
  './js/dashboard.js',
  './js/charts.js',
  './js/twin.js',
  './js/compliance.js',
  './js/remedial.js',
  './js/report.js',
  './js/map.js',
  './js/ai-engine.js',
  './js/app.js',
  './assets/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for app shell files, network-first for everything else
// (map tiles, CDN libraries) so the map still works online but the
// dashboard itself remains usable offline.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAppShell = url.origin === self.location.origin;

  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
