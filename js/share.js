import {blobFoto} from "./storage.js";
import {fmtData, fmtCriado, toast} from "./ui.js";

export const coordOk = d => Number.isFinite(d.latitude) && Number.isFinite(d.longitude) && Math.abs(d.latitude) <= 90 && Math.abs(d.longitude) <= 180;
export const linkMapa = d => coordOk(d) ? `https://www.google.com/maps?q=${d.latitude},${d.longitude}` : null;

export function textoEntrega(d, cabecalho = true) {
  const e = d.deliveryType === "special", L = [];
  if (cabecalho) L.push("COMPROVANTE DE ENTREGA", "");
  if (e) L.push("*ENTREGA ESPECIAL — REGISTRO RETROATIVO*");
  L.push(`Entrega: ${d.deliveryName}`, `Tipo: ${e ? "Entrega Especial" : "Entrega Padrão"}`, `Entregador: ${d.employeeNameSnapshot}`, `Empresa: ${d.companySnapshot}`,
    `Data${e ? " informada" : ""}: ${fmtData(d.deliveryDate)}`, `Horário${e ? " informado" : ""}: ${d.deliveryTime}`);
  if (e) L.push(`Registro criado em: ${fmtCriado(d)}`);
  if (d.notes) L.push(`Obs.: ${d.notes}`);
  if (coordOk(d)) L.push(`${e ? "Localização no momento do registro" : "Localização"}: ${d.latitude}, ${d.longitude}${d.accuracyMeters ? ` (precisão ~${d.accuracyMeters} m)` : ""}`, `Google Maps: ${linkMapa(d)}`);
  else L.push("Localização: não registrada");
  return L.join("\n");
}

async function enviar(texto, docs) {
  const files = [];
  for (const d of docs) { try { files.push(new File([await blobFoto(d.photoPath)], `entrega-${d.id}.jpg`, {type: "image/jpeg"})); } catch {} }
  try {
    if (files.length && navigator.canShare?.({files})) { await navigator.share({text: texto, files}); return; }
    if (navigator.share) {
      if (docs.length) toast("Este aparelho/navegador não envia foto junto com o texto. Compartilhando só o texto.", "warn");
      await navigator.share({text: texto}); return;
    }
  } catch (e) { if (e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(texto); } catch {}
  window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank");
  toast("Texto copiado e WhatsApp aberto. Anexe a(s) foto(s) manualmente pela galeria.", "warn");
}
export const compartilharEntrega = d => enviar(textoEntrega(d), [d]);
export function compartilharDia(lista, data, nome) {
  const cab = `RELATÓRIO DE ENTREGAS — ${fmtData(data)}\nEntregador: ${nome}\nTotal: ${lista.length}\n`;
  const corpo = lista.map((d, i) => `\n--- ${i + 1} ---\n${textoEntrega(d, false)}`).join("\n");
  return enviar(cab + corpo, lista);
}
