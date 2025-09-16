import { auth, db } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const uploadForm = document.getElementById("uploadForm");
const preview = document.getElementById("preview"); // optional preview div

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Photo + caption घेतो
  const file = e.target.photo.files[0];
  const caption = e.target.caption.value.trim();

  if (!file) return alert("कृपया photo निवडा!");
  if (!caption) return alert("कृपया caption टाका!");

  // Backend कडे पाठवायला FormData
  const formData = new FormData();
  formData.append("photo", file);

  try {
    // 1. Backend वर photo upload
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed!");

    const data = await response.json();
    const photoUrl = data.url;

    // 2. Firestore मध्ये save
    const user = auth.currentUser;
    if (!user) return alert("Login required!");

    await setDoc(doc(db, "photos", Date.now().toString()), {
      userId: user.uid,
      url: photoUrl,
      caption: caption,
      createdAt: new Date(),
    });

    alert("✅ Photo Uploaded Successfully!");

    // 3. Upload झाल्यानंतर preview दाखवायचं असल्यास
    if (preview) {
      preview.innerHTML = `
        <div>
          <p><b>Caption:</b> ${caption}</p>
          <img src="${photoUrl}" width="200" style="margin-top:10px; border:1px solid #ccc; border-radius:8px;" />
        </div>
      `;
    }

    // Form reset
    uploadForm.reset();

  } catch (err) {
    console.error(err);
    alert("❌ Upload error: " + err.message);
  }
});
