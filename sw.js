// アプリを更新したら、この番号を上げてください(v1 → v2)
const CACHE = "tango-dojo-v6";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    // 画面本体はネット優先、圏外ならキャッシュ
    e.respondWith(fetch(req).then(res => { caches.open(CACHE).then(c => c.put("./index.html", res.clone())); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // フォント・画像などはキャッシュ優先
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  })));
});
