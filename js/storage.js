import {storage} from "./firebase-config.js";
import {ref, uploadBytes, getDownloadURL, deleteObject, getBlob} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export async function comprimir(file, max = 1600, q = 0.78) {
  if (!file?.type?.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  if (file.size > 25e6) throw new Error("Imagem muito grande (máximo 25 MB).");
  let img;
  try { img = await createImageBitmap(file, {imageOrientation: "from-image"}); }
  catch { img = await new Promise((ok, er) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => er(new Error("Não foi possível ler a imagem.")); i.src = URL.createObjectURL(file); }); }
  const w = img.width || img.naturalWidth, h = img.height || img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, "image/jpeg", q));
  if (!blob) throw new Error("Falha ao processar a imagem.");
  return blob;
}
export async function enviarFoto(path, file) {
  const blob = await comprimir(file);
  await uploadBytes(ref(storage, path), blob, {contentType: "image/jpeg"});
}
export const apagarFoto = path => deleteObject(ref(storage, path));
const cache = new Map();
export const urlFoto = path => { if (!cache.has(path)) cache.set(path, getDownloadURL(ref(storage, path)).catch(e => { cache.delete(path); throw e; })); return cache.get(path); };
export const blobFoto = path => getBlob(ref(storage, path));
