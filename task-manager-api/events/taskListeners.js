const taskEvents = require("./taskEvents");

// Circular in-memory activity log for real-time frontend observation
const activityLogs = [];
const MAX_LOGS = 50;

const logActivity = (entry) => {
  activityLogs.unshift({
    id: Date.now() + Math.random().toString(36).substring(2, 6),
    ...entry,
  });
  if (activityLogs.length > MAX_LOGS) {
    activityLogs.pop();
  }
};

// 1. Task Created Listener (Practical 10 primary requirement)
taskEvents.on("task-created", (task, responseTimestamp) => {
  const handlerStart = new Date().toISOString();
  console.log(
    `[Notification Listener] Task "${task.title}" (ID: ${task._id}) created at ${handlerStart}`
  );

  // Simulate background non-blocking task notification / audit indexing
  setTimeout(() => {
    const handlerFinished = new Date().toISOString();
    console.log(
      `[Notification Listener Async Done] Background processing for "${task.title}" completed at ${handlerFinished}`
    );

    logActivity({
      event: "task-created",
      title: task.title,
      priority: task.priority || "medium",
      taskId: task._id,
      responseSentAt: responseTimestamp,
      listenerExecutedAt: handlerStart,
      asyncCompletedAt: handlerFinished,
      message: `Task "${task.title}" background notification completed`,
    });
  }, 100);
});

// 2. Task Deleted Listener (Practical 10 Supplementary Problem 1)
taskEvents.on("task-deleted", (task, responseTimestamp) => {
  const handlerStart = new Date().toISOString();
  console.log(
    `[Notification Listener] Task "${task.title}" (ID: ${task._id}) deleted at ${handlerStart}`
  );

  setTimeout(() => {
    const handlerFinished = new Date().toISOString();
    logActivity({
      event: "task-deleted",
      title: task.title,
      taskId: task._id,
      responseSentAt: responseTimestamp,
      listenerExecutedAt: handlerStart,
      asyncCompletedAt: handlerFinished,
      message: `Task "${task.title}" cleanup notification completed`,
    });
  }, 50);
});

// 3. Task Updated Listener
taskEvents.on("task-updated", (task, responseTimestamp) => {
  const handlerStart = new Date().toISOString();
  console.log(
    `[Notification Listener] Task "${task.title}" updated at ${handlerStart}`
  );

  logActivity({
    event: "task-updated",
    title: task.title,
    completed: task.completed,
    priority: task.priority,
    taskId: task._id,
    responseSentAt: responseTimestamp,
    listenerExecutedAt: handlerStart,
    message: `Task "${task.title}" updated (Completed: ${task.completed})`,
  });
});

const getActivityLogs = () => activityLogs;
const clearActivityLogs = () => {
  activityLogs.length = 0;
};

module.exports = {
  getActivityLogs,
  clearActivityLogs,
};
