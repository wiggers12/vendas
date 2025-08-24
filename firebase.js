// firebase.js
// Configuração e exportação do Firestore

// Importa os módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔑 Configuração do Firebase (seus dados)
const firebaseConfig = {
  apiKey: "AIzaSyBDI0VtcyymdO_uowbUpP6emXiFoYf5Ubw",
  authDomain: "dashcontrol-vendas.firebaseapp.com",
  projectId: "dashcontrol-vendas",
  storageBucket: "dashcontrol-vendas.appspot.com",
  messagingSenderId: "50652412621",
  appId: "1:50652412621:web:d573bf2275c334c7a20784",
  measurementId: "G-ZMCZNQLQFH"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

// Exporta o banco de dados
export { db };