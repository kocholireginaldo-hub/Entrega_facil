import {esc, isoData, horaHM, abrirModal, fecharModal, toast} from "./ui.js";
import {salvarEntrega} from "./database.js";
import {msgErro} from "./auth.js";

const posicao = () => new Promise((ok, er) => {
  if (!navigator.geolocation) return er(new Error("Este navegador não oferece localização."));
  navigator.geolocation.getCurrentPosition(
    p => ok({latitude: p.coords.latitude, longitude: p.coords.longitude, accuracyMeters: Math.round(p.coords.accuracy)}),
    e => er(new Error(e.code === 1 ? "Permissão de localização negada. Permita a localização para este site nas configurações do navegador (iPhone: Ajustes > Privacidade e Segurança > Serviços de Localização > Safari) e tente novamente."
      : e.code === 3 ? "Tempo esgotado ao obter a localização. Vá para um local aberto e tente novamente." : "Não foi possível obter a localização.")),
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 0});
});

export function abrirNova(perfil, lista, aoSalvar, dataSel) {
  let tipo = "standard", arquivo = null, obs = "", dataOc = dataSel || isoData(new Date()), hora = "08:00", msg = "";
  const s = abrirModal("");
  const nomePadrao = () => tipo === "special" ? "Entrega Especial" : `Entrega ${lista.filter(d => d.deliveryType === "standard" && d.deliveryDate === isoData(new Date())).length + 1}`;
  let nome = nomePadrao();
  const draw = () => {
    const e = tipo === "special";
    s.innerHTML = `<div class="tabs"><button data-t="standard" class="${e ? "" : "on"}">Entrega Padrão</button><button data-t="special" class="${e ? "on e" : ""}">Entrega Especial</button></div>
    ${e ? '<p class="aviso"><b>ENTREGA ESPECIAL — REGISTRO RETROATIVO.</b> Para entregas já realizadas e não registradas na hora. Data e horário abaixo são informados por você; o instante real do registro é guardado separadamente.</p>' : '<p class="aviso az">Data, horário e localização serão capturados automaticamente ao salvar.</p>'}
    <label>Nome da entrega<input id="n-nome" value="${esc(nome)}"></label>
    ${e ? `<label>Data da ocorrência<input type="date" id="n-data" value="${dataOc}"></label><label>Horário<input type="time" id="n-hora" value="${hora}"></label>
    <label>Observações (opcional)<textarea id="n-obs" rows="2">${esc(obs)}</textarea></label>` : ""}
    <label class="btn" for="f-cam">📷 ${arquivo ? "Tirar outra fotografia" : "Tirar fotografia"}</label>
    <input type="file" id="f-cam" accept="image/*" capture="environment" hidden>
    ${e ? '<label class="btn" for="f-gal">🖼 Escolher da galeria</label><input type="file" id="f-gal" accept="image/*" hidden>' : ""}
    ${arquivo ? '<img class="prev" id="prev" alt="Prévia">' : '<p class="mut peq">A fotografia é obrigatória.</p>'}
    <p class="err" id="n-err">${esc(msg)}</p>
    <button class="btn pri" id="n-salvar">Salvar entrega</button><button class="btn" id="n-cancel">Cancelar</button>`;
    if (arquivo) s.querySelector("#prev").src = URL.createObjectURL(arquivo);
    s.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { const antigo = nomePadrao(); guardar(); const trocou = nome === antigo; tipo = b.dataset.t; if (trocou) nome = nomePadrao(); msg = ""; draw(); });
    s.querySelectorAll("input[type=file]").forEach(i => i.onchange = () => { guardar(); if (i.files[0]) { arquivo = i.files[0]; msg = ""; draw(); } });
    s.querySelector("#n-cancel").onclick = fecharModal;
    s.querySelector("#n-salvar").onclick = salvar;
  };
  function guardar() { nome = s.querySelector("#n-nome").value; if (tipo === "special") { dataOc = s.querySelector("#n-data").value; hora = s.querySelector("#n-hora").value; obs = s.querySelector("#n-obs").value; } }
  async function salvar() {
    guardar(); const e = tipo === "special", btn = s.querySelector("#n-salvar"), er = s.querySelector("#n-err");
    const falha = m => { msg = m; er.textContent = m; btn.disabled = false; btn.textContent = "Salvar entrega"; };
    if (!nome.trim()) return falha("Informe o nome da entrega.");
    if (!arquivo) return falha("A fotografia é obrigatória.");
    if (e && (!dataOc || !hora)) return falha("Informe a data e o horário da ocorrência.");
    if (!navigator.onLine) return falha("Sem conexão com a internet. A entrega NÃO foi confirmada na nuvem.");
    btn.disabled = true; btn.textContent = "Obtendo localização e salvando…"; er.textContent = "";
    try {
      let loc = null;
      try { loc = await posicao(); } catch (x) { if (!e) throw x; toast(x.message + " O registro especial será salvo sem localização.", "warn"); }
      const agora = new Date();
      const dados = {deliveryName: nome.trim(), deliveryType: tipo, deviceCreatedAt: agora, notes: e ? obs.trim() : "",
        deliveryDate: e ? dataOc : isoData(agora), deliveryTime: e ? hora : horaHM(agora), occurredAt: e ? new Date(`${dataOc}T${hora}`) : agora,
        latitude: loc?.latitude ?? null, longitude: loc?.longitude ?? null, accuracyMeters: loc?.accuracyMeters ?? null, locationKind: loc ? (e ? "registro" : "entrega") : null};
      await salvarEntrega(perfil, dados, arquivo);
      fecharModal(); await aoSalvar();
      toast(e ? "Entrega especial registrada com sucesso! Os dados informados foram salvos." + (loc ? " A localização do momento do registro também." : "")
        : "Entrega registrada com sucesso! Fotografia, data, horário e localização foram registrados.");
    } catch (x) { falha(msgErro(x) + " A entrega NÃO foi confirmada. Você pode tentar novamente."); }
  }
  draw();
}
