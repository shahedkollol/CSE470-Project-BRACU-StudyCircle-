const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

console.log("MONGO_URI loaded?", process.env.MONGO_URI ? "YES" : "NO");
console.log("MONGO_URI preview:", (process.env.MONGO_URI || "").slice(0, 20));

const studyGroupRoutes = require("./routes/studyGroup.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.use("/api/study-groups", studyGroupRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");

    // 🔴 THIS WAS MISSING
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} ✅`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
