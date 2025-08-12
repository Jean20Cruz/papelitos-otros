const CACHE_NAME = 'agroservicio-v1';
const urlsToCache = [
  './', // Esto es crucial para la página principal (index.html)
  './index.html',
  './manifest.json',
  './service-worker.js',
];

self.addEventListener('install', (event) => {
  // Realiza la instalación
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
        // Devuelve la respuesta desde la caché si está disponible
        if (response) {
          return response;
        }
        
        // Si no está en la caché, realiza la solicitud a la red
        return fetch(event.request);
      })
  );
});

