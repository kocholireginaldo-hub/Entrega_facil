const V = "entrega-facil-v1", ARQ = ["./", "index.html", "css/style.css", "manifest.json", "assets/icons/icon-192.png", "js/app.js", "js/agenda.js", "js/nova.js", "js/admin.js", "js/auth.js", "js/database.js", "js/storage.js", "js/share.js", "js/ui.js", "js/firebase-config.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(ARQ))); self.skipWaiting(); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== V).map(n => caches.delete(n)))).then(() => self.clients.claim())));
// Só arquivos do próprio site (rede primeiro, cache como reserva). Firebase nunca passa por aqui.
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
