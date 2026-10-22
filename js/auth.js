import {auth, db} from "./firebase-config.js";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {doc, setDoc, getDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ERROS = {
  "auth/invalid-email": "E-mail inválido.", "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.", "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.", "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.", "auth/network-request-failed": "Sem conexão com a internet.",
  "permission-denied": "Sem permissão para esta operação (verifique as regras do Firebase).", "storage/unauthorized": "Sem permissão para acessar a fotografia."
};
export const msgErro = e => ERROS[e?.code] || e?.message || "Ocorreu um erro inesperado.";

export async function cadastrar(nome, email, senha, empresa) {
  const c = await createUserWithEmailAndPassword(auth, email, senha);
  const perfil = {uid: c.user.uid, nome, email, empresa, role: "employee", createdAt: serverTimestamp()};
  await setDoc(doc(db, "users", c.user.uid), perfil);
  return perfil;
}
export const entrar = (email, senha) => signInWithEmailAndPassword(auth, email, senha);
export const sair = () => signOut(auth);
export const recuperarSenha = email => sendPasswordResetEmail(auth, email);
export const aoMudarSessao = cb => onAuthStateChanged(auth, cb);
export async function carregarPerfil(uid) { const s = await getDoc(doc(db, "users", uid)); return s.exists() ? s.data() : null; }
// Autorização real: existe /admins/{uid}? (criado só pelo console do Firebase; as regras impedem escrita pelo app)
export async function souAdmin(uid) { try { return (await getDoc(doc(db, "admins", uid))).exists(); } catch { return false; } }
