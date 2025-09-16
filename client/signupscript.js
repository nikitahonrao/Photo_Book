// Firebase config import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// 🔹 तुझ्या Firebase project config ने भर
const firebaseConfig = {
  apiKey: "AIzaSyCgbVH_payIcNEYwC7nKc641OBjVFzIqg0",
  authDomain: "photobook-niks.firebaseapp.com",
  projectId: "photobook-niks",
  storageBucket: "photobook-niks.appspot.com",   // 🔹 इथे ".app" चुकीचं होतं → ".appspot.com" करावं लागतं
  messagingSenderId: "1014477551210",
  appId: "1:1014477551210:web:fdebdf1f3618199f7a7c13",
  measurementId: "G-118SF2ND9S"
};

// Firebase init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Signup function
async function signup(e) {
  e.preventDefault(); // form reload होऊ नये म्हणून

  const name = document.querySelector("input[placeholder='FullName']").value.trim();
  const email = document.querySelector("input[placeholder='EmailAddress']").value.trim();
  const mobile = document.querySelector("input[placeholder='MobileNumber']").value.trim();
  const password = document.querySelector("input[placeholder='Password']").value;
  const confirmPassword = document.querySelector("input[placeholder='ConfirmPassword']").value;

  if (!name || !email || !mobile || !password || !confirmPassword) {
    return alert("⚠️ Please fill all fields!");
  }

  if (password !== confirmPassword) {
    return alert("❌ Passwords do not match!");
  }

  try {
    // Firebase Auth मध्ये user तयार कर
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore मध्ये extra info save कर
    await setDoc(doc(db, "users", user.uid), {
      fullName: name,
      email: email,
      mobile: mobile,
      createdAt: serverTimestamp()  // Firebase चा proper timestamp
    });

    alert("✅ Signup successful! You can now login.");
    window.location.href = "login.html"; // Signup नंतर login page वर redirect

  } catch (error) {
    console.error(error);
    alert("❌ Error: " + error.message);
  }
}

// Form ला event listener लाव
document.getElementById("signupForm").addEventListener("submit", signup);
