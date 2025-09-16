// ✅ server.js (Pure ESM)

// imports
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// ✅ public folder serving
app.use(express.static(path.join(__dirname, "public")));

// ✅ default route -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// make sure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ✅ multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ upload API
app.post("/upload", upload.single("photo"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    file: `/uploads/${req.file.filename}`,
    caption: req.body.caption,
  });
});

// ✅ single server listen (no duplicate)
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
