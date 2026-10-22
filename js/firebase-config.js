// ===== CONFIGURAÇÃO — preencha com os dados do SEU projeto Firebase (Configurações do projeto > Seus apps > Web) =====
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getStorage} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};
// Senha da etapa extra da tela Admin. NÃO é segurança real: o acesso aos dados é controlado pelas regras do Firebase.
export const ADMIN_PIN = "3030";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app), db = getFirestore(app), storage = getStorage(app);
