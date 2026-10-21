const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const { optionalAuth } = require("../middleware/auth");
const { validateTask } = require("../middleware/validation");
const {
  getCache,
  setCache,
  invalidateTaskCache,
} = require("../utils/cache");
const taskEvents = require("../events/taskEvents");

const router = express.Router();

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

// 1. GET /tasks - Fetch all tasks with In-Memory Caching (Practical 9)
router.get("/", async (req, res, next) => {
  try {
    const cacheKey = "all_tasks";
    const { data: cachedTasks, cached } = getCache(cacheKey);

    if (cached && cachedTasks) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json({
        message: "Tasks fetched from cache",
        source: "cache",
        count: cachedTasks.length,
        data: cachedTasks,
      });
    }

    const tasks = await Task.find().sort({ createdAt: -1 });

    // Store in node-cache with 60 second TTL
    setCache(cacheKey, tasks, 60);

    res.setHeader("X-Cache", "MISS");
    res.status(200).json({
      message: "Tasks fetched from database",
      source: "database",
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /tasks/:id - Fetch single task with individual caching (Practical 9 Supplementary)
router.get("/:id", validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `task_${id}`;
    const { data: cachedTask, cached } = getCache(cacheKey);

    if (cached && cachedTask) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json({
        message: "Task fetched from cache",
        source: "cache",
        data: cachedTask,
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    setCache(cacheKey, task, 60);

    res.setHeader("X-Cache", "MISS");
    res.status(200).json({
      message: "Task fetched from database",
      source: "database",
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /tasks - Create task with validation, cache invalidation, and async event (Practical 6, 7, 9, 10)
router.post("/", optionalAuth, validateTask, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const newTask = await Task.create({
      title,
      description,
      completed,
      priority,
      user: req.user ? req.user.id : null,
    });

    // Invalidate in-memory cache on write operation (Practical 9)
    invalidateTaskCache();

    const responseTimestamp = new Date().toISOString();
    console.log(`[API] Response 201 sent for "${newTask.title}" at ${responseTimestamp}`);

    // Respond immediately before background processing completes
    res.status(201).json({
      message: "Task created successfully",
      data: newTask,
    });

    // Emit event asynchronously via Node.js EventEmitter (Practical 10)
    taskEvents.emit("task-created", newTask, responseTimestamp);
  } catch (error) {
    next(error);
  }
});

// 4. PUT /tasks/:id - Update task with cache invalidation and async event
router.put("/:id", optionalAuth, validateObjectId, async (req, res, next) => {
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

    // Invalidate both collection and single item caches (Practical 9)
    invalidateTaskCache(req.params.id);

    const responseTimestamp = new Date().toISOString();

    res.status(200).json({
      message: "Task updated successfully",
      data: updatedTask,
    });

    // Emit event asynchronously
    taskEvents.emit("task-updated", updatedTask, responseTimestamp);
  } catch (error) {
    next(error);
  }
});

// 5. DELETE /tasks/:id - Delete task with cache invalidation and async event
router.delete("/:id", optionalAuth, validateObjectId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Invalidate cache (Practical 9)
    invalidateTaskCache(req.params.id);

    const responseTimestamp = new Date().toISOString();

    res.status(200).json({
      message: "Task deleted successfully",
      data: deletedTask,
    });

    // Emit event asynchronously
    taskEvents.emit("task-deleted", deletedTask, responseTimestamp);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
