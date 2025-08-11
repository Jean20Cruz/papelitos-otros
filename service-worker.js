const CACHE_NAME = 'agroservicio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', // Si tienes un archivo CSS separado
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png'
  // Puedes agregar aquí más archivos, como imágenes adicionales, fuentes, etc.
];

// Evento de instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch (intercepción de solicitudes de red)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en caché, lo devolvemos
        if (response) {
          return response;
        }

        // Si no está en caché, intentamos obtenerlo de la red
        return fetch(event.request);
      })
  );
});

// Evento de activación (para limpiar cachés antiguas)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});