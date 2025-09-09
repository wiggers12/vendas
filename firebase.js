// firebase.js
// Configuração e integração Firebase + Auth + Firestore

// Importa módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDI0VtcyymdO_uowbUpP6emXiFoYf5Ubw",
  authDomain: "dashcontrol-vendas.firebaseapp.com",
  projectId: "dashcontrol-vendas",
  storageBucket: "dashcontrol-vendas.firebasestorage.app",
  messagingSenderId: "50652412621",
  appId: "1:50652412621:web:d573bf2275c334c7a20784",
  measurementId: "G-ZMCZNQLQFH"
};


// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ================================
// 🔑 Funções de Autenticação
// ================================

// Criar usuário
async function registrarUsuario(email, senha) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    // Cria doc no Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      email: email,
      planoAtivo: false, // padrão até pagar
      criadoEm: new Date()
    });
    alert("Conta criada! Faça login.");
  } catch (err) {
    alert("Erro ao registrar: " + err.message);
  }
}

// Login
async function loginUsuario(email, senha) {
  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (err) {
    alert("Erro ao logar: " + err.message);
  }
}

// Logout
function sair() {
  signOut(auth).then(() => {
    alert("Você saiu da conta.");
    location.reload();
  });
}

// ================================
// 🔒 Verificação do Plano
// ================================
async function verificarPlano(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().planoAtivo === true;
  } else {
    return false;
  }
}

// Monitora login/logout
onAuthStateChanged(auth, async (user) => {
  const pagamento = document.getElementById("pagamento");
  const cards = document.getElementById("cards");

  if (user) {
    const ativo = await verificarPlano(user.uid);
    if (ativo) {
      if (pagamento) pagamento.style.display = "none";
      if (cards) cards.style.display = "flex";
    } else {
      if (pagamento) pagamento.style.display = "block";
      if (cards) cards.style.display = "none";
    }
  } else {
    if (pagamento) pagamento.style.display = "block";
    if (cards) cards.style.display = "none";
  }
});

// Exporta funções
export { db, auth, registrarUsuario, loginUsuario, sair };
