import {db} from "./firebase-config.js";
import {collection, doc, setDoc, deleteDoc, getDocs, query, where, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {enviarFoto, apagarFoto} from "./storage.js";

const col = collection(db, "deliveries");
const lista = s => s.docs.map(d => ({id: d.id, ...d.data()}));
export const listarMinhas = async uid => lista(await getDocs(query(col, where("userId", "==", uid))));
export const listarTodas = async () => lista(await getDocs(col));
export const listarUsuarios = async () => (await getDocs(collection(db, "users"))).docs.map(d => d.data());

// Envia a foto primeiro (exige conexão) e só então grava o documento. Se o documento falhar, remove a foto.
export async function salvarEntrega(perfil, dados, arquivo) {
  const r = doc(col), path = `deliveries/${perfil.uid}/${r.id}/photo.jpg`;
  await enviarFoto(path, arquivo);
  try {
    await setDoc(r, {userId: perfil.uid, employeeNameSnapshot: perfil.nome, employeeEmailSnapshot: perfil.email, companySnapshot: perfil.empresa,
      ...dados, photoPath: path, photoContentType: "image/jpeg", createdAt: serverTimestamp()});
  } catch (e) { await apagarFoto(path).catch(() => {}); throw e; }
  return r.id;
}

const PEND = "fotosPendentesExclusao";
const lerPend = () => { try { return JSON.parse(localStorage.getItem(PEND) || "[]"); } catch { return []; } };
const gravarPend = a => { try { localStorage.setItem(PEND, JSON.stringify(a)); } catch {} };
export async function excluirEntrega(d) {
  await deleteDoc(doc(col, d.id));
  try { await apagarFoto(d.photoPath); return {}; }
  catch (e) { if (e?.code === "storage/object-not-found") return {}; gravarPend([...new Set([...lerPend(), d.photoPath])]); return {fotoPendente: true}; }
}
export async function retentarPendentes() {
  const resto = [];
  for (const p of lerPend()) { try { await apagarFoto(p); } catch (e) { if (e?.code !== "storage/object-not-found") resto.push(p); } }
  gravarPend(resto); return resto.length;
}
