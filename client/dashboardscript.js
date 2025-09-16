// ---------- Firebase ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgbVH_payIcNEYwC7nKc641OBjVFzIqg0",
  authDomain: "photobook-niks.firebaseapp.com",
  projectId: "photobook-niks",
  storageBucket: "photobook-niks.appspot.com",
  messagingSenderId: "1014477551210",
  appId: "1:1014477551210:web:fdebdf1f3618199f7a7c13",
  measurementId: "G-118SF2ND9S"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- DOM ----------
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

const openCreateAlbum = document.getElementById("openCreateAlbum");
const modal = document.getElementById("modal");
const cancelCreate = document.getElementById("cancelCreate");
const createAlbumBtn = document.getElementById("createAlbum");
const newTitle = document.getElementById("newTitle");
const newDesc = document.getElementById("newDesc");
const newCover = document.getElementById("newCover");

const albumSelect = document.getElementById("albumSelect");
const photoInput = document.getElementById("photoInput");
const captionInput = document.getElementById("captionInput");
const uploadBtn = document.getElementById("uploadBtn");

const sectionTitle = document.getElementById("sectionTitle");
const albumsGrid = document.getElementById("albumsGrid");
const recentList = document.getElementById("recentList");

const albumView = document.getElementById("albumView");
const backHome = document.getElementById("backHome");
const favToggle = document.getElementById("favToggle");
const albumCover = document.getElementById("albumCover");
const albumTitle = document.getElementById("albumTitle");
const albumDesc = document.getElementById("albumDesc");
const photosGrid = document.getElementById("photosGrid");

const homeBtn = document.getElementById("homeBtn");
const favFilterBtn = document.getElementById("favFilterBtn");

let CURRENT_USER = null;
let CURRENT_ALBUM = null;
let SHOW_FAVORITES_ONLY = false;

// ---------- Helpers ----------
const uidDoc = (col) => doc(collection(db, col));
const byUser = (col) => query(collection(db, col), where("userId", "==", CURRENT_USER.uid));

// ---------- Auth + bootstrap ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  CURRENT_USER = user;
  userNameEl.textContent = user.email.split("@")[0];

  await loadAlbums();   // populate UI
  await refreshAlbumSelect();
  await renderRecentAlbums();
});

// ---------- Logout ----------
logoutBtn.onclick = () => signOut(auth).then(() => location.href = "login.html");

// ---------- Create album modal ----------
openCreateAlbum.onclick = () => modal.classList.remove("hidden");
cancelCreate.onclick = () => modal.classList.add("hidden");

createAlbumBtn.onclick = async () => {
  const title = newTitle.value.trim();
  if (!title) return alert("Please enter an album title.");

  const albumId = crypto.randomUUID();
  const data = {
    userId: CURRENT_USER.uid,
    title,
    description: newDesc.value.trim() || "",
    coverUrl: newCover.value.trim() || "",
    favorite: false,
    createdAt: serverTimestamp()
  };
  await setDoc(doc(db, "albums", albumId), data);

  modal.classList.add("hidden");
  newTitle.value = newDesc.value = newCover.value = "";

  await loadAlbums();
  await refreshAlbumSelect();
  await renderRecentAlbums();
};

// ---------- Load albums ----------
async function loadAlbums() {
  const q = SHOW_FAVORITES_ONLY
    ? query(byUser("albums"), where("favorite","==",true), orderBy("createdAt","desc"))
    : query(byUser("albums"), orderBy("createdAt","desc"));

  const snap = await getDocs(q);
  const items = [];
  snap.forEach(d => items.push({ id: d.id, ...d.data() }));

  albumsGrid.innerHTML = items.map(a => albumCard(a)).join("") || `<p class="muted">No albums yet — create one!</p>`;
  sectionTitle.textContent = SHOW_FAVORITES_ONLY ? "My Favorite Albums" : "My Albums";

  // bind clicks
  items.forEach(a => {
    const open = document.getElementById(`open-${a.id}`);
    const star = document.getElementById(`fav-${a.id}`);
    open.onclick = () => openAlbum(a);
    star.onclick = async (e) => {
      e.stopPropagation();
      await updateDoc(doc(db, "albums", a.id), { favorite: !a.favorite });
      await loadAlbums();
      await renderRecentAlbums();
    };
  });
}

function albumCard(a) {
  const cover = a.coverUrl || "https://picsum.photos/seed/" + a.id.slice(0,6) + "/600/400";
  const star = a.favorite ? "★" : "☆";
  return `
  <article class="album" id="open-${a.id}">
    <img src="${cover}" alt="">
    <div class="pad">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h4 style="margin:0">${a.title}</h4>
        <button id="fav-${a.id}" class="chip" title="Favorite">${star}</button>
      </div>
      <p class="muted" style="margin:.25rem 0 0">${a.description || ""}</p>
    </div>
  </article>`;
}

