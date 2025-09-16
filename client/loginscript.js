// Firebase config import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgbVH_payIcNEYwC7nKc641OBjVFzIqg0",
  authDomain: "photobook-niks.firebaseapp.com",
  projectId: "photobook-niks",
  storageBucket: "photobook-niks.appspot.com",
  messagingSenderId: "1014477551210",
  appId: "1:1014477551210:web:fdebdf1f3618199f7a7c13",
  measurementId: "G-118SF2ND9S"
};

// Firebase init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 Login function
async function login(e) {
  e.preventDefault();

  const email = document.querySelector("input[placeholder='Username']").value.trim();
  const password = document.querySelector("input[placeholder='Password']").value;

  if (!email || !password) {
    return alert("⚠️ Please enter email & password!");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    alert("✅ Login successful! Welcome " + user.email);
    window.location.href = "dashboard.html"; // 🔹 login नंतर dashboard वर redirect

  } catch (error) {
    console.error(error);
    alert("❌ Login failed: " + error.message);
  }
}

// Form listener
document.getElementById("loginForm").addEventListener("submit", login);
