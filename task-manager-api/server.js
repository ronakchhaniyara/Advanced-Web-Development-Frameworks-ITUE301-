const express = require("express");

const app = express();
const PORT = 5000;

let nextTaskId = 3;
const tasks = [
  { id: 1, title: "Complete React practical", completed: true },
  { id: 2, title: "Build Express CRUD API", completed: false },
];

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

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

const validateTaskId = (req, res, next) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({
      error: "Task ID must be a positive integer",
    });
  }

  req.taskId = taskId;
  next();
};

app.use(requireJsonContentType);

app.get("/tasks", (req, res) => {
  res.status(200).json({
    message: "Tasks fetched successfully",
    data: tasks,
  });
});

app.post("/tasks", (req, res, next) => {
  try {
    const { title, completed = false } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        error: "Task title is required and must be a string",
      });
    }

    const newTask = {
      id: nextTaskId++,
      title: title.trim(),
      completed: Boolean(completed),
    };

    tasks.push(newTask);

    res.status(201).json({
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/tasks/:id", validateTaskId, (req, res, next) => {
  try {
    const { title, completed } = req.body;
    const taskIndex = tasks.findIndex((task) => task.id === req.taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    if (title !== undefined && typeof title !== "string") {
      return res.status(400).json({
        error: "Task title must be a string",
      });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return res.status(400).json({
        error: "Completed must be a boolean value",
      });
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(completed !== undefined ? { completed } : {}),
    };

    res.status(200).json({
      message: "Task updated successfully",
      data: tasks[taskIndex],
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/tasks/:id", validateTaskId, (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex((task) => task.id === req.taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.status(200).json({
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