// ---------- Album view ----------
async function openAlbum(a) {
  CURRENT_ALBUM = a;
  albumCover.src = a.coverUrl || "https://picsum.photos/seed/" + a.id.slice(0,6) + "/200";
  albumTitle.textContent = a.title;
  albumDesc.textContent = a.description || "";
  favToggle.textContent = a.favorite ? "★ Unfavorite" : "★ Favorite";

  document.querySelector("main section").classList.add("hidden");
  albumView.classList.remove("hidden");

  await loadPhotos(a.id);

  favToggle.onclick = async () => {
    await updateDoc(doc(db, "albums", a.id), { favorite: !a.favorite });
    a.favorite = !a.favorite;
    favToggle.textContent = a.favorite ? "★ Unfavorite" : "★ Favorite";
    await loadAlbums();
    await renderRecentAlbums();
  };
}
backHome.onclick = () => {
  albumView.classList.add("hidden");
  document.querySelector("main section").classList.remove("hidden");
  CURRENT_ALBUM = null;
};

// ---------- Photos ----------
async function loadPhotos(albumId) {
  const q = query(collection(db, "photos"), where("albumId","==",albumId), orderBy("createdAt","desc"));
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(d => items.push({ id: d.id, ...d.data() }));
  photosGrid.innerHTML = items.map(p => `
    <figure>
      <img src="${p.url}" alt="">
      <figcaption class="muted" style="margin-top:6px">${p.caption || ""}</figcaption>
    </figure>`).join("") || `<p class="muted">No photos yet — use the sidebar to upload.</p>`;
}

// ---------- Upload photo (local → backend → Firestore) ----------
uploadBtn.onclick = async () => {
  const albumId = albumSelect.value;
  if (!albumId) return alert("Select an album first.");
  const file = photoInput.files[0];
  if (!file) return alert("Choose a photo.");
  const caption = captionInput.value.trim();

  // 1) send to Node/Express
  const fd = new FormData();
  fd.append("photo", file);
  const res = await fetch("http://localhost:5000/upload", { method:"POST", body: fd });
  if (!res.ok) return alert("Upload failed.");
  const { url } = await res.json();

  // 2) save metadata in Firestore
  const photoId = crypto.randomUUID();
  await setDoc(doc(db,"photos",photoId), {
    userId: CURRENT_USER.uid,
    albumId,
    url,
    caption,
    createdAt: serverTimestamp()
  });

  // 3) set first photo as cover if album has no cover yet
  const albSnap = await getDoc(doc(db,"albums",albumId));
  if (albSnap.exists() && !albSnap.data().coverUrl) {
    await updateDoc(doc(db,"albums",albumId), { coverUrl: url });
  }

  // reset form + refresh
  photoInput.value = "";
  captionInput.value = "";
  await loadAlbums();
  await renderRecentAlbums();
  if (CURRENT_ALBUM && CURRENT_ALBUM.id === albumId) await loadPhotos(albumId);

  alert("Photo uploaded ✅");
};

// ---------- Populate album select + recent ----------
async function refreshAlbumSelect() {
  const snap = await getDocs(query(byUser("albums"), orderBy("createdAt","desc")));
  const opts = [];
  snap.forEach(d => opts.push({ id:d.id, ...d.data() }));
  albumSelect.innerHTML = `<option value="">Select…</option>` +
    opts.map(a => `<option value="${a.id}">${a.title}</option>`).join("");
}

async function renderRecentAlbums() {
  const snap = await getDocs(query(byUser("albums"), orderBy("createdAt","desc")));
  const items = [];
  snap.forEach(d => items.push({ id:d.id, ...d.data() }));
  recentList.innerHTML = items.slice(0,5).map(a => `
    <li>
      <span>${a.title}</span>
      <button class="link" id="go-${a.id}">Open</button>
    </li>`).join("") || `<li class="muted">No albums</li>`;
  items.slice(0,5).forEach(a => {
    const btn = document.getElementById(`go-${a.id}`);
    btn.onclick = () => openAlbum(a);
  });
}

// ---------- Filters ----------
homeBtn.onclick = async () => { SHOW_FAVORITES_ONLY = false; await loadAlbums(); };
favFilterBtn.onclick = async () => { SHOW_FAVORITES_ONLY = !SHOW_FAVORITES_ONLY; await loadAlbums(); };
