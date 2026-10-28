const CACHE = "carnet-muscu-953549574b";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    const fresh = fetch(e.request, { cache: "no-store" }).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); }
      return res;
    });
    const fallback = new Promise((ok) => setTimeout(ok, 3000)).then(() => caches.match("index.html"));
    e.respondWith(Promise.race([fresh, fallback]).then((r) => r || fresh).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res;
  }).catch(() => caches.match("index.html"))));
});
