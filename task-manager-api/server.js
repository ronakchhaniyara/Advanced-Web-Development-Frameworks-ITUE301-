const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Ensure event listeners are registered at server startup (Practical 10)
require("./events/taskListeners");

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const systemRoutes = require("./routes/systemRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_manager_db";

// Connect to MongoDB
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI, {
      driverInfo: { name: "Mongoose", version: "9.10.1" },
    })
    .then(() => {
      console.log(`MongoDB connected successfully to ${MONGO_URI}`);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
}

// 1. CORS Middleware (Practical 6: allow frontend at localhost:5173 to communicate with API)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Cache"],
    exposedHeaders: ["X-Cache"],
  })
);

// 2. Built-in body parser middleware
app.use(express.json());

// 3. Global logging middleware (Practical 4)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// 4. Content-Type validation middleware for write operations (Practical 4 Supplementary)
const requireJsonContentType = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    // If request has a body, check Content-Type
    if (req.headers["content-length"] && req.headers["content-length"] !== "0") {
      if (!req.is("application/json")) {
        return res.status(400).json({
          error: "Content-Type must be application/json",
        });
      }
    }
  }
  next();
};

app.use(requireJsonContentType);

// Route mount points
app.use("/tasks", taskRoutes);
app.use("/api/tasks", taskRoutes); // Alias
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes); // Alias
app.use("/api/ai", aiRoutes);
app.use("/api/system", systemRoutes);

// Direct top-level aliases for Practical 7 Postman compatibility (/register, /login, /me)
app.use("/", authRoutes);

// 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Centralized Error Handling Middleware (Practical 4 & 5)
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({
      error: "Validation Error",
      details,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid task ID format",
    });
  }

  console.error("Unhandled Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

let server = null;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server };
