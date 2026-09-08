// Exploro India offline SW — cache map tiles + last-seen destinations/trips/wishlist
const CACHE = "exploro-v1";
const TILE_CACHE = "exploro-tiles-v1";
const API_ENDPOINTS = ["/api/destinations", "/api/trips", "/api/wishlist", "/api/states"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE && k !== TILE_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Map tiles: cache-first, unlimited
  if (url.hostname.endsWith("tile.openstreetmap.org") || url.hostname.includes("unpkg.com/leaflet")) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return cached || Response.error();
      }
    })());
    return;
  }

  // API GETs for our cache-friendly endpoints: network-first, fallback to cache
  if (url.pathname.startsWith("/api/") && API_ENDPOINTS.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"))) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        const cached = await cache.match(req);
        return cached || new Response(JSON.stringify({ offline: true, items: [] }), { headers: { "Content-Type": "application/json" }, status: 200 });
      }
    })());
    return;
  }

  // Destination images (unsplash): cache-first
  if (url.hostname.includes("unsplash.com")) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch { return cached || Response.error(); }
    })());
  }
});
