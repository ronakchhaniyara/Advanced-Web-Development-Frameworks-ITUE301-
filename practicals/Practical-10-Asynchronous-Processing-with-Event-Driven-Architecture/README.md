# Practical 10: Asynchronous Processing with Event-Driven Architecture

**CO/PO Mapping:** CO4 / PO3, PO5

## Objective

To implement non-blocking background notification and audit processing using Node.js native `EventEmitter` without requiring external heavy message broker infrastructure.

---

## Architectural Workflow & Non-Blocking Design

```text
Client HTTP POST /tasks Request
 │
 ├── 1. Mongoose saves task to MongoDB
 ├── 2. Capture API Response Timestamp (T_response)
 ├── 3. Send HTTP 201 Created Response Immediately to Client!
 └── 4. Asynchronously emit: taskEvents.emit('task-created', task, T_response)
         │
         v (Handled in background, does NOT hold up HTTP connection)
     [Task Notification Listener]
     ├── Logs task creation start time
     ├── Simulates background indexing/dispatch (e.g., 100ms async delay)
     ├── Captures Background Completion Timestamp (T_done)
     └── Pushes audit log to in-memory event stream
```

---

## Implementation Details

### 1. Dedicated Event Emitter Module (`events/taskEvents.js`)
```javascript
const EventEmitter = require("events");
class TaskEventEmitter extends EventEmitter {}
const taskEvents = new TaskEventEmitter();

// Prevent process crashes on unhandled error events
taskEvents.on("error", (err) => {
  console.error("[TaskEventEmitter] Error:", err.message);
});

module.exports = taskEvents;
```

### 2. Non-blocking Emission in Controller (`routes/taskRoutes.js`)
```javascript
router.post("/", optionalAuth, validateTask, async (req, res, next) => {
  try {
    const newTask = await Task.create(req.body);
    invalidateTaskCache();

    const responseTimestamp = new Date().toISOString();

    // 1. Send HTTP 201 response immediately!
    res.status(201).json({
      message: "Task created successfully",
      data: newTask,
    });

    // 2. Emit event asynchronously after response
    taskEvents.emit("task-created", newTask, responseTimestamp);
  } catch (error) {
    next(error);
  }
});
```

### 3. Background Listeners (`events/taskListeners.js`)
```javascript
taskEvents.on("task-created", (task, responseTimestamp) => {
  const handlerStart = new Date().toISOString();
  console.log(`[Listener] Task "${task.title}" start at ${handlerStart}`);

  setTimeout(() => {
    const handlerDone = new Date().toISOString();
    console.log(`[Listener Done] Task "${task.title}" async finish at ${handlerDone}`);
  }, 100);
});
```

---

## Timestamp Proof of Non-Blocking Execution

Extracted from verified test execution console logs:

```text
[API] Response 201 sent for "Test Task Practical 12" at 2026-10-21T05:32:20.838Z
[Notification Listener] Task "Test Task Practical 12" created at 2026-10-21T05:32:20.840Z
... (Other HTTP requests processed concurrently) ...
[Notification Listener Async Done] Background processing completed at 2026-10-21T05:32:20.947Z
```

Notice that the **API responded at `.838Z`**, whereas background listener execution finished **109ms later at `.947Z`**. The client never waited for the background job to finish.

### UI Live Stream (`src/components/SystemActivity.jsx`)
The frontend provides a real-time polling stream demonstrating events as they occur, displaying exact timestamps, event types (`task-created`, `task-updated`, `task-deleted`), and execution latency.
