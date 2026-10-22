import {esc, p2, isoData, fmtData, fmtCriado, MESES, abrirModal, fecharModal, confirmar, toast} from "./ui.js";
import {urlFoto} from "./storage.js";
import {excluirEntrega} from "./database.js";
import {coordOk, linkMapa, compartilharEntrega, compartilharDia} from "./share.js";
import {msgErro} from "./auth.js";

export const ordenar = (a, b) => (b.deliveryDate + b.deliveryTime).localeCompare(a.deliveryDate + a.deliveryTime);
const porHora = (a, b) => (a.deliveryDate + a.deliveryTime).localeCompare(b.deliveryDate + b.deliveryTime);

export function cartao(d) {
  const e = d.deliveryType === "special";
  return `<article class="card${e ? " esp" : ""}" data-id="${esc(d.id)}"><img class="th" data-p="${esc(d.photoPath)}" alt="">
  <div class="inf"><b>${esc(d.deliveryName)}</b>${fmtData(d.deliveryDate)} às ${esc(d.deliveryTime)} ${coordOk(d) ? "📍" : ""}<br>
  ${e ? `<span class="selo">ENTREGA ESPECIAL — REGISTRO RETROATIVO</span><br><span class="mut peq">Registrado em ${esc(fmtCriado(d))}</span>` : '<span class="tag">Entrega Padrão</span>'}
  ${d.employeeNameSnapshot ? `<br><span class="mut peq">${esc(d.employeeNameSnapshot)}</span>` : ""}</div>
  <div class="acts"><button data-a="ver">Detalhes</button><button data-a="sh">📤 Compartilhar</button><button data-a="del" class="x" aria-label="Excluir">🗑</button></div></article>`;
}
export function miniaturas(root) {
  root.querySelectorAll("img[data-p]").forEach(async i => { try { i.src = await urlFoto(i.dataset.p); } catch { i.alt = "sem foto"; } });
}

async function excluir(d, lista, depois) {
  if (!await confirmar("Deseja realmente excluir esta entrega? Essa ação não poderá ser desfeita.", "Excluir entrega")) return;
  try {
    const r = await excluirEntrega(d);
    lista.splice(lista.findIndex(x => x.id === d.id), 1);
    toast(r.fotoPendente ? "Entrega excluída, mas a fotografia não pôde ser removida agora. Será tentado de novo no próximo acesso." : "Entrega excluída.", r.fotoPendente ? "warn" : "ok");
  } catch (e) { toast("Não foi possível excluir: " + msgErro(e), "err"); }
  depois();
}

function detalhes(d, lista, depois) {
  const e = d.deliveryType === "special", reg = d.locationKind === "registro", mapa = linkMapa(d);
  const s = abrirModal(`${e ? '<span class="selo">ENTREGA ESPECIAL — REGISTRO RETROATIVO</span>' : '<span class="tag">Entrega Padrão</span>'}
  <h2>${esc(d.deliveryName)}</h2><img class="foto" data-p="${esc(d.photoPath)}" alt="Fotografia da entrega">
  <dl><dt>Entregador</dt><dd>${esc(d.employeeNameSnapshot)}</dd><dt>Empresa</dt><dd>${esc(d.companySnapshot)}</dd>
  <dt>Data e horário ${e ? "informados" : ""}</dt><dd>${fmtData(d.deliveryDate)} às ${esc(d.deliveryTime)}</dd>
  <dt>Instante real do registro</dt><dd>${esc(fmtCriado(d))}</dd>
  ${d.notes ? `<dt>Observações</dt><dd>${esc(d.notes)}</dd>` : ""}
  <dt>${reg ? "Localização no momento do registro" : "Localização da entrega"}</dt>
  <dd>${coordOk(d) ? `${d.latitude}, ${d.longitude}${d.accuracyMeters ? ` (precisão ~${d.accuracyMeters} m)` : ""}` : "Não registrada"}</dd></dl>
  ${reg ? '<p class="aviso">Esta localização corresponde ao momento em que o registro foi criado e não comprova o local da entrega ocorrida antes.</p>' : ""}
  ${mapa ? `<a class="btn" href="${mapa}" target="_blank" rel="noopener">🗺 Ver no Google Maps</a>` : ""}
  <button class="btn vd" data-a="sh">📤 Compartilhar comprovante</button><button class="btn red" data-a="del">🗑 Excluir entrega</button><button class="btn" data-a="fx">Fechar</button>`);
  miniaturas(s);
  s.onclick = ev => {
    const a = ev.target.closest("[data-a]")?.dataset.a;
    if (a === "fx") fecharModal(); else if (a === "sh") compartilharEntrega(d); else if (a === "del") excluir(d, lista, depois);
  };
}

