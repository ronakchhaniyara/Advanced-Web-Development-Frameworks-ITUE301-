# Practical 6: Full Stack Integration React + Node + MongoDB

**CO/PO Mapping:** CO1, CO2 / PO3, PO5

## Objective

To wire the React frontend to the Node/Express/MongoDB backend into a fully functional, production-ready full-stack application with synchronous and optimistic UI state management.

---

## Prerequisites

- **Practicals 1–3 completed:** Working React UI with client-side routing, state management, and API consumption patterns.
- **Practicals 4–5 completed:** Working Node/Express/MongoDB backend with Mongoose schema, validation, and RESTful CRUD endpoints.

---

## Architecture & Data Flow

```text
       +-------------------------------------------------------------+
       |               React Frontend (localhost:5173)               |
       |  - Centralized API Client (src/services/api.js)             |
       |  - TaskManager Component (src/components/TaskManager.jsx)   |
       |  - Toast Notification System (src/components/Toast.jsx)     |
       +-------------------------------------------------------------+
                                       |
                                       | fetch() HTTP Requests
                                       | (GET, POST, PUT, DELETE)
                                       v
       +-------------------------------------------------------------+
       |              Express Backend (localhost:5000)               |
       |  - cors() enabled for cross-origin local requests           |
       |  - Request logger middleware                                |
       |  - JSON Content-Type validation                             |
       |  - /tasks route controllers                                 |
       +-------------------------------------------------------------+
                                       |
                                       | Mongoose ODM Operations
                                       v
       +-------------------------------------------------------------+
       |                  MongoDB Database Engine                    |
       |  - tasks collection                                         |
       |  - Enforced schema validation: title, priority, completed   |
       +-------------------------------------------------------------+
```

---

## Implementation Details

### 1. Backend CORS Enablement (`server.js`)
To enable the React single-page application running on Vite's dev server (`http://localhost:5173`) to communicate with the Express API (`http://localhost:5000`), CORS was configured:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Cache"],
    exposedHeaders: ["X-Cache"],
  })
);
```

### 2. Centralized Frontend API Service (`src/services/api.js`)
All HTTP requests to the backend are managed in a single module with consistent JSON headers, error handling, and response unwrapping:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const getTasks = () => fetch(`${API_BASE_URL}/tasks`).then(handleResponse);
export const createTask = (data) => fetch(`${API_BASE_URL}/tasks`, {
  method: "POST",
  headers: getAuthHeaders(),
  body: JSON.stringify(data),
}).then(handleResponse);
export const updateTask = (id, data) => fetch(`${API_BASE_URL}/tasks/${id}`, {
  method: "PUT",
  headers: getAuthHeaders(),
  body: JSON.stringify(data),
}).then(handleResponse);
export const deleteTask = (id) => fetch(`${API_BASE_URL}/tasks/${id}`, {
  method: "DELETE",
  headers: getAuthHeaders(),
}).then(handleResponse);
```

### 3. Reactive UI Component (`src/components/TaskManager.jsx`)
- **Read:** Loads tasks from MongoDB upon component mount (`useEffect`), displaying loading spinners and error states.
- **Create:** Adds tasks via a responsive form with validation feedback and toast alerts.
- **Update:** Toggles completion status or edits title, description, and priority level with instant UI updates.
- **Delete:** Features a custom modal dialog prompting user confirmation before removing the document from MongoDB.
- **Persistence:** All data persists across server restarts and browser reloads.

---

## Verification & Testing

1. Start MongoDB service locally or via container on port `27017`.
2. Start backend server:
   ```bash
   cd task-manager-api
   npm start
   ```
3. Start frontend dev server:
   ```bash
   npm run dev
   ```
4. Perform CRUD operations from the UI:
   - Create a task -> verify appearance in UI and MongoDB.
   - Edit / Complete task -> verify status persists on page reload.
   - Delete task -> verify confirmation modal and permanent removal.
