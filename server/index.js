const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

const clientDist = path.join(__dirname, "public");
const spaIndex = path.join(clientDist, "index.html");
if (fs.existsSync(spaIndex)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(spaIndex);
  });
} else {
  app.get("/", (req, res) => {
    res.json({ message: "NoteWise API is running" });
  });
}

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the other process: lsof -i :${PORT} then kill <PID>, or set PORT in .env to a free port.`,
        );
      } else {
        console.error(err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
