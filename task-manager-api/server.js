const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_manager_db";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// Built-in body parser middleware
app.use(express.json());

// Global logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Content-Type validation middleware for write operations
const requireJsonContentType = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    if (!req.is("application/json")) {
      return res.status(400).json({
        error: "Content-Type must be application/json",
      });
    }
  }
  next();
};

app.use(requireJsonContentType);

// Validate MongoDB ObjectId middleware
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "Invalid task ID format",
    });
  }
  next();
};

// 1. GET /tasks - Fetch all tasks from MongoDB
app.get("/tasks", async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Tasks fetched successfully",
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /tasks/:id - Fetch a single task by ID (Supplementary Problem 3)
app.get("/tasks/:id", validateObjectId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /tasks - Create a new task in MongoDB
app.post("/tasks", async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const newTask = await Task.create({
      title,
      description,
      completed,
      priority,
    });

    res.status(201).json({
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
});

// 4. PUT /tasks/:id - Update an existing task in MongoDB
app.put("/tasks/:id", validateObjectId, async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
});

// 5. DELETE /tasks/:id - Delete a task from MongoDB
app.delete("/tasks/:id", validateObjectId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    next(error);
  }
});

// 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Centralized Error Handling Middleware (Structured JSON for validation errors)
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
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
