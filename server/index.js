const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

console.log("MONGO_URI loaded?", process.env.MONGO_URI ? "YES" : "NO");
console.log("MONGO_URI preview:", (process.env.MONGO_URI || "").slice(0, 20));
console.log("JWT_SECRET set?", process.env.JWT_SECRET ? "YES" : "NO");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(require("./middleware/auth").attachUser);

// route
const apiRouter = require("./routes");

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.use("/api", apiRouter);

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in server/.env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in server/.env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} ✅`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
