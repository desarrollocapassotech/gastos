// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD32n40QaQ7A79UKYCGpWk4oocRNJ3N43s",
    authDomain: "mis-gastos-mes.firebaseapp.com",
    projectId: "mis-gastos-mes",
    storageBucket: "mis-gastos-mes.firebasestorage.app",
    messagingSenderId: "26011004334",
    appId: "1:26011004334:web:b95746dfa80754d6e36c3f",
    measurementId: "G-GK6HDK3189"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de autenticación
export const auth = getAuth(app);

// Exporta la instancia de Firestore
export const db = getFirestore(app);
