const express = require("express");
const cors = require("cors");

require("dotenv").config();
const mongoose = require("mongoose");
const timetableroutes = require("./routes/timetableroutes");
const userroutes = require("./routes/userroutes");

const app = express();
const isProd = process.env.NODE_ENV === "production";

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (server-to-server, curl, health checks).
      if (!origin) return callback(null, true);
      // In development, allow localhost frontends automatically.
      if (!isProd && origin.startsWith("http://localhost:")) return callback(null, true);
      if (!isProd && origin.startsWith("http://127.0.0.1:")) return callback(null, true);
      // In production, allow only explicit allowlist origins.
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

if (!isProd) {
  app.get("/api/config", (_req, res) => {
    res.status(200).json({
      nodeEnv: process.env.NODE_ENV || "development",
      port: Number(process.env.PORT || 5000),
      corsOrigins: allowedOrigins,
      mongoConfigured: Boolean(process.env.MONGO_URI),
      dbState: mongoose.connection.readyState,
    });
  });
}


app.use("/api/timetable", timetableroutes);
app.use("/api/users", userroutes);

// Convert CORS errors to clean JSON responses.
app.use((err, _req, res, next) => {
  if (err && typeof err.message === "string" && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({ error: err.message });
  }
  return next(err);
});

const start = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/timetable";
  const port = Number(process.env.PORT || 5000);
  await mongoose.connect(mongoUri);
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the existing process or change PORT.`);
      process.exit(1);
    }
    throw err;
  });
};

start().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});