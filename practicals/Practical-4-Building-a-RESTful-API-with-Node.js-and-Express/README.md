# Practical 4: Building a RESTful API with Node.js and Express

## Objective

To design and implement a RESTful backend server with complete CRUD
endpoints using the Express middleware pipeline.

---

## Problem Statement

Build a Node.js and Express backend for a Task Management system using
an in-memory array.

The application should:

- Create tasks using `POST /tasks`
- Read tasks using `GET /tasks`
- Update tasks using `PUT /tasks/:id`
- Delete tasks using `DELETE /tasks/:id`
- Use logging middleware for every incoming request
- Use a global error handling middleware at the end of the pipeline
- Return correct HTTP status codes

---

## Technologies Used

- Node.js
- Express.js
- JavaScript
- npm
- Visual Studio Code
- Postman or Thunder Client

---

## Concepts Covered

- RESTful API Design
- Express Application Setup
- Routing
- CRUD Operations
- Middleware Pipeline
- Global Middleware
- Route-Specific Middleware
- Request Logging
- Error Handling Middleware
- HTTP Methods
- HTTP Status Codes
- JSON Responses

---

## New Features Added

### 1. Express Server Setup

A standalone backend project is created inside:

```text
task-manager-api/
```

The API server runs on port `5000`.

---

### 2. CRUD Endpoints

The following REST endpoints are implemented:

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

All task data is stored temporarily in an in-memory array.

---

### 3. Request Logging Middleware

A global logging middleware logs:

- HTTP method
- Request URL
- Timestamp

for every incoming request.

---

### 4. Content-Type Validation Middleware

A global middleware checks `POST` and `PUT` requests and rejects them if
the `Content-Type` is not `application/json`.

---

### 5. Route-Specific Task ID Validation

A route-specific middleware validates the task ID format before the
update and delete controllers are executed.

---

### 6. Global Error Handling Middleware

A global error handler is added as the last middleware in the pipeline
to return a safe JSON error response instead of exposing raw stack
traces.

---

### 7. 404 Route Handler

A structured JSON response is returned for undefined routes.

---

## Project Structure

```text
task-manager-api/
|
+-- node_modules/
+-- package.json
+-- package-lock.json
+-- server.js
```

---

## API Routes

### 1. Get All Tasks

```text
GET /tasks
```

Returns all tasks with status code `200`.

---

### 2. Create Task

```text
POST /tasks
```

Creates a new task and returns status code `201`.

---

### 3. Update Task

```text
PUT /tasks/:id
```

Updates an existing task and returns status code `200`.

Returns `404` if the task is not found.

---

### 4. Delete Task

```text
DELETE /tasks/:id
```

Deletes a task and returns status code `200`.

Returns `404` if the task is not found.

---

## Middleware Pipeline

```text
Client Request
|
v
express.json()
|
v
Logging Middleware
|
v
Content-Type Validation Middleware
|
v
Express Routes
|
v
404 Handler
|
v
Global Error Handler
```

---

## Output

The backend now:

- Handles all CRUD operations for tasks
- Logs every request with method, URL, and timestamp
- Validates JSON request headers for write operations
- Validates task ID format before route handlers run
- Returns structured JSON responses
- Returns proper status codes such as `200`, `201`, `404`, and `500`

---

## Learning Outcome

Students will be able to design and implement a complete RESTful API
using Node.js and Express, including custom middleware, centralized
error handling, route validation, and correct HTTP responses.
