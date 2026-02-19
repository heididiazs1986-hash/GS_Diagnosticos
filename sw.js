const CACHE_NAME = "gsdx-cache-v11"; // <-- SUBE ESTE NUMERO CADA VEZ
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/sw.js",
  "/LOGO.jpg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-180.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
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

// Network-first SOLO para navegación (index), cache-first para lo demás
self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Cuando es navegación (abrir la app / cambiar de pantalla), intenta RED primero
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Assets: cache-first con actualización en segundo plano
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((netRes) => {
          if (netRes && netRes.status === 200) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return netRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

