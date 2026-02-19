const CACHE_NAME = "gsdx-cache-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png"
];

self.addEventListener("install",(e)=>{
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c=>c.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",(e)=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",(e)=>{
  e.respondWith(
    caches.match(e.request).then(r=>r || fetch(e.request).then(resp=>{
      const cp=resp.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,cp));
      return resp;
    }).catch(()=>caches.match("./index.html")))
  );
});
