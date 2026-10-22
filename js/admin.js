import {esc} from "./ui.js";
import {ADMIN_PIN} from "./firebase-config.js";
import {listarUsuarios, listarTodas} from "./database.js";
import {montarAgenda, montarResumo} from "./agenda.js";
import {msgErro} from "./auth.js";

let liberado = false;
export const travarAdmin = () => { liberado = false; };

export async function montarAdminView(root, ehAdmin) {
  root.onclick = null;
  if (!ehAdmin) { root.innerHTML = '<div class="box"><h2>Acesso restrito</h2><p>Esta conta não tem autorização administrativa. Ela é concedida no Firebase pelo responsável (veja o README).</p></div>'; return; }
  if (!liberado) {
    root.innerHTML = '<div class="box"><h2>Área administrativa</h2><label>Senha administrativa<input type="password" id="pin" inputmode="numeric" autocomplete="off"></label><p class="err" id="pin-e"></p><button class="btn pri" id="pin-ok">Entrar</button></div>';
    root.querySelector("#pin-ok").onclick = () => { if (root.querySelector("#pin").value === ADMIN_PIN) { liberado = true; montarAdminView(root, true); } else root.querySelector("#pin-e").textContent = "Senha incorreta."; };
    return;
  }
  root.innerHTML = '<p class="vazio">Carregando…</p>';
  try {
    const [us, ds] = await Promise.all([listarUsuarios(), listarTodas()]);
    const mostrarLista = () => {
      root.innerHTML = "<h2>Funcionários</h2>" + (us.map(u => `<div class="box"><b>${esc(u.nome)}</b><br>${esc(u.email)}<br><span class="mut">${esc(u.empresa)}</span><br>
        ${ds.filter(d => d.userId === u.uid).length} entrega(s)<button class="btn pri" data-u="${esc(u.uid)}">Ver registros</button></div>`).join("") || '<p class="vazio">Nenhum funcionário.</p>');
      root.onclick = e => { const b = e.target.closest("[data-u]"); if (b) mostrarUsuario(us.find(x => x.uid === b.dataset.u)); };
    };
    const mostrarUsuario = u => {
      const minhas = ds.filter(d => d.userId === u.uid);
      root.onclick = null;
      root.innerHTML = `<button class="btn" id="voltar">‹ Funcionários</button><h2>${esc(u.nome)}</h2><p class="mut">${esc(u.empresa)} · ${esc(u.email)}</p><div id="ag"></div><div id="rs"></div>`;
      montarAgenda(root.querySelector("#ag"), minhas, {admin: true});
      montarResumo(root.querySelector("#rs"), minhas);
      root.querySelector("#voltar").onclick = mostrarLista;
    };
    mostrarLista();
  } catch (e) { root.innerHTML = `<p class="err">${esc(msgErro(e))}</p>`; }
}
