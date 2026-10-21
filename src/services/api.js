/**
 * Central API Client for Full-Stack Integration
 * Handles base URL, auth token headers, JSON serialization, and error handling.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("portfolio_auth_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Notify application about token expiration/unauthorized request
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (isJson && (data.error || data.message || (data.details && data.details.join(", ")))) ||
      `HTTP Error ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return {
    data,
    cacheHeader: response.headers.get("X-Cache") || "MISS",
  };
};

/* ==================== Task Management (Practical 6) ==================== */

export const getTasks = async () => {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getTaskById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createTask = async (taskData) => {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  return handleResponse(res);
};

export const updateTask = async (id, taskData) => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  return handleResponse(res);
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

/* ==================== Authentication (Practical 7) ==================== */

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const getCurrentUser = async () => {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

/* ==================== AI API Integration (Practical 13) ==================== */

export const generateAiDescription = async (title) => {
  const res = await fetch(`${API_BASE_URL}/api/ai/generate-description`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });
  return handleResponse(res);
};

/* ==================== System & Event Monitoring (Practical 9 & 10) ==================== */

export const getCacheStats = async () => {
  const res = await fetch(`${API_BASE_URL}/api/system/cache-stats`);
  return handleResponse(res);
};

export const clearCache = async () => {
  const res = await fetch(`${API_BASE_URL}/api/system/cache-clear`, {
    method: "POST",
  });
  return handleResponse(res);
};

export const getEventLogs = async () => {
  const res = await fetch(`${API_BASE_URL}/api/system/event-logs`);
  return handleResponse(res);
};

export const clearEventLogs = async () => {
  const res = await fetch(`${API_BASE_URL}/api/system/event-logs/clear`, {
    method: "POST",
  });
  return handleResponse(res);
};

export const seedSampleData = async () => {
  const res = await fetch(`${API_BASE_URL}/api/system/seed`, {
    method: "POST",
  });
  return handleResponse(res);
};

export const getSystemHealth = async () => {
  const res = await fetch(`${API_BASE_URL}/api/system/health`);
  return handleResponse(res);
};
