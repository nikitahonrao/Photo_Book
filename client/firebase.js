// client/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCgbVH_payIcNEYwC7nKc641OBjVFzIqg0",
    authDomain: "photobook-niks.firebaseapp.com",
    projectId: "photobook-niks",
    storageBucket: "photobook-niks.firebasestorage.app",
    messagingSenderId: "1014477551210",
    appId: "1:1014477551210:web:fdebdf1f3618199f7a7c13",
    measurementId: "G-118SF2ND9S"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
