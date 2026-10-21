const express = require("express");
const mongoose = require("mongoose");
const { getCacheStats, clearAllCache } = require("../utils/cache");
const { getActivityLogs, clearActivityLogs } = require("../events/taskListeners");

const router = express.Router();

// 1. GET /api/system/cache-stats (Practical 9 Supplementary Problem 2)
router.get("/cache-stats", (req, res) => {
  res.status(200).json({
    status: "success",
    stats: getCacheStats(),
  });
});

// 2. POST /api/system/cache-clear
router.post("/cache-clear", (req, res) => {
  clearAllCache();
  res.status(200).json({
    message: "In-memory cache cleared successfully",
    stats: getCacheStats(),
  });
});

// 3. GET /api/system/event-logs (Practical 10 real-time observation)
router.get("/event-logs", (req, res) => {
  res.status(200).json({
    count: getActivityLogs().length,
    logs: getActivityLogs(),
  });
});

// 4. POST /api/system/event-logs/clear
router.post("/event-logs/clear", (req, res) => {
  clearActivityLogs();
  res.status(200).json({
    message: "Event activity logs cleared",
  });
});

// 5. POST /api/system/seed (Allows one-click sample seeding for screenshots & grading)
router.post("/seed", async (req, res, next) => {
  try {
    const { exec } = require("child_process");
    exec("node seed.js", { cwd: __dirname + "/.." }, (err, stdout) => {
      if (err) {
        return res.status(500).json({ error: "Seeding failed", details: err.message });
      }
      res.status(200).json({
        message: "Sample data seeded successfully into MongoDB!",
        output: stdout,
      });
    });
  } catch (error) {
    next(error);
  }
});

// 5. GET /api/system/health
router.get("/health", (req, res) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"][
    mongoose.connection.readyState
  ] || "unknown";

  res.status(200).json({
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbState,
      name: mongoose.connection.name || "task_manager_db",
    },
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
