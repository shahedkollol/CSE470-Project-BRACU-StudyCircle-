// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

console.log("MONGO_URI loaded?", process.env.MONGO_URI ? "YES" : "NO");
console.log("MONGO_URI preview:", (process.env.MONGO_URI || "").slice(0, 20));

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const studyGroupRoutes = require("./routes/studyGroup.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/authRoutes");

console.log("Loading routes...");
console.log("authRoutes path:", require.resolve("./routes/authRoutes"));
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.use("/api/study-groups", studyGroupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
console.log("Mounted /api/auth ✅");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err.message));
