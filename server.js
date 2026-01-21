const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { files: 5 }
});

// Upload route
app.post("/upload", upload.array("images", 5), (req, res) => {
  const mobile = req.body.mobile;

  if (!mobile) {
    return res.status(400).send("Mobile number required");
  }

  fs.appendFileSync("data.txt", mobile + "\n");

  res.send("✅ Data saved successfully");
});

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
const ADMIN_KEY = "12345";
// Admin panel
app.get("/admin", (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.send("Access Denied");
  }
  res.sendFile(path.join(__dirname, "admin.html"));
});
// API to get data
app.get("/admin-data", (req, res) => {
  const fs = require("fs");

  const mobiles = fs.existsSync("data.txt")
    ? fs.readFileSync("data.txt", "utf-8").split("\n").filter(Boolean)
    : [];

  const images = fs.existsSync("uploads")
    ? fs.readdirSync("uploads")
    : [];

  res.json({ mobiles, images });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));