// Trata cliques nos cartões; devolve true se tratou
export function acaoCartao(ev, lista, depois) {
  const b = ev.target.closest("[data-a]"), c = ev.target.closest(".card");
  if (!b || !c) return false;
  const d = lista.find(x => x.id === c.dataset.id); if (!d) return true;
  if (b.dataset.a === "ver") detalhes(d, lista, depois); else if (b.dataset.a === "sh") compartilharEntrega(d); else if (b.dataset.a === "del") excluir(d, lista, depois);
  return true;
}

export function montarAgenda(root, lista, o = {}) {
  const hj = new Date(), st = {y: hj.getFullYear(), m: hj.getMonth(), sel: isoData(hj)};
  const draw = () => {
    const cont = {}; lista.forEach(d => cont[d.deliveryDate] = (cont[d.deliveryDate] || 0) + 1);
    const prim = new Date(st.y, st.m, 1).getDay(), n = new Date(st.y, st.m + 1, 0).getDate(); let cel = "";
    for (let i = 0; i < prim; i++) cel += "<i></i>";
    for (let i = 1; i <= n; i++) { const iso = `${st.y}-${p2(st.m + 1)}-${p2(i)}`;
      cel += `<button class="dia${iso === isoData(hj) ? " hoje" : ""}${iso === st.sel ? " sel" : ""}" data-dia="${iso}">${i}${cont[iso] ? `<em>${cont[iso]}</em>` : ""}</button>`; }
    const doDia = lista.filter(d => d.deliveryDate === st.sel).sort(porHora);
    root.innerHTML = `<div class="cal"><div class="calh"><button data-mes="-1" aria-label="Mês anterior">‹</button><b>${MESES[st.m]} ${st.y}</b><button data-mes="1" aria-label="Próximo mês">›</button></div>
    <div class="sem">${[..."DSTQQSS"].map(x => `<span>${x}</span>`).join("")}</div><div class="grade">${cel}</div></div>
    <p class="resdia"><b>${fmtData(st.sel)}</b> — ${doDia.length} entrega(s)</p>
    <div class="row">${o.onNova ? '<button class="btn pri" data-nova>＋ Nova entrega</button>' : ""}${doDia.length ? '<button class="btn vd" data-rel>📤 Relatório do dia</button>' : ""}</div>
    ${doDia.map(cartao).join("") || '<p class="vazio">Nenhuma entrega neste dia.</p>'}`;
    miniaturas(root);
  };
  root.onclick = ev => {
    if (acaoCartao(ev, lista, draw)) return;
    const t = ev.target.closest("button"); if (!t) return;
    if (t.dataset.mes) { st.m += +t.dataset.mes; if (st.m < 0) { st.m = 11; st.y--; } if (st.m > 11) { st.m = 0; st.y++; } draw(); }
    else if (t.dataset.dia) { st.sel = t.dataset.dia; draw(); }
    else if ("nova" in t.dataset) o.onNova(st.sel);
    else if ("rel" in t.dataset) { const l = lista.filter(d => d.deliveryDate === st.sel).sort(porHora); compartilharDia(l, st.sel, l[0].employeeNameSnapshot); }
  };
  draw(); return draw;
}

export function montarResumo(root, lista) {
  const hj = new Date(); let dia = isoData(hj), mes = dia.slice(0, 7);
  const draw = () => {
    const noMes = lista.filter(d => d.deliveryDate.startsWith(mes)), noDia = lista.filter(d => d.deliveryDate === dia);
    const [y, m] = mes.split("-").map(Number), n = new Date(y, m, 0).getDate(), dec = (y === hj.getFullYear() && m === hj.getMonth() + 1) ? hj.getDate() : n;
    const por = Array.from({length: n}, (_, i) => noMes.filter(d => d.deliveryDate === `${mes}-${p2(i + 1)}`).length), max = Math.max(1, ...por);
    root.innerHTML = `<h2>Resumo</h2><label>Dia<input type="date" id="r-d" value="${dia}"></label><label>Mês<input type="month" id="r-m" value="${mes}"></label>
    <div class="kpis"><div class="kpi"><b>${noDia.length}</b>Entregas no dia</div><div class="kpi"><b>${noMes.length}</b>Entregas no mês</div>
    <div class="kpi"><b>${noDia.filter(d => d.deliveryType === "standard").length}</b>Padrão (dia)</div><div class="kpi"><b>${noDia.filter(d => d.deliveryType === "special").length}</b>Especiais (dia)</div>
    <div class="kpi"><b>${(noMes.length / dec).toFixed(1).replace(".", ",")}</b>Média diária (mês)</div></div>
    <p class="mut peq">Entregas por dia — ${MESES[m - 1]} ${y}</p><div class="graf">${por.map((v, i) => `<i style="height:${v / max * 100}%" title="Dia ${i + 1}: ${v}"></i>`).join("")}</div>`;
    root.querySelector("#r-d").onchange = e => { if (e.target.value) { dia = e.target.value; mes = dia.slice(0, 7); draw(); } };
    root.querySelector("#r-m").onchange = e => { if (e.target.value) { mes = e.target.value; draw(); } };
  };
  draw(); return draw;
}
