const CACHE = 'isra-v3';
const ASSETS = ['./', './index.html', './app.js', './config.js', './ISRA_QURAN_ACADEMY_LOGO.jpeg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(fetch(e.request.clone()).catch(() =>
      new Response(JSON.stringify({success:false,offline:true,message:'Offline'}), {headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => {
    let rc = r.clone();
    caches.open(CACHE).then(ca => ca.put(e.request, rc));
    return r;
  }).catch(() => caches.match('./index.html'))));
});
self.addEventListener('sync', e => {
  if (e.tag === 'sync-data') e.waitUntil(self.clients.matchAll().then(cls => cls.forEach(c => c.postMessage({type:'SYNC_NOW'}))));
});
