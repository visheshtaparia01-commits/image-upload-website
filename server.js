const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder
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

// Upload API
app.post("/upload", upload.array("images", 5), (req, res) => {
  const mobile = req.body.mobile;

  if (!mobile) {
    return res.status(400).send("Mobile number required");
  }

  // Save mobile number
  fs.appendFileSync("data.txt", mobile + "\n");

  res.send("✅ Data saved successfully");
});

// Home
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
