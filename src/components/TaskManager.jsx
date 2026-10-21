import { useState, useEffect, useCallback } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  generateAiDescription,
  seedSampleData,
} from "../services/api";
import { showToast } from "../services/toast";
import Spinner from "./Spinner";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "../context/useAuth";

export default function TaskManager() {
  const { user, isAuthenticated } = useAuth();

  // Task state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheSource, setCacheSource] = useState(null);
  const [fetchDuration, setFetchDuration] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  // AI assistant state (Practical 13)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  // Editing state
  const [editingTask, setEditingTask] = useState(null);

  // Deletion confirmation modal state (Practical 6 Supplementary)
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Fetch tasks from backend
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const response = await getTasks();
      const endTime = performance.now();
      setFetchDuration(Math.round(endTime - startTime));
      setCacheSource(response.cacheHeader || response.data?.source || "database");
      setTasks(response.data?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks();
  }, [loadTasks]);

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await seedSampleData();
      showToast("Seeded 12 rich sample tasks into MongoDB!", "success");
      await loadTasks();
    } catch {
      showToast("Failed to seed sample data", "error");
      setLoading(false);
    }
  };

  // AI Assistant trigger (Practical 13)
  const handleAiSuggest = async () => {
    if (!title.trim()) {
      showToast("Please enter a task title first to get AI suggestions", "warning");
      return;
    }

    setAiLoading(true);
    setAiNotice(null);

    try {
      const res = await generateAiDescription(title);
      const { description: aiDesc, suggestedPriority, disclaimer, model } = res.data;

      if (aiDesc) {
        setDescription(aiDesc);
      }
      if (suggestedPriority && ["low", "medium", "high"].includes(suggestedPriority.toLowerCase())) {
        setPriority(suggestedPriority.toLowerCase());
      }

      setAiNotice({
        disclaimer: disclaimer || "AI suggestions should be reviewed before saving.",
        model: model || "Heuristic AI Engine",
      });

      showToast(`AI generated description using ${model || "AI"}!`, "success");
    } catch (err) {
      showToast(err.message || "AI service temporarily unavailable.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // Create or Update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Task title is required", "warning");
      return;
    }

    setSubmitting(true);

    try {
      if (editingTask) {
        // Optimistic UI update
        const updatedList = tasks.map((t) =>
          t._id === editingTask._id
            ? { ...t, title, description, priority }
            : t
        );
        setTasks(updatedList);

        const res = await updateTask(editingTask._id, {
          title: title.trim(),
          description: description.trim(),
          priority,
        });

        // Sync with server result
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? res.data.data : t))
        );

        showToast("Task updated successfully!", "success");
        setEditingTask(null);
      } else {
        const res = await createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          completed: false,
        });

        // Add new task to state
        setTasks((prev) => [res.data.data, ...prev]);
        showToast("Task created and saved to MongoDB!", "success");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAiNotice(null);
    } catch (err) {
      showToast(err.message || "Failed to save task", "error");
      loadTasks(); // rollback on failure
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle completion
  const handleToggleComplete = async (task) => {
    const newStatus = !task.completed;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: newStatus } : t))
    );

    try {
      await updateTask(task._id, { completed: newStatus });
      showToast(
        `Task marked as ${newStatus ? "completed" : "pending"}!`,
        "info"
      );
    } catch {
      showToast("Failed to update status", "error");
      loadTasks();
    }
  };

  // Start editing
  const handleStartEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority || "medium");
    setAiNotice(null);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAiNotice(null);
  };

  // Confirm delete dialog (Practical 6 Supplementary)
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    const targetId = taskToDelete._id;
    setTaskToDelete(null);

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t._id !== targetId));

    try {
      await deleteTask(targetId);
      showToast("Task deleted successfully", "success");
    } catch {
      showToast("Failed to delete task", "error");
      loadTasks();
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
        ? task.completed
        : !task.completed;

    const matchesPriority =
      priorityFilter === "all" ? true : task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityCount = tasks.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;

  return (
    <section className="task-manager-container">
      {/* Header Banner */}
      <div className="task-header-card content-card">
        <div className="task-header-title-row">
          <div>
            <div className="badge-row">
              <span className="pill-badge pill-blue">Practical 6: Full Stack MERN</span>
              <span className="pill-badge pill-purple">Practical 13: AI Integration</span>
              <span className="pill-badge pill-green">Practical 9: Cached</span>
            </div>
            <h1 className="main-title">Full-Stack Task Management System</h1>
            <p className="subtitle">
              Connected live to Node/Express REST API & MongoDB Database with
              real-time caching, asynchronous background event processing, and AI automation.
            </p>
          </div>

          <div className="server-telemetry">
            <span className={`telemetry-dot ${cacheSource === "HIT" ? "dot-hit" : "dot-miss"}`} />
            <div className="telemetry-text">
              <span className="telemetry-source">
                Source: <strong>{cacheSource === "HIT" ? "Memory Cache (HIT)" : "MongoDB (MISS)"}</strong>
              </span>
              <span className="telemetry-duration">{fetchDuration !== null ? `${fetchDuration}ms latency` : ""}</span>
            </div>
            <button
              type="button"
              className="refresh-btn"
              onClick={loadTasks}
              title="Re-fetch from backend"
              aria-label="Refresh tasks"
            >
              ↻ Refresh
            </button>
            <button
              type="button"
              className="refresh-btn seed-btn"
              onClick={handleSeedData}
              title="Reset and populate 12 sample tasks for grading and screenshots"
              aria-label="Seed sample data"
            >
              🌱 Seed Data
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="task-stats-bar">
          <div className="stat-box">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-val">{totalCount}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Pending</span>
            <span className="stat-val pending">{pendingCount}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Completed</span>
            <span className="stat-val completed">{completedCount}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">High Priority</span>
            <span className="stat-val priority-high">{highPriorityCount}</span>
          </div>
        </div>
      </div>

      {/* Task Creation & Edit Form */}
      <div className="task-form-card content-card">
        <div className="form-header-row">
          <h2>{editingTask ? "✏️ Edit Task" : "➕ Create New Task"}</h2>
          {isAuthenticated && user && (
            <span className="user-author-tag">
              Creating as: <strong>{user.name}</strong>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <div className="label-with-ai">
              <label htmlFor="task-title" className="form-label">
                Task Title <span className="required-star">*</span>
              </label>
              <button
                type="button"
                className={`ai-btn ${aiLoading ? "ai-pulsing" : ""}`}
                onClick={handleAiSuggest}
                disabled={aiLoading || !title.trim()}
                title="Use AI to auto-generate a description and suggest priority"
              >
                {aiLoading ? (
                  <>
                    <span className="spinner-mini" /> Generating...
                  </>
                ) : (
                  <>✨ AI Assist (Generate Description)</>
                )}
              </button>
            </div>
            <input
              id="task-title"
              type="text"
              className="styled-input"
              placeholder="e.g., Integrate JWT authentication in Express API..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description" className="form-label">
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              className="styled-textarea"
              placeholder="Detailed deliverables, notes, or implementation steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* AI Notice & Disclaimer (Practical 13 Requirement) */}
          {aiNotice && (
            <div className="ai-disclaimer-box">
              <span className="ai-icon">🤖</span>
              <div className="ai-disclaimer-content">
                <strong>{aiNotice.model}:</strong> {aiNotice.disclaimer}
              </div>
            </div>
          )}

          <div className="form-row-actions">
            <div className="priority-select-wrap">
              <label htmlFor="task-priority" className="form-label">
                Priority:
              </label>
              <select
                id="task-priority"
                className={`priority-select priority-badge-${priority}`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>

            <div className="button-group">
              {editingTask && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !title.trim()}
              >
                {submitting ? (
                  "Saving..."
                ) : editingTask ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="task-toolbar content-card">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">⏳ Pending Only</option>
            <option value="completed">✓ Completed Only</option>
          </select>

          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-display-section">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadTasks} />
        ) : filteredTasks.length === 0 ? (
          <div className="empty-tasks-card content-card">
            <span className="empty-emoji">📋</span>
            <h3>No tasks found</h3>
            <p>
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "No tasks match your active filter criteria."
                : "You don't have any tasks yet. Create your first task above!"}
            </p>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-item-card ${
                  task.completed ? "task-completed" : ""
                } priority-border-${task.priority}`}
              >
                <div className="task-item-header">
                  <div className="task-title-checkbox-wrap">
                    <input
                      type="checkbox"
                      id={`check-${task._id}`}
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      title="Toggle completion"
                    />
                    <label
                      htmlFor={`check-${task._id}`}
                      className="task-item-title"
                    >
                      {task.title}
                    </label>
                  </div>
                  <span className={`priority-tag priority-tag-${task.priority}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                {task.description && (
                  <p className="task-item-desc">{task.description}</p>
                )}

                <div className="task-item-footer">
                  <span className="task-item-date">
                    📅 {new Date(task.createdAt).toLocaleDateString()}
                  </span>

                  <div className="task-item-buttons">
                    <button
                      type="button"
                      className="action-icon-btn edit-icon-btn"
                      onClick={() => handleStartEdit(task)}
                      title="Edit task"
                      aria-label="Edit task"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete-icon-btn"
                      onClick={() => setTaskToDelete(task)}
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal (Practical 6 Supplementary Problem 2) */}
      {taskToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>⚠️ Confirm Task Deletion</h3>
            <p>
              Are you sure you want to permanently delete task:
              <br />
              <strong>"{taskToDelete.title}"</strong>?
            </p>
            <p className="modal-subtext">This action will remove it from MongoDB.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
