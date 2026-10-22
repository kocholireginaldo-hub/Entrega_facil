import {auth} from "./firebase-config.js";
import {aoMudarSessao, cadastrar, entrar, sair, recuperarSenha, carregarPerfil, souAdmin, msgErro} from "./auth.js";
import {listarMinhas, retentarPendentes} from "./database.js";
import {montarAgenda, montarResumo, cartao, ordenar, miniaturas, acaoCartao} from "./agenda.js";
import {montarAdminView, travarAdmin} from "./admin.js";
import {abrirNova} from "./nova.js";
import {$, esc, toast} from "./ui.js";

let perfil = null, ehAdmin = false, lista = [], registrando = false, visao = "agenda", redesenhar = {};

const mostrar = id => { for (const x of ["auth", "app"]) $("#" + x).hidden = x !== id; };
function irPara(v) {
  visao = v;
  document.querySelectorAll(".view").forEach(s => s.hidden = s.id !== "v-" + v);
  document.querySelectorAll(".bar button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  window.scrollTo(0, 0); desenhar();
}
function desenhar() {
  if (visao === "agenda") redesenhar.agenda = montarAgenda($("#v-agenda"), lista, {onNova: d => abrirNova(perfil, lista, recarregar, d)});
  else if (visao === "hist") historico();
  else if (visao === "res") montarResumo($("#v-res"), lista);
  else montarAdminView($("#v-admin"), ehAdmin);
}
async function recarregar() { lista = await listarMinhas(perfil.uid); desenhar(); }

function historico() {
  const r = $("#v-hist"), f = {q: "", tipo: "", de: "", ate: ""};
  const draw = () => {
    const l = lista.filter(d => (!f.q || d.deliveryName.toLowerCase().includes(f.q.toLowerCase())) && (!f.tipo || d.deliveryType === f.tipo) && (!f.de || d.deliveryDate >= f.de) && (!f.ate || d.deliveryDate <= f.ate)).sort(ordenar);
    $("#h-lst").innerHTML = `<p class="mut peq">${l.length} registro(s), mais recentes primeiro (pela data da ocorrência)</p>` + (l.map(cartao).join("") || '<p class="vazio">Nada encontrado.</p>');
    miniaturas($("#h-lst"));
  };
  r.innerHTML = `<h2>Histórico</h2><label>Buscar pelo nome<input id="h-q" type="search"></label>
  <label>Tipo<select id="h-t"><option value="">Todos</option><option value="standard">Entrega Padrão</option><option value="special">Entrega Especial</option></select></label>
  <div class="row"><label style="flex:1">De<input type="date" id="h-de"></label><label style="flex:1">Até<input type="date" id="h-ate"></label></div><div id="h-lst"></div>`;
  r.querySelector("#h-q").oninput = e => { f.q = e.target.value; draw(); };
  r.querySelector("#h-t").onchange = e => { f.tipo = e.target.value; draw(); };
  r.querySelector("#h-de").onchange = e => { f.de = e.target.value; draw(); };
  r.querySelector("#h-ate").onchange = e => { f.ate = e.target.value; draw(); };
  r.onclick = e => acaoCartao(e, lista, draw);
  draw();
}

async function iniciar(u) {
  perfil = await carregarPerfil(u.uid);
  if (!perfil) { toast("Perfil não encontrado. Fale com o administrador.", "err"); await sair(); return; }
  ehAdmin = await souAdmin(u.uid);
  $("#quem").textContent = `${perfil.nome} · ${perfil.empresa}`;
  mostrar("app"); lista = await listarMinhas(u.uid); irPara("agenda");
  retentarPendentes().then(n => n && toast("Há fotografias de entregas excluídas ainda pendentes de remoção.", "warn"));
}

aoMudarSessao(async u => {
  if (registrando) return;
  if (!u) { perfil = null; lista = []; travarAdmin(); mostrar("auth"); return; }
  try { await iniciar(u); } catch (e) { toast(msgErro(e), "err"); mostrar("auth"); }
});

// ----- telas de autenticação -----
const fs = {cad: $("#f-cad"), log: $("#f-log")};
document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => {
  $("#a-home").hidden = b.dataset.go !== "home"; fs.cad.hidden = b.dataset.go !== "cad"; fs.log.hidden = b.dataset.go !== "log";
});
async function comEspera(btn, fn) {
  btn.disabled = true;
  try { await fn(); } catch (e) { registrando = false; toast(msgErro(e), "err"); } finally { btn.disabled = false; }
}
fs.cad.onsubmit = e => { e.preventDefault(); const v = Object.fromEntries(new FormData(fs.cad));
  comEspera(fs.cad.querySelector(".pri"), async () => { registrando = true; await cadastrar(v.nome.trim(), v.email.trim(), v.senha, v.empresa.trim()); registrando = false; await iniciar(auth.currentUser); }); };
fs.log.onsubmit = e => { e.preventDefault(); const v = Object.fromEntries(new FormData(fs.log)); comEspera(fs.log.querySelector(".pri"), () => entrar(v.email.trim(), v.senha)); };
$("#b-rec").onclick = () => {
  const email = fs.log.email.value.trim(); if (!email) return toast("Digite seu e-mail para receber o link de redefinição.", "warn");
  comEspera($("#b-rec"), async () => { await recuperarSenha(email); toast("Se o e-mail estiver cadastrado, enviamos o link de redefinição."); });
};
$("#b-sair").onclick = () => sair();
document.querySelectorAll(".bar button").forEach(b => b.onclick = () => irPara(b.dataset.v));
