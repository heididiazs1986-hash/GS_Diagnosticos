                const SW_VERSION = "gsdx-sw-vPRO-1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k !== SW_VERSION)
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Nunca interceptar descargas, blobs ni requests no GET
  if (
    req.method !== "GET" ||
    url.protocol === "blob:" ||
    url.pathname.endsWith(".zip") ||
    url.pathname.endsWith(".xlsx") ||
    url.pathname.endsWith(".xls") ||
    url.pathname.endsWith(".csv")
  ) {
    return;
  }

  // Solo network-first para navegación/documentos simples
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      return fresh;
    } catch (err) {
      const cache = await caches.open(SW_VERSION);
      const cached = await cache.match(req);
      if (cached) return cached;

      // fallback básico solo para navegación
      if (req.mode === "navigate") {
        const home = await cache.match("./");
        if (home) return home;
      }
      throw err;
    }
  })());
});
