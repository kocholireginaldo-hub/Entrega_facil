// Troque o número da versão sempre que publicar uma atualização importante.
const V = "entrega-facil-v3";
const ARQ = ["./", "index.html", "manifest.json", "icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(ARQ)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// Só arquivos do próprio site, rede primeiro (sempre pega a versão nova); o cache serve apenas sem internet.
// Nada do Firebase (outros domínios) passa por aqui, então dados privados nunca entram no cache.
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request, {cache: "no-cache"}).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)).catch(() => {}); } return r; }).catch(() => caches.match(e.request)));
});
