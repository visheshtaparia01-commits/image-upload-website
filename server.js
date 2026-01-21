const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

/* ------------------ MIDDLEWARE ------------------ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

/* ------------------ CONSTANTS ------------------ */
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "12345";

/* ------------------ ENSURE UPLOADS FOLDER ------------------ */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* ------------------ MULTER CONFIG ------------------ */
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

/* ------------------ ROUTES ------------------ */

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Upload route
app.post("/upload", upload.array("images", 5), (req, res) => {
  const mobile = req.body.mobile;

  if (!mobile) {
    return res.status(400).send("Mobile number required");
  }

  fs.appendFileSync("data.txt", mobile + "\n");

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cashback Confirmation</title>

  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">

  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }

    .message {
      font-family: 'Poppins', Arial, sans-serif;
      font-size: 22px;
      color: #2e7d32;
      font-weight: 600;
      text-align: center;
      animation: fadeIn 0.8s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>
<body>
  <div class="message">
    Cashback will be credited in your bank account within 7 working days<br>
    (if you gave us 5 star review + rating)
  </div>
</body>
</html>
  `);
});

// Admin page
app.get("/admin", (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.send("Access Denied");
  }
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Admin data API
app.get("/admin-data", (req, res) => {
  const mobiles = fs.existsSync("data.txt")
    ? fs.readFileSync("data.txt", "utf-8").split("\n").filter(Boolean)
    : [];

  const images = fs.existsSync("uploads")
    ? fs.readdirSync("uploads")
    : [];

  res.json({ mobiles, images });
});

/* ------------------ SERVER START ------------------ */
app.listen(PORT, () => {
  console.log(`Server running`);
});

