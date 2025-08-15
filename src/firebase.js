// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "",
    authDomain: ".firebaseapp.com",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de autenticación
export const auth = getAuth(app);

// Exporta la instancia de Firestore
export const db = getFirestore(app);
