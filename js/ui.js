export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const p2 = n => String(n).padStart(2, "0");
export const isoData = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const horaHM = d => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
export const fmtData = iso => (iso || "").split("-").reverse().join("/");
export const fmtCriado = d => d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString("pt-BR") : "—";
export const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
let tt;
export function toast(m, tipo = "ok") { const t = $("#toast"); t.textContent = m; t.className = "show " + tipo; clearTimeout(tt); tt = setTimeout(() => t.className = "", 5500); }
export function abrirModal(html) { const m = $("#modal"); m.innerHTML = `<div class="sheet">${html}</div>`; m.hidden = false; return m.firstChild; }
export function fecharModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; }
export function confirmar(msg, botao) {
  return new Promise(res => {
    const s = abrirModal(`<p>${esc(msg)}</p><div class="row"><button class="btn" data-r="0">Cancelar</button><button class="btn red" data-r="1">${esc(botao)}</button></div>`);
    s.onclick = e => { const b = e.target.closest("[data-r]"); if (b) { fecharModal(); res(b.dataset.r === "1"); } };
  });
}
