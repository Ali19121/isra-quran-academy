const CACHE_NAME = 'isra-portal-v2';
const OFFLINE_QUEUE_KEY = 'isra_offline_queue';

const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './config.js',
  './ISRA_QURAN_ACADEMY_LOGO.jpeg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  let url = e.request.url;
  // For API calls - network first, queue if offline
  if (url.includes('script.google.com')) {
    e.respondWith(
      fetch(e.request.clone()).catch(() => {
        return new Response(JSON.stringify({ success: false, offline: true, message: 'Offline mode - data queued' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  // Static assets - cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      let respClone = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});

// Background sync for offline queue
self.addEventListener('sync', e => {
  if (e.tag === 'sync-offline-data') {
    e.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Notify clients to sync
  const clients = await self.clients.matchAll();
  clients.forEach(c => c.postMessage({ type: 'SYNC_NOW' }));
}
