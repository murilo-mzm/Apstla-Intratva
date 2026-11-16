/* Apostila Interativa: versão e397772e6fab */
const CACHE = "apostila-e397772e6fab", FONTS = "apostila-fonts";
const CORE = ["./", "index.html", "manifest.webmanifest", "favicon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    const net = fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); } return r; });
    const cached = caches.match("index.html");
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => cached.then(c => { if (!done && c) { done = true; resolve(c); } });
      const t = setTimeout(fallback, 4000);
      net.then(r => { clearTimeout(t); if (!done) { done = true; resolve(r); } })
         .catch(() => { clearTimeout(t); cached.then(c => { if (!done) { done = true; resolve(c || Response.error()); } }); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
