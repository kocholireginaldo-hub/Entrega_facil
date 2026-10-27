// Troque o número da versão sempre que publicar uma atualização importante.
const V = "entrega-facil-v4";
const ARQ = ["./", "index.html", "manifest.json", "icon-192.png"];
const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const SDK_ENTRADAS = ["firebase-app.js", "firebase-auth.js", "firebase-firestore.js"];

// Guarda as bibliotecas públicas do Firebase (código, não dados) para o app abrir sem internet.
async function guardarSdk(cache, url, vistos) {
  if (vistos.has(url)) return; vistos.add(url);
  const r = await fetch(url); if (!r.ok) return;
  await cache.put(url, r.clone());
  const t = await r.text();
  for (const m of t.matchAll(/(?:https:\/\/www\.gstatic\.com\/firebasejs\/10\.12\.2\/|["']\.\/)([\w.\-]+\.js)/g)) await guardarSdk(cache, SDK + m[1], vistos);
}
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(ARQ).catch(() => {});
    const vistos = new Set();
    for (const f of SDK_ENTRADAS) await guardarSdk(c, SDK + f, vistos).catch(() => {});   // falha aqui não impede a instalação
  })());
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Bibliotecas do Firebase (versão fixa): cache primeiro.
  if (u.href.startsWith(SDK)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(x => { if (x.ok) { const c = x.clone(); caches.open(V).then(k => k.put(e.request, c)).catch(() => {}); } return x; })));
    return;
  }
  // Demais domínios (dados e login do Firebase etc.): nunca passam pelo cache.
  if (u.origin !== location.origin) return;
  // Arquivos do próprio site: rede primeiro (pega sempre a versão nova); o cache só serve sem internet.
  e.respondWith(fetch(e.request, {cache: "no-cache"}).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)).catch(() => {}); } return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
