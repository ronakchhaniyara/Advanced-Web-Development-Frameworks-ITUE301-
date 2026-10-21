const EventEmitter = require("events");

class TaskEventEmitter extends EventEmitter {}

const taskEvents = new TaskEventEmitter();

// Register generic error listener to avoid unhandled error crash
taskEvents.on("error", (err) => {
  console.error("[TaskEventEmitter] Unhandled event error:", err.message);
});

module.exports = taskEvents;
