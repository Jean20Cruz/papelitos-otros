// service-worker.js corregido
const CACHE_NAME = 'agroservicio-v1';
const urlsToCache = [
  './', 
  './index.html',
  './manifest.json',
  './service-worker.js',
  './productos.json', //
  './script.js' //
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
