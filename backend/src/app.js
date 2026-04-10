const express = require("express");
const cors = require("cors");

require("dotenv").config();
const mongoose = require("mongoose");
const timetableroutes = require("./routes/timetableroutes");
const userroutes = require("./routes/userroutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests and local dev by default.
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:")) return callback(null, true);
      if (origin.startsWith("http://127.0.0.1:")) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "timetable-backend",
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState,
  });
});


app.use("/api/timetable", timetableroutes);
app.use("/api/users", userroutes);

const start = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/timetable";
  const port = Number(process.env.PORT || 5000);
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

start().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});