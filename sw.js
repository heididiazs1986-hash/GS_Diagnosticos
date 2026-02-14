const CACHE_NAME="gs-diagnosticos-fix-3"; // <-- subir versión para forzar actualización
const ASSETS=["./","./index.html","./manifest.json","./sw.js","./icon-192.png","./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      // Si está en cache, responde rápido pero intenta actualizar en segundo plano
      const fetchPromise = fetch(e.request)
        .then((netRes) => {
          // Actualiza cache si fue exitoso
          if (netRes && netRes.status === 200) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
          }
          return netRes;
        })
        .catch(() => cached); // si no hay red, usa cache

      return cached || fetchPromise;
    })
  );
});
